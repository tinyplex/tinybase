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
  createHasTables,
  createTables,
  createTableIds,
  createHasTable,
  createTable,
  createTableCellIds,
  createHasTableCell,
  createRowCount,
  createRowIds,
  createSortedRowIds,
  createHasRow,
  createRow,
  createCellIds,
  createHasCell,
  createCell,
  createHasValues,
  createValues,
  createValueIds,
  createHasValue,
  createValue,
  getStore,
  getMetrics,
  getIndexes,
  getQueries,
  getRelationships,
  getCheckpoints,
  createGoBackwardCallback,
  createGoForwardCallback,
  createPersisterStatus,
  createSynchronizerStatus,
  useHasTablesListener,
  useTablesListener,
  useTableIdsListener,
  useHasTableListener,
  useTableListener,
  useTableCellIdsListener,
  useHasTableCellListener,
  useRowCountListener,
  useRowIdsListener,
  useSortedRowIdsListener,
  useHasRowListener,
  useRowListener,
  useCellIdsListener,
  useHasCellListener,
  useCellListener,
  useHasValuesListener,
  useValuesListener,
  useValueIdsListener,
  useHasValueListener,
  useValueListener,
  useStartTransactionListener,
  useWillFinishTransactionListener,
  useDidFinishTransactionListener,
  useMetricListener,
  useSliceIdsListener,
  useSliceRowIdsListener,
  useRemoteRowIdListener,
  useLocalRowIdsListener,
  useLinkedRowIdsListener,
  useResultTableListener,
  useResultTableCellIdsListener,
  useResultRowCountListener,
  useResultRowIdsListener,
  useResultSortedRowIdsListener,
  useResultRowListener,
  useResultCellIdsListener,
  useResultCellListener,
  useParamValuesListener,
  useParamValueListener,
  useCheckpointIdsListener,
  useCheckpointListener,
  usePersisterStatusListener,
  useSynchronizerStatusListener,
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

  createHasTables().current as boolean;
  createHasTables().current as string; // !

  createTables().current.t1;
  createTables().current.t2; // !

  createTableIds().current.includes('t1');
  createTableIds().current.includes('t2'); // !

  createHasTable('t1');
  createHasTable('t2'); // !

  createTable('t1').current;
  createTable('t1').current.r1!.c1;
  createTable('t1').current.r1!.c2; // !
  createTable('t2'); // !

  createTableCellIds('t1').current;
  createTableCellIds('t2'); // !

  createHasTableCell('t1', 'c1');
  createHasTableCell('t1', 'c2'); // !
  createHasTableCell('t2', 'c1'); // !

  createRowCount('t1').current as number;
  createRowCount('t2'); // !

  createRowIds('t1').current;
  createRowIds('t2'); // !

  createSortedRowIds('t1', 'c1').current;
  createSortedRowIds('t1', 'c2'); // !
  createSortedRowIds('t2', 'c1'); // !

  createHasRow('t1', 'r1').current as boolean;
  createHasRow('t2', 'r1'); // !

  createRow('t1', 'r1').current;
  createRow('t1', 'r1').current.c1;
  createRow('t1', 'r1').current.c2; // !
  createRow('t2', 'r2'); // !

  createCellIds('t1', 'r1').current.includes('c1');
  createCellIds('t1', 'r1').current.includes('c2'); // !
  createCellIds('t2', 'r2'); // !

  createHasCell('t1', 'r1', 'c1');
  createHasCell('t1', 'r1', 'c2'); // !
  createHasCell('t2', 'r2', 'c1'); // !

  createCell('t1', 'r1', 'c1').current;
  createCell('t1', 'r1', 'c1').current as number;
  createCell('t1', 'r1', 'c1').current as string; // !
  const cellRef = createCell('t1', 'r1', 'c1');
  cellRef.current = 1;
  cellRef.current = '1'; // !
  createCell('t1', 'r1', 'c2'); // !
  createCell('t2', 'r2', 'c1'); // !

  createHasValues().current as boolean;
  createHasValues().current as string; // !

  createValues().current.v1;
  createValues().current.v2; // !

  createValueIds().current.includes('v1');
  createValueIds().current.includes('v2'); // !

  createHasValue('v1');
  createHasValue('v2'); // !

  createValue('v1').current as number;
  createValue('v1').current as string; // !
  const valueRef = createValue('v1');
  valueRef.current = 1;
  valueRef.current = '1'; // !
  createValue('v2'); // !

  createGoBackwardCallback() as () => void;
  createGoBackwardCallback() as boolean; // !

  createGoForwardCallback() as () => void;
  createGoForwardCallback() as boolean; // !

  createPersisterStatus().current as Status;
  createSynchronizerStatus().current as Status;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Listeners = () => {
  useHasTablesListener((store) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  useHasTablesListener(() => null);

  useTablesListener((store, getCellChange) => {
    store.getTables().t1;
    getCellChange?.('t1', 'r1', 'c1') as [true, number, number];
    store.getTables().t2; // !
    getCellChange?.('t1', 'r1', 'c1') as [true, number, string]; // !
    getCellChange?.('t1', 'r1', 'c1') as [true, string, number]; // !
  });
  useTablesListener((store) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  useTablesListener(() => null);

  useTableIdsListener((store) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  useTableIdsListener(() => null);

  useHasTableListener('t1', (store, tableId) => {
    store.getTables().t1;
    tableId == 't1';
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
  });
  useHasTableListener(null, (store, tableId) => {
    store.getTables().t1;
    tableId == 't1';
    tableId == 't0';
    store.getTables().t2; // !
    tableId == 't2'; // !
  });
  useHasTableListener(null, (store) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  useHasTableListener('t2', () => null); // !

  useTableListener('t1', (store, tableId, getCellChange) => {
    store.getTables().t1;
    tableId == 't1';
    getCellChange?.('t1', 'r1', 'c1') as [true, number, number];
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
  });
  useTableListener(null, (store, tableId) => {
    store.getTables().t1;
    tableId == 't1';
    tableId == 't0';
    store.getTables().t2; // !
    tableId == 't2'; // !
  });
  useTableListener(null, (store) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  useTableListener('t2', () => null); // !

  useTableCellIdsListener('t1', (store, tableId) => {
    store.getTables().t1;
    tableId == 't1';
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
  });
  useTableCellIdsListener(null, (store, tableId) => {
    store.getTables().t1;
    tableId == 't1';
    tableId == 't0';
    store.getTables().t2; // !
    tableId == 't2'; // !
  });
  useTableCellIdsListener('t1', (store) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  useTableCellIdsListener('t1', () => null);
  useTableCellIdsListener('t2', () => null); // !

  useHasTableCellListener('t1', 'c1', (store, tableId, cellId) => {
    store.getTables().t1;
    tableId == 't1';
    cellId == 'c1';
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
    cellId == 'c2'; // !
  });
  useHasTableCellListener('t1', null, (store, tableId, cellId) => {
    store.getTables().t1;
    tableId == 't1';
    cellId == 'c1';
    cellId == 'c1d';
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
    cellId == 'c2'; // !
  });
  useHasTableCellListener('t1', 'c1', (store) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  useHasTableCellListener('t1', 'c1', () => null);
  useHasTableCellListener(
    't1',
    'c2', // !
    () => null,
  );
  useHasTableCellListener('t2', 'c1', () => null); // !

  useRowCountListener('t1', (store, tableId) => {
    store.getTables().t1;
    tableId == 't1';
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
  });
  useRowCountListener(null, (store, tableId) => {
    store.getTables().t1;
    tableId == 't1';
    tableId == 't0';
    store.getTables().t2; // !
    tableId == 't2'; // !
  });
  useRowCountListener('t1', () => null);
  useRowCountListener('t2', () => null); // !

  useRowIdsListener('t1', (store, tableId) => {
    store.getTables().t1;
    tableId == 't1';
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
  });
  useRowIdsListener(null, (store, tableId) => {
    store.getTables().t1;
    tableId == 't1';
    tableId == 't0';
    store.getTables().t2; // !
    tableId == 't2'; // !
  });
  useRowIdsListener('t1', (store) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  useRowIdsListener('t1', () => null);
  useRowIdsListener('t2', () => null); // !

  useSortedRowIdsListener('t1', 'c1', true, 0, 10, (store, tableId, cellId) => {
    store.getTables().t1;
    tableId == 't1';
    cellId == 'c1';
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
    cellId == 'c2'; // !
  });
  useSortedRowIdsListener(
    't1',
    'c2', // !
    true,
    0,
    10,
    () => null,
  );
  useSortedRowIdsListener('t1', 'c1', true, 0, 10, (store) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  useSortedRowIdsListener('t1', 'c1', true, 0, 10, () => null);
  useSortedRowIdsListener(
    't2', // !
    undefined,
    true,
    0,
    10,
    () => null,
  );

  useHasRowListener('t1', null, (store, tableId, rowId) => {
    store.getTables().t1;
    tableId == 't1';
    rowId == 'r1';
    rowId == 'r2';
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
  });
  useHasRowListener(null, 'r1', (store, tableId, rowId) => {
    store.getTables().t1;
    tableId == 't1';
    tableId == 't0';
    rowId == 'r1';
    store.getTables().t2; // !
    tableId == 't2'; // !
    rowId == 'r2'; // !
  });
  useHasRowListener(null, null, (store, tableId, rowId) => {
    store.getTables().t1;
    tableId == 't1';
    tableId == 't0';
    rowId == 'r1';
    rowId == 'r2';
    store.getTables().t2; // !
    tableId == 't2'; // !
  });
  useHasRowListener('t2', 'r2', () => null); // !

  useRowListener('t1', 'r1', (store, tableId, rowId, getCellChange) => {
    store.getTables().t1;
    tableId == 't1';
    rowId == 'r1';
    getCellChange?.('t1', 'r1', 'c1') as [true, number, number];
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
    rowId == 'r2'; // !
  });
  useRowListener('t1', null, (store, tableId, rowId) => {
    store.getTables().t1;
    tableId == 't1';
    rowId == 'r1';
    rowId == 'r2';
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
  });
  useRowListener(null, null, (store, tableId, rowId) => {
    store.getTables().t1;
    tableId == 't1';
    tableId == 't0';
    rowId == 'r1';
    rowId == 'r2';
    store.getTables().t2; // !
    tableId == 't2'; // !
  });
  useRowListener('t2', 'r1', () => null); // !

  useCellIdsListener('t1', 'r1', (store, tableId, rowId) => {
    store.getTables().t1;
    tableId == 't1';
    rowId == 'r1';
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
    rowId == 'r2'; // !
  });
  useCellIdsListener(null, null, (store, tableId, rowId) => {
    store.getTables().t1;
    tableId == 't1';
    tableId == 't0';
    rowId == 'r1';
    rowId == 'r2';
    store.getTables().t2; // !
    tableId == 't2'; // !
  });
  useCellIdsListener('t1', 'r1', (store) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  useCellIdsListener('t1', 'r1', () => null);
  useCellIdsListener('t2', 'r1', () => null); // !

  useHasCellListener('t1', null, 'c1', (store, tableId, rowId, cellId) => {
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
  useHasCellListener(null, null, null, (store, tableId, rowId, cellId) => {
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
  useHasCellListener('t1', 'r1', 'c1', (store) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  useHasCellListener('t1', 'r1', 'c1', () => null);
  useHasCellListener('t1', 'r1', 'c2', () => null); // !
  useHasCellListener('t2', 'r1', 'c1', () => null); // !

  useCellListener(
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
  useCellListener(
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
  useCellListener(null, null, null, (store, tableId, rowId, cellId) => {
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
  useCellListener('t1', 'r1', 'c1', (store) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  useCellListener('t1', 'r1', 'c1', () => null);
  useCellListener('t1', 'r1', 'c2', () => null); // !
  useCellListener('t2', 'r1', 'c1', () => null); // !

  useHasValuesListener((store) => {
    store.getValues().v1;
    store.getValues().v2; // !
  });
  useHasValuesListener(() => null);

  useValuesListener((store, getValueChange) => {
    store.getValues().v1;
    getValueChange?.('v1') as [true, number, number];
    store.getValues().v2; // !
    getValueChange?.('v1') as [true, number, string]; // !
    getValueChange?.('v1') as [true, string, number]; // !
  });
  useValuesListener(() => null);

  useValueIdsListener((store) => {
    store.getValues().v1;
    store.getValues().v2; // !
  });
  useValueIdsListener(() => null);

  useHasValueListener('v1', (store, valueId) => {
    store.getValues().v1;
    valueId == 'v1';
    store.getValues().v2; // !
    valueId == 'v2'; // !
  });
  useHasValueListener(null, (store, valueId) => {
    store.getValues().v1;
    valueId == 'v1';
    valueId == 'v1d';
    store.getValues().v2; // !
    valueId == 'v2'; // !
  });
  useHasValueListener('v1', () => null);
  useHasValueListener('v2', () => null); // !

  useValueListener('v1', (store, valueId, newValue, oldValue) => {
    store.getValues().v1;
    valueId == 'v1';
    newValue as number;
    oldValue as number;
    store.getValues().v2; // !
    valueId == 'v2'; // !
    newValue as string; // !
    oldValue as string; // !
  });
  useValueListener(null, (store, valueId, newValue, oldValue) => {
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
  useValueListener('v1', () => null);
  useValueListener('v2', () => null); // !

  useStartTransactionListener((store) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  useWillFinishTransactionListener((store) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  useDidFinishTransactionListener((store) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Metrics = () => {
  getMetrics()?.getStore().getTables().t1;
  getMetrics()?.getStore().getTables().t2; // !

  useMetricListener('m1', (metrics) => {
    metrics.getStore().getTables().t1;
    metrics.getStore().getTables().t2; // !
  });

  useSliceIdsListener('i1', (indexes) => {
    indexes.getStore().getTables().t1;
    indexes.getStore().getTables().t2; // !
  });

  useSliceRowIdsListener('i1', 's1', (indexes) => {
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

  useRemoteRowIdListener('r1', 'r1', (relationships) => {
    relationships.getStore().getTables().t1;
    relationships.getStore().getTables().t2; // !
  });

  useLocalRowIdsListener('r1', 'r1', (relationships) => {
    relationships.getStore().getTables().t1;
    relationships.getStore().getTables().t2; // !
  });

  useLinkedRowIdsListener('r1', 'r1', (relationships) => {
    relationships.getStore().getTables().t1;
    relationships.getStore().getTables().t2; // !
  });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Queries = () => {
  getQueries()?.getStore().getTables().t1;
  getQueries()?.getStore().getTables().t2; // !

  useResultTableListener('q1', (queries) => {
    queries.getStore().getTables().t1;
    queries.getStore().getTables().t2; // !
  });

  useResultTableCellIdsListener('q1', (queries) => {
    queries.getStore().getTables().t1;
    queries.getStore().getTables().t2; // !
  });

  useResultRowCountListener('q1', (queries) => {
    queries.getStore().getTables().t1;
    queries.getStore().getTables().t2; // !
  });

  useResultRowIdsListener('q1', (queries) => {
    queries.getStore().getTables().t1;
    queries.getStore().getTables().t2; // !
  });

  useResultSortedRowIdsListener('q1', 'rc1', true, 0, 10, (queries) => {
    queries.getStore().getTables().t1;
    queries.getStore().getTables().t2; // !
  });

  useResultRowListener('q1', 'rr1', (queries) => {
    queries.getStore().getTables().t1;
    queries.getStore().getTables().t2; // !
  });

  useResultCellIdsListener('q1', 'rr1', (queries) => {
    queries.getStore().getTables().t1;
    queries.getStore().getTables().t2; // !
  });

  useResultCellListener('q1', 'rr1', 'c1', (queries) => {
    queries.getStore().getTables().t1;
    queries.getStore().getTables().t2; // !
  });

  useParamValuesListener('q1', (queries) => {
    queries.getStore().getTables().t1;
    queries.getStore().getTables().t2; // !
  });

  useParamValueListener('q1', 'p1', (queries) => {
    queries.getStore().getTables().t1;
    queries.getStore().getTables().t2; // !
  });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Checkpoints = () => {
  getCheckpoints()?.getStore().getTables().t1;
  getCheckpoints()?.getStore().getTables().t2; // !

  useCheckpointIdsListener((checkpoints) => {
    checkpoints.getStore().getTables().t1;
    checkpoints.getStore().getTables().t2; // !
  });

  useCheckpointListener('c1', (checkpoints) => {
    checkpoints.getStore().getTables().t1;
    checkpoints.getStore().getTables().t2; // !
  });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Persister = () => {
  usePersisterStatusListener((persister) => {
    persister.getStore().getTables().t1;
    persister.getStore().getTables().t2; // !
  });

  useSynchronizerStatusListener((synchronizer) => {
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
};
