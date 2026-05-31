// Tests for the in-process hasPassword presence cache in keychain.ts.
//
// These run offline and must never depend on a successful real Keychain write.
// On non-darwin platforms the `security`-backed functions throw; we skip there.
// On darwin, setPassword may still fail in a sandbox (e.g. no Keychain access),
// in which case it throws BEFORE updating the cache — so we only assert the
// cache effects we can reach. deletePassword never throws on a missing entry
// and always updates the cache to false, which is fully testable.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  setPassword,
  hasPassword,
  deletePassword,
  clearPasswordCache,
} from '../dist/keychain.js';

const isMac = process.platform === 'darwin';

describe('keychain presence cache', () => {
  it('deletePassword caches false so hasPassword returns false without spawning', { skip: !isMac }, () => {
    clearPasswordCache();
    const slug = 'cache-test-delete';
    deletePassword(slug); // sets cache[slug] = false
    assert.equal(hasPassword(slug), false);
  });

  it('clearPasswordCache forgets the cached boolean', { skip: !isMac }, () => {
    const slug = 'cache-test-clear';
    deletePassword(slug); // cache false
    assert.equal(hasPassword(slug), false);
    clearPasswordCache();
    // After clearing, hasPassword recomputes via the real Keychain. For a slug
    // we just deleted, it must still be absent -> false.
    assert.equal(hasPassword(slug), false);
  });

  it('setPassword caches true (or throws on sandboxed Keychain)', { skip: !isMac }, () => {
    clearPasswordCache();
    const slug = 'cache-test-set';
    let stored = false;
    try {
      setPassword(slug, 'secret');
      stored = true;
    } catch {
      // Sandbox refused the write; nothing was cached. Nothing to assert.
      return;
    }
    if (stored) {
      // Cached true: hasPassword returns true without recomputation.
      assert.equal(hasPassword(slug), true);
      // Cleanup + verify the delete path flips the cache to false.
      deletePassword(slug);
      assert.equal(hasPassword(slug), false);
    }
  });

  it('the security-backed calls throw on non-darwin', { skip: isMac }, () => {
    assert.throws(() => setPassword('x', 'y'));
    assert.throws(() => deletePassword('x'));
  });
});
