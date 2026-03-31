<script lang="ts">
  import {createTables} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {store}: {store: Store} = $props();
  const v = createTables(() => store);
</script>

{JSON.stringify(v.current)}
