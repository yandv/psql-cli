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
  /**
   * Explicit password, used instead of the Keychain lookup. For ad-hoc
   * connections (test/list) where the entry is not yet stored. Still injected
   * only via the child's PGPASSWORD env, never argv.
   */
  password?: string;
}

/** A connection that is not (yet) a stored DatabaseEntry. */
export interface AdhocConnection {
  host: string;
  port: number;
  user: string;
  sslmode?: string;
  /** Optional starting database; listServerDatabases falls back if it fails. */
  database?: string;
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
function buildEnv(
  db: DatabaseEntry,
  statementTimeoutMs: number,
  passwordOverride?: string,
): NodeJS.ProcessEnv {
  const password = passwordOverride ?? getPassword(db.slug);
  const opts = [`-c statement_timeout=${statementTimeoutMs}`, '-c lock_timeout=2000'];
  if (db.readOnly) {
    opts.push('-c default_transaction_read_only=on');
  }
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    PGHOST: db.host,
    PGPORT: String(db.port),
    PGUSER: db.user,
    PGCONNECT_TIMEOUT: '8',
    PGOPTIONS: opts.join(' '),
  };
  // Omit PGDATABASE when empty so libpq falls back to the user's default db
  // (used when listing databases on a connection without a known db).
  if (db.database) env.PGDATABASE = db.database;
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
  const env = buildEnv(db, statementTimeoutMs, opts.password);
  const res = spawnSync('psql', psqlArgs(sql, opts.format ?? 'csv'), {
    env,
    encoding: 'utf8',
    timeout: processTimeoutMs,
    maxBuffer: 32 * 1024 * 1024,
  });

  if (res.error) {
    const code = (res.error as NodeJS.ErrnoException).code;
    if (code === 'ETIMEDOUT') {
      return {
        ok: false,
        stdout: res.stdout ?? '',
        stderr: `Query exceeded the ${processTimeoutMs}ms process timeout and was killed.`,
      };
    }
    // Any other spawn failure (e.g. ENOBUFS from exceeding maxBuffer, EACCES):
    // surface it rather than returning an empty, confusing error.
    return {
      ok: false,
      stdout: res.stdout ?? '',
      stderr: (res.stderr ?? '').trim() || `psql could not run: ${res.error.message}`,
    };
  }

  return {
    ok: res.status === 0,
    stdout: res.stdout ?? '',
    stderr: (res.stderr ?? '').trim(),
  };
}

/**
 * Quick connectivity check used by the UI "Test connection" button.
 * `password` overrides the Keychain lookup (for testing an entry before saving).
 */
export function testConnection(db: DatabaseEntry, password?: string): { ok: boolean; message: string } {
  const res = runQuery(db, 'SELECT 1', {
    format: 'csv',
    statementTimeoutMs: 5000,
    processTimeoutMs: 8000,
    password,
  });
  if (res.ok) {
    const target = db.database ? `/${db.database}` : '';
    return { ok: true, message: `Connected to ${db.user}@${db.host}:${db.port}${target}.` };
  }
  return { ok: false, message: res.stderr || 'Connection failed.' };
}

/**
 * Connect to a server (without requiring a known target database) and list its
 * non-template databases. Used when the user pastes a connection with no
 * database: we connect to a fallback db, read pg_database, and let them choose.
 */
export function listServerDatabases(
  conn: AdhocConnection,
  password: string,
): { ok: boolean; databases?: string[]; error?: string } {
  const candidates = [conn.database, 'postgres', 'template1', conn.user].filter(
    (d, i, a): d is string => !!d && a.indexOf(d) === i,
  );
  let lastErr = 'Could not connect to the server.';
  for (const database of candidates) {
    const entry: DatabaseEntry = {
      slug: '__adhoc__',
      host: conn.host,
      port: conn.port,
      user: conn.user,
      database,
      readOnly: true,
      sslmode: conn.sslmode,
    };
    const res = runQuery(
      entry,
      'SELECT datname FROM pg_database WHERE datistemplate = false ORDER BY datname',
      { password, format: 'csv', statementTimeoutMs: 5000, processTimeoutMs: 8000 },
    );
    if (res.ok) {
      const lines = res.stdout.split('\n').map((l) => l.trim()).filter(Boolean);
      lines.shift(); // drop the "datname" CSV header
      return { ok: true, databases: lines };
    }
    lastErr = res.stderr || lastErr;
    // Auth/role failures won't be fixed by trying another database.
    if (/password|authentication|role .* does not exist|no pg_hba/i.test(lastErr)) break;
  }
  return { ok: false, error: lastErr };
}
