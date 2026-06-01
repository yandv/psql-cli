// Tests for the DBeaver importer (src/commands/dbeaver.ts).
//
// REACHABILITY NOTE: src/commands/dbeaver.ts exports ONLY `cmdImportDbeaver`.
// The internal helpers `decryptCreds` and `slugify` are module-private and there
// is no `parsePgpassLine` in this module at all, so the AES-128-CBC decryptor
// and the slugifier cannot be unit-tested directly. We therefore:
//   (a) test the reachable command surface: a missing workspace returns
//       non-zero without throwing, and a --dry-run over an empty (but existing)
//       workspace returns 0 and writes nothing; and
//   (b) construct a known AES-128-CBC credentials blob with the well-known
//       DBeaver key to document the format, but SKIP asserting a decrypt because
//       the decryptor is not exported.
//
// HOME is set to a fresh temp dir BEFORE importing the module so config paths
// are computed against the temp dir; no Keychain write occurs (dry-run / no
// connections paths never call setPassword).

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createCipheriv, randomBytes } from 'node:crypto';

let tmpHome;
let cmdImportDbeaver;

before(async () => {
  tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'psqlcli-dbeaver-'));
  process.env.HOME = tmpHome;
  ({ cmdImportDbeaver } = await import('../dist/commands/dbeaver.js'));
});

after(() => {
  fs.rmSync(tmpHome, { recursive: true, force: true });
});

describe('cmdImportDbeaver (reachable command surface)', () => {
  it('returns non-zero when the workspace does not exist (no throw)', async () => {
    const missing = path.join(tmpHome, 'does-not-exist-workspace');
    const code = await cmdImportDbeaver(['--workspace', missing]);
    assert.notEqual(code, 0);
  });

  it('returns 0 on an existing but empty workspace (nothing to import)', async () => {
    const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'psqlcli-dbeaver-ws-'));
    try {
      // --dry-run too, to be doubly sure nothing is written.
      const code = await cmdImportDbeaver(['--workspace', empty, '--dry-run']);
      assert.equal(code, 0);
    } finally {
      fs.rmSync(empty, { recursive: true, force: true });
    }
  });
});

describe('DBeaver credentials blob format (documentation only)', () => {
  // The code uses AES-128-CBC with the well-known key below, IV = first 16
  // bytes, PKCS7 padding, then parses the embedded JSON object. We can build a
  // valid blob, but cannot assert a decrypt because decryptCreds is not exported.
  const DBEAVER_KEY = Buffer.from('babb4a9f774ab853c96c2d653dfe544a', 'hex');

  it('can construct a blob with the known key (decryptor not exported -> skip assert)', () => {
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-128-cbc', DBEAVER_KEY, iv); // PKCS7 by default
    const plaintext = JSON.stringify({
      'conn-1': { '#connection': { user: 'alice', password: 'pw' } },
    });
    const blob = Buffer.concat([iv, cipher.update(plaintext, 'utf8'), cipher.final()]);
    // Sanity on the format we know the code expects (16-byte IV prefix).
    assert.ok(blob.length > 16);
    assert.equal(blob.subarray(0, 16).length, 16);
    // decryptCreds is not exported, so we cannot assert it parses this blob.
  });
});
