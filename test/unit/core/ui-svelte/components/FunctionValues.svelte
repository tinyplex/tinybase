<script lang="ts">
  import {createValues} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {store}: {store: Store} = $props();
  const v = createValues(() => store);
</script>

{JSON.stringify(v.current)}
