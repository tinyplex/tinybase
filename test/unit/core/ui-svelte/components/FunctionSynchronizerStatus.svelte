<script lang="ts">
  import {getSynchronizerStatus} from 'tinybase/ui-svelte';
  import type {Synchronizer} from 'tinybase/synchronizers';

  let {synchronizer}: {synchronizer: Synchronizer} = $props();
  const status = getSynchronizerStatus(() => synchronizer);
</script>

{status.current}
