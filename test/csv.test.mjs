import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv } from '../dist/csv.js';

describe('parseCsv', () => {
  it('parses simple rows', () => {
    const r = parseCsv('a,b,c\n1,2,3\n4,5,6\n');
    assert.deepEqual(r.columns, ['a', 'b', 'c']);
    assert.deepEqual(r.rows, [
      ['1', '2', '3'],
      ['4', '5', '6'],
    ]);
  });

  it('parses a quoted field containing a comma', () => {
    const r = parseCsv('a,b\n"x,y",z\n');
    assert.deepEqual(r.columns, ['a', 'b']);
    assert.deepEqual(r.rows, [['x,y', 'z']]);
  });

  it('parses an embedded doubled-quote', () => {
    const r = parseCsv('a\n"he said ""hi"""\n');
    assert.deepEqual(r.columns, ['a']);
    assert.deepEqual(r.rows, [['he said "hi"']]);
  });

  it('parses a quoted field with an embedded newline', () => {
    const r = parseCsv('a,b\n"line1\nline2",z\n');
    assert.deepEqual(r.rows, [['line1\nline2', 'z']]);
  });

  it('handles CRLF line endings', () => {
    const r = parseCsv('a,b\r\n1,2\r\n');
    assert.deepEqual(r.columns, ['a', 'b']);
    assert.deepEqual(r.rows, [['1', '2']]);
  });

  it('returns empty for empty input', () => {
    assert.deepEqual(parseCsv(''), { columns: [], rows: [] });
  });

  it('parses header-only with zero rows', () => {
    const r = parseCsv('a,b,c\n');
    assert.deepEqual(r.columns, ['a', 'b', 'c']);
    assert.deepEqual(r.rows, []);
  });

  it('a trailing newline does not create a phantom empty row', () => {
    const r = parseCsv('a\n1\n');
    assert.deepEqual(r.rows, [['1']]);
  });

  it('NULL (empty unquoted) and empty string (quoted "") both become ""', () => {
    // psql renders SQL NULL as an empty unquoted field, '' as "".
    const r = parseCsv('a,b\n,""\n');
    assert.deepEqual(r.rows, [['', '']]);
  });
});
