/*
  eslint-disable
    @typescript-eslint/ban-ts-comment,
    react/jsx-no-useless-fragment,
    jest/no-conditional-expect
*/

import {ReactTestRenderer, act, create} from 'react-test-renderer';
import type {Relationships, Store} from 'tinybase';
import {
  createCheckpoints,
  createIndexes,
  createMergeableStore,
  createMetrics,
  createRelationships,
  createStore,
} from 'tinybase';
import {
  expectChanges,
  expectChangesNoJson,
  expectNoChanges,
} from '../common/expect.ts';
import {
  useCell,
  useCellIds,
  useCheckpointIds,
  useLinkedRowIds,
  useLocalRowIds,
  useMetric,
  useRemoteRowId,
  useRow,
  useRowIds,
  useSliceIds,
  useSliceRowIds,
  useTable,
  useTableIds,
  useTables,
} from 'tinybase/ui-react';
import React from 'react';
import {StoreListener} from '../common/types.ts';
import {createLocalPersister} from 'tinybase/persisters/persister-browser';
import {createStoreListener} from '../common/listeners.ts';

let renderer: ReactTestRenderer;

const validCell = 1;
const validRow = {c1: validCell};
const validTable = {r1: validRow};
const validTables = {t1: validTable};

const validValue = 1;
const validValues = {v1: validValue};

const validCellSchema: {
  type: 'string';
  default: string;
} = {type: 'string', default: 't1'};
const validTableSchema = {c1: validCellSchema};
const validTablesSchema = {t1: validTableSchema};

const validValueSchema: {
  type: 'boolean';
  default: boolean;
} = {type: 'boolean', default: true};
const validValuesSchema = {v1: validValueSchema};

const INVALID_CELLS_OR_VALUES: [string, any][] = [
  ['Date', new Date()],
  ['Function', () => 42],
  ['Regex', /1/],
  ['empty array', []],
  ['array', [1, 2, 3]],
  ['Number', new Number(1)],
  ['String', new String('1')],
  ['Boolean', new Boolean(true)],
  ['null', null],
  ['undefined', undefined],
  ['NaN', NaN],
];

const INVALID_OBJECTS: [string, any][] = INVALID_CELLS_OR_VALUES.concat([
  ['number', 1],
  ['string', '1'],
  ['boolean', true],
]);

describe.each([
  ['store', createStore],
  ['mergeableStore', () => createMergeableStore('s1')],
])('Testing %s', (_name, createStore) => {
  describe('Setting invalid', () => {
    test.each(INVALID_OBJECTS)('Tables; %s', (_name, tables: any) => {
      const store = createStore().setTables(tables);
      expect(store.getTables()).toEqual({});
    });

    test.each(INVALID_OBJECTS)('first Table; %s', (_name, table: any) => {
      const store = createStore().setTables({t1: table});
      expect(store.getTables()).toEqual({});
    });

    test.each(INVALID_OBJECTS)('second Table; %s', (_name, table: any) => {
      const store = createStore().setTables({t1: validTable, t2: table});
      expect(store.getTables()).toEqual(validTables);
    });

    test.each(INVALID_OBJECTS)('first Row; %s', (_name, row: any) => {
      const store = createStore().setTables({t1: {r1: row}});
      expect(store.getTables()).toEqual({});
    });

    test.each(INVALID_OBJECTS)('second Row; %s', (_name, row: any) => {
      const store = createStore().setTables({t1: {r1: validRow, r2: row}});
      expect(store.getTables()).toEqual(validTables);
    });

    test.each(INVALID_CELLS_OR_VALUES)('first Cell; %s', (_name, cell: any) => {
      const store = createStore().setTables({t1: {r1: {c1: cell}}});
      expect(store.getTables()).toEqual({});
    });

    test.each(INVALID_CELLS_OR_VALUES)(
      'second Cell; %s',
      (_name, cell: any) => {
        const store = createStore().setTables({
          t1: {r1: {c1: validCell, c2: cell}},
        });
        expect(store.getTables()).toEqual(validTables);
      },
    );

    test.each(INVALID_OBJECTS)('Values; %s', (_name, values: any) => {
      const store = createStore().setValues(values);
      expect(store.getValues()).toEqual({});
    });

    test.each(INVALID_OBJECTS)('Partial Values; %s', (_name, values: any) => {
      const store = createStore().setPartialValues(values);
      expect(store.getValues()).toEqual({});
    });

    test.each(INVALID_CELLS_OR_VALUES)(
      'first Value; %s',
      (_name, value: any) => {
        const store = createStore().setValues({v1: value});
        expect(store.getValues()).toEqual({});
      },
    );

    test.each(INVALID_CELLS_OR_VALUES)(
      'second Value; %s',
      (_name, value: any) => {
        const store = createStore().setValues({
          v1: validValue,
          v2: value,
        });
        expect(store.getValues()).toEqual(validValues);
      },
    );
  });

  describe('Listening to invalid', () => {
    test.each(INVALID_OBJECTS)('Tables; %s', (_name, tables: any) => {
      const store = createStore().setTables(validTables);
      const listener = createStoreListener(store);
      listener.listenToTables('/');
      listener.listenToInvalidCell('invalids', null, null, null);
      store.setTables(tables);
      expect(store.getTables()).toEqual(validTables);
      expectChangesNoJson(listener, 'invalids', {
        undefined: {undefined: {undefined: [undefined]}},
      });
      expectNoChanges(listener);
    });

    test.each(INVALID_OBJECTS)(
      'Table, alongside valid; %s',
      (_name, table: any) => {
        const store = createStore().setTables(validTables);
        const listener = createStoreListener(store);
        listener.listenToTables('/');
        listener.listenToTable('/t1', 't1');
        listener.listenToTable('/t2', 't2');
        listener.listenToInvalidCell('invalids', null, null, null);
        store.setTables({t1: {r1: {c1: 2}}, t2: table});
        expect(store.getTables()).toEqual({t1: {r1: {c1: 2}}});
        expectChanges(listener, '/', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t1', {t1: {r1: {c1: 2}}});
        expectChangesNoJson(listener, 'invalids', {
          t2: {undefined: {undefined: [undefined]}},
        });
        expectNoChanges(listener);
      },
    );

    test.each(INVALID_OBJECTS)(
      'existing or new Table; %s',
      (_name, table: any) => {
        const store = createStore().setTables(validTables);
        const listener = createStoreListener(store);
        listener.listenToTables('/');
        listener.listenToTable('/t1', 't1');
        listener.listenToTable('/t2', 't2');
        listener.listenToInvalidCell('invalids', null, null, null);
        store.setTable('t1', table);
        store.setTable('t2', table);
        expect(store.getTables()).toEqual(validTables);
        expectChangesNoJson(
          listener,
          'invalids',
          {t1: {undefined: {undefined: [undefined]}}},
          {t2: {undefined: {undefined: [undefined]}}},
        );
        expectNoChanges(listener);
      },
    );

    test.each(INVALID_OBJECTS)(
      'Row, alongside valid; %s',
      (_name, row: any) => {
        const store = createStore().setTables(validTables);
        const listener = createStoreListener(store);
        listener.listenToTables('/');
        listener.listenToTable('/t1', 't1');
        listener.listenToRow('/t1/r1', 't1', 'r1');
        listener.listenToRow('/t1/r2', 't1', 'r2');
        listener.listenToInvalidCell('invalids', null, null, null);
        store.setTable('t1', {r1: {c1: 2}, r2: row});
        expect(store.getTables()).toEqual({t1: {r1: {c1: 2}}});
        expectChanges(listener, '/', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t1', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t1/r1', {t1: {r1: {c1: 2}}});
        expectChangesNoJson(listener, 'invalids', {
          t1: {r2: {undefined: [undefined]}},
        });
        expectNoChanges(listener);
      },
    );

    test.each(INVALID_OBJECTS)('existing or new Row; %s', (_name, row: any) => {
      const store = createStore().setTables(validTables);
      const listener = createStoreListener(store);
      listener.listenToTables('/');
      listener.listenToTable('/t1', 't1');
      listener.listenToRow('/t1/r1', 't1', 'r1');
      listener.listenToRow('/t1/r2', 't1', 'r2');
      listener.listenToInvalidCell('invalids', null, null, null);
      store.setRow('t1', 'r1', row);
      store.setRow('t1', 'r2', row);
      expect(store.getTables()).toEqual(validTables);
      expectChangesNoJson(
        listener,
        'invalids',
        {t1: {r1: {undefined: [undefined]}}},
        {t1: {r2: {undefined: [undefined]}}},
      );
      expectNoChanges(listener);
    });

    test.each(INVALID_OBJECTS)('add Row; %s', (_name, row: any) => {
      const store = createStore().setTables(validTables);
      const listener = createStoreListener(store);
      listener.listenToTables('/');
      listener.listenToTable('/t1', 't1');
      listener.listenToRow('/t1/r1', 't1', 'r1');
      listener.listenToRow('/t1/0', 't1', '0');
      listener.listenToInvalidCell('invalids', null, null, null);
      const rowId1 = store.addRow('t1', row);
      const rowId2 = store.addRow('t1', {c1: 2});
      expect(rowId1).toBeUndefined();
      expect(rowId2).toEqual('0');
      store.delRow('t1', '0');
      expect(store.getTables()).toEqual(validTables);
      expectChanges(
        listener,
        '/',
        {t1: {r1: {c1: 1}, '0': {c1: 2}}},
        {t1: {r1: {c1: 1}}},
      );
      expectChanges(
        listener,
        '/t1',
        {t1: {r1: {c1: 1}, '0': {c1: 2}}},
        {t1: {r1: {c1: 1}}},
      );
      expectChanges(listener, '/t1/0', {t1: {0: {c1: 2}}}, {t1: {0: {}}});
      expectChangesNoJson(listener, 'invalids', {
        t1: {undefined: {undefined: [undefined]}},
      });
      expectNoChanges(listener);
    });

    test.each(INVALID_CELLS_OR_VALUES)('add Row; %s', (_name, cell: any) => {
      const store = createStore().setTables(validTables);
      const listener = createStoreListener(store);
      listener.listenToTables('/');
      listener.listenToTable('/t1', 't1');
      listener.listenToRow('/t1/r1', 't1', 'r1');
      listener.listenToRow('/t1/0', 't1', '0');
      listener.listenToInvalidCell('invalids', null, null, null);
      const rowId = store.addRow('t1', {c1: cell});
      expect(rowId).toBeUndefined();
      expect(store.getTables()).toEqual(validTables);
      expectChangesNoJson(listener, 'invalids', {
        t1: {undefined: {c1: [cell]}},
      });
      expectNoChanges(listener);
    });

    test.each(INVALID_CELLS_OR_VALUES)(
      'Cell, alongside valid; %s',
      (_name, cell: any) => {
        const store = createStore().setTables(validTables);
        const listener = createStoreListener(store);
        listener.listenToTables('/');
        listener.listenToTable('/t1', 't1');
        listener.listenToRow('/t1/r1', 't1', 'r1');
        listener.listenToCell('/t1/r1/c1', 't1', 'r1', 'c1');
        listener.listenToCell('/t1/r1/c2', 't1', 'r1', 'c2');
        listener.listenToInvalidCell('invalids', null, null, null);
        store.setRow('t1', 'r1', {c1: 2, c2: cell});
        expect(store.getTables()).toEqual({t1: {r1: {c1: 2}}});
        expectChanges(listener, '/', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t1', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t1/r1', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: 2}}});
        expectChanges(listener, 'invalids', {t1: {r1: {c2: [cell]}}});
        expectNoChanges(listener);
      },
    );

    test.each(INVALID_CELLS_OR_VALUES)(
      'existing or new Cell; %s',
      (_name, cell: any) => {
        if (typeof cell == 'function') {
          return;
        }
        const store = createStore().setTables(validTables);
        const listener = createStoreListener(store);
        listener.listenToTables('/');
        listener.listenToTable('/t1', 't1');
        listener.listenToRow('/t1/r1', 't1', 'r1');
        listener.listenToRow('/t1/r2', 't1', 'r2');
        listener.listenToCell('/t1/r1/c1', 't1', 'r1', 'c1');
        listener.listenToCell('/t1/r1/c2', 't1', 'r1', 'c2');
        listener.listenToCell('/t1/r2/c1', 't1', 'r2', 'c1');
        listener.listenToInvalidCell('invalids', null, null, null);
        store
          .setCell('t1', 'r1', 'c1', cell)
          .setCell('t1', 'r1', 'c2', cell)
          .setCell('t1', 'r2', 'c1', cell);
        expect(store.getTables()).toEqual(validTables);
        expectChanges(
          listener,
          'invalids',
          {t1: {r1: {c1: [cell]}}},
          {t1: {r1: {c2: [cell]}}},
          {t1: {r2: {c1: [cell]}}},
        );
        expectNoChanges(listener);
      },
    );

    test.each(INVALID_OBJECTS)('existing Values; %s', (_name, values: any) => {
      const store = createStore().setValues(validValues);
      const listener = createStoreListener(store);
      listener.listenToValues('/');
      listener.listenToInvalidValue('invalids', null);
      store.setValues(values);
      expect(store.getValues()).toEqual(validValues);
      expectChangesNoJson(listener, 'invalids', {undefined: [undefined]});
      expectNoChanges(listener);
    });

    test.each(INVALID_CELLS_OR_VALUES)(
      'Value, alongside valid; %s',
      (_name, value: any) => {
        const store = createStore().setValues(validValues);
        const listener = createStoreListener(store);
        listener.listenToValues('/');
        listener.listenToValue('/v1', 'v1');
        listener.listenToValue('/v2', 'v2');
        listener.listenToInvalidValue('invalids', null);
        store.setValues({v1: 2, v2: value});
        expect(store.getValues()).toEqual({v1: 2});
        expectChanges(listener, '/', {v1: 2});
        expectChanges(listener, '/v1', {v1: 2});
        expectChanges(listener, 'invalids', {v2: [value]});
        expectNoChanges(listener);
      },
    );

    test.each(INVALID_CELLS_OR_VALUES)(
      'existing or new Value; %s',
      (_name, value: any) => {
        if (typeof value == 'function') {
          return;
        }
        const store = createStore().setValues(validValues);
        const listener = createStoreListener(store);
        listener.listenToValues('/');
        listener.listenToValue('/v1', 'v1');
        listener.listenToValue('/v2', 'v2');
        listener.listenToInvalidValue('invalids', null);
        store.setValue('v1', value).setValue('v2', value);
        expect(store.getValues()).toEqual(validValues);
        expectChanges(listener, 'invalids', {v1: [value]}, {v2: [value]});
        expectNoChanges(listener);
      },
    );
  });

  describe('Rejects invalid', () => {
    test.each(INVALID_OBJECTS)(
      'Tables schema; %s',
      (_name, tablesSchema: any) => {
        const store = createStore().setTablesSchema(tablesSchema);
        expect(JSON.parse(store.getTablesSchemaJson())).toEqual({});
      },
    );

    test.each(INVALID_OBJECTS)(
      'Table schema; %s',
      (_name, tableSchema: any) => {
        const store = createStore().setTablesSchema({t1: tableSchema});
        expect(JSON.parse(store.getTablesSchemaJson())).toEqual({});
      },
    );

    test.each(INVALID_OBJECTS)(
      'Table schema, alongside valid; %s',
      (_name, tableSchema: any) => {
        const store = createStore().setTablesSchema({
          t1: validTableSchema,
          t2: tableSchema,
        });
        expect(JSON.parse(store.getTablesSchemaJson())).toEqual(
          validTablesSchema,
        );
      },
    );

    test.each(INVALID_OBJECTS)('Cell schema; %s', (_name, cellSchema: any) => {
      const store = createStore().setTablesSchema({t1: {c1: cellSchema}});
      expect(JSON.parse(store.getTablesSchemaJson())).toEqual({});
    });

    test.each(INVALID_OBJECTS)(
      'Cell schema, alongside valid; %s',
      (_name, cellSchema: any) => {
        const store = createStore().setTablesSchema({
          t1: {c1: validCellSchema, c2: cellSchema},
        });
        expect(JSON.parse(store.getTablesSchemaJson())).toEqual(
          validTablesSchema,
        );
      },
    );

    test.each(INVALID_OBJECTS)(
      '(bad type) Cell schema; %s',
      (_name, type: any) => {
        const store = createStore().setTablesSchema({t1: {c1: {type}}});
        expect(JSON.parse(store.getTablesSchemaJson())).toEqual({});
      },
    );

    test('(useless) Cell schema', () => {
      // @ts-ignore
      const store = createStore().setTables({}, {t1: {c1: {default: 't1'}}});
      expect(JSON.parse(store.getTablesSchemaJson())).toEqual({});
    });

    test('(useless bounds) Cell schema', () => {
      const store1 = createStore().setTablesSchema({
        // @ts-ignore
        t1: {c1: {type: 'string', min: 1, max: 10}},
      });
      expect(JSON.parse(store1.getTablesSchemaJson())).toEqual({
        t1: {c1: {type: 'string'}},
      });
      const store2 = createStore().setTablesSchema({
        // @ts-ignore
        t1: {c1: {type: 'boolean', min: 1, max: 10}},
      });
      expect(JSON.parse(store2.getTablesSchemaJson())).toEqual({
        t1: {c1: {type: 'boolean'}},
      });
    });

    test('(extended) Cell schema', () => {
      const store = createStore().setTablesSchema({
        // @ts-ignore
        t1: {c1: {type: 'string', default: 't1', extraThing1: 1}},
      });
      expect(JSON.parse(store.getTablesSchemaJson())).toEqual(
        validTablesSchema,
      );
    });

    test('(inconsistent default) Cell schema', () => {
      const store = createStore().setTablesSchema({
        t1: {
          // @ts-ignore
          c1: {type: 'boolean', default: 't1'},
          // @ts-ignore
          c2: {type: 'number', default: 't1'},
          // @ts-ignore
          c3: {type: 'string', default: 2},
        },
      });
      expect(JSON.parse(store.getTablesSchemaJson())).toEqual({
        t1: {c1: {type: 'boolean'}, c2: {type: 'number'}, c3: {type: 'string'}},
      });
    });

    test.each(INVALID_OBJECTS)(
      'Values schema; %s',
      (_name, valuesSchema: any) => {
        const store = createStore().setValuesSchema(valuesSchema);
        expect(JSON.parse(store.getValuesSchemaJson())).toEqual({});
      },
    );

    test.each(INVALID_OBJECTS)(
      'Value schema; %s',
      (_name, valueSchema: any) => {
        const store = createStore().setValuesSchema({v1: valueSchema});
        expect(JSON.parse(store.getTablesSchemaJson())).toEqual({});
      },
    );

    test.each(INVALID_OBJECTS)(
      'Value schema, alongside valid; %s',
      (_name, valueSchema: any) => {
        const store = createStore().setValuesSchema({
          v1: validValueSchema,
          v2: valueSchema,
        });
        expect(JSON.parse(store.getValuesSchemaJson())).toEqual(
          validValuesSchema,
        );
      },
    );

    test.each(INVALID_OBJECTS)(
      '(bad type) Value schema; %s',
      (_name, type: any) => {
        const store = createStore().setValuesSchema({v1: {type}});
        expect(JSON.parse(store.getValuesSchemaJson())).toEqual({});
      },
    );

    test('(useless) Value schema', () => {
      // @ts-ignore
      const store = createStore().setTables({}, {v1: {default: 't1'}});
      expect(JSON.parse(store.getValuesSchemaJson())).toEqual({});
    });

    test('(useless bounds) Value schema', () => {
      const store1 = createStore().setValuesSchema({
        // @ts-ignore
        v1: {type: 'string', min: 1, max: 10},
      });
      expect(JSON.parse(store1.getValuesSchemaJson())).toEqual({
        v1: {type: 'string'},
      });
      const store2 = createStore().setValuesSchema({
        // @ts-ignore
        v1: {type: 'boolean', min: 1, max: 10},
      });
      expect(JSON.parse(store2.getValuesSchemaJson())).toEqual({
        v1: {type: 'boolean'},
      });
    });

    test('(extended) Value schema', () => {
      const store = createStore().setValuesSchema({
        // @ts-ignore
        v1: {type: 'boolean', default: true, extraThing1: 1},
      });
      expect(JSON.parse(store.getValuesSchemaJson())).toEqual(
        validValuesSchema,
      );
    });

    test('(inconsistent default) Value schema', () => {
      const store = createStore().setValuesSchema({
        // @ts-ignore
        v1: {type: 'boolean', default: 't1'},
        // @ts-ignore
        v2: {type: 'number', default: 't1'},
        // @ts-ignore
        v3: {type: 'string', default: 2},
      });
      expect(JSON.parse(store.getValuesSchemaJson())).toEqual({
        v1: {type: 'boolean'},
        v2: {type: 'number'},
        v3: {type: 'string'},
      });
    });
  });

  describe('Coerce Ids', () => {
    let store: Store;

    beforeEach(() => {
      store = createStore();
    });

    describe('Table Id', () => {
      test('setTables, setCell', () => {
        store.setTables({1: {r1: {c1: 1}}});
        expect(store.getTables()).toEqual({1: {r1: {c1: 1}}});
        // @ts-ignore
        store.setCell(1, 'r1', 'c2', 2);
        expect(store.getTable('1')).toEqual({r1: {c1: 1, c2: 2}});
      });

      test('setTable, setCell', () => {
        // @ts-ignore
        store.setTable(1, {r1: {c1: 1}});
        expect(store.getTable('1')).toEqual({r1: {c1: 1}});
        // @ts-ignore
        store.setCell(1, 'r1', 'c2', 2);
        expect(store.getTable('1')).toEqual({r1: {c1: 1, c2: 2}});
      });

      test('setRow, setCell', () => {
        // @ts-ignore
        store.setRow(1, 'r1', {c1: 1});
        expect(store.getRow('1', 'r1')).toEqual({c1: 1});
        // @ts-ignore
        store.setCell(1, 'r1', 'c2', 2);
        expect(store.getTable('1')).toEqual({r1: {c1: 1, c2: 2}});
      });

      test('setCell, setCell', () => {
        // @ts-ignore
        store.setCell(1, 'r1', 'c1', 1);
        expect(store.getCell('1', 'r1', 'c1')).toEqual(1);
        // @ts-ignore
        store.setCell(1, 'r1', 'c2', 2);
        expect(store.getTable('1')).toEqual({r1: {c1: 1, c2: 2}});
      });
    });

    describe('Row Id', () => {
      test('setTables, setCell', () => {
        store.setTables({t1: {1: {c1: 1}}});
        expect(store.getTables()).toEqual({t1: {1: {c1: 1}}});
        // @ts-ignore
        store.setCell('t1', 1, 'c2', 2);
        expect(store.getRow('t1', '1')).toEqual({c1: 1, c2: 2});
      });

      test('setTable, setCell', () => {
        store.setTable('t1', {1: {c1: 1}});
        expect(store.getTable('t1')).toEqual({1: {c1: 1}});
        // @ts-ignore
        store.setCell('t1', 1, 'c2', 2);
        expect(store.getRow('t1', '1')).toEqual({c1: 1, c2: 2});
      });

      test('setRow, setCell', () => {
        // @ts-ignore
        store.setRow('t1', 1, {c1: 1});
        expect(store.getRow('t1', '1')).toEqual({c1: 1});
        // @ts-ignore
        store.setCell('t1', 1, 'c2', 2);
        expect(store.getRow('t1', '1')).toEqual({c1: 1, c2: 2});
      });

      test('setCell, setCell', () => {
        // @ts-ignore
        store.setCell('t1', 1, 'c1', 1);
        expect(store.getCell('t1', '1', 'c1')).toEqual(1);
        // @ts-ignore
        store.setCell('t1', 1, 'c2', 2);
        expect(store.getRow('t1', '1')).toEqual({c1: 1, c2: 2});
      });
    });

    describe('Cell Id', () => {
      test('setTables, setCell', () => {
        store.setTables({t1: {r1: {1: 1}}});
        expect(store.getTables()).toEqual({t1: {r1: {1: 1}}});
        // @ts-ignore
        store.setCell('t1', 'r1', 2, 2);
        expect(store.getCell('t1', 'r1', '1')).toEqual(1);
        expect(store.getCell('t1', 'r1', '2')).toEqual(2);
      });

      test('setTable, setCell', () => {
        store.setTable('t1', {r1: {1: 1}});
        expect(store.getTable('t1')).toEqual({r1: {1: 1}});
        // @ts-ignore
        store.setCell('t1', 'r1', 2, 2);
        expect(store.getCell('t1', 'r1', '1')).toEqual(1);
        expect(store.getCell('t1', 'r1', '2')).toEqual(2);
      });

      test('setRow, setCell', () => {
        store.setRow('t1', 'r1', {1: 1});
        expect(store.getRow('t1', 'r1')).toEqual({1: 1});
        // @ts-ignore
        store.setCell('t1', 'r1', 2, 2);
        expect(store.getCell('t1', 'r1', '1')).toEqual(1);
        expect(store.getCell('t1', 'r1', '2')).toEqual(2);
      });

      test('setCell, setCell', () => {
        // @ts-ignore
        store.setCell('t1', 'r1', 1, 1);
        // @ts-ignore
        store.setCell('t1', 'r1', 2, 2);
        expect(store.getCell('t1', 'r1', '1')).toEqual(1);
        expect(store.getCell('t1', 'r1', '2')).toEqual(2);
      });
    });

    test('Value Id', () => {
      store.setValues({1: 1});
      expect(store.getValues()).toEqual({1: 1});
      // @ts-ignore
      store.setValue(2, 2);
      expect(store.getValue('1')).toEqual(1);
      expect(store.getValue('2')).toEqual(2);
    });
  });

  describe('Get non-existent', () => {
    test('Table', () => {
      const store = createStore().setTables(validTables);
      expect(store.getTable('z')).toEqual({});
    });

    test('Row', () => {
      const store = createStore().setTables(validTables);
      expect(store.getRow('t1', 'z')).toEqual({});
      expect(store.getRow('y', 'z')).toEqual({});
    });

    test('Cell', () => {
      const store = createStore().setTables(validTables);
      expect(store.getCell('t1', 'r1', 'z')).toBeUndefined();
      expect(store.getCell('t1', 'y', 'z')).toBeUndefined();
      expect(store.getCell('x', 'y', 'z')).toBeUndefined();
    });

    test('Value', () => {
      const store = createStore().setValues(validValues);
      expect(store.getValue('v0')).toBeUndefined();
    });

    test('Metric', () => {
      const store = createStore().setTables(validTables);
      const metrics = createMetrics(store);
      metrics.setMetricDefinition('m', 't1');
      expect(metrics.getMetric('z')).toBeUndefined();
    });

    test('Index', () => {
      const store = createStore().setTables(validTables);
      const indexes = createIndexes(store);
      indexes.setIndexDefinition('i', 't1');
      expect(indexes.getSliceIds('z')).toEqual([]);
      expect(indexes.getSliceRowIds('z', 'y')).toEqual([]);
    });
  });

  describe('Delete non-existent', () => {
    let store: Store;
    let listener: StoreListener;

    beforeEach(() => {
      store = createStore().setTables(validTables);
      listener = createStoreListener(store);
      listener.listenToTables('/');
      listener.listenToTable('/t1', 't1');
      listener.listenToRow('/t1/r1', 't1', 'r1');
      listener.listenToCell('/t1/r1/c1', 't1', 'r1', 'c1');
    });

    test('Table', () => {
      store.delTable('t2');
      expect(store.getTables()).toEqual(validTables);
      expectNoChanges(listener);
    });

    test('Row', () => {
      store.delRow('t1', 'r2');
      store.delRow('t2', 'r1');
      expect(store.getTables()).toEqual(validTables);
      expectNoChanges(listener);
    });

    test('Cell', () => {
      store.delCell('t1', 'r1', 'c2');
      store.delCell('t1', 'r2', 'c1');
      store.delCell('t2', 'r1', 'c1');
      expectNoChanges(listener);
    });

    test('Value', () => {
      const store = createStore().setValues(validValues);
      store.delValue('v2');
      expect(store.getValues()).toEqual(validValues);
      expectNoChanges(listener);
    });
  });

  describe.each(INVALID_OBJECTS)(
    'Invalid hook container; %s',
    (_name, container: any) => {
      test('useTables', () => {
        const Test = () => <>{JSON.stringify(useTables(container))}</>;
        act(() => {
          renderer = create(<Test />);
        });
        expect(renderer.toJSON()).toEqual(JSON.stringify({}));
      });

      test('useTableIds', () => {
        const Test = () => <>{JSON.stringify(useTableIds(container))}</>;
        act(() => {
          renderer = create(<Test />);
        });
        expect(renderer.toJSON()).toEqual(JSON.stringify([]));
      });

      test('useTable', () => {
        const Test = () => <>{JSON.stringify(useTable('t1', container))}</>;
        act(() => {
          renderer = create(<Test />);
        });
        expect(renderer.toJSON()).toEqual(JSON.stringify({}));
      });

      test('useRowIds', () => {
        const Test = () => <>{JSON.stringify(useRowIds('t1', container))}</>;
        act(() => {
          renderer = create(<Test />);
        });
        expect(renderer.toJSON()).toEqual(JSON.stringify([]));
      });

      test('useRow', () => {
        const Test = () => <>{JSON.stringify(useRow('t1', 'r1', container))}</>;
        act(() => {
          renderer = create(<Test />);
        });
        expect(renderer.toJSON()).toEqual(JSON.stringify({}));
      });

      test('useCellIds', () => {
        const Test = () => (
          <>{JSON.stringify(useCellIds('t1', 'r1', container))}</>
        );
        act(() => {
          renderer = create(<Test />);
        });
        expect(renderer.toJSON()).toEqual(JSON.stringify([]));
      });

      test('useCell', () => {
        const Test = () => (
          <>{JSON.stringify(useCell('t1', 'r1', 'c1', container))}</>
        );
        act(() => {
          renderer = create(<Test />);
        });
        expect(renderer.toJSON()).toBeNull();
      });

      test('useMetric', () => {
        const Test = () => <>{JSON.stringify(useMetric('m1', container))}</>;
        act(() => {
          renderer = create(<Test />);
        });
        expect(renderer.toJSON()).toBeNull();
      });

      test('useSliceIds', () => {
        const Test = () => <>{JSON.stringify(useSliceIds('i1', container))}</>;
        act(() => {
          renderer = create(<Test />);
        });
        expect(renderer.toJSON()).toEqual(JSON.stringify([]));
      });

      test('useSliceRowIds', () => {
        const Test = () => (
          <>{JSON.stringify(useSliceRowIds('i1', 's1', container))}</>
        );
        act(() => {
          renderer = create(<Test />);
        });
        expect(renderer.toJSON()).toEqual(JSON.stringify([]));
      });

      test('useRemoteRowId', () => {
        const Test = () => (
          <>{JSON.stringify(useRemoteRowId('r1', 'r1', container))}</>
        );
        act(() => {
          renderer = create(<Test />);
        });
        expect(renderer.toJSON()).toBeNull();
      });

      test('useLocalRowIds', () => {
        const Test = () => (
          <>{JSON.stringify(useLocalRowIds('r1', 'r1', container))}</>
        );
        act(() => {
          renderer = create(<Test />);
        });
        expect(renderer.toJSON()).toEqual(JSON.stringify([]));
      });

      test('useLinkedRowIds', () => {
        const Test = () => (
          <>{JSON.stringify(useLinkedRowIds('r1', 'r1', container))}</>
        );
        act(() => {
          renderer = create(<Test />);
        });
        expect(renderer.toJSON()).toEqual(JSON.stringify([]));
      });

      test('useCheckpointIds', () => {
        const Test = () => <>{JSON.stringify(useCheckpointIds(container))}</>;
        act(() => {
          renderer = create(<Test />);
        });
        expect(renderer.toJSON()).toEqual(JSON.stringify([[], undefined, []]));
      });
    },
  );

  describe('Linked lists', () => {
    let relationships: Relationships;
    beforeEach(
      () =>
        (relationships = createRelationships(
          createStore().setTables({
            t1: {
              r1: {c1: 'r2'},
              r2: {c1: 'r3'},
              r3: {c1: 'r4'},
              r4: {c1: 'r2'},
              r5: {c1: 'r6'},
            },
          }),
        )),
    );

    test('non-existent relationship', () => {
      relationships.setRelationshipDefinition('r1', 't1', 't1', 'c1');
      expect(relationships.getLinkedRowIds('r2', 'r1')).toEqual(['r1']);
    });

    test('remote table relationship', () => {
      relationships.setRelationshipDefinition('r1', 't1', 'T1', 'c1');
      expect(relationships.getLinkedRowIds('r1', 'r1')).toEqual(['r1']);
    });

    test('self relationship', () => {
      relationships
        .setRelationshipDefinition('r1', 't1', 't1', 'c1')
        .getStore()
        .setCell('t1', 'r1', 'c1', 'r1');
      expect(relationships.getLinkedRowIds('r1', 'r1')).toEqual(['r1']);
    });

    test('circular relationship', () => {
      relationships.setRelationshipDefinition('r1', 't1', 't1', 'c1');
      expect(relationships.getLinkedRowIds('r1', 'r1')).toEqual([
        'r1',
        'r2',
        'r3',
        'r4',
      ]);
    });

    test('broken relationship', () => {
      relationships.setRelationshipDefinition('r1', 't1', 't1', 'c2');
      expect(relationships.getLinkedRowIds('r1', 'r1')).toEqual(['r1']);
    });
  });

  describe('Updating immutables', () => {
    test('Overriding store methods', () => {
      const store = createStore().setTables(validTables);
      expect(() => {
        store.addRowListener = () => '0';
      }).toThrow();
      expect(() => {
        // @ts-ignore
        store.foo = 'bar';
      }).toThrow();
      expect(() => {
        // @ts-ignore
        store['foo'] = 'bar';
      }).toThrow();
    });

    test('Overriding metrics methods', () => {
      const store = createStore().setTables(validTables);
      const metrics = createMetrics(store);
      expect(() => {
        metrics.addMetricListener = () => '0';
      }).toThrow();
      expect(() => {
        // @ts-ignore
        metrics.foo = 'bar';
      }).toThrow();
      expect(() => {
        // @ts-ignore
        metrics['foo'] = 'bar';
      }).toThrow();
    });

    test('Overriding indexes methods', () => {
      const store = createStore().setTables(validTables);
      const indexes = createIndexes(store);
      expect(() => {
        indexes.addSliceIdsListener = () => '0';
      }).toThrow();
      expect(() => {
        // @ts-ignore
        indexes.foo = 'bar';
      }).toThrow();
      expect(() => {
        // @ts-ignore
        indexes['foo'] = 'bar';
      }).toThrow();
    });

    test('Overriding relationships methods', () => {
      const store = createStore().setTables(validTables);
      const relationships = createRelationships(store);
      expect(() => {
        relationships.addRemoteRowIdListener = () => '0';
      }).toThrow();
      expect(() => {
        // @ts-ignore
        relationships.foo = 'bar';
      }).toThrow();
      expect(() => {
        // @ts-ignore
        relationships['foo'] = 'bar';
      }).toThrow();
    });

    test('Overriding persister methods', () => {
      const store = createStore().setTables(validTables);
      const persister = createLocalPersister(store, 'foo');
      expect(() => {
        persister.load = async () => persister;
      }).toThrow();
      expect(() => {
        // @ts-ignore
        persister.foo = 'bar';
      }).toThrow();
      expect(() => {
        // @ts-ignore
        persister['foo'] = 'bar';
      }).toThrow();
    });

    test('Overriding checkpoints methods', () => {
      const store = createStore().setTables(validTables);
      const checkpoints = createCheckpoints(store);
      expect(() => {
        checkpoints.addCheckpointIdsListener = () => '0';
      }).toThrow();
      expect(() => {
        // @ts-ignore
        checkpoints.foo = 'bar';
      }).toThrow();
      expect(() => {
        // @ts-ignore
        checkpoints['foo'] = 'bar';
      }).toThrow();
    });
  });
});
