/// persisters

import type {Changes, Content, Store} from '../store/index.d.ts';
import type {
  MergeableChanges,
  MergeableContent,
  MergeableStore,
} from '../mergeable-store/index.d.ts';
import type {Id} from '../common/index.d.ts';

/// Persistables
export const enum Persistables {
  StoreOnly = 1,
  MergeableStoreOnly = 2,
  StoreOrMergeableStore = 3,
}

/// PersistedStore
export type PersistedStore<
  Persistable extends Persistables = Persistables.StoreOnly,
> = Persistable extends Persistables.StoreOrMergeableStore
  ? Store | MergeableStore
  : Persistable extends Persistables.MergeableStoreOnly
    ? MergeableStore
    : Store;

/// PersistedContent
export type PersistedContent<
  Persistable extends Persistables = Persistables.StoreOnly,
> = Persistable extends Persistables.StoreOrMergeableStore
  ? Content | MergeableContent
  : Persistable extends Persistables.MergeableStoreOnly
    ? MergeableContent
    : Content;

/// PersistedChanges
export type PersistedChanges<
  Persistable extends Persistables = Persistables.StoreOnly,
> = Persistable extends Persistables.StoreOrMergeableStore
  ? Changes | MergeableChanges
  : Persistable extends Persistables.MergeableStoreOnly
    ? MergeableChanges
    : Changes;

/// PersisterListener
export type PersisterListener<
  Persistable extends Persistables = Persistables.StoreOnly,
> = (
  content?: PersistedContent<Persistable>,
  changes?: PersistedChanges<Persistable>,
) => void;

/// PersisterStats
export type PersisterStats = {
  /// PersisterStats.loads
  loads: number;
  /// PersisterStats.saves
  saves: number;
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
export interface Persister<
  Persistable extends Persistables = Persistables.StoreOnly,
> {
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
  getStore(): PersistedStore<Persistable>;

  /// Persister.destroy
  destroy(): this;

  /// Persister.getStats
  getStats(): PersisterStats;
  //
}

/// createCustomPersister
export function createCustomPersister<
  ListeningHandle,
  Persistable extends Persistables = Persistables.StoreOnly,
>(
  store: PersistedStore<Persistable>,
  getPersisted: () => Promise<PersistedContent<Persistable> | undefined>,
  setPersisted: (
    getContent: () => PersistedContent<Persistable>,
    changes?: PersistedChanges<Persistable>,
  ) => Promise<void>,
  addPersisterListener: (
    listener: PersisterListener<Persistable>,
  ) => ListeningHandle,
  delPersisterListener: (listeningHandle: ListeningHandle) => void,
  onIgnoredError?: (error: any) => void,
  persistable?: Persistable,
): Persister<Persistable>;
