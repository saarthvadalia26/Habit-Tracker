/**
 * Client-side storage encryption utilities
 * Uses Web Crypto API for encrypting sensitive data in localStorage
 */

const ENCRYPTION_ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for GCM
const SALT_LENGTH = 16;

/**
 * Derive encryption key from user session
 * In production, this should use a proper key derivation approach
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ENCRYPTION_ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Get or create a user-specific encryption key
 * Stores a derived key identifier in localStorage (persists across sessions)
 */
function getKeyId(): string {
  let keyId = localStorage.getItem('_ht_key_id');
  if (!keyId) {
    keyId = crypto.randomUUID();
    localStorage.setItem('_ht_key_id', keyId);
  }
  return keyId;
}

function getUserKey(salt: Uint8Array): Promise<CryptoKey> {
  const keyId = getKeyId();
  return deriveKey(keyId, salt);
}

/**
 * Encrypt data for localStorage
 * Format: base64( salt [16] || iv [12] || ciphertext )
 * The salt is stored in the payload so decryptData can derive the same key.
 * @param data - Data to encrypt (will be JSON stringified)
 * @returns Encrypted string or null if encryption fails
 */
export async function encryptData(data: unknown): Promise<string | null> {
  try {
    const encoder = new TextEncoder();
    const jsonString = JSON.stringify(data);
    const dataBuffer = encoder.encode(jsonString);

    const salt = new Uint8Array(SALT_LENGTH);
    crypto.getRandomValues(salt);
    const key = await getUserKey(salt);
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: ENCRYPTION_ALGORITHM, iv },
      key,
      dataBuffer
    );

    // Combine salt + IV + encrypted data
    const totalLength = salt.length + iv.length + encryptedBuffer.byteLength;
    const combined = new Uint8Array(totalLength);
    combined.set(salt, 0);
    combined.set(iv, SALT_LENGTH);
    combined.set(new Uint8Array(encryptedBuffer), SALT_LENGTH + iv.length);

    // Convert to base64 for storage
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption failed:', error);
    return null;
  }
}

/**
 * Decrypt data from localStorage
 * Expects format: base64( salt [16] || iv [12] || ciphertext )
 * @param encryptedString - Encrypted base64 string
 * @returns Decrypted data or null if decryption fails
 */
export async function decryptData<T = unknown>(encryptedString: string): Promise<T | null> {
  try {
    // Decode from base64
    const combined = Uint8Array.from(atob(encryptedString), c => c.charCodeAt(0));

    // Extract salt, IV, and encrypted data from the stored payload
    const salt = combined.slice(0, SALT_LENGTH);
    const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const encryptedData = combined.slice(SALT_LENGTH + IV_LENGTH);

    const key = await getUserKey(salt);

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: ENCRYPTION_ALGORITHM, iv },
      key,
      encryptedData
    );

    const decoder = new TextDecoder();
    const jsonString = decoder.decode(decryptedBuffer);

    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}

/**
 * Securely store data in localStorage with encryption
 * @param key - Storage key
 * @param data - Data to store
 */
export async function secureSetItem(key: string, data: unknown): Promise<void> {
  const encrypted = await encryptData(data);
  if (encrypted) {
    localStorage.setItem(key, encrypted);
  }
}

/**
 * Retrieve and decrypt data from localStorage
 * @param key - Storage key
 * @returns Decrypted data or null
 */
export async function secureGetItem<T = unknown>(key: string): Promise<T | null> {
  const encrypted = localStorage.getItem(key);
  if (!encrypted) return null;

  return decryptData<T>(encrypted);
}

/**
 * Clear sensitive data from storage
 * @param keys - Array of keys to clear, or undefined to clear all
 */
export function clearSecureStorage(keys?: string[]): void {
  if (keys) {
    keys.forEach(key => localStorage.removeItem(key));
  } else {
    localStorage.clear();
  }
  localStorage.removeItem('_ht_key_id');
}

/**
 * Check if Web Crypto API is available
 */
export function isEncryptionSupported(): boolean {
  return (
    typeof crypto !== 'undefined' &&
    typeof crypto.subtle !== 'undefined' &&
    typeof crypto.subtle.encrypt === 'function'
  );
}
