<script lang="ts">
  import type {Id} from '../../@types/common/index.d.ts';
  import type {StoreOrStoreId} from '../../@types/ui-svelte/index.d.ts';
  import {arrayHas} from '../../common/array.ts';
  import {getNewIdFromSuggestedId} from '../../common/inspector/common.ts';
  import {getValueIds, resolveStore} from '../../ui-svelte/functions.svelte.ts';
  import ConfirmableActions from './ConfirmableActions.svelte';

  let {
    valueId,
    store,
  }: {
    readonly valueId: Id;
    readonly store?: StoreOrStoreId;
  } = $props();

  const getStore = resolveStore(() => store);
  const valueIds = getValueIds(() => store);
  const has = (nextValueId: Id) => getStore()?.hasValue(nextValueId) ?? false;

  const actions = $derived([
    {
      icon: 'clone',
      title: 'Clone value',
      prompt: 'Clone value to',
      suggestedId: getNewIdFromSuggestedId(valueId, (nextValueId) =>
        arrayHas(valueIds.current, nextValueId),
      ),
      has,
      set: (newId: Id) =>
        getStore()?.setValue(newId, getStore()?.getValue(valueId) ?? ''),
    },
    {
      icon: 'delete',
      title: 'Delete value',
      prompt: 'Delete value',
      onClick: () => getStore()?.delValue(valueId),
    },
  ]);
</script>

<ConfirmableActions {actions} />
