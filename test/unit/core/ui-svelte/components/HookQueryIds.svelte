<script lang="ts">
  import {createQueryIds} from 'tinybase/ui-svelte';
  import type {Queries} from 'tinybase';

  let {queries}: {queries: Queries} = $props();
  const v = createQueryIds(() => queries);
</script>

{JSON.stringify(v.current)}
