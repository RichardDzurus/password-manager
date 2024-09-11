import { selectorFamily } from 'recoil';
import { entriesState } from '../atoms/entries'; // Import the atom storing encrypted data
import { decryptData, getDerivedPasswordKey } from '../../lib/crypto'; // Assume a function that decrypts data
import { EncryptedEntryData, DecryptedEntry } from '../../types/Decrypted';

// Define a selector family that takes an argument (e.g., the decryption key)
export const decryptedEntriesState = selectorFamily({
  key: 'decryptedEntriesState',
  get:
    (password: string) =>
    async ({ get }) => {
      const encryptedEntries = get(entriesState);
      if (!encryptedEntries)
        return {
          decryptedEntries: [],
          corruptedEntryIds: [],
          error: null,
        };

      try {
        const decryptedEntriesPromises: Promise<DecryptedEntry>[] = encryptedEntries.map(async (encryptedEntry) => {
          const passwordKey = await getDerivedPasswordKey(password, encryptedEntry.salt);
          const decryptedDataPointString = await decryptData(
            encryptedEntry.encrypted_data,
            encryptedEntry.iv,
            passwordKey,
          );
          const decryptedDataPoint = JSON.parse(decryptedDataPointString) as EncryptedEntryData;

          return {
            id: encryptedEntry.id,
            createdAt: encryptedEntry.created_at,
            updatedAt: encryptedEntry.updated_at,
            ...decryptedDataPoint,
          };
        });
        const decryptedEntriesPromisesSettled = await Promise.allSettled(decryptedEntriesPromises);
        const decryptedEntries = decryptedEntriesPromisesSettled
          .filter((value) => value.status === 'fulfilled')
          .map((value) => value.value);
        const successfulDecryptionIds = decryptedEntries.map((entry) => entry.id);
        const corruptedEntryIds = encryptedEntries.filter((entry) => !successfulDecryptionIds.includes(entry.id));
        return {
          decryptedEntries,
          corruptedEntryIds,
          error: null,
        };
      } catch (error) {
        console.error('Error decrypting data:', error);
        return {
          decryptedEntries: [],
          corruptedEntryIds: [],
          error,
        };
      }
    },
});
