<script lang="ts">
  import type {Id} from '../../@types/common/index.d.ts';
  import type {StoreOrStoreId} from '../../@types/ui-svelte/index.d.ts';
  import {arrayHas} from '../../common/array.ts';
  import {
    getNewIdFromSuggestedId,
  } from '../../common/inspector/common.ts';
  import {
    getCellIds,
    getRowIds,
    resolveStore,
  } from '../../ui-svelte/functions.svelte.ts';
  import ConfirmableActions from './ConfirmableActions.svelte';

  let {
    tableId,
    rowId,
    store,
  }: {
    readonly tableId: Id;
    readonly rowId: Id;
    readonly store?: StoreOrStoreId;
  } = $props();

  const getStore = resolveStore(() => store);
  const cellIds = getCellIds(
    () => tableId,
    () => rowId,
    () => store,
  );
  const rowIds = getRowIds(
    () => tableId,
    () => store,
  );
  const hasCell = (cellId: Id) =>
    getStore()?.hasCell(tableId, rowId, cellId) ?? false;
  const hasRow = (nextRowId: Id) => getStore()?.hasRow(tableId, nextRowId) ?? false;

  const actions = $derived([
    {
      icon: 'add',
      title: 'Add cell',
      prompt: 'Add cell',
      suggestedId: getNewIdFromSuggestedId('cell', (cellId) =>
        arrayHas(cellIds.current, cellId),
      ),
      has: hasCell,
      set: (newId: Id) => getStore()?.setCell(tableId, rowId, newId, ''),
    },
    {
      icon: 'clone',
      title: 'Clone row',
      prompt: 'Clone row to',
      suggestedId: getNewIdFromSuggestedId(rowId, (nextRowId) =>
        arrayHas(rowIds.current, nextRowId),
      ),
      has: hasRow,
      set: (newId: Id) =>
        getStore()?.setRow(tableId, newId, getStore()?.getRow(tableId, rowId)),
    },
    {
      icon: 'delete',
      title: 'Delete row',
      prompt: 'Delete row',
      onClick: () => getStore()?.delRow(tableId, rowId),
    },
  ]);
</script>

<ConfirmableActions {actions} />
