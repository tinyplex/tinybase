<script lang="ts">
  import {onSliceRowIds} from 'tinybase/ui-svelte';
  import type {Indexes} from 'tinybase';

  let {
    indexes,
    indexId,
    sliceId,
    listener,
  }: {
    indexes: Indexes;
    indexId: string;
    sliceId: string;
    listener: (...args: any[]) => void;
  } = $props();
  onSliceRowIds(
    () => indexId,
    () => sliceId,
    (...args) => listener(...args),
    () => indexes,
  );
</script>
