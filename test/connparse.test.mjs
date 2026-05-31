// Tests for parseConnectionInput — parsing pasted Postgres connection blobs in
// many formats into structured fields.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseConnectionInput } from '../dist/connparse.js';

const NO_DB_WARNING = "no database detected — you'll need to choose one";
const NO_HOST_WARNING = 'no host detected';

describe('parseConnectionInput — URL', () => {
  it('full URL with encoded password, port, db, sslmode', () => {
    const r = parseConnectionInput(
      'postgres://user:p%40ss@db.example.com:5433/mydb?sslmode=require'
    );
    assert.equal(r.host, 'db.example.com');
    assert.equal(r.port, 5433);
    assert.equal(r.user, 'user');
    assert.equal(r.password, 'p@ss');
    assert.equal(r.database, 'mydb');
    assert.equal(r.sslmode, 'require');
    assert.deepEqual(r.warnings, []);
  });

  it('URL with no port/db -> host only + warnings', () => {
    const r = parseConnectionInput('postgresql://localhost/');
    assert.equal(r.host, 'localhost');
    assert.equal(r.port, undefined);
    assert.equal(r.database, undefined);
    assert.ok(r.warnings.includes(NO_DB_WARNING));
    assert.ok(!r.warnings.includes(NO_HOST_WARNING));
  });

  it('URL with IPv6 host strips brackets', () => {
    const r = parseConnectionInput('postgresql://[::1]:5432/db');
    assert.equal(r.host, '::1');
    assert.equal(r.port, 5432);
    assert.equal(r.database, 'db');
  });

  it('URL ssl=true -> sslmode require', () => {
    const r = parseConnectionInput('postgres://h:5432/d?ssl=true');
    assert.equal(r.sslmode, 'require');
  });
});

describe('parseConnectionInput — JDBC', () => {
  it('JDBC with userinfo', () => {
    const r = parseConnectionInput('jdbc:postgresql://h:5432/d');
    assert.equal(r.host, 'h');
    assert.equal(r.port, 5432);
    assert.equal(r.database, 'd');
  });

  it('JDBC carrying credentials in query params (supabase pooler style)', () => {
    const r = parseConnectionInput(
      'jdbc:postgresql://aws-0-us-east-1.pooler.supabase.com:5432/postgres?user=postgres.exampleref01&password=examplePw123'
    );
    assert.equal(r.host, 'aws-0-us-east-1.pooler.supabase.com');
    assert.equal(r.port, 5432);
    assert.equal(r.database, 'postgres');
    assert.equal(r.user, 'postgres.exampleref01');
    assert.equal(r.password, 'examplePw123');
  });

  it('JDBC ssl=true -> sslmode require', () => {
    const r = parseConnectionInput('jdbc:postgresql://h:5432/d?ssl=true');
    assert.equal(r.sslmode, 'require');
  });

  it('JDBC userinfo wins over query params when both present', () => {
    const r = parseConnectionInput(
      'jdbc:postgresql://uinfo:pinfo@h:5432/d?user=quser&password=qpass'
    );
    assert.equal(r.user, 'uinfo');
    assert.equal(r.password, 'pinfo');
  });

  it('JDBC no-host form -> database only', () => {
    const r = parseConnectionInput('jdbc:postgresql:mydb');
    assert.equal(r.host, undefined);
    assert.equal(r.database, 'mydb');
    assert.ok(r.warnings.includes(NO_HOST_WARNING));
  });
});

describe('parseConnectionInput — libpq keyword/value', () => {
  it('parses all fields with quoted spaced password', () => {
    const r = parseConnectionInput(
      "host=1.2.3.4 port=6543 dbname=app user=admin password='s p@ce'"
    );
    assert.equal(r.host, '1.2.3.4');
    assert.equal(r.port, 6543);
    assert.equal(r.database, 'app');
    assert.equal(r.user, 'admin');
    assert.equal(r.password, 's p@ce');
    assert.deepEqual(r.warnings, []);
  });

  it('unescapes \\\' and \\\\ inside single quotes', () => {
    const r = parseConnectionInput("password='a\\'b\\\\c'");
    assert.equal(r.password, "a'b\\c");
  });
});

describe('parseConnectionInput — colon/YAML lines', () => {
  it('parses key: value lines', () => {
    const r = parseConnectionInput(
      'host: 10.0.0.1\nport: 5432\nuser: u\npassword: p\ndatabase: d'
    );
    assert.equal(r.host, '10.0.0.1');
    assert.equal(r.port, 5432);
    assert.equal(r.user, 'u');
    assert.equal(r.password, 'p');
    assert.equal(r.database, 'd');
    assert.deepEqual(r.warnings, []);
  });

  it('handles mixed colon/equals separators and quoted values', () => {
    // All lines use the colon/YAML vocabulary (no key=value libpq tokens),
    // mixing ":" and "=" separators with quoted values.
    const r = parseConnectionInput('host: "myhost"\nport: 5432\ndb: "mydb"');
    assert.equal(r.host, 'myhost');
    assert.equal(r.port, 5432);
    assert.equal(r.database, 'mydb');
  });
});

describe('parseConnectionInput — JSON', () => {
  it('parses JSON with ssl boolean -> sslmode require', () => {
    const r = parseConnectionInput(
      '{"host":"h","port":5432,"user":"u","password":"p","database":"d","ssl":true}'
    );
    assert.equal(r.host, 'h');
    assert.equal(r.port, 5432);
    assert.equal(r.user, 'u');
    assert.equal(r.password, 'p');
    assert.equal(r.database, 'd');
    assert.equal(r.sslmode, 'require');
    assert.deepEqual(r.warnings, []);
  });

  it('maps alias keys case-insensitively and ignores unknown keys', () => {
    const r = parseConnectionInput(
      '{"Hostname":"h","DBNAME":"d","Username":"u","PWD":"p","foo":"bar"}'
    );
    assert.equal(r.host, 'h');
    assert.equal(r.database, 'd');
    assert.equal(r.user, 'u');
    assert.equal(r.password, 'p');
  });

  it('malformed JSON falls through to other branches without throwing', () => {
    const r = parseConnectionInput('{ host=1.2.3.4 port=5432 dbname=app');
    assert.equal(r.host, '1.2.3.4');
    assert.equal(r.port, 5432);
    assert.equal(r.database, 'app');
  });
});

describe('parseConnectionInput — loose / bare tokens', () => {
  it('4-line host/port/user/password, no db', () => {
    const r = parseConnectionInput('203.0.113.10\n5432\npostgres\nsenha');
    assert.equal(r.host, '203.0.113.10');
    assert.equal(r.port, 5432);
    assert.equal(r.user, 'postgres');
    assert.equal(r.password, 'senha');
    assert.equal(r.database, undefined);
    assert.ok(r.warnings.includes(NO_DB_WARNING));
  });

  it('space-separated with database', () => {
    const r = parseConnectionInput('myhost.internal 5432 admin secret appdb');
    assert.equal(r.host, 'myhost.internal');
    assert.equal(r.port, 5432);
    assert.equal(r.user, 'admin');
    assert.equal(r.password, 'secret');
    assert.equal(r.database, 'appdb');
    assert.deepEqual(r.warnings, []);
  });

  it('garbage input -> no host, warnings, no throw', () => {
    const r = parseConnectionInput('hello world');
    assert.equal(r.host, undefined);
    assert.ok(r.warnings.length > 0);
    assert.ok(r.warnings.includes(NO_HOST_WARNING));
    assert.ok(r.warnings.includes(NO_DB_WARNING));
  });
});

describe('parseConnectionInput — edge cases', () => {
  it('empty string -> warning, no throw', () => {
    const r = parseConnectionInput('');
    assert.deepEqual(r, { warnings: ['empty input'] });
  });

  it('whitespace-only string -> empty input warning', () => {
    const r = parseConnectionInput('   \n\t  ');
    assert.deepEqual(r, { warnings: ['empty input'] });
  });

  it('invalid port is dropped with a warning', () => {
    const r = parseConnectionInput('host=h port=99999 dbname=d');
    assert.equal(r.port, undefined);
    assert.ok(r.warnings.includes('ignored invalid port'));
  });
});
