<script lang="ts">
  import {useResultSortedRowIds} from 'tinybase/ui-svelte';
  import type {Id, Queries} from 'tinybase';

  let {queries, queryId, cellId}: {queries: Queries; queryId: Id; cellId?: Id} =
    $props();
  // Pass undefined for descending and offset to trigger their default values
  const v = useResultSortedRowIds(
    () => queryId,
    () => cellId,
    undefined,
    undefined,
    undefined,
    () => queries,
  );
</script>

{JSON.stringify(v.current)}
