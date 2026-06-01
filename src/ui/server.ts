import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import {
  loadConfig,
  saveConfig,
  validateSlug,
  compareByOrder,
  type Config,
  type DatabaseEntry,
  type ProjectEntry,
} from '../config.js';
import { setPassword, deletePassword, hasPassword, getPassword } from '../keychain.js';
import { encryptBundle, decryptBundle, suggestPassphrase } from '../exportbundle.js';
import { applyImport } from '../commands/transfer.js';
import { testConnection, listServerDatabases, runQuery } from '../db.js';
import { parseConnectionInput } from '../connparse.js';
import { parseCsv } from '../csv.js';
import {
  buildBrowseSql,
  buildCountSql,
  quoteIdent,
  sqlLiteral as sqlLit,
  type BrowseFilter,
  type BrowseSpec,
} from '../browsesql.js';
import { INDEX_HTML, STYLES_CSS, APP_JS } from './assets.js';

const MAX_BODY = 1024 * 1024; // 1MB
const MAX_IMPORT_BODY = 5 * 1024 * 1024; // 5MB — encrypted bundles can be larger

/** A DatabaseEntry as exposed over the API: never includes a password, always a hasPassword flag. */
function publicEntry(d: DatabaseEntry): DatabaseEntry & { hasPassword: boolean } {
  return {
    slug: d.slug,
    project: d.project,
    host: d.host,
    port: d.port,
    user: d.user,
    database: d.database,
    readOnly: d.readOnly,
    description: d.description,
    sslmode: d.sslmode,
    order: d.order,
    hasPassword: hasPassword(d.slug),
  };
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

function sendText(res: ServerResponse, status: number, type: string, body: string): void {
  res.writeHead(status, {
    'Content-Type': type,
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function readBody(req: IncomingMessage, maxBody = MAX_BODY): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > maxBody) {
        reject(new Error('Request body too large.'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8').trim();
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('Invalid JSON body.'));
      }
    });
    req.on('error', reject);
  });
}

function asString(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

/**
 * Build a transient DatabaseEntry from an API body (for /api/database and the
 * full-body /api/test). Validates required fields but does NOT persist anything.
 */
function entryFromBody(body: Record<string, unknown>): DatabaseEntry {
  const slug = asString(body.slug) ?? '';
  const slugErr = validateSlug(slug);
  if (slugErr) throw new Error(slugErr);
  const host = asString(body.host)?.trim();
  const user = asString(body.user)?.trim();
  const database = asString(body.database)?.trim();
  if (!host || !user || !database) {
    throw new Error('host, user and database are required.');
  }
  return {
    slug,
    project: asString(body.project) || undefined,
    host,
    port: typeof body.port === 'number' ? body.port : Number(body.port) || 5432,
    user,
    database,
    readOnly: body.readOnly !== false,
    description: asString(body.description) || undefined,
    sslmode: asString(body.sslmode) || undefined,
  };
}

export function startUiServer(
  opts: { host?: string; port?: number } = {},
): Promise<{ url: string; token: string; close(): void }> {
  const host = opts.host ?? '127.0.0.1';
  const port = opts.port ?? 0;
  const token = randomBytes(24).toString('hex');

  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      handle(req, res, token).catch((err) => {
        const message = err instanceof Error ? err.message : String(err);
        sendJson(res, 500, { error: message });
      });
    });

    server.on('error', reject);

    server.listen(port, host, () => {
      const addr = server.address();
      const actualPort = typeof addr === 'object' && addr ? addr.port : port;
      const url = `http://127.0.0.1:${actualPort}/?token=${token}`;
      // Stash the bound port so the Host-header guard can validate it.
      boundPort = actualPort;
      resolve({
        url,
        token,
        close: () => server.close(),
      });
    });
  });
}

// The actual listening port, used by the DNS-rebinding (Host header) guard.
let boundPort = 0;

function hostAllowed(req: IncomingMessage): boolean {
  const hostHeader = req.headers.host;
  if (!hostHeader) return false;
  return hostHeader === `127.0.0.1:${boundPort}` || hostHeader === `localhost:${boundPort}`;
}

/** Constant-time comparison of the request token against the session token. */
function tokenMatches(provided: string | string[] | undefined, expected: string): boolean {
  if (typeof provided !== 'string') return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  // timingSafeEqual requires equal length; the length check itself is not secret.
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

async function handle(req: IncomingMessage, res: ServerResponse, token: string): Promise<void> {
  const url = new URL(req.url ?? '/', `http://127.0.0.1:${boundPort}`);
  const path = url.pathname;
  const method = req.method ?? 'GET';

  // Static assets (no token required so the page can load).
  if (method === 'GET' && path === '/') {
    return sendText(res, 200, 'text/html; charset=utf-8', INDEX_HTML);
  }
  if (method === 'GET' && path === '/styles.css') {
    return sendText(res, 200, 'text/css; charset=utf-8', STYLES_CSS);
  }
  if (method === 'GET' && path === '/app.js') {
    return sendText(res, 200, 'application/javascript; charset=utf-8', APP_JS);
  }

  // SPA fallback: any non-/api GET that isn't a known static asset returns the
  // embedded INDEX_HTML (no token required) so History-API deep links such as
  // /db/<slug> can load the SPA shell. Nothing is read from disk.
  if (method === 'GET' && !path.startsWith('/api/')) {
    return sendText(res, 200, 'text/html; charset=utf-8', INDEX_HTML);
  }

  if (!path.startsWith('/api/')) {
    return sendJson(res, 404, { error: 'not found' });
  }

  // ---- API guards ----
  if (!hostAllowed(req)) {
    return sendJson(res, 403, { error: 'forbidden' });
  }
  if (!tokenMatches(req.headers['x-psql-cli-token'], token)) {
    return sendJson(res, 403, { error: 'forbidden' });
  }

  try {
    await route(req, res, method, path);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    sendJson(res, 400, { error: message });
  }
}

async function route(
  req: IncomingMessage,
  res: ServerResponse,
  method: string,
  path: string,
): Promise<void> {
  // GET /api/state
  if (method === 'GET' && path === '/api/state') {
    const config = loadConfig();
    const databases: Record<string, DatabaseEntry & { hasPassword: boolean }> = {};
    for (const slug of Object.keys(config.databases)) {
      databases[slug] = publicEntry(config.databases[slug]);
    }
    return sendJson(res, 200, {
      projects: config.projects,
      databases,
      defaultDatabase: config.defaultDatabase ?? null,
    });
  }

  // POST /api/database
  if (method === 'POST' && path === '/api/database') {
    const body = (await readBody(req)) as Record<string, unknown>;
    const entry = entryFromBody(body);
    const config = loadConfig();
    if (entry.project && !config.projects[entry.project]) {
      throw new Error(`Unknown project "${entry.project}".`);
    }
    config.databases[entry.slug] = entry;
    if (!config.defaultDatabase) config.defaultDatabase = entry.slug;
    saveConfig(config);
    const password = asString(body.password);
    if (password) setPassword(entry.slug, password);
    return sendJson(res, 200, { ok: true });
  }

  // DELETE /api/database/:slug
  if (method === 'DELETE' && path.startsWith('/api/database/')) {
    const slug = decodeURIComponent(path.slice('/api/database/'.length));
    const config = loadConfig();
    if (!config.databases[slug]) throw new Error(`Unknown database "${slug}".`);
    delete config.databases[slug];
    if (config.defaultDatabase === slug) config.defaultDatabase = undefined;
    saveConfig(config);
    deletePassword(slug);
    return sendJson(res, 200, { ok: true });
  }

  // POST /api/default
  if (method === 'POST' && path === '/api/default') {
    const body = (await readBody(req)) as Record<string, unknown>;
    const slug = asString(body.slug);
    if (!slug) throw new Error('Missing slug.');
    const config = loadConfig();
    if (!config.databases[slug]) throw new Error(`Unknown database "${slug}".`);
    config.defaultDatabase = slug;
    saveConfig(config);
    return sendJson(res, 200, { ok: true });
  }

  // POST /api/project
  if (method === 'POST' && path === '/api/project') {
    const body = (await readBody(req)) as Record<string, unknown>;
    const slug = asString(body.slug) ?? '';
    const slugErr = validateSlug(slug);
    if (slugErr) throw new Error(slugErr);
    const name = asString(body.name)?.trim();
    if (!name) throw new Error('Project name is required.');
    const config = loadConfig();
    const entry: ProjectEntry = {
      slug,
      name,
      description: asString(body.description) || undefined,
    };
    config.projects[slug] = entry;
    saveConfig(config);
    return sendJson(res, 200, { ok: true });
  }

  // DELETE /api/project/:slug
  if (method === 'DELETE' && path.startsWith('/api/project/')) {
    const slug = decodeURIComponent(path.slice('/api/project/'.length));
    const config = loadConfig();
    if (!config.projects[slug]) throw new Error(`Unknown project "${slug}".`);
    const attached = Object.values(config.databases).filter((d) => d.project === slug);
    if (attached.length > 0) {
      throw new Error(
        `Project "${slug}" still has ${attached.length} database(s). Reassign or remove them first.`,
      );
    }
    delete config.projects[slug];
    saveConfig(config);
    return sendJson(res, 200, { ok: true });
  }

  // POST /api/reorder — move a database or project up/down within its kind.
  if (method === 'POST' && path === '/api/reorder') {
    const body = (await readBody(req)) as Record<string, unknown>;
    const kind = asString(body.kind);
    const slug = asString(body.slug);
    const dir = asString(body.dir);
    if (kind !== 'database' && kind !== 'project') {
      throw new Error('kind must be "database" or "project".');
    }
    if (!slug) throw new Error('Missing slug.');
    if (dir !== 'up' && dir !== 'down') {
      throw new Error('dir must be "up" or "down".');
    }
    const config = loadConfig();
    const collection: Record<string, DatabaseEntry | ProjectEntry> =
      kind === 'database' ? config.databases : config.projects;
    if (!collection[slug]) {
      return sendJson(res, 404, { error: `Unknown ${kind} "${slug}".` });
    }
    // Canonical order, then normalize: if any item lacks `order`, assign each
    // item order = its index so swaps are well-defined.
    const items = Object.values(collection).sort(compareByOrder);
    if (items.some((it) => it.order === undefined)) {
      items.forEach((it, i) => {
        it.order = i;
      });
    }
    const idx = items.findIndex((it) => it.slug === slug);
    const neighbor = dir === 'up' ? idx - 1 : idx + 1;
    if (neighbor < 0 || neighbor >= items.length) {
      saveConfig(config);
      return sendJson(res, 200, { ok: true });
    }
    const a = items[idx];
    const b = items[neighbor];
    const tmp = a.order;
    a.order = b.order;
    b.order = tmp;
    saveConfig(config);
    return sendJson(res, 200, { ok: true });
  }

  // POST /api/order — bulk set order from drag-and-drop reorder. Body:
  // { databases?: string[], projects?: string[] }. For each array, the slug at
  // index i (if it exists in config) gets .order = i. Unknown slugs ignored.
  if (method === 'POST' && path === '/api/order') {
    const body = (await readBody(req)) as Record<string, unknown>;
    const config = loadConfig();
    const apply = (
      slugs: unknown,
      collection: Record<string, { order?: number }>,
    ): void => {
      if (!Array.isArray(slugs)) return;
      slugs.forEach((slug, i) => {
        if (typeof slug === 'string' && collection[slug]) {
          collection[slug].order = i;
        }
      });
    };
    apply(body.databases, config.databases);
    apply(body.projects, config.projects);
    saveConfig(config);
    return sendJson(res, 200, { ok: true });
  }

  // POST /api/parse — parse a pasted connection blob into structured fields.
  // Nothing is persisted; any password the user pasted is echoed back into
  // their own form only.
  if (method === 'POST' && path === '/api/parse') {
    const body = (await readBody(req)) as Record<string, unknown>;
    const input = asString(body.input) ?? '';
    return sendJson(res, 200, parseConnectionInput(input));
  }

  // POST /api/list-databases — connect to a server and list its databases.
  // Nothing is persisted and the password is never stored.
  if (method === 'POST' && path === '/api/list-databases') {
    const body = (await readBody(req)) as Record<string, unknown>;
    const host = asString(body.host)?.trim();
    const user = asString(body.user)?.trim();
    if (!host || !user) {
      throw new Error('host and user are required.');
    }
    const password = asString(body.password) ?? '';
    const result = listServerDatabases(
      {
        host,
        port: typeof body.port === 'number' ? body.port : Number(body.port) || 5432,
        user,
        sslmode: asString(body.sslmode) || undefined,
        database: asString(body.database) || undefined,
      },
      password,
    );
    return sendJson(res, 200, result);
  }

  // POST /api/test
  if (method === 'POST' && path === '/api/test') {
    const body = (await readBody(req)) as Record<string, unknown>;
    const slug = asString(body.slug);
    // Case 1: { slug } only -> test the stored entry as-is (password from Keychain).
    const onlySlug = slug && body.host === undefined;
    if (onlySlug) {
      const config = loadConfig();
      const stored = config.databases[slug];
      if (!stored) throw new Error(`Unknown database "${slug}".`);
      const result = testConnection(stored);
      return sendJson(res, 200, result);
    }
    // Case 2: full body -> build a temp entry, do not persist anything.
    const entry = entryFromBody(body);
    const password = asString(body.password);
    if (password) {
      // Use the supplied password for this test only, without writing to Keychain.
      const result = testWithTransientPassword(entry, password);
      return sendJson(res, 200, result);
    }
    // No password supplied: fall back to the stored Keychain password for this slug.
    const result = testConnection(entry);
    return sendJson(res, 200, result);
  }

  // POST /api/export — build the full payload (config + Keychain passwords) and
  // return it AS AN ENCRYPTED bundle. The bundle is safe to return over
  // localhost; raw passwords are never exposed outside the encrypted blob.
  if (method === 'POST' && path === '/api/export') {
    const body = (await readBody(req)) as Record<string, unknown>;
    const explicit = asString(body.passphrase);
    const generate = body.generate === true;
    if (!explicit && !generate) {
      return sendJson(res, 400, { error: 'passphrase required' });
    }
    const passphrase = explicit || suggestPassphrase();
    const config = loadConfig();
    const passwords: Record<string, string> = {};
    for (const slug of Object.keys(config.databases)) {
      const pw = getPassword(slug);
      if (pw !== undefined && pw !== '') passwords[slug] = pw;
    }
    const bundle = encryptBundle(
      { projects: config.projects, databases: config.databases, passwords },
      passphrase,
    );
    return sendJson(res, 200, {
      ok: true,
      filename: 'psql-cli-export.json',
      bundle,
      ...(explicit ? {} : { passphrase }),
    });
  }

  // POST /api/import — decrypt a bundle and apply it (merge or replace), storing
  // passwords in the Keychain. Allows a larger body for sizable bundles.
  if (method === 'POST' && path === '/api/import') {
    const body = (await readBody(req, MAX_IMPORT_BODY)) as Record<string, unknown>;
    const bundle = asString(body.bundle);
    const passphrase = asString(body.passphrase);
    if (!bundle) return sendJson(res, 400, { ok: false, error: 'bundle required' });
    if (!passphrase) return sendJson(res, 400, { ok: false, error: 'passphrase required' });
    let payload: { projects: unknown; databases: unknown; passwords: Record<string, string> };
    try {
      payload = decryptBundle(bundle, passphrase);
    } catch (err) {
      return sendJson(res, 400, {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
    // Apply via the shared CLI helper so import semantics can't drift.
    const imported = applyImport(payload, { replace: body.replace === true, dryRun: false });
    return sendJson(res, 200, { ok: true, imported });
  }

  // ---- Data-browser endpoints: /api/db/:slug/... ----
  if (path.startsWith('/api/db/')) {
    if (await routeBrowse(req, res, method, path)) return;
  }

  sendJson(res, 404, { error: 'not found' });
}

/** Single-quote-escape a value for embedding in a SQL string literal. */
function sqlLiteral(value: string): string {
  return "'" + value.replace(/'/g, "''") + "'";
}

/**
 * Resolve the DatabaseEntry referenced by `/api/db/:slug/...`. Returns the
 * entry plus the trailing sub-path (e.g. "tables", "columns", "browse"). If the
 * slug is unknown, writes a 404 JSON response and returns undefined.
 */
function resolveDbRoute(
  res: ServerResponse,
  path: string,
): { db: DatabaseEntry; sub: string } | undefined {
  const rest = path.slice('/api/db/'.length);
  const slash = rest.indexOf('/');
  const slug = decodeURIComponent(slash === -1 ? rest : rest.slice(0, slash));
  const sub = slash === -1 ? '' : rest.slice(slash + 1);
  const config = loadConfig();
  const db = config.databases[slug];
  if (!db) {
    sendJson(res, 404, { ok: false, error: `Unknown database "${slug}".` });
    return undefined;
  }
  return { db, sub };
}

/**
 * Data-browser routes. Returns true if the request was handled (response
 * written), false if no route matched. All queries go through runQuery so the
 * database's read-only enforcement is preserved for free.
 */
async function routeBrowse(
  req: IncomingMessage,
  res: ServerResponse,
  method: string,
  path: string,
): Promise<boolean> {
  // GET /api/db/:slug/tables
  if (method === 'GET' && path.endsWith('/tables')) {
    const r = resolveDbRoute(res, path);
    if (!r || r.sub !== 'tables') {
      if (r) sendJson(res, 404, { ok: false, error: 'not found' });
      return true;
    }
    const sql =
      "SELECT table_schema AS schema, table_name AS name, " +
      "CASE table_type WHEN 'BASE TABLE' THEN 'table' WHEN 'VIEW' THEN 'view' " +
      "ELSE lower(table_type) END AS type FROM information_schema.tables " +
      "WHERE table_schema NOT IN ('pg_catalog','information_schema') " +
      'ORDER BY table_schema, table_name';
    const result = runQuery(r.db, sql, { format: 'csv' });
    if (!result.ok) {
      sendJson(res, 200, { ok: false, error: result.stderr });
      return true;
    }
    const { rows } = parseCsv(result.stdout);
    sendJson(res, 200, {
      ok: true,
      tables: rows.map((row) => ({ schema: row[0], name: row[1], type: row[2] })),
    });
    return true;
  }

  // GET /api/db/:slug/columns?schema=<>&table=<>
  if (method === 'GET' && path.endsWith('/columns')) {
    const r = resolveDbRoute(res, path);
    if (!r || r.sub !== 'columns') {
      if (r) sendJson(res, 404, { ok: false, error: 'not found' });
      return true;
    }
    const url = new URL(req.url ?? '/', `http://127.0.0.1:${boundPort}`);
    const schema = url.searchParams.get('schema') ?? '';
    const table = url.searchParams.get('table') ?? '';
    const sql =
      'SELECT column_name AS name, data_type AS type, is_nullable AS nullable, ' +
      'column_default AS "default" FROM information_schema.columns ' +
      `WHERE table_schema = ${sqlLiteral(schema)} AND table_name = ${sqlLiteral(table)} ` +
      'ORDER BY ordinal_position';
    const result = runQuery(r.db, sql, { format: 'csv' });
    if (!result.ok) {
      sendJson(res, 200, { ok: false, error: result.stderr });
      return true;
    }
    const { rows } = parseCsv(result.stdout);
    sendJson(res, 200, {
      ok: true,
      columns: rows.map((row) => ({
        name: row[0],
        type: row[1],
        nullable: row[2],
        default: row[3],
      })),
    });
    return true;
  }

  // POST /api/db/:slug/browse
  if (method === 'POST' && path.endsWith('/browse')) {
    const r = resolveDbRoute(res, path);
    if (!r || r.sub !== 'browse') {
      if (r) sendJson(res, 404, { ok: false, error: 'not found' });
      return true;
    }
    const body = (await readBody(req)) as Record<string, unknown>;
    const spec = {
      schema: asString(body.schema) ?? '',
      table: asString(body.table) ?? '',
      filters: Array.isArray(body.filters) ? (body.filters as BrowseFilter[]) : undefined,
      orderBy: (body.orderBy as BrowseSpec['orderBy']) ?? undefined,
      limit: typeof body.limit === 'number' ? body.limit : undefined,
      offset: typeof body.offset === 'number' ? body.offset : undefined,
    };
    let browseSql: string;
    let countSql: string;
    try {
      browseSql = buildBrowseSql(spec);
      countSql = buildCountSql({ schema: spec.schema, table: spec.table, filters: spec.filters });
    } catch (err) {
      sendJson(res, 400, {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      });
      return true;
    }
    const countRes = runQuery(r.db, countSql, { format: 'csv' });
    if (!countRes.ok) {
      sendJson(res, 200, { ok: false, error: countRes.stderr });
      return true;
    }
    const rowsRes = runQuery(r.db, browseSql, { format: 'csv' });
    if (!rowsRes.ok) {
      sendJson(res, 200, { ok: false, error: rowsRes.stderr });
      return true;
    }
    const countParsed = parseCsv(countRes.stdout);
    const total = Number(countParsed.rows[0]?.[0] ?? 0) || 0;
    const { columns, rows } = parseCsv(rowsRes.stdout);
    const limit = clampLimit(spec.limit);
    const offset = normalizeOffset(spec.offset);
    sendJson(res, 200, {
      ok: true,
      columns,
      rows,
      total,
      limit,
      offset,
      readOnly: r.db.readOnly,
    });
    return true;
  }

  // POST /api/db/:slug/query
  if (method === 'POST' && path.endsWith('/query')) {
    const r = resolveDbRoute(res, path);
    if (!r || r.sub !== 'query') {
      if (r) sendJson(res, 404, { ok: false, error: 'not found' });
      return true;
    }
    const body = (await readBody(req)) as Record<string, unknown>;
    const sql = asString(body.sql) ?? '';
    const wantLimit = typeof body.limit === 'number' ? body.limit : undefined;

    // Pagination only applies when a positive limit is requested AND the SQL is
    // a single plain SELECT/WITH statement. Otherwise run verbatim.
    const paginate = wantLimit !== undefined && wantLimit > 0 && isPlainSelect(sql);

    if (paginate) {
      const limit = clampLimit(wantLimit);
      const offset = normalizeOffset(typeof body.offset === 'number' ? body.offset : 0);
      const inner = sql.trim().replace(/;\s*$/, '');
      const rowsSql = `SELECT * FROM ( ${inner} ) _q LIMIT ${limit} OFFSET ${offset}`;
      const result = runQuery(r.db, rowsSql, { format: 'csv' });
      if (result.blocked) {
        sendJson(res, 200, {
          ok: false,
          blocked: true,
          error: result.stderr,
          readOnly: r.db.readOnly,
        });
        return true;
      }
      if (!result.ok) {
        sendJson(res, 200, { ok: false, error: result.stderr, readOnly: r.db.readOnly });
        return true;
      }
      const { columns, rows } = parseCsv(result.stdout);
      // total is best-effort: omit it if the count query errors.
      let total: number | undefined;
      const countRes = runQuery(r.db, `SELECT count(*) AS count FROM ( ${inner} ) _q`, {
        format: 'csv',
      });
      if (countRes.ok) {
        total = Number(parseCsv(countRes.stdout).rows[0]?.[0] ?? 0) || 0;
      }
      sendJson(res, 200, {
        ok: true,
        columns,
        rows,
        rowCount: rows.length,
        ...(total !== undefined ? { total } : {}),
        limit,
        offset,
        readOnly: r.db.readOnly,
      });
      return true;
    }

    const result = runQuery(r.db, sql, { format: 'csv' });
    if (result.blocked) {
      sendJson(res, 200, {
        ok: false,
        blocked: true,
        error: result.stderr,
        readOnly: r.db.readOnly,
      });
      return true;
    }
    if (!result.ok) {
      sendJson(res, 200, { ok: false, error: result.stderr, readOnly: r.db.readOnly });
      return true;
    }
    const { columns, rows } = parseCsv(result.stdout);
    sendJson(res, 200, {
      ok: true,
      columns,
      rows,
      rowCount: rows.length,
      readOnly: r.db.readOnly,
    });
    return true;
  }

  // GET /api/db/:slug/pk?schema=<>&table=<>
  if (method === 'GET' && path.endsWith('/pk')) {
    const r = resolveDbRoute(res, path);
    if (!r || r.sub !== 'pk') {
      if (r) sendJson(res, 404, { ok: false, error: 'not found' });
      return true;
    }
    const url = new URL(req.url ?? '/', `http://127.0.0.1:${boundPort}`);
    const schema = url.searchParams.get('schema') ?? '';
    const table = url.searchParams.get('table') ?? '';
    // Build a regclass literal: '"schema"."table"' with internal double-quotes
    // doubled, then single-quote-escape the whole thing for the SQL literal.
    const regclass = `"${schema.replace(/"/g, '""')}"."${table.replace(/"/g, '""')}"`;
    const sql =
      'SELECT a.attname AS col FROM pg_index i ' +
      'JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey) ' +
      `WHERE i.indrelid = ${sqlLit(regclass)}::regclass AND i.indisprimary ` +
      'ORDER BY array_position(i.indkey, a.attnum)';
    const result = runQuery(r.db, sql, { format: 'csv' });
    if (!result.ok) {
      sendJson(res, 200, { ok: false, error: result.stderr });
      return true;
    }
    const { rows } = parseCsv(result.stdout);
    sendJson(res, 200, { ok: true, pk: rows.map((row) => row[0]) });
    return true;
  }

  // POST /api/db/:slug/apply — apply staged update/delete changes transactionally.
  if (method === 'POST' && path.endsWith('/apply')) {
    const r = resolveDbRoute(res, path);
    if (!r || r.sub !== 'apply') {
      if (r) sendJson(res, 404, { ok: false, error: 'not found' });
      return true;
    }
    if (r.db.readOnly !== false) {
      sendJson(res, 200, {
        ok: false,
        error: 'Database is read-only; mark it read-write to edit.',
      });
      return true;
    }
    const body = (await readBody(req)) as Record<string, unknown>;
    const changes = Array.isArray(body.changes) ? (body.changes as ApplyChange[]) : [];
    let sql: string;
    try {
      sql = buildApplySql(changes);
    } catch (err) {
      sendJson(res, 400, { ok: false, error: err instanceof Error ? err.message : String(err) });
      return true;
    }
    const res2 = runQuery(r.db, sql, { format: 'csv' });
    sendJson(res, 200, {
      ok: res2.ok,
      applied: changes.length,
      error: res2.ok ? undefined : res2.stderr,
    });
    return true;
  }

  return false;
}

/** True when `sql` is a single statement starting with SELECT or WITH. */
function isPlainSelect(sql: string): boolean {
  const trimmed = sql.trim();
  if (!/^(select|with)\b/i.test(trimmed)) return false;
  // A `;` followed by more non-whitespace means multiple statements.
  const semi = trimmed.indexOf(';');
  if (semi !== -1 && trimmed.slice(semi + 1).trim().length > 0) return false;
  return true;
}

type ApplyChange =
  | {
      type: 'update';
      schema: string;
      table: string;
      key: Record<string, string | null>;
      set: Record<string, string | null>;
    }
  | {
      type: 'delete';
      schema: string;
      table: string;
      key: Record<string, string | null>;
    };

/** Build a `WHERE k1 = v1 AND k2 IS NULL ...` clause from a key map. */
function buildKeyWhere(key: Record<string, string | null>): string {
  const cols = Object.keys(key);
  if (cols.length === 0) throw new Error('Each change must include a non-empty key.');
  return cols
    .map((col) => {
      const v = key[col];
      return v === null ? `${quoteIdent(col)} IS NULL` : `${quoteIdent(col)} = ${sqlLit(v)}`;
    })
    .join(' AND ');
}

/** Build a BEGIN/COMMIT-wrapped statement list for the staged changes. */
function buildApplySql(changes: ApplyChange[]): string {
  const stmts = changes.map((c) => {
    const ref = `${quoteIdent(c.schema)}.${quoteIdent(c.table)}`;
    if (c.type === 'update') {
      const where = buildKeyWhere(c.key);
      const setCols = Object.keys(c.set);
      const set = setCols
        .map((col) => `${quoteIdent(col)} = ${sqlLit(c.set[col])}`)
        .join(', ');
      return `UPDATE ${ref} SET ${set} WHERE ${where};`;
    }
    if (c.type === 'delete') {
      const where = buildKeyWhere(c.key);
      return `DELETE FROM ${ref} WHERE ${where};`;
    }
    throw new Error(`Unsupported change type.`);
  });
  return `BEGIN;\n${stmts.join('\n')}\nCOMMIT;`;
}

/** limit clamped to 1..500 (default 50); mirrors browsesql for the response echo. */
function clampLimit(limit?: number): number {
  if (typeof limit !== 'number' || !Number.isFinite(limit)) return 50;
  const n = Math.floor(limit);
  if (n < 1) return 1;
  if (n > 500) return 500;
  return n;
}

function normalizeOffset(offset?: number): number {
  if (typeof offset !== 'number' || !Number.isFinite(offset)) return 0;
  return Math.max(0, Math.floor(offset));
}

/**
 * testConnection() (via db.buildEnv) reads the password from the Keychain by
 * slug and only sets PGPASSWORD when a stored password exists. For a full-body
 * test with a supplied password that we must NOT persist, we temporarily set
 * PGPASSWORD on this process so the spawned psql inherits it (buildEnv spreads
 * process.env and leaves our value in place when there is no stored password),
 * then restore the previous value.
 */
function testWithTransientPassword(
  entry: DatabaseEntry,
  password: string,
): { ok: boolean; message: string } {
  const prev = process.env.PGPASSWORD;
  process.env.PGPASSWORD = password;
  try {
    return testConnection(entry);
  } finally {
    if (prev === undefined) delete process.env.PGPASSWORD;
    else process.env.PGPASSWORD = prev;
  }
}
