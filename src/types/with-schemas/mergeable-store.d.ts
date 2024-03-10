/// mergeable-store

import {
  CellIdFromSchema,
  TableIdFromSchema,
  ValueIdFromSchema,
} from './internal/store';
import {
  CellOrUndefined,
  NoSchemas,
  OptionalSchemas,
  Store,
  ValueOrUndefined,
} from './store.d';
import {Id} from './common';
import {IdObj} from '../../common/obj';

/// Hash
export type Hash = number;

/// Time
export type Time = string;

/// Stamp
export type Stamp<Thing> = [time: Time, thing: Thing];

/// MergeableContent
export type MergeableContent<Schemas extends OptionalSchemas> = Stamp<
  [
    mergeableTables: Stamp<{
      [TableId in TableIdFromSchema<Schemas[0]>]?: Stamp<
        | IdObj<
            Stamp<{
              [CellId in CellIdFromSchema<Schemas[0], TableId>]?: Stamp<
                CellOrUndefined<Schemas[0], TableId, CellId>
              >;
            }>
          >
        | undefined
      >;
    }>,
    mergeableValues: Stamp<{
      [ValueId in ValueIdFromSchema<Schemas[1]>]?: Stamp<
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
        | IdObj<
            Stamp<{
              [CellId in CellIdFromSchema<Schemas[0], TableId>]?: Stamp<
                CellOrUndefined<Schemas[0], TableId, CellId>
              >;
            }>
          >
        | undefined
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

  /// MergeableStore.setMergeableContent
  setMergeableContent(
    mergeableContent: MergeableContent<Schemas>,
  ): MergeableStore<Schemas>;

  /// MergeableStore.getTransactionMergeableChanges
  getTransactionMergeableChanges(): MergeableChanges<Schemas>;

  /// MergeableStore.applyMergeableChanges
  applyMergeableChanges(
    mergeableChanges: MergeableChanges<Schemas>,
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
}

/// createMergeableStore
export function createMergeableStore(id: Id): MergeableStore<NoSchemas>;
