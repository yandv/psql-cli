import { spawnSync } from 'node:child_process';

/**
 * macOS Keychain-backed secret storage.
 *
 * Passwords are stored as generic passwords under a fixed service name with the
 * database slug as the account. They never touch the on-disk config and are
 * never passed on a command line that the LLM (or `ps`) could observe — the CLI
 * reads them here and hands them to psql via the PGPASSWORD environment variable
 * of the child process only.
 */

const SERVICE = 'psql-cli';

export class KeychainError extends Error {}

/**
 * In-process cache of the boolean "does this slug have a stored password?".
 * Each `hasPassword` call otherwise spawns the `security` binary, which is slow
 * when /api/state checks every database. We cache ONLY the boolean — never the
 * password value, which stays uncached via getPassword.
 */
const presenceCache = new Map<string, boolean>();

/** Clear the in-process hasPassword cache (used by tests). */
export function clearPasswordCache(): void {
  presenceCache.clear();
}

function assertMac(): void {
  if (process.platform !== 'darwin') {
    throw new KeychainError(
      'Keychain storage requires macOS. (A cross-platform encrypted backend is planned.)',
    );
  }
}

export function setPassword(slug: string, password: string): void {
  assertMac();
  // -U updates if it already exists.
  const res = spawnSync(
    'security',
    ['add-generic-password', '-U', '-s', SERVICE, '-a', slug, '-w', password],
    { encoding: 'utf8' },
  );
  if (res.status !== 0) {
    throw new KeychainError(
      `Failed to store password in Keychain: ${res.stderr?.trim() || res.error?.message || 'unknown error'}`,
    );
  }
  presenceCache.set(slug, true);
}

export function getPassword(slug: string): string | undefined {
  assertMac();
  const res = spawnSync(
    'security',
    ['find-generic-password', '-s', SERVICE, '-a', slug, '-w'],
    { encoding: 'utf8' },
  );
  if (res.status !== 0) return undefined;
  // `-w` prints just the password; trim the trailing newline.
  return res.stdout.replace(/\n$/, '');
}

export function hasPassword(slug: string): boolean {
  const cached = presenceCache.get(slug);
  if (cached !== undefined) return cached;
  const present = getPassword(slug) !== undefined;
  presenceCache.set(slug, present);
  return present;
}

export function deletePassword(slug: string): void {
  assertMac();
  spawnSync('security', ['delete-generic-password', '-s', SERVICE, '-a', slug], {
    encoding: 'utf8',
  });
  presenceCache.set(slug, false);
}
