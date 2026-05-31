import { readFileSync } from 'node:fs';
import { loadConfig, resolveDatabase, compareByOrder, type Config } from '../config.js';
import { runQuery, type OutputFormat } from '../db.js';

interface QueryFlags {
  db?: string;
  format: OutputFormat;
}

export function parseQueryFlags(args: string[]): { sql?: string; flags: QueryFlags; error?: string } {
  const flags: QueryFlags = { format: 'csv' };
  const positionals: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--db' || a === '-d') {
      flags.db = args[++i];
    } else if (a.startsWith('--db=')) {
      flags.db = a.slice(5);
    } else if (a === '--format' || a === '-f') {
      flags.format = (args[++i] as OutputFormat) ?? 'csv';
    } else if (a.startsWith('--format=')) {
      flags.format = a.slice(9) as OutputFormat;
    } else if (a === '--table') {
      flags.format = 'table';
    } else if (a === '--csv') {
      flags.format = 'csv';
    } else {
      positionals.push(a);
    }
  }
  if (flags.format !== 'csv' && flags.format !== 'table') {
    return { flags, error: `Unknown format "${flags.format}". Use csv or table.` };
  }
  return { sql: positionals.join(' '), flags };
}

function readStdin(): string {
  if (process.stdin.isTTY) return '';
  try {
    return readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

export function cmdQuery(args: string[]): number {
  const { sql: sqlArg, flags, error } = parseQueryFlags(args);
  if (error) {
    console.error(error);
    return 2;
  }
  let sql = sqlArg ?? '';
  if (!sql.trim()) sql = readStdin();
  if (!sql.trim()) {
    console.error("Empty SQL. Usage: psql-cli query [--db <slug>] '<SQL>'");
    return 2;
  }

  const config = loadConfig();
  const { db, error: resolveErr } = resolveDatabase(config, flags.db);
  if (resolveErr || !db) {
    console.error(resolveErr);
    return 2;
  }

  const result = runQuery(db, sql, { format: flags.format });
  if (result.stdout) process.stdout.write(result.stdout);
  if (!result.ok) {
    if (result.stderr) console.error(result.stderr);
    return result.blocked ? 3 : 1;
  }
  return 0;
}

export function cmdList(args: string[]): number {
  const json = args.includes('--json');
  const config = loadConfig();
  const slugs = Object.values(config.databases)
    .sort(compareByOrder)
    .map((d) => d.slug);

  if (json) {
    const out = slugs.map((s) => {
      const d = config.databases[s];
      return {
        slug: d.slug,
        project: d.project,
        database: d.database,
        readOnly: d.readOnly,
        description: d.description,
        default: config.defaultDatabase === d.slug,
      };
    });
    console.log(JSON.stringify(out, null, 2));
    return 0;
  }

  if (slugs.length === 0) {
    console.log('No databases configured yet. Add one with "psql-cli ui" or "psql-cli db add".');
    return 0;
  }

  console.log(`databases (default: ${config.defaultDatabase ?? 'none'})\n`);

  const byProject = new Map<string, string[]>();
  for (const slug of slugs) {
    const key = config.databases[slug].project ?? '(no project)';
    if (!byProject.has(key)) byProject.set(key, []);
    byProject.get(key)!.push(slug);
  }

  for (const [projectKey, dbSlugs] of [...byProject.entries()].sort()) {
    const proj = config.projects[projectKey];
    const label = proj ? `${proj.slug} — ${proj.name}` : projectKey;
    console.log(label);
    for (const slug of dbSlugs) {
      const d = config.databases[slug];
      const flags = [
        d.readOnly ? 'ro' : 'rw',
        config.defaultDatabase === slug ? 'default' : '',
      ]
        .filter(Boolean)
        .join(',');
      const desc = d.description ? `  ${d.description}` : '';
      console.log(`  ${slug.padEnd(24)} [${flags}]${desc}`);
    }
    console.log('');
  }
  console.log("query with: psql-cli query --db <slug> 'SELECT ...'");
  return 0;
}

function introspect(config: Config, slug: string | undefined, sql: string): number {
  const { db, error } = resolveDatabase(config, slug);
  if (error || !db) {
    console.error(error);
    return 2;
  }
  const res = runQuery(db, sql, { format: 'csv' });
  if (res.stdout) process.stdout.write(res.stdout);
  if (!res.ok) {
    if (res.stderr) console.error(res.stderr);
    return 1;
  }
  return 0;
}

/** psql-cli schema [<slug>] — list tables/views grouped by schema. */
export function cmdSchema(args: string[]): number {
  const slug = args.find((a) => !a.startsWith('-'));
  const config = loadConfig();
  const sql = `
    SELECT table_schema AS schema, table_name AS name,
           CASE table_type WHEN 'BASE TABLE' THEN 'table' WHEN 'VIEW' THEN 'view' ELSE lower(table_type) END AS type
    FROM information_schema.tables
    WHERE table_schema NOT IN ('pg_catalog','information_schema')
    ORDER BY table_schema, table_name`;
  return introspect(config, slug, sql);
}

/** psql-cli describe <slug> <table> — list columns of a table (schema.table or table). */
export function cmdDescribe(args: string[]): number {
  const positionals = args.filter((a) => !a.startsWith('-'));
  if (positionals.length < 1) {
    console.error('Usage: psql-cli describe <slug> <table>  (or, with a default db, psql-cli describe <table>)');
    return 2;
  }

  const config = loadConfig();
  let slug: string | undefined;
  let tableRef: string;
  if (positionals.length >= 2) {
    [slug, tableRef] = positionals;
  } else {
    tableRef = positionals[0];
  }

  let schema: string | undefined;
  let table = tableRef;
  if (tableRef.includes('.')) {
    [schema, table] = tableRef.split('.', 2);
  }
  const esc = (s: string) => s.replace(/'/g, "''");

  const sql = `
    SELECT column_name AS column, data_type AS type, is_nullable AS nullable, column_default AS default
    FROM information_schema.columns
    WHERE table_name = '${esc(table)}'
      ${schema ? `AND table_schema = '${esc(schema)}'` : ''}
    ORDER BY ordinal_position`;
  return introspect(config, slug, sql);
}
