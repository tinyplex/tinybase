/// persisters
import type {Id} from '../common/index.d.ts';
import type {
  MergeableChanges,
  MergeableContent,
  MergeableStore,
} from '../mergeable-store/index.d.ts';
import type {Changes, Content, Store} from '../store/index.d.ts';

/// Status
export const enum Status {
  /// Status.Idle
  Idle = 0,
  /// Status.Loading
  Loading = 1,
  /// Status.Saving
  Saving = 2,
}

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
export type PersistedStore<Persist extends Persists = Persists.StoreOnly> =
  Persist extends Persists.StoreOrMergeableStore
    ? Store | MergeableStore
    : Persist extends Persists.MergeableStoreOnly
      ? MergeableStore
      : Store;

/// PersistedContent
export type PersistedContent<Persist extends Persists = Persists.StoreOnly> =
  Persist extends Persists.StoreOrMergeableStore
    ? Content | MergeableContent
    : Persist extends Persists.MergeableStoreOnly
      ? MergeableContent
      : Content;

/// PersistedChanges
export type PersistedChanges<
  Persist extends Persists = Persists.StoreOnly,
  Hashed extends boolean = false,
> = Persist extends Persists.StoreOrMergeableStore
  ? Changes | MergeableChanges<Hashed>
  : Persist extends Persists.MergeableStoreOnly
    ? MergeableChanges<Hashed>
    : Changes;

/// PersisterListener
export type PersisterListener<Persist extends Persists = Persists.StoreOnly> = (
  content?: PersistedContent<Persist>,
  changes?: PersistedChanges<Persist>,
) => void;

/// StatusListener
export type StatusListener<Persist extends Persists = Persists.StoreOnly> = (
  persister: Persister<Persist>,
  status: Status,
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
        /// DpcTabularLoad.whereCondition
        whereCondition?: string;
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
        /// DpcTabularLoad.whereCondition
        whereCondition?: string;
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
export interface Persister<Persist extends Persists = Persists.StoreOnly> {
  //
  /// Persister.load
  load(initialContent?: Content | (() => Content)): Promise<this>;

  /// Persister.startAutoLoad
  startAutoLoad(initialContent?: Content | (() => Content)): Promise<this>;

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

  /// Persister.getStatus
  getStatus(): Status;

  /// Persister.addStatusListener
  addStatusListener(listener: StatusListener<Persist>): Id;

  /// Persister.delListener
  delListener(listenerId: Id): this;

  /// Persister.schedule
  schedule(...actions: (() => Promise<any>)[]): Promise<this>;

  /// Persister.getStore
  getStore(): PersistedStore<Persist>;

  /// Persister.destroy
  destroy(): this;

  /// Persister.getStats
  getStats(): PersisterStats;
  //
}

/// AnyPersister
export type AnyPersister = Persister<Persists>;

/// DatabaseExecuteCommand
export type DatabaseExecuteCommand = (
  sql: string,
  params?: any[],
) => Promise<{[field: string]: any}[]>;

/// DatabaseChangeListener
export type DatabaseChangeListener = (tableName: string) => void;

/// createCustomPersister
export function createCustomPersister<
  ListenerHandle,
  Persist extends Persists = Persists.StoreOnly,
>(
  store: PersistedStore<Persist>,
  getPersisted: () => Promise<PersistedContent<Persist> | undefined>,
  setPersisted: (
    getContent: () => PersistedContent<Persist>,
    changes?: PersistedChanges<Persist>,
  ) => Promise<void>,
  addPersisterListener: (
    listener: PersisterListener<Persist>,
  ) => ListenerHandle | Promise<ListenerHandle>,
  delPersisterListener: (listenerHandle: ListenerHandle) => void,
  onIgnoredError?: (error: any) => void,
  persist?: Persist,
): Persister<Persist>;

/// createCustomSqlitePersister
export function createCustomSqlitePersister<
  ListenerHandle,
  Persist extends Persists = Persists.StoreOnly,
>(
  store: PersistedStore<Persist>,
  configOrStoreTableName: DatabasePersisterConfig | string | undefined,
  executeCommand: DatabaseExecuteCommand,
  addChangeListener: (listener: DatabaseChangeListener) => ListenerHandle,
  delChangeListener: (listenerHandle: ListenerHandle) => void,
  onSqlCommand: ((sql: string, params?: any[]) => void) | undefined,
  onIgnoredError: ((error: any) => void) | undefined,
  destroy: () => void,
  persist: Persist,
  thing: any,
  getThing?: string,
): Persister<Persist>;

/// createCustomPostgreSqlPersister
export function createCustomPostgreSqlPersister<
  ListenerHandle,
  Persist extends Persists = Persists.StoreOnly,
>(
  store: PersistedStore<Persist>,
  configOrStoreTableName: DatabasePersisterConfig | string | undefined,
  executeCommand: DatabaseExecuteCommand,
  addChangeListener: (
    channel: string,
    listener: DatabaseChangeListener,
  ) => Promise<ListenerHandle>,
  delChangeListener: (listenerHandle: ListenerHandle) => void,
  onSqlCommand: ((sql: string, params?: any[]) => void) | undefined,
  onIgnoredError: ((error: any) => void) | undefined,
  destroy: () => void,
  persist: Persist,
  thing: any,
  getThing?: string,
): Persister<Persist>;
