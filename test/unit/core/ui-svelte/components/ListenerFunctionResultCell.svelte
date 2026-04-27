<script lang="ts">
  import {onResultCell} from 'tinybase/ui-svelte';
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
  onResultCell(
    () => queryId,
    () => rowId,
    () => cellId,
    (...args) => listener(...args),
    () => queries,
  );
</script>
