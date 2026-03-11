<script lang="ts">
  import {useResultSortedRowIdsListener} from 'tinybase/ui-svelte';
  import type {Queries} from 'tinybase';

  let {
    queries,
    queryId,
    cellId,
    listener,
  }: {
    queries: Queries;
    queryId: string;
    cellId: string;
    listener: (...args: any[]) => void;
  } = $props();
  useResultSortedRowIdsListener(
    () => queryId,
    () => cellId,
    () => false,
    () => 0,
    () => undefined,
    (...args) => listener(...args),
    () => queries,
  );
</script>
