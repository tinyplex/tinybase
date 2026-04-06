<script lang="ts">
  import type {
    HtmlTableProps,
    SliceInHtmlTableProps,
  } from '../@types/ui-svelte-dom/index.d.ts';
  import {
    getIndexStoreTableId,
    getSliceRowIds,
    getTableCellIds,
  } from '../ui-svelte/functions.svelte.ts';
  import CellView from '../ui-svelte/CellView.svelte';
  import EditableCellView from './EditableCellView.svelte';
  import HtmlTable from './common/HtmlTable.svelte';
  import {getCells} from './common/index.ts';

  let {
    indexId,
    sliceId,
    indexes,
    editable,
    customCells,
    extraCellsBefore,
    extraCellsAfter,
    ...props
  }: SliceInHtmlTableProps & HtmlTableProps = $props();

  const index = getIndexStoreTableId(
    () => indexes,
    () => indexId,
  );
  const defaultCellIds = getTableCellIds(
    () => index.tableId as any,
    () => index.store,
  );
  const rowIds = getSliceRowIds(
    () => indexId,
    () => sliceId,
    () => indexes,
  );
  const defaultCellComponent = $derived(editable ? EditableCellView : CellView);
  const cells = $derived(
    getCells(defaultCellIds.current, customCells, defaultCellComponent),
  );
  const cellComponentProps = $derived({
    store: index.store,
    tableId: index.tableId as any,
  });
</script>

<HtmlTable
  {...props}
  {cells}
  {cellComponentProps}
  {rowIds}
  {extraCellsBefore}
  {extraCellsAfter}
/>
