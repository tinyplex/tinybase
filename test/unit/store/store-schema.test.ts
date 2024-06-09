/* eslint-disable @typescript-eslint/ban-ts-comment */
import type {
  Cell,
  Id,
  Store,
  Tables,
  TablesSchema,
  Value,
} from 'tinybase/debug/with-schemas';
import {createMergeableStore, createStore} from 'tinybase/debug/with-schemas';
import {
  expectChanges,
  expectChangesNoJson,
  expectNoChanges,
} from '../common/expect.ts';
import {StoreListener} from '../common/types.ts';
import {createStoreListener} from '../common/listeners.ts';

type AddMutator = (store: Store<any>) => void;

const addAllowCellMutator = <C extends Cell<any, any, any>>(
  store: Store<any>,
  tableId: Id,
  cellId: Id,
  cells: C[],
): Id =>
  store.addRowListener(
    tableId,
    null,
    (store, tableId, rowId) => {
      if (!cells.includes(store.getCell(tableId, rowId, cellId) as C)) {
        store.delCell(tableId, rowId, cellId);
      }
    },
    true,
  );

const addAllowValueMutator = <V extends Value<any, any, any>>(
  store: Store<any>,
  valueId: Id,
  values: V[],
): Id =>
  store.addValueListener(
    valueId,
    (store, ..._) => {
      if (!values.includes(store.getValue(valueId) as V)) {
        store.delValue(valueId);
      }
    },
    true,
  );

const getAddMinMaxMutator =
  (
    tableId: Id,
    cellId: Id,
    {min, max}: {min?: number; max?: number},
  ): AddMutator =>
  (store) =>
    store.addRowListener(
      tableId,
      null,
      (store, tableId, rowId) => {
        let cell = store.getCell(tableId, rowId, cellId) as number;
        cell = min != null ? Math.max(min, cell as number) : cell;
        cell = max != null ? Math.min(max, cell as number) : cell;
        store.setCell(tableId, rowId, cellId, cell);
      },
      true,
    );

const cellBoundsSchemaAndExpected: [
  name: string,
  tablesSchema: TablesSchema,
  addMutator: AddMutator,
  expected: Tables<any, any>,
][] = [
  [
    'non-defaulted min',
    {t1: {c1: {type: 'number'}}},
    getAddMinMaxMutator('t1', 'c1', {min: 0.5}),
    {t1: {r1: {c1: 0.5}, r2: {c1: 1}, r3: {c1: 2}}},
  ],
  [
    'non-defaulted max',
    {t1: {c1: {type: 'number'}}},
    getAddMinMaxMutator('t1', 'c1', {max: 1.5}),
    {t1: {r1: {c1: 0}, r2: {c1: 1}, r3: {c1: 1.5}}},
  ],
  [
    'non-defaulted min/max',
    {t1: {c1: {type: 'number'}}},
    getAddMinMaxMutator('t1', 'c1', {min: 0.5, max: 1.5}),
    {t1: {r1: {c1: 0.5}, r2: {c1: 1}, r3: {c1: 1.5}}},
  ],
  [
    'defaulted min',
    {t1: {c1: {type: 'number', default: 1.5}}},
    getAddMinMaxMutator('t1', 'c1', {min: 1}),
    {t1: {r1: {c1: 1}, r2: {c1: 1}, r3: {c1: 2}, r4: {c1: 1.5}, r5: {c1: 1.5}}},
  ],
  [
    'defaulted under min',
    {t1: {c1: {type: 'number', default: 0.5}}},
    getAddMinMaxMutator('t1', 'c1', {min: 1}),
    {
      t1: {
        r1: {c1: 1},
        r2: {c1: 1},
        r3: {c1: 2},
        r4: {c1: 1},
        r5: {c1: 1},
      },
    },
  ],
  [
    'defaulted max',
    {t1: {c1: {type: 'number', default: 0.5}}},
    getAddMinMaxMutator('t1', 'c1', {max: 1}),
    {t1: {r1: {c1: 0}, r2: {c1: 1}, r3: {c1: 1}, r4: {c1: 0.5}, r5: {c1: 0.5}}},
  ],
  [
    'defaulted over max',
    {t1: {c1: {type: 'number', default: 1.5}}},
    getAddMinMaxMutator('t1', 'c1', {max: 1}),
    {
      t1: {
        r1: {c1: 0},
        r2: {c1: 1},
        r3: {c1: 1},
        r4: {c1: 1},
        r5: {c1: 1},
      },
    },
  ],
];

describe.each([
  ['store', createStore],
  ['mergeableStore', () => createMergeableStore('s1')],
])('Testing %s', (_name, createStore) => {
  describe('Get and set tablesSchemas', () => {
    let store: Store<any>;
    let listener: StoreListener;

    beforeEach(() => {
      store = createStore();
      listener = createStoreListener(store);
      listener.listenToInvalidCell('invalids', null, null, null);
    });

    test('Set tablesSchema on creation', () => {
      addAllowCellMutator(store, 't1', 'c1', [2, 3]);
      store.setTablesSchema({t1: {c1: {type: 'number', default: 1}}});
      expect(JSON.parse(store.getTablesSchemaJson())).toEqual({
        t1: {c1: {type: 'number', default: 1}},
      });
      store.setCell('t1', 'r1', 'c1', '2');
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
      store.setCell('t1', 'r1', 'c1', 2);
      expect(store.getTables()).toEqual({t1: {r1: {c1: 2}}});
      expectChanges(listener, 'invalids', {t1: {r1: {c1: ['2']}}});
      expectNoChanges(listener);
    });

    test('Set tablesSchema after creation', () => {
      store.setCell('t1', 'r1', 'c1', '1');
      expect(store.getTables()).toEqual({t1: {r1: {c1: '1'}}});
      store.setTablesSchema({
        t1: {
          c1: {type: 'number', default: 1},
          c2: {type: 'string', default: '2'},
        },
      });
      expect(JSON.parse(store.getTablesSchemaJson())).toEqual({
        t1: {
          c1: {type: 'number', default: 1},
          c2: {type: 'string', default: '2'},
        },
      });
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1, c2: '2'}}});
      store.setCell('t1', 'r1', 'c1', '2');
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1, c2: '2'}}});
      store.setCell('t1', 'r1', 'c1', 2);
      expect(store.getTables()).toEqual({t1: {r1: {c1: 2, c2: '2'}}});
      expectChanges(
        listener,
        'invalids',
        {t1: {r1: {c1: ['1']}}},
        {t1: {r1: {c1: ['2']}}},
      );
      expectNoChanges(listener);
    });

    test('Set tablesSchema after creation (complete failure)', () => {
      store.setCell('t1', 'r1', 'c1', '1');
      store.setTablesSchema({t2: {c1: {type: 'number', default: 1}}});
      expect(store.getTables()).toEqual({});
      expectChangesNoJson(listener, 'invalids', {
        t1: {undefined: {undefined: [undefined]}},
      });
      expectNoChanges(listener);
    });

    test('Change tablesSchema after creation', () => {
      let listenerId = addAllowCellMutator(store, 't1', 'c1', [2, 3]);
      store.setTablesSchema({t1: {c1: {type: 'number', default: 1}}});
      store.setCell('t1', 'r1', 'c1', '1');
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
      store.setTablesSchema({
        t1: {c1: {type: 'string', default: '1'}},
      });
      store.delListener(listenerId as any);
      expect(JSON.parse(store.getTablesSchemaJson())).toEqual({
        t1: {c1: {type: 'string', default: '1'}},
      });
      expect(store.getTables()).toEqual({t1: {r1: {c1: '1'}}});
      store.setCell('t1', 'r1', 'c1', 2);
      expect(store.getTables()).toEqual({t1: {r1: {c1: '1'}}});
      store.setCell('t1', 'r1', 'c1', '2');
      store.setCell('t1', 'r2', 'c1', '3');
      expect(store.getTables()).toEqual({t1: {r1: {c1: '2'}, r2: {c1: '3'}}});
      listenerId = addAllowCellMutator(store, 't1', 'c1', ['3', '4']);
      store.callListener(listenerId);
      expect(store.getTables()).toEqual({t1: {r1: {c1: '1'}, r2: {c1: '3'}}});
      expectChanges(
        listener,
        'invalids',
        {t1: {r1: {c1: ['1']}}},
        {t1: {r1: {c1: [1]}}},
        {t1: {r1: {c1: [2]}}},
      );
      expectNoChanges(listener);
    });

    test('Remove tablesSchema after creation', () => {
      const listenerId = addAllowCellMutator(store, 't1', 'c1', [2, 3]);
      store.setTablesSchema({t1: {c1: {type: 'number', default: 1}}});
      store.setCell('t1', 'r1', 'c1', '1');
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
      store.delTablesSchema();
      store.delListener(listenerId as any);
      expect(JSON.parse(store.getTablesSchemaJson())).toEqual({});
      store.setCell('t1', 'r1', 'c1', '1');
      expect(store.getTables()).toEqual({t1: {r1: {c1: '1'}}});
      expectChanges(listener, 'invalids', {t1: {r1: {c1: ['1']}}});
      expectNoChanges(listener);
    });
  });

  describe('Get and set valuesSchemas', () => {
    let store: Store<any>;
    let listener: StoreListener;

    beforeEach(() => {
      store = createStore();
      listener = createStoreListener(store);
      listener.listenToInvalidValue('invalids', null);
    });

    test('Set valuesSchemas on creation', () => {
      addAllowValueMutator(store, 'v1', [2, 3]);
      store.setValuesSchema({v1: {type: 'number', default: 1}});
      expect(JSON.parse(store.getValuesSchemaJson())).toEqual({
        v1: {type: 'number', default: 1},
      });
      store.setValue('v1', '2');
      expect(store.getValues()).toEqual({v1: 1});
      store.setValue('v1', 2);
      expect(store.getValues()).toEqual({v1: 2});
      expectChanges(listener, 'invalids', {v1: ['2']});
      expectNoChanges(listener);
    });

    test('Set valuesSchema after creation', () => {
      store.setValue('v1', '1');
      expect(store.getValues()).toEqual({v1: '1'});
      store.setValuesSchema({
        v1: {type: 'number', default: 1},
        v2: {type: 'string', default: '2'},
      });
      expect(JSON.parse(store.getValuesSchemaJson())).toEqual({
        v1: {type: 'number', default: 1},
        v2: {type: 'string', default: '2'},
      });
      expect(store.getValues()).toEqual({v1: 1, v2: '2'});
      store.setValue('v1', '2');
      expect(store.getValues()).toEqual({v1: 1, v2: '2'});
      store.setValue('v1', 2);
      expect(store.getValues()).toEqual({v1: 2, v2: '2'});
      expectChanges(listener, 'invalids', {v1: ['1']}, {v1: ['2']});
      expectNoChanges(listener);
    });

    test('Change valuesSchema after creation', () => {
      let listenerId = addAllowCellMutator(store, 't1', 'v1', [2, 3]);
      store.setValuesSchema({v1: {type: 'number', default: 1}});
      store.setValue('v1', '1');
      expect(store.getValues()).toEqual({v1: 1});
      store.setValuesSchema({v1: {type: 'string', default: '1'}});
      store.delListener(listenerId as any);
      expect(JSON.parse(store.getValuesSchemaJson())).toEqual({
        v1: {type: 'string', default: '1'},
      });
      expect(store.getValues()).toEqual({v1: '1'});
      store.setValue('v1', 2);
      expect(store.getValues()).toEqual({v1: '1'});
      store.setValue('v1', '2');
      expect(store.getValues()).toEqual({v1: '2'});
      listenerId = addAllowValueMutator(store, 'v1', ['3', '4']);
      store.callListener(listenerId);
      expect(store.getValues()).toEqual({v1: '1'});
      expectChanges(listener, 'invalids', {v1: ['1']}, {v1: [1]}, {v1: [2]});
      expectNoChanges(listener);
    });

    test('Remove valuesSchema after creation', () => {
      const listenerId = addAllowValueMutator(store, 'v1', [2, 3]);
      store.setValuesSchema({v1: {type: 'number', default: 1}});
      store.setValue('v1', '1');
      expect(store.getValues()).toEqual({v1: 1});
      store.delValuesSchema();
      store.delListener(listenerId as any);
      expect(JSON.parse(store.getValuesSchemaJson())).toEqual({});
      store.setValue('v1', '1');
      expect(store.getValues()).toEqual({v1: '1'});
      expectChanges(listener, 'invalids', {v1: ['1']});
      expectNoChanges(listener);
    });
  });

  describe('tablesSchemas applied before data set', () => {
    test('matching', () => {
      const store = createStore();
      store.setTables({t1: {r1: {c1: 1}}});
      store.setTablesSchema({t1: {c1: {type: 'number'}}});
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    });

    test('non-matching table', () => {
      const store = createStore();
      store.setTablesSchema({t1: {c1: {type: 'number'}}});
      store.setTables({t2: {r1: {c1: 1}}});
      expect(store.getTables()).toEqual({});
    });

    test('non-matching cell', () => {
      const store = createStore();
      store.setTablesSchema({t1: {c1: {type: 'number'}}});
      store.setTables({t1: {r1: {c2: 1}}});
      expect(store.getTables()).toEqual({});
    });

    test('non-matching some cell types', () => {
      const store = createStore();
      store.setTables({t1: {r1: {c1: 1}, r2: {c1: true}, r3: {c1: 'a'}}});
      store.setTablesSchema({t1: {c1: {type: 'number'}}});
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    });

    test('non-matching some cell allows', () => {
      const store = createStore();
      addAllowCellMutator(store, 't1', 'c1', [1, 2, 3]);
      store.setTables({
        t1: {r1: {c1: 2}, r2: {c1: 4}, r3: {c1: true}, r4: {c1: 'a'}},
      });
      store.setTablesSchema({t1: {c1: {type: 'number'}}});
      expect(store.getTables()).toEqual({t1: {r1: {c1: 2}}});
    });

    describe('non-matching some bounds', () => {
      test.each(cellBoundsSchemaAndExpected)(
        '%s',
        (
          _name,
          tablesSchema: TablesSchema,
          addMutator: AddMutator,
          expected: Tables<any>,
        ) => {
          const store = createStore();
          store.setTablesSchema(tablesSchema);
          addMutator(store);
          store.setTables({
            t1: {
              r1: {c1: 0},
              r2: {c1: 1},
              r3: {c1: 2},
              r4: {c1: true},
              r5: {c1: 'a'},
            },
          });
          expect(store.getTables()).toEqual(expected);
        },
      );
    });

    test('non-matching some cell types, defaulting', () => {
      const store = createStore().setTables({
        t1: {r1: {c1: 1}, r2: {c1: true}, r3: {c1: 'a'}},
      });
      store.setTablesSchema({t1: {c1: {type: 'number', default: 2}}});
      expect(store.getTables()).toEqual({
        t1: {r1: {c1: 1}, r2: {c1: 2}, r3: {c1: 2}},
      });
    });

    test('non-matching some cell types, default and allows', () => {
      const store = createStore();
      addAllowCellMutator(store, 't1', 'c1', [1, 3]);
      store.setTablesSchema({t1: {c1: {type: 'number', default: 2}}});
      store.setTables({
        t1: {
          r1: {c1: 2},
          r2: {c1: 4},
          r3: {c1: true},
          r4: {c1: 'a'},
          r5: {c1: 3},
        },
      });
      expect(store.getTables()).toEqual({
        t1: {r1: {c1: 2}, r2: {c1: 2}, r3: {c1: 2}, r4: {c1: 2}, r5: {c1: 3}},
      });
    });
  });

  describe('valuesSchema applied before data set', () => {
    test('matching', () => {
      const store = createStore();
      store.setValues({v1: 1});
      store.setValuesSchema({v1: {type: 'number'}});
      expect(store.getValues()).toEqual({v1: 1});
    });

    test('non-matching value', () => {
      const store = createStore();
      store.setValuesSchema({v1: {type: 'number'}});
      store.setValues({v2: 1});
      expect(store.getValues()).toEqual({});
    });

    test('non-matching some value allows', () => {
      const store = createStore();
      addAllowValueMutator(store, 'v1', [1, 2, 3]);
      store.setValues({v1: 2});
      store.setValuesSchema({v1: {type: 'number'}});
      expect(store.getValues()).toEqual({v1: 2});
    });

    test('non-matching some value types, defaulting', () => {
      const store = createStore();
      store.setValuesSchema({v1: {type: 'number', default: 2}});
      store.setValues({v1: 1});
      expect(store.getValues()).toEqual({v1: 1});
      store.setValues({v1: true});
      expect(store.getValues()).toEqual({v1: 2});
      store.setValues({v1: 'a'});
      expect(store.getValues()).toEqual({v1: 2});
    });

    test('non-matching some value types, default and allows', () => {
      const store = createStore();
      addAllowValueMutator(store, 'v1', [1, 3]);
      store.setValuesSchema({v1: {type: 'number', default: 2}});
      store.setValues({v1: 2});
      expect(store.getValues()).toEqual({v1: 2});
      store.setValues({v1: 4});
      expect(store.getValues()).toEqual({v1: 2});
      store.setValues({v1: true});
      expect(store.getValues()).toEqual({v1: 2});
      store.setValues({v1: 'a'});
      expect(store.getValues()).toEqual({v1: 2});
      store.setValues({v1: 3});
      expect(store.getValues()).toEqual({v1: 3});
    });
  });

  describe('tablesSchemas applied before data set, listening', () => {
    describe('Tables', () => {
      test('matching', () => {
        const store = createStore();
        store.setTablesSchema({t1: {c1: {type: 'number'}}});
        const listener = createStoreListener(store);
        listener.listenToTables('/');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        store.setTables({t1: {r1: {c1: 1}}});
        expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r*/c*', {t1: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('default missing cell', () => {
        const store = createStore();
        store.setTablesSchema({
          t1: {c1: {type: 'number'}, c2: {type: 'number', default: 2}},
        });
        const listener = createStoreListener(store);
        listener.listenToTables('/');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        store.setTables({t1: {r1: {c1: 1}}});
        expect(store.getTables()).toEqual({t1: {r1: {c1: 1, c2: 2}}});
        expectChanges(listener, '/', {t1: {r1: {c1: 1, c2: 2}}});
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {r1: {c1: 1}}},
          {t1: {r1: {c2: 2}}},
        );
        expectNoChanges(listener);
      });

      test('non-matching table', () => {
        const store = createStore();
        store.setTablesSchema({t1: {c1: {type: 'number'}}});
        const listener = createStoreListener(store);
        listener.listenToTables('/');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        // @ts-ignore
        store.setTables({t2: {r1: {c1: 1}}});
        expect(store.getTables()).toEqual({});
        expectChangesNoJson(listener, 'invalids', {
          t2: {undefined: {undefined: [undefined]}},
        });
        expectNoChanges(listener);
      });

      test('non-matching cell', () => {
        const store = createStore();
        store.setTablesSchema({t1: {c1: {type: 'number'}}});
        const listener = createStoreListener(store);
        listener.listenToTables('/');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        // @ts-ignore
        store.setTables({t1: {r1: {c2: 1}}});
        expect(store.getTables()).toEqual({});
        expectChangesNoJson(
          listener,
          'invalids',
          {t1: {r1: {c1: [undefined]}}},
          {t1: {r1: {c2: [1]}}},
        );
        expectNoChanges(listener);
      });

      test('non-matching some cell types', () => {
        const store = createStore();
        store.setTablesSchema({t1: {c1: {type: 'number'}}});
        const listener = createStoreListener(store);
        listener.listenToTables('/');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        // @ts-ignore
        store.setTables({t1: {r1: {c1: 1}, r2: {c1: true}, r3: {c1: 'a'}}});
        expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r*/c*', {t1: {r1: {c1: 1}}});
        expectChanges(
          listener,
          'invalids',
          {t1: {r2: {c1: [true]}}},
          {t1: {r3: {c1: ['a']}}},
        );
        expectNoChanges(listener);
      });

      test('non-matching some cell allows', () => {
        const store = createStore();
        addAllowCellMutator(store, 't1', 'c1', [1, 2, 3]);
        store.setTablesSchema({t1: {c1: {type: 'number'}}});
        const listener = createStoreListener(store);
        listener.listenToTables('/');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        store.setTables({
          t1: {r1: {c1: 2}, r2: {c1: 4}, r3: {c1: true}, r4: {c1: 'a'}},
        });
        expect(store.getTables()).toEqual({t1: {r1: {c1: 2}}});
        expectChanges(listener, '/', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t*/r*/c*', {t1: {r1: {c1: 2}}});
        expectChanges(
          listener,
          'invalids',
          {t1: {r3: {c1: [true]}}},
          {t1: {r4: {c1: ['a']}}},
        );
        expectNoChanges(listener);
      });

      describe('non-matching some bounds', () => {
        test.each(cellBoundsSchemaAndExpected)(
          '%s',
          (
            _name,
            tablesSchema: TablesSchema,
            addMutator: AddMutator,
            expected: Tables<any>,
          ) => {
            const store = createStore();
            store.setTablesSchema(tablesSchema);
            addMutator(store);
            const listener = createStoreListener(store);
            listener.listenToTables('/');
            listener.listenToCell('/t*/r*/c*', null, null, null);
            store.setTables({
              t1: {
                r1: {c1: 0},
                r2: {c1: 1},
                r3: {c1: 2},
                r4: {c1: true},
                r5: {c1: 'a'},
              },
            });
            expect(store.getTables()).toEqual(expected);
            expectChanges(listener, '/', expected);
            expectChanges(
              listener,
              '/t*/r*/c*',
              {t1: {r1: {c1: expected.t1?.r1.c1}}},
              {t1: {r2: {c1: expected.t1?.r2.c1}}},
              {t1: {r3: {c1: expected.t1?.r3.c1}}},
            );
            if (expected.t1?.r4 != null) {
              expectChanges(listener, '/t*/r*/c*', {
                t1: {r4: {c1: expected.t1?.r4.c1}},
              });
            }
            if (expected.t1?.r5 != null) {
              expectChanges(listener, '/t*/r*/c*', {
                t1: {r5: {c1: expected.t1?.r5.c1}},
              });
            }
            expectNoChanges(listener);
          },
        );
      });

      test('non-matching some cell types, defaulting', () => {
        const store = createStore();
        store.setTablesSchema({
          t1: {c1: {type: 'number', default: 2}},
        });
        const listener = createStoreListener(store);
        listener.listenToTables('/');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        store.setTables({
          // @ts-ignore
          t1: {r1: {c1: 1}, r2: {c1: true}, r3: {c1: 'a'}, r4: {}},
        });
        expect(store.getTables()).toEqual({
          t1: {r1: {c1: 1}, r2: {c1: 2}, r3: {c1: 2}, r4: {c1: 2}},
        });
        expectChanges(listener, '/', {
          t1: {r1: {c1: 1}, r2: {c1: 2}, r3: {c1: 2}, r4: {c1: 2}},
        });
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {r1: {c1: 1}}},
          {t1: {r2: {c1: 2}}},
          {t1: {r3: {c1: 2}}},
          {t1: {r4: {c1: 2}}},
        );
        expectChanges(
          listener,
          'invalids',
          {t1: {r2: {c1: [true]}}},
          {t1: {r3: {c1: ['a']}}},
        );
        expectNoChanges(listener);
      });

      test('non-matching some cell types, default and allows', () => {
        const store = createStore();
        addAllowCellMutator(store, 't1', 'c1', [1, 3]);
        store.setTablesSchema({t1: {c1: {type: 'number', default: 2}}});
        const listener = createStoreListener(store);
        listener.listenToTables('/');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        store.setTables({
          t1: {
            r1: {c1: 2},
            r2: {c1: 4},
            r3: {c1: true},
            r4: {c1: 'a'},
            r5: {c1: 3},
          },
        });
        expect(store.getTables()).toEqual({
          t1: {r1: {c1: 2}, r2: {c1: 2}, r3: {c1: 2}, r4: {c1: 2}, r5: {c1: 3}},
        });
        expectChanges(listener, '/', {
          t1: {r1: {c1: 2}, r2: {c1: 2}, r3: {c1: 2}, r4: {c1: 2}, r5: {c1: 3}},
        });
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {r1: {c1: 2}}},
          {t1: {r2: {c1: 2}}},
          {t1: {r3: {c1: 2}}},
          {t1: {r4: {c1: 2}}},
          {t1: {r5: {c1: 3}}},
        );
        expectChanges(
          listener,
          'invalids',
          {t1: {r3: {c1: [true]}}},
          {t1: {r4: {c1: ['a']}}},
        );
        expectNoChanges(listener);
      });

      test('Setting, changing', () => {
        const store = createStore();
        store
          .setTables({t1: {r1: {c1: 1}}})
          .setTablesSchema({t1: {c1: {type: 'number', default: 2}}});
        const listener = createStoreListener(store);
        listener.listenToTables('/');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        store.setTables({t1: {r1: {c1: 3}}});
        // @ts-ignore
        store.setTables({t1: {r1: {c1: true}}});
        // @ts-ignore
        store.setTables({t1: {r1: {c1: 'a'}}});
        expect(store.getTables()).toEqual({t1: {r1: {c1: 2}}});
        expectChanges(listener, '/', {t1: {r1: {c1: 3}}}, {t1: {r1: {c1: 2}}});
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {r1: {c1: 3}}},
          {t1: {r1: {c1: 2}}},
        );
        expectChanges(
          listener,
          'invalids',
          {t1: {r1: {c1: [true]}}},
          {t1: {r1: {c1: ['a']}}},
        );
        expectNoChanges(listener);
      });

      test('Deleting', () => {
        const store = createStore();
        store
          .setTables({t1: {r1: {c1: 1}}})
          .setTablesSchema({t1: {c1: {type: 'number', default: 2}}});
        const listener = createStoreListener(store);
        listener.listenToTables('/');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        store.delTables();
        expect(store.getTables()).toEqual({});
        expectChanges(listener, '/', {});
        expectChanges(listener, '/t*/r*/c*', {t1: {r1: {c1: undefined}}});
      });
    });

    describe('Table', () => {
      test('matching', () => {
        const store = createStore();
        store.setTablesSchema({t1: {c1: {type: 'number'}}});
        const listener = createStoreListener(store);
        listener.listenToTable('/t1', 't1');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        store.setTable('t1', {r1: {c1: 1}});
        expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r*/c*', {t1: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('default missing cell', () => {
        const store = createStore();
        store.setTablesSchema({
          t1: {c1: {type: 'number'}, c2: {type: 'number', default: 2}},
        });
        const listener = createStoreListener(store);
        listener.listenToTable('/t1', 't1');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        store.setTable('t1', {r1: {c1: 1}});
        expect(store.getTables()).toEqual({t1: {r1: {c1: 1, c2: 2}}});
        expectChanges(listener, '/t1', {t1: {r1: {c1: 1, c2: 2}}});
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {r1: {c1: 1}}},
          {t1: {r1: {c2: 2}}},
        );
        expectNoChanges(listener);
      });

      test('non-matching table', () => {
        const store = createStore();
        store.setTablesSchema({t1: {c1: {type: 'number'}}});
        const listener = createStoreListener(store);
        listener.listenToTable('/t2', 't2');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        // @ts-ignore
        store.setTable('t2', {r1: {c1: 1}});
        expect(store.getTables()).toEqual({});
        expectChangesNoJson(listener, 'invalids', {
          t2: {undefined: {undefined: [undefined]}},
        });
        expectNoChanges(listener);
      });

      test('non-matching cell', () => {
        const store = createStore();
        store.setTablesSchema({t1: {c1: {type: 'number'}}});
        const listener = createStoreListener(store);
        listener.listenToTable('/t1', 't1');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        // @ts-ignore
        store.setTable('t1', {r1: {c2: 1}});
        expect(store.getTables()).toEqual({});
        expectChangesNoJson(
          listener,
          'invalids',
          {t1: {r1: {c1: [undefined]}}},
          {t1: {r1: {c2: [1]}}},
        );
        expectNoChanges(listener);
      });

      test('non-matching some cell types', () => {
        const store = createStore();
        store.setTablesSchema({t1: {c1: {type: 'number'}}});
        const listener = createStoreListener(store);
        listener.listenToTable('/t1', 't1');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        // @ts-ignore
        store.setTable('t1', {r1: {c1: 1}, r2: {c1: true}, r3: {c1: 'a'}});
        expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r*/c*', {t1: {r1: {c1: 1}}});
        expectChanges(
          listener,
          'invalids',
          {t1: {r2: {c1: [true]}}},
          {t1: {r3: {c1: ['a']}}},
        );
        expectNoChanges(listener);
      });

      test('non-matching some cell allows', () => {
        const store = createStore();
        addAllowCellMutator(store, 't1', 'c1', [1, 2, 3]);
        store.setTablesSchema({t1: {c1: {type: 'number'}}});
        const listener = createStoreListener(store);
        listener.listenToTable('/t1', 't1');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        store.setTable('t1', {
          r1: {c1: 2},
          r2: {c1: 4},
          r3: {c1: true},
          r4: {c1: 'a'},
        });
        expect(store.getTables()).toEqual({t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t1', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t*/r*/c*', {t1: {r1: {c1: 2}}});
        expectChanges(
          listener,
          'invalids',
          {t1: {r3: {c1: [true]}}},
          {t1: {r4: {c1: ['a']}}},
        );
        expectNoChanges(listener);
      });

      describe('non-matching some bounds', () => {
        test.each(cellBoundsSchemaAndExpected)(
          '%s',
          (
            _name,
            tablesSchema: TablesSchema,
            addMutator: AddMutator,
            expected: Tables<any>,
          ) => {
            const store = createStore();
            store.setTablesSchema(tablesSchema);
            addMutator(store);
            const listener = createStoreListener(store);
            listener.listenToTable('/t1', 't1');
            listener.listenToCell('/t*/r*/c*', null, null, null);
            store.setTable('t1', {
              r1: {c1: 0},
              r2: {c1: 1},
              r3: {c1: 2},
              r4: {c1: true},
              r5: {c1: 'a'},
            });
            expect(store.getTables()).toEqual(expected);
            expectChanges(listener, '/t1', expected);
            expectChanges(
              listener,
              '/t*/r*/c*',
              {t1: {r1: {c1: expected.t1?.r1.c1}}},
              {t1: {r2: {c1: expected.t1?.r2.c1}}},
              {t1: {r3: {c1: expected.t1?.r3.c1}}},
            );
            if (expected.t1?.r4 != null) {
              expectChanges(listener, '/t*/r*/c*', {
                t1: {r4: {c1: expected.t1?.r4.c1}},
              });
            }
            if (expected.t1?.r5 != null) {
              expectChanges(listener, '/t*/r*/c*', {
                t1: {r5: {c1: expected.t1?.r5.c1}},
              });
            }
            expectNoChanges(listener);
          },
        );
      });

      test('non-matching some cell types, defaulting', () => {
        const store = createStore();
        store.setTablesSchema({
          t1: {c1: {type: 'number', default: 2}},
        });
        const listener = createStoreListener(store);
        listener.listenToTable('/t1', 't1');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        store.setTable('t1', {
          r1: {c1: 1},
          // @ts-ignore
          r2: {c1: true},
          // @ts-ignore
          r3: {c1: 'a'},
          r4: {},
        });
        expect(store.getTables()).toEqual({
          t1: {r1: {c1: 1}, r2: {c1: 2}, r3: {c1: 2}, r4: {c1: 2}},
        });
        expectChanges(listener, '/t1', {
          t1: {r1: {c1: 1}, r2: {c1: 2}, r3: {c1: 2}, r4: {c1: 2}},
        });
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {r1: {c1: 1}}},
          {t1: {r2: {c1: 2}}},
          {t1: {r3: {c1: 2}}},
          {t1: {r4: {c1: 2}}},
        );
        expectChanges(
          listener,
          'invalids',
          {t1: {r2: {c1: [true]}}},
          {t1: {r3: {c1: ['a']}}},
        );
        expectNoChanges(listener);
      });

      test('non-matching some cell types, default and allows', () => {
        const store = createStore();
        addAllowCellMutator(store, 't1', 'c1', [1, 3]);
        store.setTablesSchema({t1: {c1: {type: 'number', default: 2}}});
        const listener = createStoreListener(store);
        listener.listenToTable('/t1', 't1');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        store.setTable('t1', {
          r1: {c1: 2},
          r2: {c1: 4},
          r3: {c1: true},
          r4: {c1: 'a'},
          r5: {c1: 3},
        });
        expect(store.getTables()).toEqual({
          t1: {r1: {c1: 2}, r2: {c1: 2}, r3: {c1: 2}, r4: {c1: 2}, r5: {c1: 3}},
        });
        expectChanges(listener, '/t1', {
          t1: {r1: {c1: 2}, r2: {c1: 2}, r3: {c1: 2}, r4: {c1: 2}, r5: {c1: 3}},
        });
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {r1: {c1: 2}}},
          {t1: {r2: {c1: 2}}},
          {t1: {r3: {c1: 2}}},
          {t1: {r4: {c1: 2}}},
          {t1: {r5: {c1: 3}}},
        );
        expectChanges(
          listener,
          'invalids',
          {t1: {r3: {c1: [true]}}},
          {t1: {r4: {c1: ['a']}}},
        );
        expectNoChanges(listener);
      });

      test('Setting, changing', () => {
        const store = createStore();
        store
          .setTables({t1: {r1: {c1: 1}}})
          .setTablesSchema({t1: {c1: {type: 'number', default: 2}}});
        const listener = createStoreListener(store);
        listener.listenToTable('/t1', 't1');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        store.setTable('t1', {r1: {c1: 3}});
        // @ts-ignore
        store.setTable('t1', {r1: {c1: true}});
        // @ts-ignore
        store.setTable('t1', {r1: {c1: 'a'}});
        expect(store.getTables()).toEqual({
          t1: {r1: {c1: 2}},
        });
        expect(store.getTables()).toEqual({t1: {r1: {c1: 2}}});
        expectChanges(
          listener,
          '/t1',
          {t1: {r1: {c1: 3}}},
          {t1: {r1: {c1: 2}}},
        );
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {r1: {c1: 3}}},
          {t1: {r1: {c1: 2}}},
        );
        expectChanges(
          listener,
          'invalids',
          {t1: {r1: {c1: [true]}}},
          {t1: {r1: {c1: ['a']}}},
        );
        expectNoChanges(listener);
      });

      test('Deleting', () => {
        const store = createStore();
        store
          .setTables({t1: {r1: {c1: 1}}})
          .setTablesSchema({t1: {c1: {type: 'number', default: 2}}});
        const listener = createStoreListener(store);
        listener.listenToTable('/t1', 't1');
        listener.listenToInvalidCell('invalids', null, null, null);
        store.delTable('t1');
        expect(store.getTables()).toEqual({});
        expectChanges(listener, '/t1', {t1: {}});
      });
    });

    describe('Row', () => {
      test('matching', () => {
        const store = createStore();
        store.setTablesSchema({t1: {c1: {type: 'number'}}});
        const listener = createStoreListener(store);
        listener.listenToRow('/t1/r1', 't1', 'r1');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        store.setRow('t1', 'r1', {c1: 1});
        expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r*/c*', {t1: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('default missing cell', () => {
        const store = createStore();
        store.setTablesSchema({
          t1: {c1: {type: 'number'}, c2: {type: 'number', default: 2}},
        });
        const listener = createStoreListener(store);
        listener.listenToRow('/t1/r1', 't1', 'r1');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        store.setRow('t1', 'r1', {c1: 1});
        expect(store.getTables()).toEqual({t1: {r1: {c1: 1, c2: 2}}});
        expectChanges(listener, '/t1/r1', {t1: {r1: {c1: 1, c2: 2}}});
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {r1: {c1: 1}}},
          {t1: {r1: {c2: 2}}},
        );
        expectNoChanges(listener);
      });

      test('non-matching table', () => {
        const store = createStore();
        store.setTablesSchema({t1: {c1: {type: 'number'}}});
        const listener = createStoreListener(store);
        listener.listenToRow('/t2/r1', 't2', 'r1');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        // @ts-ignore
        store.setRow('t2', 'r1', {c1: 1});
        expect(store.getTables()).toEqual({});
        expectChanges(listener, 'invalids', {t2: {r1: {c1: [1]}}});
        expectNoChanges(listener);
      });

      test('non-matching cell', () => {
        const store = createStore();
        store.setTablesSchema({t1: {c1: {type: 'number'}}});
        const listener = createStoreListener(store);
        listener.listenToRow('/t1/r1', 't1', 'r1');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        // @ts-ignore
        store.setRow('t1', 'r1', {c2: 1});
        expect(store.getTables()).toEqual({});
        expectChangesNoJson(
          listener,
          'invalids',
          {t1: {r1: {c1: [undefined]}}},
          {t1: {r1: {c2: [1]}}},
        );
        expectNoChanges(listener);
      });

      test('non-matching some cell types', () => {
        const store = createStore();
        store.setTablesSchema({t1: {c1: {type: 'number'}}});
        const listener = createStoreListener(store);
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToRow('/t1/r1', 't1', 'r1');
        listener.listenToRow('/t1/r2', 't1', 'r2');
        listener.listenToRow('/t1/r3', 't1', 'r3');
        listener.listenToInvalidCell('invalids', null, null, null);
        store
          .setRow('t1', 'r1', {c1: 1})
          // @ts-ignore
          .setRow('t1', 'r2', {c1: true})
          // @ts-ignore
          .setRow('t1', 'r3', {c1: 'a'});
        expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r*/c*', {t1: {r1: {c1: 1}}});
        expectChanges(
          listener,
          'invalids',
          {t1: {r2: {c1: [true]}}},
          {t1: {r3: {c1: ['a']}}},
        );
        expectNoChanges(listener);
      });

      test('non-matching some cell allows', () => {
        const store = createStore();
        addAllowCellMutator(store, 't1', 'c1', [1, 2, 3]);
        store.setTablesSchema({t1: {c1: {type: 'number'}}});
        const listener = createStoreListener(store);
        listener.listenToRow('/t1/r1', 't1', 'r1');
        listener.listenToRow('/t1/r2', 't1', 'r2');
        listener.listenToRow('/t1/r3', 't1', 'r3');
        listener.listenToRow('/t1/r4', 't1', 'r4');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        store
          .setRow('t1', 'r1', {c1: 2})
          .setRow('t1', 'r2', {c1: 4})
          .setRow('t1', 'r3', {c1: true})
          .setRow('t1', 'r4', {c1: 'a'});
        expect(store.getTables()).toEqual({t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t1/r1', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t*/r*/c*', {t1: {r1: {c1: 2}}});
        expectChanges(
          listener,
          'invalids',
          {t1: {r3: {c1: [true]}}},
          {t1: {r4: {c1: ['a']}}},
        );
        expectNoChanges(listener);
      });

      describe('non-matching some bounds', () => {
        test.each(cellBoundsSchemaAndExpected)(
          '%s',
          (
            _name,
            tablesSchema: TablesSchema,
            addMutator: AddMutator,
            expected: Tables<any>,
          ) => {
            const store = createStore();
            store.setTablesSchema(tablesSchema);
            addMutator(store);
            const listener = createStoreListener(store);
            listener.listenToRow('/t1/r1', 't1', 'r1');
            listener.listenToRow('/t1/r2', 't1', 'r2');
            listener.listenToRow('/t1/r3', 't1', 'r3');
            listener.listenToRow('/t1/r4', 't1', 'r4');
            listener.listenToRow('/t1/r5', 't1', 'r5');
            listener.listenToCell('/t*/r*/c*', null, null, null);
            store
              .setRow('t1', 'r1', {c1: 0})
              .setRow('t1', 'r2', {c1: 1})
              .setRow('t1', 'r3', {c1: 2})
              .setRow('t1', 'r4', {c1: true})
              .setRow('t1', 'r5', {c1: 'a'});
            expect(store.getTables()).toEqual(expected);
            expectChanges(listener, '/t1/r1', {t1: {r1: expected.t1?.r1}});
            expectChanges(listener, '/t1/r2', {t1: {r2: expected.t1?.r2}});
            expectChanges(listener, '/t1/r3', {t1: {r3: expected.t1?.r3}});
            expectChanges(
              listener,
              '/t*/r*/c*',
              {t1: {r1: {c1: expected.t1?.r1.c1}}},
              {t1: {r2: {c1: expected.t1?.r2.c1}}},
              {t1: {r3: {c1: expected.t1?.r3.c1}}},
            );
            if (expected.t1?.r4 != null) {
              expectChanges(listener, '/t1/r4', {t1: {r4: expected.t1?.r4}});
              expectChanges(listener, '/t*/r*/c*', {
                t1: {r4: {c1: expected.t1?.r4.c1}},
              });
            }
            if (expected.t1?.r5 != null) {
              expectChanges(listener, '/t1/r5', {t1: {r5: expected.t1?.r5}});
              expectChanges(listener, '/t*/r*/c*', {
                t1: {r5: {c1: expected.t1?.r5.c1}},
              });
            }
            expectNoChanges(listener);
          },
        );
      });

      test('non-matching some cell types, defaulting', () => {
        const store = createStore();
        store.setTablesSchema({
          t1: {c1: {type: 'number', default: 2}},
        });
        const listener = createStoreListener(store);
        listener.listenToRow('/t1/r1', 't1', 'r1');
        listener.listenToRow('/t1/r2', 't1', 'r2');
        listener.listenToRow('/t1/r3', 't1', 'r3');
        listener.listenToRow('/t1/r4', 't1', 'r4');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        store
          .setRow('t1', 'r1', {c1: 1})
          // @ts-ignore
          .setRow('t1', 'r2', {c1: true})
          // @ts-ignore
          .setRow('t1', 'r3', {c1: 'a'})
          .setRow('t1', 'r4', {});
        expect(store.getTables()).toEqual({
          t1: {r1: {c1: 1}, r2: {c1: 2}, r3: {c1: 2}, r4: {c1: 2}},
        });
        expectChanges(listener, '/t1/r1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r2', {t1: {r2: {c1: 2}}});
        expectChanges(listener, '/t1/r3', {t1: {r3: {c1: 2}}});
        expectChanges(listener, '/t1/r4', {t1: {r4: {c1: 2}}});
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {r1: {c1: 1}}},
          {t1: {r2: {c1: 2}}},
          {t1: {r3: {c1: 2}}},
          {t1: {r4: {c1: 2}}},
        );
        expectChanges(
          listener,
          'invalids',
          {t1: {r2: {c1: [true]}}},
          {t1: {r3: {c1: ['a']}}},
        );
        expectNoChanges(listener);
      });

      test('non-matching some cell types, default and allows', () => {
        const store = createStore();
        addAllowCellMutator(store, 't1', 'c1', [1, 3]);
        store.setTablesSchema({t1: {c1: {type: 'number', default: 2}}});
        const listener = createStoreListener(store);
        listener.listenToRow('/t1/r1', 't1', 'r1');
        listener.listenToRow('/t1/r2', 't1', 'r2');
        listener.listenToRow('/t1/r3', 't1', 'r3');
        listener.listenToRow('/t1/r4', 't1', 'r4');
        listener.listenToRow('/t1/r5', 't1', 'r5');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        store
          .setRow('t1', 'r1', {c1: 2})
          .setRow('t1', 'r2', {c1: 4})
          .setRow('t1', 'r3', {c1: true})
          .setRow('t1', 'r4', {c1: 'a'})
          .setRow('t1', 'r5', {c1: 3});
        expect(store.getTables()).toEqual({
          t1: {r1: {c1: 2}, r2: {c1: 2}, r3: {c1: 2}, r4: {c1: 2}, r5: {c1: 3}},
        });
        expectChanges(listener, '/t1/r1', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t1/r2', {t1: {r2: {c1: 2}}});
        expectChanges(listener, '/t1/r3', {t1: {r3: {c1: 2}}});
        expectChanges(listener, '/t1/r4', {t1: {r4: {c1: 2}}});
        expectChanges(listener, '/t1/r5', {t1: {r5: {c1: 3}}});
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {r1: {c1: 2}}},
          {t1: {r2: {c1: 2}}},
          {t1: {r3: {c1: 2}}},
          {t1: {r4: {c1: 2}}},
          {t1: {r5: {c1: 3}}},
        );
        expectChanges(
          listener,
          'invalids',
          {t1: {r3: {c1: [true]}}},
          {t1: {r4: {c1: ['a']}}},
        );
        expectNoChanges(listener);
      });

      test('Setting, changing', () => {
        const store = createStore();
        store
          .setTables({t1: {r1: {c1: 1}}})
          .setTablesSchema({t1: {c1: {type: 'number', default: 2}}});
        const listener = createStoreListener(store);
        listener.listenToRow('/t1/r1', 't1', 'r1');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        store
          .setRow('t1', 'r1', {c1: 3})
          // @ts-ignore
          .setRow('t1', 'r1', {c1: true})
          // @ts-ignore
          .setRow('t1', 'r1', {c1: 'a'});
        expect(store.getTables()).toEqual({
          t1: {r1: {c1: 2}},
        });
        expectChanges(
          listener,
          '/t1/r1',
          {t1: {r1: {c1: 3}}},
          {t1: {r1: {c1: 2}}},
        );
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {r1: {c1: 3}}},
          {t1: {r1: {c1: 2}}},
        );
        expectChanges(
          listener,
          'invalids',
          {t1: {r1: {c1: [true]}}},
          {t1: {r1: {c1: ['a']}}},
        );
        expectNoChanges(listener);
      });

      test('Deleting', () => {
        const store = createStore();
        store
          .setTables({t1: {r1: {c1: 1}}})
          .setTablesSchema({t1: {c1: {type: 'number', default: 2}}});
        const listener = createStoreListener(store);
        listener.listenToRow('/t1/r1', 't1', 'r1');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        store.delRow('t1', 'r1');
        expect(store.getTables()).toEqual({});
        expectChanges(listener, '/t1/r1', {t1: {r1: {}}});
        expectChanges(listener, '/t*/r*/c*', {t1: {r1: {c1: undefined}}});
        expectNoChanges(listener);
      });
    });

    describe('PartialRow', () => {
      test('matching', () => {
        const store = createStore();
        store.setTablesSchema({t1: {c1: {type: 'number'}}});
        const listener = createStoreListener(store);
        listener.listenToRow('/t1/r1', 't1', 'r1');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        store.setPartialRow('t1', 'r1', {c1: 1});
        expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r*/c*', {t1: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('default missing cell', () => {
        const store = createStore();
        store.setTablesSchema({
          t1: {c1: {type: 'number'}, c2: {type: 'number', default: 2}},
        });
        const listener = createStoreListener(store);
        listener.listenToRow('/t1/r1', 't1', 'r1');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        store.setPartialRow('t1', 'r1', {c1: 1});
        expect(store.getTables()).toEqual({t1: {r1: {c1: 1, c2: 2}}});
        expectChanges(listener, '/t1/r1', {t1: {r1: {c1: 1, c2: 2}}});
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {r1: {c1: 1}}},
          {t1: {r1: {c2: 2}}},
        );
        expectNoChanges(listener);
      });

      test('non-matching table', () => {
        const store = createStore();
        store.setTablesSchema({t1: {c1: {type: 'number'}}});
        const listener = createStoreListener(store);
        listener.listenToRow('/t2/r1', 't2', 'r1');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        // @ts-ignore
        store.setPartialRow('t2', 'r1', {c1: 1});
        expect(store.getTables()).toEqual({});
        expectChanges(listener, 'invalids', {t2: {r1: {c1: [1]}}});
        expectNoChanges(listener);
      });

      test('non-matching cell', () => {
        const store = createStore();
        store.setTablesSchema({t1: {c1: {type: 'number'}}});
        const listener = createStoreListener(store);
        listener.listenToRow('/t1/r1', 't1', 'r1');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        // @ts-ignore
        store.setPartialRow('t1', 'r1', {c2: 1});
        expect(store.getTables()).toEqual({});
        expectChanges(listener, 'invalids', {t1: {r1: {c2: [1]}}});
        expectNoChanges(listener);
      });

      test('non-matching some cell types', () => {
        const store = createStore();
        store.setTablesSchema({t1: {c1: {type: 'number'}}});
        const listener = createStoreListener(store);
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToRow('/t1/r1', 't1', 'r1');
        listener.listenToRow('/t1/r2', 't1', 'r2');
        listener.listenToRow('/t1/r3', 't1', 'r3');
        listener.listenToInvalidCell('invalids', null, null, null);
        store
          .setPartialRow('t1', 'r1', {c1: 1})
          // @ts-ignore
          .setPartialRow('t1', 'r2', {c1: true})
          // @ts-ignore
          .setPartialRow('t1', 'r3', {c1: 'a'});
        expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r*/c*', {t1: {r1: {c1: 1}}});
        expectChanges(
          listener,
          'invalids',
          {t1: {r2: {c1: [true]}}},
          {t1: {r3: {c1: ['a']}}},
        );
        expectNoChanges(listener);
      });

      test('non-matching some cell allows', () => {
        const store = createStore();
        addAllowCellMutator(store, 't1', 'c1', [1, 2, 3]);
        store.setTablesSchema({t1: {c1: {type: 'number'}}});
        const listener = createStoreListener(store);
        listener.listenToRow('/t1/r1', 't1', 'r1');
        listener.listenToRow('/t1/r2', 't1', 'r2');
        listener.listenToRow('/t1/r3', 't1', 'r3');
        listener.listenToRow('/t1/r4', 't1', 'r4');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        store
          .setPartialRow('t1', 'r1', {c1: 2})
          .setPartialRow('t1', 'r2', {c1: 4})
          .setPartialRow('t1', 'r3', {c1: true})
          .setPartialRow('t1', 'r4', {c1: 'a'});
        expect(store.getTables()).toEqual({t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t1/r1', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t*/r*/c*', {t1: {r1: {c1: 2}}});
        expectChanges(
          listener,
          'invalids',
          {t1: {r3: {c1: [true]}}},
          {t1: {r4: {c1: ['a']}}},
        );
        expectNoChanges(listener);
      });

      describe('non-matching some bounds', () => {
        test.each(cellBoundsSchemaAndExpected)(
          '%s',
          (
            _name,
            tablesSchema: TablesSchema,
            addMutator: AddMutator,
            expected: Tables<any>,
          ) => {
            const store = createStore();
            store.setTablesSchema(tablesSchema);
            addMutator(store);
            const listener = createStoreListener(store);
            listener.listenToRow('/t1/r1', 't1', 'r1');
            listener.listenToRow('/t1/r2', 't1', 'r2');
            listener.listenToRow('/t1/r3', 't1', 'r3');
            listener.listenToRow('/t1/r4', 't1', 'r4');
            listener.listenToRow('/t1/r5', 't1', 'r5');
            listener.listenToCell('/t*/r*/c*', null, null, null);
            store
              .setPartialRow('t1', 'r1', {c1: 0})
              .setPartialRow('t1', 'r2', {c1: 1})
              .setPartialRow('t1', 'r3', {c1: 2})
              .setPartialRow('t1', 'r4', {c1: true})
              .setPartialRow('t1', 'r5', {c1: 'a'});
            expect(store.getTables()).toEqual(expected);
            expectChanges(listener, '/t1/r1', {t1: {r1: expected.t1?.r1}});
            expectChanges(listener, '/t1/r2', {t1: {r2: expected.t1?.r2}});
            expectChanges(listener, '/t1/r3', {t1: {r3: expected.t1?.r3}});
            expectChanges(
              listener,
              '/t*/r*/c*',
              {t1: {r1: {c1: expected.t1?.r1.c1}}},
              {t1: {r2: {c1: expected.t1?.r2.c1}}},
              {t1: {r3: {c1: expected.t1?.r3.c1}}},
            );
            if (expected.t1?.r4 != null) {
              expectChanges(listener, '/t1/r4', {t1: {r4: expected.t1?.r4}});
              expectChanges(listener, '/t*/r*/c*', {
                t1: {r4: {c1: expected.t1?.r4.c1}},
              });
            }
            if (expected.t1?.r5 != null) {
              expectChanges(listener, '/t1/r5', {t1: {r5: expected.t1?.r5}});
              expectChanges(listener, '/t*/r*/c*', {
                t1: {r5: {c1: expected.t1?.r5.c1}},
              });
            }
            expectNoChanges(listener);
          },
        );
      });

      test('non-matching some cell types, defaulting', () => {
        const store = createStore();
        store.setTablesSchema({
          t1: {c1: {type: 'number', default: 2}},
        });
        const listener = createStoreListener(store);
        listener.listenToRow('/t1/r1', 't1', 'r1');
        listener.listenToRow('/t1/r2', 't1', 'r2');
        listener.listenToRow('/t1/r3', 't1', 'r3');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        store
          .setPartialRow('t1', 'r1', {c1: 1})
          // @ts-ignore
          .setPartialRow('t1', 'r2', {c1: true})
          // @ts-ignore
          .setPartialRow('t1', 'r3', {c1: 'a'});
        expect(store.getTables()).toEqual({
          t1: {r1: {c1: 1}, r2: {c1: 2}, r3: {c1: 2}},
        });
        expectChanges(listener, '/t1/r1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r2', {t1: {r2: {c1: 2}}});
        expectChanges(listener, '/t1/r3', {t1: {r3: {c1: 2}}});
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {r1: {c1: 1}}},
          {t1: {r2: {c1: 2}}},
          {t1: {r3: {c1: 2}}},
        );
        expectChanges(
          listener,
          'invalids',
          {t1: {r2: {c1: [true]}}},
          {t1: {r3: {c1: ['a']}}},
        );
        expectNoChanges(listener);
      });

      test('non-matching some cell types, default and allows', () => {
        const store = createStore();
        addAllowCellMutator(store, 't1', 'c1', [1, 3]);
        store.setTablesSchema({t1: {c1: {type: 'number', default: 2}}});
        const listener = createStoreListener(store);
        listener.listenToRow('/t1/r1', 't1', 'r1');
        listener.listenToRow('/t1/r2', 't1', 'r2');
        listener.listenToRow('/t1/r3', 't1', 'r3');
        listener.listenToRow('/t1/r4', 't1', 'r4');
        listener.listenToRow('/t1/r5', 't1', 'r5');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        store
          .setPartialRow('t1', 'r1', {c1: 2})
          .setPartialRow('t1', 'r2', {c1: 4})
          .setPartialRow('t1', 'r3', {c1: true})
          .setPartialRow('t1', 'r4', {c1: 'a'})
          .setPartialRow('t1', 'r5', {c1: 3});
        expect(store.getTables()).toEqual({
          t1: {r1: {c1: 2}, r2: {c1: 2}, r3: {c1: 2}, r4: {c1: 2}, r5: {c1: 3}},
        });
        expectChanges(listener, '/t1/r1', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t1/r2', {t1: {r2: {c1: 2}}});
        expectChanges(listener, '/t1/r3', {t1: {r3: {c1: 2}}});
        expectChanges(listener, '/t1/r4', {t1: {r4: {c1: 2}}});
        expectChanges(listener, '/t1/r5', {t1: {r5: {c1: 3}}});
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {r1: {c1: 2}}},
          {t1: {r2: {c1: 2}}},
          {t1: {r3: {c1: 2}}},
          {t1: {r4: {c1: 2}}},
          {t1: {r5: {c1: 3}}},
        );
        expectNoChanges(listener);
      });

      test('Setting, changing', () => {
        const store = createStore();
        store
          .setTables({t1: {r1: {c1: 1}}})
          .setTablesSchema({t1: {c1: {type: 'number', default: 2}}});
        const listener = createStoreListener(store);
        listener.listenToRow('/t1/r1', 't1', 'r1');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        store
          .setPartialRow('t1', 'r1', {c1: 3})
          // @ts-ignore
          .setPartialRow('t1', 'r1', {c1: true})
          // @ts-ignore
          .setPartialRow('t1', 'r1', {c1: 'a'});
        expect(store.getTables()).toEqual({
          t1: {r1: {c1: 2}},
        });
        expectChanges(
          listener,
          '/t1/r1',
          {t1: {r1: {c1: 3}}},
          {t1: {r1: {c1: 2}}},
        );
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {r1: {c1: 3}}},
          {t1: {r1: {c1: 2}}},
        );
        expectChanges(
          listener,
          'invalids',
          {t1: {r1: {c1: [true]}}},
          {t1: {r1: {c1: ['a']}}},
        );
        expectNoChanges(listener);
      });

      test('Deleting', () => {
        const store = createStore();
        store
          .setTables({t1: {r1: {c1: 1}}})
          .setTablesSchema({t1: {c1: {type: 'number', default: 2}}});
        const listener = createStoreListener(store);
        listener.listenToRow('/t1/r1', 't1', 'r1');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        store.delRow('t1', 'r1');
        expect(store.getTables()).toEqual({});
        expectChanges(listener, '/t1/r1', {t1: {r1: {}}});
        expectChanges(listener, '/t*/r*/c*', {t1: {r1: {c1: undefined}}});
        expectNoChanges(listener);
      });
    });

    describe('Cell', () => {
      test('matching', () => {
        const store = createStore();
        store.setTablesSchema({t1: {c1: {type: 'number'}}});
        const listener = createStoreListener(store);
        listener.listenToCell('/t1/r1/c1', 't1', 'r1', 'c1');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        store.setCell('t1', 'r1', 'c1', 1);
        expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r*/c*', {t1: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('default missing cell', () => {
        const store = createStore();
        store.setTablesSchema({
          t1: {c1: {type: 'number'}, c2: {type: 'number', default: 2}},
        });
        const listener = createStoreListener(store);
        listener.listenToCell('/t1/r1/c1', 't1', 'r1', 'c1');
        listener.listenToCell('/t1/r1/c2', 't1', 'r1', 'c2');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        store.setCell('t1', 'r1', 'c1', 1);
        expect(store.getTables()).toEqual({t1: {r1: {c1: 1, c2: 2}}});
        expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r1/c2', {t1: {r1: {c2: 2}}});
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {r1: {c1: 1}}},
          {t1: {r1: {c2: 2}}},
        );
        expectNoChanges(listener);
      });

      test('non-matching table', () => {
        const store = createStore();
        store.setTablesSchema({t1: {c1: {type: 'number'}}});
        const listener = createStoreListener(store);
        listener.listenToCell('/t2/r1/c1', 't2', 'r1', 'c1');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        // @ts-ignore
        store.setCell('t2', 'r1', 'c1', 1);
        expect(store.getTables()).toEqual({});
        expectChanges(listener, 'invalids', {t2: {r1: {c1: [1]}}});
        expectNoChanges(listener);
      });

      test('non-matching cell', () => {
        const store = createStore();
        store.setTablesSchema({t1: {c1: {type: 'number'}}});
        const listener = createStoreListener(store);
        listener.listenToCell('t1/r1/c2', 't1', 'r1', 'c2');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        // @ts-ignore
        store.setCell('t1', 'r1', 'c2', 1);
        expect(store.getTables()).toEqual({});
        expectChanges(listener, 'invalids', {t1: {r1: {c2: [1]}}});
        expectNoChanges(listener);
      });

      describe('non-matching some cell types', () => {
        test('to number', () => {
          const store = createStore();
          store.setTablesSchema({
            t1: {c1: {type: 'number'}},
          });
          const listener = createStoreListener(store);
          listener.listenToCell('/t1/r1/c1', 't1', 'r1', 'c1');
          listener.listenToCell('/t1/r2/c1', 't1', 'r2', 'c1');
          listener.listenToCell('/t1/r3/c1', 't1', 'r3', 'c1');
          listener.listenToCell('/t*/r*/c*', null, null, null);
          listener.listenToInvalidCell('invalids', null, null, null);
          store
            .setCell('t1', 'r1', 'c1', 1)
            // @ts-ignore
            .setCell('t1', 'r2', 'c1', true)
            // @ts-ignore
            .setCell('t1', 'r3', 'c1', '1');
          expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
          expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: 1}}});
          expectChanges(listener, '/t*/r*/c*', {t1: {r1: {c1: 1}}});
          expectChanges(
            listener,
            'invalids',
            {t1: {r2: {c1: [true]}}},
            {t1: {r3: {c1: ['1']}}},
          );
          expectNoChanges(listener);
        });

        test('to boolean', () => {
          const store = createStore();
          store.setTablesSchema({
            t1: {c1: {type: 'boolean'}},
          });
          const listener = createStoreListener(store);
          listener.listenToCell('/t1/r1/c1', 't1', 'r1', 'c1');
          listener.listenToCell('/t1/r2/c1', 't1', 'r2', 'c1');
          listener.listenToCell('/t1/r3/c1', 't1', 'r3', 'c1');
          listener.listenToCell('/t*/r*/c*', null, null, null);
          listener.listenToInvalidCell('invalids', null, null, null);
          store
            // @ts-ignore
            .setCell('t1', 'r1', 'c1', 1)
            .setCell('t1', 'r2', 'c1', true)
            // @ts-ignore
            .setCell('t1', 'r3', 'c1', 'true');
          expect(store.getTables()).toEqual({t1: {r2: {c1: true}}});
          expectChanges(listener, '/t1/r2/c1', {t1: {r2: {c1: true}}});
          expectChanges(listener, '/t*/r*/c*', {t1: {r2: {c1: true}}});
          expectChanges(
            listener,
            'invalids',
            {t1: {r1: {c1: [1]}}},
            {t1: {r3: {c1: ['true']}}},
          );
          expectNoChanges(listener);
        });

        test('to string', () => {
          const store = createStore();
          store.setTablesSchema({
            t1: {c1: {type: 'string'}},
          });
          const listener = createStoreListener(store);
          listener.listenToCell('/t1/r1/c1', 't1', 'r1', 'c1');
          listener.listenToCell('/t1/r2/c1', 't1', 'r2', 'c1');
          listener.listenToCell('/t1/r3/c1', 't1', 'r3', 'c1');
          listener.listenToCell('/t*/r*/c*', null, null, null);
          listener.listenToInvalidCell('invalids', null, null, null);
          store
            // @ts-ignore
            .setCell('t1', 'r1', 'c1', 1)
            // @ts-ignore
            .setCell('t1', 'r2', 'c1', true)
            .setCell('t1', 'r3', 'c1', '1');
          expect(store.getTables()).toEqual({t1: {r3: {c1: '1'}}});
          expectChanges(listener, '/t1/r3/c1', {t1: {r3: {c1: '1'}}});
          expectChanges(listener, '/t*/r*/c*', {t1: {r3: {c1: '1'}}});
          expectChanges(
            listener,
            'invalids',
            {t1: {r1: {c1: [1]}}},
            {t1: {r2: {c1: [true]}}},
          );
          expectNoChanges(listener);
        });

        test('to number allow', () => {
          const store = createStore();
          store.setTablesSchema({
            t1: {c1: {type: 'number'}},
          });
          addAllowCellMutator(store, 't1', 'c1', [1, 2, 3]);
          const listener = createStoreListener(store);
          listener.listenToCell('/t1/r1/c1', 't1', 'r1', 'c1');
          listener.listenToCell('/t1/r2/c1', 't1', 'r2', 'c1');
          listener.listenToCell('/t1/r3/c1', 't1', 'r3', 'c1');
          listener.listenToCell('/t1/r4/c1', 't1', 'r4', 'c1');
          listener.listenToCell('/t*/r*/c*', null, null, null);
          listener.listenToInvalidCell('invalids', null, null, null);
          store
            .setCell('t1', 'r1', 'c1', 1)
            // @ts-ignore
            .setCell('t1', 'r2', 'c1', true)
            // @ts-ignore
            .setCell('t1', 'r3', 'c1', '1')
            .setCell('t1', 'r4', 'c1', 4);
          expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
          expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: 1}}});
          expectChanges(listener, '/t*/r*/c*', {t1: {r1: {c1: 1}}});
          expectChanges(
            listener,
            'invalids',
            {t1: {r2: {c1: [true]}}},
            {t1: {r3: {c1: ['1']}}},
          );
          expectNoChanges(listener);
        });

        test('to boolean allow', () => {
          const store = createStore();
          store.setTablesSchema({
            t1: {c1: {type: 'boolean'}},
          });
          addAllowCellMutator<boolean>(store, 't1', 'c1', [true]);
          const listener = createStoreListener(store);
          listener.listenToCell('/t1/r1/c1', 't1', 'r1', 'c1');
          listener.listenToCell('/t1/r2/c1', 't1', 'r2', 'c1');
          listener.listenToCell('/t1/r3/c1', 't1', 'r3', 'c1');
          listener.listenToCell('/t1/r4/c1', 't1', 'r4', 'c1');
          listener.listenToCell('/t*/r*/c*', null, null, null);
          listener.listenToInvalidCell('invalids', null, null, null);
          store
            // @ts-ignore
            .setCell('t1', 'r1', 'c1', 1)
            .setCell('t1', 'r2', 'c1', true)
            // @ts-ignore
            .setCell('t1', 'r3', 'c1', 'true')
            .setCell('t1', 'r4', 'c1', false);
          expect(store.getTables()).toEqual({t1: {r2: {c1: true}}});
          expectChanges(listener, '/t1/r2/c1', {t1: {r2: {c1: true}}});
          expectChanges(listener, '/t*/r*/c*', {t1: {r2: {c1: true}}});
          expectChanges(
            listener,
            'invalids',
            {t1: {r1: {c1: [1]}}},
            {t1: {r3: {c1: ['true']}}},
          );
          expectNoChanges(listener);
        });

        test('to string allow', () => {
          const store = createStore();
          store.setTablesSchema({
            t1: {c1: {type: 'string'}},
          });
          addAllowCellMutator(store, 't1', 'c1', ['true', '1']);
          const listener = createStoreListener(store);
          listener.listenToCell('/t1/r1/c1', 't1', 'r1', 'c1');
          listener.listenToCell('/t1/r2/c1', 't1', 'r2', 'c1');
          listener.listenToCell('/t1/r3/c1', 't1', 'r3', 'c1');
          listener.listenToCell('/t1/r4/c1', 't1', 'r4', 'c1');
          listener.listenToCell('/t*/r*/c*', null, null, null);
          listener.listenToInvalidCell('invalids', null, null, null);
          store
            // @ts-ignore
            .setCell('t1', 'r1', 'c1', 1)
            // @ts-ignore
            .setCell('t1', 'r2', 'c1', true)
            .setCell('t1', 'r3', 'c1', '1')
            .setCell('t1', 'r4', 'c1', 't1');
          expect(store.getTables()).toEqual({t1: {r3: {c1: '1'}}});
          expectChanges(listener, '/t1/r3/c1', {t1: {r3: {c1: '1'}}});
          expectChanges(listener, '/t*/r*/c*', {t1: {r3: {c1: '1'}}});
          expectChanges(
            listener,
            'invalids',
            {t1: {r1: {c1: [1]}}},
            {t1: {r2: {c1: [true]}}},
          );
          expectNoChanges(listener);
        });
      });

      describe('non-matching some cell types, defaulting', () => {
        test('to number', () => {
          const store = createStore();
          store.setTablesSchema({
            t1: {c1: {type: 'number', default: 2}},
          });
          const listener = createStoreListener(store);
          listener.listenToCell('/t1/r1/c1', 't1', 'r1', 'c1');
          listener.listenToCell('/t1/r2/c1', 't1', 'r2', 'c1');
          listener.listenToCell('/t1/r3/c1', 't1', 'r3', 'c1');
          listener.listenToCell('/t*/r*/c*', null, null, null);
          listener.listenToInvalidCell('invalids', null, null, null);
          store
            .setCell('t1', 'r1', 'c1', 1)
            // @ts-ignore
            .setCell('t1', 'r2', 'c1', true)
            // @ts-ignore
            .setCell('t1', 'r3', 'c1', '1');
          expect(store.getTables()).toEqual({
            t1: {r1: {c1: 1}, r2: {c1: 2}, r3: {c1: 2}},
          });
          expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: 1}}});
          expectChanges(listener, '/t1/r2/c1', {t1: {r2: {c1: 2}}});
          expectChanges(listener, '/t1/r3/c1', {t1: {r3: {c1: 2}}});
          expectChanges(
            listener,
            '/t*/r*/c*',
            {t1: {r1: {c1: 1}}},
            {t1: {r2: {c1: 2}}},
            {t1: {r3: {c1: 2}}},
          );
          expectChanges(
            listener,
            'invalids',
            {t1: {r2: {c1: [true]}}},
            {t1: {r3: {c1: ['1']}}},
          );
          expectNoChanges(listener);
        });

        test('to boolean', () => {
          const store = createStore();
          store.setTablesSchema({
            t1: {c1: {type: 'boolean', default: false}},
          });
          const listener = createStoreListener(store);
          listener.listenToCell('/t1/r1/c1', 't1', 'r1', 'c1');
          listener.listenToCell('/t1/r2/c1', 't1', 'r2', 'c1');
          listener.listenToCell('/t1/r3/c1', 't1', 'r3', 'c1');
          listener.listenToCell('/t*/r*/c*', null, null, null);
          listener.listenToInvalidCell('invalids', null, null, null);
          store
            // @ts-ignore
            .setCell('t1', 'r1', 'c1', 1)
            .setCell('t1', 'r2', 'c1', true)
            // @ts-ignore
            .setCell('t1', 'r3', 'c1', 'true');
          expect(store.getTables()).toEqual({
            t1: {r1: {c1: false}, r2: {c1: true}, r3: {c1: false}},
          });
          expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: false}}});
          expectChanges(listener, '/t1/r2/c1', {t1: {r2: {c1: true}}});
          expectChanges(listener, '/t1/r3/c1', {t1: {r3: {c1: false}}});
          expectChanges(
            listener,
            '/t*/r*/c*',
            {t1: {r1: {c1: false}}},
            {t1: {r2: {c1: true}}},
            {t1: {r3: {c1: false}}},
          );
          expectChanges(
            listener,
            'invalids',
            {t1: {r1: {c1: [1]}}},
            {t1: {r3: {c1: ['true']}}},
          );
          expectNoChanges(listener);
        });

        test('to string', () => {
          const store = createStore();
          store.setTablesSchema({
            t1: {c1: {type: 'string', default: '2'}},
          });
          const listener = createStoreListener(store);
          listener.listenToCell('/t1/r1/c1', 't1', 'r1', 'c1');
          listener.listenToCell('/t1/r2/c1', 't1', 'r2', 'c1');
          listener.listenToCell('/t1/r3/c1', 't1', 'r3', 'c1');
          listener.listenToCell('/t*/r*/c*', null, null, null);
          listener.listenToInvalidCell('invalids', null, null, null);
          store
            // @ts-ignore
            .setCell('t1', 'r1', 'c1', 1)
            // @ts-ignore
            .setCell('t1', 'r2', 'c1', true)
            .setCell('t1', 'r3', 'c1', '1');
          expect(store.getTables()).toEqual({
            t1: {r1: {c1: '2'}, r2: {c1: '2'}, r3: {c1: '1'}},
          });
          expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: '2'}}});
          expectChanges(listener, '/t1/r2/c1', {t1: {r2: {c1: '2'}}});
          expectChanges(listener, '/t1/r3/c1', {t1: {r3: {c1: '1'}}});
          expectChanges(
            listener,
            '/t*/r*/c*',
            {t1: {r1: {c1: '2'}}},
            {t1: {r2: {c1: '2'}}},
            {t1: {r3: {c1: '1'}}},
          );
          expectChanges(
            listener,
            'invalids',
            {t1: {r1: {c1: [1]}}},
            {t1: {r2: {c1: [true]}}},
          );
          expectNoChanges(listener);
        });

        test('to number allow', () => {
          const store = createStore();
          store.setTablesSchema({
            t1: {c1: {type: 'number', default: 2}},
          });
          addAllowCellMutator(store, 't1', 'c1', [1, 3]);
          const listener = createStoreListener(store);
          listener.listenToCell('/t1/r1/c1', 't1', 'r1', 'c1');
          listener.listenToCell('/t1/r2/c1', 't1', 'r2', 'c1');
          listener.listenToCell('/t1/r3/c1', 't1', 'r3', 'c1');
          listener.listenToCell('/t1/r4/c1', 't1', 'r4', 'c1');
          listener.listenToCell('/t*/r*/c*', null, null, null);
          listener.listenToInvalidCell('invalids', null, null, null);
          store
            .setCell('t1', 'r1', 'c1', 1)
            // @ts-ignore
            .setCell('t1', 'r2', 'c1', true)
            // @ts-ignore
            .setCell('t1', 'r3', 'c1', '1')
            .setCell('t1', 'r4', 'c1', 4);
          expect(store.getTables()).toEqual({
            t1: {r1: {c1: 1}, r2: {c1: 2}, r3: {c1: 2}, r4: {c1: 2}},
          });
          expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: 1}}});
          expectChanges(listener, '/t1/r2/c1', {t1: {r2: {c1: 2}}});
          expectChanges(listener, '/t1/r3/c1', {t1: {r3: {c1: 2}}});
          expectChanges(listener, '/t1/r4/c1', {t1: {r4: {c1: 2}}});
          expectChanges(
            listener,
            '/t*/r*/c*',
            {t1: {r1: {c1: 1}}},
            {t1: {r2: {c1: 2}}},
            {t1: {r3: {c1: 2}}},
            {t1: {r4: {c1: 2}}},
          );
          expectChanges(
            listener,
            'invalids',
            {t1: {r2: {c1: [true]}}},
            {t1: {r3: {c1: ['1']}}},
          );
          expectNoChanges(listener);
        });

        test('to boolean allow', () => {
          const store = createStore();
          store.setTablesSchema({
            t1: {
              c1: {
                type: 'boolean',
                default: false,
              },
            },
          });
          addAllowCellMutator<boolean>(store, 't1', 'c1', [false]);
          const listener = createStoreListener(store);
          listener.listenToCell('/t1/r1/c1', 't1', 'r1', 'c1');
          listener.listenToCell('/t1/r2/c1', 't1', 'r2', 'c1');
          listener.listenToCell('/t1/r3/c1', 't1', 'r3', 'c1');
          listener.listenToCell('/t1/r4/c1', 't1', 'r4', 'c1');
          listener.listenToCell('/t*/r*/c*', null, null, null);
          listener.listenToInvalidCell('invalids', null, null, null);
          store
            // @ts-ignore
            .setCell('t1', 'r1', 'c1', 1)
            .setCell('t1', 'r2', 'c1', true)
            // @ts-ignore
            .setCell('t1', 'r3', 'c1', 'true')
            .setCell('t1', 'r4', 'c1', false);
          expect(store.getTables()).toEqual({
            t1: {
              r1: {c1: false},
              r2: {c1: false},
              r3: {c1: false},
              r4: {c1: false},
            },
          });
          expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: false}}});
          expectChanges(listener, '/t1/r2/c1', {t1: {r2: {c1: false}}});
          expectChanges(listener, '/t1/r3/c1', {t1: {r3: {c1: false}}});
          expectChanges(listener, '/t1/r4/c1', {t1: {r4: {c1: false}}});
          expectChanges(
            listener,
            '/t*/r*/c*',
            {t1: {r1: {c1: false}}},
            {t1: {r2: {c1: false}}},
            {t1: {r3: {c1: false}}},
            {t1: {r4: {c1: false}}},
          );
          expectChanges(
            listener,
            'invalids',
            {t1: {r1: {c1: [1]}}},
            {t1: {r3: {c1: ['true']}}},
          );
          expectNoChanges(listener);
        });

        test('to string allow', () => {
          const store = createStore();
          store.setTablesSchema({
            t1: {
              c1: {
                type: 'string',
                default: '2',
              },
            },
          });
          addAllowCellMutator(store, 't1', 'c1', ['true', '1']);
          const listener = createStoreListener(store);
          listener.listenToCell('/t1/r1/c1', 't1', 'r1', 'c1');
          listener.listenToCell('/t1/r2/c1', 't1', 'r2', 'c1');
          listener.listenToCell('/t1/r3/c1', 't1', 'r3', 'c1');
          listener.listenToCell('/t1/r4/c1', 't1', 'r4', 'c1');
          listener.listenToCell('/t*/r*/c*', null, null, null);
          listener.listenToInvalidCell('invalids', null, null, null);
          store
            // @ts-ignore
            .setCell('t1', 'r1', 'c1', 1)
            // @ts-ignore
            .setCell('t1', 'r2', 'c1', true)
            .setCell('t1', 'r3', 'c1', '1')
            .setCell('t1', 'r4', 'c1', '2');
          expect(store.getTables()).toEqual({
            t1: {r1: {c1: '2'}, r2: {c1: '2'}, r3: {c1: '1'}, r4: {c1: '2'}},
          });
          expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: '2'}}});
          expectChanges(listener, '/t1/r2/c1', {t1: {r2: {c1: '2'}}});
          expectChanges(listener, '/t1/r3/c1', {t1: {r3: {c1: '1'}}});
          expectChanges(listener, '/t1/r4/c1', {t1: {r4: {c1: '2'}}});
          expectChanges(
            listener,
            '/t*/r*/c*',
            {t1: {r1: {c1: '2'}}},
            {t1: {r2: {c1: '2'}}},
            {t1: {r3: {c1: '1'}}},
            {t1: {r4: {c1: '2'}}},
          );
          expectChanges(
            listener,
            'invalids',
            {t1: {r1: {c1: [1]}}},
            {t1: {r2: {c1: [true]}}},
          );
          expectNoChanges(listener);
        });
      });

      describe('non-matching bounds', () => {
        test.each(cellBoundsSchemaAndExpected)(
          '%s',
          (
            _name,
            tablesSchema: TablesSchema,
            addMutator: AddMutator,
            expected: Tables<any>,
          ) => {
            const store = createStore();
            store.setTablesSchema(tablesSchema);
            addMutator(store);
            const listener = createStoreListener(store);
            listener.listenToCell('/t1/r1/c1', 't1', 'r1', 'c1');
            listener.listenToCell('/t1/r2/c1', 't1', 'r2', 'c1');
            listener.listenToCell('/t1/r3/c1', 't1', 'r3', 'c1');
            listener.listenToCell('/t1/r4/c1', 't1', 'r4', 'c1');
            listener.listenToCell('/t1/r5/c1', 't1', 'r5', 'c1');
            listener.listenToCell('/t*/r*/c*', null, null, null);
            store
              .setCell('t1', 'r1', 'c1', 0)
              .setCell('t1', 'r2', 'c1', 1)
              .setCell('t1', 'r3', 'c1', 2)
              .setCell('t1', 'r4', 'c1', true)
              .setCell('t1', 'r5', 'c1', 't1');
            expect(store.getTables()).toEqual(expected);
            expectChanges(listener, '/t1/r1/c1', {
              t1: {r1: {c1: expected.t1?.r1.c1}},
            });
            expectChanges(listener, '/t1/r2/c1', {
              t1: {r2: {c1: expected.t1?.r2.c1}},
            });
            expectChanges(listener, '/t1/r3/c1', {
              t1: {r3: {c1: expected.t1?.r3.c1}},
            });
            expectChanges(
              listener,
              '/t*/r*/c*',
              {t1: {r1: {c1: expected.t1?.r1.c1}}},
              {t1: {r2: {c1: expected.t1?.r2.c1}}},
              {t1: {r3: {c1: expected.t1?.r3.c1}}},
            );
            if (expected.t1?.r4 != null) {
              expectChanges(listener, '/t1/r4/c1', {
                t1: {r4: {c1: expected.t1?.r4.c1}},
              });
              expectChanges(listener, '/t*/r*/c*', {
                t1: {r4: {c1: expected.t1?.r4.c1}},
              });
            }
            if (expected.t1?.r5 != null) {
              expectChanges(listener, '/t1/r5/c1', {
                t1: {r5: {c1: expected.t1?.r5.c1}},
              });
              expectChanges(listener, '/t*/r*/c*', {
                t1: {r5: {c1: expected.t1?.r5.c1}},
              });
            }
            expectNoChanges(listener);
          },
        );
      });

      test('Setting, changing', () => {
        const store = createStore();
        store
          .setTables({t1: {r1: {c1: 1}}})
          .setTablesSchema({t1: {c1: {type: 'number', default: 2}}});
        const listener = createStoreListener(store);
        listener.listenToCell('/t1/r1/c1', 't1', 'r1', 'c1');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        store
          .setCell('t1', 'r1', 'c1', 3)
          // @ts-ignore
          .setCell('t1', 'r1', 'c1', true)
          // @ts-ignore
          .setCell('t1', 'r1', 'c1', 't1');
        expect(store.getTables()).toEqual({
          t1: {r1: {c1: 2}},
        });
        expectChanges(
          listener,
          '/t1/r1/c1',
          {t1: {r1: {c1: 3}}},
          {t1: {r1: {c1: 2}}},
        );
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {r1: {c1: 3}}},
          {t1: {r1: {c1: 2}}},
        );
        expectChanges(
          listener,
          'invalids',
          {t1: {r1: {c1: [true]}}},
          {t1: {r1: {c1: ['t1']}}},
        );
        expectNoChanges(listener);
      });

      test('Deleting', () => {
        const store = createStore();
        store.setTables({t1: {r1: {c1: 1, c2: 3}}}).setTablesSchema({
          t1: {c1: {type: 'number', default: 2}, c2: {type: 'number'}},
        });
        const listener = createStoreListener(store);
        listener.listenToCell('/t1/r1/c1', 't1', 'r1', 'c1');
        listener.listenToCell('/t1/r1/c2', 't1', 'r1', 'c2');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        store.delCell('t1', 'r1', 'c1');
        expect(store.getTables()).toEqual({
          t1: {r1: {c1: 2, c2: 3}},
        });
        expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t*/r*/c*', {t1: {r1: {c1: 2}}});
        expectNoChanges(listener);
      });

      test('Deleting, forced', () => {
        const store = createStore();
        store.setTables({t1: {r1: {c1: 1, c2: 3}}}).setTablesSchema({
          t1: {c1: {type: 'number', default: 2}, c2: {type: 'number'}},
        });
        const listener = createStoreListener(store);
        listener.listenToCell('/t1/r1/c1', 't1', 'r1', 'c1');
        listener.listenToCell('/t1/r1/c2', 't1', 'r1', 'c2');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        store.delCell('t1', 'r1', 'c1', true);
        expect(store.getTables()).toEqual({});
        expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: undefined}}});
        expectChanges(listener, '/t1/r1/c2', {t1: {r1: {c2: undefined}}});
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {r1: {c1: undefined}}},
          {t1: {r1: {c2: undefined}}},
        );
        expectNoChanges(listener);
      });
    });
  });

  describe('valuesSchemas applied before data set, listening', () => {
    describe('Values', () => {
      test('matching', () => {
        const store = createStore();
        store.setValuesSchema({v1: {type: 'number'}});
        const listener = createStoreListener(store);
        listener.listenToValues('/');
        listener.listenToValue('/v*', null);
        listener.listenToInvalidValue('invalids', null);
        store.setValues({v1: 1});
        expect(store.getValues()).toEqual({v1: 1});
        expectChanges(listener, '/', {v1: 1});
        expectChanges(listener, '/v*', {v1: 1});
        expectNoChanges(listener);
      });

      test('non-matching value', () => {
        const store = createStore();
        store.setValuesSchema({v1: {type: 'number'}});
        const listener = createStoreListener(store);
        listener.listenToValues('/');
        listener.listenToValue('/v*', null);
        listener.listenToInvalidValue('invalids', null);
        // @ts-ignore
        store.setValues({v1: 1, v2: 2});
        expect(store.getValues()).toEqual({v1: 1});
        expectChanges(listener, '/', {v1: 1});
        expectChanges(listener, '/v*', {v1: 1});
        expectChanges(listener, 'invalids', {v2: [2]});
        expectNoChanges(listener);
      });

      test('non-matching some value types, defaulting', () => {
        const store = createStore();
        store.setValuesSchema({
          v1: {type: 'number', default: 2},
        });
        const listener = createStoreListener(store);
        listener.listenToValues('/');
        listener.listenToValue('/v*', null);
        listener.listenToInvalidValue('invalids', null);
        store.setValues({v1: 1});
        expect(store.getValues()).toEqual({v1: 1});
        // @ts-ignore
        store.setValues({v1: true});
        expect(store.getValues()).toEqual({v1: 2});
        // @ts-ignore
        store.setValues({v1: 'a'});
        expect(store.getValues()).toEqual({v1: 2});
        expectChanges(listener, '/', {v1: 1}, {v1: 2});
        expectChanges(listener, '/v*', {v1: 1}, {v1: 2});
        expectChanges(listener, 'invalids', {v1: [true]}, {v1: ['a']});
        expectNoChanges(listener);
      });

      test('Setting, changing', () => {
        const store = createStore();
        store
          .setValues({v1: 1})
          .setValuesSchema({v1: {type: 'number', default: 2}});
        const listener = createStoreListener(store);
        listener.listenToValues('/');
        listener.listenToValue('/v*', null);
        listener.listenToInvalidValue('invalids', null);
        // @ts-ignore
        store.setValues({v1: 3}).setValues({v1: true}).setValues({v1: 'a'});
        expect(store.getValues()).toEqual({v1: 2});
        expectChanges(listener, '/', {v1: 3}, {v1: 2});
        expectChanges(listener, '/v*', {v1: 3}, {v1: 2});
        expectChanges(listener, 'invalids', {v1: [true]}, {v1: ['a']});
        expectNoChanges(listener);
      });

      test('Deleting', () => {
        const store = createStore();
        store.setValues({v1: 1}).setValuesSchema({v1: {type: 'number'}});
        const listener = createStoreListener(store);
        listener.listenToValues('/');
        listener.listenToValue('/v*', null);
        listener.listenToInvalidValue('invalids', null);
        store.delValues();
        expect(store.getValues()).toEqual({});
        expectChanges(listener, '/', {});
        expectChanges(listener, '/v*', {v1: undefined});
        expectNoChanges(listener);
      });

      test('Deleting, defaulted', () => {
        const store = createStore();
        store
          .setValues({v1: 1})
          .setValuesSchema({v1: {type: 'number', default: 2}});
        const listener = createStoreListener(store);
        listener.listenToValues('/');
        listener.listenToValue('/v*', null);
        listener.listenToInvalidValue('invalids', null);
        store.delValues();
        expect(store.getValues()).toEqual({v1: 2});
        expectChanges(listener, '/', {v1: 2});
        expectChanges(listener, '/v*', {v1: 2});
        expectNoChanges(listener);
      });
    });

    describe('PartialValues', () => {
      test('matching', () => {
        const store = createStore();
        store.setValuesSchema({
          v1: {type: 'number'},
          v2: {type: 'number'},
        });
        const listener = createStoreListener(store);
        listener.listenToValues('/');
        listener.listenToValue('/v*', null);
        listener.listenToInvalidValue('invalids', null);
        store.setPartialValues({v1: 1});
        expect(store.getValues()).toEqual({v1: 1});
        expectChanges(listener, '/', {v1: 1});
        expectChanges(listener, '/v*', {v1: 1});
        expectNoChanges(listener);
        store.setPartialValues({v2: 2});
        expect(store.getValues()).toEqual({v1: 1, v2: 2});
        expectChanges(listener, '/', {v1: 1, v2: 2});
        expectChanges(listener, '/v*', {v2: 2});
        expectNoChanges(listener);
      });

      test('default missing cell', () => {
        const store = createStore();
        store.setValuesSchema({
          v1: {type: 'number'},
          v2: {type: 'number'},
          v3: {type: 'number', default: 3},
        });
        const listener = createStoreListener(store);
        listener.listenToValues('/');
        listener.listenToValue('/v*', null);
        listener.listenToInvalidValue('invalids', null);
        store.setPartialValues({v1: 1});
        expect(store.getValues()).toEqual({v1: 1, v3: 3});
        expectChanges(listener, '/', {v3: 3, v1: 1}); // v3 already defaulted
        expectChanges(listener, '/v*', {v1: 1});
        expectNoChanges(listener);
        store.setPartialValues({v2: 2});
        expect(store.getValues()).toEqual({v1: 1, v2: 2, v3: 3});
        expectChangesNoJson(listener, '/', {v3: 3, v1: 1, v2: 2});
        expectChanges(listener, '/v*', {v2: 2});
        expectNoChanges(listener);
      });

      test('non-matching some cell types', () => {
        const store = createStore();
        store.setValuesSchema({
          v1: {type: 'number'},
          v2: {type: 'number'},
          v3: {type: 'number'},
        });
        const listener = createStoreListener(store);
        listener.listenToValues('/');
        listener.listenToValue('/v*', null);
        listener.listenToInvalidValue('invalids', null);
        store
          .setPartialValues({v1: 1, v2: 2, v3: 3})
          // @ts-ignore
          .setPartialValues({v1: 2, v2: 'a'})
          // @ts-ignore
          .setPartialValues({v1: 3, v2: true});
        expect(store.getValues()).toEqual({v1: 3, v2: 2, v3: 3});
        expectChanges(
          listener,
          '/',
          {v1: 1, v2: 2, v3: 3},
          {v1: 2, v2: 2, v3: 3},
          {v1: 3, v2: 2, v3: 3},
        );
        expectChanges(
          listener,
          '/v*',
          {v1: 1},
          {v2: 2},
          {v3: 3},
          {v1: 2},
          {v1: 3},
        );
        expectChanges(listener, 'invalids', {v2: ['a']}, {v2: [true]});
        expectNoChanges(listener);
      });
    });

    describe('Value', () => {
      test('matching', () => {
        const store = createStore();
        store.setValuesSchema({
          v1: {type: 'number'},
          v2: {type: 'number'},
        });
        const listener = createStoreListener(store);
        listener.listenToValues('/');
        listener.listenToValue('/v*', null);
        listener.listenToInvalidValue('invalids', null);
        store.setValue('v1', 1);
        expect(store.getValues()).toEqual({v1: 1});
        expectChanges(listener, '/', {v1: 1});
        expectChanges(listener, '/v*', {v1: 1});
        expectNoChanges(listener);
        store.setValue('v2', 2);
        expect(store.getValues()).toEqual({v1: 1, v2: 2});
        expectChanges(listener, '/', {v1: 1, v2: 2});
        expectChanges(listener, '/v*', {v2: 2});
        expectNoChanges(listener);
      });

      test('default missing cell', () => {
        const store = createStore();
        store.setValuesSchema({
          v1: {type: 'number'},
          v2: {type: 'number'},
          v3: {type: 'number', default: 3},
        });
        const listener = createStoreListener(store);
        listener.listenToValues('/');
        listener.listenToValue('/v*', null);
        listener.listenToInvalidValue('invalids', null);
        store.setValue('v1', 1);
        expect(store.getValues()).toEqual({v1: 1, v3: 3});
        expectChanges(listener, '/', {v3: 3, v1: 1}); // v3 already defaulted
        expectChanges(listener, '/v*', {v1: 1});
        expectNoChanges(listener);
        store.setValue('v2', 2);
        expect(store.getValues()).toEqual({v1: 1, v2: 2, v3: 3});
        expectChangesNoJson(listener, '/', {v3: 3, v1: 1, v2: 2});
        expectChanges(listener, '/v*', {v2: 2});
        expectNoChanges(listener);
      });

      test('non-matching some cell types', () => {
        const store = createStore();
        store.setValuesSchema({
          v1: {type: 'number'},
        });
        const listener = createStoreListener(store);
        listener.listenToValues('/');
        listener.listenToValue('/v*', null);
        listener.listenToInvalidValue('invalids', null);
        store
          .setValue('v1', 1)
          // @ts-ignore
          .setValue('v1', 'a')
          // @ts-ignore
          .setValue('v1', true);
        expect(store.getValues()).toEqual({v1: 1});
        expectChanges(listener, '/', {v1: 1});
        expectChanges(listener, '/v*', {v1: 1});
        expectChanges(listener, 'invalids', {v1: ['a']}, {v1: [true]});
        expectNoChanges(listener);
      });
    });
  });

  describe('Miscellaneous', () => {
    test('Both TablesSchema and ValuesSchema', () => {
      const store = createStore()
        .setTablesSchema({
          t1: {c1: {type: 'number', default: 1}},
        })
        .setValuesSchema({v1: {type: 'number', default: 1}});
      expect(JSON.parse(store.getTablesSchemaJson())).toEqual({
        t1: {c1: {type: 'number', default: 1}},
      });
      expect(JSON.parse(store.getValuesSchemaJson())).toEqual({
        v1: {type: 'number', default: 1},
      });
      expect(JSON.parse(store.getSchemaJson())).toEqual([
        {t1: {c1: {type: 'number', default: 1}}},
        {v1: {type: 'number', default: 1}},
      ]);
      store.delSchema();
      expect(JSON.parse(store.getTablesSchemaJson())).toEqual({});
      expect(JSON.parse(store.getValuesSchemaJson())).toEqual({});
      expect(JSON.parse(store.getSchemaJson())).toEqual([{}, {}]);
    });

    test('Both TablesSchema and ValuesSchema set together', () => {
      const store = createStore().setSchema(
        {t1: {c1: {type: 'number', default: 1}}},
        {v1: {type: 'number', default: 1}},
      );
      expect(JSON.parse(store.getTablesSchemaJson())).toEqual({
        t1: {c1: {type: 'number', default: 1}},
      });
      expect(JSON.parse(store.getValuesSchemaJson())).toEqual({
        v1: {type: 'number', default: 1},
      });
      expect(JSON.parse(store.getSchemaJson())).toEqual([
        {t1: {c1: {type: 'number', default: 1}}},
        {v1: {type: 'number', default: 1}},
      ]);
    });

    test('setSchema backwards compatibility', () => {
      const store = createStore().setSchema({
        t1: {c1: {type: 'number', default: 1}},
      });
      expect(JSON.parse(store.getTablesSchemaJson())).toEqual({
        t1: {c1: {type: 'number', default: 1}},
      });
      expect(JSON.parse(store.getValuesSchemaJson())).toEqual({});
      expect(JSON.parse(store.getSchemaJson())).toEqual([
        {t1: {c1: {type: 'number', default: 1}}},
        {},
      ]);
    });

    test('Using existing value', () => {
      const store = createStore();
      store.setTablesSchema({t1: {c1: {type: 'number'}}});
      store.addCellListener(
        't1',
        null,
        'c1',
        (store, _tableId, rowId, _cellId, newCell, oldCell) =>
          store.setCell(
            't1',
            rowId,
            'c1',
            oldCell == null || newCell > oldCell ? newCell : oldCell,
          ),
        true,
      );
      const listener = createStoreListener(store);
      listener.listenToTables('/');
      store.setTables({t1: {r1: {c1: 1}}});
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
      store.setTables({t1: {r1: {c1: 3}}});
      expect(store.getTables()).toEqual({t1: {r1: {c1: 3}}});
      store.setTables({t1: {r1: {c1: 2}}});
      expect(store.getTables()).toEqual({t1: {r1: {c1: 3}}});
      expectChanges(listener, '/', {t1: {r1: {c1: 1}}}, {t1: {r1: {c1: 3}}});
      expectNoChanges(listener);
    });

    describe('Empty row fires', () => {
      test('no event when all are defaulted', () => {
        const store = createStore();
        store.setTablesSchema({
          t1: {
            c1: {type: 'string', default: ''},
            c2: {type: 'boolean', default: false},
          },
        });
        const listener = createStoreListener(store);
        listener.listenToInvalidCell('invalids', null, null, null);
        store.setRow('t1', 'r1', {});
        expectNoChanges(listener);
      });

      test('invalid event when some are defaulted', () => {
        const store = createStore();
        store.setTablesSchema({
          t1: {
            c1: {type: 'string'},
            c2: {type: 'boolean', default: false},
          },
        });
        const listener = createStoreListener(store);
        listener.listenToInvalidCell('invalids', null, null, null);
        store.setRow('t1', 'r1', {});
        expectChangesNoJson(listener, 'invalids', {
          t1: {r1: {c1: [undefined]}},
        });
        expectNoChanges(listener);
      });

      test('invalid event when none are defaulted', () => {
        const store = createStore();
        store.setTablesSchema({
          t1: {
            c1: {type: 'string'},
            c2: {type: 'boolean'},
          },
        });
        const listener = createStoreListener(store);
        listener.listenToInvalidCell('invalids', null, null, null);
        store.setRow('t1', 'r1', {});
        expectChangesNoJson(
          listener,
          'invalids',
          {t1: {r1: {c1: [undefined]}}},
          {t1: {r1: {c2: [undefined]}}},
          {t1: {r1: {undefined: [undefined]}}},
        );
        expectNoChanges(listener);
      });
    });
  });
});
