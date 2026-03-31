<script lang="ts">
  import {createResultCellIds} from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';
  import type {Queries} from 'tinybase/queries';

  let {
    queries,
    queryId,
    rowId,
  }: {
    queries: Queries;
    queryId: Id;
    rowId: Id;
  } = $props();
  const v = createResultCellIds(
    () => queryId,
    () => rowId,
    () => queries,
  );
</script>

{JSON.stringify(v.current)}
