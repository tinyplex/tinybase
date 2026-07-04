<script lang="ts">
  import type {
    HtmlTableProps,
    SortedTableInHtmlTableProps,
  } from '../@types/ui-svelte-dom/index.d.ts';
  import {
    getRowCount,
    getSortedRowIds,
    getTableCellIds,
  } from '../ui-svelte/functions.svelte.ts';
  import CellView from '../ui-svelte/CellView.svelte';
  import EditableCellView from './EditableCellView.svelte';
  import HtmlTable from './common/HtmlTable.svelte';
  import {getCells} from './common/index.ts';
  import {createSortingAndPagination} from './common/sortingAndPagination.svelte.ts';

  let {
    tableId,
    cellId,
    descending,
    offset,
    limit,
    store,
    editable,
    sortOnClick,
    paginator = false,
    onChange,
    customCells,
    extraCellsBefore,
    extraCellsAfter,
    ...props
  }: SortedTableInHtmlTableProps & HtmlTableProps = $props();

  const defaultCellIds = getTableCellIds(
    () => tableId,
    () => store,
  );
  const rowCount = getRowCount(
    () => tableId,
    () => store,
  );
  const sorting = createSortingAndPagination(
    () => cellId,
    () => descending,
    () => sortOnClick,
    () => offset,
    () => limit,
    () => rowCount.current,
    () => paginator,
    () => onChange,
  );
  const rowIds = getSortedRowIds(
    () => tableId,
    () => sorting.sortAndOffset[0],
    () => sorting.sortAndOffset[1],
    () => sorting.sortAndOffset[2],
    () => limit,
    undefined,
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
  sortAndOffset={sorting.sortAndOffset}
  handleSort={sorting.handleSort}
  paginator={sorting.paginator}
/>
