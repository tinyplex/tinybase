<script lang="ts">
  import {hasWindow} from '../../common/other.ts';
  import type {OnDoneProp} from './common.ts';

  let {
    onDone,
    onClick,
    prompt = 'Delete',
  }: OnDoneProp & {
    readonly onClick: () => void;
    readonly prompt?: string;
  } = $props();

  const handleClick = () => {
    onClick();
    onDone();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key == 'Enter') {
      event.preventDefault();
      handleClick();
    }
  };

  $effect(() => {
    if (hasWindow()) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  });
</script>

{prompt}? 
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<img onclick={handleClick} title="Confirm" class="ok" alt="" />
