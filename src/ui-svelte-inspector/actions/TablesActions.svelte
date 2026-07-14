<script lang="ts">
  import type {Id} from '../../@types/common/index.d.ts';
  import type {StoreOrStoreId} from '../../@types/ui-svelte/index.d.ts';
  import {arrayHas} from '../../common/array.ts';
  import {isEmpty} from '../../common/other.ts';
  import {getNewIdFromSuggestedId} from '../../common/inspector/common.ts';
  import {getTableIds, resolveStore} from '../../ui-svelte/functions.svelte.ts';
  import Actions from './Actions.svelte';
  import ConfirmableActions from './ConfirmableActions.svelte';

  let {
    store,
  }: {
    readonly store?: StoreOrStoreId;
  } = $props();

  const getStore = resolveStore(() => store);
  const tableIds = getTableIds(() => store);
  const has = (tableId: Id) => getStore()?.hasTable(tableId) ?? false;

  const addActions = $derived([
    {
      icon: 'add',
      title: 'Add table',
      prompt: 'Add table',
      suggestedId: getNewIdFromSuggestedId('table', (tableId) =>
        arrayHas(tableIds.current, tableId),
      ),
      has,
      set: (newId: Id) => getStore()?.setTable(newId, {row: {cell: ''}}),
    },
  ]);
  const rightActions = $derived(
    !isEmpty(tableIds.current)
      ? [
          {
            icon: 'delete',
            title: 'Delete all tables',
            prompt: 'Delete all tables',
            onClick: () => getStore()?.delTables(),
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
    {#if !isEmpty(rightActions)}
      <ConfirmableActions actions={rightActions} />
    {/if}
  {/snippet}
</Actions>
