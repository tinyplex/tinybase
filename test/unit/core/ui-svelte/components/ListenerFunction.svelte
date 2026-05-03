<script lang="ts">
  import type {Id, Store} from 'tinybase';
  import {
    onCell,
    onCellIds,
    onDidFinishTransaction,
    onHasCell,
    onHasRow,
    onHasTable,
    onHasTableCell,
    onHasTables,
    onHasValue,
    onHasValues,
    onRow,
    onRowCount,
    onRowIds,
    onSortedRowIds,
    onStartTransaction,
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
    tableId,
    rowId,
    cellId,
    valueId,
  }: {
    mode: string;
    store: Store;
    listener: any;
    tableId?: Id;
    rowId?: Id;
    cellId?: Id;
    valueId?: Id;
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
  }
</script>
