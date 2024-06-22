/// persisters

import type {
  Changes,
  Content,
  OptionalSchemas,
  OptionalTablesSchema,
  Store,
} from '../../store/with-schemas/index.d.ts';
import type {
  MergeableChanges,
  MergeableContent,
  MergeableStore,
} from '../../mergeable-store/with-schemas/index.d.ts';
import type {TableIdFromSchema} from '../../_internal/store/with-schemas/index.d.ts';

/// Persists
export const enum Persists {
  /// Persists.StoreOnly
  StoreOnly = 1,
  /// Persists.MergeableStoreOnly
  MergeableStoreOnly = 2,
  /// Persists.StoreOrMergeableStore
  StoreOrMergeableStore = 3,
}

/// PersistedStore
export type PersistedStore<
  Schemas extends OptionalSchemas,
  Persist extends Persists = Persists.StoreOnly,
> = Persist extends Persists.StoreOrMergeableStore
  ? Store<Schemas> | MergeableStore<Schemas>
  : Persist extends Persists.MergeableStoreOnly
    ? MergeableStore<Schemas>
    : Store<Schemas>;

/// PersistedContent
export type PersistedContent<
  Schemas extends OptionalSchemas,
  Persist extends Persists = Persists.StoreOnly,
> = Persist extends Persists.StoreOrMergeableStore
  ? Content<Schemas> | MergeableContent<Schemas>
  : Persist extends Persists.MergeableStoreOnly
    ? MergeableContent<Schemas>
    : Content<Schemas>;

/// PersistedChanges
export type PersistedChanges<
  Schemas extends OptionalSchemas,
  Persist extends Persists = Persists.StoreOnly,
> = Persist extends Persists.StoreOrMergeableStore
  ? Changes<Schemas> | MergeableChanges<Schemas>
  : Persist extends Persists.MergeableStoreOnly
    ? MergeableChanges<Schemas>
    : Changes<Schemas>;

/// PersisterListener
export type PersisterListener<
  Schemas extends OptionalSchemas,
  Persist extends Persists = Persists.StoreOnly,
> = (
  content?: PersistedContent<Schemas, Persist>,
  changes?: PersistedChanges<Schemas, Persist>,
) => void;

/// PersisterStats
export type PersisterStats = {
  /// PersisterStats.loads
  loads: number;
  /// PersisterStats.saves
  saves: number;
};

/// DatabasePersisterConfig
export type DatabasePersisterConfig<Schemas extends OptionalSchemas> =
  | DpcJson
  | DpcTabular<Schemas[0]>;

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
export type DpcTabular<Schema extends OptionalTablesSchema> = {
  /// DpcTabular.mode
  mode: 'tabular';
  /// DpcTabular.tables
  tables?: {
    /// DpcTabular.tables.load
    load?: DpcTabularLoad<Schema>;
    /// DpcTabular.tables.save
    save?: DpcTabularSave<Schema>;
  };
  /// DpcTabular.values
  values?: DpcTabularValues;
  /// DatabasePersisterConfig.autoLoadIntervalSeconds
  autoLoadIntervalSeconds?: number;
};

/// DpcTabularLoad
export type DpcTabularLoad<Schema extends OptionalTablesSchema> = {
  [tableName: string]:
    | {
        /// DpcTabularLoad.tableId
        tableId: TableIdFromSchema<Schema>;
        /// DpcTabularLoad.rowIdColumnName
        rowIdColumnName?: string;
      }
    | TableIdFromSchema<Schema>;
};

/// DpcTabularSave
export type DpcTabularSave<Schema extends OptionalTablesSchema> = {
  [TableId in TableIdFromSchema<Schema>]:
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
  in out Schemas extends OptionalSchemas,
  Persist extends Persists = Persists.StoreOnly,
> {
  /// Persister.load
  load(initialContent?: Content<Schemas, true>): Promise<this>;

  /// Persister.startAutoLoad
  startAutoLoad(initialContent?: Content<Schemas, true>): Promise<this>;

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
  getStore(): PersistedStore<Schemas, Persist>;

  /// Persister.destroy
  destroy(): this;

  /// Persister.getStats
  getStats(): PersisterStats;
}

/// createCustomPersister
export function createCustomPersister<
  Schemas extends OptionalSchemas,
  ListeningHandle,
  Persist extends Persists = Persists.StoreOnly,
>(
  store: PersistedStore<Schemas, Persist>,
  getPersisted: () => Promise<PersistedContent<Schemas, Persist> | undefined>,
  setPersisted: (
    getContent: () => PersistedContent<Schemas, Persist>,
    changes?: PersistedChanges<Schemas, Persist>,
  ) => Promise<void>,
  addPersisterListener: (
    listener: PersisterListener<Schemas, Persist>,
  ) => ListeningHandle,
  delPersisterListener: (listeningHandle: ListeningHandle) => void,
  onIgnoredError?: (error: any) => void,
  persistable?: Persist,
): Persister<Schemas, Persist>;
