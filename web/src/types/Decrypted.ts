export type EntryType = 'password' | 'note' | 'login';

export type NoteTypeData = {
  note: string;
};

export type PasswordTypeData = {
  password: string;
  url: string;
  note: string;
};

export type LoginTypeData = {
  username: string;
  password: string;
  url: string;
  note: string;
};

type EncryptedDataBase = {
  title: string;
  description: string;
};

export type DataType = NoteTypeData | PasswordTypeData | LoginTypeData;

type EntryData =
  | {
      type: 'password';
      data: PasswordTypeData;
    }
  | {
      type: 'note';
      data: NoteTypeData;
    }
  | {
      type: 'login';
      data: LoginTypeData;
    };

export type EncryptedEntryData = EncryptedDataBase & EntryData;

type DescryptedEntryBase = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type DecryptedEntry = DescryptedEntryBase & EntryData;
