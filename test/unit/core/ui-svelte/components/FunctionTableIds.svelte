<script lang="ts">
  import {getTableIds} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {store}: {store: Store} = $props();
  const v = getTableIds(() => store);
</script>

{JSON.stringify(v.current)}
