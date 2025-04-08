import type React from 'react';
import type {Checkpoints} from '../@types/checkpoints/index.d.ts';
import type {Id, Ids} from '../@types/common/index.d.ts';
import type {Indexes} from '../@types/indexes/index.d.ts';
import type {Metrics} from '../@types/metrics/index.d.ts';
import type {AnyPersister} from '../@types/persisters/index.d.ts';
import type {Queries} from '../@types/queries/index.d.ts';
import type {Relationships} from '../@types/relationships/index.d.ts';
import type {Store} from '../@types/store/index.d.ts';
import type {Synchronizer} from '../@types/synchronizers/index.d.ts';
import {IdObj, objGet, objIds} from '../common/obj.ts';
import {GLOBAL, isString, isUndefined} from '../common/other.ts';
import {createContext, useContext, useEffect} from '../common/react.ts';
import {TINYBASE} from '../common/strings.ts';

export type Thing =
  | Store
  | Metrics
  | Indexes
  | Relationships
  | Queries
  | Checkpoints
  | AnyPersister
  | Synchronizer;

export type ThingsByOffset = [
  Store,
  Metrics,
  Indexes,
  Relationships,
  Queries,
  Checkpoints,
  AnyPersister,
  Synchronizer,
];

export enum Offsets {
  Store = 0,
  Metrics = 1,
  Indexes = 2,
  Relationships = 3,
  Queries = 4,
  Checkpoints = 5,
  Persister = 6,
  Synchronizer = 7,
}

export type ContextValue = [
  store?: Store,
  storesById?: {[storeId: Id]: Store},
  metrics?: Metrics,
  metricsById?: {[metricsId: Id]: Metrics},
  indexes?: Indexes,
  indexesById?: {[indexesId: Id]: Indexes},
  relationships?: Relationships,
  relationshipsById?: {[relationshipsId: Id]: Relationships},
  queries?: Queries,
  queriesById?: {[queriesId: Id]: Queries},
  checkpoints?: Checkpoints,
  checkpointsById?: {[checkpointsId: Id]: Checkpoints},
  persister?: AnyPersister,
  persistersById?: {
    [persisterId: Id]: AnyPersister;
  },
  synchronizer?: Synchronizer,
  synchronizersById?: {[synchronizerId: Id]: Synchronizer},
  addExtraThingById?: <Offset extends Offsets>(
    offset: Offset,
    id: string,
    thing: ThingsByOffset[Offset],
  ) => void,
  delExtraThingById?: (offset: Offsets, id: string) => void,
];

const TINYBASE_CONTEXT = TINYBASE + '_uirc';

export const Context: React.Context<ContextValue> = (GLOBAL as any)[
  TINYBASE_CONTEXT
]
  ? /*! istanbul ignore next */
    (GLOBAL as any)[TINYBASE_CONTEXT]
  : ((GLOBAL as any)[TINYBASE_CONTEXT] = createContext<ContextValue>([]));

export const useThing = <UsedThing extends Thing>(
  id: Id | undefined,
  offset: Offsets,
): UsedThing | undefined => {
  const contextValue = useContext(Context);
  return (
    isUndefined(id)
      ? contextValue[offset * 2]
      : isString(id)
        ? objGet(contextValue[offset * 2 + 1] as IdObj<UsedThing>, id)
        : id
  ) as UsedThing;
};

export const useThings = <UsedThing extends Thing>(
  offset: Offsets,
): IdObj<UsedThing> =>
  ({...useContext(Context)[offset * 2 + 1]}) as IdObj<UsedThing>;

export const useThingOrThingById = <
  Thing extends
    | Store
    | Metrics
    | Indexes
    | Relationships
    | Queries
    | Checkpoints
    | AnyPersister
    | Synchronizer,
>(
  thingOrThingId: Thing | Id | undefined,
  offset: Offsets,
): Thing | undefined => {
  const thing = useThing(thingOrThingId as Id, offset);
  return isUndefined(thingOrThingId) || isString(thingOrThingId)
    ? (thing as Thing | undefined)
    : (thingOrThingId as Thing);
};

export const useProvideThing = <Offset extends Offsets>(
  thingId: Id,
  thing: ThingsByOffset[Offset],
  offset: Offset,
): void => {
  const {16: addExtraThingById, 17: delExtraThingById} = useContext(Context);
  useEffect(() => {
    addExtraThingById?.(offset, thingId, thing);
    return () => delExtraThingById?.(offset, thingId);
  }, [addExtraThingById, thingId, thing, offset, delExtraThingById]);
};

export const useThingIds = (offset: Offsets): Ids =>
  objIds((useContext(Context)[offset * 2 + 1] ?? {}) as IdObj<unknown>);
