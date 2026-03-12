<script lang="ts">
  import {useSynchronizerStatus} from 'tinybase/ui-svelte';
  import type {Synchronizer} from 'tinybase/synchronizers';

  let {synchronizer}: {synchronizer: Synchronizer} = $props();
  const status = useSynchronizerStatus(() => synchronizer);
</script>

{status.current}
