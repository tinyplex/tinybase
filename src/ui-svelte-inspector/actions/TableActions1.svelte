<script lang="ts">
  import type {Id} from '../../@types/common/index.d.ts';
  import type {StoreOrStoreId} from '../../@types/ui-svelte/index.d.ts';
  import {arrayHas, arrayMap} from '../../common/array.ts';
  import {getNewIdFromSuggestedId} from '../../common/inspector/common.ts';
  import {objNew} from '../../common/obj.ts';
  import {getRowIds, resolveStore} from '../../ui-svelte/functions.svelte.ts';
  import ConfirmableActions from './ConfirmableActions.svelte';

  let {
    tableId,
    store,
  }: {
    readonly tableId: Id;
    readonly store?: StoreOrStoreId;
  } = $props();

  const getStore = resolveStore(() => store);
  const rowIds = getRowIds(
    () => tableId,
    () => store,
  );
  const has = (rowId: Id) => getStore()?.hasRow(tableId, rowId) ?? false;

  const actions = $derived([
    {
      icon: 'add',
      title: 'Add row',
      prompt: 'Add row',
      suggestedId: getNewIdFromSuggestedId('row', (rowId) =>
        arrayHas(rowIds.current, rowId),
      ),
      has,
      set: (newId: Id) =>
        getStore()?.setRow(
          tableId,
          newId,
          objNew(
            arrayMap(getStore()?.getTableCellIds(tableId) ?? [], (cellId) => [
              cellId,
              '',
            ]),
          ),
        ),
    },
  ]);
</script>

<ConfirmableActions {actions} />
