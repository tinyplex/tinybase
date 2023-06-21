/// persisters

import {
  GetTransactionChanges,
  OptionalSchemas,
  OptionalTablesSchema,
  Store,
  Tables,
  Values,
} from './store.d';
import {TableIdFromSchema} from './internal/store';

/// PersisterStats
export type PersisterStats = {
  /// PersisterStats.loads
  loads?: number;
  /// PersisterStats.saves
  saves?: number;
};

/// PersisterListener
export type PersisterListener<Schemas extends OptionalSchemas> = (
  getContent?: () => [Tables<Schemas[0], true>, Values<Schemas[1], true>],
  getTransactionChanges?: GetTransactionChanges<Schemas>,
) => void;

/// DatabasePersisterConfig
export type DatabasePersisterConfig<Schemas extends OptionalSchemas> = (
  | DpcJson
  | DpcTabular<Schemas[0]>
) & {
  autoLoadIntervalSeconds?: number;
};

/// DpcJson
export type DpcJson = {
  mode: 'json';
  storeTableName?: string;
};

/// DpcTabular
export type DpcTabular<Schema extends OptionalTablesSchema> = {
  mode: 'tabular';
  tables?: {
    load?: DpcTabularLoad<Schema>;
    save?: DpcTabularSave<Schema>;
  };
  values?: DpcTabularValues;
};

/// DpcTabularLoad
export type DpcTabularLoad<Schema extends OptionalTablesSchema> = {
  [tableName: string]:
    | {tableId: TableIdFromSchema<Schema>; rowIdColumnName?: string}
    | TableIdFromSchema<Schema>;
};

/// DpcTabularSave
export type DpcTabularSave<Schema extends OptionalTablesSchema> = {
  [TableId in TableIdFromSchema<Schema>]:
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
  rowIdColumnName?: string;
};

/// Persister
export interface Persister<in out Schemas extends OptionalSchemas> {
  /// Persister.load
  load(
    initialTables?: Tables<Schemas[0], true>,
    initialValues?: Values<Schemas[1], true>,
  ): Promise<Persister<Schemas>>;

  /// Persister.startAutoLoad
  startAutoLoad(
    initialTables?: Tables<Schemas[0], true>,
    initialValues?: Values<Schemas[1], true>,
  ): Promise<Persister<Schemas>>;

  /// Persister.stopAutoLoad
  stopAutoLoad(): Persister<Schemas>;

  /// Persister.save
  save(): Promise<Persister<Schemas>>;

  /// Persister.startAutoSave
  startAutoSave(): Promise<Persister<Schemas>>;

  /// Persister.stopAutoSave
  stopAutoSave(): Persister<Schemas>;

  /// Persister.getStore
  getStore(): Store<Schemas>;

  /// Persister.destroy
  destroy(): Persister<Schemas>;

  /// Persister.getStats
  getStats(): PersisterStats;
}

/// createCustomPersister
export function createCustomPersister<
  Schemas extends OptionalSchemas,
  ListeningHandle,
>(
  store: Store<Schemas>,
  getPersisted: () => Promise<
    [Tables<Schemas[0]>, Values<Schemas[1]>] | undefined
  >,
  setPersisted: (
    getContent: () => [Tables<Schemas[0]>, Values<Schemas[1]>],
    getTransactionChanges?: GetTransactionChanges<Schemas>,
  ) => Promise<void>,
  addPersisterListener: (
    listener: PersisterListener<Schemas>,
  ) => ListeningHandle,
  delPersisterListener: (listeningHandle: ListeningHandle) => void,
): Persister<Schemas>;
