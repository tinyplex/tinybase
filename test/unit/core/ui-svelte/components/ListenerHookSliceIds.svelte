<script lang="ts">
  import {useSliceIdsListener} from 'tinybase/ui-svelte';
  import type {Indexes} from 'tinybase';

  let {
    indexes,
    indexId,
    listener,
  }: {indexes: Indexes; indexId: string; listener: (...args: any[]) => void} =
    $props();
  useSliceIdsListener(
    () => indexId,
    (...args) => listener(...args),
    () => indexes,
  );
</script>
