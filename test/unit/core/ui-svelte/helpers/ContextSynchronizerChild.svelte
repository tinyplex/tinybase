<script lang="ts">
  import {useSynchronizer} from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';

  let {synchronizerId}: {synchronizerId?: Id} = $props();

  const synchronizer = $derived(useSynchronizer(synchronizerId));
</script>

{synchronizer?.getStatus()}
