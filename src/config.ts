import { homedir } from 'node:os';
import { join } from 'node:path';
import {
  mkdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
  chmodSync,
} from 'node:fs';

export interface DatabaseEntry {
  /** Unique, LLM-facing identifier. Lowercase kebab-case. */
  slug: string;
  /** Optional project slug this database belongs to. */
  project?: string;
  host: string;
  port: number;
  user: string;
  /** Postgres database name (the actual DB, may differ from slug). */
  database: string;
  /** When true, only SELECT/WITH/EXPLAIN are allowed and the session is forced read-only. */
  readOnly: boolean;
  /** Human/LLM-facing one-liner so the model can pick the right database. */
  description?: string;
  /** disable | allow | prefer | require | verify-ca | verify-full */
  sslmode?: string;
}

export interface ProjectEntry {
  slug: string;
  name: string;
  description?: string;
}

export interface Config {
  version: 1;
  defaultDatabase?: string;
  projects: Record<string, ProjectEntry>;
  databases: Record<string, DatabaseEntry>;
}

const CONFIG_DIR = join(homedir(), '.config', 'psql-cli');
const CONFIG_PATH = join(CONFIG_DIR, 'config.json');

export function configDir(): string {
  return CONFIG_DIR;
}

export function configPath(): string {
  return CONFIG_PATH;
}

function emptyConfig(): Config {
  return { version: 1, projects: {}, databases: {} };
}

export function loadConfig(): Config {
  if (!existsSync(CONFIG_PATH)) return emptyConfig();
  try {
    const raw = readFileSync(CONFIG_PATH, 'utf8');
    const parsed = JSON.parse(raw) as Partial<Config>;
    return {
      version: 1,
      defaultDatabase: parsed.defaultDatabase,
      projects: parsed.projects ?? {},
      databases: parsed.databases ?? {},
    };
  } catch (err) {
    throw new Error(
      `Failed to read config at ${CONFIG_PATH}: ${(err as Error).message}`,
    );
  }
}

export function saveConfig(config: Config): void {
  mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  const tmp = `${CONFIG_PATH}.tmp`;
  writeFileSync(tmp, JSON.stringify(config, null, 2), { mode: 0o600 });
  // Atomic-ish replace + tighten perms.
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), { mode: 0o600 });
  try {
    chmodSync(CONFIG_PATH, 0o600);
    chmodSync(CONFIG_DIR, 0o700);
  } catch {
    /* best effort */
  }
  // Clean up tmp if it exists (writeFileSync above already wrote final).
  try {
    if (existsSync(tmp)) writeFileSync(tmp, '');
  } catch {
    /* ignore */
  }
}

export function getDatabase(config: Config, slug: string): DatabaseEntry | undefined {
  return config.databases[slug];
}

/** Resolve which database to use: explicit slug wins, else the configured default. */
export function resolveDatabase(
  config: Config,
  explicitSlug?: string,
): { db?: DatabaseEntry; error?: string } {
  const slug = explicitSlug ?? config.defaultDatabase;
  if (!slug) {
    return {
      error:
        'No database specified and no default set. Use --db <slug> or run "psql-cli default <slug>".',
    };
  }
  const db = config.databases[slug];
  if (!db) {
    const known = Object.keys(config.databases).sort().join(', ') || '(none)';
    return { error: `Unknown database "${slug}". Known: ${known}` };
  }
  return { db };
}

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,62}$/;

export function validateSlug(slug: string): string | null {
  if (!SLUG_RE.test(slug)) {
    return 'Slug must be lowercase, start with a letter/number, and contain only a-z, 0-9 and "-" (max 63 chars).';
  }
  return null;
}
