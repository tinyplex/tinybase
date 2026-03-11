<script lang="ts">
  import {useParamValueListener} from 'tinybase/ui-svelte';
  import type {Queries} from 'tinybase';

  let {
    queries,
    queryId,
    paramId,
    listener,
  }: {
    queries: Queries;
    queryId: string;
    paramId: string;
    listener: (...args: any[]) => void;
  } = $props();
  useParamValueListener(
    () => queryId,
    () => paramId,
    (...args) => listener(...args),
    () => queries,
  );
</script>
