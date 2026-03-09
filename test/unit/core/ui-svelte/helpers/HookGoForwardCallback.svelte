<script lang="ts">
  import {useGoForwardCallback} from 'tinybase/ui-svelte';
  import type {Checkpoints} from 'tinybase';

  let {checkpoints}: {checkpoints: Checkpoints} = $props();
  const cb = useGoForwardCallback(() => checkpoints);
</script>

<button onclick={cb}>forward</button>
