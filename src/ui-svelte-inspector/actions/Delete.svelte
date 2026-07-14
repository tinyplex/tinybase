<script lang="ts">
  import {addEventListener, hasWindow} from '../../common/other.ts';
  import {KEYDOWN} from '../../common/strings.ts';
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

  $effect(() => {
    if (hasWindow()) {
      return addEventListener(document, KEYDOWN, (event: KeyboardEvent) => {
        if (event.key == 'Enter') {
          event.preventDefault();
          handleClick();
        }
      });
    }
  });
</script>

{prompt}?
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<img onclick={handleClick} title="Confirm" class="ok" alt="" />
