/* eslint-disable @typescript-eslint/no-unused-expressions */
// NB: an exclamation mark after a line visually indicates an expected TS error
import type {Status} from 'tinybase/persisters/with-schemas';
import * as UiSvelte from 'tinybase/ui-svelte/with-schemas';
import type {NoValuesSchema} from 'tinybase/with-schemas';
import {createStore} from 'tinybase/with-schemas';

const tablesSchema = {
  t0: {c0: {type: 'number'}},
  t1: {
    c1: {type: 'number'},
    c1d: {type: 'string', default: ''},
  },
} as const;

const valuesSchema = {
  v1: {type: 'number'},
  v1d: {type: 'string', default: ''},
} as const;

const UiSvelteWithSchemas = UiSvelte as UiSvelte.WithSchemas<
  [typeof tablesSchema, typeof valuesSchema]
>;
const {
  hasTables,
  getTables,
  getTableIds,
  hasTable,
  getTable,
  getTableCellIds,
  hasTableCell,
  getRowCount,
  getRowIds,
  getSortedRowIds,
  hasRow,
  getRow,
  getCellIds,
  hasCell,
  getCell,
  hasValues,
  getValues,
  getValueIds,
  hasValue,
  getValue,
  getStore,
  getMetrics,
  getIndexes,
  getQueries,
  getRelationships,
  getCheckpoints,
  createGoBackwardCallback,
  createGoForwardCallback,
  getPersisterStatus,
  getSynchronizerStatus,
  onHasTables,
  onTables,
  onTableIds,
  onHasTable,
  onTable,
  onTableCellIds,
  onHasTableCell,
  onRowCount,
  onRowIds,
  onSortedRowIds,
  onHasRow,
  onRow,
  onCellIds,
  onHasCell,
  onCell,
  onHasValues,
  onValues,
  onValueIds,
  onHasValue,
  onValue,
  onStartTransaction,
  onWillFinishTransaction,
  onDidFinishTransaction,
  onMetric,
  onSliceIds,
  onSliceRowIds,
  onRemoteRowId,
  onLocalRowIds,
  onLinkedRowIds,
  onResultTable,
  onResultTableCellIds,
  onResultRowCount,
  onResultRowIds,
  onResultSortedRowIds,
  onResultRow,
  onResultCellIds,
  onResultCell,
  onParamValues,
  onParamValue,
  onCheckpointIds,
  onCheckpoint,
  onPersisterStatus,
  onSynchronizerStatus,
} = UiSvelteWithSchemas;

const UiSvelteWithSchemas2 = UiSvelte as UiSvelte.WithSchemas<
  [{t2: {c2: {type: 'number'}}}, NoValuesSchema]
>;
const {getStore: getStore2} = UiSvelteWithSchemas2;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Getters = () => {
  getStore()?.getTables().t1;
  getStore()?.getTables().t2; // !

  getStore2()?.getTables().t2;
  getStore2()?.getTables().t3; // !

  hasTables().current as boolean;
  hasTables().current as string; // !

  getTables().current.t1;
  getTables().current.t2; // !

  getTableIds().current.includes('t1');
  getTableIds().current.includes('t2'); // !

  hasTable('t1');
  hasTable('t2'); // !

  getTable('t1').current;
  getTable('t1').current.r1!.c1;
  getTable('t1').current.r1!.c2; // !
  getTable('t2'); // !

  getTableCellIds('t1').current;
  getTableCellIds('t2'); // !

  hasTableCell('t1', 'c1');
  hasTableCell('t1', 'c2'); // !
  hasTableCell('t2', 'c1'); // !

  getRowCount('t1').current as number;
  getRowCount('t2'); // !

  getRowIds('t1').current;
  getRowIds('t2'); // !

  getSortedRowIds('t1', 'c1').current;
  getSortedRowIds('t1', 'c2'); // !
  getSortedRowIds('t2', 'c1'); // !

  hasRow('t1', 'r1').current as boolean;
  hasRow('t2', 'r1'); // !

  getRow('t1', 'r1').current;
  getRow('t1', 'r1').current.c1;
  getRow('t1', 'r1').current.c2; // !
  getRow('t2', 'r2'); // !

  getCellIds('t1', 'r1').current.includes('c1');
  getCellIds('t1', 'r1').current.includes('c2'); // !
  getCellIds('t2', 'r2'); // !

  hasCell('t1', 'r1', 'c1');
  hasCell('t1', 'r1', 'c2'); // !
  hasCell('t2', 'r2', 'c1'); // !

  getCell('t1', 'r1', 'c1').current;
  getCell('t1', 'r1', 'c1').current as number;
  getCell('t1', 'r1', 'c1').current as string; // !
  const cellRef = getCell('t1', 'r1', 'c1');
  cellRef.current = 1;
  cellRef.current = '1'; // !
  getCell('t1', 'r1', 'c2'); // !
  getCell('t2', 'r2', 'c1'); // !

  hasValues().current as boolean;
  hasValues().current as string; // !

  getValues().current.v1;
  getValues().current.v2; // !

  getValueIds().current.includes('v1');
  getValueIds().current.includes('v2'); // !

  hasValue('v1');
  hasValue('v2'); // !

  getValue('v1').current as number;
  getValue('v1').current as string; // !
  const valueRef = getValue('v1');
  valueRef.current = 1;
  valueRef.current = '1'; // !
  getValue('v2'); // !

  createGoBackwardCallback() as () => void;
  createGoBackwardCallback() as boolean; // !

  createGoForwardCallback() as () => void;
  createGoForwardCallback() as boolean; // !

  getPersisterStatus().current as Status;
  getSynchronizerStatus().current as Status;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Listeners = () => {
  onHasTables((store) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  onHasTables(() => null);

  onTables((store, getCellChange) => {
    store.getTables().t1;
    getCellChange?.('t1', 'r1', 'c1') as [true, number, number];
    store.getTables().t2; // !
    getCellChange?.('t1', 'r1', 'c1') as [true, number, string]; // !
    getCellChange?.('t1', 'r1', 'c1') as [true, string, number]; // !
  });
  onTables((store) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  onTables(() => null);

  onTableIds((store) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  onTableIds(() => null);

  onHasTable('t1', (store, tableId) => {
    store.getTables().t1;
    tableId == 't1';
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
  });
  onHasTable(null, (store, tableId) => {
    store.getTables().t1;
    tableId == 't1';
    tableId == 't0';
    store.getTables().t2; // !
    tableId == 't2'; // !
  });
  onHasTable(null, (store) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  onHasTable('t2', () => null); // !

  onTable('t1', (store, tableId, getCellChange) => {
    store.getTables().t1;
    tableId == 't1';
    getCellChange?.('t1', 'r1', 'c1') as [true, number, number];
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
  });
  onTable(null, (store, tableId) => {
    store.getTables().t1;
    tableId == 't1';
    tableId == 't0';
    store.getTables().t2; // !
    tableId == 't2'; // !
  });
  onTable(null, (store) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  onTable('t2', () => null); // !

  onTableCellIds('t1', (store, tableId) => {
    store.getTables().t1;
    tableId == 't1';
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
  });
  onTableCellIds(null, (store, tableId) => {
    store.getTables().t1;
    tableId == 't1';
    tableId == 't0';
    store.getTables().t2; // !
    tableId == 't2'; // !
  });
  onTableCellIds('t1', (store, _tableId, _getIdChanges) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  onTableCellIds('t1', () => null);
  onTableCellIds('t2', () => null); // !

  onHasTableCell('t1', 'c1', (store, tableId, cellId) => {
    store.getTables().t1;
    tableId == 't1';
    cellId == 'c1';
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
    cellId == 'c2'; // !
  });
  onHasTableCell('t1', null, (store, tableId, cellId) => {
    store.getTables().t1;
    tableId == 't1';
    cellId == 'c1';
    cellId == 'c1d';
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
    cellId == 'c2'; // !
  });
  onHasTableCell('t1', 'c1', (store, _tableId, _cellId) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  onHasTableCell('t1', 'c1', () => null);
  onHasTableCell(
    't1',
    'c2', // !
    () => null,
  );
  onHasTableCell('t2', 'c1', () => null); // !

  onRowCount('t1', (store, tableId) => {
    store.getTables().t1;
    tableId == 't1';
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
  });
  onRowCount(null, (store, tableId) => {
    store.getTables().t1;
    tableId == 't1';
    tableId == 't0';
    store.getTables().t2; // !
    tableId == 't2'; // !
  });
  onRowCount('t1', () => null);
  onRowCount('t2', () => null); // !

  onRowIds('t1', (store, tableId) => {
    store.getTables().t1;
    tableId == 't1';
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
  });
  onRowIds(null, (store, tableId) => {
    store.getTables().t1;
    tableId == 't1';
    tableId == 't0';
    store.getTables().t2; // !
    tableId == 't2'; // !
  });
  onRowIds('t1', (store) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  onRowIds('t1', () => null);
  onRowIds('t2', () => null); // !

  onSortedRowIds('t1', 'c1', true, 0, 10, (store, tableId, cellId) => {
    store.getTables().t1;
    tableId == 't1';
    cellId == 'c1';
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
    cellId == 'c2'; // !
  });
  onSortedRowIds(
    't1',
    'c2', // !
    true,
    0,
    10,
    () => null,
  );
  onSortedRowIds('t1', 'c1', true, 0, 10, (store) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  onSortedRowIds('t1', 'c1', true, 0, 10, () => null);
  onSortedRowIds(
    't2', // !
    undefined,
    true,
    0,
    10,
    () => null,
  );

  onHasRow('t1', null, (store, tableId, rowId) => {
    store.getTables().t1;
    tableId == 't1';
    rowId == 'r1';
    rowId == 'r2';
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
  });
  onHasRow(null, 'r1', (store, tableId, rowId) => {
    store.getTables().t1;
    tableId == 't1';
    tableId == 't0';
    rowId == 'r1';
    store.getTables().t2; // !
    tableId == 't2'; // !
    rowId == 'r2'; // !
  });
  onHasRow(null, null, (store, tableId, rowId) => {
    store.getTables().t1;
    tableId == 't1';
    tableId == 't0';
    rowId == 'r1';
    rowId == 'r2';
    store.getTables().t2; // !
    tableId == 't2'; // !
  });
  onHasRow('t2', 'r2', () => null); // !

  onRow('t1', 'r1', (store, tableId, rowId, getCellChange) => {
    store.getTables().t1;
    tableId == 't1';
    rowId == 'r1';
    getCellChange?.('t1', 'r1', 'c1') as [true, number, number];
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
    rowId == 'r2'; // !
  });
  onRow('t1', null, (store, tableId, rowId) => {
    store.getTables().t1;
    tableId == 't1';
    rowId == 'r1';
    rowId == 'r2';
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
  });
  onRow(null, null, (store, tableId, rowId) => {
    store.getTables().t1;
    tableId == 't1';
    tableId == 't0';
    rowId == 'r1';
    rowId == 'r2';
    store.getTables().t2; // !
    tableId == 't2'; // !
  });
  onRow('t2', 'r1', () => null); // !

  onCellIds('t1', 'r1', (store, tableId, rowId) => {
    store.getTables().t1;
    tableId == 't1';
    rowId == 'r1';
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
    rowId == 'r2'; // !
  });
  onCellIds(null, null, (store, tableId, rowId) => {
    store.getTables().t1;
    tableId == 't1';
    tableId == 't0';
    rowId == 'r1';
    rowId == 'r2';
    store.getTables().t2; // !
    tableId == 't2'; // !
  });
  onCellIds('t1', 'r1', (store, _tableId, _rowId, _getIdChanges) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  onCellIds('t1', 'r1', () => null);
  onCellIds('t2', 'r1', () => null); // !

  onHasCell('t1', null, 'c1', (store, tableId, rowId, cellId) => {
    store.getTables().t1;
    tableId == 't1';
    rowId == 'r1';
    rowId == 'r2';
    cellId == 'c1';
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
    cellId == 'c2'; // !
  });
  onHasCell(null, null, null, (store, tableId, rowId, cellId) => {
    store.getTables().t1;
    tableId == 't1';
    tableId == 't0';
    rowId == 'r1';
    rowId == 'r2';
    cellId == 'c1';
    cellId == 'c1d';
    cellId == 'c0';
    if (tableId == 't1') {
      cellId == 'c1';
      cellId == 'c1d';
      cellId == 'c0'; // !
    }
    store.getTables().t2; // !
    tableId == 't2'; // !
    cellId == 'c2'; // !
  });
  onHasCell('t1', 'r1', 'c1', (store, _tableId, _rowId, _cellId, _hasCell) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  onHasCell('t1', 'r1', 'c1', () => null);
  onHasCell('t1', 'r1', 'c2', () => null); // !
  onHasCell('t2', 'r1', 'c1', () => null); // !

  onCell(
    't1',
    'r1',
    'c1',
    (store, tableId, rowId, cellId, newCell, oldCell) => {
      store.getTables().t1;
      tableId == 't1';
      rowId == 'r1';
      cellId == 'c1';
      newCell as number;
      oldCell as number;
      newCell as string; // !
      oldCell as string; // !
      store.getTables().t2; // !
      tableId == 't0'; // !
      tableId == 't2'; // !
      rowId == 'r2'; // !
      cellId == 'c1d'; // !
      cellId == 'c2'; // !
    },
  );
  onCell(
    't1',
    'r1',
    null,
    (store, tableId, rowId, cellId, newCell, oldCell) => {
      store.getTables().t1;
      tableId == 't1';
      rowId == 'r1';
      cellId == 'c1';
      cellId == 'c1d';
      newCell as number;
      oldCell as number;
      newCell as string;
      oldCell as string;
      if (cellId == 'c1') {
        newCell as number;
        oldCell as number;
        newCell as string; // !
        oldCell as string; // !
      }
      if (cellId == 'c1d') {
        newCell as string;
        oldCell as string;
        newCell as number; // !
        oldCell as number; // !
      }
      store.getTables().t2; // !
      tableId == 't0'; // !
      tableId == 't2'; // !
      rowId == 'r2'; // !
      cellId == 'c2'; // !
    },
  );
  onCell(null, null, null, (store, tableId, rowId, cellId) => {
    store.getTables().t1;
    tableId == 't1';
    tableId == 't0';
    rowId == 'r1';
    rowId == 'r2';
    cellId == 'c1';
    cellId == 'c1d';
    cellId == 'c0';
    if (tableId == 't1') {
      cellId == 'c1';
      cellId == 'c1d';
      cellId == 'c0'; // !
    }
    store.getTables().t2; // !
    tableId == 't2'; // !
    cellId == 'c2'; // !
  });
  onCell(
    't1',
    'r1',
    'c1',
    (store, _tableId, _rowId, _cellId, _newCell, _oldCell, _getCellChange) => {
      store.getTables().t1;
      store.getTables().t2; // !
    },
  );
  onCell('t1', 'r1', 'c1', () => null);
  onCell('t1', 'r1', 'c2', () => null); // !
  onCell('t2', 'r1', 'c1', () => null); // !

  onHasValues((store) => {
    store.getValues().v1;
    store.getValues().v2; // !
  });
  onHasValues(() => null);

  onValues((store, getValueChange) => {
    store.getValues().v1;
    getValueChange?.('v1') as [true, number, number];
    store.getValues().v2; // !
    getValueChange?.('v1') as [true, number, string]; // !
    getValueChange?.('v1') as [true, string, number]; // !
  });
  onValues(() => null);

  onValueIds((store) => {
    store.getValues().v1;
    store.getValues().v2; // !
  });
  onValueIds(() => null);

  onHasValue('v1', (store, valueId) => {
    store.getValues().v1;
    valueId == 'v1';
    store.getValues().v2; // !
    valueId == 'v2'; // !
  });
  onHasValue(null, (store, valueId) => {
    store.getValues().v1;
    valueId == 'v1';
    valueId == 'v1d';
    store.getValues().v2; // !
    valueId == 'v2'; // !
  });
  onHasValue('v1', () => null);
  onHasValue('v2', () => null); // !

  onValue('v1', (store, valueId, newValue, oldValue) => {
    store.getValues().v1;
    valueId == 'v1';
    newValue as number;
    oldValue as number;
    store.getValues().v2; // !
    valueId == 'v2'; // !
    newValue as string; // !
    oldValue as string; // !
  });
  onValue(null, (store, valueId, newValue, oldValue) => {
    store.getValues().v1;
    valueId == 'v1';
    valueId == 'v1d';
    newValue as number;
    oldValue as number;
    newValue as string;
    oldValue as string;
    if (valueId == 'v1') {
      newValue as number;
      oldValue as number;
      newValue as string; // !
      oldValue as string; // !
    }
    if (valueId == 'v1d') {
      newValue as string;
      oldValue as string;
      newValue as number; // !
      oldValue as number; // !
    }
    store.getValues().v2; // !
    valueId == 'v2'; // !
  });
  onValue('v1', () => null);
  onValue('v2', () => null); // !

  onStartTransaction((store) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  onWillFinishTransaction((store) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  onDidFinishTransaction((store) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Metrics = () => {
  getMetrics()?.getStore().getTables().t1;
  getMetrics()?.getStore().getTables().t2; // !

  onMetric('m1', (metrics) => {
    metrics.getStore().getTables().t1;
    metrics.getStore().getTables().t2; // !
  });

  onSliceIds('i1', (indexes) => {
    indexes.getStore().getTables().t1;
    indexes.getStore().getTables().t2; // !
  });

  onSliceRowIds('i1', 's1', (indexes) => {
    indexes.getStore().getTables().t1;
    indexes.getStore().getTables().t2; // !
  });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Indexes = () => {
  getIndexes()?.getStore().getTables().t1;
  getIndexes()?.getStore().getTables().t2; // !
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Relationships = () => {
  getRelationships()?.getStore().getTables().t1;
  getRelationships()?.getStore().getTables().t2; // !

  onRemoteRowId('r1', 'r1', (relationships) => {
    relationships.getStore().getTables().t1;
    relationships.getStore().getTables().t2; // !
  });

  onLocalRowIds('r1', 'r1', (relationships) => {
    relationships.getStore().getTables().t1;
    relationships.getStore().getTables().t2; // !
  });

  onLinkedRowIds('r1', 'r1', (relationships) => {
    relationships.getStore().getTables().t1;
    relationships.getStore().getTables().t2; // !
  });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Queries = () => {
  getQueries()?.getStore().getTables().t1;
  getQueries()?.getStore().getTables().t2; // !

  onResultTable('q1', (queries) => {
    queries.getStore().getTables().t1;
    queries.getStore().getTables().t2; // !
  });

  onResultTableCellIds('q1', (queries) => {
    queries.getStore().getTables().t1;
    queries.getStore().getTables().t2; // !
  });

  onResultRowCount('q1', (queries) => {
    queries.getStore().getTables().t1;
    queries.getStore().getTables().t2; // !
  });

  onResultRowIds('q1', (queries) => {
    queries.getStore().getTables().t1;
    queries.getStore().getTables().t2; // !
  });

  onResultSortedRowIds('q1', 'rc1', true, 0, 10, (queries) => {
    queries.getStore().getTables().t1;
    queries.getStore().getTables().t2; // !
  });

  onResultRow('q1', 'rr1', (queries) => {
    queries.getStore().getTables().t1;
    queries.getStore().getTables().t2; // !
  });

  onResultCellIds('q1', 'rr1', (queries) => {
    queries.getStore().getTables().t1;
    queries.getStore().getTables().t2; // !
  });

  onResultCell('q1', 'rr1', 'c1', (queries) => {
    queries.getStore().getTables().t1;
    queries.getStore().getTables().t2; // !
  });

  onParamValues('q1', (queries) => {
    queries.getStore().getTables().t1;
    queries.getStore().getTables().t2; // !
  });

  onParamValue('q1', 'p1', (queries) => {
    queries.getStore().getTables().t1;
    queries.getStore().getTables().t2; // !
  });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Checkpoints = () => {
  getCheckpoints()?.getStore().getTables().t1;
  getCheckpoints()?.getStore().getTables().t2; // !

  onCheckpointIds((checkpoints) => {
    checkpoints.getStore().getTables().t1;
    checkpoints.getStore().getTables().t2; // !
  });

  onCheckpoint('c1', (checkpoints) => {
    checkpoints.getStore().getTables().t1;
    checkpoints.getStore().getTables().t2; // !
  });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Persister = () => {
  onPersisterStatus((persister) => {
    persister.getStore().getTables().t1;
    persister.getStore().getTables().t2; // !
  });

  onSynchronizerStatus((synchronizer) => {
    synchronizer.getStore().getTables().t1;
    synchronizer.getStore().getTables().t2; // !
  });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ComponentProps = () => {
  const testCellViewProps = (
    _p: (typeof UiSvelteWithSchemas)['CellViewProps'],
  ) => {};
  testCellViewProps({tableId: 't1', rowId: 'r1', cellId: 'c1'});
  testCellViewProps({tableId: 't2', rowId: 'r1', cellId: 'c1'}); // !
  testCellViewProps({tableId: 't1', rowId: 'r1', cellId: 'c2'}); // !

  const testValueViewProps = (
    _p: (typeof UiSvelteWithSchemas)['ValueViewProps'],
  ) => {};
  testValueViewProps({valueId: 'v1'});
  testValueViewProps({valueId: 'v2'}); // !

  const testTableViewProps = (
    _p: (typeof UiSvelteWithSchemas)['TableViewProps'],
  ) => {};
  testTableViewProps({tableId: 't1'});
  testTableViewProps({tableId: 't2'}); // !

  const testSortedTableViewProps = (
    _p: (typeof UiSvelteWithSchemas)['SortedTableViewProps'],
  ) => {};
  testSortedTableViewProps({tableId: 't1'});
  testSortedTableViewProps({tableId: 't1', cellId: 'c1'});
  testSortedTableViewProps({tableId: 't1', cellId: 'c2'}); // !
  testSortedTableViewProps({tableId: 't2'}); // !

  const testRowViewProps = (
    _p: (typeof UiSvelteWithSchemas)['RowViewProps'],
  ) => {};
  testRowViewProps({tableId: 't1', rowId: 'r1'});
  testRowViewProps({tableId: 't2', rowId: 'r1'}); // !

  const testTablesViewProps = (
    _p: (typeof UiSvelteWithSchemas)['TablesViewProps'],
  ) => {};
  testTablesViewProps({});

  const testValuesViewProps = (
    _p: (typeof UiSvelteWithSchemas)['ValuesViewProps'],
  ) => {};
  testValuesViewProps({});

  const testProviderStore = (
    _s: (typeof UiSvelteWithSchemas)['ProviderProps']['store'],
  ) => {};
  testProviderStore(createStore().setSchema(tablesSchema, valuesSchema));
  testProviderStore(createStore().setTablesSchema(tablesSchema)); // !
  testProviderStore(createStore().setValuesSchema(valuesSchema)); // !
  testProviderStore(createStore()); // !

  const numericSorter = (sortKey1: unknown, sortKey2: unknown) =>
    Number(sortKey1) - Number(sortKey2);
  getSortedRowIds(
    't1',
    undefined,
    false,
    0,
    undefined,
    numericSorter,
  ).current;
  getSortedRowIds({tableId: 't1', sorter: numericSorter}).current;
  getSortedRowIds({
    tableId: 't1',
    cellId: 'c1',
    sorter: numericSorter,
  }).current;
  const stringOnlySorter = (sortKey1: string, sortKey2: string) =>
    sortKey1.localeCompare(sortKey2);
  const stringReturningSorter = () => 'sort';
  const extraArgSorter = (
    _sortKey1: unknown,
    _sortKey2: unknown,
    _extra: string,
  ) => 0;
  getSortedRowIds(
    't1',
    undefined,
    false,
    0,
    undefined,
    stringOnlySorter, // !
  ).current;
  getSortedRowIds({ // !
    tableId: 't1',
    sorter: stringReturningSorter,
  }).current;
  onSortedRowIds(
    {tableId: 't1', cellId: 'c1', sorter: numericSorter},
    (_store, tableId, cellId) => {
      tableId == 't1';
      cellId == 'c1';
    },
  );
  onSortedRowIds(
    {
      tableId: 't1',
      sorter: extraArgSorter, // !
    },
    () => null,
  );
};
