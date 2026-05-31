/**
 * Parse a pasted PostgreSQL connection blob in many formats into structured
 * fields, so the UI/CLI can auto-fill a database form.
 *
 * Supported formats, by detection precedence:
 *   1. JSON object
 *   2. JDBC URL (jdbc:postgresql:...)
 *   3. URL (postgres:// or postgresql://)
 *   4. libpq keyword/value (host=... port=... ...)
 *   5. Colon / YAML-ish key: value lines
 *   6. Loose / bare tokens
 *
 * Never throws on malformed input — returns a best-effort result with warnings.
 */

export interface ParsedConnection {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  sslmode?: string;
  warnings: string[];
}

/** Trim a string; return undefined for empty/whitespace-only. */
function clean(v: unknown): string | undefined {
  if (typeof v !== 'string') {
    if (v === undefined || v === null) return undefined;
    v = String(v);
  }
  const s = (v as string).trim();
  return s.length ? s : undefined;
}

/** Strip a single layer of surrounding matching quotes. */
function stripQuotes(v: string): string {
  if (v.length >= 2) {
    const first = v[0];
    const last = v[v.length - 1];
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      return v.slice(1, -1);
    }
  }
  return v;
}

/** Normalize a sslmode-ish value; boolean true / "true" -> "require". */
function normalizeSsl(v: unknown): string | undefined {
  if (v === true) return 'require';
  if (v === false) return undefined;
  const s = clean(v);
  if (!s) return undefined;
  if (/^true$/i.test(s)) return 'require';
  if (/^false$/i.test(s)) return undefined;
  return s;
}

/**
 * Apply trim/validation to a draft result and append the standard warnings.
 * Mutates and returns the same object.
 */
function finalize(c: ParsedConnection): ParsedConnection {
  c.host = clean(c.host);
  // strip IPv6 brackets if any survived
  if (c.host && c.host.startsWith('[') && c.host.endsWith(']')) {
    c.host = c.host.slice(1, -1);
  }
  c.user = clean(c.user);
  c.password = clean(c.password);
  c.database = clean(c.database);
  c.sslmode = clean(c.sslmode);

  if (c.port !== undefined) {
    const p = c.port;
    if (!Number.isInteger(p) || p < 1 || p > 65535) {
      c.port = undefined;
      c.warnings.push('ignored invalid port');
    }
  }

  if (!c.database) {
    c.warnings.push("no database detected — you'll need to choose one");
  }
  if (!c.host) {
    c.warnings.push('no host detected');
  }
  return c;
}

function empty(): ParsedConnection {
  return { warnings: [] };
}

// ---------------------------------------------------------------------------
// Format 1: JSON
// ---------------------------------------------------------------------------

const JSON_KEY_MAP: Record<string, keyof ParsedConnection> = {
  host: 'host',
  hostname: 'host',
  server: 'host',
  address: 'host',
  addr: 'host',
  port: 'port',
  user: 'user',
  username: 'user',
  uid: 'user',
  password: 'password',
  pass: 'password',
  pwd: 'password',
  database: 'database',
  dbname: 'database',
  db: 'database',
  sslmode: 'sslmode',
  ssl: 'sslmode',
};

function parseJson(input: string): ParsedConnection | null {
  let obj: unknown;
  try {
    obj = JSON.parse(input);
  } catch {
    return null; // fall through to other branches
  }
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return null;
  }
  const c = empty();
  for (const [rawKey, rawVal] of Object.entries(obj as Record<string, unknown>)) {
    const target = JSON_KEY_MAP[rawKey.toLowerCase()];
    if (!target) continue; // ignore unknown keys
    if (target === 'port') {
      const n = Number(rawVal);
      c.port = Number.isNaN(n) ? undefined : n;
    } else if (target === 'sslmode') {
      c.sslmode = normalizeSsl(rawVal);
    } else {
      (c as unknown as Record<string, unknown>)[target] = clean(rawVal);
    }
  }
  return c;
}

// ---------------------------------------------------------------------------
// Format 3: URL (also used by JDBC after stripping the jdbc: prefix)
// ---------------------------------------------------------------------------

/**
 * Parse a postgres URL into a draft. `preferUserinfo` controls credential
 * precedence between userinfo and query params (used by JDBC handling).
 */
function parseUrl(urlStr: string, isJdbc: boolean): ParsedConnection | null {
  let url: URL;
  try {
    url = new URL(urlStr);
  } catch {
    return null;
  }
  const c = empty();

  const userinfoUser = url.username ? decodeURIComponent(url.username) : undefined;
  const userinfoPass = url.password ? decodeURIComponent(url.password) : undefined;

  let host = url.hostname || undefined;
  if (host && host.startsWith('[') && host.endsWith(']')) {
    host = host.slice(1, -1);
  }
  c.host = host;

  if (url.port) {
    const n = Number(url.port);
    c.port = Number.isNaN(n) ? undefined : n;
  }

  const path = url.pathname.replace(/^\//, '');
  c.database = path ? decodeURIComponent(path) : undefined;

  const sp = url.searchParams;
  const queryUser = clean(sp.get('user') ?? undefined);
  const queryPass = clean(sp.get('password') ?? undefined);

  // Credential precedence:
  //  - prefer userinfo when present; otherwise read from query params.
  c.user = clean(userinfoUser) ?? queryUser;
  c.password = clean(userinfoPass) ?? queryPass;

  // sslmode: explicit sslmode param wins; else ssl=true -> require.
  const sslmodeParam = clean(sp.get('sslmode') ?? undefined);
  if (sslmodeParam) {
    c.sslmode = sslmodeParam;
  } else {
    const sslParam = sp.get('ssl');
    if (sslParam !== null) {
      c.sslmode = normalizeSsl(sslParam);
    }
  }

  // isJdbc currently does not change URL semantics beyond the above
  // (credentials-from-query is already general), but keep the flag for clarity.
  void isJdbc;

  return c;
}

// ---------------------------------------------------------------------------
// Format 2: JDBC
// ---------------------------------------------------------------------------

function parseJdbc(input: string): ParsedConnection {
  // Strip the leading "jdbc:" prefix.
  const rest = input.replace(/^jdbc:/i, '');

  if (/^postgresql:\/\//i.test(rest)) {
    const parsed = parseUrl(rest, true);
    if (parsed) return parsed;
  }

  // No-host form: jdbc:postgresql:dbname  (and possibly ?params)
  // After stripping jdbc:, we have "postgresql:dbname?..."
  const m = rest.match(/^postgresql:([^?/][^?]*)?(\?.*)?$/i);
  if (m) {
    const c = empty();
    const dbPart = m[1];
    if (dbPart) c.database = clean(dbPart);
    const queryStr = m[2];
    if (queryStr) {
      const sp = new URLSearchParams(queryStr.slice(1));
      c.user = clean(sp.get('user') ?? undefined);
      c.password = clean(sp.get('password') ?? undefined);
      const sslmodeParam = clean(sp.get('sslmode') ?? undefined);
      if (sslmodeParam) {
        c.sslmode = sslmodeParam;
      } else if (sp.get('ssl') !== null) {
        c.sslmode = normalizeSsl(sp.get('ssl'));
      }
    }
    return c;
  }

  // Fallback: couldn't make sense of it.
  return empty();
}

// ---------------------------------------------------------------------------
// Format 4: libpq keyword/value
// ---------------------------------------------------------------------------

const LIBPQ_KEYS = new Set([
  'host',
  'hostname',
  'port',
  'dbname',
  'database',
  'db',
  'user',
  'password',
  'sslmode',
]);

/**
 * Tokenize libpq-style "key=value" pairs. Values may be single-quoted, in
 * which case they may contain spaces, with `\'` and `\\` escapes.
 * Returns a list of [key, value] pairs.
 */
function tokenizeLibpq(input: string): Array<[string, string]> {
  const pairs: Array<[string, string]> = [];
  let i = 0;
  const n = input.length;
  while (i < n) {
    // skip whitespace
    while (i < n && /\s/.test(input[i])) i++;
    if (i >= n) break;

    // read key
    let key = '';
    while (i < n && input[i] !== '=' && !/\s/.test(input[i])) {
      key += input[i++];
    }
    // skip whitespace before '='
    while (i < n && /\s/.test(input[i])) i++;
    if (i >= n || input[i] !== '=') {
      // not a key=value token; abandon this token
      continue;
    }
    i++; // consume '='
    // skip whitespace after '='
    while (i < n && /\s/.test(input[i])) i++;

    // read value
    let value = '';
    if (i < n && input[i] === "'") {
      i++; // consume opening quote
      while (i < n) {
        const ch = input[i];
        if (ch === '\\' && i + 1 < n) {
          value += input[i + 1];
          i += 2;
          continue;
        }
        if (ch === "'") {
          i++; // consume closing quote
          break;
        }
        value += ch;
        i++;
      }
    } else if (i < n && input[i] === '"') {
      i++; // consume opening double quote
      while (i < n) {
        const ch = input[i];
        if (ch === '\\' && i + 1 < n) {
          value += input[i + 1];
          i += 2;
          continue;
        }
        if (ch === '"') {
          i++; // consume closing quote
          break;
        }
        value += ch;
        i++;
      }
    } else {
      while (i < n && !/\s/.test(input[i])) {
        value += input[i++];
      }
    }
    pairs.push([key, value]);
  }
  return pairs;
}

/** Detect whether the input looks like libpq keyword/value form. */
function looksLikeLibpq(input: string): boolean {
  const pairs = tokenizeLibpq(input);
  return pairs.some(([k]) => LIBPQ_KEYS.has(k.toLowerCase()));
}

function parseLibpq(input: string): ParsedConnection {
  const c = empty();
  for (const [rawKey, rawVal] of tokenizeLibpq(input)) {
    const key = rawKey.toLowerCase();
    if (!LIBPQ_KEYS.has(key)) continue;
    switch (key) {
      case 'host':
      case 'hostname':
        c.host = clean(rawVal);
        break;
      case 'port': {
        const nval = Number(rawVal);
        c.port = Number.isNaN(nval) ? undefined : nval;
        break;
      }
      case 'dbname':
      case 'database':
      case 'db':
        c.database = clean(rawVal);
        break;
      case 'user':
        c.user = clean(rawVal);
        break;
      case 'password':
        c.password = clean(rawVal);
        break;
      case 'sslmode':
        c.sslmode = clean(rawVal);
        break;
    }
  }
  return c;
}

// ---------------------------------------------------------------------------
// Format 5: Colon / YAML-ish key: value lines
// ---------------------------------------------------------------------------

const KV_KEY_MAP: Record<string, keyof ParsedConnection> = {
  host: 'host',
  hostname: 'host',
  server: 'host',
  address: 'host',
  port: 'port',
  user: 'user',
  username: 'user',
  uid: 'user',
  password: 'password',
  pass: 'password',
  pwd: 'password',
  database: 'database',
  dbname: 'database',
  db: 'database',
  sslmode: 'sslmode',
  ssl: 'sslmode',
};

/** Detect "key: value" / "key = value" lines using the known vocabulary. */
function looksLikeColonKv(input: string): boolean {
  const lines = input.split(/\r?\n/);
  let hits = 0;
  for (const line of lines) {
    const m = line.match(/^\s*([A-Za-z_]+)\s*[:=]\s*(.*)$/);
    if (m && KV_KEY_MAP[m[1].toLowerCase()]) hits++;
  }
  return hits > 0;
}

function parseColonKv(input: string): ParsedConnection {
  const c = empty();
  const lines = input.split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^\s*([A-Za-z_]+)\s*[:=]\s*(.*)$/);
    if (!m) continue;
    const target = KV_KEY_MAP[m[1].toLowerCase()];
    if (!target) continue;
    const rawVal = stripQuotes(m[2].trim());
    if (target === 'port') {
      const nval = Number(rawVal);
      c.port = Number.isNaN(nval) ? undefined : nval;
    } else if (target === 'sslmode') {
      c.sslmode = normalizeSsl(rawVal);
    } else {
      (c as unknown as Record<string, unknown>)[target] = clean(rawVal);
    }
  }
  return c;
}

// ---------------------------------------------------------------------------
// Format 6: Loose / bare tokens
// ---------------------------------------------------------------------------

const IPV4_RE = /^\d{1,3}(\.\d{1,3}){3}$/;

function isHostLike(tok: string): boolean {
  if (IPV4_RE.test(tok)) return true;
  if (tok.startsWith('[') && tok.endsWith(']')) return true; // bracketed IPv6
  if (tok === 'localhost') return true;
  if (/[A-Za-z]/.test(tok) && tok.includes('.')) return true; // hostname-ish
  return false;
}

function parseLoose(input: string): ParsedConnection {
  const c = empty();
  const tokens = input.split(/[\s,\t]+/).filter((t) => t.length > 0);
  if (tokens.length === 0) return c;

  // host = first host-like token
  let hostIdx = -1;
  for (let i = 0; i < tokens.length; i++) {
    if (isHostLike(tokens[i])) {
      hostIdx = i;
      break;
    }
  }
  if (hostIdx >= 0) {
    c.host = tokens[hostIdx];
  }

  // port = first numeric token (1..65535) not chosen as host
  let portIdx = -1;
  for (let i = 0; i < tokens.length; i++) {
    if (i === hostIdx) continue;
    if (/^\d{1,5}$/.test(tokens[i])) {
      const nval = Number(tokens[i]);
      if (nval >= 1 && nval <= 65535) {
        portIdx = i;
        c.port = nval;
        break;
      }
    }
  }

  // remaining tokens (host & port removed), in order -> [user, password, database]
  const remaining: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    if (i === hostIdx || i === portIdx) continue;
    remaining.push(tokens[i]);
  }
  const positional: Array<keyof ParsedConnection> = ['user', 'password', 'database'];
  for (let i = 0; i < positional.length && i < remaining.length; i++) {
    (c as unknown as Record<string, unknown>)[positional[i]] = clean(remaining[i]);
  }

  return c;
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export function parseConnectionInput(input: string): ParsedConnection {
  const trimmed = (input ?? '').trim();

  if (!trimmed) {
    const c = empty();
    c.warnings.push('empty input');
    return c;
  }

  // 1. JSON
  if (trimmed.startsWith('{')) {
    const c = parseJson(trimmed);
    if (c) return finalize(c);
    // malformed JSON: fall through to kv / loose branches
  }

  // 2. JDBC
  if (/^jdbc:postgresql:/i.test(trimmed)) {
    return finalize(parseJdbc(trimmed));
  }

  // 3. URL
  if (/^postgres(ql)?:\/\//i.test(trimmed)) {
    const c = parseUrl(trimmed, false);
    if (c) return finalize(c);
    // fall through if URL parsing failed
  }

  // 4. libpq keyword/value
  if (looksLikeLibpq(trimmed)) {
    return finalize(parseLibpq(trimmed));
  }

  // 5. Colon / YAML-ish key: value lines
  if (looksLikeColonKv(trimmed)) {
    return finalize(parseColonKv(trimmed));
  }

  // 6. Loose / bare tokens
  return finalize(parseLoose(trimmed));
}
