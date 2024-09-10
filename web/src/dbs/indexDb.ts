import { openDB, deleteDB, IDBPDatabase } from 'idb';
import { IndexDb, Transaction } from '../types/IndexDb';

const DATABASE_VERSION = 1;
const DATABASE_NAME = 'password-manager-app';

type TableNames = keyof IndexDb;
export type TableData = {
  [K in keyof IndexDb]: IndexDb[K] extends Array<infer U> ? U : IndexDb[K];
};
const OBJECT_STORES: Record<Uppercase<TableNames>, TableNames> = {
  ENTRIES: 'entries',
  STRUCTURE: 'structure',
  METADATA: 'metadata',
  TRANSACTIONS: 'transactions',
};

const createObjectStoreIfNotExists = async (db: IDBPDatabase<IndexDb>, storeName: string) => {
  if (db.objectStoreNames.contains(storeName)) return;
  db.createObjectStore(storeName, {
    keyPath: 'id',
  });
};

const getDatabase = (): Promise<IDBPDatabase<IndexDb>> =>
  openDB<IndexDb>(DATABASE_NAME, DATABASE_VERSION, {
    upgrade: (db) => {
      Object.values(OBJECT_STORES).forEach((storeName) => {
        createObjectStoreIfNotExists(db, storeName);
      });
    },
  });

export const select = async <K extends TableNames>(storeName: K, id: string): Promise<TableData[K] | undefined> => {
  const db = await getDatabase();
  return db.get(storeName, id);
};

export const selectAll = async <K extends TableNames>(storeName: K): Promise<TableData[K][]> => {
  const db = await getDatabase();
  return db.getAll(storeName);
};

export const insert = async <K extends TableNames>(storeName: K, data: TableData[K]): Promise<void> => {
  const db = await getDatabase();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.store;
  await store.add(data);
  await tx.done;
};

export const update = async <K extends TableNames>(storeName: K, data: TableData[K]): Promise<void> => {
  const db = await getDatabase();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.store;
  await store.put(data);
  await tx.done;
};

export const remove = async <K extends TableNames>(storeName: K, id: string): Promise<void> => {
  const db = await getDatabase();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.store;
  await store.delete(id);
  await tx.done;
};

export const clear = async <K extends TableNames>(storeName: K): Promise<void> => {
  const db = await getDatabase();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.store;
  await store.clear();
  await tx.done;
};

export const clearAll = async (): Promise<void> => {
  await Promise.all(Object.values(OBJECT_STORES).map((storeName) => clear(storeName)));
};

export const close = async (): Promise<void> => {
  const db = await getDatabase();
  db.close();
};

export const deleteDatabase = async (): Promise<void> => {
  await deleteDB(DATABASE_NAME);
};

export const setLastSyncedAt = async (timestamp: string): Promise<void> => {
  await insert('metadata', {
    last_synced_at: timestamp,
  });
};

export const getLastSyncedAt = async (): Promise<string | null> => {
  const metadata = await select('metadata', 'last_synced_at');
  if (!metadata) throw new Error('Metadata in local db not found');
  return metadata.last_synced_at ?? null;
};

export const getTransactions = async (): Promise<Transaction[]> => {
  return selectAll('transactions');
};

export const clearTransactions = async (): Promise<void> => {
  return clear('transactions');
};

export const insertTransaction = async (transaction: Transaction): Promise<void> => {
  return insert('transactions', transaction);
};
