<script lang="ts">
  import type {
    Checkpoints,
    Id,
    Indexes,
    Metrics,
    Queries,
    Relationships,
    Store,
  } from 'tinybase';
  import {
    getCheckpointsIds,
    getCell,
    getCellIds,
    getCheckpointIds,
    getIndexIds,
    getIndexesIds,
    getLinkedRowIds,
    getLocalRowIds,
    getMetric,
    getMetricIds,
    getMetricsIds,
    getPersisterIds,
    getQueriesIds,
    getQueryIds,
    getRelationshipIds,
    getRelationshipsIds,
    getRemoteRowId,
    getResultCell,
    getResultCellIds,
    getResultRow,
    getResultRowCount,
    getResultRowIds,
    getResultSortedRowIds,
    getResultTable,
    getResultTableCellIds,
    getRow,
    getRowCount,
    getRowIds,
    getSliceIds,
    getSliceRowIds,
    getSortedRowIds,
    getSynchronizerIds,
    getTable,
    getTableCellIds,
    getTableIds,
    getTables,
    getValue,
    getValueIds,
    getValues,
    hasCell,
    hasIndex,
    hasRow,
    hasSlice,
    hasTable,
    hasTableCell,
    hasTables,
    hasValue,
    hasValues,
  } from 'tinybase/ui-svelte';

  let {
    mode,
    store,
    metrics,
    indexes,
    relationships,
    queries,
    checkpoints,
    tableId,
    rowId,
    cellId,
    valueId,
    metricId,
    indexId,
    sliceId,
    relationshipId,
    localRowId,
    remoteRowId,
    firstRowId,
    queryId,
    descending,
    offset,
    limit,
  }: {
    mode: string;
    store: Store;
    metrics?: Metrics;
    indexes?: Indexes;
    relationships?: Relationships;
    queries?: Queries;
    checkpoints?: Checkpoints;
    tableId: Id;
    rowId: Id;
    cellId: Id;
    valueId: Id;
    metricId: Id;
    indexId: Id;
    sliceId: Id;
    relationshipId: Id;
    localRowId: Id;
    remoteRowId: Id;
    firstRowId: Id;
    queryId: Id;
    descending: boolean;
    offset: number;
    limit: number;
  } = $props();

  const getFunction = () => {
    switch (mode) {
      case 'hasTables':
        return hasTables(() => store);
      case 'tables':
        return getTables(() => store);
      case 'tableIds':
        return getTableIds(() => store);
      case 'hasTable':
        return hasTable(
          () => tableId,
          () => store,
        );
      case 'table':
        return getTable(
          () => tableId,
          () => store,
        );
      case 'tableCellIds':
        return getTableCellIds(
          () => tableId,
          () => store,
        );
      case 'hasTableCell':
        return hasTableCell(
          () => tableId,
          () => cellId,
          () => store,
        );
      case 'rowCount':
        return getRowCount(
          () => tableId,
          () => store,
        );
      case 'rowIds':
        return getRowIds(
          () => tableId,
          () => store,
        );
      case 'sortedRowIds':
        return descending === undefined &&
          offset === undefined &&
          limit === undefined
          ? getSortedRowIds(
              () => tableId,
              () => cellId,
              undefined,
              undefined,
              undefined,
              undefined,
              () => store,
            )
          : getSortedRowIds(
              () => tableId,
              () => cellId,
              () => descending,
              () => offset,
              () => limit,
              undefined,
              () => store,
            );
      case 'hasRow':
        return hasRow(
          () => tableId,
          () => rowId,
          () => store,
        );
      case 'row':
        return getRow(
          () => tableId,
          () => rowId,
          () => store,
        );
      case 'cellIds':
        return getCellIds(
          () => tableId,
          () => rowId,
          () => store,
        );
      case 'hasCell':
        return hasCell(
          () => tableId,
          () => rowId,
          () => cellId,
          () => store,
        );
      case 'cell':
        return getCell(
          () => tableId,
          () => rowId,
          () => cellId,
          () => store,
        );
      case 'hasValues':
        return hasValues(() => store);
      case 'values':
        return getValues(() => store);
      case 'valueIds':
        return getValueIds(() => store);
      case 'hasValue':
        return hasValue(
          () => valueId,
          () => store,
        );
      case 'value':
        return getValue(
          () => valueId,
          () => store,
        );
      case 'metricsIds':
        return getMetricsIds();
      case 'indexesIds':
        return getIndexesIds();
      case 'queriesIds':
        return getQueriesIds();
      case 'relationshipsIds':
        return getRelationshipsIds();
      case 'checkpointsIds':
        return getCheckpointsIds();
      case 'persisterIds':
        return getPersisterIds();
      case 'synchronizerIds':
        return getSynchronizerIds();
      case 'metricIds':
        return getMetricIds(() => metrics);
      case 'metric':
        return getMetric(
          () => metricId,
          () => metrics,
        );
      case 'indexIds':
        return getIndexIds(() => indexes);
      case 'hasIndex':
        return hasIndex(
          () => indexId,
          () => indexes,
        );
      case 'sliceIds':
        return getSliceIds(
          () => indexId,
          () => indexes,
        );
      case 'hasSlice':
        return hasSlice(
          () => indexId,
          () => sliceId,
          () => indexes,
        );
      case 'sliceRowIds':
        return getSliceRowIds(
          () => indexId,
          () => sliceId,
          () => indexes,
        );
      case 'relationshipIds':
        return getRelationshipIds(() => relationships);
      case 'remoteRowId':
        return getRemoteRowId(
          () => relationshipId,
          () => localRowId,
          () => relationships,
        );
      case 'localRowIds':
        return getLocalRowIds(
          () => relationshipId,
          () => remoteRowId,
          () => relationships,
        );
      case 'linkedRowIds':
        return getLinkedRowIds(
          () => relationshipId,
          () => firstRowId,
          () => relationships,
        );
      case 'queryIds':
        return getQueryIds(() => queries);
      case 'resultTable':
        return getResultTable(
          () => queryId,
          () => queries,
        );
      case 'resultTableCellIds':
        return getResultTableCellIds(
          () => queryId,
          () => queries,
        );
      case 'resultRowCount':
        return getResultRowCount(
          () => queryId,
          () => queries,
        );
      case 'resultRowIds':
        return getResultRowIds(
          () => queryId,
          () => queries,
        );
      case 'resultSortedRowIds':
        return descending === undefined &&
          offset === undefined &&
          limit === undefined
          ? getResultSortedRowIds(
              () => queryId,
              () => cellId,
              undefined,
              undefined,
              undefined,
              () => queries,
            )
          : getResultSortedRowIds(
              () => queryId,
              () => cellId,
              () => descending,
              () => offset,
              () => limit,
              () => queries,
            );
      case 'resultRow':
        return getResultRow(
          () => queryId,
          () => rowId,
          () => queries,
        );
      case 'resultCellIds':
        return getResultCellIds(
          () => queryId,
          () => rowId,
          () => queries,
        );
      case 'resultCell':
        return getResultCell(
          () => queryId,
          () => rowId,
          () => cellId,
          () => queries,
        );
      case 'checkpointIds':
        return getCheckpointIds(() => checkpoints);
      default:
        return {current: undefined};
    }
  };
  const value = getFunction();
</script>

{JSON.stringify(value.current)}
