///common

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
