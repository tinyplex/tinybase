<script lang="ts">
  import {onParamValues} from 'tinybase/ui-svelte';
  import type {Queries} from 'tinybase';

  let {
    queries,
    queryId,
    listener,
  }: {queries: Queries; queryId: string; listener: (...args: any[]) => void} =
    $props();
  onParamValues(
    () => queryId,
    (...args) => listener(...args),
    () => queries,
  );
</script>
