///common

import type {CellOrUndefined, ValueOrUndefined} from '../store/index.d.ts';

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
export type SortKey = string | number | boolean | null;

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
export function getTablesHash(tableHashes: {[tableId: Id]: Hash}): Hash;

/// getTableInTablesHash
export function getTableInTablesHash(tableId: Id, tableHash: Hash): Hash;

/// getTableHash
export function getTableHash(rowHashes: {[rowId: Id]: Hash}): Hash;

/// getRowInTableHash
export function getRowInTableHash(rowId: Id, rowHash: Hash): Hash;

/// getRowHash
export function getRowHash(cellHashes: {[cellId: Id]: Hash}): Hash;

/// getCellInRowHash
export function getCellInRowHash(cellId: Id, cellHash: Hash): Hash;

/// getCellHash
export function getCellHash(cell: CellOrUndefined, cellHlc: Hlc): Hash;

/// getValuesHash
export function getValuesHash(valueHashes: {[valueId: Id]: Hash}): Hash;

/// getValueInValuesHash
export function getValueInValuesHash(valueId: Id, valueHash: Hash): Hash;

/// getValueHash
export function getValueHash(value: ValueOrUndefined, valueHlc: Hlc): Hash;
