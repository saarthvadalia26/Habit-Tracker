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
 * Stores a derived key identifier in sessionStorage (cleared on browser close)
 */
async function getUserKey(): Promise<CryptoKey> {
  // Check if we have a key in this session
  let keyId = sessionStorage.getItem('_ht_key_id');

  if (!keyId) {
    // Generate a new key ID for this session
    keyId = crypto.randomUUID();
    sessionStorage.setItem('_ht_key_id', keyId);
  }

  // Use the key ID as the password (in production, use proper user session token)
  const salt = new Uint8Array(SALT_LENGTH);
  crypto.getRandomValues(salt);

  return deriveKey(keyId, salt);
}

/**
 * Encrypt data for localStorage
 * @param data - Data to encrypt (will be JSON stringified)
 * @returns Encrypted string or null if encryption fails
 */
export async function encryptData(data: unknown): Promise<string | null> {
  try {
    const encoder = new TextEncoder();
    const jsonString = JSON.stringify(data);
    const dataBuffer = encoder.encode(jsonString);

    const key = await getUserKey();
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: ENCRYPTION_ALGORITHM, iv },
      key,
      dataBuffer
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedBuffer), iv.length);

    // Convert to base64 for storage
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption failed:', error);
    return null;
  }
}

/**
 * Decrypt data from localStorage
 * @param encryptedString - Encrypted base64 string
 * @returns Decrypted data or null if decryption fails
 */
export async function decryptData<T = unknown>(encryptedString: string): Promise<T | null> {
  try {
    // Decode from base64
    const combined = Uint8Array.from(atob(encryptedString), c => c.charCodeAt(0));

    // Extract IV and encrypted data
    const iv = combined.slice(0, IV_LENGTH);
    const encryptedData = combined.slice(IV_LENGTH);

    const key = await getUserKey();

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
  sessionStorage.removeItem('_ht_key_id');
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
