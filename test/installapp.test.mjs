import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, existsSync, readFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// install-app writes into $HOME/Applications, so a temp HOME isolates it.
let home;
let cmdInstallApp;

before(async () => {
  home = mkdtempSync(join(tmpdir(), 'psqlcli-app-'));
  process.env.HOME = home;
  ({ cmdInstallApp } = await import('../dist/commands/installapp.js'));
});

after(() => {
  rmSync(home, { recursive: true, force: true });
});

describe('install-app (macOS)', () => {
  it('creates a valid .app bundle pointing at the built cli.js', { skip: process.platform !== 'darwin' }, () => {
    const code = cmdInstallApp([]);
    assert.equal(code, 0);
    const appDir = join(home, 'Applications', 'psql-cli.app');
    const plist = join(appDir, 'Contents', 'Info.plist');
    const exe = join(appDir, 'Contents', 'MacOS', 'psql-cli');
    assert.ok(existsSync(plist), 'Info.plist exists');
    assert.ok(existsSync(exe), 'launcher exists');

    const plistText = readFileSync(plist, 'utf8');
    assert.match(plistText, /CFBundleExecutable<\/key>\s*<string>psql-cli/);
    assert.match(plistText, /com\.allanmxr\.psql-cli/);

    const launcher = readFileSync(exe, 'utf8');
    assert.match(launcher, /\/dist\/cli\.js/, 'launcher runs the built cli.js');
    assert.match(launcher, /\bui\b/, 'launcher runs the ui subcommand');
    assert.match(launcher, /\.nvm\/versions\/node/, 'launcher resolves node from nvm');

    // launcher must be executable
    const mode = statSync(exe).mode & 0o777;
    assert.ok(mode & 0o100, 'launcher is executable');
  });

  it('re-running replaces the bundle without error', { skip: process.platform !== 'darwin' }, () => {
    assert.equal(cmdInstallApp([]), 0);
    assert.equal(cmdInstallApp([]), 0);
  });
});
