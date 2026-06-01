// Direct unit tests for the encrypted export bundle (src/exportbundle.ts).
// No HOME/config dependency, no Keychain, no DB. Pure crypto round-trips and
// the untrusted-KDF-parameter clamp.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  encryptBundle,
  decryptBundle,
  suggestPassphrase,
} from '../dist/exportbundle.js';

const PAYLOAD = {
  projects: { a: { slug: 'a', name: 'A' } },
  databases: {
    x: { slug: 'x', host: 'h', port: 5432, user: 'u', database: 'd', readOnly: true },
  },
  passwords: { x: 's3cr3t' },
};

const PASS = 'correct-horse-battery-staple';

describe('encryptBundle / decryptBundle', () => {
  it('round-trips a payload', () => {
    const bundle = encryptBundle(PAYLOAD, PASS);
    const back = decryptBundle(bundle, PASS);
    assert.deepEqual(back, PAYLOAD);
  });

  it('rejects a wrong passphrase', () => {
    const bundle = encryptBundle(PAYLOAD, PASS);
    assert.throws(() => decryptBundle(bundle, 'wrong'), /Wrong passphrase or corrupted/);
  });

  it('detects tampering of the ciphertext', () => {
    const bundle = encryptBundle(PAYLOAD, PASS);
    const obj = JSON.parse(bundle);
    // Flip a single base64 char in the ciphertext.
    const ct = obj.ct;
    const i = 5;
    const c = ct[i];
    const flipped = c === 'A' ? 'B' : 'A';
    obj.ct = ct.slice(0, i) + flipped + ct.slice(i + 1);
    assert.throws(() => decryptBundle(JSON.stringify(obj), PASS));
  });

  it('rejects a non-psql-cli format', () => {
    assert.throws(
      () => decryptBundle('{"format":"x","v":1}', 'p'),
      /Not a psql-cli export file/,
    );
  });

  it('rejects an unsupported version', () => {
    const obj = JSON.parse(encryptBundle(PAYLOAD, PASS));
    obj.v = 2;
    assert.throws(() => decryptBundle(JSON.stringify(obj), PASS), /Unsupported export version/);
  });

  it('clamps an absurd scrypt N (does not run scrypt)', () => {
    const obj = JSON.parse(encryptBundle(PAYLOAD, PASS));
    obj.n = 1 << 25; // way over the cap
    assert.throws(
      () => decryptBundle(JSON.stringify(obj), PASS),
      /invalid or unsafe KDF parameters/,
    );
  });

  it('rejects an N that is not a power of two', () => {
    const obj = JSON.parse(encryptBundle(PAYLOAD, PASS));
    obj.n = 1000;
    assert.throws(
      () => decryptBundle(JSON.stringify(obj), PASS),
      /invalid or unsafe KDF parameters/,
    );
  });

  it('rejects an out-of-range r', () => {
    const obj = JSON.parse(encryptBundle(PAYLOAD, PASS));
    obj.r = 99;
    assert.throws(
      () => decryptBundle(JSON.stringify(obj), PASS),
      /invalid or unsafe KDF parameters/,
    );
  });

  it('requires a passphrase to encrypt', () => {
    assert.throws(() => encryptBundle(PAYLOAD, ''));
  });
});

describe('suggestPassphrase', () => {
  it('matches the expected grouped format', () => {
    assert.match(suggestPassphrase(), /^[A-HJ-NP-Z2-9]{5}(-[A-HJ-NP-Z2-9]{5}){4}$/);
  });

  it('produces different values on successive calls', () => {
    assert.notEqual(suggestPassphrase(), suggestPassphrase());
  });
});
