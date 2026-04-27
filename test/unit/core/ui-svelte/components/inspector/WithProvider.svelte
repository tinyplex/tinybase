<script lang="ts">
  import type {Indexes, Metrics, Queries, Relationships, Store} from 'tinybase';
  import {Provider} from 'tinybase/ui-svelte';
  import {Inspector} from 'tinybase/ui-svelte-inspector';

  let {
    store,
    metrics,
    indexes,
    relationships,
    queries,
  }: {
    readonly store: Store;
    readonly metrics?: Metrics;
    readonly indexes?: Indexes;
    readonly relationships?: Relationships;
    readonly queries?: Queries;
  } = $props();
</script>

<Provider {store} {metrics} {indexes} {relationships} {queries}>
  <Inspector open={true} />
</Provider>
