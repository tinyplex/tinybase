/// persisters

import {Content, GetTransactionChanges, Store, Tables, Values} from './store.d';
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
  getContent?: () => Content,
  getTransactionChanges?: GetTransactionChanges,
) => void;

/// DatabasePersisterConfig
export type DatabasePersisterConfig = DpcJson | DpcTabular;

/// DpcJson
export type DpcJson = {
  /// DpcJson.mode
  mode: 'json';
  /// DpcJson.storeTableName
  storeTableName?: string;
  /// DatabasePersisterConfig.autoLoadIntervalSeconds
  autoLoadIntervalSeconds?: number;
};

/// DpcTabular
export type DpcTabular = {
  /// DpcTabular.mode
  mode: 'tabular';
  /// DpcTabular.tables
  tables?: {
    /// DpcTabular.tables.load
    load?: DpcTabularLoad;
    /// DpcTabular.tables.save
    save?: DpcTabularSave;
  };
  /// DpcTabular.values
  values?: DpcTabularValues;
  /// DatabasePersisterConfig.autoLoadIntervalSeconds
  autoLoadIntervalSeconds?: number;
};

/// DpcTabularLoad
export type DpcTabularLoad = {
  [tableName: string]:
    | {
        /// DpcTabularLoad.tableId
        tableId: Id;
        /// DpcTabularLoad.rowIdColumnName
        rowIdColumnName?: string;
      }
    | Id;
};

/// DpcTabularSave
export type DpcTabularSave = {
  [tableId: Id]:
    | {
        /// DpcTabularSave.tableName
        tableName: string;
        /// DpcTabularSave.rowIdColumnName
        rowIdColumnName?: string;
        /// DpcTabularSave.deleteEmptyColumns
        deleteEmptyColumns?: boolean;
        /// DpcTabularSave.deleteEmptyTable
        deleteEmptyTable?: boolean;
      }
    | string;
};

/// DpcTabularValues
export type DpcTabularValues = {
  /// DpcTabularValues.load
  load?: boolean;
  /// DpcTabularValues.save
  save?: boolean;
  /// DpcTabularValues.tableName
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

  /// Persister.schedule
  schedule(...actions: Promise<any>[]): Promise<Persister>;

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
  getPersisted: () => Promise<Content | undefined>,
  setPersisted: (
    getContent: () => Content,
    getTransactionChanges?: GetTransactionChanges,
  ) => Promise<void>,
  addPersisterListener: (listener: PersisterListener) => ListeningHandle,
  delPersisterListener: (listeningHandle: ListeningHandle) => void,
  onIgnoredError?: (error: any) => void,
): Persister;
