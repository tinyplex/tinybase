/// persisters

import {Changes, Content, Store} from './store.d';
import {
  MergeableChanges,
  MergeableContent,
  MergeableStore,
} from './mergeable-store';
import {Id} from './common.d';

/// PersisterStats
export type PersisterStats = {
  /// PersisterStats.loads
  loads?: number;
  /// PersisterStats.saves
  saves?: number;
};

/// PersisterListener
export type PersisterListener<SupportsMergeableStore extends boolean = false> =
  (
    getContent?: () =>
      | Content
      | (SupportsMergeableStore extends true ? MergeableContent : never),
    changes?:
      | Changes
      | (SupportsMergeableStore extends true ? MergeableChanges : never),
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
export interface Persister<SupportsMergeableStore extends boolean = false> {
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
  getStore(): SupportsMergeableStore extends true
    ? Store | MergeableStore
    : Store;

  /// Persister.destroy
  destroy(): this;

  /// Persister.getStats
  getStats(): PersisterStats;
  //
}

/// createCustomPersister
export function createCustomPersister<
  ListeningHandle,
  SupportsMergeableStore extends boolean = false,
>(
  store: Store | (SupportsMergeableStore extends true ? MergeableStore : never),
  getPersisted: () => Promise<
    | Content
    | (SupportsMergeableStore extends true ? MergeableContent : never)
    | undefined
  >,
  setPersisted: (
    getContent: () =>
      | Content
      | (SupportsMergeableStore extends true ? MergeableContent : never),
    changes?:
      | Changes
      | (SupportsMergeableStore extends true ? MergeableChanges : never),
  ) => Promise<void>,
  addPersisterListener: (
    listener: PersisterListener<SupportsMergeableStore>,
  ) => ListeningHandle,
  delPersisterListener: (listeningHandle: ListeningHandle) => void,
  onIgnoredError?: (error: any) => void,
  supportsMergeableStore?: SupportsMergeableStore,
): Persister<SupportsMergeableStore>;
