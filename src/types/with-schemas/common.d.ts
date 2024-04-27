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

/// defaultSorter
export function defaultSorter(sortKey1: SortKey, sortKey2: SortKey): number;

/// getUniqueId
export function getUniqueId(): Id;
