<script lang="ts">
  import {hasValues} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {store}: {store: Store} = $props();
  const v = hasValues(() => store);
</script>

{JSON.stringify(v.current)}
