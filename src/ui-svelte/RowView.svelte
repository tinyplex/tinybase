<script lang="ts">
  import type {RowViewProps} from '../@types/ui-svelte/index.d.ts';
  import {useCellIds} from './hooks.svelte.ts';
  import CellView from './CellView.svelte';
  import ItemsView from './common/ItemsView.svelte';

  let {
    tableId,
    rowId,
    store,
    customCellIds,
    separator,
    debugIds,
    cell,
  }: RowViewProps = $props();

  const defaultCellIds = useCellIds(
    () => tableId,
    () => rowId,
    () => store,
  );
  const activeCellIds = $derived(customCellIds ?? defaultCellIds.current);
</script>

<ItemsView ids={activeCellIds} {separator} {debugIds} id={rowId} custom={cell}>
  {#snippet children(cellId)}
    <CellView {tableId} {rowId} {cellId} {store} {debugIds} />
  {/snippet}
</ItemsView>
