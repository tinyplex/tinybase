<script lang="ts">
  import {getSynchronizer} from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';

  let {synchronizerId}: {synchronizerId?: Id} = $props();

  const synchronizer = $derived(getSynchronizer(synchronizerId));
</script>

{synchronizer?.getStatus()}
