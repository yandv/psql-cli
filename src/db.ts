import { spawnSync, spawn } from 'node:child_process';
import type { DatabaseEntry } from './config.js';
import { getPassword } from './keychain.js';
import { checkReadOnly } from './sqlguard.js';

export type OutputFormat = 'csv' | 'table';

export interface RunOptions {
  format?: OutputFormat;
  /** Statement timeout in ms (Postgres-side). Default 12000. */
  statementTimeoutMs?: number;
  /** Hard process timeout in ms. Default 15000. */
  processTimeoutMs?: number;
}

export interface RunResult {
  ok: boolean;
  stdout: string;
  stderr: string;
  blocked?: boolean;
}

function psqlAvailable(): boolean {
  const res = spawnSync('psql', ['--version'], { encoding: 'utf8' });
  return res.status === 0;
}

/**
 * Build the environment for a psql child process.
 *
 * The password is injected via PGPASSWORD on the child's environment only — it
 * is never part of argv (so it won't show in `ps`, shell history, or anything
 * the LLM constructs). PGOPTIONS pins the session read-only when required, which
 * is the authoritative enforcement layer.
 */
function buildEnv(db: DatabaseEntry, statementTimeoutMs: number): NodeJS.ProcessEnv {
  const password = getPassword(db.slug);
  const opts = [`-c statement_timeout=${statementTimeoutMs}`, '-c lock_timeout=2000'];
  if (db.readOnly) {
    opts.push('-c default_transaction_read_only=on');
  }
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    PGHOST: db.host,
    PGPORT: String(db.port),
    PGUSER: db.user,
    PGDATABASE: db.database,
    PGCONNECT_TIMEOUT: '8',
    PGOPTIONS: opts.join(' '),
  };
  if (db.sslmode) env.PGSSLMODE = db.sslmode;
  if (password !== undefined) env.PGPASSWORD = password;
  return env;
}

function psqlArgs(sql: string, format: OutputFormat): string[] {
  const args = ['--no-psqlrc', '--set=ON_ERROR_STOP=1'];
  if (format === 'csv') {
    args.push('--csv');
  } else {
    args.push('--pset=border=2', '--pset=null=∅');
  }
  args.push('--command', sql);
  return args;
}

export function runQuery(db: DatabaseEntry, sql: string, opts: RunOptions = {}): RunResult {
  if (!psqlAvailable()) {
    return {
      ok: false,
      stdout: '',
      stderr:
        'psql not found. Install the PostgreSQL client (macOS: "brew install libpq && brew link --force libpq").',
    };
  }

  if (db.readOnly) {
    const guard = checkReadOnly(sql);
    if (!guard.ok) {
      return { ok: false, blocked: true, stdout: '', stderr: guard.reason! };
    }
  }

  const statementTimeoutMs = opts.statementTimeoutMs ?? 12000;
  const processTimeoutMs = opts.processTimeoutMs ?? 15000;
  const env = buildEnv(db, statementTimeoutMs);
  const res = spawnSync('psql', psqlArgs(sql, opts.format ?? 'csv'), {
    env,
    encoding: 'utf8',
    timeout: processTimeoutMs,
    maxBuffer: 32 * 1024 * 1024,
  });

  if (res.error && (res.error as NodeJS.ErrnoException).code === 'ETIMEDOUT') {
    return {
      ok: false,
      stdout: res.stdout ?? '',
      stderr: `Query exceeded the ${processTimeoutMs}ms process timeout and was killed.`,
    };
  }

  return {
    ok: res.status === 0,
    stdout: res.stdout ?? '',
    stderr: (res.stderr ?? '').trim(),
  };
}

/** Quick connectivity check used by the UI "Test connection" button. */
export function testConnection(db: DatabaseEntry): { ok: boolean; message: string } {
  const res = runQuery(db, 'SELECT 1', {
    format: 'csv',
    statementTimeoutMs: 5000,
    processTimeoutMs: 8000,
  });
  if (res.ok) {
    return { ok: true, message: `Connected to ${db.user}@${db.host}:${db.port}/${db.database}.` };
  }
  return { ok: false, message: res.stderr || 'Connection failed.' };
}
