<script lang="ts">
  import {useQueryIds} from 'tinybase/ui-svelte';
  import type {Queries} from 'tinybase';

  let {queries}: {queries: Queries} = $props();
  const v = useQueryIds(() => queries);
</script>

{JSON.stringify(v.current)}
