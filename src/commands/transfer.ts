import { readFileSync, writeFileSync, chmodSync } from 'node:fs';
import { join } from 'node:path';
import {
  loadConfig,
  saveConfig,
  type Config,
  type DatabaseEntry,
  type ProjectEntry,
} from '../config.js';
import { getPassword, setPassword, deletePassword } from '../keychain.js';
import {
  encryptBundle,
  decryptBundle,
  suggestPassphrase,
  type BundlePayload,
} from '../exportbundle.js';
import { parseFlags } from '../args.js';

/** Read a password/passphrase without echoing it. Falls back to PSQL_CLI_PASSPHRASE env. */
function promptHidden(label: string): Promise<string> {
  if (process.env.PSQL_CLI_PASSPHRASE) {
    return Promise.resolve(process.env.PSQL_CLI_PASSPHRASE);
  }
  return new Promise((resolve) => {
    process.stdout.write(label);
    const stdin = process.stdin;
    const wasRaw = stdin.isRaw;
    if (stdin.isTTY) stdin.setRawMode(true);
    stdin.resume();
    let buf = '';
    const finish = (): void => {
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

/** Build the export payload from config + Keychain (skips slugs with no stored password). */
function buildPayload(config: Config): BundlePayload {
  const passwords: Record<string, string> = {};
  for (const slug of Object.keys(config.databases)) {
    const pw = getPassword(slug);
    if (pw !== undefined && pw !== '') passwords[slug] = pw;
  }
  return {
    projects: config.projects,
    databases: config.databases,
    passwords,
  };
}

export async function cmdExport(args: string[]): Promise<number> {
  const { flags } = parseFlags(args);
  const out =
    typeof flags.out === 'string' && flags.out
      ? flags.out
      : join(process.cwd(), 'psql-cli-export.json');

  const config = loadConfig();
  const payload = buildPayload(config);

  // Resolve the passphrase.
  let passphrase: string;
  let generated = false;
  if (typeof flags.passphrase === 'string' && flags.passphrase) {
    passphrase = flags.passphrase;
  } else if (flags.generate === true) {
    passphrase = suggestPassphrase();
    generated = true;
  } else {
    const first = await promptHidden('Passphrase to encrypt the export: ');
    if (!first) {
      console.error('A passphrase is required. Aborted.');
      return 1;
    }
    const second = await promptHidden('Re-enter passphrase: ');
    if (first !== second) {
      console.error('Passphrases did not match. Aborted.');
      return 1;
    }
    passphrase = first;
  }

  let bundle: string;
  try {
    bundle = encryptBundle(payload, passphrase);
  } catch (err) {
    console.error(`Failed to encrypt export: ${(err as Error).message}`);
    return 1;
  }

  try {
    writeFileSync(out, bundle, { mode: 0o600 });
    try {
      chmodSync(out, 0o600);
    } catch {
      /* best effort */
    }
  } catch (err) {
    console.error(`Failed to write ${out}: ${(err as Error).message}`);
    return 1;
  }

  const dbCount = Object.keys(config.databases).length;
  const pwCount = Object.keys(payload.passwords).length;

  if (generated) {
    console.log('');
    console.log('  Generated passphrase (SAVE THIS — you need it to import):');
    console.log('');
    console.log(`      ${passphrase}`);
    console.log('');
    console.log('  This passphrase is shown only once and is NOT stored anywhere.');
    console.log('');
  }

  console.log(`Exported ${dbCount} database(s) and ${pwCount} password(s) to:`);
  console.log(`  ${out}`);
  console.log('');
  console.log(
    'WARNING: this file contains your database credentials, encrypted. It is only',
  );
  console.log(
    'as safe as the passphrase. Keep both secret and delete the file when done.',
  );
  return 0;
}

interface SummaryRow {
  slug: string;
  project: string;
  host: string;
  database: string;
  mode: string;
  password: string;
}

function printSummary(payload: BundlePayload, dryRun: boolean): void {
  if (dryRun) {
    console.log(
      'DRY RUN — preview of what would be imported (nothing written, no passwords stored):',
    );
  }
  const databases = payload.databases as Record<string, DatabaseEntry>;
  const projects = payload.projects as Record<string, ProjectEntry>;
  const rows: SummaryRow[] = Object.values(databases).map((entry) => ({
    slug: entry.slug,
    project: projects[entry.project ?? '']?.name ?? entry.project ?? '',
    host: entry.host || '(none)',
    database: entry.database || '(none)',
    mode: entry.readOnly ? 'ro' : 'rw',
    password: payload.passwords[entry.slug] ? 'yes' : 'no',
  }));

  const headers = ['slug', 'project', 'host', 'database', 'ro/rw', 'pw'];
  const cols: Array<keyof SummaryRow> = [
    'slug',
    'project',
    'host',
    'database',
    'mode',
    'password',
  ];
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => String(r[cols[i]]).length), 1),
  );
  const line = (vals: string[]): string =>
    vals.map((v, i) => v.padEnd(widths[i])).join('  ');

  console.log(line(headers));
  console.log(line(widths.map((w) => '-'.repeat(w))));
  for (const r of rows) {
    console.log(line(cols.map((c) => String(r[c]))));
  }
}

/**
 * Apply a decrypted payload to the config (merge or replace) and, unless dryRun,
 * store passwords in the Keychain. Returns the number of databases imported.
 */
export function applyImport(
  payload: BundlePayload,
  opts: { replace: boolean; dryRun: boolean },
): number {
  const incomingDatabases = payload.databases as Record<string, DatabaseEntry>;
  const incomingProjects = payload.projects as Record<string, ProjectEntry>;

  let config: Config;
  if (opts.replace) {
    const existing = loadConfig();
    if (!opts.dryRun) {
      for (const slug of Object.keys(existing.databases)) {
        try {
          deletePassword(slug);
        } catch {
          /* best effort */
        }
      }
    }
    config = { version: 1, projects: {}, databases: {} };
  } else {
    config = loadConfig();
  }

  for (const [slug, p] of Object.entries(incomingProjects)) {
    config.projects[slug] = p;
  }
  for (const [slug, entry] of Object.entries(incomingDatabases)) {
    config.databases[slug] = entry;
  }

  const firstSlug = Object.keys(incomingDatabases)[0];
  if (!config.defaultDatabase && firstSlug) {
    config.defaultDatabase = firstSlug;
  }

  if (!opts.dryRun) {
    saveConfig(config);
    for (const [slug, pw] of Object.entries(payload.passwords ?? {})) {
      if (typeof pw === 'string' && pw) setPassword(slug, pw);
    }
  }

  return Object.keys(incomingDatabases).length;
}

export async function cmdImport(args: string[]): Promise<number> {
  const { positionals, flags } = parseFlags(args);
  const file = positionals[0];
  if (!file) {
    console.error('Usage: psql-cli import <file> [--passphrase <p>] [--replace] [--dry-run]');
    return 2;
  }
  const replace = flags.replace === true;
  const dryRun = flags['dry-run'] === true;

  let text: string;
  try {
    text = readFileSync(file, 'utf8');
  } catch (err) {
    console.error(`Failed to read ${file}: ${(err as Error).message}`);
    return 1;
  }

  let passphrase: string;
  if (typeof flags.passphrase === 'string' && flags.passphrase) {
    passphrase = flags.passphrase;
  } else {
    passphrase = await promptHidden('Passphrase to decrypt the export: ');
  }

  let payload: BundlePayload;
  try {
    payload = decryptBundle(text, passphrase);
  } catch (err) {
    console.error((err as Error).message);
    return 1;
  }

  let imported: number;
  try {
    imported = applyImport(payload, { replace, dryRun });
  } catch (err) {
    console.error(`Failed to import: ${(err as Error).message}`);
    return 1;
  }

  printSummary(payload, dryRun);
  console.log('');
  if (dryRun) {
    console.log(
      `PREVIEW: ${imported} database(s) would be imported (${replace ? 'replace' : 'merge'}). Nothing was written.`,
    );
    console.log('Re-run without --dry-run to apply.');
  } else {
    const pwCount = Object.keys(payload.passwords ?? {}).length;
    console.log(
      `Imported ${imported} database(s) (${replace ? 'replaced config' : 'merged'}); ${pwCount} password(s) restored to Keychain.`,
    );
    console.log('Review the imported connections in "psql-cli ui".');
  }
  return 0;
}
