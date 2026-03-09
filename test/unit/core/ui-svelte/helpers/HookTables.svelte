<script lang="ts">
  import {useTables} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {store}: {store: Store} = $props();
  const v = useTables(() => store);
</script>

{JSON.stringify(v.current)}
