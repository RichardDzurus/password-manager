import { selectorFamily } from 'recoil';
import { entriesState } from '../atoms/entries'; // Import the atom storing encrypted data
import { decryptData, getDerivedPasswordKey } from '../../lib/crypto'; // Assume a function that decrypts data
import {
  EncryptedEntryData,
  DecryptedEntry,
  LoginTypeData,
  NoteTypeData,
  PasswordTypeData,
} from '../../types/Decrypted';
import { stringToArrayBuffer, stringToUintArray } from '../../lib/converts';

// Define a selector family that takes an argument (e.g., the decryption key)
export const decryptedEntriesState = selectorFamily({
  key: 'decryptedEntriesState',
  get:
    (password: string) =>
    async ({ get }) => {
      if (!password) {
        return {
          decryptedEntries: [],
          corruptedEntryIds: [],
          error: 'Password is required',
        };
      }
      const encryptedEntries = get(entriesState);
      if (!encryptedEntries)
        return {
          decryptedEntries: [],
          corruptedEntryIds: [],
          error: null,
        };

      try {
        const decryptedEntriesPromises: Promise<DecryptedEntry>[] = encryptedEntries.map(async (encryptedEntry) => {
          const encodedSalt = stringToUintArray(encryptedEntry.salt);
          const encodedIv = stringToUintArray(encryptedEntry.iv);
          const encodedData = stringToArrayBuffer(encryptedEntry.encrypted_data);

          const passwordKey = await getDerivedPasswordKey(password, encodedSalt);
          const decryptedDataPointString = await decryptData(encodedData, encodedIv, passwordKey);
          const decryptedDataPoint = JSON.parse(decryptedDataPointString) as EncryptedEntryData;

          const partialDecryptedEntry: Omit<DecryptedEntry, 'data' | 'type'> = {
            id: encryptedEntry.id,
            createdAt: encryptedEntry.created_at,
            updatedAt: encryptedEntry.updated_at,
            title: decryptedDataPoint.title,
            description: decryptedDataPoint.description,
          };
          let decryptedEntry: DecryptedEntry;
          if (decryptedDataPoint.type === 'login') {
            decryptedEntry = {
              ...partialDecryptedEntry,
              type: 'login',
              data: decryptedDataPoint.data as LoginTypeData,
            };
          } else if (decryptedDataPoint.type === 'note') {
            decryptedEntry = {
              ...partialDecryptedEntry,
              type: 'note',
              data: decryptedDataPoint.data as NoteTypeData,
            };
          } else if (decryptedDataPoint.type === 'password') {
            decryptedEntry = {
              ...partialDecryptedEntry,
              type: 'password',
              data: decryptedDataPoint.data as PasswordTypeData,
            };
          } else {
            throw new Error('Invalid entry type');
          }
          return decryptedEntry;
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
