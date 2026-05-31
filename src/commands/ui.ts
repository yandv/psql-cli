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

export async function cmdUi(args: string[]): Promise<number> {
  const { port, open } = parseUiFlags(args);
  const server = await startUiServer(port !== undefined ? { port } : {});

  console.log(`psql-cli UI: ${server.url}`);
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
