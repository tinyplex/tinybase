<script lang="ts">
  import type {Snippet} from 'svelte';

  let {
    left,
    right,
  }: {
    readonly left?: Snippet;
    readonly right?: Snippet;
  } = $props();
</script>

<div class="actions">
  <div>{@render left?.()}</div>
  <div>{@render right?.()}</div>
</div>
