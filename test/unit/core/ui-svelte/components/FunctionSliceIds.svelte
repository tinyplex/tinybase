<script lang="ts">
  import {getSliceIds} from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';
  import type {Indexes} from 'tinybase/indexes';

  let {indexes, indexId}: {indexes: Indexes; indexId: Id} = $props();
  const v = getSliceIds(
    () => indexId,
    () => indexes,
  );
</script>

{JSON.stringify(v.current)}
