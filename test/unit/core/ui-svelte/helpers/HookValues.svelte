<script lang="ts">
  import {useValues} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {store}: {store: Store} = $props();
  const v = useValues(() => store);
</script>

{JSON.stringify(v.current)}
