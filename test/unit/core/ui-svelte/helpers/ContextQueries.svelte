<script lang="ts">
  import {Provider} from 'tinybase/ui-svelte';
  import type {Queries} from 'tinybase/queries';
  import type {Id} from 'tinybase';
  import ContextQueriesChild from './ContextQueriesChild.svelte';

  let {
    queries,
    queriesById,
    queriesId,
  }: {
    queries?: Queries;
    queriesById?: Record<Id, Queries>;
    queriesId?: Id;
  } = $props();
</script>

<Provider {queries} {queriesById}>
  <ContextQueriesChild {queriesId} />
</Provider>
