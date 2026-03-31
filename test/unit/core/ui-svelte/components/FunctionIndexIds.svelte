<script lang="ts">
  import {createIndexIds} from 'tinybase/ui-svelte';
  import type {Indexes} from 'tinybase';

  let {indexes}: {indexes: Indexes} = $props();
  const v = createIndexIds(() => indexes);
</script>

{JSON.stringify(v.current)}
