import { useRecoilValue } from 'recoil';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { decryptedEntriesState } from '../recoil/selectors/decryptedEntries';
import { useEffect, useState } from 'react';
import EntryTableRow from '../components/EntryTableRow';
import { Button } from '../components/ui/button';
import EntryForm, { NewEntryType } from '../components/EntryForm';
import { encryptDataWithPassword } from '../lib/crypto';
import { insert } from '../dbs/indexDb';
import { arrayBufferToString, uintArrayToString } from '../lib/converts';
import { Entry } from '../types/IndexDb';
import { useAuth } from '../hooks/useAuth';

const EntriesList: React.FC = () => {
  const { user } = useAuth();

  const [masterPassword, setMasterPassword] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isNewEntryFormShown, setIsNewEntryFormShown] = useState(false);

  const { decryptedEntries, corruptedEntryIds, error } = useRecoilValue(decryptedEntriesState(masterPassword));

  console.log('decryptedEntries', decryptedEntries, corruptedEntryIds, error);

  const handleSubmitNewEntryForm = async (entry: NewEntryType) => {
    if (!user) return;

    // TODO: add error handling
    try {
      const { title, description, type, username, password, note, url } = entry;
      const entryToEncrypt = { title, description, type, data: { username, password, note, url } };
      const stringifiedEntry = JSON.stringify(entryToEncrypt);
      const { iv, salt, encryptedData } = await encryptDataWithPassword(masterPassword, stringifiedEntry);
      const ivString = uintArrayToString(iv);
      const saltString = uintArrayToString(salt);
      const encryptedDataString = arrayBufferToString(encryptedData);
      const date = new Date().toString();
      const newDbEntry: Entry = {
        id: window.crypto.randomUUID(),
        user_id: user.id,
        iv: ivString,
        salt: saltString,
        encrypted_data: encryptedDataString,
        created_at: date,
        updated_at: date,
      };

      insert('entries', newDbEntry);
    } catch (error) {
      console.error(error);
    }
    setIsNewEntryFormShown(false);
  };

  useEffect(() => {
    if (error) {
      setIsUnlocked(false);
      return;
    }
    setIsUnlocked(true);
  }, [error]);

  if (!isUnlocked) {
    return (
      <dialog open>
        <input type="password" value={inputPassword} onChange={(e) => setInputPassword(e.currentTarget.value)} />
        <button onClick={() => setMasterPassword(inputPassword)}>Unlock</button>
      </dialog>
    );
  }

  return (
    <>
      <h1>Entries</h1>
      <Button onClick={() => setIsNewEntryFormShown(true)}>Add new entry</Button>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Password</TableHead>
            <TableHead></TableHead>
            <TableHead></TableHead>
            <TableHead>Note</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {decryptedEntries.map((entry) => (
            <EntryTableRow key={entry.id} entry={entry} />
          ))}
        </TableBody>
      </Table>
      <dialog open={isNewEntryFormShown} onClose={() => setIsNewEntryFormShown(false)}>
        <EntryForm onSubmitForm={handleSubmitNewEntryForm} />
      </dialog>
    </>
  );
};

export default EntriesList;
