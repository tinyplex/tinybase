<script lang="ts">
  import type {Id} from '../../@types/common/index.d.ts';
  import type {StoreOrStoreId} from '../../@types/ui-svelte/index.d.ts';
  import {resolveStore} from '../../ui-svelte/functions.svelte.ts';
  import ConfirmableActions from './ConfirmableActions.svelte';

  let {
    tableId,
    rowId,
    cellId,
    store,
  }: {
    readonly tableId: Id;
    readonly rowId: Id;
    readonly cellId: Id;
    readonly store?: StoreOrStoreId;
  } = $props();

  const getStore = resolveStore(() => store);

  const actions = [
    {
      icon: 'delete',
      title: 'Delete cell',
      prompt: 'Delete cell',
      onClick: () => getStore()?.delCell(tableId, rowId, cellId, true),
    },
  ];
</script>

<ConfirmableActions {actions} />
