<script lang="ts">
  import {getValue} from '../ui-svelte/functions.svelte.ts';
  import {
    OPEN_VALUE,
    POSITIONS,
    POSITION_VALUE,
    TITLE,
  } from '../common/inspector/common.ts';
  import type {StoreProp} from '../common/inspector/types.ts';
  import {number} from '../common/other.ts';

  let {s}: StoreProp = $props();

  const position = getValue(
    () => POSITION_VALUE,
    () => s,
  );

  const handleClick = () => open('https://tinybase.org', '_blank');
  const handleClose = () => s.setValue(OPEN_VALUE, false);
  const handleDock = (event: MouseEvent) =>
    s.setValue(
      POSITION_VALUE,
      number((event.currentTarget as HTMLImageElement).dataset.id),
    );
  const onKeyDown = (event: KeyboardEvent, handle: () => void) => {
    if (event.key == 'Enter' || event.key == ' ') {
      event.preventDefault();
      handle();
    }
  };
</script>

<header>
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <img
    class="flat"
    title={TITLE}
    onclick={handleClick}
    onkeydown={(event) => onKeyDown(event, handleClick)}
    tabindex="0"
    alt=""
  />
  <span>{TITLE}</span>
  {#each POSITIONS as name, p (p)}
    {#if p != (position.current ?? 1)}
      <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <img
        onclick={handleDock}
        onkeydown={(event) =>
          onKeyDown(event, () => s.setValue(POSITION_VALUE, p))}
        data-id={p}
        title={'Dock to ' + name}
        tabindex="0"
        alt=""
      />
    {/if}
  {/each}
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <img
    class="flat"
    onclick={handleClose}
    onkeydown={(event) => onKeyDown(event, handleClose)}
    title="Close"
    tabindex="0"
    alt=""
  />
</header>
