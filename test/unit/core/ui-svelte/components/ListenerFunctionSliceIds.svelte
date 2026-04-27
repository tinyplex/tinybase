<script lang="ts">
  import {onSliceIds} from 'tinybase/ui-svelte';
  import type {Indexes} from 'tinybase';

  let {
    indexes,
    indexId,
    listener,
  }: {indexes: Indexes; indexId: string; listener: (...args: any[]) => void} =
    $props();
  onSliceIds(
    () => indexId,
    (...args) => listener(...args),
    () => indexes,
  );
</script>
