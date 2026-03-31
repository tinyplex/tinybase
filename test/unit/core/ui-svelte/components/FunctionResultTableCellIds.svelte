<script lang="ts">
  import {createResultTableCellIds} from 'tinybase/ui-svelte';
  import type {Id, Queries} from 'tinybase';

  let {queries, queryId}: {queries: Queries; queryId: Id} = $props();
  const v = createResultTableCellIds(
    () => queryId,
    () => queries,
  );
</script>

{JSON.stringify(v.current)}
