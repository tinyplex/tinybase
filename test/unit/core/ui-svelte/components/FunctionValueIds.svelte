<script lang="ts">
  import {getValueIds} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {store}: {store: Store} = $props();
  const v = getValueIds(() => store);
</script>

{JSON.stringify(v.current)}
