// HTTP integration tests for the encrypted export/import server endpoints.
//
// Set HOME to a fresh temp dir BEFORE importing the server module (config
// computes its directory from os.homedir() at module load). We create a project
// and a database with NO stored password, so the Keychain is never written and
// nothing prompts in the sandbox. We assert config/metadata round-trips, not
// password values.

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

let tmpHome;
let server; // { url, token, close }
let base;
let token;

before(async () => {
  tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'psqlcli-xfer-'));
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

describe('seed config (no password)', () => {
  it('creates a project', async () => {
    const res = await api('POST', '/api/project', { body: { slug: 'app', name: 'My App' } });
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
});

describe('POST /api/export', () => {
  it('requires a token (403)', async () => {
    const res = await api('POST', '/api/export', { withToken: false, body: { generate: true } });
    assert.equal(res.status, 403);
  });

  it('400 when neither passphrase nor generate provided', async () => {
    const res = await api('POST', '/api/export', { body: {} });
    assert.equal(res.status, 400);
    const b = await res.json();
    assert.equal(b.error, 'passphrase required');
  });

  it('generate:true returns ok, a bundle string, and a passphrase', async () => {
    const res = await api('POST', '/api/export', { body: { generate: true } });
    assert.equal(res.status, 200);
    const b = await res.json();
    assert.equal(b.ok, true);
    assert.equal(b.filename, 'psql-cli-export.json');
    assert.equal(typeof b.bundle, 'string');
    assert.ok(b.bundle.length > 0);
    assert.equal(typeof b.passphrase, 'string');
    assert.ok(b.passphrase.length > 0);
    // The encrypted bundle must not leak metadata in plaintext.
    assert.ok(!b.bundle.includes('app-db'));
  });

  it('with an explicit passphrase does NOT echo the passphrase back', async () => {
    const res = await api('POST', '/api/export', { body: { passphrase: 'hunter2hunter2' } });
    assert.equal(res.status, 200);
    const b = await res.json();
    assert.equal(b.ok, true);
    assert.equal(typeof b.bundle, 'string');
    assert.equal(b.passphrase, undefined);
  });
});

describe('POST /api/import', () => {
  let bundle;
  let passphrase;

  before(async () => {
    const res = await api('POST', '/api/export', { body: { generate: true } });
    const b = await res.json();
    bundle = b.bundle;
    passphrase = b.passphrase;
  });

  it('requires a token (403)', async () => {
    const res = await api('POST', '/api/import', {
      withToken: false,
      body: { bundle, passphrase },
    });
    assert.equal(res.status, 403);
  });

  it('round-trips: ok:true with imported >= 1, config metadata preserved', async () => {
    const res = await api('POST', '/api/import', { body: { bundle, passphrase } });
    assert.equal(res.status, 200);
    const b = await res.json();
    assert.equal(b.ok, true);
    assert.ok(b.imported >= 1);

    // Verify the imported database + project survived the round-trip.
    const state = await (await api('GET', '/api/state')).json();
    assert.ok(state.databases['app-db']);
    assert.equal(state.databases['app-db'].host, 'h');
    assert.equal(state.databases['app-db'].database, 'd');
    assert.equal(state.databases['app-db'].project, 'app');
    assert.ok(state.projects['app']);
    assert.equal(state.projects['app'].name, 'My App');
    // No password ever surfaces in state.
    assert.ok(!JSON.stringify(state).includes('"password"'));
  });

  it('wrong passphrase -> 400 ok:false', async () => {
    const res = await api('POST', '/api/import', {
      body: { bundle, passphrase: 'definitely-wrong' },
    });
    assert.equal(res.status, 400);
    const b = await res.json();
    assert.equal(b.ok, false);
    assert.equal(typeof b.error, 'string');
    assert.match(b.error, /passphrase|corrupted/i);
  });

  it('non-export text -> 400 ok:false', async () => {
    const res = await api('POST', '/api/import', {
      body: { bundle: '{"not":"a bundle"}', passphrase: 'x' },
    });
    assert.equal(res.status, 400);
    const b = await res.json();
    assert.equal(b.ok, false);
  });

  it('missing bundle -> 400', async () => {
    const res = await api('POST', '/api/import', { body: { passphrase } });
    assert.equal(res.status, 400);
    const b = await res.json();
    assert.equal(b.ok, false);
  });
});
