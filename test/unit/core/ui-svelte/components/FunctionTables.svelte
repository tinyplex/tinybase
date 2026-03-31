<script lang="ts">
  import {getTables} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {store}: {store: Store} = $props();
  const v = getTables(() => store);
</script>

{JSON.stringify(v.current)}
