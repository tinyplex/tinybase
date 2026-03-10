<script lang="ts">
  import type {TableViewProps} from '../@types/ui-svelte/index.d.ts';
  import {useRowIds} from './hooks.svelte.ts';
  import RowView from './RowView.svelte';
  import ItemsView from './common/ItemsView.svelte';

  let {
    tableId,
    store,
    customCellIds,
    separator,
    debugIds,
    row,
  }: TableViewProps = $props();

  const rowIds = useRowIds(
    () => tableId,
    () => store,
  );
</script>

<ItemsView
  ids={rowIds.current}
  {separator}
  {debugIds}
  id={tableId}
  custom={row}
>
  {#snippet children(rowId)}
    <RowView {tableId} {rowId} {store} {customCellIds} {debugIds} />
  {/snippet}
</ItemsView>
