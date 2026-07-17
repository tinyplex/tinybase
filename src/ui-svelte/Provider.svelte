<script lang="ts">
  import {getContext, setContext, untrack} from 'svelte';
  import type {Id} from '../@types/common/index.d.ts';
  import type {ProviderProps} from '../@types/ui-svelte/index.d.ts';
  import {arrayFilter, arrayNew, arrayPush} from '../common/array.ts';
  import {type IdMap, mapGet, mapNew, mapSet} from '../common/map.ts';
  import {objDel, objGet} from '../common/obj.ts';
  import {isUndefined, size} from '../common/other.ts';
  import {type ContextValue, TINYBASE_CONTEXT_KEY} from './context.ts';

  const {
    store,
    storesById,
    metrics,
    metricsById,
    indexes,
    indexesById,
    relationships,
    relationshipsById,
    queries,
    queriesById,
    checkpoints,
    checkpointsById,
    persister,
    persistersById,
    synchronizer,
    synchronizersById,
    children,
  }: ProviderProps = $props();

  const parentCtx: ContextValue =
    (getContext(TINYBASE_CONTEXT_KEY) as ContextValue) ?? [];

  let extras: {[id: Id]: any}[] = $state(arrayNew(8, () => ({})));
  type ThingRegistration = [owner: object, thing: any];
  const registrationsByOffset: IdMap<ThingRegistration[]>[] = arrayNew(
    8,
    () => mapNew<Id, ThingRegistration[]>(),
  );

  const setThing = (offset: number, id: Id, thing?: any): void => {
    const thingsById = untrack(() => extras[offset]);
    if (objGet(thingsById, id) != thing) {
      extras[offset] = isUndefined(thing)
        ? objDel({...thingsById}, id)
        : {...thingsById, [id]: thing};
    }
  };

  const addThing = (
    offset: number,
    id: Id,
    thing: any,
    owner: object,
  ): void => {
    const registrationsById = registrationsByOffset[offset];
    const registrations = arrayFilter(
      mapGet(registrationsById, id) ?? [],
      ([registrationOwner]) => registrationOwner != owner,
    );
    arrayPush(registrations, [owner, thing]);
    mapSet(registrationsById, id, registrations);
    setThing(offset, id, thing);
  };

  const delThing = (offset: number, id: Id, owner: object): void => {
    const registrationsById = registrationsByOffset[offset];
    const registrations = arrayFilter(
      mapGet(registrationsById, id) ?? [],
      ([registrationOwner]) => registrationOwner != owner,
    );
    mapSet(
      registrationsById,
      id,
      isUndefined(registrations[0]) ? undefined : registrations,
    );
    setThing(offset, id, registrations[size(registrations) - 1]?.[1]);
  };

  type ById = {[id: Id]: any};

  const ctx = {
    get [0]() {
      return store ?? parentCtx[0];
    },
    get [1]() {
      return {...((parentCtx[1] as ById) ?? {}), ...storesById, ...extras[0]};
    },
    get [2]() {
      return metrics ?? parentCtx[2];
    },
    get [3]() {
      return {...((parentCtx[3] as ById) ?? {}), ...metricsById, ...extras[1]};
    },
    get [4]() {
      return indexes ?? parentCtx[4];
    },
    get [5]() {
      return {...((parentCtx[5] as ById) ?? {}), ...indexesById, ...extras[2]};
    },
    get [6]() {
      return relationships ?? parentCtx[6];
    },
    get [7]() {
      return {
        ...((parentCtx[7] as ById) ?? {}),
        ...relationshipsById,
        ...extras[3],
      };
    },
    get [8]() {
      return queries ?? parentCtx[8];
    },
    get [9]() {
      return {...((parentCtx[9] as ById) ?? {}), ...queriesById, ...extras[4]};
    },
    get [10]() {
      return checkpoints ?? parentCtx[10];
    },
    get [11]() {
      return {
        ...((parentCtx[11] as ById) ?? {}),
        ...checkpointsById,
        ...extras[5],
      };
    },
    get [12]() {
      return persister ?? parentCtx[12];
    },
    get [13]() {
      return {
        ...((parentCtx[13] as ById) ?? {}),
        ...persistersById,
        ...extras[6],
      };
    },
    get [14]() {
      return synchronizer ?? parentCtx[14];
    },
    get [15]() {
      return {
        ...((parentCtx[15] as ById) ?? {}),
        ...synchronizersById,
        ...extras[7],
      };
    },
    get [16]() {
      return addThing;
    },
    get [17]() {
      return delThing;
    },
  } as unknown as ContextValue;

  setContext(TINYBASE_CONTEXT_KEY, ctx);
</script>

{@render children()}
