/**
 * Zero-Knowledge Client-Side Encrypted Backup & Restore Utility
 * Native Web Crypto API (window.crypto.subtle)
 * Standard: AES-GCM (256-bit key) with PBKDF2 key derivation
 * Parameters: 100,000 iterations, SHA-256, 16-byte random salt, 12-byte IV
 * Binary Layout:
 * [0..3]   Magic Bytes: "CATZ" (0x43, 0x41, 0x54, 0x5a)
 * [4]      Version Byte: 0x01
 * [5..20]  Salt: 16 bytes
 * [21..32] IV: 12 bytes
 * [33..]   AES-GCM Ciphertext + 128-bit Authentication Tag
 */

const MAGIC_BYTES = new Uint8Array([0x43, 0x41, 0x54, 0x5a]); // "CATZ"
const FORMAT_VERSION = 0x01;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const PBKDF2_ITERATIONS = 100000;

function getSubtleCrypto() {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    return window.crypto.subtle;
  }
  if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle) {
    return globalThis.crypto.subtle;
  }
  throw new Error('Web Crypto API (crypto.subtle) is not available in this environment.');
}

function getRandomValues(array) {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    return window.crypto.getRandomValues(array);
  }
  if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.getRandomValues) {
    return globalThis.crypto.getRandomValues(array);
  }
  throw new Error('crypto.getRandomValues is not available.');
}

/**
 * Derives a 256-bit AES-GCM key from a user passphrase and salt via PBKDF2.
 */
async function deriveEncryptionKey(passphrase, salt, usage = ['encrypt', 'decrypt']) {
  const subtle = getSubtleCrypto();
  const encoder = new TextEncoder();
  const passphraseBytes = encoder.encode(passphrase);

  const baseKey = await subtle.importKey(
    'raw',
    passphraseBytes,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return await subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    baseKey,
    {
      name: 'AES-GCM',
      length: 256
    },
    false,
    usage
  );
}

/**
 * Encrypts application state object into a binary blob.
 * @param {object} state - Application state object
 * @param {string} passphrase - User encryption passphrase
 * @returns {Promise<Blob>} Encrypted binary blob (.enc)
 */
export async function encryptBackupData(state, passphrase) {
  if (!passphrase || typeof passphrase !== 'string' || passphrase.trim().length === 0) {
    throw new Error('Encryption passphrase cannot be empty.');
  }

  const subtle = getSubtleCrypto();
  const encoder = new TextEncoder();
  const serialized = JSON.stringify(state);
  const plainBytes = encoder.encode(serialized);

  // Generate 16-byte random salt and 12-byte random IV
  const salt = getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = getRandomValues(new Uint8Array(IV_LENGTH));

  // Derive AES-256-GCM key
  const aesKey = await deriveEncryptionKey(passphrase, salt, ['encrypt']);

  // Encrypt payload
  const cipherBuffer = await subtle.encrypt(
    {
      name: 'AES-GCM',
      iv
    },
    aesKey,
    plainBytes
  );

  const cipherBytes = new Uint8Array(cipherBuffer);

  // Combine into binary blob: [MAGIC (4)] + [VERSION (1)] + [SALT (16)] + [IV (12)] + [CIPHERTEXT]
  const totalLength = MAGIC_BYTES.length + 1 + SALT_LENGTH + IV_LENGTH + cipherBytes.length;
  const combined = new Uint8Array(totalLength);

  let offset = 0;
  combined.set(MAGIC_BYTES, offset);
  offset += MAGIC_BYTES.length;

  combined[offset] = FORMAT_VERSION;
  offset += 1;

  combined.set(salt, offset);
  offset += SALT_LENGTH;

  combined.set(iv, offset);
  offset += IV_LENGTH;

  combined.set(cipherBytes, offset);

  return new Blob([combined], { type: 'application/octet-stream' });
}

/**
 * Decrypts binary array buffer back into raw JSON string.
 * @param {ArrayBuffer} buffer - Raw file bytes
 * @param {string} passphrase - User encryption passphrase
 * @returns {Promise<string>} Decrypted JSON text
 */
export async function decryptBackupData(buffer, passphrase) {
  if (!passphrase || typeof passphrase !== 'string' || passphrase.trim().length === 0) {
    throw new Error('Passphrase cannot be empty.');
  }

  const bytes = new Uint8Array(buffer);
  const minHeaderLength = MAGIC_BYTES.length + 1 + SALT_LENGTH + IV_LENGTH;

  if (bytes.length < minHeaderLength + 16) {
    throw new Error('Invalid or truncated backup file (file too short).');
  }

  // Validate Magic Bytes "CATZ"
  for (let i = 0; i < MAGIC_BYTES.length; i++) {
    if (bytes[i] !== MAGIC_BYTES[i]) {
      throw new Error('Invalid file format: Not a recognized CATALyze encrypted backup.');
    }
  }

  const version = bytes[MAGIC_BYTES.length];
  if (version !== FORMAT_VERSION) {
    throw new Error(`Unsupported backup format version: ${version}.`);
  }

  let offset = MAGIC_BYTES.length + 1;
  const salt = bytes.slice(offset, offset + SALT_LENGTH);
  offset += SALT_LENGTH;

  const iv = bytes.slice(offset, offset + IV_LENGTH);
  offset += IV_LENGTH;

  const ciphertext = bytes.slice(offset);

  const subtle = getSubtleCrypto();
  const aesKey = await deriveEncryptionKey(passphrase, salt, ['decrypt']);

  let decryptedBuffer;
  try {
    decryptedBuffer = await subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      aesKey,
      ciphertext
    );
  } catch (_err) {
    throw new Error('Decryption failed: Incorrect passphrase or corrupted backup file.');
  }

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

/**
 * Triggers native browser file download for encrypted blob.
 */
export function downloadEncryptedBlob(blob, customFilename = null) {
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = customFilename || `catalyze-backup-${dateStr}.enc`;

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
