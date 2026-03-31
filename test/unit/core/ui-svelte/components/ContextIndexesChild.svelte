<script lang="ts">
  import {
    IndexView,
    SliceView,
    createSliceIds,
    createSliceRowIds,
  } from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';

  let {indexesId}: {indexesId?: Id} = $props();

  const sliceIds = createSliceIds(
    () => 'i1',
    () => indexesId,
  );
  const sliceRowIds = createSliceRowIds(
    () => 'i1',
    () => '1',
    () => indexesId,
  );
</script>

<IndexView indexId="i1" indexes={indexesId} />{JSON.stringify(
  sliceIds.current,
)}<SliceView indexId="i1" sliceId="1" indexes={indexesId} />{JSON.stringify(
  sliceRowIds.current,
)}
