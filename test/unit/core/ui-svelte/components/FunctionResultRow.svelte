<script lang="ts">
  import {getResultRow} from 'tinybase/ui-svelte';
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
  const v = getResultRow(
    () => queryId,
    () => rowId,
    () => queries,
  );
</script>

{JSON.stringify(v.current)}
