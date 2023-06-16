/// persisters

import {GetTransactionChanges, Store, Tables, Values} from './store.d';
import {Id} from './common.d';

/// PersisterStats
export type PersisterStats = {
  /// PersisterStats.loads
  loads?: number;
  /// PersisterStats.saves
  saves?: number;
};

/// PersisterListener
export type PersisterListener = (
  getContent?: () => [Tables, Values],
  getTransactionChanges?: GetTransactionChanges,
) => void;

/// DatabasePersisterConfig
export type DatabasePersisterConfig = DpcJson | DpcTabular;

/// DpcJson
export type DpcJson = {
  mode: 'json';
  storeTableName?: string;
};

/// DpcTabular
export type DpcTabular = {
  mode: 'tabular';
  tables?: {
    load?: DpcTabularLoad | boolean;
    save?: DpcTabularSave | false;
  };
  values?: DpcTabularValues;
};

/// DpcTabularLoad
export type DpcTabularLoad = {
  [tableName: string]: DpcTabularLoadTable | boolean;
  '*': DpcTabularLoadDefault | boolean;
};

/// DpcTabularLoadTable
export type DpcTabularLoadTable = {
  tableId?: Id | ((tableName: string) => Id | false);
  rowIdColumnName?: string;
};

/// DpcTabularLoadDefault
export type DpcTabularLoadDefault = {
  tableId?: (tableName: string) => Id | false;
  rowIdColumnName?: string;
};

/// DpcTabularSave
export type DpcTabularSave = {
  [tableId: Id]: DpcTabularSaveTable | false;
  '*': DpcTabularSaveDefault | false;
};

/// DpcTabularSaveTable
export type DpcTabularSaveTable = {
  tableName?: string | ((tableId: Id) => string | false);
  rowIdColumnName?: string;
};

/// DpcTabularSaveDefault
export type DpcTabularSaveDefault = {
  tableName?: (tableId: Id) => string | false;
  rowIdColumnName?: string;
};

/// DpcTabularValues
export type DpcTabularValues = {
  load?: boolean;
  save?: boolean;
  tableName?: string;
  rowIdColumnName?: string;
};

/// Persister
export interface Persister {
  //
  /// Persister.load
  load(initialTables?: Tables, initialValues?: Values): Promise<Persister>;

  /// Persister.startAutoLoad
  startAutoLoad(
    initialTables?: Tables,
    initialValues?: Values,
  ): Promise<Persister>;

  /// Persister.stopAutoLoad
  stopAutoLoad(): Persister;

  /// Persister.save
  save(): Promise<Persister>;

  /// Persister.startAutoSave
  startAutoSave(): Promise<Persister>;

  /// Persister.stopAutoSave
  stopAutoSave(): Persister;

  /// Persister.getStore
  getStore(): Store;

  /// Persister.destroy
  destroy(): Persister;

  /// Persister.getStats
  getStats(): PersisterStats;
  //
}

/// createCustomPersister
export function createCustomPersister<ListeningHandle>(
  store: Store,
  getPersisted: () => Promise<[Tables, Values] | undefined>,
  setPersisted: (
    getContent: () => [Tables, Values],
    getTransactionChanges?: GetTransactionChanges,
  ) => Promise<void>,
  addPersisterListener: (listener: PersisterListener) => ListeningHandle,
  delPersisterListener: (listeningHandle: ListeningHandle) => void,
): Persister;
