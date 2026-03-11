<script lang="ts">
  import {useResultCellListener} from 'tinybase/ui-svelte';
  import type {Queries} from 'tinybase';

  let {
    queries,
    queryId,
    rowId,
    cellId,
    listener,
  }: {
    queries: Queries;
    queryId: string;
    rowId: string;
    cellId: string;
    listener: (...args: any[]) => void;
  } = $props();
  useResultCellListener(
    () => queryId,
    () => rowId,
    () => cellId,
    (...args) => listener(...args),
    () => queries,
  );
</script>
