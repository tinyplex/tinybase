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
  import ContextNestedDefaultsChild from './ContextNestedDefaultsChild.svelte';

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
  {store}
  {metrics}
  {indexes}
  {relationships}
  {queries}
  {checkpoints}
  {persister}
  {synchronizer}
>
  <Provider>
    <ContextNestedDefaultsChild />
  </Provider>
</Provider>
