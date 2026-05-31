// HTTP integration tests for the local UI server.
//
// Set HOME to a fresh temp dir BEFORE importing the server module (it depends
// transitively on the config module, which computes its directory from
// os.homedir() at module load). We never send a password in any request, so
// the macOS Keychain is never written and nothing prompts.

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';

let tmpHome;
let server; // { url, token, close }
let base; // http://127.0.0.1:<port>
let port;
let token;

before(async () => {
  tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'psqlcli-'));
  process.env.HOME = tmpHome;
  const { startUiServer } = await import('../dist/ui/server.js');
  server = await startUiServer({});
  token = server.token;
  const u = new URL(server.url);
  port = u.port;
  base = `http://127.0.0.1:${port}`;
});

after(() => {
  if (server) server.close();
  fs.rmSync(tmpHome, { recursive: true, force: true });
});

// fetch sends a correct Host header for the bound 127.0.0.1:<port>, so it
// passes the DNS-rebinding guard. We add the token via header.
function api(method, p, { body, withToken = true, headers = {} } = {}) {
  const h = { ...headers };
  if (withToken) h['x-psql-cli-token'] = token;
  if (body !== undefined) h['content-type'] = 'application/json';
  return fetch(`${base}${p}`, {
    method,
    headers: h,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

describe('static assets (no token)', () => {
  it('GET / returns HTML containing psql-cli', async () => {
    const res = await fetch(`${base}/`);
    assert.equal(res.status, 200);
    const text = await res.text();
    assert.ok(text.includes('psql-cli'));
  });
  it('GET /styles.css 200', async () => {
    const res = await fetch(`${base}/styles.css`);
    assert.equal(res.status, 200);
  });
  it('GET /app.js 200', async () => {
    const res = await fetch(`${base}/app.js`);
    assert.equal(res.status, 200);
  });
});

describe('SPA fallback (deep links, no token)', () => {
  it('GET /db/anything returns 200 + SPA HTML', async () => {
    const res = await fetch(`${base}/db/anything`);
    assert.equal(res.status, 200);
    assert.ok(res.headers.get('content-type').includes('text/html'));
    const text = await res.text();
    assert.ok(text.includes('psql-cli'));
  });
  it('GET /some/other/path returns 200 + SPA HTML', async () => {
    const res = await fetch(`${base}/some/other/path`);
    assert.equal(res.status, 200);
    const text = await res.text();
    assert.ok(text.includes('psql-cli'));
  });
  it('GET /api/state without token is still 403 (not the SPA)', async () => {
    const res = await api('GET', '/api/state', { withToken: false });
    assert.equal(res.status, 403);
  });
});

describe('token guard on /api', () => {
  it('no token -> 403', async () => {
    const res = await api('GET', '/api/state', { withToken: false });
    assert.equal(res.status, 403);
  });
  it('wrong token -> 403', async () => {
    const res = await api('GET', '/api/state', {
      withToken: false,
      headers: { 'x-psql-cli-token': 'nope' },
    });
    assert.equal(res.status, 403);
  });
  it('correct token -> 200 with empty projects/databases', async () => {
    const res = await api('GET', '/api/state');
    assert.equal(res.status, 200);
    const state = await res.json();
    assert.deepEqual(state.projects, {});
    assert.deepEqual(state.databases, {});
  });
});

describe('project + database CRUD (no password ever sent)', () => {
  it('creates a project', async () => {
    const res = await api('POST', '/api/project', { body: { slug: 'app', name: 'App' } });
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ok: true });
  });

  it('creates a database with NO password field', async () => {
    const res = await api('POST', '/api/database', {
      body: {
        slug: 'app-db',
        host: 'h',
        port: 5432,
        user: 'u',
        database: 'd',
        project: 'app',
        readOnly: true,
      },
    });
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ok: true });
  });

  it('state exposes hasPassword:false and never leaks a password key', async () => {
    const res = await api('GET', '/api/state');
    const state = await res.json();
    assert.ok(state.databases['app-db']);
    assert.equal(state.databases['app-db'].hasPassword, false);
    // The serialized state must contain NO "password" key anywhere.
    assert.ok(!JSON.stringify(state).includes('"password"'));
  });

  it('rejects a database referencing an unknown project', async () => {
    const res = await api('POST', '/api/database', {
      body: {
        slug: 'orphan-db',
        host: 'h',
        port: 5432,
        user: 'u',
        database: 'd',
        project: 'does-not-exist',
        readOnly: true,
      },
    });
    assert.notEqual(res.status, 200);
    const body = await res.json();
    assert.equal(typeof body.error, 'string');
  });

  it('rejects an invalid slug', async () => {
    const res = await api('POST', '/api/database', {
      body: {
        slug: 'BadSlug',
        host: 'h',
        port: 5432,
        user: 'u',
        database: 'd',
        readOnly: true,
      },
    });
    assert.notEqual(res.status, 200);
    const body = await res.json();
    assert.equal(typeof body.error, 'string');
  });

  it('cannot delete a project that still has a database', async () => {
    const res = await api('DELETE', '/api/project/app');
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(typeof body.error, 'string');
  });

  it('deletes the database then the project succeeds', async () => {
    const d = await api('DELETE', '/api/database/app-db');
    assert.equal(d.status, 200);
    const p = await api('DELETE', '/api/project/app');
    assert.equal(p.status, 200);
    assert.deepEqual(await p.json(), { ok: true });
  });
});

describe('default database', () => {
  it('POST /api/default with missing slug -> error', async () => {
    const res = await api('POST', '/api/default', { body: { slug: 'missing' } });
    assert.notEqual(res.status, 200);
    const body = await res.json();
    assert.equal(typeof body.error, 'string');
  });

  it('POST /api/default with a real slug -> ok and reflected in state', async () => {
    // Create a fresh db (no password) to set as default.
    const c = await api('POST', '/api/database', {
      body: { slug: 'def-db', host: 'h', port: 5432, user: 'u', database: 'd', readOnly: true },
    });
    assert.equal(c.status, 200);
    const res = await api('POST', '/api/default', { body: { slug: 'def-db' } });
    assert.equal(res.status, 200);
    const state = await (await api('GET', '/api/state')).json();
    assert.equal(state.defaultDatabase, 'def-db');
  });
});

describe('reorder databases', () => {
  it('creates two databases, reorders, and order is reflected in state', async () => {
    // Two fresh databases with no order yet (alphabetical: r-one before r-two).
    const a = await api('POST', '/api/database', {
      body: { slug: 'r-one', host: 'h', port: 5432, user: 'u', database: 'd', readOnly: true },
    });
    assert.equal(a.status, 200);
    const b = await api('POST', '/api/database', {
      body: { slug: 'r-two', host: 'h', port: 5432, user: 'u', database: 'd', readOnly: true },
    });
    assert.equal(b.status, 200);

    // Move r-two up -> it should now sort before r-one.
    const mv = await api('POST', '/api/reorder', {
      body: { kind: 'database', slug: 'r-two', dir: 'up' },
    });
    assert.equal(mv.status, 200);
    assert.deepEqual(await mv.json(), { ok: true });

    const state = await (await api('GET', '/api/state')).json();
    // order is preserved in /api/state.
    assert.equal(typeof state.databases['r-one'].order, 'number');
    assert.equal(typeof state.databases['r-two'].order, 'number');
    assert.ok(state.databases['r-two'].order < state.databases['r-one'].order);
  });

  it('moving the top item up is a no-op (still ok)', async () => {
    const mv = await api('POST', '/api/reorder', {
      body: { kind: 'database', slug: 'r-two', dir: 'up' },
    });
    assert.equal(mv.status, 200);
    assert.deepEqual(await mv.json(), { ok: true });
  });

  it('reorder with an unknown slug -> 404', async () => {
    const res = await api('POST', '/api/reorder', {
      body: { kind: 'database', slug: 'nope', dir: 'up' },
    });
    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(typeof body.error, 'string');
  });

  it('reorder with a bad kind -> error', async () => {
    const res = await api('POST', '/api/reorder', {
      body: { kind: 'bogus', slug: 'r-one', dir: 'up' },
    });
    assert.notEqual(res.status, 200);
  });
});

describe('DNS-rebinding Host header guard', () => {
  // fetch cannot override the Host header, so use node:http with an explicit one.
  function rawRequest(hostHeader) {
    return new Promise((resolve, reject) => {
      const req = http.request(
        {
          host: '127.0.0.1',
          port: Number(port),
          path: '/api/state',
          method: 'GET',
          headers: { Host: hostHeader, 'x-psql-cli-token': token },
        },
        (res) => {
          res.resume();
          res.on('end', () => resolve(res.statusCode));
        },
      );
      req.on('error', reject);
      req.end();
    });
  }

  it('Host: evil.com -> 403', async () => {
    assert.equal(await rawRequest('evil.com'), 403);
  });
  it('Host: 127.0.0.1:<port> -> 200', async () => {
    assert.equal(await rawRequest(`127.0.0.1:${port}`), 200);
  });
});
