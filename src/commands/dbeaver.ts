import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { createDecipheriv } from 'node:crypto';
import {
  loadConfig,
  saveConfig,
  validateSlug,
  type Config,
  type DatabaseEntry,
  type ProjectEntry,
} from '../config.js';
import { setPassword, deletePassword } from '../keychain.js';
import { parseConnectionInput } from '../connparse.js';

// VERIFIED AES-128-CBC key for DBeaver credentials-config.json.
const DBEAVER_KEY = Buffer.from('babb4a9f774ab853c96c2d653dfe544a', 'hex');

interface Flags {
  [k: string]: string | boolean;
}

function parseFlags(args: string[]): { positionals: string[]; flags: Flags } {
  const flags: Flags = {};
  const positionals: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      if (eq !== -1) {
        flags[a.slice(2, eq)] = a.slice(eq + 1);
      } else {
        const next = args[i + 1];
        if (next !== undefined && !next.startsWith('--')) {
          flags[a.slice(2)] = next;
          i++;
        } else {
          flags[a.slice(2)] = true;
        }
      }
    } else {
      positionals.push(a);
    }
  }
  return { positionals, flags };
}

/** Expand a leading ~ to the user's home directory. */
function expandHome(p: string): string {
  if (p === '~') return homedir();
  if (p.startsWith('~/')) return join(homedir(), p.slice(2));
  return p;
}

/**
 * Decrypt a DBeaver credentials-config.json buffer. The first 16 bytes are the
 * IV; the rest is PKCS7-padded AES-128-CBC ciphertext. Returns the parsed JSON
 * credential map, keyed by connection id.
 */
function decryptCreds(buf: Buffer): Record<string, { '#connection'?: { user?: string; password?: string } }> {
  const iv = buf.subarray(0, 16);
  const dec = createDecipheriv('aes-128-cbc', DBEAVER_KEY, iv);
  const s = Buffer.concat([dec.update(buf.subarray(16)), dec.final()]).toString('utf8');
  // Be defensive about any leading/trailing noise around the JSON object.
  const a = s.indexOf('{');
  const b = s.lastIndexOf('}');
  return JSON.parse(s.slice(a, b + 1));
}

/** Slugify a display name to satisfy validateSlug; returns null if it can't. */
function slugify(name: string): string | null {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 63)
    .replace(/-+$/g, '');
  if (!slug || validateSlug(slug)) return null;
  return slug;
}

interface DbeaverConnection {
  name?: string;
  provider?: string;
  configuration?: {
    host?: string;
    port?: string;
    database?: string;
    user?: string | null;
    url?: string;
  };
}

interface DataSources {
  connections?: Record<string, DbeaverConnection>;
}

interface ImportedDb {
  entry: DatabaseEntry;
  password?: string;
}

export async function cmdImportDbeaver(args: string[]): Promise<number> {
  const { flags } = parseFlags(args);

  const workspaceRaw =
    (typeof flags.workspace === 'string' && flags.workspace) ||
    join(homedir(), 'Library', 'DBeaverData', 'workspace6');
  const workspace = expandHome(workspaceRaw);
  const replace = flags.replace === true;
  const dryRun = flags['dry-run'] === true;
  const readWrite = flags['read-write'] === true;

  if (!existsSync(workspace)) {
    console.error(`DBeaver workspace not found: ${workspace}`);
    return 1;
  }

  // Discover project folders: immediate subdirs with .dbeaver/data-sources.json.
  let entries: string[];
  try {
    entries = readdirSync(workspace, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();
  } catch (err) {
    console.error(`Failed to read workspace ${workspace}: ${(err as Error).message}`);
    return 1;
  }

  const projects: Record<string, ProjectEntry> = {};
  const imported: ImportedDb[] = [];
  const usedDbSlugs = new Set<string>();
  let projectCounter = 0;
  let skipped = 0;

  function uniqueDbSlug(base: string): string {
    let slug = base;
    let n = 2;
    while (usedDbSlugs.has(slug)) slug = `${base}-${n++}`;
    usedDbSlugs.add(slug);
    return slug;
  }

  for (const folderName of entries) {
    const dbeaverDir = join(workspace, folderName, '.dbeaver');
    const dsPath = join(dbeaverDir, 'data-sources.json');
    if (!existsSync(dsPath)) continue;

    projectCounter++;

    // Project slug from folder name.
    let projectSlug = slugify(folderName);
    if (!projectSlug) projectSlug = `project-${projectCounter}`;
    // Disambiguate project slug collisions across folders.
    if (projects[projectSlug] && projects[projectSlug].name !== folderName) {
      let n = 2;
      let candidate = `${projectSlug}-${n}`;
      while (projects[candidate]) candidate = `${projectSlug}-${++n}`;
      projectSlug = candidate;
    }

    let dataSources: DataSources;
    try {
      dataSources = JSON.parse(readFileSync(dsPath, 'utf8')) as DataSources;
    } catch (err) {
      console.error(`  ! ${folderName}: failed to parse data-sources.json (${(err as Error).message}) — skipping project`);
      continue;
    }

    const connections = dataSources.connections ?? {};
    const connIds = Object.keys(connections);
    if (connIds.length === 0) continue;

    // Decrypt credentials (best-effort, per project).
    let creds: Record<string, { '#connection'?: { user?: string; password?: string } }> = {};
    const credPath = join(dbeaverDir, 'credentials-config.json');
    if (existsSync(credPath)) {
      try {
        creds = decryptCreds(readFileSync(credPath));
      } catch (err) {
        console.error(`  ! ${folderName}: could not decrypt credentials (${(err as Error).message}) — importing without passwords`);
        creds = {};
      }
    } else {
      console.error(`  ! ${folderName}: no credentials-config.json — importing without passwords`);
    }

    let projectUsed = false;

    for (const connId of connIds) {
      const conn = connections[connId];
      if (conn.provider !== 'postgresql') {
        console.error(`  ! ${folderName}/${conn.name ?? connId}: provider "${conn.provider ?? 'unknown'}" not postgresql — skipping`);
        skipped++;
        continue;
      }

      const cfg = conn.configuration ?? {};
      let host = cfg.host ?? '';
      let port = Number(cfg.port) || 5432;
      let database = cfg.database ?? '';

      const cred = creds[connId]?.['#connection'];
      let user = cred?.user ?? cfg.user ?? '';
      let password = cred?.password ?? undefined;

      const parsed = cfg.url ? parseConnectionInput(cfg.url) : undefined;
      if (parsed) {
        // Pooler case (e.g. Supabase): the JDBC url points at a DIFFERENT host
        // AND carries its own credentials. That host+user+password trio is
        // self-consistent, whereas configuration.host may be the direct host,
        // which rejects a pooler-style username. Prefer the url wholesale then.
        const urlHasCreds = !!parsed.user;
        const urlHostDiffers = !!parsed.host && !!host && parsed.host !== host;
        if (urlHasCreds && urlHostDiffers) {
          host = parsed.host!;
          if (parsed.port) port = parsed.port;
          if (parsed.user) user = parsed.user;
          if (parsed.password) password = parsed.password;
          if (parsed.database) database = parsed.database;
        } else {
          // Otherwise only fill still-missing fields from the url.
          if (!user && parsed.user) user = parsed.user;
          if (!password && parsed.password) password = parsed.password;
          if (!host && parsed.host) host = parsed.host;
          if ((!cfg.port || port === 5432) && parsed.port) port = parsed.port;
          if (!database && parsed.database) database = parsed.database;
        }
      }

      const connName = conn.name ?? connId;
      const baseDbSlug = slugify(connName) ?? `${projectSlug}-db-${usedDbSlugs.size + 1}`;
      const dbSlug = uniqueDbSlug(baseDbSlug);

      const entry: DatabaseEntry = {
        slug: dbSlug,
        project: projectSlug,
        host,
        port,
        user: user || '',
        database,
        readOnly: !readWrite,
        description: connName,
      };

      imported.push({ entry, password: password || undefined });
      projectUsed = true;
    }

    if (projectUsed) {
      projects[projectSlug] = { slug: projectSlug, name: folderName };
    }
  }

  if (imported.length === 0) {
    console.error('No PostgreSQL connections found to import.');
    return 0;
  }

  // ---- Build / apply config ----
  if (dryRun) {
    printSummary(imported, projects, { dryRun: true });
    console.log('');
    console.log(`PREVIEW: ${imported.length} connection(s) across ${Object.keys(projects).length} project(s) would be imported. Nothing was written.`);
    console.log('Re-run without --dry-run to apply, then review in "psql-cli ui".');
    return 0;
  }

  let config: Config;
  if (replace) {
    const existing = loadConfig();
    // Delete Keychain passwords for every slug in the current config first.
    for (const slug of Object.keys(existing.databases)) {
      try {
        deletePassword(slug);
      } catch {
        /* best effort */
      }
    }
    config = { version: 1, projects: {}, databases: {} };
  } else {
    config = loadConfig();
  }

  // Upsert projects.
  for (const [slug, p] of Object.entries(projects)) {
    config.projects[slug] = p;
  }
  // Upsert databases.
  for (const { entry } of imported) {
    config.databases[entry.slug] = entry;
  }

  if (!config.defaultDatabase) {
    config.defaultDatabase = imported[0].entry.slug;
  }

  try {
    saveConfig(config);
  } catch (err) {
    console.error(`Failed to save config: ${(err as Error).message}`);
    return 1;
  }

  // Store passwords (never logged).
  let pwStored = 0;
  for (const { entry, password } of imported) {
    if (!password) continue;
    try {
      setPassword(entry.slug, password);
      pwStored++;
    } catch (err) {
      console.error(`  ! ${entry.slug}: failed to store password in Keychain (${(err as Error).message})`);
    }
  }

  printSummary(imported, projects, { dryRun: false });
  console.log('');
  console.log(
    `Imported ${imported.length} database(s) across ${Object.keys(projects).length} project(s); ${pwStored} password(s) stored in Keychain.`,
  );
  console.log('Review the imported connections in "psql-cli ui".');
  return 0;
}

function printSummary(
  imported: ImportedDb[],
  projects: Record<string, ProjectEntry>,
  opts: { dryRun: boolean },
): void {
  if (opts.dryRun) {
    console.log('DRY RUN — preview of what would be imported (nothing written, no passwords stored):');
  }
  const rows = imported.map(({ entry, password }) => ({
    slug: entry.slug,
    project: projects[entry.project ?? '']?.name ?? entry.project ?? '',
    host: entry.host || '(none)',
    database: entry.database || '(none)',
    mode: entry.readOnly ? 'ro' : 'rw',
    password: password ? 'yes' : 'no',
  }));

  const headers = ['slug', 'project', 'host', 'database', 'ro/rw', 'pw'];
  const cols: Array<keyof (typeof rows)[number]> = [
    'slug',
    'project',
    'host',
    'database',
    'mode',
    'password',
  ];
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => String(r[cols[i]]).length)),
  );
  const line = (vals: string[]) =>
    vals.map((v, i) => v.padEnd(widths[i])).join('  ');

  console.log(line(headers));
  console.log(line(widths.map((w) => '-'.repeat(w))));
  for (const r of rows) {
    console.log(line(cols.map((c) => String(r[c]))));
  }
}
