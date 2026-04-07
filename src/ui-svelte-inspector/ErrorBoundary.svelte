<script lang="ts">
  import {INSPECTOR_ERROR_MESSAGE} from '../common/inspector/common.ts';
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
    <span class="warn">{INSPECTOR_ERROR_MESSAGE}</span>
  {/snippet}
</svelte:boundary>
