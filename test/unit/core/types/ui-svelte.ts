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
  useHasTables,
  useTables,
  useTableIds,
  useHasTable,
  useTable,
  useTableCellIds,
  useHasTableCell,
  useRowCount,
  useRowIds,
  useSortedRowIds,
  useHasRow,
  useRow,
  useCellIds,
  useHasCell,
  useCell,
  useBindableCell,
  useHasValues,
  useValues,
  useValueIds,
  useHasValue,
  useValue,
  useBindableValue,
  useStore,
  useMetrics,
  useIndexes,
  useQueries,
  useRelationships,
  useCheckpoints,
  useGoBackwardCallback,
  useGoForwardCallback,
  usePersisterStatus,
  useSynchronizerStatus,
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
const {useStore: useStore2} = UiSvelteWithSchemas2;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Getters = () => {
  useStore()?.getTables().t1;
  useStore()?.getTables().t2; // !

  useStore2()?.getTables().t2;
  useStore2()?.getTables().t3; // !

  useHasTables().current as boolean;
  useHasTables().current as string; // !

  useTables().current.t1;
  useTables().current.t2; // !

  useTableIds().current.includes('t1');
  useTableIds().current.includes('t2'); // !

  useHasTable('t1');
  useHasTable('t2'); // !

  useTable('t1').current;
  useTable('t1').current.r1!.c1;
  useTable('t1').current.r1!.c2; // !
  useTable('t2'); // !

  useTableCellIds('t1').current;
  useTableCellIds('t2'); // !

  useHasTableCell('t1', 'c1');
  useHasTableCell('t1', 'c2'); // !
  useHasTableCell('t2', 'c1'); // !

  useRowCount('t1').current as number;
  useRowCount('t2'); // !

  useRowIds('t1').current;
  useRowIds('t2'); // !

  useSortedRowIds('t1', 'c1').current;
  useSortedRowIds('t1', 'c2'); // !
  useSortedRowIds('t2', 'c1'); // !

  useHasRow('t1', 'r1').current as boolean;
  useHasRow('t2', 'r1'); // !

  useRow('t1', 'r1').current;
  useRow('t1', 'r1').current.c1;
  useRow('t1', 'r1').current.c2; // !
  useRow('t2', 'r2'); // !

  useCellIds('t1', 'r1').current.includes('c1');
  useCellIds('t1', 'r1').current.includes('c2'); // !
  useCellIds('t2', 'r2'); // !

  useHasCell('t1', 'r1', 'c1');
  useHasCell('t1', 'r1', 'c2'); // !
  useHasCell('t2', 'r2', 'c1'); // !

  useCell('t1', 'r1', 'c1').current;
  useCell('t1', 'r1', 'c1').current as number;
  useCell('t1', 'r1', 'c1').current as string; // !
  useCell('t1', 'r1', 'c2'); // !
  useCell('t2', 'r2', 'c1'); // !

  useBindableCell('t1', 'r1', 'c1').current as number;
  useBindableCell('t1', 'r1', 'c1').current as string; // !
  useBindableCell('t1', 'r1', 'c1').current as boolean; // !
  useBindableCell('t1', 'r1', 'c2'); // !
  useBindableCell('t2', 'r2', 'c1'); // !

  useHasValues().current as boolean;
  useHasValues().current as string; // !

  useValues().current.v1;
  useValues().current.v2; // !

  useValueIds().current.includes('v1');
  useValueIds().current.includes('v2'); // !

  useHasValue('v1');
  useHasValue('v2'); // !

  useValue('v1').current as number;
  useValue('v1').current as string; // !
  useValue('v2'); // !

  useBindableValue('v1').current as number;
  useBindableValue('v1').current as string; // !
  useBindableValue('v1').current as boolean; // !
  useBindableValue('v2'); // !

  useGoBackwardCallback() as () => void;
  useGoBackwardCallback() as boolean; // !

  useGoForwardCallback() as () => void;
  useGoForwardCallback() as boolean; // !

  usePersisterStatus().current as Status;
  useSynchronizerStatus().current as Status;
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
  useMetrics()?.getStore().getTables().t1;
  useMetrics()?.getStore().getTables().t2; // !

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
  useIndexes()?.getStore().getTables().t1;
  useIndexes()?.getStore().getTables().t2; // !
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Relationships = () => {
  useRelationships()?.getStore().getTables().t1;
  useRelationships()?.getStore().getTables().t2; // !

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
  useQueries()?.getStore().getTables().t1;
  useQueries()?.getStore().getTables().t2; // !

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
  useCheckpoints()?.getStore().getTables().t1;
  useCheckpoints()?.getStore().getTables().t2; // !

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
