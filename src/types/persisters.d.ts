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
export type DatabasePersisterConfig = (DpcJson | DpcTabular) & {
  autoLoadIntervalSeconds?: number;
};

/// DpcJson
export type DpcJson = {
  mode: 'json';
  storeTableName?: string;
};

/// DpcTabular
export type DpcTabular = {
  mode: 'tabular';
  tables?: {
    load?: DpcTabularLoad;
    save?: DpcTabularSave;
  };
  values?: DpcTabularValues;
};

/// DpcTabularLoad
export type DpcTabularLoad = {
  [tableName: string]: {tableId: Id; rowIdColumnName?: string} | Id;
};

/// DpcTabularSave
export type DpcTabularSave = {
  [tableId: Id]:
    | {
        tableName: string;
        rowIdColumnName?: string;
        deleteEmptyColumns?: boolean;
        deleteEmptyTable?: boolean;
      }
    | string;
};

/// DpcTabularValues
export type DpcTabularValues = {
  load?: boolean;
  save?: boolean;
  tableName?: string;
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
