<script lang="ts">
  import {useSliceRowIds} from 'tinybase/ui-svelte';
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
  const v = useSliceRowIds(
    () => indexId,
    () => sliceId,
    () => indexes,
  );
</script>

{JSON.stringify(v.current)}
