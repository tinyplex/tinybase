/// mergeable-store

import {
  CellIdFromSchema,
  TableIdFromSchema,
  ValueIdFromSchema,
} from './internal/store';
import {
  CellOrUndefined,
  NoSchemas,
  NoTablesSchema,
  NoValuesSchema,
  OptionalSchemas,
  OptionalTablesSchema,
  OptionalValuesSchema,
  Store,
  TablesSchema,
  ValueOrUndefined,
  ValuesSchema,
} from './store.d';
import {Id} from './common';
import {IdObj} from '../../common/obj';

/// Hash
export type Hash = number;

/// Time
export type Time = string;

/// HashStamp
export type HashStamp<Thing> = [time: Time, thing: Thing, hash: Hash];

/// Stamp
export type Stamp<Thing> = [time: Time, thing: Thing];

/// MergeableContent
export type MergeableContent<Schemas extends OptionalSchemas> = HashStamp<
  [
    mergeableTables: HashStamp<{
      [TableId in TableIdFromSchema<Schemas[0]>]?: HashStamp<{
        [rowId: Id]: HashStamp<{
          [CellId in CellIdFromSchema<Schemas[0], TableId>]?: HashStamp<
            CellOrUndefined<Schemas[0], TableId, CellId>
          >;
        }>;
      }>;
    }>,
    mergeableValues: HashStamp<{
      [ValueId in ValueIdFromSchema<Schemas[1]>]?: HashStamp<
        ValueOrUndefined<Schemas[1], ValueId>
      >;
    }>,
  ]
>;

/// MergeableChanges
export type MergeableChanges<Schemas extends OptionalSchemas> = Stamp<
  [
    mergeableTables: Stamp<{
      [TableId in TableIdFromSchema<Schemas[0]>]?: Stamp<
        IdObj<
          Stamp<{
            [CellId in CellIdFromSchema<Schemas[0], TableId>]?: Stamp<
              CellOrUndefined<Schemas[0], TableId, CellId>
            >;
          }>
        >
      >;
    }>,
    mergeableValues: Stamp<{
      [ValueId in ValueIdFromSchema<Schemas[1]>]?: Stamp<
        ValueOrUndefined<Schemas[1], ValueId>
      >;
    }>,
  ]
>;

/// MergeableStore
export interface MergeableStore<Schemas extends OptionalSchemas>
  extends Store<Schemas> {
  //
  /// MergeableStore.merge
  merge(mergeableStore: MergeableStore<Schemas>): MergeableStore<Schemas>;

  /// MergeableStore.getMergeableContent
  getMergeableContent(): MergeableContent<Schemas>;

  /// MergeableStore.getMergeableContentDelta
  getMergeableContentDelta(
    relativeTo: MergeableContent<Schemas>,
  ): MergeableChanges<Schemas>;

  /// MergeableStore.setMergeableContent
  setMergeableContent(
    mergeableContent: MergeableContent<Schemas>,
  ): MergeableStore<Schemas>;

  /// MergeableStore.getTransactionMergeableChanges
  getTransactionMergeableChanges(): MergeableChanges<Schemas>;

  /// MergeableStore.applyMergeableChanges
  applyMergeableChanges(
    mergeableChanges: MergeableChanges<Schemas> | MergeableContent<Schemas>,
  ): MergeableStore<Schemas>;

  /// MergeableStore.getContentHash
  getContentHash(): Hash;

  /// MergeableStore.getTablesHash
  getTablesHash(): Hash;

  /// MergeableStore.getTableHash
  getTableHash(tableId: TableIdFromSchema<Schemas[0]>): Hash;

  /// MergeableStore.getRowHash
  getRowHash<TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId,
    rowId: Id,
  ): Hash;

  /// MergeableStore.getCellHash
  getCellHash<TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId,
    rowId: Id,
    cellId: CellIdFromSchema<Schemas[0], TableId>,
  ): Hash;

  /// MergeableStore.getValuesHash
  getValuesHash(): Hash;

  /// MergeableStore.getValueHash
  getValueHash(valueId: ValueIdFromSchema<Schemas[1]>): Hash;

  /// Store.setTablesSchema
  setTablesSchema<TS extends TablesSchema>(
    tablesSchema: TS,
  ): MergeableStore<[typeof tablesSchema, Schemas[1]]>;

  /// Store.setValuesSchema
  setValuesSchema<VS extends ValuesSchema>(
    valuesSchema: VS,
  ): MergeableStore<[Schemas[0], typeof valuesSchema]>;

  /// Store.setSchema
  setSchema<TS extends TablesSchema, VS extends ValuesSchema>(
    tablesSchema: TS,
    valuesSchema?: VS,
  ): MergeableStore<
    [
      typeof tablesSchema,
      Exclude<ValuesSchema, typeof valuesSchema> extends never
        ? NoValuesSchema
        : NonNullable<typeof valuesSchema>,
    ]
  >;

  /// Store.delTablesSchema
  delTablesSchema<
    ValuesSchema extends OptionalValuesSchema = Schemas[1],
  >(): MergeableStore<[NoTablesSchema, ValuesSchema]>;

  /// Store.delValuesSchema
  delValuesSchema<
    TablesSchema extends OptionalTablesSchema = Schemas[0],
  >(): MergeableStore<[TablesSchema, NoValuesSchema]>;

  /// Store.delSchema
  delSchema(): MergeableStore<NoSchemas>;
}

/// createMergeableStore
export function createMergeableStore(id: Id): MergeableStore<NoSchemas>;
