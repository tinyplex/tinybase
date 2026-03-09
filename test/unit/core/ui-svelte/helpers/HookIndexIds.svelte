<script lang="ts">
  import {useIndexIds} from 'tinybase/ui-svelte';
  import type {Indexes} from 'tinybase';

  let {indexes}: {indexes: Indexes} = $props();
  const v = useIndexIds(() => indexes);
</script>

{JSON.stringify(v.current)}
