<script lang="ts">
  import type {Id} from '../../@types/common/index.d.ts';
  import type {StoreOrStoreId} from '../../@types/ui-svelte/index.d.ts';
  import {arrayHas} from '../../common/array.ts';
  import {
    getNewIdFromSuggestedId,
  } from '../../common/inspector/common.ts';
  import {
    getTableIds,
    resolveStore,
  } from '../../ui-svelte/functions.svelte.ts';
  import ConfirmableActions from './ConfirmableActions.svelte';

  let {
    tableId,
    store,
  }: {
    readonly tableId: Id;
    readonly store?: StoreOrStoreId;
  } = $props();

  const getStore = resolveStore(() => store);
  const tableIds = getTableIds(() => store);
  const has = (nextTableId: Id) => getStore()?.hasTable(nextTableId) ?? false;

  const actions = $derived([
    {
      icon: 'clone',
      title: 'Clone table',
      prompt: 'Clone table to',
      suggestedId: getNewIdFromSuggestedId(tableId, (nextTableId) =>
        arrayHas(tableIds.current, nextTableId),
      ),
      has,
      set: (newId: Id) =>
        getStore()?.setTable(newId, getStore()?.getTable(tableId)),
    },
    {
      icon: 'delete',
      title: 'Delete table',
      prompt: 'Delete table',
      onClick: () => getStore()?.delTable(tableId),
    },
  ]);
</script>

<ConfirmableActions {actions} />
