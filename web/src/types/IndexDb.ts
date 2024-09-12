export type UUID = string;

export type Entry = {
  id: UUID;
  user_id: UUID;
  encrypted_data: string;
  salt: string;
  iv: string;
  created_at: string;
  updated_at: string;
};

export type Structure = {
  id: UUID;
  user_id: UUID;
  encrypted_data: string;
  salt: string;
  iv: string;
  created_at: string;
  updated_at: string;
};

export type Metadata = {
  last_synced_at: string;
};

export type Transaction = {
  id: UUID;
  table: 'entries' | 'structure';
  action: 'insert' | 'update' | 'delete';
};

export type IndexDb = {
  entries: Entry[];
  structure: Structure[];
  metadata: Metadata;
  transactions: Transaction[];
};
