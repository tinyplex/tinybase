<script lang="ts">
  import type {
    HtmlTableProps,
    TableInHtmlTableProps,
  } from '../@types/ui-svelte-dom/index.d.ts';
  import {getRowIds, getTableCellIds} from '../ui-svelte/functions.svelte.ts';
  import CellView from '../ui-svelte/CellView.svelte';
  import EditableCellView from './EditableCellView.svelte';
  import HtmlTable from './common/HtmlTable.svelte';
  import {getCells} from './common/index.ts';

  let {
    tableId,
    store,
    editable,
    customCells,
    extraCellsBefore,
    extraCellsAfter,
    ...props
  }: TableInHtmlTableProps & HtmlTableProps = $props();

  const defaultCellIds = getTableCellIds(
    () => tableId,
    () => store,
  );
  const rowIds = getRowIds(
    () => tableId,
    () => store,
  );
  const defaultCellComponent = $derived(editable ? EditableCellView : CellView);
  const cells = $derived(
    getCells(defaultCellIds.current, customCells, defaultCellComponent),
  );
  const cellComponentProps = $derived({store, tableId});
</script>

<HtmlTable
  {...props}
  {cells}
  {cellComponentProps}
  {rowIds}
  {extraCellsBefore}
  {extraCellsAfter}
/>
