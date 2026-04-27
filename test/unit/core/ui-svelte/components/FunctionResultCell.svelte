<script lang="ts">
  import {getResultCell} from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';
  import type {Queries} from 'tinybase/queries';

  let {
    queries,
    queryId,
    rowId,
    cellId,
  }: {
    queries: Queries;
    queryId: Id;
    rowId: Id;
    cellId: Id;
  } = $props();
  const v = getResultCell(
    () => queryId,
    () => rowId,
    () => cellId,
    () => queries,
  );
</script>

{JSON.stringify(v.current)}
