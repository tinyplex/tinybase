<script lang="ts">
  import type {Checkpoints} from 'tinybase';
  import {
    createGoBackwardCallback,
    createGoForwardCallback,
  } from 'tinybase/ui-svelte';

  let {
    mode,
    checkpoints,
  }: {
    mode: string;
    checkpoints: Checkpoints;
  } = $props();

  const goBackward = createGoBackwardCallback(() => checkpoints);
  const goForward = createGoForwardCallback(() => checkpoints);
</script>

<button onclick={mode == 'goBackward' ? goBackward : goForward}>Go</button>
