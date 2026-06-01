import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync, existsSync, chmodSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Create a macOS .app bundle that launches the web UI, so the user can open
 * psql-cli from Spotlight / Raycast / Alfred instead of a terminal.
 *
 * The bundle is a thin wrapper: its executable is a shell script that resolves
 * Node (from nvm, like the bin launcher) and runs `cli.js ui`. cmdUi is
 * single-instance, so re-opening the app just focuses the existing browser tab.
 * No extra dependencies, no packaging step — it points at THIS install.
 */

const APP_NAME = 'psql-cli';
const BUNDLE_ID = 'com.allanmxr.psql-cli';

function cliJsPath(): string {
  // This file compiles to dist/commands/installapp.js; cli.js is one level up.
  return fileURLToPath(new URL('../cli.js', import.meta.url));
}

function launcherScript(cliJs: string): string {
  // Resolve node from nvm (lazy-loaded shells don't put it on PATH for GUI apps)
  // and ensure Homebrew's bin (psql) is reachable for the child psql processes.
  return `#!/bin/bash
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
NODE_BIN="$(ls -d "$HOME"/.nvm/versions/node/*/bin/node 2>/dev/null | sort -V | tail -1)"
[ -x "$NODE_BIN" ] || NODE_BIN="$(command -v node)"
if [ ! -x "$NODE_BIN" ]; then
  osascript -e 'display alert "psql-cli" message "Node.js not found. Install Node, then re-run psql-cli install-app."' >/dev/null 2>&1
  exit 1
fi
LOG="$HOME/Library/Logs/psql-cli-ui.log"
exec "$NODE_BIN" ${JSON.stringify(cliJs)} ui >> "$LOG" 2>&1
`;
}

function infoPlist(): string {
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
  <key>LSMinimumSystemVersion</key><string>10.13</string>
</dict>
</plist>
`;
}

export function cmdInstallApp(args: string[]): number {
  if (process.platform !== 'darwin') {
    console.error('install-app currently supports macOS only.');
    return 2;
  }

  // Destination: ~/Applications (no sudo) unless --system (/Applications).
  const system = args.includes('--system');
  const appsDir = system ? '/Applications' : join(homedir(), 'Applications');
  const appDir = join(appsDir, `${APP_NAME}.app`);
  const macosDir = join(appDir, 'Contents', 'MacOS');
  const exePath = join(macosDir, APP_NAME);

  const cliJs = cliJsPath();
  if (!existsSync(cliJs)) {
    console.error(`Build output not found at ${cliJs}. Run "npm run build" first.`);
    return 1;
  }

  try {
    if (existsSync(appDir)) rmSync(appDir, { recursive: true, force: true });
    mkdirSync(macosDir, { recursive: true });
    writeFileSync(join(appDir, 'Contents', 'Info.plist'), infoPlist());
    writeFileSync(exePath, launcherScript(cliJs));
    chmodSync(exePath, 0o755);
  } catch (err) {
    console.error(`Failed to create the app: ${(err as Error).message}`);
    if (system) console.error('Tip: /Applications may need sudo. Try without --system to install to ~/Applications.');
    return 1;
  }

  // Nudge Spotlight/LaunchServices to index it right away (best effort).
  spawnSync('/usr/bin/mdimport', [appDir], { stdio: 'ignore' });

  console.log(`Installed ${APP_NAME}.app at:`);
  console.log(`  ${appDir}`);
  console.log('');
  console.log('Open it from Spotlight (⌘Space), Raycast, or Alfred — search "psql-cli".');
  console.log('It starts the UI and opens your browser; re-opening just focuses the existing tab.');
  return 0;
}
