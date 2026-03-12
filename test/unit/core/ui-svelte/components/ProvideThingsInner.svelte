<script lang="ts">
  import {
    provideStore,
    provideMetrics,
    provideIndexes,
    provideRelationships,
    provideQueries,
    provideCheckpoints,
    providePersister,
    provideSynchronizer,
  } from 'tinybase/ui-svelte';
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

  $effect(() => {
    provideStore('s1', store);
    provideMetrics('m1', metrics);
    provideIndexes('i1', indexes);
    provideRelationships('r1', relationships);
    provideQueries('q1', queries);
    provideCheckpoints('c1', checkpoints);
    providePersister('p1', persister);
    provideSynchronizer('syn1', synchronizer);
  });
</script>

provided
