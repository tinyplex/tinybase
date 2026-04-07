<script lang="ts">
  import type {Id} from '../../@types/common/index.d.ts';
  import type {StoreOrStoreId} from '../../@types/ui-svelte/index.d.ts';
  import {arrayHas} from '../../common/array.ts';
  import {
    getNewIdFromSuggestedId,
  } from '../../common/inspector/common.ts';
  import {
    getValueIds,
    resolveStore,
  } from '../../ui-svelte/functions.svelte.ts';
  import Actions from './Actions.svelte';
  import ConfirmableActions from './ConfirmableActions.svelte';

  let {
    store,
  }: {
    readonly store?: StoreOrStoreId;
  } = $props();

  const getStore = resolveStore(() => store);
  const valueIds = getValueIds(() => store);
  const has = (valueId: Id) => getStore()?.hasValue(valueId) ?? false;

  const addActions = $derived([
    {
      icon: 'add',
      title: 'Add value',
      prompt: 'Add value',
      suggestedId: getNewIdFromSuggestedId('value', (valueId) =>
        arrayHas(valueIds.current, valueId),
      ),
      has,
      set: (newId: Id) => getStore()?.setValue(newId, ''),
    },
  ]);
  const rightActions = $derived(
    valueIds.current.length > 0
      ? [
          {
            icon: 'delete',
            title: 'Delete all values',
            prompt: 'Delete all values',
            onClick: () => getStore()?.delValues(),
          },
        ]
      : [],
  );
</script>

<Actions>
  {#snippet left()}
    <ConfirmableActions actions={addActions} />
  {/snippet}
  {#snippet right()}
    {#if rightActions.length > 0}
      <ConfirmableActions actions={rightActions} />
    {/if}
  {/snippet}
</Actions>
