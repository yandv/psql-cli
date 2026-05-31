import { readFileSync } from 'node:fs';
import {
  cmdQuery,
  cmdList,
  cmdSchema,
  cmdDescribe,
} from './commands/read.js';
import {
  cmdDefault,
  cmdDb,
  cmdProject,
  cmdTest,
  cmdImportLegacy,
} from './commands/manage.js';
import { cmdUi } from './commands/ui.js';
import { cmdImportDbeaver } from './commands/dbeaver.js';

const HELP = `psql-cli — query your PostgreSQL databases by slug (credentials stay in the Keychain)

Query:
  psql-cli query 'SELECT ...'                 run against the default database
  psql-cli query --db <slug> 'SELECT ...'     run against a specific database
  psql-cli list                               list databases (slug, read-only flag, description)
  psql-cli schema <slug>                      list tables/views
  psql-cli describe <slug> <table>            list a table's columns
  (SQL may also be piped on stdin. Output is CSV by default; add --table for aligned output.)

Manage:
  psql-cli default <slug>                     set the default database
  psql-cli ui                                 open the web UI to add/edit databases & projects
  psql-cli db add|edit|rm|show ...            manage databases from the CLI
  psql-cli project list|add|edit|rm ...       manage projects
  psql-cli test <slug>                        test a connection
  psql-cli import-legacy [path]               import connections from ~/.pgpass
  psql-cli import-dbeaver [--replace] [--dry-run]   import connections from DBeaver (with passwords)

Read-only databases reject every write statement (enforced both by a SQL guard and by a server-side read-only transaction).`;

function printVersion(): void {
  try {
    const pkgUrl = new URL('../package.json', import.meta.url);
    const pkg = JSON.parse(readFileSync(pkgUrl, 'utf8')) as { version?: string };
    console.log(pkg.version ?? 'unknown');
  } catch {
    console.log('unknown');
  }
}

async function main(): Promise<number> {
  const argv = process.argv.slice(2);
  const command = argv[0];
  const rest = argv.slice(1);

  switch (command) {
    case 'query':
      return cmdQuery(rest);
    case 'list':
    case 'ls':
      return cmdList(rest);
    case 'default':
      return cmdDefault(rest);
    case 'schema':
      return cmdSchema(rest);
    case 'describe':
    case 'desc':
      return cmdDescribe(rest);
    case 'db':
      return cmdDb(rest);
    case 'project':
    case 'proj':
      return cmdProject(rest);
    case 'test':
      return cmdTest(rest);
    case 'ui':
      return cmdUi(rest);
    case 'import-legacy':
      return cmdImportLegacy(rest);
    case 'import-dbeaver':
      return cmdImportDbeaver(rest);
    case 'help':
    case '--help':
    case '-h':
    case undefined:
      console.log(HELP);
      return 0;
    case 'version':
    case '--version':
    case '-v':
      printVersion();
      return 0;
    default:
      console.error(`Unknown command "${command}".\n`);
      console.error(HELP);
      return 2;
  }
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
