<script lang="ts">
  import {
    addEventListener,
    hasWindow,
    isUndefined,
  } from '../../common/other.ts';
  import {KEYDOWN} from '../../common/strings.ts';
  import Delete from './Delete.svelte';
  import NewId from './NewId.svelte';
  import {isNewIdAction, type InspectorAction} from './common.ts';

  let {
    actions,
  }: {
    readonly actions: readonly InspectorAction[];
  } = $props();

  let confirming = $state<number | undefined>(undefined);

  const handleDone = () => {
    confirming = undefined;
  };

  $effect(() => {
    if (!isUndefined(confirming) && hasWindow()) {
      return addEventListener(document, KEYDOWN, (event: KeyboardEvent) => {
        if (!isUndefined(confirming) && event.key == 'Escape') {
          event.preventDefault();
          handleDone();
        }
      });
    }
  });
</script>

{#if !isUndefined(confirming)}
  {@const action = actions[confirming]}
  {#if isNewIdAction(action)}
    <NewId
      onDone={handleDone}
      suggestedId={action.suggestedId}
      has={action.has}
      set={action.set}
      prompt={action.prompt}
    />
  {:else}
    <Delete
      onDone={handleDone}
      onClick={action.onClick}
      prompt={action.prompt}
    />
  {/if}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <img onclick={handleDone} title="Cancel" class="cancel" alt="" />
{:else}
  {#each actions as action, index (index)}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <img
      onclick={() => (confirming = index)}
      title={action.title}
      class={action.icon}
      alt=""
    />
  {/each}
{/if}
