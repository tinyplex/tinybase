<script lang="ts">
  import {useValueIds} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {store}: {store: Store} = $props();
  const v = useValueIds(() => store);
</script>

{JSON.stringify(v.current)}
