<script lang="ts">
  import {createValueIds} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {store}: {store: Store} = $props();
  const v = createValueIds(() => store);
</script>

{JSON.stringify(v.current)}
