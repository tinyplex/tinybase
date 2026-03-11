<script lang="ts">
  import {useTableIds} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {store}: {store: Store} = $props();
  const v = useTableIds(() => store);
</script>

{JSON.stringify(v.current)}
