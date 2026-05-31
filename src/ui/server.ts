import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { randomBytes } from 'node:crypto';
import {
  loadConfig,
  saveConfig,
  validateSlug,
  type DatabaseEntry,
  type ProjectEntry,
} from '../config.js';
import { setPassword, deletePassword, hasPassword } from '../keychain.js';
import { testConnection } from '../db.js';
import { INDEX_HTML, STYLES_CSS, APP_JS } from './assets.js';

const MAX_BODY = 1024 * 1024; // 1MB

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

function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY) {
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

  if (!path.startsWith('/api/')) {
    return sendJson(res, 404, { error: 'not found' });
  }

  // ---- API guards ----
  if (!hostAllowed(req)) {
    return sendJson(res, 403, { error: 'forbidden' });
  }
  if (req.headers['x-psql-cli-token'] !== token) {
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

  sendJson(res, 404, { error: 'not found' });
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
