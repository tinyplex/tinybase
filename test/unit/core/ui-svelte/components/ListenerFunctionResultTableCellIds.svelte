<script lang="ts">
  import {onResultTableCellIds} from 'tinybase/ui-svelte';
  import type {Queries} from 'tinybase';

  let {
    queries,
    queryId,
    listener,
  }: {queries: Queries; queryId: string; listener: (...args: any[]) => void} =
    $props();
  onResultTableCellIds(
    () => queryId,
    (...args) => listener(...args),
    () => queries,
  );
</script>
