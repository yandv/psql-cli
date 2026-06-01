import { spawn } from 'node:child_process';
import { startUiServer } from '../ui/server.js';

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

/**
 * Default ports tried when the user doesn't pass --port. A STABLE port matters:
 * the UI persists open tabs / recents in the browser's localStorage, which is
 * keyed by origin (host:port). A random port would reset that state every launch
 * — so we reuse a fixed port and only bump if it's already taken.
 */
const DEFAULT_PORTS = [7733, 7734, 7735, 7736, 7737];

async function listenStable(): Promise<{ server: Awaited<ReturnType<typeof startUiServer>>; stable: boolean }> {
  for (const p of DEFAULT_PORTS) {
    try {
      return { server: await startUiServer({ port: p }), stable: true };
    } catch (err) {
      const code = (err as NodeJS.ErrnoException)?.code;
      if (code !== 'EADDRINUSE') throw err;
    }
  }
  // All preferred ports busy — fall back to a random one (state won't persist).
  return { server: await startUiServer({}), stable: false };
}

export async function cmdUi(args: string[]): Promise<number> {
  const { port, open } = parseUiFlags(args);
  let server: Awaited<ReturnType<typeof startUiServer>>;
  let stable = true;
  if (port !== undefined) {
    server = await startUiServer({ port });
  } else {
    ({ server, stable } = await listenStable());
  }

  console.log(`psql-cli UI: ${server.url}`);
  if (!stable) {
    console.log('Note: preferred ports were busy, using a random one — open tabs may not persist this session.');
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
