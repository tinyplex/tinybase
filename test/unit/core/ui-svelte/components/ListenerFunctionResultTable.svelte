<script lang="ts">
  import {onResultTable} from 'tinybase/ui-svelte';
  import type {Queries} from 'tinybase';

  let {
    queries,
    queryId,
    listener,
  }: {queries: Queries; queryId: string; listener: (...args: any[]) => void} =
    $props();
  onResultTable(
    () => queryId,
    (...args) => listener(...args),
    () => queries,
  );
</script>
