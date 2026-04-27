<script lang="ts">
  import type {
    HtmlTableProps,
    ResultSortedTableInHtmlTableProps,
  } from '../@types/ui-svelte-dom/index.d.ts';
  import {
    getResultRowCount,
    getResultSortedRowIds,
    getResultTableCellIds,
  } from '../ui-svelte/functions.svelte.ts';
  import ResultCellView from '../ui-svelte/ResultCellView.svelte';
  import HtmlTable from './common/HtmlTable.svelte';
  import {getCells} from './common/index.ts';
  import {createSortingAndPagination} from './common/sortingAndPagination.svelte.ts';

  let {
    queryId,
    cellId,
    descending,
    offset,
    limit,
    queries,
    sortOnClick,
    paginator = false,
    customCells,
    extraCellsBefore,
    extraCellsAfter,
    onChange,
    ...props
  }: ResultSortedTableInHtmlTableProps & HtmlTableProps = $props();

  const defaultCellIds = getResultTableCellIds(
    () => queryId,
    () => queries,
  );
  const rowCount = getResultRowCount(
    () => queryId,
    () => queries,
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
  const rowIds = getResultSortedRowIds(
    () => queryId,
    () => sorting.sortAndOffset[0],
    () => sorting.sortAndOffset[1],
    () => sorting.sortAndOffset[2],
    () => limit,
    () => queries,
  );
  const cells = $derived(
    getCells(defaultCellIds.current, customCells, ResultCellView),
  );
  const cellComponentProps = $derived({queries, queryId});
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
