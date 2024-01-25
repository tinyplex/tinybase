/// mergeable-store

import {
  Cell,
  NoSchemas,
  OptionalSchemas,
  OptionalTablesSchema,
  OptionalValuesSchema,
  Store,
  Value,
} from './store.d';
import {Id} from './common';
import {IdObj} from '../../common/obj';

export type Timestamp = string;
export type Timestamped<Thing> = [timestamp: Timestamp, thing: Thing];

type MergeableCell<Schema extends OptionalTablesSchema> = Timestamped<Cell<
  Schema,
  any,
  any
> | null>;
type MergeableRow<Schema extends OptionalTablesSchema> = Timestamped<IdObj<
  MergeableCell<Schema>
> | null>;
type MergeableTable<Schema extends OptionalTablesSchema> = Timestamped<IdObj<
  MergeableRow<Schema>
> | null>;
type MergeableTables<Schema extends OptionalTablesSchema> = Timestamped<
  IdObj<MergeableTable<Schema>>
>;

type MergeableValue<Schema extends OptionalValuesSchema> = Timestamped<Value<
  Schema,
  any,
  any
> | null>;
type MergeableValues<Schema extends OptionalValuesSchema> = Timestamped<
  IdObj<MergeableValue<Schema>>
>;

export type MergeableContent<Schemas extends OptionalSchemas> = Timestamped<
  [
    mergeableTables: MergeableTables<Schemas[0]>,
    mergeableValues: MergeableValues<Schemas[1]>,
  ]
>;

/// MergeableStore
export interface MergeableStore<Schemas extends OptionalSchemas>
  extends Store<Schemas> {
  //
  /// MergeableStore.merge
  merge(): MergeableStore<Schemas>;

  /// MergeableStore.getMergeableContent
  getMergeableContent(): MergeableContent<Schemas>;

  /// MergeableStore.applyMergeableContent
  applyMergeableContent(
    mergeableContent: MergeableContent<Schemas>,
  ): MergeableStore<Schemas>;
}

/// createMergeableStore
export function createMergeableStore(id: Id): MergeableStore<NoSchemas>;
