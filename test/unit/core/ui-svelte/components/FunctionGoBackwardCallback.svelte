<script lang="ts">
  import {createGoBackwardCallback} from 'tinybase/ui-svelte';
  import type {Checkpoints} from 'tinybase';

  let {checkpoints}: {checkpoints: Checkpoints} = $props();
  const cb = createGoBackwardCallback(() => checkpoints);
</script>

<button onclick={cb}>back</button>
