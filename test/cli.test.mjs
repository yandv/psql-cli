// Dispatch + exit-code tests for the built CLI. Each invocation runs the real
// dist/cli.js in a child process with a fresh temp HOME so the config is empty
// and the macOS Keychain is never touched. No command here needs psql/network.

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));

let tmpHome;

before(() => {
  tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'psqlcli-cli-'));
});

after(() => {
  fs.rmSync(tmpHome, { recursive: true, force: true });
});

function run(args) {
  const r = spawnSync(process.execPath, ['dist/cli.js', ...args], {
    cwd: repoRoot,
    env: { ...process.env, HOME: tmpHome },
    encoding: 'utf8',
  });
  return { code: r.status, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
}

describe('cli dispatch + exit codes', () => {
  it('version -> 0 and prints semver', () => {
    const r = run(['version']);
    assert.equal(r.code, 0);
    assert.match(r.stdout, /\d+\.\d+\.\d+/);
  });

  it('--version -> 0 and prints semver', () => {
    const r = run(['--version']);
    assert.equal(r.code, 0);
    assert.match(r.stdout, /\d+\.\d+\.\d+/);
  });

  it('help -> 0 and prints usage', () => {
    const r = run(['help']);
    assert.equal(r.code, 0);
    assert.ok(r.stdout.includes('psql-cli'));
    assert.ok(r.stdout.includes('Query'));
  });

  it('no args -> 0 and prints usage', () => {
    const r = run([]);
    assert.equal(r.code, 0);
    assert.ok(r.stdout.includes('psql-cli'));
    assert.ok(r.stdout.includes('Query'));
  });

  it('unknown command -> 2 and reports it', () => {
    const r = run(['frobnicate']);
    assert.equal(r.code, 2);
    assert.ok((r.stderr + r.stdout).includes('Unknown command'));
  });

  it('query with no db and no default -> 2', () => {
    const r = run(['query', 'SELECT 1']);
    assert.equal(r.code, 2);
    assert.match(r.stderr + r.stdout, /database|default/i);
  });

  it('list on empty config -> 0 and says no databases', () => {
    const r = run(['list']);
    assert.equal(r.code, 0);
    assert.match(r.stdout, /no databases/i);
  });

  it('list --json on empty config -> 0 and prints []', () => {
    const r = run(['list', '--json']);
    assert.equal(r.code, 0);
    const parsed = JSON.parse(r.stdout);
    assert.ok(Array.isArray(parsed));
    assert.equal(parsed.length, 0);
  });
});
