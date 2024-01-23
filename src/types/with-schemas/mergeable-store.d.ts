/// mergeable-store

import {
  Cell,
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

export type MergeableCell<Schema extends OptionalTablesSchema> =
  Timestamped<Cell<Schema, any, any> | null>;
export type MergeableRow<Schema extends OptionalTablesSchema> =
  Timestamped<IdObj<MergeableCell<Schema>> | null>;
export type MergeableTable<Schema extends OptionalTablesSchema> =
  Timestamped<IdObj<MergeableRow<Schema>> | null>;
export type MergeableTables<Schema extends OptionalTablesSchema> = Timestamped<
  IdObj<MergeableTable<Schema>>
>;

export type MergeableValue<Schema extends OptionalValuesSchema> =
  Timestamped<Value<Schema, any, any> | null>;
export type MergeableValues<Schema extends OptionalValuesSchema> = Timestamped<
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
}

/// createMergeableStore
export function createMergeableStore<Schemas extends OptionalSchemas>(
  id: Id,
): MergeableStore<Schemas>;
