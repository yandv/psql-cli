import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync, existsSync, chmodSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Create a macOS .app bundle that launches the web UI, so the user can open
 * psql-cli from Spotlight / Raycast / Alfred instead of a terminal.
 *
 * Preferred build: a tiny Swift menu-bar app, compiled at install time with
 * swiftc. It lives ONLY in the menu bar (no Dock icon, via LSUIElement +
 * accessory activation policy), owns the UI server process, and exposes a menu
 * with "Open in Browser" and "Quit" (which really stops the server).
 *
 * Fallback (no swiftc): a thin shell launcher that runs `cli.js ui` — this one
 * shows in the Dock and is quit like any app.
 *
 * Either way the bundle points at THIS install — no packaging step, no deps.
 */

const APP_NAME = 'psql-cli';
const BUNDLE_ID = 'com.allanmxr.psql-cli';

function cliJsPath(): string {
  // This file compiles to dist/commands/installapp.js; cli.js is one level up.
  return fileURLToPath(new URL('../cli.js', import.meta.url));
}

function swiftAvailable(): boolean {
  return spawnSync('swiftc', ['--version'], { stdio: 'ignore' }).status === 0;
}

/** Escape a string for embedding inside a Swift double-quoted literal. */
function swiftStr(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function swiftSource(cliJs: string): string {
  return `import Cocoa

let CLI_JS = "${swiftStr(cliJs)}"
let HOME = FileManager.default.homeDirectoryForCurrentUser.path

final class AppDelegate: NSObject, NSApplicationDelegate {
  var statusItem: NSStatusItem!
  var task: Process?

  func applicationDidFinishLaunching(_ note: Notification) {
    // Single instance: if another copy is already running, bow out.
    let me = Bundle.main.bundleIdentifier ?? "${BUNDLE_ID}"
    if NSRunningApplication.runningApplications(withBundleIdentifier: me).count > 1 {
      NSApp.terminate(nil)
      return
    }
    NSApp.setActivationPolicy(.accessory) // menu bar only, no Dock icon

    startServer()

    statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
    statusItem.button?.title = "🐘"
    statusItem.button?.toolTip = "psql-cli"

    let menu = NSMenu()
    let open = NSMenuItem(title: "Open psql-cli in Browser", action: #selector(openBrowser), keyEquivalent: "o")
    let quit = NSMenuItem(title: "Quit psql-cli", action: #selector(quitApp), keyEquivalent: "q")
    open.target = self
    quit.target = self
    menu.addItem(open)
    menu.addItem(.separator())
    menu.addItem(quit)
    statusItem.menu = menu
  }

  func startServer() {
    let p = Process()
    p.executableURL = URL(fileURLWithPath: "/bin/bash")
    let script = "export PATH=\\"/opt/homebrew/bin:/usr/local/bin:$PATH\\"; "
      + "NODE_BIN=$(ls -d \\"$HOME\\"/.nvm/versions/node/*/bin/node 2>/dev/null | sort -V | tail -1); "
      + "[ -x \\"$NODE_BIN\\" ] || NODE_BIN=$(command -v node); "
      + "exec \\"$NODE_BIN\\" \\"\\(CLI_JS)\\" ui >> \\"$HOME/Library/Logs/psql-cli-ui.log\\" 2>&1"
    p.arguments = ["-lc", script]
    do { try p.run(); task = p } catch { NSLog("psql-cli: failed to start server: \\(error)") }
  }

  @objc func openBrowser() {
    var target = "http://127.0.0.1:7733/"
    let urlFile = "\\(HOME)/.config/psql-cli/ui.url"
    if let s = try? String(contentsOfFile: urlFile, encoding: .utf8) {
      let t = s.trimmingCharacters(in: .whitespacesAndNewlines)
      if !t.isEmpty { target = t }
    }
    if let url = URL(string: target) { NSWorkspace.shared.open(url) }
  }

  @objc func quitApp() {
    task?.terminate()
    NSApp.terminate(nil)
  }

  func applicationWillTerminate(_ note: Notification) {
    task?.terminate()
  }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.run()
`;
}

function bashLauncher(cliJs: string): string {
  return `#!/bin/bash
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
NODE_BIN="$(ls -d "$HOME"/.nvm/versions/node/*/bin/node 2>/dev/null | sort -V | tail -1)"
[ -x "$NODE_BIN" ] || NODE_BIN="$(command -v node)"
if [ ! -x "$NODE_BIN" ]; then
  osascript -e 'display alert "psql-cli" message "Node.js not found. Install Node, then re-run psql-cli install-app."' >/dev/null 2>&1
  exit 1
fi
exec "$NODE_BIN" ${JSON.stringify(cliJs)} ui >> "$HOME/Library/Logs/psql-cli-ui.log" 2>&1
`;
}

function infoPlist(menuBar: boolean): string {
  // LSUIElement hides the Dock icon — the menu-bar app uses it.
  const uiElement = menuBar ? '\n  <key>LSUIElement</key><true/>' : '';
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleName</key><string>${APP_NAME}</string>
  <key>CFBundleDisplayName</key><string>psql-cli</string>
  <key>CFBundleExecutable</key><string>${APP_NAME}</string>
  <key>CFBundleIdentifier</key><string>${BUNDLE_ID}</string>
  <key>CFBundlePackageType</key><string>APPL</string>
  <key>CFBundleVersion</key><string>1.0</string>
  <key>CFBundleShortVersionString</key><string>1.0</string>
  <key>NSHighResolutionCapable</key><true/>
  <key>LSMinimumSystemVersion</key><string>10.13</string>${uiElement}
</dict>
</plist>
`;
}

export function cmdInstallApp(args: string[]): number {
  if (process.platform !== 'darwin') {
    console.error('install-app currently supports macOS only.');
    return 2;
  }

  const system = args.includes('--system');
  const forceDock = args.includes('--dock'); // force the simple Dock-app fallback
  const appsDir = system ? '/Applications' : join(homedir(), 'Applications');
  const appDir = join(appsDir, `${APP_NAME}.app`);
  const macosDir = join(appDir, 'Contents', 'MacOS');
  const exePath = join(macosDir, APP_NAME);

  const cliJs = cliJsPath();
  if (!existsSync(cliJs)) {
    console.error(`Build output not found at ${cliJs}. Run "npm run build" first.`);
    return 1;
  }

  const useSwift = !forceDock && swiftAvailable();

  try {
    if (existsSync(appDir)) rmSync(appDir, { recursive: true, force: true });
    mkdirSync(macosDir, { recursive: true });
    writeFileSync(join(appDir, 'Contents', 'Info.plist'), infoPlist(useSwift));

    if (useSwift) {
      const src = join(tmpdir(), `psql-cli-menubar-${process.pid}.swift`);
      writeFileSync(src, swiftSource(cliJs));
      const res = spawnSync(
        'swiftc',
        ['-O', '-framework', 'Cocoa', '-o', exePath, src],
        { encoding: 'utf8' },
      );
      rmSync(src, { force: true });
      if (res.status !== 0) {
        throw new Error(`swiftc failed:\n${res.stderr || res.stdout || 'unknown error'}`);
      }
      chmodSync(exePath, 0o755);
    } else {
      writeFileSync(exePath, bashLauncher(cliJs));
      chmodSync(exePath, 0o755);
    }
  } catch (err) {
    console.error(`Failed to create the app: ${(err as Error).message}`);
    if (system) console.error('Tip: /Applications may need sudo. Try without --system (installs to ~/Applications).');
    return 1;
  }

  spawnSync('/usr/bin/mdimport', [appDir], { stdio: 'ignore' }); // help Spotlight index it

  console.log(`Installed ${APP_NAME}.app at:`);
  console.log(`  ${appDir}`);
  console.log('');
  if (useSwift) {
    console.log('Open it from Spotlight (⌘Space), Raycast, or Alfred — search "psql-cli".');
    console.log('It lives in the menu bar (🐘, no Dock icon). Click it for "Open in Browser" and "Quit".');
  } else {
    console.log('swiftc not found — installed the simple launcher (shows in the Dock).');
    console.log('Open it from Spotlight/Raycast; quit it like any app. Install Xcode Command Line');
    console.log('Tools (xcode-select --install) and re-run for the menu-bar version.');
  }
  return 0;
}
