<script lang="ts">
  import {getValues} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {store}: {store: Store} = $props();
  const v = getValues(() => store);
</script>

{JSON.stringify(v.current)}
