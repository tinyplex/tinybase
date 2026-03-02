import type {Id, Ids} from '../@types/common/index.d.ts';
import type {Indexes} from '../@types/indexes/index.d.ts';
import type {Relationships} from '../@types/relationships/index.d.ts';
import type {Store} from '../@types/store/index.d.ts';
import {isFunction, isUndefined} from './other.ts';

export type DependencyList = ReadonlyArray<unknown>;

export const getValue = <Value>(value: Value | (() => Value)): Value =>
  (isFunction(value) ? (value as () => Value)() : value) as Value;

export const getProps = <Props extends {[key: string]: any}>(
  getProps: ((...ids: Ids) => Props) | undefined,
  ...ids: Ids
): Props => (isUndefined(getProps) ? ({} as Props) : getProps(...ids));

export const getRelationshipsStoreTableIds = (
  relationships: Relationships | undefined,
  relationshipId: Id,
): [
  Relationships | undefined,
  Store | undefined,
  Id | undefined,
  Id | undefined,
] => [
  relationships,
  relationships?.getStore(),
  relationships?.getLocalTableId(relationshipId),
  relationships?.getRemoteTableId(relationshipId),
];

export const getIndexStoreTableId = (
  indexes: Indexes | undefined,
  indexId: Id,
): [Indexes | undefined, Store | undefined, Id | undefined] => [
  indexes,
  indexes?.getStore(),
  indexes?.getTableId(indexId),
];
