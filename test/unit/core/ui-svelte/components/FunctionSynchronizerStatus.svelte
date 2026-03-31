<script lang="ts">
  import {createSynchronizerStatus} from 'tinybase/ui-svelte';
  import type {Synchronizer} from 'tinybase/synchronizers';

  let {synchronizer}: {synchronizer: Synchronizer} = $props();
  const status = createSynchronizerStatus(() => synchronizer);
</script>

{status.current}
