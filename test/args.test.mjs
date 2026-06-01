// Unit tests for the shared CLI flag parser (src/args.ts). No config/Keychain/DB.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { parseFlags } from '../dist/args.js';

describe('parseFlags', () => {
  it('parses positionals, --key value, and a bare boolean', () => {
    const { positionals, flags } = parseFlags([
      'add',
      'x',
      '--host',
      'h',
      '--port',
      '5432',
      '--readonly',
    ]);
    assert.deepEqual(positionals, ['add', 'x']);
    assert.deepEqual(flags, { host: 'h', port: '5432', readonly: true });
  });

  it('parses --key=value form', () => {
    const { positionals, flags } = parseFlags(['--slug=my-db']);
    assert.deepEqual(positionals, []);
    assert.deepEqual(flags, { slug: 'my-db' });
  });

  it('treats a bare flag at end of argv as boolean true', () => {
    const { flags } = parseFlags(['--dry-run']);
    assert.deepEqual(flags, { 'dry-run': true });
  });

  it('treats a flag followed by another flag as boolean', () => {
    const { flags } = parseFlags(['--a', '--b', 'v']);
    assert.deepEqual(flags, { a: true, b: 'v' });
  });

  it('handles positionals and flags interleaved', () => {
    const { positionals, flags } = parseFlags([
      'edit',
      '--host',
      'h',
      'slug',
      '--readonly',
    ]);
    assert.deepEqual(positionals, ['edit', 'slug']);
    assert.deepEqual(flags, { host: 'h', readonly: true });
  });
});
