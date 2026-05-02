<script lang="ts">
  import {Provider} from 'tinybase/ui-svelte';
  import type {
    Checkpoints,
    Indexes,
    Metrics,
    Queries,
    Relationships,
    Store,
  } from 'tinybase';
  import type {AnyPersister} from 'tinybase/persisters';
  import type {Synchronizer} from 'tinybase/synchronizers';
  import ContextPrimitiveThingsChild from './ContextPrimitiveThingsChild.svelte';

  let {
    store,
    metrics,
    indexes,
    relationships,
    queries,
    checkpoints,
    persister,
    synchronizer,
  }: {
    store: Store;
    metrics: Metrics;
    indexes: Indexes;
    relationships: Relationships;
    queries: Queries;
    checkpoints: Checkpoints;
    persister: AnyPersister;
    synchronizer: Synchronizer;
  } = $props();
</script>

<Provider
  storesById={{store1: store}}
  metricsById={{metrics1: metrics}}
  indexesById={{indexes1: indexes}}
  relationshipsById={{relationships1: relationships}}
  queriesById={{queries1: queries}}
  checkpointsById={{checkpoints1: checkpoints}}
  persistersById={{persister1: persister}}
  synchronizersById={{synchronizer1: synchronizer}}
>
  <ContextPrimitiveThingsChild
    {store}
    {metrics}
    {indexes}
    {relationships}
    {queries}
    {checkpoints}
    {persister}
    {synchronizer}
  />
</Provider>
