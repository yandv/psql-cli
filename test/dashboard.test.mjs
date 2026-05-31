// Offline integration tests for the data-browser endpoints.
//
// No real Postgres: we point a readOnly database at an unreachable host
// (127.0.0.1:1) with NO password. The read-only guard in runQuery blocks
// writes BEFORE any connection is attempted, so the "blocked" path is testable
// fully offline. SELECT statements attempt a connection and fail (ok:false but
// NOT blocked). We never assert successful row data (that needs a real DB).
//
// HOME is set to a fresh temp dir before importing the server module.

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

let tmpHome;
let server;
let base;
let token;

before(async () => {
  tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'psqlcli-dash-'));
  process.env.HOME = tmpHome;
  const { startUiServer } = await import('../dist/ui/server.js');
  server = await startUiServer({});
  token = server.token;
  base = `http://127.0.0.1:${new URL(server.url).port}`;

  // Create a read-only database with NO password pointing at an unreachable host.
  const res = await api('POST', '/api/database', {
    body: {
      slug: 'ro-db',
      host: '127.0.0.1',
      port: 1,
      user: 'u',
      database: 'd',
      readOnly: true,
    },
  });
  assert.equal(res.status, 200);
});

after(() => {
  if (server) server.close();
  fs.rmSync(tmpHome, { recursive: true, force: true });
});

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

describe('data-browser endpoints (offline)', () => {
  it('query DELETE on a read-only db is blocked before connecting', async () => {
    const res = await api('POST', '/api/db/ro-db/query', { body: { sql: 'DELETE FROM x' } });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.ok, false);
    assert.equal(json.blocked, true);
    assert.equal(json.readOnly, true);
  });

  it('query SELECT fails to connect but is NOT blocked', async () => {
    const res = await api('POST', '/api/db/ro-db/query', { body: { sql: 'SELECT 1' } });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.ok, false);
    assert.notEqual(json.blocked, true);
  });

  it('unknown slug -> 404 and ok:false', async () => {
    const res = await api('GET', '/api/db/unknown-slug/tables');
    assert.equal(res.status, 404);
    const json = await res.json();
    assert.equal(json.ok, false);
  });

  it('browse with a bad operator -> 400 ok:false (builder rejects before any query)', async () => {
    const res = await api('POST', '/api/db/ro-db/browse', {
      body: { schema: 's', table: 't', filters: [{ column: 'c', op: 'OR 1=1', value: 'x' }] },
    });
    assert.equal(res.status, 400);
    const json = await res.json();
    assert.equal(json.ok, false);
    assert.equal(typeof json.error, 'string');
  });

  it('endpoints require the token (403 without it)', async () => {
    const res = await api('POST', '/api/db/ro-db/query', {
      withToken: false,
      body: { sql: 'SELECT 1' },
    });
    assert.equal(res.status, 403);
  });
});
