/* eslint-disable @typescript-eslint/no-non-null-assertion */

// NB: an exclamation mark after a line visually indicates an expected TS error

import * as UiReact from 'tinybase/ui-react/with-schemas';
import React from 'react';
import {createStore} from 'tinybase/debug/with-schemas';

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

const {
  useAddRowCallback,
  useCell,
  useCellIds,
  useCreateStore,
  useRow,
  useRowIds,
  useSetCellCallback,
  useSetPartialRowCallback,
  useSetPartialValuesCallback,
  useSetRowCallback,
  useSetTableCallback,
  useSetTablesCallback,
  useSetValueCallback,
  useSetValuesCallback,
  useSortedRowIds,
  useStore,
  useTable,
  useTableIds,
  useTables,
  useValue,
  useValueIds,
  useValues,
} = UiReact as UiReact.WithSchemas<[typeof tablesSchema, typeof valuesSchema]>;

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

  useTables().t1;
  useTables().t2; // !

  useTableIds().includes('t1');
  useTableIds().includes('t2'); // !

  useTable('t1');
  useTable('t1').r1!.c1;
  useTable('t1').r1!.c2; // !
  useTable('t2'); // !

  useRowIds('t1');
  useRowIds('t2'); // !

  useSortedRowIds('t1', 'c1');
  useSortedRowIds('t1', 'c2'); // !
  useSortedRowIds('t2', 'r2'); // !

  useRow('t1', 'r1');
  useRow('t1', 'r1').c1;
  useRow('t1', 'r1').c2; // !
  useRow('t2', 'r2'); // !

  useCellIds('t1', 'r1').includes('c1');
  useCellIds('t1', 'r1').includes('c2'); // !
  useCellIds('t2', 'r2'); // !

  useCell('t1', 'r1', 'c1');
  useCell('t1', 'r1', 'c1') as number;
  useCell('t1', 'r1', 'c1') as string; // !
  useCell('t1', 'r1', 'c2'); // !
  useCell('t2', 'r2', 'c2'); // !

  useValues().v1;
  useValues().v2; // !

  useValueIds().includes('v1');
  useValueIds().includes('v2'); // !

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
  useSetTableCallback('t1', () => ({r1: {c2: 1}})); // !
  useSetTableCallback('t2', () => ({r1: {c1: 1}})); // !

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
  useSetRowCallback('t1', 'r1', () => ({c2: 1})); // !
  useSetRowCallback('t2', 'r1', () => ({c1: 1})); // !

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
  useAddRowCallback('t1', () => ({c2: 1})); // !
  useAddRowCallback('t2', () => ({c1: 1})); // !

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
  useSetPartialRowCallback('t1', 'r1', () => ({c2: 1})); // !
  useSetPartialRowCallback('t2', 'r1', () => ({c1: 1})); // !

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
  useSetCellCallback('t1', 'r1', 'c1', () => (cell) => {
    cell as number;
    cell as string; // !
    return 0;
  }); // !
  useSetCellCallback('t1', 'r1', 'c1', () => () => ''); // !
  useSetCellCallback('t1', 'r1', 'c1', () => ''); // !
  useSetCellCallback('t1', 'r1', 'c2', () => 1); // !
  useSetCellCallback('t2', 'r1', 'c1', () => 1); // !

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
  useSetValueCallback('v1', () => (value) => {
    value as number;
    value as string; // !
    return 0;
  }); // !
  useSetValueCallback('v1', () => () => ''); // !
  useSetValueCallback('v1', () => ''); // !
  useSetValueCallback('v2', () => 1); // !
};
