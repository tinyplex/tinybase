<script lang="ts">
  import {createHasTables} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {store}: {store: Store} = $props();
  const v = createHasTables(() => store);
</script>

{JSON.stringify(v.current)}
