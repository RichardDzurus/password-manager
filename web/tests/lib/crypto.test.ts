import { describe, expect, test } from 'vitest';
import { encryptData, decryptData, generateSalt, getDerivedPasswordKey } from '../../src/lib/crypto';

describe('crypto', () => {
  test('generate salt generates Uint8Array', () => {
    const salt = generateSalt();
    expect(salt).toBeInstanceOf(Uint8Array);
  });

  test('generateSalt produces unique salts', () => {
    const salt1 = generateSalt();
    const salt2 = generateSalt();
    expect(salt1).not.toEqual(salt2); // Salts should be unique
  });

  test('getDerivedPasswordKey returns a CryptoKey', async () => {
    const password = 'password';
    const salt = generateSalt();
    const key = await getDerivedPasswordKey(password, salt);
    expect(key).toBeInstanceOf(CryptoKey);
  });

  test('encryptData returns an object with iv and encryptedData in correct types', async () => {
    const password = 'password';
    const data = 'data';
    const salt = generateSalt();
    const key = await getDerivedPasswordKey(password, salt);
    const { iv, encryptedData } = await encryptData(data, key);
    expect(iv).toBeInstanceOf(Uint8Array);
    expect(encryptedData.constructor.name).toBe('ArrayBuffer');
    // Check if encryptedData has the byteLength property
    expect(encryptedData.byteLength).toBeGreaterThan(0);
  });

  test('after encrypt and decrypt the input message is the same', async () => {
    const password = 'password';
    const data = 'data';
    const salt = generateSalt();
    const key = await getDerivedPasswordKey(password, salt);
    const { iv, encryptedData } = await encryptData(data, key);
    const decryptedData = await decryptData(encryptedData, iv, key);
    expect(decryptedData).toEqual(data);
  });

  test('encrypting and decrypting an empty string works', async () => {
    const password = 'password';
    const data = '';
    const salt = generateSalt();
    const key = await getDerivedPasswordKey(password, salt);
    const { iv, encryptedData } = await encryptData(data, key);
    const decryptedData = await decryptData(encryptedData, iv, key);
    expect(decryptedData).toEqual(data);
  });

  test('encrypting and decrypting a large string works', async () => {
    const password = 'password';
    const data = 'a'.repeat(1_000_000); // Large string
    const salt = generateSalt();
    const key = await getDerivedPasswordKey(password, salt);
    const { iv, encryptedData } = await encryptData(data, key);
    const decryptedData = await decryptData(encryptedData, iv, key);
    expect(decryptedData).toEqual(data);
  });

  test('decrypting with an incorrect key throws an error', async () => {
    const password = 'password';
    const wrongPassword = 'wrongpassword';
    const data = 'data';
    const salt = generateSalt();

    // Correct key for encryption
    const correctKey = await getDerivedPasswordKey(password, salt);
    const { iv, encryptedData } = await encryptData(data, correctKey);

    // Wrong key for decryption
    const wrongKey = await getDerivedPasswordKey(wrongPassword, salt);

    await expect(decryptData(encryptedData, iv, wrongKey)).rejects.toThrow();
  });

  test('decrypting with an incorrect IV throws an error', async () => {
    const password = 'password';
    const data = 'data';
    const salt = generateSalt();
    const key = await getDerivedPasswordKey(password, salt);
    const { iv, encryptedData } = await encryptData(data, key);

    // Generate an incorrect IV
    const wrongIv = new Uint8Array(iv.length);
    window.crypto.getRandomValues(wrongIv); // New random IV

    await expect(decryptData(encryptedData, wrongIv, key)).rejects.toThrow();
  });

  test('encryptData throws an error for invalid data type', async () => {
    const password = 'password';
    // Invalid type (not a string)
    const invalidData = 12345 as unknown as string; // Force TypeScript to treat number as string
    const salt = generateSalt();
    const key = await getDerivedPasswordKey(password, salt);

    await expect(encryptData(invalidData, key)).rejects.toThrow(TypeError);
  });
});
