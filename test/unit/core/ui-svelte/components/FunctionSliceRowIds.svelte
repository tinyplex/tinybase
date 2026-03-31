<script lang="ts">
  import {createSliceRowIds} from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';
  import type {Indexes} from 'tinybase/indexes';

  let {
    indexes,
    indexId,
    sliceId,
  }: {
    indexes: Indexes;
    indexId: Id;
    sliceId: Id;
  } = $props();
  const v = createSliceRowIds(
    () => indexId,
    () => sliceId,
    () => indexes,
  );
</script>

{JSON.stringify(v.current)}
