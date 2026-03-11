<script lang="ts">
  import {useSliceIds} from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';
  import type {Indexes} from 'tinybase/indexes';

  let {indexes, indexId}: {indexes: Indexes; indexId: Id} = $props();
  const v = useSliceIds(
    () => indexId,
    () => indexes,
  );
</script>

{JSON.stringify(v.current)}
