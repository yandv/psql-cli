// Tests for the pure parsing helpers extracted for unit testing:
//   - parsePgpassLine (src/commands/manage.ts)
//   - parseQueryFlags (src/commands/read.ts)

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parsePgpassLine } from '../dist/commands/manage.js';
import { parseQueryFlags } from '../dist/commands/read.js';

describe('parsePgpassLine', () => {
  it('parses a plain line', () => {
    assert.deepEqual(parsePgpassLine('h:5432:db:user:pw'), {
      host: 'h',
      port: '5432',
      database: 'db',
      user: 'user',
      password: 'pw',
    });
  });

  it('handles an escaped colon in the password', () => {
    // "p\:w" is a single field whose value is "p:w".
    assert.deepEqual(parsePgpassLine('h:5432:db:user:p\\:w'), {
      host: 'h',
      port: '5432',
      database: 'db',
      user: 'user',
      password: 'p:w',
    });
  });

  it('returns null for fewer than 5 fields', () => {
    assert.equal(parsePgpassLine('h:5432:db:user'), null);
    assert.equal(parsePgpassLine('justhost'), null);
    assert.equal(parsePgpassLine(''), null);
  });

  it('documents extra-unescaped-colon behavior: only the 5th field is taken as password', () => {
    // pgpass uses backslash escaping for ':'. An UNescaped extra colon splits
    // into a 6th field, which the parser drops (it destructures only 5 fields).
    // So "p@ss:word" (unescaped) yields password "p@ss", not "p@ss:word".
    const r = parsePgpassLine('127.0.0.1:5432:mydb:postgres:p@ss:word');
    assert.deepEqual(r, {
      host: '127.0.0.1',
      port: '5432',
      database: 'mydb',
      user: 'postgres',
      password: 'p@ss',
    });
    // To keep the colon as part of the password it must be escaped:
    const escaped = parsePgpassLine('127.0.0.1:5432:mydb:postgres:p@ss\\:word');
    assert.equal(escaped.password, 'p@ss:word');
  });
});

describe('parseQueryFlags', () => {
  it('--db <value> then sql positional', () => {
    const r = parseQueryFlags(['--db', 'x', 'SELECT 1']);
    assert.equal(r.error, undefined);
    assert.equal(r.flags.db, 'x');
    assert.equal(r.sql, 'SELECT 1');
    assert.equal(r.flags.format, 'csv');
  });

  it('--db=value form', () => {
    const r = parseQueryFlags(['--db=x', 'SELECT 1']);
    assert.equal(r.flags.db, 'x');
    assert.equal(r.sql, 'SELECT 1');
  });

  it('--table sets table format', () => {
    const r = parseQueryFlags(['--table', 'SELECT 1']);
    assert.equal(r.flags.format, 'table');
    assert.equal(r.sql, 'SELECT 1');
  });

  it('-f table form', () => {
    const r = parseQueryFlags(['-f', 'table', 'q']);
    assert.equal(r.flags.format, 'table');
    assert.equal(r.sql, 'q');
  });

  it('positionals are joined with spaces', () => {
    const r = parseQueryFlags(['SELECT', '*', 'FROM', 't']);
    assert.equal(r.sql, 'SELECT * FROM t');
  });

  it('unknown format yields an error string', () => {
    const r = parseQueryFlags(['-f', 'json', 'q']);
    assert.equal(typeof r.error, 'string');
    assert.ok(r.error.length > 0);
  });
});
