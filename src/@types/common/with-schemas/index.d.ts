///common

import type {
  CellIdFromSchema,
  TableIdFromSchema,
  ValueIdFromSchema,
} from '../../_internal/store/with-schemas/index.d.ts';
import type {
  CellOrUndefined,
  NoTablesSchema,
  NoValuesSchema,
  OptionalTablesSchema,
  OptionalValuesSchema,
  ValueOrUndefined,
} from '../../store/with-schemas/index.d.ts';

/// Json
export type Json = string;

/// Ids
export type Ids = Id[];

/// Id
export type Id = string;

/// IdOrNull
export type IdOrNull = Id | null;

/// ParameterizedCallback
export type ParameterizedCallback<Parameter> = (parameter?: Parameter) => void;

/// Callback
export type Callback = () => void;

/// SortKey
export type SortKey = string | number | boolean;

/// GetNow
export type GetNow = () => number;

/// Hlc
export type Hlc = string;

/// Hash
export type Hash = number;

/// defaultSorter
export function defaultSorter(sortKey1: SortKey, sortKey2: SortKey): number;

/// getUniqueId
export function getUniqueId(length?: number): Id;

/// getHlcFunctions
export function getHlcFunctions(
  uniqueId?: Id,
  getNow?: GetNow,
): [
  getNextHlc: () => Hlc,
  seenHlc: (remoteHlc: Hlc) => void,
  encodeHlc: (logicalTime: number, counter: number, clientId?: Id) => Hlc,
  decodeHlc: (hlc: Hlc) => [logicalTime: number, counter: number, clientId: Id],
  getLastLogicalTime: () => number,
  getLastCounter: () => number,
  getClientId: () => Id,
];

/// getHash
export function getHash(string: string): Hash;

/// addOrRemoveHash
export function addOrRemoveHash(hash1: Hash, hash2: Hash): Hash;

/// getTablesHash
export function getTablesHash<
  Schema extends OptionalTablesSchema = NoTablesSchema,
>(
  tableHashes: {[TableId in TableIdFromSchema<Schema>]: Hash},
  tablesHlc: Hlc,
): Hash;

/// getTableInTablesHash
export function getTableInTablesHash<
  Schema extends OptionalTablesSchema = NoTablesSchema,
>(tableId: TableIdFromSchema<Schema>, tableHash: Hash): Hash;

/// getTableHash
export function getTableHash(
  rowHashes: {[rowId: Id]: Hash},
  tableHlc: Hlc,
): Hash;

/// getRowInTableHash
export function getRowInTableHash(rowId: Id, rowHash: Hash): Hash;

/// getRowHash
export function getRowHash<
  Schema extends OptionalTablesSchema = NoTablesSchema,
  TableId extends TableIdFromSchema<Schema> = Id,
>(
  cellHashes: {[CellId in CellIdFromSchema<Schema, TableId>]?: Hash},
  rowHlc: Hlc,
): Hash;

/// getCellInRowHash
export function getCellInRowHash<
  Schema extends OptionalTablesSchema = NoTablesSchema,
  TableId extends TableIdFromSchema<Schema> = Id,
>(cellId: CellIdFromSchema<Schema, TableId>, cellHash: Hash): Hash;

/// getCellHash
export function getCellHash<
  Schema extends OptionalTablesSchema = NoTablesSchema,
  TableId extends TableIdFromSchema<Schema> = Id,
  CellId extends CellIdFromSchema<Schema, TableId> = Id,
>(cell: CellOrUndefined<Schema, TableId, CellId>, cellHlc: Hlc): Hash;

/// getValuesHash
export function getValuesHash<
  Schema extends OptionalValuesSchema = NoValuesSchema,
>(
  valueHashes: {[ValueId in ValueIdFromSchema<Schema>]?: Hash},
  valuesHlc: Hlc,
): Hash;

/// getValueInValuesHash
export function getValueInValuesHash<
  Schema extends OptionalValuesSchema = NoValuesSchema,
>(valueId: ValueIdFromSchema<Schema>, valueHash: Hash): Hash;

/// getValueHash
export function getValueHash<
  Schema extends OptionalValuesSchema = NoValuesSchema,
>(value: ValueOrUndefined<Schema, Id>, valueHlc: Hlc): Hash;
