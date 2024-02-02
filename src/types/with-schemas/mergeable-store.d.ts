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

export type Stamped = string;
export type Stampeded<Thing> = [stamp: Stamped, thing: Thing];

type MergeableCell<Schema extends OptionalTablesSchema> = Stampeded<Cell<
  Schema,
  any,
  any
> | null>;
type MergeableRow<Schema extends OptionalTablesSchema> = Stampeded<IdObj<
  MergeableCell<Schema>
> | null>;
type MergeableTable<Schema extends OptionalTablesSchema> = Stampeded<IdObj<
  MergeableRow<Schema>
> | null>;
type MergeableTables<Schema extends OptionalTablesSchema> = Stampeded<
  IdObj<MergeableTable<Schema>>
>;

type MergeableValue<Schema extends OptionalValuesSchema> = Stampeded<Value<
  Schema,
  any,
  any
> | null>;
type MergeableValues<Schema extends OptionalValuesSchema> = Stampeded<
  IdObj<MergeableValue<Schema>>
>;

export type MergeableContent<Schemas extends OptionalSchemas> = Stampeded<
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
