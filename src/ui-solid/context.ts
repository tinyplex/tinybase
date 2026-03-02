import type {Accessor} from 'solid-js';
import {createContext, createEffect, onCleanup, useContext} from 'solid-js';
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
import {GLOBAL, isFunction, isString, isUndefined} from '../common/other.ts';
import {TINYBASE} from '../common/strings.ts';
import type {Offsets} from './Provider.tsx';

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
  persistersById?: {[persisterId: Id]: AnyPersister},
  synchronizer?: Synchronizer,
  synchronizersById?: {[synchronizerId: Id]: Synchronizer},
  addExtraThingById?: <Offset extends Offsets>(
    offset: Offset,
    id: string,
    thing: ThingsByOffset[Offset],
  ) => void,
  delExtraThingById?: (offset: Offsets, id: string) => void,
];

const TINYBASE_CONTEXT = TINYBASE + '_uisc';
const EMPTY_CONTEXT = () => [] as ContextValue;

export const Context: ReturnType<typeof createContext<Accessor<ContextValue>>> =
  (GLOBAL as any)[TINYBASE_CONTEXT]
    ? /*! istanbul ignore next */ (GLOBAL as any)[TINYBASE_CONTEXT]
    : ((GLOBAL as any)[TINYBASE_CONTEXT] =
        createContext<Accessor<ContextValue>>(EMPTY_CONTEXT));

export const useThing = <UsedThing extends Thing>(
  id: Id | undefined,
  offset: Offsets,
): Accessor<UsedThing | undefined> => {
  const contextValue = useContext(Context) ?? EMPTY_CONTEXT;
  return () => {
    const resolvedContextValue = contextValue();
    return (
      isUndefined(id)
        ? resolvedContextValue[offset * 2]
        : isString(id)
          ? objGet(
              resolvedContextValue[offset * 2 + 1] as IdObj<UsedThing>,
              id,
            )
          : id
    ) as UsedThing;
  };
};

export const useThings = <UsedThing extends Thing>(
  offset: Offsets,
): Accessor<IdObj<UsedThing>> => {
  const contextValue = useContext(Context) ?? EMPTY_CONTEXT;
  return () => ({...contextValue()[offset * 2 + 1]}) as IdObj<UsedThing>;
};

export const useThingOrThingById = <
  UsedThing extends
    | Store
    | Metrics
    | Indexes
    | Relationships
    | Queries
    | Checkpoints
    | AnyPersister
    | Synchronizer,
>(
  thingOrThingId: UsedThing | Id | undefined,
  offset: Offsets,
): Accessor<UsedThing | undefined> => {
  const thing = useThing(thingOrThingId as Id, offset);
  return () =>
    isUndefined(thingOrThingId) || isString(thingOrThingId)
      ? (thing() as UsedThing | undefined)
      : isFunction(thingOrThingId)
        ? (thingOrThingId() as UsedThing)
        : (thingOrThingId as UsedThing);
};

export const useProvideThing = <Offset extends Offsets>(
  thingId: Id,
  thing: ThingsByOffset[Offset],
  offset: Offset,
): void => {
  const contextValue = useContext(Context) ?? EMPTY_CONTEXT;
  createEffect(() => {
    const {16: addExtraThingById, 17: delExtraThingById} = contextValue();
    addExtraThingById?.(offset, thingId, thing);
    onCleanup(() => delExtraThingById?.(offset, thingId));
  });
};

export const useThingIds = (offset: Offsets): Accessor<Ids> => {
  const contextValue = useContext(Context) ?? EMPTY_CONTEXT;
  return () =>
    objIds((contextValue()[offset * 2 + 1] ?? {}) as IdObj<unknown>);
};
