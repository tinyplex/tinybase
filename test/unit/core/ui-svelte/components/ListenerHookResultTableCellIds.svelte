<script lang="ts">
  import {useResultTableCellIdsListener} from 'tinybase/ui-svelte';
  import type {Queries} from 'tinybase';

  let {
    queries,
    queryId,
    listener,
  }: {queries: Queries; queryId: string; listener: (...args: any[]) => void} =
    $props();
  useResultTableCellIdsListener(
    () => queryId,
    (...args) => listener(...args),
    () => queries,
  );
</script>
