<script lang="ts">
  import {createSliceIds} from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';
  import type {Indexes} from 'tinybase/indexes';

  let {indexes, indexId}: {indexes: Indexes; indexId: Id} = $props();
  const v = createSliceIds(
    () => indexId,
    () => indexes,
  );
</script>

{JSON.stringify(v.current)}
