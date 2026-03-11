<script lang="ts">
  import {useResultTableListener} from 'tinybase/ui-svelte';
  import type {Queries} from 'tinybase';

  let {
    queries,
    queryId,
    listener,
  }: {queries: Queries; queryId: string; listener: (...args: any[]) => void} =
    $props();
  useResultTableListener(
    () => queryId,
    (...args) => listener(...args),
    () => queries,
  );
</script>
