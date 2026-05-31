// HTTP tests for the /api/parse endpoint (and a defensive error-path check for
// /api/list-databases that does NOT touch a real database).
//
// Set HOME to a fresh temp dir BEFORE importing the server module (it depends
// transitively on the config module, which reads os.homedir() at load time).

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
  tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'psqlcli-parse-'));
  process.env.HOME = tmpHome;
  const { startUiServer } = await import('../dist/ui/server.js');
  server = await startUiServer({});
  token = server.token;
  const u = new URL(server.url);
  base = `http://127.0.0.1:${u.port}`;
});

after(() => {
  if (server) server.close();
  fs.rmSync(tmpHome, { recursive: true, force: true });
});

function api(method, p, { body, withToken = true } = {}) {
  const headers = {};
  if (withToken) headers['x-psql-cli-token'] = token;
  if (body !== undefined) headers['content-type'] = 'application/json';
  return fetch(`${base}${p}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

describe('POST /api/parse', () => {
  it('requires the token -> 403 without it', async () => {
    const res = await api('POST', '/api/parse', {
      withToken: false,
      body: { input: 'postgres://u:p@h:5432/db' },
    });
    assert.equal(res.status, 403);
  });

  it('parses a postgres:// URL into structured fields', async () => {
    const res = await api('POST', '/api/parse', {
      body: { input: 'postgres://u:p@h:5432/db' },
    });
    assert.equal(res.status, 200);
    const parsed = await res.json();
    assert.equal(parsed.host, 'h');
    assert.equal(parsed.port, 5432);
    assert.equal(parsed.user, 'u');
    assert.equal(parsed.password, 'p');
    assert.equal(parsed.database, 'db');
    assert.ok(Array.isArray(parsed.warnings));
  });

  it('parses a 4-line loose blob (host / port / user / password)', async () => {
    const res = await api('POST', '/api/parse', {
      body: { input: 'example.com\n5432\nalice\ns3cret' },
    });
    assert.equal(res.status, 200);
    const parsed = await res.json();
    assert.equal(parsed.host, 'example.com');
    assert.equal(parsed.port, 5432);
    assert.equal(parsed.user, 'alice');
    assert.equal(parsed.password, 's3cret');
  });
});

describe('POST /api/list-databases (error path only — no real DB)', () => {
  it('returns ok:false with an error for an unreachable host', async () => {
    // 127.0.0.1 on a closed high port refuses fast (no long connect timeout).
    const res = await api('POST', '/api/list-databases', {
      body: { host: '127.0.0.1', port: 59999, user: 'nobody', password: 'x' },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    // Either psql is missing or the connection fails — both are ok:false.
    assert.equal(data.ok, false);
    assert.equal(typeof data.error, 'string');
  });
});
