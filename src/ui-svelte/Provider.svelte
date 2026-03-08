<script lang="ts">
  import {getContext, setContext, type Snippet} from 'svelte';
  import type {Checkpoints} from '../@types/checkpoints/index.d.ts';
  import type {Id} from '../@types/common/index.d.ts';
  import type {Indexes} from '../@types/indexes/index.d.ts';
  import type {Metrics} from '../@types/metrics/index.d.ts';
  import type {AnyPersister} from '../@types/persisters/index.d.ts';
  import type {Queries} from '../@types/queries/index.d.ts';
  import type {Relationships} from '../@types/relationships/index.d.ts';
  import type {Store} from '../@types/store/index.d.ts';
  import type {Synchronizer} from '../@types/synchronizers/index.d.ts';
  import {type ContextValue, TINYBASE_CONTEXT_KEY} from './context.ts';

  type Props = {
    store?: Store;
    storesById?: {[id: Id]: Store};
    metrics?: Metrics;
    metricsById?: {[id: Id]: Metrics};
    indexes?: Indexes;
    indexesById?: {[id: Id]: Indexes};
    relationships?: Relationships;
    relationshipsById?: {[id: Id]: Relationships};
    queries?: Queries;
    queriesById?: {[id: Id]: Queries};
    checkpoints?: Checkpoints;
    checkpointsById?: {[id: Id]: Checkpoints};
    persister?: AnyPersister;
    persistersById?: {[id: Id]: AnyPersister};
    synchronizer?: Synchronizer;
    synchronizersById?: {[id: Id]: Synchronizer};
    children: Snippet;
  };

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
  }: Props = $props();

  const parentCtx: ContextValue =
    (getContext(TINYBASE_CONTEXT_KEY) as ContextValue) ?? [];

  let extras: {[id: Id]: any}[] = $state(Array.from({length: 8}, () => ({})));

  const addThing = (offset: number, id: Id, thing: any): void => {
    extras[offset] = {...extras[offset], [id]: thing};
  };

  const delThing = (offset: number, id: Id): void => {
    const {[id]: _, ...rest} = extras[offset] as {[id: Id]: any};
    extras[offset] = rest;
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
