import { readFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import {
  loadConfig,
  saveConfig,
  validateSlug,
  type DatabaseEntry,
  type ProjectEntry,
} from '../config.js';
import { setPassword, deletePassword, hasPassword } from '../keychain.js';
import { testConnection } from '../db.js';

interface Flags {
  [k: string]: string | boolean;
}

export function parseFlags(args: string[]): { positionals: string[]; flags: Flags } {
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

/** Read a password without echoing it. Falls back to PSQL_CLI_PASSWORD env. */
function promptPassword(label: string): Promise<string> {
  if (process.env.PSQL_CLI_PASSWORD) return Promise.resolve(process.env.PSQL_CLI_PASSWORD);
  return new Promise((resolve) => {
    process.stdout.write(label);
    const stdin = process.stdin;
    const wasRaw = stdin.isRaw;
    if (stdin.isTTY) stdin.setRawMode(true);
    stdin.resume();
    let buf = '';
    const finish = () => {
      if (stdin.isTTY) stdin.setRawMode(wasRaw);
      stdin.pause();
      stdin.removeListener('data', onData);
      process.stdout.write('\n');
      resolve(buf);
    };
    function onData(chunk: Buffer): void {
      for (const code of chunk) {
        if (code === 0x0a || code === 0x0d) {
          finish();
          return;
        } else if (code === 0x03) {
          if (stdin.isTTY) stdin.setRawMode(wasRaw);
          process.exit(130);
        } else if (code === 0x7f || code === 0x08) {
          buf = buf.slice(0, -1);
        } else if (code >= 0x20) {
          buf += String.fromCharCode(code);
        }
      }
    }
    stdin.on('data', onData);
  });
}

export function cmdDefault(args: string[]): number {
  const config = loadConfig();
  const slug = args[0];
  if (!slug) {
    console.log(config.defaultDatabase ?? 'No default database set.');
    return 0;
  }
  if (!config.databases[slug]) {
    console.error(`Unknown database "${slug}". Run "psql-cli list".`);
    return 2;
  }
  config.defaultDatabase = slug;
  saveConfig(config);
  console.log(`Default database is now "${slug}".`);
  return 0;
}

export async function cmdDb(args: string[]): Promise<number> {
  const sub = args[0];
  const rest = args.slice(1);
  switch (sub) {
    case 'add':
    case 'edit':
      return dbAddOrEdit(rest, sub === 'edit');
    case 'rm':
    case 'remove':
    case 'delete':
      return dbRemove(rest);
    case 'show':
      return dbShow(rest);
    default:
      console.error('Usage: psql-cli db <add|edit|rm|show> ...');
      return 2;
  }
}

async function dbAddOrEdit(args: string[], isEdit: boolean): Promise<number> {
  const { positionals, flags } = parseFlags(args);
  const config = loadConfig();
  const slug = (flags.slug as string) ?? positionals[0];
  if (!slug) {
    console.error(
      'Missing --slug. Example:\n  psql-cli db add --slug my-db --host H --user U --database D [--port 5432] [--readonly] [--project P] [--desc "..."]',
    );
    return 2;
  }
  const slugErr = validateSlug(slug);
  if (slugErr) {
    console.error(slugErr);
    return 2;
  }

  const existing = config.databases[slug];
  if (isEdit && !existing) {
    console.error(`No database "${slug}" to edit.`);
    return 2;
  }
  if (!isEdit && existing) {
    console.error(`Database "${slug}" already exists. Use "psql-cli db edit ${slug}".`);
    return 2;
  }

  const base: DatabaseEntry = existing ?? {
    slug,
    host: '',
    port: 5432,
    user: '',
    database: '',
    readOnly: true,
  };

  const readOnly =
    flags.readonly === true || flags.readonly === 'true'
      ? true
      : flags.rw === true || flags.readonly === 'false'
        ? false
        : base.readOnly;

  const entry: DatabaseEntry = {
    ...base,
    slug,
    host: (flags.host as string) ?? base.host,
    port: flags.port ? Number(flags.port) : base.port,
    user: (flags.user as string) ?? base.user,
    database: (flags.database as string) ?? (flags.db as string) ?? base.database,
    project: (flags.project as string) ?? base.project,
    description:
      (flags.desc as string) ?? (flags.description as string) ?? base.description,
    sslmode: (flags.sslmode as string) ?? base.sslmode,
    readOnly,
  };

  if (!entry.host || !entry.user || !entry.database) {
    console.error('host, user and database are required.');
    return 2;
  }

  if (entry.project && !config.projects[entry.project]) {
    console.error(
      `Unknown project "${entry.project}". Create it first: psql-cli project add --slug ${entry.project} --name "..."`,
    );
    return 2;
  }

  // Password: flag (discouraged), env, or hidden prompt. On edit, blank keeps existing.
  let password: string | undefined;
  if (typeof flags.password === 'string') {
    password = flags.password;
  } else if (process.env.PSQL_CLI_PASSWORD) {
    password = process.env.PSQL_CLI_PASSWORD;
  } else if (!isEdit || flags['set-password']) {
    password = await promptPassword(
      `Password for ${entry.user}@${entry.host} (leave blank to keep): `,
    );
  }

  config.databases[slug] = entry;
  if (!config.defaultDatabase) config.defaultDatabase = slug;
  saveConfig(config);

  if (password) setPassword(slug, password);

  const pw = hasPassword(slug) ? 'set' : 'NOT set';
  console.log(
    `${isEdit ? 'Updated' : 'Added'} "${slug}" (${entry.readOnly ? 'read-only' : 'read-write'}, password ${pw}).`,
  );
  return 0;
}

function dbRemove(args: string[]): number {
  const slug = args[0];
  const config = loadConfig();
  if (!slug || !config.databases[slug]) {
    console.error(`Unknown database "${slug ?? ''}".`);
    return 2;
  }
  delete config.databases[slug];
  if (config.defaultDatabase === slug) config.defaultDatabase = undefined;
  saveConfig(config);
  deletePassword(slug);
  console.log(`Removed "${slug}" and its stored password.`);
  return 0;
}

function dbShow(args: string[]): number {
  const slug = args[0];
  const config = loadConfig();
  const d = config.databases[slug];
  if (!d) {
    console.error(`Unknown database "${slug ?? ''}".`);
    return 2;
  }
  // Never print the password.
  console.log(
    JSON.stringify(
      { ...d, password: hasPassword(slug) ? '(stored in Keychain)' : '(not set)' },
      null,
      2,
    ),
  );
  return 0;
}

export function cmdProject(args: string[]): number {
  const sub = args[0];
  const rest = args.slice(1);
  const config = loadConfig();

  if (sub === 'list' || !sub) {
    const slugs = Object.keys(config.projects).sort();
    if (slugs.length === 0) {
      console.log('No projects yet. Add one: psql-cli project add --slug my-app --name "My App"');
      return 0;
    }
    for (const s of slugs) {
      const p = config.projects[s];
      console.log(
        `${p.slug.padEnd(20)} ${p.name}${p.description ? ` — ${p.description}` : ''}`,
      );
    }
    return 0;
  }

  if (sub === 'add' || sub === 'edit') {
    const { positionals, flags } = parseFlags(rest);
    const slug = (flags.slug as string) ?? positionals[0];
    if (!slug) {
      console.error('Missing --slug.');
      return 2;
    }
    const slugErr = validateSlug(slug);
    if (slugErr) {
      console.error(slugErr);
      return 2;
    }
    const entry: ProjectEntry = {
      slug,
      name: (flags.name as string) ?? config.projects[slug]?.name ?? slug,
      description:
        (flags.desc as string) ??
        (flags.description as string) ??
        config.projects[slug]?.description,
    };
    config.projects[slug] = entry;
    saveConfig(config);
    console.log(`${sub === 'edit' ? 'Updated' : 'Added'} project "${slug}".`);
    return 0;
  }

  if (sub === 'rm' || sub === 'remove' || sub === 'delete') {
    const slug = rest[0];
    if (!slug || !config.projects[slug]) {
      console.error(`Unknown project "${slug ?? ''}".`);
      return 2;
    }
    const attached = Object.values(config.databases).filter((d) => d.project === slug);
    if (attached.length > 0) {
      console.error(
        `Project "${slug}" still has ${attached.length} database(s). Reassign or remove them first.`,
      );
      return 2;
    }
    delete config.projects[slug];
    saveConfig(config);
    console.log(`Removed project "${slug}".`);
    return 0;
  }

  console.error('Usage: psql-cli project <list|add|edit|rm> ...');
  return 2;
}

export function cmdTest(args: string[]): number {
  const slug = args[0];
  const config = loadConfig();
  const d = config.databases[slug];
  if (!d) {
    console.error(`Unknown database "${slug ?? ''}".`);
    return 2;
  }
  const res = testConnection(d);
  console.log(res.message);
  return res.ok ? 0 : 1;
}

/**
 * Parse a single ~/.pgpass line into its fields. Fields may escape ':' as '\:';
 * we split only on unescaped colons and then unescape. Returns null for lines
 * that do not have at least the 5 expected fields.
 */
export function parsePgpassLine(
  line: string,
): { host: string; port: string; database: string; user: string; password: string } | null {
  const parts = line.split(/(?<!\\):/).map((p) => p.replace(/\\:/g, ':'));
  if (parts.length < 5) return null;
  const [host, port, database, user, password] = parts;
  return { host, port, database, user, password };
}

/**
 * Import connections from ~/.pgpass. Each line "host:port:db:user:password"
 * becomes a database entry; the password is moved into the Keychain. Slugs are
 * auto-generated (db-host) and can be renamed afterwards in the UI.
 */
export function cmdImportLegacy(args: string[]): number {
  const pgpassPath = args.find((a) => !a.startsWith('-')) ?? join(homedir(), '.pgpass');
  if (!existsSync(pgpassPath)) {
    console.error(`No file at ${pgpassPath}.`);
    return 2;
  }
  const config = loadConfig();
  const lines = readFileSync(pgpassPath, 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));

  let imported = 0;
  for (const line of lines) {
    const parsed = parsePgpassLine(line);
    if (!parsed) continue;
    const { host, port, database, user, password } = parsed;
    const lastOctet = host.split('.').pop() ?? 'h';
    let slug = `${database}-${lastOctet}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    if (validateSlug(slug)) slug = `imported-${imported + 1}`;
    let unique = slug;
    let n = 2;
    while (config.databases[unique]) unique = `${slug}-${n++}`;
    slug = unique;

    config.databases[slug] = {
      slug,
      host,
      port: Number(port) || 5432,
      user,
      database,
      readOnly: true,
      description: `Imported from .pgpass (${user}@${host})`,
    };
    if (password) setPassword(slug, password);
    imported++;
    console.log(`  imported ${slug}  (${user}@${host}:${port}/${database}, read-only)`);
  }

  if (imported > 0 && !config.defaultDatabase) {
    config.defaultDatabase = Object.keys(config.databases)[0];
  }
  saveConfig(config);
  console.log(`\nImported ${imported} database(s). Review/rename slugs in "psql-cli ui".`);
  return 0;
}
