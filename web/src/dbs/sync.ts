import { supabaseClient } from './supabase';
import { selectAll, getLastSyncedAt, getTransactions, insert, update } from './indexDb';
import { Transaction } from '../types/IndexDb';
import SyncError from './SyncError';
import { Database } from '../types/SupabaseDb';

type SupabaseTableName = keyof Database['public']['Tables'];
type SupabaseTableData = Database['public']['Tables'][SupabaseTableName]['Row'];

export type Conflict = {
  id: string;
  tableName: SupabaseTableName;
  local: SupabaseTableData | null;
  remote: SupabaseTableData | null;
};

type OperationResult = {
  error: SyncError | null;
  conflict: Conflict | null;
};

const constructConflict = <T extends SupabaseTableData>(
  tableName: SupabaseTableName,
  localData: T | null,
  supabaseData: T | null,
): Conflict | null => {
  if (!localData && !supabaseData) {
    console.error('Both local and remote data are null');
    return null;
  }
  return {
    id: localData?.id ?? supabaseData?.id ?? '',
    tableName,
    local: localData,
    remote: supabaseData,
  };
};

const isOutdated = (lastSyncedAtDate: Date, updatedAt: string): boolean =>
  lastSyncedAtDate.getTime() > new Date(updatedAt).getTime();

const insertData = async <T extends SupabaseTableData>(
  tableName: SupabaseTableName,
  localData: T,
  supabaseData: T | null,
  lastSyncedAtDate: Date,
): Promise<OperationResult> => {
  if (supabaseData) {
    const errorMessages = 'Entry already exists in database';
    return {
      error: new SyncError(tableName, 'insert', localData.id, errorMessages),
      conflict: constructConflict(tableName, localData, supabaseData),
    };
  }
  if (isOutdated(lastSyncedAtDate, localData.updated_at)) {
    const errorMessages = 'Tranaction outdated';
    return { error: new SyncError(tableName, 'insert', localData.id, errorMessages), conflict: null };
  }
  const { error } = await supabaseClient.from(tableName).insert(localData);
  if (error) {
    return { error: new SyncError(tableName, 'insert', localData.id, error.message), conflict: null };
  }
  return { error: null, conflict: null };
};

const updateData = async <T extends SupabaseTableData>(
  tableName: SupabaseTableName,
  localData: T,
  supabaseData: T | null,
  lastSyncedAtDate: Date,
): Promise<OperationResult> => {
  if (!supabaseData) {
    const errorMessages = 'Entry does not exist in database';
    return {
      error: new SyncError(tableName, 'update', localData.id, errorMessages),
      conflict: constructConflict(tableName, localData, null),
    };
  }
  if (isOutdated(lastSyncedAtDate, localData.updated_at)) {
    const errorMessages = 'Transaction outdated - remote data is newer than local data';
    return {
      error: new SyncError(tableName, 'update', localData.id, errorMessages),
      conflict: constructConflict(tableName, localData, supabaseData),
    };
  }
  const { error } = await supabaseClient
    .from(tableName)
    .update({
      encrypted_data: localData.encrypted_data,
      salt: localData.salt,
      iv: localData.iv,
      updated_at: localData.updated_at,
    })
    .eq('id', localData.id);
  if (error) {
    return { error: new SyncError(tableName, 'update', localData.id, error.message), conflict: null };
  }
  return { error: null, conflict: null };
};

const deleteData = async <T extends SupabaseTableData>(
  tableName: SupabaseTableName,
  id: string,
  localData: T | null,
  supabaseData: T | null,
  lastSyncedAtDate: Date,
): Promise<OperationResult> => {
  if (localData) {
    const errorMessages = 'Entry exists in local database';
    return {
      error: new SyncError(tableName, 'delete', localData.id, errorMessages),
      conflict: constructConflict(tableName, localData, supabaseData),
    };
  }

  if (!supabaseData) {
    const errorMessages = 'Entry does not exist in database';
    return { error: new SyncError(tableName, 'delete', id, errorMessages), conflict: null };
  }

  if (isOutdated(lastSyncedAtDate, supabaseData.updated_at)) {
    const errorMessages = 'Transaction outdated';
    return {
      error: new SyncError(tableName, 'delete', id, errorMessages),
      conflict: constructConflict(tableName, null, supabaseData),
    };
  }

  const { error } = await supabaseClient.from(tableName).delete().eq('id', id);
  if (error) {
    return { error: new SyncError(tableName, 'delete', id, error.message), conflict: null };
  }
  return { error: null, conflict: null };
};

const syncDataTable = async (
  tableName: SupabaseTableName,
  transactions: Transaction[],
  lastSyncedAtDate: Date,
): Promise<{ errors: SyncError[]; conflicts: Conflict[] }> => {
  const syncErrors: SyncError[] = [];
  const conflicts: Conflict[] = [];

  const { data: supabaseData, error } = await supabaseClient.from(tableName).select();
  if (error || !supabaseData) {
    throw error ?? new Error('No data returned from supabase');
  }
  const localData = await selectAll(tableName);

  for (const transaction of transactions) {
    const dataId = transaction.id;
    const localDataPoint = localData.find((localEntry) => localEntry.id === dataId);
    const supabaseDataPoint = supabaseData.find((supabaseEntry) => supabaseEntry.id === dataId) ?? null;

    if (transaction.action === 'insert' && localDataPoint) {
      const { error, conflict } = await insertData(tableName, localDataPoint, supabaseDataPoint, lastSyncedAtDate);
      if (conflict) {
        conflicts.push(conflict);
        continue;
      }
      if (error) {
        syncErrors.push(error);
      }
    } else if (transaction.action === 'update' && localDataPoint) {
      const { error, conflict } = await updateData(tableName, localDataPoint, supabaseDataPoint, lastSyncedAtDate);
      if (conflict) {
        conflicts.push(conflict);
        continue;
      }
      if (error) {
        syncErrors.push(error);
      }
    } else if (transaction.action === 'delete') {
      const { error, conflict } = await deleteData(
        tableName,
        dataId,
        localDataPoint ?? null,
        supabaseDataPoint,
        lastSyncedAtDate,
      );
      if (conflict) {
        conflicts.push(conflict);
        continue;
      }
      if (error) {
        syncErrors.push(error);
      }
    }
  }

  const resolvedIds = transactions.map((transaction) => transaction.id);
  const newSupabaseData = supabaseData.filter((dataPoint) => !resolvedIds.includes(dataPoint.id));

  for (const supabaseDataPoint of newSupabaseData) {
    const localDataPoint = localData.find((localEntry) => localEntry.id === supabaseDataPoint.id);
    if (!localDataPoint) {
      insert(tableName, supabaseDataPoint);
    } else if (supabaseDataPoint.updated_at >= localDataPoint.updated_at) {
      update(tableName, supabaseDataPoint);
    } else {
      const errorMessages = 'Transaction outdated';
      syncErrors.push(new SyncError(tableName, 'update', supabaseDataPoint.id, errorMessages));
      const conflict = constructConflict(tableName, localDataPoint, supabaseDataPoint);
      if (conflict) {
        conflicts.push(conflict);
      }
    }
  }

  return { errors: syncErrors, conflicts };
};

export const syncDbs = async (): Promise<{
  entriesErrors: SyncError[];
  structureErrors: SyncError[];
  entriesConflicts: Conflict[];
  structureConflicts: Conflict[];
}> => {
  const lastSyncedAt = (await getLastSyncedAt()) ?? '1970-01-01T00:00:00.000Z';
  const lastSyncedAtDate = new Date(lastSyncedAt);
  const transactions = await getTransactions();

  const entryTransactions = transactions.filter((transaction) => transaction.table === 'entries');
  const entriesResult = await syncDataTable('entries', entryTransactions, lastSyncedAtDate);
  const structureTransactions = transactions.filter((transaction) => transaction.table === 'structure');
  const structureResult = await syncDataTable('structure', structureTransactions, lastSyncedAtDate);

  return {
    entriesErrors: entriesResult.errors,
    structureErrors: structureResult.errors,
    entriesConflicts: entriesResult.conflicts,
    structureConflicts: structureResult.conflicts,
  };
};
