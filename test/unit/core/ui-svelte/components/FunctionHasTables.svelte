<script lang="ts">
  import {hasTables} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {store}: {store: Store} = $props();
  const v = hasTables(() => store);
</script>

{JSON.stringify(v.current)}
