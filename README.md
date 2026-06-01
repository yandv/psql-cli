# psql-cli

**An LLM-friendly, slug-based gateway to your PostgreSQL databases.**

Register each database once — through a local web UI or the CLI — and it gets a short slug and a read-only flag. After that, an LLM (or you) runs queries by slug:

```bash
psql-cli query --db analytics 'SELECT count(*) FROM users'
```

The agent never sees, handles, or constructs credentials. Passwords live in the macOS Keychain, are injected into `psql` through the environment (never on the command line or in output), and read-only databases reject every write statement at two independent layers.

## Why

Managing per-database connection strings by hand is error-prone, and pasting them into prompts leaks secrets to whatever LLM you're working with. `psql-cli` fixes both: secrets stay in the Keychain, and the only thing the model ever needs is a slug.

## Features

- **Slug-based access** — databases are addressed by a short, stable slug, never a connection string.
- **Credentials in the Keychain** — passwords are stored in the macOS Keychain and are never written to disk, never printed, and never shown to the LLM.
- **Per-database read-only enforcement (two layers)** — a SQL statement guard plus a server-side `default_transaction_read_only` transaction.
- **Web UI for CRUD** — a local browser UI to add, edit, test, and remove databases and projects.
- **Projects** — group related databases for cleaner listings.
- **LLM-friendly compact output** — CSV by default to keep token usage low; aligned table output on request.
- **Zero runtime dependencies** — pure Node.js and the `psql` client; the only devDependencies are TypeScript and `@types/node`.

## Requirements

- **Node.js >= 18**
- **The `psql` client** must be on your `PATH`. On macOS:
  ```bash
  brew install libpq && brew link --force libpq
  ```
- **macOS only (for now).** Credential storage uses the macOS Keychain via the `security` command. On any non-macOS platform the Keychain layer throws; a cross-platform encrypted backend is planned but not yet available.

## Install / Build

```bash
# install devDependencies
pnpm install      # or: npm install

# compile TypeScript to dist/
npm run build
```

Then link the `psql-cli` binary globally. Either:

```bash
# option A: npm link
npm link
```

or create the symlink manually (may require `sudo`):

```bash
ln -sf "$(pwd)/bin/psql-cli" /usr/local/bin/psql-cli
```

## Quick start

Add a database through the web UI:

```bash
psql-cli ui
```

This starts a local server bound to `127.0.0.1`, prints a URL containing a one-time token, and lets you add databases, set a description and read-only flag, and test the connection — all without ever putting a password on a command line.

On macOS you can launch the UI without a terminal:

```bash
psql-cli install-app
```

This creates `psql-cli.app` in `~/Applications`, so you can open it from Spotlight (⌘Space), Raycast, or Alfred. Launching it starts the UI and opens your browser; it's single-instance, so re-opening just focuses the existing tab.

Or add one straight from the CLI (you'll be prompted for the password, which is not echoed):

```bash
psql-cli db add \
  --slug analytics \
  --host db.internal \
  --user readonly \
  --database analytics \
  --readonly \
  --desc "Production analytics replica (read-only)"
```

Set a default so you can omit `--db`:

```bash
psql-cli default analytics
```

Run a query:

```bash
psql-cli query 'SELECT now()'
psql-cli query --db analytics 'SELECT count(*) FROM events WHERE day = current_date'
echo 'SELECT 1' | psql-cli query --db analytics      # SQL on stdin
psql-cli query --db analytics --table 'SELECT * FROM users LIMIT 5'   # aligned output
```

## Usage

The full command surface (mirrors `psql-cli help`):

### Query

| Command | Description |
| --- | --- |
| `psql-cli query 'SELECT ...'` | Run against the default database. |
| `psql-cli query --db <slug> 'SELECT ...'` | Run against a specific database. |
| `psql-cli list` (alias `ls`) | List databases (slug, read-only flag, description). |
| `psql-cli schema <slug>` | List tables/views, grouped by schema. |
| `psql-cli describe <slug> <table>` (alias `desc`) | List a table's columns. |

SQL may also be piped on **stdin**. Output is **CSV by default**; add `--table` for aligned output.

Query flags: `--db <slug>` / `-d <slug>`, `--format csv|table` / `-f`, `--table`, `--csv`. `list` also accepts `--json`. `describe` accepts `schema.table` or `table`, and with a default database set you may run `psql-cli describe <table>`.

### Manage

| Command | Description |
| --- | --- |
| `psql-cli default <slug>` | Set (or, with no slug, print) the default database. |
| `psql-cli ui` | Open the web UI to add/edit databases & projects. |
| `psql-cli db add\|edit\|rm\|show ...` | Manage databases from the CLI. |
| `psql-cli project list\|add\|edit\|rm ...` | Manage projects. |
| `psql-cli test <slug>` | Test a connection. |
| `psql-cli import-legacy [path]` | Import connections from `~/.pgpass`. |
| `psql-cli help` / `--help` / `-h` | Print help. |
| `psql-cli version` / `--version` / `-v` | Print version. |

**`db add` / `db edit` flags:** `--slug`, `--host`, `--user`, `--database` (alias `--db`), `--port` (default 5432), `--readonly` (or `--rw` for read-write; new databases default to read-only), `--project`, `--desc` (alias `--description`), `--sslmode`, `--password` (discouraged), `--set-password` (on edit, force a new password prompt). Passwords may also be supplied via the `PSQL_CLI_PASSWORD` environment variable; otherwise you are prompted without echo. On `edit`, leaving the prompt blank keeps the existing password. `db show` prints the entry as JSON with the password redacted.

**`project add` / `project edit` flags:** `--slug`, `--name`, `--desc` (alias `--description`). A project cannot be removed while databases are still attached to it.

**`import-legacy`** reads `~/.pgpass` (or a path you pass), creates a read-only entry per line with an auto-generated `db-host` slug, and moves each password into the Keychain. Review/rename the slugs afterward in the UI.

### Exit codes

The `query` command (`cmdQuery`) uses:

| Code | Meaning |
| --- | --- |
| `0` | Success. |
| `1` | Query/runtime error (e.g. SQL error, connection failure, timeout). |
| `2` | Usage error (empty SQL, unknown database, bad flag). |
| `3` | A write was blocked by the read-only SQL guard. |

Most management subcommands return `0` on success and `2` on usage errors; `test` returns `1` if the connection fails. An unknown top-level command returns `2`.

## For LLMs / agents

The intended workflow keeps the model away from credentials entirely:

1. **Discover** — call `psql-cli list` to see every slug, its read-only flag (`ro`/`rw`), and its description. Use `psql-cli list --json` for a machine-readable form.
2. **Learn the structure cheaply** — call `psql-cli schema <slug>` to list tables/views, then `psql-cli describe <slug> <table>` to list a table's columns, types, nullability, and defaults. Both return compact CSV.
3. **Query** — call `psql-cli query --db <slug> 'SELECT ...'`.

The agent never needs a host, user, port, or password — only the slug. Output is **CSV by default** to minimize tokens; pass `--table` only when a human wants aligned output. Against a read-only database, any write is rejected before it reaches the server (exit code `3`), so the model can probe freely without risk of mutation.

## Security model

- **`config.json` holds no passwords.** It stores only connection metadata (host, port, user, database, slug, flags, descriptions). The config file is written mode `600` and its directory mode `700`.
- **Passwords live in the macOS Keychain** as generic passwords under the service name `psql-cli`, with the database slug as the account.
- **The password is injected only via the `PGPASSWORD` environment variable of the `psql` child process.** It is never placed in `argv` (so it is invisible to `ps`, shell history, and anything the LLM constructs) and is never printed. `db show` and the UI's API redact it.
- **Read-only is enforced at two layers.** Layer 1 is a SQL guard that only permits statements starting with `SELECT` / `WITH` / `EXPLAIN` / `SHOW` / `TABLE` / `VALUES`, rejects a list of write keywords, and blocks `EXPLAIN ANALYZE` (which would execute the query). Layer 2 — the authoritative one — forces `default_transaction_read_only = on` on the Postgres session itself, so even a statement that slipped past the guard cannot write.
- **Queries are time-bounded:** a Postgres-side `statement_timeout` (default 12s) and `lock_timeout` (2s), plus a hard process timeout (default 15s) and a connect timeout (8s).
- **The web UI is locked down.** It binds to `127.0.0.1` only; every `/api/*` call requires the per-launch random token (sent as the `x-psql-cli-token` header); and a `Host`-header check (only `127.0.0.1:<port>` or `localhost:<port>`) blocks DNS-rebinding attacks. The API never returns passwords — only a `hasPassword` boolean.

**Threat boundary (be honest about it):** this protects against *accidental* credential exposure and *accidental or guarded* writes. It is **not** a sandbox against a fully adversarial local process — anything already able to read your Keychain or run arbitrary `security` commands as your user is outside the boundary.

## Configuration

Config lives at `~/.config/psql-cli/config.json` (directory mode `700`, file mode `600`). It contains **no passwords**. Example shape:

```json
{
  "version": 1,
  "defaultDatabase": "analytics",
  "projects": {
    "acme": { "slug": "acme", "name": "Acme Corp", "description": "Production stack" }
  },
  "databases": {
    "analytics": {
      "slug": "analytics",
      "project": "acme",
      "host": "db.internal",
      "port": 5432,
      "user": "readonly",
      "database": "analytics",
      "readOnly": true,
      "description": "Production analytics replica (read-only)",
      "sslmode": "require"
    }
  }
}
```

Slugs must be lowercase, start with a letter or number, contain only `a-z`, `0-9`, and `-`, and be at most 63 characters.

## Development

```bash
npm test       # builds, then runs the node:test suite
npm run dev    # tsc --watch
```

The test suite uses Node's built-in test runner (`node --test`) with zero dependencies. It covers the read-only SQL guard matrix, config load/save and slug validation, the CLI flag/`.pgpass` parsers, and the HTTP API (token gate, Host-header guard, CRUD, password redaction).

Project layout:

```
bin/psql-cli          launcher shim
src/cli.ts            command dispatch + help text
src/config.ts         config store, slug rules, types
src/keychain.ts       macOS Keychain storage
src/sqlguard.ts       read-only SQL guard (layer 1)
src/db.ts             psql runner, env injection, read-only session (layer 2)
src/ui/server.ts      local web UI server + token-gated API
src/commands/         read.ts (query/list/schema/describe), manage.ts, ui.ts
test/                 node:test suite
```

## License

MIT — see [LICENSE](LICENSE).
