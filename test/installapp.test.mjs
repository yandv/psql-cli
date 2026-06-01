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
  it('creates a valid .app bundle', { skip: process.platform !== 'darwin' }, () => {
    const code = cmdInstallApp([]);
    assert.equal(code, 0);
    const appDir = join(home, 'Applications', 'psql-cli.app');
    const plist = join(appDir, 'Contents', 'Info.plist');
    const exe = join(appDir, 'Contents', 'MacOS', 'psql-cli');
    assert.ok(existsSync(plist), 'Info.plist exists');
    assert.ok(existsSync(exe), 'executable exists');

    const plistText = readFileSync(plist, 'utf8');
    assert.match(plistText, /CFBundleExecutable<\/key>\s*<string>psql-cli/);
    assert.match(plistText, /com\.allanmxr\.psql-cli/);

    // Executable bit set.
    assert.ok(statSync(exe).mode & 0o100, 'executable is +x');

    // Read first bytes: a script (#!) in the fallback, or a Mach-O binary (Swift).
    const head = readFileSync(exe);
    const isScript = head[0] === 0x23 && head[1] === 0x21; // "#!"
    if (isScript) {
      const text = head.toString('utf8');
      assert.match(text, /\/dist\/cli\.js/, 'launcher runs the built cli.js');
      assert.match(text, /\bui\b/, 'launcher runs the ui subcommand');
    } else {
      assert.ok(head.length > 1000, 'compiled binary is non-trivial');
      // Swift/menu-bar build → no Dock icon.
      assert.match(plistText, /LSUIElement/, 'menu-bar build hides the Dock icon');
    }
  });

  it('--dock forces the simple launcher script', { skip: process.platform !== 'darwin' }, () => {
    assert.equal(cmdInstallApp(['--dock']), 0);
    const exe = join(home, 'Applications', 'psql-cli.app', 'Contents', 'MacOS', 'psql-cli');
    const text = readFileSync(exe, 'utf8');
    assert.match(text, /^#!/, 'fallback is a shell script');
    assert.match(text, /\/dist\/cli\.js/);
  });

  it('re-running replaces the bundle without error', { skip: process.platform !== 'darwin' }, () => {
    assert.equal(cmdInstallApp([]), 0);
    assert.equal(cmdInstallApp([]), 0);
  });
});
