<script lang="ts">
  import {useHasValues} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {store}: {store: Store} = $props();
  const v = useHasValues(() => store);
</script>

{JSON.stringify(v.current)}
