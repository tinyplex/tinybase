<script lang="ts">
  import {getResultSortedRowIds} from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';
  import type {Queries} from 'tinybase/queries';

  let {
    queries,
    queryId,
    cellId,
    descending = false,
    offset = 0,
    limit,
  }: {
    queries: Queries;
    queryId: Id;
    cellId?: Id;
    descending?: boolean;
    offset?: number;
    limit?: number;
  } = $props();
  const v = getResultSortedRowIds(
    () => queryId,
    () => cellId,
    () => descending,
    () => offset,
    () => limit,
    () => queries,
  );
</script>

{JSON.stringify(v.current)}
