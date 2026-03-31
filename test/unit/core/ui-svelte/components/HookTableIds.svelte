<script lang="ts">
  import {createTableIds} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {store}: {store: Store} = $props();
  const v = createTableIds(() => store);
</script>

{JSON.stringify(v.current)}
