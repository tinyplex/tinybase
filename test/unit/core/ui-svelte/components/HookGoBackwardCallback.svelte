<script lang="ts">
  import {useGoBackwardCallback} from 'tinybase/ui-svelte';
  import type {Checkpoints} from 'tinybase';

  let {checkpoints}: {checkpoints: Checkpoints} = $props();
  const cb = useGoBackwardCallback(() => checkpoints);
</script>

<button onclick={cb}>back</button>
