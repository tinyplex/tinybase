/* eslint-disable @typescript-eslint/no-non-null-assertion */

// NB: an exclamation mark after a line visually indicates an expected TS error

import * as UiReact from 'tinybase/debug/ui-react/with-schemas';
import type {Id, NoValuesSchema} from 'tinybase/debug/with-schemas';
import {
  createCheckpoints,
  createIndexes,
  createMetrics,
  createQueries,
  createRelationships,
  createStore,
} from 'tinybase/debug/with-schemas';
import React from 'react';
import {createFilePersister} from 'tinybase/debug/persisters/persister-file/with-schemas';

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

const UiReactWithSchemas = UiReact as UiReact.WithSchemas<
  [typeof tablesSchema, typeof valuesSchema]
>;
const {
  CellView,
  LinkedRowsView,
  LocalRowsView,
  Provider,
  RemoteRowView,
  useHasValueListener,
  RowView,
  SortedTableView,
  useHasRowListener,
  TablesView,
  TableView,
  useAddRowCallback,
  useCell,
  useHasCellListener,
  useCellIds,
  useCellIdsListener,
  useCellListener,
  useCheckpointIdsListener,
  useCheckpointListener,
  useHasTableListener,
  useCheckpoints,
  useCreateCheckpoints,
  useCreateIndexes,
  useCreateMetrics,
  useCreatePersister,
  useCreateQueries,
  useCreateRelationships,
  useCreateStore,
  useDelCellCallback,
  useDelRowCallback,
  useDelTableCallback,
  useDelTablesCallback,
  useDelValueCallback,
  useDelValuesCallback,
  useGoToCallback,
  useHasCell,
  useHasRow,
  useHasTable,
  useHasTableCell,
  useHasTables,
  useHasValue,
  useHasValues,
  useIndexes,
  useHasValuesListener,
  useLinkedRowIdsListener,
  useLocalRowIdsListener,
  useMetricListener,
  useMetrics,
  useQueries,
  useHasTablesListener,
  useRelationships,
  useRemoteRowIdListener,
  useResultCellIdsListener,
  useResultCellListener,
  useResultRowIdsListener,
  useResultRowListener,
  useResultSortedRowIdsListener,
  useResultTableListener,
  useRow,
  useRowIds,
  useRowIdsListener,
  useRowListener,
  useSetCellCallback,
  useSetCheckpointCallback,
  useSetPartialRowCallback,
  useSetPartialValuesCallback,
  useSetRowCallback,
  useSetTableCallback,
  useSetTablesCallback,
  useSetValueCallback,
  useSetValuesCallback,
  useSliceIdsListener,
  useSliceRowIdsListener,
  useSortedRowIds,
  useSortedRowIdsListener,
  useStore,
  useTable,
  useTableCellIds,
  useTableCellIdsListener,
  useTableIds,
  useTableIdsListener,
  useTableListener,
  useTables,
  useTablesListener,
  useValue,
  useValueIds,
  useValueIdsListener,
  useValueListener,
  useValues,
  useValuesListener,
  useHasTableCellListener,
  ValuesView,
  ValueView,
} = UiReactWithSchemas;

const UiReactWithSchemas2 = UiReact as UiReact.WithSchemas<
  [{t2: {c2: {type: 'number'}}}, NoValuesSchema]
>;
const {useStore: useStore2} = UiReactWithSchemas2;

const _Getters = () => {
  const storeWithSchemas = useCreateStore(() =>
    createStore().setSchema(tablesSchema, valuesSchema),
  );
  storeWithSchemas.getTables().t1;
  storeWithSchemas.getTables().t2; // !
  useCreateStore(() => createStore()); // !
  useCreateStore(() => createStore().setTablesSchema(tablesSchema)); // !
  useCreateStore(() => createStore().setValuesSchema(valuesSchema)); // !

  useStore()?.getTables().t1;
  useStore()?.getTables().t2; // !

  useStore2()?.getTables().t2;
  useStore2()?.getTables().t3; // !

  useHasTables() as boolean;
  useHasTables() as string; // !

  useTables().t1;
  useTables().t2; // !

  useTableIds().includes('t1');
  useTableIds().includes('t2'); // !

  useHasTable('t1'); // !
  useHasTable('t2'); // !

  useTable('t1');
  useTable('t1').r1!.c1;
  useTable('t1').r1!.c2; // !
  useTable('t2'); // !

  useTableCellIds('t1');
  useTableCellIds('t2'); // !

  useHasTableCell('t1', 'c1');
  useHasTableCell('t1', 'c2'); // !
  useHasTableCell('t2', 'r2'); // !

  useRowIds('t1');
  useRowIds('t2'); // !

  useSortedRowIds('t1', 'c1');
  useSortedRowIds('t1', 'c2'); // !
  useSortedRowIds('t2', 'r2'); // !

  useHasRow('t1', 'r1');
  useHasRow('t1', 'r2');
  useHasRow('t2', 'r1'); // !

  useRow('t1', 'r1');
  useRow('t1', 'r1').c1;
  useRow('t1', 'r1').c2; // !
  useRow('t2', 'r2'); // !

  useCellIds('t1', 'r1').includes('c1');
  useCellIds('t1', 'r1').includes('c2'); // !
  useCellIds('t2', 'r2'); // !

  useHasCell('t1', 'r1', 'c1');
  useHasCell('t1', 'r1', 'c2'); // !
  useHasCell('t2', 'r2', 'c2'); // !

  useCell('t1', 'r1', 'c1');
  useCell('t1', 'r1', 'c1') as number;
  useCell('t1', 'r1', 'c1') as string; // !
  useCell('t1', 'r1', 'c2'); // !
  useCell('t2', 'r2', 'c2'); // !

  useHasValues() as boolean;
  useHasValues() as string; // !

  useValues().v1;
  useValues().v2; // !

  useValueIds().includes('v1');
  useValueIds().includes('v2'); // !

  useHasValue('v1');
  useHasValue('v2'); // !

  useValue('v1') as number;
  useValue('v1') as string; // !
  useValue('v2'); // !
};

const _Setters = () => {
  useSetTablesCallback(
    (_e, store) => {
      store.getTables().t1;
      store.getTables().t2; // !
      return {t1: {r1: {c1: 1}}};
    },
    undefined,
    undefined,
    (store) => {
      store.getTables().t1;
      store.getTables().t2; // !
    },
  );
  useSetTablesCallback(() => ({t1: {r1: {c2: 1}}})); // !

  useSetTableCallback(
    't1',
    (_e, store) => {
      store.getTables().t1;
      store.getTables().t2; // !
      return {r1: {c1: 1}};
    },
    undefined,
    undefined,
    (store) => {
      store.getTables().t1;
      store.getTables().t2; // !
    },
  );
  useSetTableCallback(
    () => 't1',
    () => ({r1: {c1: 1}}),
  );
  useSetTableCallback('t1', () => ({r1: {c2: 1}})); // !
  useSetTableCallback('t2', () => ({r1: {c1: 1}})); // !
  useSetTableCallback(
    () => 't2', // !
    () => ({r1: {c1: 2}}),
  );

  useSetRowCallback(
    't1',
    'r1',
    (_e, store) => {
      store.getTables().t1;
      store.getTables().t2; // !
      return {c1: 1};
    },
    undefined,
    undefined,
    (store) => {
      store.getTables().t1;
      store.getTables().t2; // !
    },
  );
  useSetRowCallback(
    () => 't1',
    () => 'r1',
    () => ({c1: 1}),
  );
  useSetRowCallback('t1', 'r1', () => ({c2: 1})); // !
  useSetRowCallback('t2', 'r1', () => ({c1: 1})); // !
  useSetRowCallback(
    () => 't2', // !
    () => 'r1',
    () => ({c1: 1}),
  );

  useAddRowCallback(
    't1',
    (_e, store) => {
      store.getTables().t1;
      store.getTables().t2; // !
      return {c1: 1};
    },
    undefined,
    undefined,
    (_rowId, store) => {
      store.getTables().t1;
      store.getTables().t2; // !
    },
  );
  useAddRowCallback(
    () => 't1',
    () => ({c1: 1}),
  );
  useAddRowCallback('t1', () => ({c2: 1})); // !
  useAddRowCallback('t2', () => ({c1: 1})); // !
  useAddRowCallback(
    () => 't2', // !
    () => ({c1: 1}),
  );

  useSetPartialRowCallback(
    't1',
    'r1',
    (_e, store) => {
      store.getTables().t1;
      store.getTables().t2; // !
      return {c1: 1};
    },
    undefined,
    undefined,
    (store) => {
      store.getTables().t1;
      store.getTables().t2; // !
    },
  );
  useSetPartialRowCallback(
    () => 't1',
    () => 'r1',
    () => ({c1: 1}),
  );
  useSetPartialRowCallback('t1', 'r1', () => ({c2: 1})); // !
  useSetPartialRowCallback('t2', 'r1', () => ({c1: 1})); // !
  useSetPartialRowCallback(
    () => 't2', // !
    () => 'r1',
    () => ({c1: 1}),
  );

  useSetCellCallback(
    't1',
    'r1',
    'c1',
    (_e, store) => {
      store.getTables().t1;
      store.getTables().t2; // !
      return 1;
    },
    undefined,
    undefined,
    (store) => {
      store.getTables().t1;
      store.getTables().t2; // !
    },
  );
  useSetCellCallback(
    () => 't1',
    () => 'r1',
    () => 'c1',
    () => 1,
  );
  useSetCellCallback('t1', 'r1', 'c1', () => (cell) => {
    cell as number;
    cell as string; // !
    return 0;
  }); // !
  useSetCellCallback('t1', 'r1', 'c1', () => () => ''); // !
  useSetCellCallback('t1', 'r1', 'c1', () => ''); // !
  useSetCellCallback('t1', 'r1', 'c2', () => 1); // !
  useSetCellCallback('t2', 'r1', 'c1', () => 1); // !
  useSetCellCallback(
    () => 't2', // !
    () => 'r1',
    () => 'c1',
    () => 1,
  );
  useSetCellCallback(
    () => 't1',
    () => 'r1',
    () => 'c2', // !
    () => 1,
  );
  useSetCellCallback(
    () => 't1',
    () => 'r1',
    () => 'c1',
    () => '', // !
  );

  useSetValuesCallback(
    (_e, store) => {
      store.getValues().v1;
      store.getValues().v2; // !
      return {v1: 1};
    },
    undefined,
    undefined,
    (store) => {
      store.getTables().t1;
      store.getTables().t2; // !
    },
  );
  useSetValuesCallback(() => ({v2: 1})); // !

  useSetPartialValuesCallback(
    (_e, store) => {
      store.getValues().v1;
      store.getValues().v2; // !
      return {v1: 1};
    },
    undefined,
    undefined,
    (store) => {
      store.getTables().t1;
      store.getTables().t2; // !
    },
  );
  useSetPartialValuesCallback(() => ({v2: 1})); // !

  useSetValueCallback(
    'v1',
    (_e, store) => {
      store.getValues().v1;
      store.getValues().v2; // !
      return 1;
    },
    undefined,
    undefined,
    (store) => {
      store.getTables().t1;
      store.getTables().t2; // !
    },
  );
  useSetValueCallback(
    () => 'v1',
    () => 1,
  );
  useSetValueCallback('v1', () => (value) => {
    value as number;
    value as string; // !
    return 0;
  }); // !
  useSetValueCallback('v1', () => () => ''); // !
  useSetValueCallback('v1', () => ''); // !
  useSetValueCallback('v2', () => 1); // !
  useSetValueCallback(
    () => 'v2', // !
    () => 1,
  );
  useSetValueCallback(
    () => 'v1',
    () => '', // !
  );
};

const _Deleters = () => {
  useDelTablesCallback(undefined, (store) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });

  useDelTableCallback('t1');
  useDelTableCallback('t2'); // !

  useDelRowCallback('t1', 'r1');
  useDelRowCallback('t2', 'r1'); // !

  useDelCellCallback('t1', 'r1', 'c1');
  useDelCellCallback('t1', 'r1', 'c2'); // !
  useDelCellCallback('t2', 'r1', 'c1'); // !

  useDelValuesCallback(undefined, (store) => {
    store.getValues().v1;
    store.getValues().v2; // !
  });

  useDelValueCallback('v1');
  useDelValueCallback('v2'); // !
};

const _Listeners = () => {
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
  useTableCellIdsListener('t1', (store, ..._) => {
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
  useHasTableCellListener(
    't1',
    'c2', // !
    (store, tableId) => {
      store.getTables().t1;
      tableId == 't1';
      tableId == 't0';
      store.getTables().t2; // !
      tableId == 't2'; // !
    },
  );
  useHasTableCellListener('t1', 'c1', (store, ..._) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  useHasTableCellListener('t1', 'c1', () => null);
  useHasTableCellListener(
    't2', // !
    undefined,
    true,
    0,
    10,
    () => null,
  );

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
    (store, tableId) => {
      store.getTables().t1;
      tableId == 't1';
      tableId == 't0';
      store.getTables().t2; // !
      tableId == 't2'; // !
    },
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
  useHasRowListener('t1', 'r1', (store, tableId) => {
    store.getTables().t1;
    tableId == 't1';
    store.getTables().t2; // !
  });
  useHasRowListener('t1', 'r1', (store) => {
    store.getTables().t1;
    store.getTables().t2; // !
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
  useRowListener(null, 'r1', (store, tableId, rowId) => {
    store.getTables().t1;
    tableId == 't1';
    tableId == 't0';
    rowId == 'r1';
    store.getTables().t2; // !
    tableId == 't2'; // !
    rowId == 'r2'; // !
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
  useRowListener('t1', 'r1', (store, tableId) => {
    store.getTables().t1;
    tableId == 't1';
    store.getTables().t2; // !
  });
  useRowListener('t1', 'r1', (store) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  useRowListener('t2', 'r2', () => null); // !

  useCellIdsListener('t1', 'r1', (store, tableId, rowId) => {
    store.getTables().t1;
    tableId == 't1';
    rowId == 'r1';
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
    rowId == 'r2'; // !
  });
  useCellIdsListener('t1', null, (store, tableId, rowId) => {
    store.getTables().t1;
    tableId == 't1';
    rowId == 'r1';
    rowId == 'r2';
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
  });
  useCellIdsListener(null, 'r1', (store, tableId, rowId) => {
    store.getTables().t1;
    tableId == 't1';
    tableId == 't0';
    rowId == 'r1';
    store.getTables().t2; // !
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
  useCellIdsListener('t1', 'r1', (store, tableId, ..._) => {
    store.getTables().t1;
    tableId == 't1';
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
  });
  useCellIdsListener('t1', 'r1', (store, ..._) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  useCellIdsListener('t1', 'r1', () => null);
  useCellIdsListener('t2', 'r2', () => null); // !

  useHasCellListener('t1', null, 'c1', (store, tableId, rowId, cellId) => {
    store.getTables().t1;
    tableId == 't1';
    rowId == 'r1';
    rowId == 'r2';
    cellId == 'c1';
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
    cellId == 'c1d'; // !
    cellId == 'c2'; // !
  });
  useHasCellListener('t1', null, null, (store, tableId, rowId, cellId) => {
    store.getTables().t1;
    tableId == 't1';
    rowId == 'r1';
    rowId == 'r2';
    cellId == 'c1';
    cellId == 'c1d';
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
    cellId == 'c2'; // !
  });
  useHasCellListener(null, 'r1', 'c1', (store, tableId, rowId, cellId) => {
    store.getTables().t1;
    tableId == 't1';
    rowId == 'r1';
    cellId == 'c1';
    store.getTables().t2; // !
    tableId == 't0'; // !
    cellId == 'c1d'; // !
    cellId == 'c0'; // !
    tableId == 't2'; // !
    rowId == 'r2'; // !
    cellId == 'c2'; // !
  });
  useHasCellListener(null, 'r1', null, (store, tableId, rowId, cellId) => {
    store.getTables().t1;
    tableId == 't1';
    tableId == 't0';
    rowId == 'r1';
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
    rowId == 'r2'; // !
    cellId == 'c2'; // !
  });
  useHasCellListener(null, null, 'c1', (store, tableId, rowId, cellId) => {
    store.getTables().t1;
    tableId == 't1';
    rowId == 'r1';
    rowId == 'r2';
    cellId == 'c1';
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
    cellId == 'c1d'; // !
    cellId == 'c0'; // !
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
  useHasCellListener('t1', 'r1', 'c1', (store, tableId, rowId, ..._) => {
    store.getTables().t1;
    tableId == 't1';
    rowId == 'r1';
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
    rowId == 'r2'; // !
  });
  useHasCellListener('t1', 'r1', 'c1', (store, tableId, ..._) => {
    store.getTables().t1;
    tableId == 't1';
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
  });
  useHasCellListener('t1', 'r1', 'c1', (store, ..._) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  useHasCellListener('t1', 'r1', 'c1', () => null);
  useHasCellListener('t1', 'r2', 'c2', () => null); // !
  useHasCellListener(null, 'r2', 'c2', () => null); // !
  useHasCellListener('t2', 'r2', 'c1', () => null); // !

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
  useCellListener('t1', null, 'c1', (store, tableId, rowId, cellId) => {
    store.getTables().t1;
    tableId == 't1';
    rowId == 'r1';
    rowId == 'r2';
    cellId == 'c1';
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
    cellId == 'c1d'; // !
    cellId == 'c2'; // !
  });
  useCellListener('t1', null, null, (store, tableId, rowId, cellId) => {
    store.getTables().t1;
    tableId == 't1';
    rowId == 'r1';
    rowId == 'r2';
    cellId == 'c1';
    cellId == 'c1d';
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
    cellId == 'c2'; // !
  });
  useCellListener(null, 'r1', 'c1', (store, tableId, rowId, cellId) => {
    store.getTables().t1;
    tableId == 't1';
    rowId == 'r1';
    cellId == 'c1';
    store.getTables().t2; // !
    tableId == 't0'; // !
    cellId == 'c1d'; // !
    cellId == 'c0'; // !
    tableId == 't2'; // !
    rowId == 'r2'; // !
    cellId == 'c2'; // !
  });
  useCellListener(
    null,
    'r1',
    null,
    (store, tableId, rowId, cellId, newCell, oldCell) => {
      store.getTables().t1;
      tableId == 't1';
      tableId == 't0';
      rowId == 'r1';
      cellId == 'c1';
      cellId == 'c1d';
      cellId == 'c0';
      newCell as number;
      oldCell as number;
      newCell as string;
      oldCell as string;
      if (tableId == 't1') {
        cellId == 'c1';
        cellId == 'c1d';
        newCell as number;
        oldCell as number;
        newCell as string;
        oldCell as string;
        cellId == 'c0'; // !
      }
      if (tableId == 't0') {
        newCell as number;
        oldCell as number;
        newCell as string; // !
        oldCell as string; // !
      }
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
      tableId == 't2'; // !
      rowId == 'r2'; // !
      cellId == 'c2'; // !
    },
  );
  useCellListener(null, null, 'c1', (store, tableId, rowId, cellId) => {
    store.getTables().t1;
    tableId == 't1';
    rowId == 'r1';
    rowId == 'r2';
    cellId == 'c1';
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
    cellId == 'c1d'; // !
    cellId == 'c0'; // !
    cellId == 'c2'; // !
  });
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
  useCellListener('t1', 'r1', 'c1', (store, tableId, rowId, ..._) => {
    store.getTables().t1;
    tableId == 't1';
    rowId == 'r1';
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
    rowId == 'r2'; // !
  });
  useCellListener('t1', 'r1', 'c1', (store, tableId, ..._) => {
    store.getTables().t1;
    tableId == 't1';
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
  });
  useCellListener('t1', 'r1', 'c1', (store, ..._) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  useCellListener('t1', 'r1', 'c1', () => null);
  useCellListener('t1', 'r2', 'c2', () => null); // !
  useCellListener(null, 'r2', 'c2', () => null); // !
  useCellListener('t2', 'r2', 'c1', () => null); // !

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
  useValuesListener((store) => {
    store.getValues().v1;
    store.getValues().v2; // !
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
  useHasValueListener(null, (store, ..._) => {
    store.getValues().v1;
    store.getValues().v2; // !
  });
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
  useValueListener(null, (store, ..._) => {
    store.getValues().v1;
    store.getValues().v2; // !
  });
  useValueListener('v2', () => null); // !
};

const _Metrics = () => {
  const metricsWithSchema = useCreateMetrics(
    createStore().setSchema(tablesSchema, valuesSchema),
    createMetrics,
  );
  metricsWithSchema?.getStore().getTables().t1;
  metricsWithSchema?.getStore().getTables().t2; // !
  useCreateMetrics(createStore(), createMetrics); // !

  useMetrics()?.getStore().getTables().t1;
  useMetrics()?.getStore().getTables().t2; // !

  useMetricListener('m1', (metrics) => {
    metrics.getStore().getTables().t1;
    metrics.getStore().getTables().t2; // !
  });
};

const _Indexes = () => {
  const indexesWithSchema = useCreateIndexes(
    createStore().setSchema(tablesSchema, valuesSchema),
    createIndexes,
  );
  indexesWithSchema?.getStore().getTables().t1;
  indexesWithSchema?.getStore().getTables().t2; // !
  useCreateIndexes(createStore(), createIndexes); // !

  useIndexes()?.getStore().getTables().t1;
  useIndexes()?.getStore().getTables().t2; // !

  useSliceIdsListener('i1', (indexes) => {
    indexes.getStore().getTables().t1;
    indexes.getStore().getTables().t2; // !
  });

  useSliceRowIdsListener('i1', 's1', (indexes) => {
    indexes.getStore().getTables().t1;
    indexes.getStore().getTables().t2; // !
  });
};

const _Relationships = () => {
  const relationshipsWithSchema = useCreateRelationships(
    createStore().setSchema(tablesSchema, valuesSchema),
    createRelationships,
  );
  relationshipsWithSchema?.getStore().getTables().t1;
  relationshipsWithSchema?.getStore().getTables().t2; // !
  useCreateRelationships(createStore(), createRelationships); // !

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

const _Queries = () => {
  const queriesWithSchema = useCreateQueries(
    createStore().setSchema(tablesSchema, valuesSchema),
    createQueries,
  );
  queriesWithSchema?.getStore().getTables().t1;
  queriesWithSchema?.getStore().getTables().t2; // !
  useCreateQueries(createStore(), createQueries); // !

  useQueries()?.getStore().getTables().t1;
  useQueries()?.getStore().getTables().t2; // !

  useResultTableListener('q1', (queries) => {
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
};

const _Checkpoints = () => {
  const checkpointsWithSchema = useCreateCheckpoints(
    createStore().setSchema(tablesSchema, valuesSchema),
    createCheckpoints,
  );
  checkpointsWithSchema?.getStore().getTables().t1;
  checkpointsWithSchema?.getStore().getTables().t2; // !
  useCreateCheckpoints(createStore(), createCheckpoints); // !

  useCheckpoints()?.getStore().getTables().t1;
  useCheckpoints()?.getStore().getTables().t2; // !

  useSetCheckpointCallback(
    undefined,
    undefined,
    undefined,
    (_checkpointId, checkpoints) => {
      checkpoints.getStore().getTables().t1;
      checkpoints.getStore().getTables().t2; // !
    },
  );

  useGoToCallback(
    () => 'c1',
    undefined,
    undefined,
    (checkpoints) => {
      checkpoints.getStore().getTables().t1;
      checkpoints.getStore().getTables().t2; // !
    },
  );

  useCheckpointIdsListener((checkpoints) => {
    checkpoints.getStore().getTables().t1;
    checkpoints.getStore().getTables().t2; // !
  });

  useCheckpointListener('c1', (checkpoints) => {
    checkpoints.getStore().getTables().t1;
    checkpoints.getStore().getTables().t2; // !
  });
};

const _Persister = () => {
  const persisterWithSchema = useCreatePersister(
    createStore().setSchema(tablesSchema, valuesSchema),
    (store) => createFilePersister(store, ''),
    undefined,
    async (persister) => {
      persister?.getStore().getTables().t1;
      persister?.getStore().getTables().t2; // !
    },
  );
  persisterWithSchema?.getStore().getTables().t1;
  persisterWithSchema?.getStore().getTables().t2; // !
  useCreatePersister(createStore(), (s) => createFilePersister(s, '')); // !
};

const GoodTableView = ({tableId}: {readonly tableId: 't0' | 't1'}) => (
  <b>{tableId}</b>
);
const PoorTableView = ({tableId}: {readonly tableId: 't0' | 't2'}) => (
  <b>{tableId}</b>
);

const GoodRowView = ({
  tableId,
  rowId,
}: {
  readonly tableId: 't0' | 't1';
  readonly rowId: Id;
}) => (
  <b>
    {tableId}/{rowId}
  </b>
);
const PoorRowView = ({
  tableId,
  rowId,
}: {
  readonly tableId: 't0' | 't2';
  readonly rowId: Id;
}) => (
  <b>
    {tableId}/{rowId}
  </b>
);
const GoodT1RowView = ({
  tableId,
  rowId,
}: {
  readonly tableId: 't1';
  readonly rowId: Id;
}) => (
  <b>
    {tableId}/{rowId}
  </b>
);
const PoorT1RowView = ({
  tableId,
  rowId,
}: {
  readonly tableId: 't2';
  readonly rowId: Id;
}) => (
  <b>
    {tableId}/{rowId}
  </b>
);

const GoodCellView = ({
  tableId,
  rowId,
  cellId,
}: {
  readonly tableId: 't0' | 't1';
  readonly rowId: Id;
  readonly cellId: 'c0' | 'c1' | 'c1d';
}) => (
  <b>
    {tableId}/{rowId}/{cellId}
  </b>
);
const GoodT1CellView = ({
  tableId,
  rowId,
  cellId,
}: {
  readonly tableId: 't1';
  readonly rowId: Id;
  readonly cellId: 'c1' | 'c1d';
}) => (
  <b>
    {tableId}/{rowId}/{cellId}
  </b>
);
const PoorCellView = ({
  tableId,
  rowId,
  cellId,
}: {
  readonly tableId: 't0' | 't1';
  readonly rowId: Id;
  readonly cellId: 'c0' | 'c2';
}) => (
  <b>
    {tableId}/{rowId}/{cellId}
  </b>
);
const PoorT1CellView = ({
  tableId,
  rowId,
  cellId,
}: {
  readonly tableId: 't1';
  readonly rowId: Id;
  readonly cellId: 'c2';
}) => (
  <b>
    {tableId}/{rowId}/{cellId}
  </b>
);

const GoodValueView = ({valueId}: {readonly valueId: 'v1' | 'v1d'}) => (
  <b>{valueId}</b>
);
const PoorValueView = ({valueId}: {readonly valueId: 'v1' | 'v2'}) => (
  <b>{valueId}</b>
);

const _App = () => (
  <>
    <TablesView />
    <TablesView tableComponent={GoodTableView} />
    <TablesView tableComponent={PoorTableView} /> {/* ! */}
    {/* 
    
    */}
    <TableView tableId="t1" />
    <TableView tableId="t1" customCellIds={['c1']} />
    <TableView tableId="t1" rowComponent={GoodRowView} />
    <TableView tableId="t1" rowComponent={GoodT1RowView} />
    <TableView tableId="t1" customCellIds={['c2']} /> {/* ! */}
    <TableView tableId="t1" rowComponent={PoorRowView} /> {/* ! */}
    <TableView tableId="t1" rowComponent={PoorT1RowView} /> {/* ! */}
    <TableView tableId="t2" /> {/* ! */}
    {/*
    
    */}
    <SortedTableView tableId="t1" />
    <SortedTableView tableId="t1" cellId="c1" />
    <SortedTableView tableId="t1" customCellIds={['c1']} />
    <SortedTableView tableId="t1" rowComponent={GoodRowView} />
    <SortedTableView tableId="t1" rowComponent={GoodT1RowView} />
    <SortedTableView tableId="t1" cellId="c2" /> {/* ! */}
    <SortedTableView tableId="t1" customCellIds={['c2']} /> {/* ! */}
    <SortedTableView tableId="t1" rowComponent={PoorRowView} /> {/* ! */}
    <SortedTableView tableId="t1" rowComponent={PoorT1RowView} /> {/* ! */}
    <SortedTableView tableId="t2" /> {/* ! */}
    {/* 
    
    */}
    <RowView tableId="t1" rowId="r1" />
    <RowView tableId="t1" rowId="r1" customCellIds={['c1']} />
    <RowView tableId="t1" rowId="r1" cellComponent={GoodCellView} />
    <RowView tableId="t1" rowId="r1" cellComponent={GoodT1CellView} />
    <RowView tableId="t1" rowId="r1" customCellIds={['c2']} /> {/* ! */}
    <RowView tableId="t1" rowId="r1" cellComponent={PoorCellView} /> {/* ! */}
    <RowView tableId="t1" rowId="r1" cellComponent={PoorT1CellView} /> {/* ! */}
    <RowView tableId="t2" rowId="r2" /> {/* ! */}
    {/* 
    
    */}
    <CellView tableId="t1" rowId="r1" cellId="c1" />
    <CellView tableId="t1" rowId="r1" cellId="c2" /> {/* ! */}
    <CellView tableId="t2" rowId="r1" cellId="c2" /> {/* ! */}
    {/* 
    
    */}
    <ValuesView />
    <ValuesView valueComponent={GoodValueView} />
    <ValuesView valueComponent={PoorValueView} /> {/* ! */}
    {/* 
    
    */}
    <ValueView valueId="v1" />
    <ValueView valueId="v2" /> {/* ! */}
    {/* 
    
    */}
    <RemoteRowView
      relationshipId="r1"
      localRowId="r1"
      rowComponent={GoodRowView}
    />
    <RemoteRowView
      relationshipId="r1"
      localRowId="r1"
      rowComponent={PoorRowView} // !
    />
    {/* 
    
    */}
    <LocalRowsView
      relationshipId="r1"
      remoteRowId="r1"
      rowComponent={GoodRowView}
    />
    <LocalRowsView
      relationshipId="r1"
      remoteRowId="r1"
      rowComponent={PoorRowView} // !
    />
    {/* 
    
    */}
    <LinkedRowsView
      relationshipId="r1"
      firstRowId="r1"
      rowComponent={GoodRowView}
    />
    <LocalRowsView
      relationshipId="r1"
      firstRowId="r1"
      rowComponent={PoorRowView} // !
    />
    {/* 
    
    */}
    <Provider store={createStore().setSchema(tablesSchema, valuesSchema)}>
      <b />
    </Provider>
    <Provider
      store={createStore().setTablesSchema(tablesSchema)} // !
    >
      <b />
    </Provider>
    <Provider
      store={createStore().setValuesSchema(valuesSchema)} // !
    >
      <b />
    </Provider>
    <Provider
      store={createStore()} // !
    >
      <b />
    </Provider>
  </>
);
