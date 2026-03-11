<script lang="ts">
  import {useParamValuesListener} from 'tinybase/ui-svelte';
  import type {Queries} from 'tinybase';

  let {
    queries,
    queryId,
    listener,
  }: {queries: Queries; queryId: string; listener: (...args: any[]) => void} =
    $props();
  useParamValuesListener(
    () => queryId,
    (...args) => listener(...args),
    () => queries,
  );
</script>
