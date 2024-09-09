const CIPHER_ALGORITHM = 'AES-GCM';
const HASH_ALGORITHM = 'SHA-256';
const KEY_TYPE = 'PBKDF2';
const KEY_LENGTH = 256;
const NUM_OF_ITERATIONS = 100000;

const getDerivedEncryptionKey = (passwordKey: CryptoKey, salt: Uint8Array): Promise<CryptoKey> =>
  window.crypto.subtle.deriveKey(
    {
      name: KEY_TYPE,
      salt,
      iterations: NUM_OF_ITERATIONS, // Number of iterations (higher = more secure but slower)
      hash: HASH_ALGORITHM, // Hashing algorithm
    },
    passwordKey, // The original password key
    {
      // The key algorithm and length
      name: CIPHER_ALGORITHM, // Encryption algorithm
      length: KEY_LENGTH, // Key length (128, 192, or 256 bits)
    },
    false, // Whether the key is extractable
    ['encrypt', 'decrypt'], // Key usages
  );

const getEncryptionKeyFromPassword = async (password: string): Promise<CryptoKey> => {
  const enc = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password), // Convert password into an array of bytes
    { name: KEY_TYPE }, // Specify the key type
    false, // Key is not extractable
    ['deriveKey'], // The key will be used to derive another key
  );
  return passwordKey;
};

export const generateSalt = (): Uint8Array => window.crypto.getRandomValues(new Uint8Array(16));

export const getDerivedPasswordKey = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
  const passwordKey = await getEncryptionKeyFromPassword(password);
  return getDerivedEncryptionKey(passwordKey, salt);
};

export const encryptData = async (
  data: string,
  encryptionKey: CryptoKey,
): Promise<{ iv: Uint8Array; encryptedData: ArrayBuffer }> => {
  if (typeof data !== 'string') {
    throw new TypeError('Data must be a string');
  }

  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV

  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: CIPHER_ALGORITHM,
      iv,
    },
    encryptionKey,
    encodedData,
  );

  return { iv, encryptedData };
};

export const decryptData = async (
  encryptedData: ArrayBuffer,
  iv: Uint8Array,
  encryptionKey: CryptoKey,
): Promise<string> => {
  const decryptedData = await window.crypto.subtle.decrypt(
    {
      name: CIPHER_ALGORITHM,
      iv,
    },
    encryptionKey,
    encryptedData,
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedData);
};
