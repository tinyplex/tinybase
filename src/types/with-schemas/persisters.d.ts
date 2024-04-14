/// persisters

import {
  Changes,
  Content,
  OptionalSchemas,
  OptionalTablesSchema,
  Store,
  Tables,
  Values,
} from './store.d';
import {
  MergeableChanges,
  MergeableContent,
  MergeableStore,
} from './mergeable-store.d';
import {TableIdFromSchema} from './internal/store.d';

/// PersisterStats
export type PersisterStats = {
  /// PersisterStats.loads
  loads?: number;
  /// PersisterStats.saves
  saves?: number;
};

/// PersisterListener
export type PersisterListener<
  Schemas extends OptionalSchemas,
  SupportsMergeableStore extends boolean = false,
> = (
  getContent?: () =>
    | Content<Schemas, true>
    | (SupportsMergeableStore extends true ? MergeableContent<Schemas> : never),
  getChanges?: () =>
    | Changes<Schemas>
    | (SupportsMergeableStore extends true ? MergeableChanges<Schemas> : never),
) => void;

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
  SupportsMergeableStore extends boolean = false,
> {
  /// Persister.load
  load(
    initialTables?: Tables<Schemas[0], true>,
    initialValues?: Values<Schemas[1], true>,
  ): Promise<this>;

  /// Persister.startAutoLoad
  startAutoLoad(
    initialTables?: Tables<Schemas[0], true>,
    initialValues?: Values<Schemas[1], true>,
  ): Promise<this>;

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
  getStore(): SupportsMergeableStore extends true
    ? Store<Schemas> | MergeableStore<Schemas>
    : Store<Schemas>;

  /// Persister.destroy
  destroy(): this;

  /// Persister.getStats
  getStats(): PersisterStats;
}

/// createCustomPersister
export function createCustomPersister<
  Schemas extends OptionalSchemas,
  ListeningHandle,
  SupportsMergeableStore extends boolean,
>(
  store:
    | Store<Schemas>
    | (SupportsMergeableStore extends true ? MergeableStore<Schemas> : never),
  getPersisted: () => Promise<
    | Content<Schemas>
    | (SupportsMergeableStore extends true ? MergeableContent<Schemas> : never)
    | undefined
  >,
  setPersisted: (
    getContent: () =>
      | Content<Schemas>
      | (SupportsMergeableStore extends true
          ? MergeableContent<Schemas>
          : never),
    getChanges?: () =>
      | Changes<Schemas>
      | (SupportsMergeableStore extends true
          ? MergeableChanges<Schemas>
          : never),
  ) => Promise<void>,
  addPersisterListener: (
    listener: PersisterListener<Schemas>,
  ) => ListeningHandle,
  delPersisterListener: (listeningHandle: ListeningHandle) => void,
  onIgnoredError?: (error: any) => void,
  supportsMergeableStore?: SupportsMergeableStore,
): Persister<Schemas, SupportsMergeableStore>;
