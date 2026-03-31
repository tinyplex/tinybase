<script lang="ts">
  import {onResultRowIds} from 'tinybase/ui-svelte';
  import type {Queries} from 'tinybase';

  let {
    queries,
    queryId,
    listener,
  }: {queries: Queries; queryId: string; listener: (...args: any[]) => void} =
    $props();
  onResultRowIds(
    () => queryId,
    (...args) => listener(...args),
    () => queries,
  );
</script>
