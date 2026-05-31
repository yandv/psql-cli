// Tests for the security-critical statement-level read-only guard.
//
// NOTE: these assert LAYER 1 only — the fast regex guard in sqlguard.ts that
// blocks obviously-destructive input before it reaches Postgres. Layer 2 (the
// authoritative one: `default_transaction_read_only = on` forced on the
// session) can only be exercised against a real server, so it is
// integration-only and not covered here.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { checkReadOnly } from '../dist/sqlguard.js';

describe('checkReadOnly — allowed statements', () => {
  const allowed = [
    'SELECT 1',
    'select * from t',
    '   \n\t  SELECT 1',
    'select 1',
    'SELECT 1',
    'SeLeCt 1',
    'WITH x AS (SELECT 1) SELECT * FROM x',
    'EXPLAIN SELECT 1',
    'SHOW search_path',
    'TABLE foo',
    'VALUES (1)',
  ];
  for (const sql of allowed) {
    it(`allows: ${JSON.stringify(sql)}`, () => {
      const r = checkReadOnly(sql);
      assert.equal(r.ok, true, `expected ok for ${JSON.stringify(sql)} (reason: ${r.reason})`);
    });
  }
});

describe('checkReadOnly — blocked statements', () => {
  const blocked = [
    'INSERT INTO t VALUES (1)',
    'UPDATE t SET x = 1',
    'DELETE FROM t',
    'DROP TABLE x',
    'ALTER TABLE t ADD COLUMN c int',
    'TRUNCATE x',
    'CREATE TABLE t (id int)',
    'GRANT ALL ON t TO u',
    'COPY t FROM stdin',
    'VACUUM',
    'CALL f()',
    'DO $$ BEGIN END $$',
    'MERGE INTO t USING s ON (t.id = s.id)',
    'REFRESH MATERIALIZED VIEW mv',
    '',
    '   \n\t  ',
  ];
  for (const sql of blocked) {
    it(`blocks: ${JSON.stringify(sql)}`, () => {
      const r = checkReadOnly(sql);
      assert.equal(r.ok, false, `expected blocked for ${JSON.stringify(sql)}`);
      assert.equal(typeof r.reason, 'string');
      assert.ok(r.reason.length > 0, 'reason must be a non-empty string');
    });
  }
});

describe('checkReadOnly — tricky blocked statements', () => {
  const tricky = [
    'EXPLAIN ANALYZE SELECT * FROM t', // ANALYZE executes the query
    'SELECT 1; DROP TABLE x', // write keyword present in chained stmt
    'WITH x AS (INSERT INTO t VALUES (1) RETURNING *) SELECT * FROM x', // CTE write
    'WITH x AS (UPDATE t SET a=1 RETURNING *) SELECT * FROM x',
    'WITH x AS (DELETE FROM t RETURNING *) SELECT * FROM x',
    'SELECT 1; UPDATE t SET x = 1',
  ];
  for (const sql of tricky) {
    it(`blocks tricky: ${JSON.stringify(sql)}`, () => {
      const r = checkReadOnly(sql);
      assert.equal(r.ok, false, `expected blocked for ${JSON.stringify(sql)}`);
      assert.equal(typeof r.reason, 'string');
      assert.ok(r.reason.length > 0, 'reason must be a non-empty string');
    });
  }
});
