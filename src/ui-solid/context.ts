import type {Accessor} from 'solid-js';
import {
  createContext,
  createRenderEffect,
  onCleanup,
  untrack,
  useContext,
} from 'solid-js';
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
import type {MaybeAccessor} from '../common/solid.ts';
import {getValue} from '../common/solid.ts';
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
export type ContextValueAccessor = {value: Accessor<ContextValue>};

const TINYBASE_CONTEXT = TINYBASE + '_uisc';
const EMPTY_CONTEXT = () => [] as ContextValue;
const EMPTY_CONTEXT_VALUE = {value: EMPTY_CONTEXT};
const GLOBAL_CONTEXT = GLOBAL as typeof GLOBAL &
  Record<
    string,
    ReturnType<typeof createContext<ContextValueAccessor>> | undefined
  >;

export const Context: ReturnType<typeof createContext<ContextValueAccessor>> =
  GLOBAL_CONTEXT[TINYBASE_CONTEXT]
    ? /*! istanbul ignore next */ GLOBAL_CONTEXT[TINYBASE_CONTEXT]
    : (GLOBAL_CONTEXT[TINYBASE_CONTEXT] =
        createContext<ContextValueAccessor>(EMPTY_CONTEXT_VALUE));

export const useThing = <UsedThing extends Thing>(
  id: MaybeAccessor<Id | undefined>,
  offset: Offsets,
): Accessor<UsedThing | undefined> => {
  const contextValue = useContext(Context)?.value ?? EMPTY_CONTEXT;
  return () => {
    const resolvedContextValue = contextValue();
    const resolvedId = getValue(id);
    return (
      isUndefined(resolvedId)
        ? resolvedContextValue[offset * 2]
        : isString(resolvedId)
          ? objGet(
              resolvedContextValue[offset * 2 + 1] as IdObj<UsedThing>,
              resolvedId,
            )
          : resolvedId
    ) as UsedThing;
  };
};

export const useThings = <UsedThing extends Thing>(
  offset: Offsets,
): Accessor<IdObj<UsedThing>> => {
  const contextValue = useContext(Context)?.value ?? EMPTY_CONTEXT;
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
  thingOrThingId: MaybeAccessor<UsedThing | Id | undefined>,
  offset: Offsets,
): Accessor<UsedThing | undefined> => {
  const thing = useThing(thingOrThingId as MaybeAccessor<Id>, offset);
  return () => {
    const resolvedThingOrThingId = getValue(thingOrThingId);
    return isUndefined(resolvedThingOrThingId) ||
      isString(resolvedThingOrThingId)
      ? (thing() as UsedThing | undefined)
      : (resolvedThingOrThingId as UsedThing);
  };
};

export const useProvideThing = <Offset extends Offsets>(
  thingId: Id,
  thing: ThingsByOffset[Offset],
  offset: Offset,
): void => {
  const contextValue = useContext(Context)?.value ?? EMPTY_CONTEXT;
  createRenderEffect(() => {
    const {16: addExtraThingById, 17: delExtraThingById} =
      untrack(contextValue);
    addExtraThingById?.(offset, thingId, thing);
    onCleanup(() => delExtraThingById?.(offset, thingId));
  });
};

export const useThingIds = (offset: Offsets): Accessor<Ids> => {
  const contextValue = useContext(Context)?.value ?? EMPTY_CONTEXT;
  return () => objIds((contextValue()[offset * 2 + 1] ?? {}) as IdObj<unknown>);
};
