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
  useTable,
  useStore,
  useTableIds,
  useRowIds,
  useTables,
  useSortedRowIds,
  useCreateStore,
  useRow,
  useCell,
  useCellIds,
  useValues,
  useValueIds,
  useValue,
} = UiReact as UiReact.WithSchemas<[typeof tablesSchema, typeof valuesSchema]>;

const _App = () => {
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
