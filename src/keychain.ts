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
  return getPassword(slug) !== undefined;
}

export function deletePassword(slug: string): void {
  assertMac();
  spawnSync('security', ['delete-generic-password', '-s', SERVICE, '-a', slug], {
    encoding: 'utf8',
  });
}
