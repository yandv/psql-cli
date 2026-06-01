import { spawn } from 'node:child_process';
import { get as httpGet } from 'node:http';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { startUiServer } from '../ui/server.js';
import { configDir } from '../config.js';

const PRIMARY_PORT = 7733;

/** File where the running UI records its current URL (with token), 0600. */
function uiUrlPath(): string {
  return join(configDir(), 'ui.url');
}

function writeUiUrl(url: string): void {
  try {
    mkdirSync(configDir(), { recursive: true, mode: 0o700 });
    writeFileSync(uiUrlPath(), url, { mode: 0o600 });
  } catch {
    /* non-fatal */
  }
}

function readUiUrl(): string | null {
  try {
    if (!existsSync(uiUrlPath())) return null;
    return readFileSync(uiUrlPath(), 'utf8').trim() || null;
  } catch {
    return null;
  }
}

/** True if an already-running psql-cli UI answers at this URL's origin. */
function probeOurServer(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    let origin: string;
    try {
      const u = new URL(url);
      origin = `http://${u.host}/`;
    } catch {
      resolve(false);
      return;
    }
    const req = httpGet(origin, { timeout: 1200 }, (res) => {
      let body = '';
      res.on('data', (c) => {
        body += c;
        if (body.length > 4096) res.destroy();
      });
      res.on('end', () => resolve(res.statusCode === 200 && body.includes('psql-cli')));
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

function parseUiFlags(args: string[]): { port?: number; open: boolean } {
  let port: number | undefined;
  let open = true;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--port' || a === '-p') {
      port = Number(args[++i]);
    } else if (a.startsWith('--port=')) {
      port = Number(a.slice('--port='.length));
    } else if (a === '--no-open') {
      open = false;
    }
  }
  if (port !== undefined && (!Number.isInteger(port) || port < 0 || port > 65535)) {
    throw new Error(`Invalid --port "${port}". Use a number 0-65535.`);
  }
  return { port, open };
}

/** Best-effort browser launch. Failure to open is non-fatal. */
function openBrowser(url: string): void {
  let cmd: string;
  let cmdArgs: string[];
  if (process.platform === 'darwin') {
    cmd = 'open';
    cmdArgs = [url];
  } else if (process.platform === 'win32') {
    cmd = 'cmd';
    cmdArgs = ['/c', 'start', '', url];
  } else {
    cmd = 'xdg-open';
    cmdArgs = [url];
  }
  try {
    const child = spawn(cmd, cmdArgs, { detached: true, stdio: 'ignore' });
    child.on('error', () => {
      /* non-fatal: rely on the printed URL */
    });
    child.unref();
  } catch {
    /* non-fatal */
  }
}

export async function cmdUi(args: string[]): Promise<number> {
  const { port, open } = parseUiFlags(args);

  // Single instance on the default port: if one is already running, just open
  // its existing tab (with the live token) instead of starting a second server.
  // This is what makes launching from the .app / Spotlight idempotent.
  if (port === undefined) {
    const saved = readUiUrl();
    if (saved && (await probeOurServer(saved))) {
      console.log(`psql-cli UI already running: ${saved}`);
      if (open) openBrowser(saved);
      return 0;
    }
  }

  let server: Awaited<ReturnType<typeof startUiServer>>;
  let stable = true;
  if (port !== undefined) {
    server = await startUiServer({ port });
  } else {
    try {
      server = await startUiServer({ port: PRIMARY_PORT });
    } catch (err) {
      if ((err as NodeJS.ErrnoException)?.code !== 'EADDRINUSE') throw err;
      // Port taken by something that isn't our UI — fall back to a random port.
      server = await startUiServer({});
      stable = false;
    }
  }

  writeUiUrl(server.url);
  console.log(`psql-cli UI: ${server.url}`);
  if (!stable) {
    console.log('Note: port 7733 was busy, using a random one — open tabs may not persist this session.');
  }
  console.log('Press Ctrl+C to stop.');

  if (open) openBrowser(server.url);

  return new Promise<number>(() => {
    process.on('SIGINT', () => {
      server.close();
      process.exit(0);
    });
    // The Promise never resolves; the HTTP server keeps the event loop alive
    // until the user interrupts.
  });
}
