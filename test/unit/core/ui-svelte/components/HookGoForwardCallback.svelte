<script lang="ts">
  import {createGoForwardCallback} from 'tinybase/ui-svelte';
  import type {Checkpoints} from 'tinybase';

  let {checkpoints}: {checkpoints: Checkpoints} = $props();
  const cb = createGoForwardCallback(() => checkpoints);
</script>

<button onclick={cb}>forward</button>
