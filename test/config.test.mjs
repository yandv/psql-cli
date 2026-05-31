// Tests for the config store. The config module computes its directory from
// os.homedir() AT MODULE LOAD, so we set HOME to a fresh temp dir BEFORE the
// dynamic import below. We import once here (all tests share the same temp HOME)
// and clean it up in after().

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

let tmpHome;
let cfg;

before(async () => {
  tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'psqlcli-'));
  process.env.HOME = tmpHome;
  cfg = await import('../dist/config.js');
});

after(() => {
  fs.rmSync(tmpHome, { recursive: true, force: true });
});

describe('validateSlug', () => {
  const valid = ['abc', 'a-b-c', 'db1', 'a'];
  for (const s of valid) {
    it(`valid: ${JSON.stringify(s)}`, () => {
      assert.equal(cfg.validateSlug(s), null);
    });
  }
  const invalid = ['A', '-x', 'x_y', 'x y', '', 'a'.repeat(64), 'Ünïcode'];
  for (const s of invalid) {
    it(`invalid: ${JSON.stringify(s)}`, () => {
      const r = cfg.validateSlug(s);
      assert.equal(typeof r, 'string');
      assert.ok(r.length > 0);
    });
  }
  it('accepts exactly 63 chars and rejects 64', () => {
    assert.equal(cfg.validateSlug('a'.repeat(63)), null);
    assert.equal(typeof cfg.validateSlug('a'.repeat(64)), 'string');
  });
});

describe('load/save roundtrip', () => {
  it('loadConfig on empty returns the empty shape', () => {
    const c = cfg.loadConfig();
    assert.deepEqual(c, { version: 1, projects: {}, databases: {} });
  });

  it('save then re-load is equal', () => {
    const c = cfg.loadConfig();
    c.projects.app = { slug: 'app', name: 'App' };
    c.databases['app-db'] = {
      slug: 'app-db',
      project: 'app',
      host: 'h',
      port: 5432,
      user: 'u',
      database: 'd',
      readOnly: true,
    };
    c.defaultDatabase = 'app-db';
    cfg.saveConfig(c);

    const reloaded = cfg.loadConfig();
    assert.deepEqual(reloaded, c);
  });
});

describe('file permissions', () => {
  it('config.json is mode 600 and the dir is 700', () => {
    // saveConfig was called in the previous block; the file exists now.
    const fileStat = fs.statSync(cfg.configPath());
    const dirStat = fs.statSync(cfg.configDir());
    assert.equal(fileStat.mode & 0o777, 0o600);
    assert.equal(dirStat.mode & 0o777, 0o700);
  });
});

describe('resolveDatabase', () => {
  const base = {
    version: 1,
    projects: {},
    databases: {
      one: { slug: 'one', host: 'h', port: 5432, user: 'u', database: 'd', readOnly: true },
      two: { slug: 'two', host: 'h', port: 5432, user: 'u', database: 'd', readOnly: true },
    },
    defaultDatabase: 'two',
  };

  it('explicit slug wins over default', () => {
    const r = cfg.resolveDatabase(base, 'one');
    assert.equal(r.error, undefined);
    assert.equal(r.db.slug, 'one');
  });

  it('falls back to defaultDatabase', () => {
    const r = cfg.resolveDatabase(base);
    assert.equal(r.error, undefined);
    assert.equal(r.db.slug, 'two');
  });

  it('error when no default and no explicit slug', () => {
    const r = cfg.resolveDatabase({ version: 1, projects: {}, databases: {} });
    assert.equal(r.db, undefined);
    assert.equal(typeof r.error, 'string');
  });

  it('error for unknown slug mentions the known list', () => {
    const r = cfg.resolveDatabase(base, 'nope');
    assert.equal(r.db, undefined);
    assert.equal(typeof r.error, 'string');
    assert.ok(r.error.includes('one'));
    assert.ok(r.error.includes('two'));
  });
});
