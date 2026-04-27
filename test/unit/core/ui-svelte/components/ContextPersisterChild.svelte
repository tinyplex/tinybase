<script lang="ts">
  import {getPersister} from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';

  let {persisterId}: {persisterId?: Id} = $props();

  const persister = $derived(getPersister(persisterId));
</script>

{persister?.getStatus()}
