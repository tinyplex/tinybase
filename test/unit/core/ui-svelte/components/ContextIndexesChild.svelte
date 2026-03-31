<script lang="ts">
  import {
    IndexView,
    SliceView,
    getSliceIds,
    getSliceRowIds,
  } from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';

  let {indexesId}: {indexesId?: Id} = $props();

  const sliceIds = getSliceIds(
    () => 'i1',
    () => indexesId,
  );
  const sliceRowIds = getSliceRowIds(
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
