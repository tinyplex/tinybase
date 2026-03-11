<script lang="ts">
  import {usePersister} from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';

  let {persisterId}: {persisterId?: Id} = $props();

  const persister = $derived(usePersister(persisterId));
</script>

{persister?.getStatus()}
