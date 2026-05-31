// Tests that runQuery's read-only guard blocks writes WITHOUT connecting to a
// real Postgres. In db.ts, runQuery checks the guard and returns
// { ok:false, blocked:true } before spawning psql for a blocked statement —
// so this is safe to assert offline (psql is invoked only with --version for
// the availability probe; it never connects for a blocked query).
//
// We set HOME to a fresh temp dir before importing (db.ts -> keychain.ts), so
// reading hasPassword for a nonexistent slug is safe and never prompts.

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execSync } from 'node:child_process';

let tmpHome;
let db;
let psqlInstalled = true;

before(async () => {
  tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'psqlcli-'));
  process.env.HOME = tmpHome;
  db = await import('../dist/db.js');
  try {
    execSync('psql --version', { stdio: 'ignore' });
  } catch {
    psqlInstalled = false;
  }
});

after(() => {
  fs.rmSync(tmpHome, { recursive: true, force: true });
});

const roEntry = {
  slug: 'nonexistent-test-slug',
  host: '127.0.0.1',
  port: 1, // unreachable on purpose; we must never reach a connect attempt
  user: 'nobody',
  database: 'nodb',
  readOnly: true,
};

describe('runQuery read-only guard blocks before connecting', () => {
  it('blocks a write statement on a read-only DB (no connection)', (t) => {
    // The guard only runs after the psql-availability probe. If psql is not
    // installed, runQuery returns the "psql not found" message instead.
    if (!psqlInstalled) {
      t.skip('psql not installed; availability probe returns before the guard');
      return;
    }
    const res = db.runQuery(roEntry, 'DROP TABLE x');
    assert.equal(res.ok, false);
    assert.equal(res.blocked, true);
    assert.equal(typeof res.stderr, 'string');
    assert.ok(res.stderr.length > 0);
  });

  it('blocks an INSERT on a read-only DB', (t) => {
    if (!psqlInstalled) {
      t.skip('psql not installed');
      return;
    }
    const res = db.runQuery(roEntry, 'INSERT INTO t VALUES (1)');
    assert.equal(res.ok, false);
    assert.equal(res.blocked, true);
  });
});
