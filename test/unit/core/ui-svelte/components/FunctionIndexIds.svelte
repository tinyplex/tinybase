<script lang="ts">
  import {getIndexIds} from 'tinybase/ui-svelte';
  import type {Indexes} from 'tinybase';

  let {indexes}: {indexes: Indexes} = $props();
  const v = getIndexIds(() => indexes);
</script>

{JSON.stringify(v.current)}
