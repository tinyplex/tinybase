<script lang="ts">
  import {getValue} from '../ui-svelte/functions.svelte.ts';
  import {
    OPEN_VALUE,
    POSITION_VALUE,
    TITLE,
  } from '../common/inspector/common.ts';
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

  const handleOpen = () => s.setValue(OPEN_VALUE, true);
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key == 'Enter' || event.key == ' ') {
      event.preventDefault();
      handleOpen();
    }
  };
</script>

{#if !open.current}
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <img
    onclick={handleOpen}
    onkeydown={handleKeyDown}
    title={TITLE}
    data-position={position.current ?? 1}
    tabindex="0"
    alt=""
  />
{/if}
