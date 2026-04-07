<script lang="ts">
  import type {Snippet} from 'svelte';

  type Props = {
    children: Snippet;
  };

  const {children}: Props = $props();

  const handleError = (error: unknown) =>
    // eslint-disable-next-line no-console
    console.error(error);
</script>

<svelte:boundary onerror={handleError}>
  {@render children()}
  {#snippet failed(_error, _reset)}
    <span class="warn">Inspector error: please see console for details.</span>
  {/snippet}
</svelte:boundary>
