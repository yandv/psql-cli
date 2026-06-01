import { randomBytes, scryptSync, createCipheriv, createDecipheriv } from 'node:crypto';

/**
 * Encrypted, portable export bundle for psql-cli.
 *
 * The bundle carries the full config (projects + databases) AND the stored
 * passwords, so it can be moved to another machine and imported as-is. Because
 * it contains secrets, it is ALWAYS encrypted with a passphrase:
 *
 *   key  = scrypt(passphrase, salt, 32 bytes)   — a deliberately slow KDF
 *   blob = AES-256-GCM(key, iv, plaintext)      — authenticated encryption
 *
 * salt + iv are random per export and stored in the (non-secret) header; the
 * GCM auth tag detects any tampering or a wrong passphrase. The only thing that
 * must stay secret is the passphrase. Brute-force cost is dominated by the
 * passphrase entropy multiplied by the scrypt work factor — with the generated
 * passphrase (see suggestPassphrase) it is computationally infeasible.
 */

export const BUNDLE_FORMAT = 'psql-cli-export';
export const BUNDLE_VERSION = 1;

// scrypt cost. N must be a power of two; 2^17 keeps per-guess cost high while
// staying well under a second on a normal machine.
const SCRYPT_N = 1 << 17;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LEN = 32; // AES-256
const SALT_LEN = 16;
const IV_LEN = 12; // GCM standard

export interface BundlePayload {
  projects: unknown;
  databases: unknown;
  /** slug -> password, pulled from the Keychain at export time. */
  passwords: Record<string, string>;
}

interface BundleFile {
  format: string;
  v: number;
  kdf: 'scrypt';
  n: number;
  r: number;
  p: number;
  salt: string; // base64
  iv: string; // base64
  tag: string; // base64
  ct: string; // base64
}

function deriveKey(passphrase: string, salt: Buffer, n: number, r: number, p: number): Buffer {
  // maxmem must be large enough for these parameters (≈128 * N * r bytes).
  return scryptSync(passphrase.normalize('NFKC'), salt, KEY_LEN, {
    N: n,
    r,
    p,
    maxmem: 256 * n * r,
  });
}

export function encryptBundle(payload: BundlePayload, passphrase: string): string {
  if (!passphrase) throw new Error('A passphrase is required to encrypt the export.');
  const salt = randomBytes(SALT_LEN);
  const iv = randomBytes(IV_LEN);
  const key = deriveKey(passphrase, salt, SCRYPT_N, SCRYPT_R, SCRYPT_P);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const plaintext = Buffer.from(JSON.stringify(payload), 'utf8');
  const ct = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  const file: BundleFile = {
    format: BUNDLE_FORMAT,
    v: BUNDLE_VERSION,
    kdf: 'scrypt',
    n: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
    salt: salt.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    ct: ct.toString('base64'),
  };
  return JSON.stringify(file, null, 2);
}

export function decryptBundle(bundleText: string, passphrase: string): BundlePayload {
  let file: BundleFile;
  try {
    file = JSON.parse(bundleText) as BundleFile;
  } catch {
    throw new Error('Not a valid export file (could not parse).');
  }
  if (file.format !== BUNDLE_FORMAT) {
    throw new Error('Not a psql-cli export file.');
  }
  if (file.v !== BUNDLE_VERSION) {
    throw new Error(`Unsupported export version ${file.v}.`);
  }
  // The KDF parameters come from the (untrusted) file. Reject absurd values so a
  // malicious bundle can't trigger a huge scrypt allocation (memory/CPU DoS) on
  // import. These bounds comfortably cover any bundle this tool produces.
  if (
    !Number.isInteger(file.n) || file.n < 2 || file.n > (1 << 20) || (file.n & (file.n - 1)) !== 0 ||
    !Number.isInteger(file.r) || file.r < 1 || file.r > 16 ||
    !Number.isInteger(file.p) || file.p < 1 || file.p > 4
  ) {
    throw new Error('Export file has invalid or unsafe KDF parameters.');
  }
  const salt = Buffer.from(file.salt, 'base64');
  const iv = Buffer.from(file.iv, 'base64');
  const tag = Buffer.from(file.tag, 'base64');
  const ct = Buffer.from(file.ct, 'base64');
  const key = deriveKey(passphrase, salt, file.n, file.r, file.p);
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  let plaintext: Buffer;
  try {
    plaintext = Buffer.concat([decipher.update(ct), decipher.final()]);
  } catch {
    // GCM auth failure: wrong passphrase or tampered file.
    throw new Error('Wrong passphrase or corrupted export file.');
  }
  try {
    return JSON.parse(plaintext.toString('utf8')) as BundlePayload;
  } catch {
    throw new Error('Decrypted data was not valid (corrupted export file).');
  }
}

/**
 * Suggest a strong, transcribable passphrase: 20 bytes of entropy (~160 bits)
 * rendered as base32-ish groups. Far beyond brute-force reach even with the
 * cheapest possible KDF; the scrypt factor is gravy.
 */
export function suggestPassphrase(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1 ambiguity
  const bytes = randomBytes(25);
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    if (i > 0 && i % 5 === 0) out += '-';
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out; // e.g. ABCDE-FGHJK-LMNPQ-RSTUV-WXYZ2
}
