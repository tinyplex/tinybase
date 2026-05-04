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
  import type {AnyPersister} from 'tinybase/persisters';
  import type {Synchronizer} from 'tinybase/synchronizers';
  import {
    onCell,
    onCellIds,
    onCheckpoint,
    onCheckpointIds,
    onDidFinishTransaction,
    onHasCell,
    onHasRow,
    onHasTable,
    onHasTableCell,
    onHasTables,
    onHasValue,
    onHasValues,
    onLinkedRowIds,
    onLocalRowIds,
    onMetric,
    onParamValue,
    onParamValues,
    onPersisterStatus,
    onRemoteRowId,
    onResultCell,
    onResultCellIds,
    onResultRow,
    onResultRowCount,
    onResultRowIds,
    onResultSortedRowIds,
    onResultTable,
    onResultTableCellIds,
    onRow,
    onRowCount,
    onRowIds,
    onSliceIds,
    onSliceRowIds,
    onSortedRowIds,
    onStartTransaction,
    onSynchronizerStatus,
    onTable,
    onTableCellIds,
    onTableIds,
    onTables,
    onValue,
    onValueIds,
    onValues,
    onWillFinishTransaction,
  } from 'tinybase/ui-svelte';

  let {
    mode,
    store,
    listener,
    metrics,
    indexes,
    relationships,
    queries,
    checkpoints,
    persister,
    synchronizer,
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
    paramId,
    checkpointId,
  }: {
    mode: string;
    store: Store;
    listener: any;
    metrics?: Metrics;
    indexes?: Indexes;
    relationships?: Relationships;
    queries?: Queries;
    checkpoints?: Checkpoints;
    persister?: AnyPersister;
    synchronizer?: Synchronizer;
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
    paramId: Id;
    checkpointId: Id;
  } = $props();

  const getMode = () => mode;
  const getListener = () => listener;
  const listenerFn = (...args: any[]) => getListener()?.(...args);

  switch (getMode()) {
    case 'hasTables':
      onHasTables(listenerFn, false, () => store);
      break;
    case 'tables':
      onTables(listenerFn, false, () => store);
      break;
    case 'tableIds':
      onTableIds(listenerFn, false, () => store);
      break;
    case 'hasTable':
      onHasTable(
        () => tableId,
        listenerFn,
        false,
        () => store,
      );
      break;
    case 'table':
      onTable(
        () => tableId,
        listenerFn,
        false,
        () => store,
      );
      break;
    case 'tableCellIds':
      onTableCellIds(
        () => tableId,
        listenerFn,
        false,
        () => store,
      );
      break;
    case 'hasTableCell':
      onHasTableCell(
        () => tableId,
        () => cellId,
        listenerFn,
        false,
        () => store,
      );
      break;
    case 'rowCount':
      onRowCount(
        () => tableId,
        listenerFn,
        false,
        () => store,
      );
      break;
    case 'rowIds':
      onRowIds(
        () => tableId,
        listenerFn,
        false,
        () => store,
      );
      break;
    case 'sortedRowIds':
      onSortedRowIds(
        () => tableId ?? '',
        () => cellId,
        () => false,
        () => 0,
        () => undefined,
        listenerFn,
        false,
        () => store,
      );
      break;
    case 'hasRow':
      onHasRow(
        () => tableId,
        () => rowId,
        listenerFn,
        false,
        () => store,
      );
      break;
    case 'row':
      onRow(
        () => tableId,
        () => rowId,
        listenerFn,
        false,
        () => store,
      );
      break;
    case 'cellIds':
      onCellIds(
        () => tableId,
        () => rowId,
        listenerFn,
        false,
        () => store,
      );
      break;
    case 'hasCell':
      onHasCell(
        () => tableId,
        () => rowId,
        () => cellId,
        listenerFn,
        false,
        () => store,
      );
      break;
    case 'cell':
      onCell(
        () => tableId,
        () => rowId,
        () => cellId,
        listenerFn,
        false,
        () => store,
      );
      break;
    case 'hasValues':
      onHasValues(listenerFn, false, () => store);
      break;
    case 'values':
      onValues(listenerFn, false, () => store);
      break;
    case 'valueIds':
      onValueIds(listenerFn, false, () => store);
      break;
    case 'hasValue':
      onHasValue(
        () => valueId,
        listenerFn,
        false,
        () => store,
      );
      break;
    case 'value':
      onValue(
        () => valueId,
        listenerFn,
        false,
        () => store,
      );
      break;
    case 'startTransaction':
      onStartTransaction(listenerFn, () => store);
      break;
    case 'willFinishTransaction':
      onWillFinishTransaction(listenerFn, () => store);
      break;
    case 'didFinishTransaction':
      onDidFinishTransaction(listenerFn, () => store);
      break;
    case 'metric':
      onMetric(
        () => metricId,
        listenerFn,
        () => metrics,
      );
      break;
    case 'sliceIds':
      onSliceIds(
        () => indexId,
        listenerFn,
        () => indexes,
      );
      break;
    case 'sliceRowIds':
      onSliceRowIds(
        () => indexId,
        () => sliceId,
        listenerFn,
        () => indexes,
      );
      break;
    case 'remoteRowId':
      onRemoteRowId(
        () => relationshipId,
        () => localRowId,
        listenerFn,
        () => relationships,
      );
      break;
    case 'localRowIds':
      onLocalRowIds(
        () => relationshipId,
        () => remoteRowId,
        listenerFn,
        () => relationships,
      );
      break;
    case 'linkedRowIds':
      onLinkedRowIds(
        () => relationshipId ?? '',
        () => firstRowId ?? '',
        listenerFn,
        () => relationships,
      );
      break;
    case 'resultTable':
      onResultTable(
        () => queryId,
        listenerFn,
        () => queries,
      );
      break;
    case 'resultTableCellIds':
      onResultTableCellIds(
        () => queryId,
        listenerFn,
        () => queries,
      );
      break;
    case 'resultRowCount':
      onResultRowCount(
        () => queryId,
        listenerFn,
        () => queries,
      );
      break;
    case 'resultRowIds':
      onResultRowIds(
        () => queryId,
        listenerFn,
        () => queries,
      );
      break;
    case 'resultSortedRowIds':
      onResultSortedRowIds(
        () => queryId ?? '',
        () => cellId,
        () => false,
        () => 0,
        () => undefined,
        listenerFn,
        () => queries,
      );
      break;
    case 'resultRow':
      onResultRow(
        () => queryId,
        () => rowId,
        listenerFn,
        () => queries,
      );
      break;
    case 'resultCellIds':
      onResultCellIds(
        () => queryId,
        () => rowId,
        listenerFn,
        () => queries,
      );
      break;
    case 'resultCell':
      onResultCell(
        () => queryId,
        () => rowId,
        () => cellId,
        listenerFn,
        () => queries,
      );
      break;
    case 'paramValues':
      onParamValues(
        () => queryId,
        listenerFn,
        () => queries,
      );
      break;
    case 'paramValue':
      onParamValue(
        () => queryId,
        () => paramId,
        listenerFn,
        () => queries,
      );
      break;
    case 'checkpointIds':
      onCheckpointIds(listenerFn, () => checkpoints);
      break;
    case 'checkpoint':
      onCheckpoint(
        () => checkpointId,
        listenerFn,
        () => checkpoints,
      );
      break;
    case 'persisterStatus':
      onPersisterStatus(listenerFn, () => persister);
      break;
    case 'synchronizerStatus':
      onSynchronizerStatus(listenerFn, () => synchronizer);
      break;
  }
</script>
