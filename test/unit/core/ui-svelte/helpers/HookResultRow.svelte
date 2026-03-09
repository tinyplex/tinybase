<script lang="ts">
  import {useResultRow} from 'tinybase/ui-svelte';
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
  const v = useResultRow(
    () => queryId,
    () => rowId,
    () => queries,
  );
</script>

{JSON.stringify(v.current)}
