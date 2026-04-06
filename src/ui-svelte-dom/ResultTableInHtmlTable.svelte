<script lang="ts">
  import type {
    HtmlTableProps,
    ResultTableInHtmlTableProps,
  } from '../@types/ui-svelte-dom/index.d.ts';
  import {
    getResultRowIds,
    getResultTableCellIds,
  } from '../ui-svelte/functions.svelte.ts';
  import ResultCellView from '../ui-svelte/ResultCellView.svelte';
  import HtmlTable from './common/HtmlTable.svelte';
  import {getCells} from './common/index.ts';

  let {
    queryId,
    queries,
    customCells,
    extraCellsBefore,
    extraCellsAfter,
    ...props
  }: ResultTableInHtmlTableProps & HtmlTableProps = $props();

  const defaultCellIds = getResultTableCellIds(
    () => queryId,
    () => queries,
  );
  const rowIds = getResultRowIds(
    () => queryId,
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
/>
