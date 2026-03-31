<script lang="ts">
  import {getQueryIds} from 'tinybase/ui-svelte';
  import type {Queries} from 'tinybase';

  let {queries}: {queries: Queries} = $props();
  const v = getQueryIds(() => queries);
</script>

{JSON.stringify(v.current)}
