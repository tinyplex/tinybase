<script lang="ts">
  import {
    ResultTableView,
    ResultRowView,
    ResultCellView,
    getResultTable,
    getResultRowIds,
    getResultRow,
    getResultCellIds,
    getResultCell,
  } from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';

  let {queriesId}: {queriesId?: Id} = $props();

  const resultTable = getResultTable(
    () => 'q1',
    () => queriesId,
  );
  const resultRowIds = getResultRowIds(
    () => 'q1',
    () => queriesId,
  );
  const resultRow = getResultRow(
    () => 'q1',
    () => 'r1',
    () => queriesId,
  );
  const resultCellIds = getResultCellIds(
    () => 'q1',
    () => 'r1',
    () => queriesId,
  );
  const resultCell = getResultCell(
    () => 'q1',
    () => 'r1',
    () => 'c1',
    () => queriesId,
  );
</script>

<ResultTableView queryId="q1" queries={queriesId} />{JSON.stringify(
  resultTable.current,
)}{JSON.stringify(resultRowIds.current)}<ResultRowView
  queryId="q1"
  rowId="r1"
  queries={queriesId}
/>{JSON.stringify(resultRow.current)}{JSON.stringify(
  resultCellIds.current,
)}<ResultCellView
  queryId="q1"
  rowId="r1"
  cellId="c1"
  queries={queriesId}
/>{JSON.stringify(resultCell.current)}
