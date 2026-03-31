<script lang="ts">
  import {getResultTable} from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';
  import type {Queries} from 'tinybase/queries';

  let {queries, queryId}: {queries: Queries; queryId: Id} = $props();
  const v = getResultTable(
    () => queryId,
    () => queries,
  );
</script>

{JSON.stringify(v.current)}
