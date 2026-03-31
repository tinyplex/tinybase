<script lang="ts">
  import {createHasValues} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {store}: {store: Store} = $props();
  const v = createHasValues(() => store);
</script>

{JSON.stringify(v.current)}
