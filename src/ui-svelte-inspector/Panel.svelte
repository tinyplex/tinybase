<script lang="ts">
  import {getValue} from '../ui-svelte/functions.svelte.ts';
  import Body from './Body.svelte';
  import ErrorBoundary from './ErrorBoundary.svelte';
  import Header from './Header.svelte';
  import {OPEN_VALUE, POSITION_VALUE} from '../common/inspector/common.ts';
  import type {StoreProp} from '../common/inspector/types.ts';

  let {s}: StoreProp = $props();

  const position = getValue(
    () => POSITION_VALUE,
    () => s,
  );
  const open = getValue(
    () => OPEN_VALUE,
    () => s,
  );
</script>

{#if open.current}
  <main data-position={position.current ?? 1}>
    <Header {s} />
    <ErrorBoundary>
      <Body {s} />
    </ErrorBoundary>
  </main>
{/if}
