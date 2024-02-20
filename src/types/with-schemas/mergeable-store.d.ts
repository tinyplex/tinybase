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

/// Time
export type Time = string;

/// Stamp
export type Stamp<Thing> = [time: Time, thing: Thing];

type MergeableCell<Schema extends OptionalTablesSchema> = Stamp<Cell<
  Schema,
  any,
  any
> | null>;
type MergeableRow<Schema extends OptionalTablesSchema> = Stamp<IdObj<
  MergeableCell<Schema>
> | null>;
type MergeableTable<Schema extends OptionalTablesSchema> = Stamp<IdObj<
  MergeableRow<Schema>
> | null>;
type MergeableTables<Schema extends OptionalTablesSchema> = Stamp<
  IdObj<MergeableTable<Schema>>
>;
type MergeableValue<Schema extends OptionalValuesSchema> = Stamp<Value<
  Schema,
  any,
  any
> | null>;
type MergeableValues<Schema extends OptionalValuesSchema> = Stamp<
  IdObj<MergeableValue<Schema>>
>;

/// MergeableContent
export type MergeableContent<Schemas extends OptionalSchemas> = Stamp<
  [
    mergeableTables: MergeableTables<Schemas[0]>,
    mergeableValues: MergeableValues<Schemas[1]>,
  ]
>;

/// MergeableChanges
export type MergeableChanges<Schemas extends OptionalSchemas> =
  MergeableContent<Schemas>;

/// MergeableStore
export interface MergeableStore<Schemas extends OptionalSchemas>
  extends Store<Schemas> {
  //
  /// MergeableStore.merge
  merge(mergeableStore: MergeableStore<Schemas>): MergeableStore<Schemas>;

  /// MergeableStore.getMergeableContent
  getMergeableContent(): MergeableContent<Schemas>;

  /// MergeableStore.setMergeableContent
  setMergeableContent(
    mergeableContent: MergeableContent<Schemas>,
  ): MergeableStore<Schemas>;

  /// MergeableStore.applyMergeableChanges
  applyMergeableChanges(
    mergeableChanges: MergeableChanges<Schemas>,
  ): MergeableStore<Schemas>;
}

/// createMergeableStore
export function createMergeableStore(id: Id): MergeableStore<NoSchemas>;
