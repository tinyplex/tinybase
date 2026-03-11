<script lang="ts">
  import {useHasTables} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {store}: {store: Store} = $props();
  const v = useHasTables(() => store);
</script>

{JSON.stringify(v.current)}
