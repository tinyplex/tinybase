/// persisters

import {Changes, Content, Store} from './store.d';
import {
  MergeableChanges,
  MergeableContent,
  MergeableStore,
} from './mergeable-store.d';
import {Id} from './common.d';

/// StoreTypes
export type StoreTypes =
  | 1 // Store only
  | 2 // MergeableStore only
  | 3; // Store and MergeableStore

/// PersistedStore
export type PersistedStore<StoreType extends StoreTypes = 1> =
  StoreType extends 3
    ? Store | MergeableStore
    : StoreType extends 2
      ? MergeableStore
      : Store;

/// PersistedContent
export type PersistedContent<StoreType extends StoreTypes = 1> =
  StoreType extends 3
    ? Content | MergeableContent
    : StoreType extends 2
      ? MergeableContent
      : Content;

/// PersistedChanges
export type PersistedChanges<StoreType extends StoreTypes = 1> =
  StoreType extends 3
    ? Changes | MergeableChanges
    : StoreType extends 2
      ? MergeableChanges
      : Changes;

/// PersisterListener
export type PersisterListener<StoreType extends StoreTypes = 1> = (
  content?: PersistedContent<StoreType>,
  changes?: PersistedChanges<StoreType>,
) => void;

/// PersisterStats
export type PersisterStats = {
  /// PersisterStats.loads
  loads?: number;
  /// PersisterStats.saves
  saves?: number;
};

/// DatabasePersisterConfig
export type DatabasePersisterConfig = DpcJson | DpcTabular;

/// DpcJson
export type DpcJson = {
  /// DpcJson.mode
  mode: 'json';
  /// DpcJson.storeTableName
  storeTableName?: string;
  /// DpcJson.storeIdColumnName
  storeIdColumnName?: string;
  /// DpcJson.storeColumnName
  storeColumnName?: string;
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
export interface Persister<StoreType extends StoreTypes = 1> {
  //
  /// Persister.load
  load(initialContent?: Content): Promise<this>;

  /// Persister.startAutoLoad
  startAutoLoad(initialContent?: Content): Promise<this>;

  /// Persister.stopAutoLoad
  stopAutoLoad(): this;

  /// Persister.isAutoLoading
  isAutoLoading(): boolean;

  /// Persister.save
  save(): Promise<this>;

  /// Persister.startAutoSave
  startAutoSave(): Promise<this>;

  /// Persister.stopAutoSave
  stopAutoSave(): this;

  /// Persister.isAutoSaving
  isAutoSaving(): boolean;

  /// Persister.schedule
  schedule(...actions: Promise<any>[]): Promise<this>;

  /// Persister.getStore
  getStore(): PersistedStore<StoreType>;

  /// Persister.destroy
  destroy(): this;

  /// Persister.getStats
  getStats(): PersisterStats;
  //
}

/// createCustomPersister
export function createCustomPersister<
  ListeningHandle,
  StoreType extends StoreTypes = 1,
>(
  store: PersistedStore<StoreType>,
  getPersisted: () => Promise<PersistedContent<StoreType> | undefined>,
  setPersisted: (
    getContent: () => PersistedContent<StoreType>,
    changes?: PersistedChanges<StoreType>,
  ) => Promise<void>,
  addPersisterListener: (
    listener: PersisterListener<StoreType>,
  ) => ListeningHandle,
  delPersisterListener: (listeningHandle: ListeningHandle) => void,
  onIgnoredError?: (error: any) => void,
  supportedStoreType?: StoreType,
): Persister<StoreType>;
