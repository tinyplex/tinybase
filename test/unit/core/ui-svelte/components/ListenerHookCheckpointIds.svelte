<script lang="ts">
  import {useCheckpointIdsListener} from 'tinybase/ui-svelte';
  import type {Checkpoints} from 'tinybase';

  let {
    checkpoints,
    listener,
  }: {checkpoints: Checkpoints; listener: (...args: any[]) => void} = $props();
  useCheckpointIdsListener(
    (...args) => listener(...args),
    () => checkpoints,
  );
</script>
