<script lang="ts">
  import type {Id} from '../../@types/common/index.d.ts';
  import type {OnDoneProp} from './common.ts';

  let {
    onDone,
    suggestedId,
    has,
    set,
    prompt = 'New Id',
  }: OnDoneProp & {
    readonly suggestedId: Id;
    readonly has: (id: Id) => boolean;
    readonly set: (newId: Id) => void;
    readonly prompt?: string;
  } = $props();

  let input = $state<HTMLInputElement | undefined>(undefined);
  const currentSuggestedId = $derived(suggestedId);
  let newId = $state<Id>('');
  let newIdOk = $state(true);
  let previousSuggestedId = $state<Id | undefined>(undefined);

  $effect(() => {
    if (input) {
      input.focus();
    }
  });

  $effect(() => {
    if (currentSuggestedId != previousSuggestedId) {
      newId = currentSuggestedId;
      newIdOk = true;
      previousSuggestedId = currentSuggestedId;
    }
  });

  const handleNewIdChange = (event: Event) => {
    newId = (event.currentTarget as HTMLInputElement).value;
    newIdOk = !has(newId);
  };

  const handleClick = () => {
    if (has(newId)) {
      newIdOk = false;
    } else {
      set(newId);
      onDone();
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key == 'Enter') {
      event.preventDefault();
      handleClick();
    }
  };
</script>

{prompt + ': '}
<input
  bind:this={input}
  type="text"
  value={newId}
  oninput={handleNewIdChange}
  onkeydown={handleKeyDown}
/>
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<img
  onclick={handleClick}
  title={newIdOk ? 'Confirm' : 'Id already exists'}
  class={newIdOk ? 'ok' : 'okDis'}
  alt=""
/>
