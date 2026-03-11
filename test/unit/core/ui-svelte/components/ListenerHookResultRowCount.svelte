<script lang="ts">
  import {useResultRowCountListener} from 'tinybase/ui-svelte';
  import type {Queries} from 'tinybase';

  let {
    queries,
    queryId,
    listener,
  }: {queries: Queries; queryId: string; listener: (...args: any[]) => void} =
    $props();
  useResultRowCountListener(
    () => queryId,
    (...args) => listener(...args),
    () => queries,
  );
</script>
