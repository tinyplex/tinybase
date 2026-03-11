<script lang="ts">
  import {useResultRowIdsListener} from 'tinybase/ui-svelte';
  import type {Queries} from 'tinybase';

  let {
    queries,
    queryId,
    listener,
  }: {queries: Queries; queryId: string; listener: (...args: any[]) => void} =
    $props();
  useResultRowIdsListener(
    () => queryId,
    (...args) => listener(...args),
    () => queries,
  );
</script>
