<script lang="ts">
  import {onResultRow} from 'tinybase/ui-svelte';
  import type {Queries} from 'tinybase';

  let {
    queries,
    queryId,
    rowId,
    listener,
  }: {
    queries: Queries;
    queryId: string;
    rowId: string;
    listener: (...args: any[]) => void;
  } = $props();
  onResultRow(
    () => queryId,
    () => rowId,
    (...args) => listener(...args),
    () => queries,
  );
</script>
