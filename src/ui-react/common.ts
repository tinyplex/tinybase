import {
  CheckpointsOrCheckpointsId,
  IndexesOrIndexesId,
  MetricsOrMetricsId,
  RelationshipsOrRelationshipsId,
  StoreOrStoreId,
  useCheckpoints as useCheckpointsDecl,
  useIndexes as useIndexesDecl,
  useMetrics as useMetricsDecl,
  useRelationships as useRelationshipsDecl,
  useStore as useStoreDecl,
} from '../ui-react.d';
import {IdObj, objGet} from '../common/obj';
import {isString, isUndefined} from '../common/other';
import {Checkpoints} from '../checkpoints.d';
import {Id} from '../common.d';
import {Indexes} from '../indexes.d';
import {Metrics} from '../metrics.d';
import React from 'react';
import {Relationships} from '../relationships.d';
import {Store} from '../store.d';

const {createContext, useContext} = React;

export type ContextValue = [
  Store?,
  {[storeId: Id]: Store}?,
  Metrics?,
  {[metricsId: Id]: Metrics}?,
  Indexes?,
  {[indexesId: Id]: Indexes}?,
  Relationships?,
  {[relationshipsId: Id]: Relationships}?,
  Checkpoints?,
  {[checkpointsId: Id]: Checkpoints}?,
];

export const Context = createContext<ContextValue>([]);

const useThing = <
  Thing extends Store | Metrics | Indexes | Relationships | Checkpoints,
>(
  id: Id | undefined,
  offset: number,
): Thing | undefined => {
  const thingsAndThingsById = useContext(Context);
  return (
    isUndefined(id)
      ? thingsAndThingsById[offset]
      : objGet(thingsAndThingsById[offset + 1] as IdObj<Thing>, id)
  ) as Thing;
};

const useThingOrThingId = <
  Thing extends Store | Metrics | Indexes | Relationships | Checkpoints,
>(
  thingOrThingId: Thing | Id | undefined,
  offset: number,
): Thing | undefined => {
  const thing = useThing(thingOrThingId as Id, offset);
  if (isUndefined(thingOrThingId) || isString(thingOrThingId)) {
    return thing as Thing | undefined;
  }
  return thingOrThingId as Thing;
};

export const useStore: typeof useStoreDecl = (id?: Id): Store | undefined =>
  useThing(id, 0);

export const useMetrics: typeof useMetricsDecl = (
  id?: Id,
): Metrics | undefined => useThing(id, 2);

export const useIndexes: typeof useIndexesDecl = (
  id?: Id,
): Indexes | undefined => useThing(id, 4);

export const useRelationships: typeof useRelationshipsDecl = (
  id?: Id,
): Relationships | undefined => useThing(id, 6);

export const useCheckpoints: typeof useCheckpointsDecl = (
  id?: Id,
): Checkpoints | undefined => useThing(id, 8);

export const useStoreOrStoreId = (
  storeOrStoreId?: StoreOrStoreId,
): Store | undefined => useThingOrThingId(storeOrStoreId, 0);

export const useMetricsOrMetricsId = (
  metricsOrMetricsId?: MetricsOrMetricsId,
): Metrics | undefined => useThingOrThingId(metricsOrMetricsId, 2);

export const useIndexesOrIndexesId = (
  indexesOrIndexesId?: IndexesOrIndexesId,
): Indexes | undefined => useThingOrThingId(indexesOrIndexesId, 4);

export const useRelationshipsOrRelationshipsId = (
  relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId,
): Relationships | undefined =>
  useThingOrThingId(relationshipsOrRelationshipsId, 6);

export const useCheckpointsOrCheckpointsId = (
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): Checkpoints | undefined => useThingOrThingId(checkpointsOrCheckpointsId, 8);
