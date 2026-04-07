<script lang="ts">
  import type {Snippet} from 'svelte';
  import type {Id} from '../@types/common/index.d.ts';
  import {OPEN_CELL, STATE_TABLE} from '../common/inspector/common.ts';
  import type {StoreProp} from '../common/inspector/types.ts';
  import {getCell} from '../ui-svelte/functions.svelte.ts';

  type Props = {
    uniqueId: Id;
    title: string;
    editable?: boolean;
    handleEditable?: (event?: Event) => void;
    children: Snippet;
  } & StoreProp;

  let {
    uniqueId,
    title,
    editable = false,
    handleEditable,
    children,
    s,
  }: Props = $props();

  const open = getCell(
    () => STATE_TABLE,
    () => uniqueId,
    () => OPEN_CELL,
    () => s,
  );

  const handleToggle = (event: Event) => {
    open.current = (event.currentTarget as HTMLDetailsElement).open;
  };
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key == 'Enter' || event.key == ' ') {
      event.preventDefault();
      handleEditable?.(event);
    }
  };
</script>

<details open={!!open.current} ontoggle={handleToggle}>
  <summary>
    <span>{title}</span>
    {#if handleEditable}
      <!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
      <img
        onclick={handleEditable}
        onkeydown={handleKeyDown}
        class={editable ? 'done' : 'edit'}
        title={editable ? 'Done editing' : 'Edit'}
        tabindex="0"
        alt=""
      />
    {/if}
  </summary>
  <div>{@render children()}</div>
</details>
