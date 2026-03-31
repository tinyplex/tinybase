<script lang="ts">
  import {createResultRowCount} from 'tinybase/ui-svelte';
  import type {Id, Queries} from 'tinybase';

  let {queries, queryId}: {queries: Queries; queryId: Id} = $props();
  const v = createResultRowCount(
    () => queryId,
    () => queries,
  );
</script>

{v.current}
