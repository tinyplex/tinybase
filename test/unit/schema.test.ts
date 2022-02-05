import {
  Cell,
  Id,
  Schema,
  Store,
  Tables,
  createStore,
} from '../../lib/debug/tinybase';
import {
  createStoreListener,
  expectChanges,
  expectChangesNoJson,
  expectNoChanges,
} from './common';

type AddMutator = (store: Store) => void;

const addAllowMutator = <C extends Cell>(
  store: Store,
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

const boundsSchemaAndExpected: [
  name: string,
  schema: Schema,
  addMutator: AddMutator,
  expected: Tables,
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

describe('Get and set schemas', () => {
  test('Set schema on creation', () => {
    const store = createStore();
    const listener = createStoreListener(store);
    listener.listenToInvalidCell('invalids', null, null, null);
    addAllowMutator(store, 't1', 'c1', [2, 3]);
    store.setSchema({t1: {c1: {type: 'number', default: 1}}});
    expect(JSON.parse(store.getSchemaJson())).toEqual({
      t1: {c1: {type: 'number', default: 1}},
    });
    store.setCell('t1', 'r1', 'c1', '2');
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    store.setCell('t1', 'r1', 'c1', 2);
    expect(store.getTables()).toEqual({t1: {r1: {c1: 2}}});
    expectChanges(listener, 'invalids', {t1: {r1: {c1: ['2']}}});
    expectNoChanges(listener);
  });

  test('Set schema after creation', () => {
    const store = createStore().setTables({});
    const listener = createStoreListener(store);
    listener.listenToInvalidCell('invalids', null, null, null);
    store.setCell('t1', 'r1', 'c1', '1');
    expect(store.getTables()).toEqual({t1: {r1: {c1: '1'}}});
    store.setSchema({
      t1: {
        c1: {type: 'number', default: 1},
        c2: {type: 'string', default: '2'},
      },
    });
    expect(JSON.parse(store.getSchemaJson())).toEqual({
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

  test('Set schema after creation (complete failure)', () => {
    const store = createStore().setTables({});
    const listener = createStoreListener(store);
    listener.listenToInvalidCell('invalids', null, null, null);
    store.setCell('t1', 'r1', 'c1', '1');
    store.setSchema({t2: {c1: {type: 'number', default: 1}}});
    expect(store.getTables()).toEqual({});
    expectChangesNoJson(listener, 'invalids', {
      t1: {undefined: {undefined: [undefined]}},
    });
    expectNoChanges(listener);
  });

  test('Change schema after creation', () => {
    const store = createStore();
    const listener = createStoreListener(store);
    listener.listenToInvalidCell('invalids', null, null, null);
    let listenerId = addAllowMutator(store, 't1', 'c1', [2, 3]);
    store.setSchema({t1: {c1: {type: 'number', default: 1}}});
    store.setCell('t1', 'r1', 'c1', '1');
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    store.setSchema({
      t1: {c1: {type: 'string', default: '1'}},
    });
    store.delListener(listenerId as any);
    expect(JSON.parse(store.getSchemaJson())).toEqual({
      t1: {c1: {type: 'string', default: '1'}},
    });
    expect(store.getTables()).toEqual({t1: {r1: {c1: '1'}}});
    store.setCell('t1', 'r1', 'c1', 2);
    expect(store.getTables()).toEqual({t1: {r1: {c1: '1'}}});
    store.setCell('t1', 'r1', 'c1', '2');
    store.setCell('t1', 'r2', 'c1', '3');
    expect(store.getTables()).toEqual({t1: {r1: {c1: '2'}, r2: {c1: '3'}}});
    listenerId = addAllowMutator(store, 't1', 'c1', ['3', '4']);
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

  test('Remove schema after creation', () => {
    const store = createStore();
    const listener = createStoreListener(store);
    listener.listenToInvalidCell('invalids', null, null, null);
    const listenerId = addAllowMutator(store, 't1', 'c1', [2, 3]);
    store.setSchema({t1: {c1: {type: 'number', default: 1}}});
    store.setCell('t1', 'r1', 'c1', '1');
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    store.delSchema();
    store.delListener(listenerId as any);
    expect(JSON.parse(store.getSchemaJson())).toEqual({});
    store.setCell('t1', 'r1', 'c1', '1');
    expect(store.getTables()).toEqual({t1: {r1: {c1: '1'}}});
    expectChanges(listener, 'invalids', {t1: {r1: {c1: ['1']}}});
    expectNoChanges(listener);
  });
});

describe('Schema applied before data set', () => {
  test('matching', () => {
    const store = createStore();
    store.setTables({t1: {r1: {c1: 1}}});
    store.setSchema({t1: {c1: {type: 'number'}}});
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
  });

  test('non-matching table', () => {
    const store = createStore();
    store.setSchema({t1: {c1: {type: 'number'}}});
    store.setTables({t2: {r1: {c1: 1}}});
    expect(store.getTables()).toEqual({});
  });

  test('non-matching cell', () => {
    const store = createStore();
    store.setSchema({t1: {c1: {type: 'number'}}});
    store.setTables({t1: {r1: {c2: 1}}});
    expect(store.getTables()).toEqual({});
  });

  test('non-matching some cell types', () => {
    const store = createStore();
    store.setTables({t1: {r1: {c1: 1}, r2: {c1: true}, r3: {c1: 'a'}}});
    store.setSchema({t1: {c1: {type: 'number'}}});
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
  });

  test('non-matching some cell allows', () => {
    const store = createStore();
    addAllowMutator(store, 't1', 'c1', [1, 2, 3]);
    store.setTables({
      t1: {r1: {c1: 2}, r2: {c1: 4}, r3: {c1: true}, r4: {c1: 'a'}},
    });
    store.setSchema({t1: {c1: {type: 'number'}}});
    expect(store.getTables()).toEqual({t1: {r1: {c1: 2}}});
  });

  describe('non-matching some bounds', () => {
    test.each(boundsSchemaAndExpected)(
      '%s',
      (_name, schema: Schema, addMutator: AddMutator, expected: Tables) => {
        const store = createStore();
        store.setSchema(schema);
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
    store.setSchema({t1: {c1: {type: 'number', default: 2}}});
    expect(store.getTables()).toEqual({
      t1: {r1: {c1: 1}, r2: {c1: 2}, r3: {c1: 2}},
    });
  });

  test('non-matching some cell types, default and allows', () => {
    const store = createStore();
    addAllowMutator(store, 't1', 'c1', [1, 3]);
    store.setSchema({t1: {c1: {type: 'number', default: 2}}});
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

describe('Schema applied before data set, listening', () => {
  describe('Tables', () => {
    test('matching', () => {
      const store = createStore().setSchema({t1: {c1: {type: 'number'}}});
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
      const store = createStore().setSchema({
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
      const store = createStore().setSchema({t1: {c1: {type: 'number'}}});
      const listener = createStoreListener(store);
      listener.listenToTables('/');
      listener.listenToCell('/t*/r*/c*', null, null, null);
      listener.listenToInvalidCell('invalids', null, null, null);
      store.setTables({t2: {r1: {c1: 1}}});
      expect(store.getTables()).toEqual({});
      expectChangesNoJson(listener, 'invalids', {
        t2: {undefined: {undefined: [undefined]}},
      });
      expectNoChanges(listener);
    });

    test('non-matching cell', () => {
      const store = createStore().setSchema({t1: {c1: {type: 'number'}}});
      const listener = createStoreListener(store);
      listener.listenToTables('/');
      listener.listenToCell('/t*/r*/c*', null, null, null);
      listener.listenToInvalidCell('invalids', null, null, null);
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
      const store = createStore().setSchema({t1: {c1: {type: 'number'}}});
      const listener = createStoreListener(store);
      listener.listenToTables('/');
      listener.listenToCell('/t*/r*/c*', null, null, null);
      listener.listenToInvalidCell('invalids', null, null, null);
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
      addAllowMutator(store, 't1', 'c1', [1, 2, 3]);
      store.setSchema({t1: {c1: {type: 'number'}}});
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
      test.each(boundsSchemaAndExpected)(
        '%s',
        (_name, schema: Schema, addMutator: AddMutator, expected: Tables) => {
          const store = createStore().setSchema(schema);
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
            {t1: {r1: {c1: expected.t1.r1.c1}}},
            {t1: {r2: {c1: expected.t1.r2.c1}}},
            {t1: {r3: {c1: expected.t1.r3.c1}}},
          );
          if (expected.t1.r4 != null) {
            expectChanges(listener, '/t*/r*/c*', {
              t1: {r4: {c1: expected.t1.r4.c1}},
            });
          }
          if (expected.t1.r5 != null) {
            expectChanges(listener, '/t*/r*/c*', {
              t1: {r5: {c1: expected.t1.r5.c1}},
            });
          }
          expectNoChanges(listener);
        },
      );
    });

    test('non-matching some cell types, defaulting', () => {
      const store = createStore().setSchema({
        t1: {c1: {type: 'number', default: 2}},
      });
      const listener = createStoreListener(store);
      listener.listenToTables('/');
      listener.listenToCell('/t*/r*/c*', null, null, null);
      listener.listenToInvalidCell('invalids', null, null, null);
      store.setTables({
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
      addAllowMutator(store, 't1', 'c1', [1, 3]);
      store.setSchema({t1: {c1: {type: 'number', default: 2}}});
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
      const store = createStore()
        .setTables({t1: {r1: {c1: 1}}})
        .setSchema({t1: {c1: {type: 'number', default: 2}}});
      const listener = createStoreListener(store);
      listener.listenToTables('/');
      listener.listenToCell('/t*/r*/c*', null, null, null);
      listener.listenToInvalidCell('invalids', null, null, null);
      store.setTables({t1: {r1: {c1: 3}}});
      store.setTables({t1: {r1: {c1: true}}});
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
      const store = createStore()
        .setTables({t1: {r1: {c1: 1}}})
        .setSchema({t1: {c1: {type: 'number', default: 2}}});
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
      const store = createStore().setSchema({t1: {c1: {type: 'number'}}});
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
      const store = createStore().setSchema({
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
      const store = createStore().setSchema({t1: {c1: {type: 'number'}}});
      const listener = createStoreListener(store);
      listener.listenToTable('/t2', 't2');
      listener.listenToCell('/t*/r*/c*', null, null, null);
      listener.listenToInvalidCell('invalids', null, null, null);
      store.setTable('t2', {r1: {c1: 1}});
      expect(store.getTables()).toEqual({});
      expectChangesNoJson(listener, 'invalids', {
        t2: {undefined: {undefined: [undefined]}},
      });
      expectNoChanges(listener);
    });

    test('non-matching cell', () => {
      const store = createStore().setSchema({t1: {c1: {type: 'number'}}});
      const listener = createStoreListener(store);
      listener.listenToTable('/t1', 't1');
      listener.listenToCell('/t*/r*/c*', null, null, null);
      listener.listenToInvalidCell('invalids', null, null, null);
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
      const store = createStore().setSchema({t1: {c1: {type: 'number'}}});
      const listener = createStoreListener(store);
      listener.listenToTable('/t1', 't1');
      listener.listenToCell('/t*/r*/c*', null, null, null);
      listener.listenToInvalidCell('invalids', null, null, null);
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
      addAllowMutator(store, 't1', 'c1', [1, 2, 3]);
      store.setSchema({t1: {c1: {type: 'number'}}});
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
      test.each(boundsSchemaAndExpected)(
        '%s',
        (_name, schema: Schema, addMutator: AddMutator, expected: Tables) => {
          const store = createStore().setSchema(schema);
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
            {t1: {r1: {c1: expected.t1.r1.c1}}},
            {t1: {r2: {c1: expected.t1.r2.c1}}},
            {t1: {r3: {c1: expected.t1.r3.c1}}},
          );
          if (expected.t1.r4 != null) {
            expectChanges(listener, '/t*/r*/c*', {
              t1: {r4: {c1: expected.t1.r4.c1}},
            });
          }
          if (expected.t1.r5 != null) {
            expectChanges(listener, '/t*/r*/c*', {
              t1: {r5: {c1: expected.t1.r5.c1}},
            });
          }
          expectNoChanges(listener);
        },
      );
    });

    test('non-matching some cell types, defaulting', () => {
      const store = createStore().setSchema({
        t1: {c1: {type: 'number', default: 2}},
      });
      const listener = createStoreListener(store);
      listener.listenToTable('/t1', 't1');
      listener.listenToCell('/t*/r*/c*', null, null, null);
      listener.listenToInvalidCell('invalids', null, null, null);
      store.setTable('t1', {
        r1: {c1: 1},
        r2: {c1: true},
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
      addAllowMutator(store, 't1', 'c1', [1, 3]);
      store.setSchema({t1: {c1: {type: 'number', default: 2}}});
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
      const store = createStore()
        .setTables({t1: {r1: {c1: 1}}})
        .setSchema({t1: {c1: {type: 'number', default: 2}}});
      const listener = createStoreListener(store);
      listener.listenToTable('/t1', 't1');
      listener.listenToCell('/t*/r*/c*', null, null, null);
      listener.listenToInvalidCell('invalids', null, null, null);
      store.setTable('t1', {r1: {c1: 3}});
      store.setTable('t1', {r1: {c1: true}});
      store.setTable('t1', {r1: {c1: 'a'}});
      expect(store.getTables()).toEqual({
        t1: {r1: {c1: 2}},
      });
      expect(store.getTables()).toEqual({t1: {r1: {c1: 2}}});
      expectChanges(listener, '/t1', {t1: {r1: {c1: 3}}}, {t1: {r1: {c1: 2}}});
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
      const store = createStore()
        .setTables({t1: {r1: {c1: 1}}})
        .setSchema({t1: {c1: {type: 'number', default: 2}}});
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
      const store = createStore().setSchema({t1: {c1: {type: 'number'}}});
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
      const store = createStore().setSchema({
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
      const store = createStore().setSchema({t1: {c1: {type: 'number'}}});
      const listener = createStoreListener(store);
      listener.listenToRow('/t2/r1', 't2', 'r1');
      listener.listenToCell('/t*/r*/c*', null, null, null);
      listener.listenToInvalidCell('invalids', null, null, null);
      store.setRow('t2', 'r1', {c1: 1});
      expect(store.getTables()).toEqual({});
      expectChanges(listener, 'invalids', {t2: {r1: {c1: [1]}}});
      expectNoChanges(listener);
    });

    test('non-matching cell', () => {
      const store = createStore().setSchema({t1: {c1: {type: 'number'}}});
      const listener = createStoreListener(store);
      listener.listenToRow('/t1/r1', 't1', 'r1');
      listener.listenToCell('/t*/r*/c*', null, null, null);
      listener.listenToInvalidCell('invalids', null, null, null);
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
      const store = createStore().setSchema({t1: {c1: {type: 'number'}}});
      const listener = createStoreListener(store);
      listener.listenToCell('/t*/r*/c*', null, null, null);
      listener.listenToRow('/t1/r1', 't1', 'r1');
      listener.listenToRow('/t1/r2', 't1', 'r2');
      listener.listenToRow('/t1/r3', 't1', 'r3');
      listener.listenToInvalidCell('invalids', null, null, null);
      store
        .setRow('t1', 'r1', {c1: 1})
        .setRow('t1', 'r2', {c1: true})
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
      addAllowMutator(store, 't1', 'c1', [1, 2, 3]);
      store.setSchema({t1: {c1: {type: 'number'}}});
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
      test.each(boundsSchemaAndExpected)(
        '%s',
        (_name, schema: Schema, addMutator: AddMutator, expected: Tables) => {
          const store = createStore().setSchema(schema);
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
          expectChanges(listener, '/t1/r1', {t1: {r1: expected.t1.r1}});
          expectChanges(listener, '/t1/r2', {t1: {r2: expected.t1.r2}});
          expectChanges(listener, '/t1/r3', {t1: {r3: expected.t1.r3}});
          expectChanges(
            listener,
            '/t*/r*/c*',
            {t1: {r1: {c1: expected.t1.r1.c1}}},
            {t1: {r2: {c1: expected.t1.r2.c1}}},
            {t1: {r3: {c1: expected.t1.r3.c1}}},
          );
          if (expected.t1.r4 != null) {
            expectChanges(listener, '/t1/r4', {t1: {r4: expected.t1.r4}});
            expectChanges(listener, '/t*/r*/c*', {
              t1: {r4: {c1: expected.t1.r4.c1}},
            });
          }
          if (expected.t1.r5 != null) {
            expectChanges(listener, '/t1/r5', {t1: {r5: expected.t1.r5}});
            expectChanges(listener, '/t*/r*/c*', {
              t1: {r5: {c1: expected.t1.r5.c1}},
            });
          }
          expectNoChanges(listener);
        },
      );
    });

    test('non-matching some cell types, defaulting', () => {
      const store = createStore().setSchema({
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
        .setRow('t1', 'r2', {c1: true})
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
      addAllowMutator(store, 't1', 'c1', [1, 3]);
      store.setSchema({t1: {c1: {type: 'number', default: 2}}});
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
      const store = createStore()
        .setTables({t1: {r1: {c1: 1}}})
        .setSchema({t1: {c1: {type: 'number', default: 2}}});
      const listener = createStoreListener(store);
      listener.listenToRow('/t1/r1', 't1', 'r1');
      listener.listenToCell('/t*/r*/c*', null, null, null);
      listener.listenToInvalidCell('invalids', null, null, null);
      store
        .setRow('t1', 'r1', {c1: 3})
        .setRow('t1', 'r1', {c1: true})
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
      const store = createStore()
        .setTables({t1: {r1: {c1: 1}}})
        .setSchema({t1: {c1: {type: 'number', default: 2}}});
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
      const store = createStore().setSchema({t1: {c1: {type: 'number'}}});
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
      const store = createStore().setSchema({
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
      const store = createStore().setSchema({t1: {c1: {type: 'number'}}});
      const listener = createStoreListener(store);
      listener.listenToRow('/t2/r1', 't2', 'r1');
      listener.listenToCell('/t*/r*/c*', null, null, null);
      listener.listenToInvalidCell('invalids', null, null, null);
      store.setPartialRow('t2', 'r1', {c1: 1});
      expect(store.getTables()).toEqual({});
      expectChanges(listener, 'invalids', {t2: {r1: {c1: [1]}}});
      expectNoChanges(listener);
    });

    test('non-matching cell', () => {
      const store = createStore().setSchema({t1: {c1: {type: 'number'}}});
      const listener = createStoreListener(store);
      listener.listenToRow('/t1/r1', 't1', 'r1');
      listener.listenToCell('/t*/r*/c*', null, null, null);
      listener.listenToInvalidCell('invalids', null, null, null);
      store.setPartialRow('t1', 'r1', {c2: 1});
      expect(store.getTables()).toEqual({});
      expectChanges(listener, 'invalids', {t1: {r1: {c2: [1]}}});
      expectNoChanges(listener);
    });

    test('non-matching some cell types', () => {
      const store = createStore().setSchema({t1: {c1: {type: 'number'}}});
      const listener = createStoreListener(store);
      listener.listenToCell('/t*/r*/c*', null, null, null);
      listener.listenToRow('/t1/r1', 't1', 'r1');
      listener.listenToRow('/t1/r2', 't1', 'r2');
      listener.listenToRow('/t1/r3', 't1', 'r3');
      listener.listenToInvalidCell('invalids', null, null, null);
      store
        .setPartialRow('t1', 'r1', {c1: 1})
        .setPartialRow('t1', 'r2', {c1: true})
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
      addAllowMutator(store, 't1', 'c1', [1, 2, 3]);
      store.setSchema({t1: {c1: {type: 'number'}}});
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
      test.each(boundsSchemaAndExpected)(
        '%s',
        (_name, schema: Schema, addMutator: AddMutator, expected: Tables) => {
          const store = createStore().setSchema(schema);
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
          expectChanges(listener, '/t1/r1', {t1: {r1: expected.t1.r1}});
          expectChanges(listener, '/t1/r2', {t1: {r2: expected.t1.r2}});
          expectChanges(listener, '/t1/r3', {t1: {r3: expected.t1.r3}});
          expectChanges(
            listener,
            '/t*/r*/c*',
            {t1: {r1: {c1: expected.t1.r1.c1}}},
            {t1: {r2: {c1: expected.t1.r2.c1}}},
            {t1: {r3: {c1: expected.t1.r3.c1}}},
          );
          if (expected.t1.r4 != null) {
            expectChanges(listener, '/t1/r4', {t1: {r4: expected.t1.r4}});
            expectChanges(listener, '/t*/r*/c*', {
              t1: {r4: {c1: expected.t1.r4.c1}},
            });
          }
          if (expected.t1.r5 != null) {
            expectChanges(listener, '/t1/r5', {t1: {r5: expected.t1.r5}});
            expectChanges(listener, '/t*/r*/c*', {
              t1: {r5: {c1: expected.t1.r5.c1}},
            });
          }
          expectNoChanges(listener);
        },
      );
    });

    test('non-matching some cell types, defaulting', () => {
      const store = createStore().setSchema({
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
        .setPartialRow('t1', 'r2', {c1: true})
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
      addAllowMutator(store, 't1', 'c1', [1, 3]);
      store.setSchema({t1: {c1: {type: 'number', default: 2}}});
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
      const store = createStore()
        .setTables({t1: {r1: {c1: 1}}})
        .setSchema({t1: {c1: {type: 'number', default: 2}}});
      const listener = createStoreListener(store);
      listener.listenToRow('/t1/r1', 't1', 'r1');
      listener.listenToCell('/t*/r*/c*', null, null, null);
      listener.listenToInvalidCell('invalids', null, null, null);
      store
        .setPartialRow('t1', 'r1', {c1: 3})
        .setPartialRow('t1', 'r1', {c1: true})
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
      const store = createStore()
        .setTables({t1: {r1: {c1: 1}}})
        .setSchema({t1: {c1: {type: 'number', default: 2}}});
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
      const store = createStore().setSchema({t1: {c1: {type: 'number'}}});
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
      const store = createStore().setSchema({
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
      const store = createStore().setSchema({t1: {c1: {type: 'number'}}});
      const listener = createStoreListener(store);
      listener.listenToCell('/t2/r1/c1', 't2', 'r1', 'c1');
      listener.listenToCell('/t*/r*/c*', null, null, null);
      listener.listenToInvalidCell('invalids', null, null, null);
      store.setCell('t2', 'r1', 'c1', 1);
      expect(store.getTables()).toEqual({});
      expectChanges(listener, 'invalids', {t2: {r1: {c1: [1]}}});
      expectNoChanges(listener);
    });

    test('non-matching cell', () => {
      const store = createStore().setSchema({t1: {c1: {type: 'number'}}});
      const listener = createStoreListener(store);
      listener.listenToCell('t1/r1/c2', 't1', 'r1', 'c2');
      listener.listenToCell('/t*/r*/c*', null, null, null);
      listener.listenToInvalidCell('invalids', null, null, null);
      store.setCell('t1', 'r1', 'c2', 1);
      expect(store.getTables()).toEqual({});
      expectChanges(listener, 'invalids', {t1: {r1: {c2: [1]}}});
      expectNoChanges(listener);
    });

    describe('non-matching some cell types', () => {
      test('to number', () => {
        const store = createStore().setSchema({t1: {c1: {type: 'number'}}});
        const listener = createStoreListener(store);
        listener.listenToCell('/t1/r1/c1', 't1', 'r1', 'c1');
        listener.listenToCell('/t1/r2/c1', 't1', 'r2', 'c1');
        listener.listenToCell('/t1/r3/c1', 't1', 'r3', 'c1');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        store
          .setCell('t1', 'r1', 'c1', 1)
          .setCell('t1', 'r2', 'c1', true)
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
        const store = createStore().setSchema({t1: {c1: {type: 'boolean'}}});
        const listener = createStoreListener(store);
        listener.listenToCell('/t1/r1/c1', 't1', 'r1', 'c1');
        listener.listenToCell('/t1/r2/c1', 't1', 'r2', 'c1');
        listener.listenToCell('/t1/r3/c1', 't1', 'r3', 'c1');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        store
          .setCell('t1', 'r1', 'c1', 1)
          .setCell('t1', 'r2', 'c1', true)
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
        const store = createStore().setSchema({t1: {c1: {type: 'string'}}});
        const listener = createStoreListener(store);
        listener.listenToCell('/t1/r1/c1', 't1', 'r1', 'c1');
        listener.listenToCell('/t1/r2/c1', 't1', 'r2', 'c1');
        listener.listenToCell('/t1/r3/c1', 't1', 'r3', 'c1');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        store
          .setCell('t1', 'r1', 'c1', 1)
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
        const store = createStore().setSchema({t1: {c1: {type: 'number'}}});
        addAllowMutator(store, 't1', 'c1', [1, 2, 3]);
        const listener = createStoreListener(store);
        listener.listenToCell('/t1/r1/c1', 't1', 'r1', 'c1');
        listener.listenToCell('/t1/r2/c1', 't1', 'r2', 'c1');
        listener.listenToCell('/t1/r3/c1', 't1', 'r3', 'c1');
        listener.listenToCell('/t1/r4/c1', 't1', 'r4', 'c1');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        store
          .setCell('t1', 'r1', 'c1', 1)
          .setCell('t1', 'r2', 'c1', true)
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
        const store = createStore().setSchema({t1: {c1: {type: 'boolean'}}});
        addAllowMutator<boolean>(store, 't1', 'c1', [true]);
        const listener = createStoreListener(store);
        listener.listenToCell('/t1/r1/c1', 't1', 'r1', 'c1');
        listener.listenToCell('/t1/r2/c1', 't1', 'r2', 'c1');
        listener.listenToCell('/t1/r3/c1', 't1', 'r3', 'c1');
        listener.listenToCell('/t1/r4/c1', 't1', 'r4', 'c1');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        store
          .setCell('t1', 'r1', 'c1', 1)
          .setCell('t1', 'r2', 'c1', true)
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
        const store = createStore().setSchema({t1: {c1: {type: 'string'}}});
        addAllowMutator(store, 't1', 'c1', ['true', '1']);
        const listener = createStoreListener(store);
        listener.listenToCell('/t1/r1/c1', 't1', 'r1', 'c1');
        listener.listenToCell('/t1/r2/c1', 't1', 'r2', 'c1');
        listener.listenToCell('/t1/r3/c1', 't1', 'r3', 'c1');
        listener.listenToCell('/t1/r4/c1', 't1', 'r4', 'c1');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        store
          .setCell('t1', 'r1', 'c1', 1)
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
        const store = createStore().setSchema({
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
          .setCell('t1', 'r2', 'c1', true)
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
        const store = createStore().setSchema({
          t1: {c1: {type: 'boolean', default: false}},
        });
        const listener = createStoreListener(store);
        listener.listenToCell('/t1/r1/c1', 't1', 'r1', 'c1');
        listener.listenToCell('/t1/r2/c1', 't1', 'r2', 'c1');
        listener.listenToCell('/t1/r3/c1', 't1', 'r3', 'c1');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        store
          .setCell('t1', 'r1', 'c1', 1)
          .setCell('t1', 'r2', 'c1', true)
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
        const store = createStore().setSchema({
          t1: {c1: {type: 'string', default: '2'}},
        });
        const listener = createStoreListener(store);
        listener.listenToCell('/t1/r1/c1', 't1', 'r1', 'c1');
        listener.listenToCell('/t1/r2/c1', 't1', 'r2', 'c1');
        listener.listenToCell('/t1/r3/c1', 't1', 'r3', 'c1');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        store
          .setCell('t1', 'r1', 'c1', 1)
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
        const store = createStore().setSchema({
          t1: {c1: {type: 'number', default: 2}},
        });
        addAllowMutator(store, 't1', 'c1', [1, 3]);
        const listener = createStoreListener(store);
        listener.listenToCell('/t1/r1/c1', 't1', 'r1', 'c1');
        listener.listenToCell('/t1/r2/c1', 't1', 'r2', 'c1');
        listener.listenToCell('/t1/r3/c1', 't1', 'r3', 'c1');
        listener.listenToCell('/t1/r4/c1', 't1', 'r4', 'c1');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        store
          .setCell('t1', 'r1', 'c1', 1)
          .setCell('t1', 'r2', 'c1', true)
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
        const store = createStore().setSchema({
          t1: {
            c1: {
              type: 'boolean',
              default: false,
            },
          },
        });
        addAllowMutator<boolean>(store, 't1', 'c1', [false]);
        const listener = createStoreListener(store);
        listener.listenToCell('/t1/r1/c1', 't1', 'r1', 'c1');
        listener.listenToCell('/t1/r2/c1', 't1', 'r2', 'c1');
        listener.listenToCell('/t1/r3/c1', 't1', 'r3', 'c1');
        listener.listenToCell('/t1/r4/c1', 't1', 'r4', 'c1');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        store
          .setCell('t1', 'r1', 'c1', 1)
          .setCell('t1', 'r2', 'c1', true)
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
        const store = createStore().setSchema({
          t1: {
            c1: {
              type: 'string',
              default: '2',
            },
          },
        });
        addAllowMutator(store, 't1', 'c1', ['true', '1']);
        const listener = createStoreListener(store);
        listener.listenToCell('/t1/r1/c1', 't1', 'r1', 'c1');
        listener.listenToCell('/t1/r2/c1', 't1', 'r2', 'c1');
        listener.listenToCell('/t1/r3/c1', 't1', 'r3', 'c1');
        listener.listenToCell('/t1/r4/c1', 't1', 'r4', 'c1');
        listener.listenToCell('/t*/r*/c*', null, null, null);
        listener.listenToInvalidCell('invalids', null, null, null);
        store
          .setCell('t1', 'r1', 'c1', 1)
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
      test.each(boundsSchemaAndExpected)(
        '%s',
        (_name, schema: Schema, addMutator: AddMutator, expected: Tables) => {
          const store = createStore().setSchema(schema);
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
            t1: {r1: {c1: expected.t1.r1.c1}},
          });
          expectChanges(listener, '/t1/r2/c1', {
            t1: {r2: {c1: expected.t1.r2.c1}},
          });
          expectChanges(listener, '/t1/r3/c1', {
            t1: {r3: {c1: expected.t1.r3.c1}},
          });
          expectChanges(
            listener,
            '/t*/r*/c*',
            {t1: {r1: {c1: expected.t1.r1.c1}}},
            {t1: {r2: {c1: expected.t1.r2.c1}}},
            {t1: {r3: {c1: expected.t1.r3.c1}}},
          );
          if (expected.t1.r4 != null) {
            expectChanges(listener, '/t1/r4/c1', {
              t1: {r4: {c1: expected.t1.r4.c1}},
            });
            expectChanges(listener, '/t*/r*/c*', {
              t1: {r4: {c1: expected.t1.r4.c1}},
            });
          }
          if (expected.t1.r5 != null) {
            expectChanges(listener, '/t1/r5/c1', {
              t1: {r5: {c1: expected.t1.r5.c1}},
            });
            expectChanges(listener, '/t*/r*/c*', {
              t1: {r5: {c1: expected.t1.r5.c1}},
            });
          }
          expectNoChanges(listener);
        },
      );
    });

    test('Setting, changing', () => {
      const store = createStore()
        .setTables({t1: {r1: {c1: 1}}})
        .setSchema({t1: {c1: {type: 'number', default: 2}}});
      const listener = createStoreListener(store);
      listener.listenToCell('/t1/r1/c1', 't1', 'r1', 'c1');
      listener.listenToCell('/t*/r*/c*', null, null, null);
      listener.listenToInvalidCell('invalids', null, null, null);
      store
        .setCell('t1', 'r1', 'c1', 3)
        .setCell('t1', 'r1', 'c1', true)
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
      const store = createStore()
        .setTables({t1: {r1: {c1: 1, c2: 3}}})
        .setSchema({
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
      const store = createStore()
        .setTables({t1: {r1: {c1: 1, c2: 3}}})
        .setSchema({
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

describe('Miscellaneous', () => {
  test('Using existing value', () => {
    const store = createStore().setSchema({t1: {c1: {type: 'number'}}});
    store.addCellListener(
      't1',
      null,
      'c1',
      (store, tableId, rowId, cellId, newCell, oldCell) =>
        store.setCell(
          tableId,
          rowId,
          cellId,
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
      store.setSchema({
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
      store.setSchema({
        t1: {
          c1: {type: 'string'},
          c2: {type: 'boolean', default: false},
        },
      });
      const listener = createStoreListener(store);
      listener.listenToInvalidCell('invalids', null, null, null);
      store.setRow('t1', 'r1', {});
      expectChangesNoJson(listener, 'invalids', {t1: {r1: {c1: [undefined]}}});
      expectNoChanges(listener);
    });

    test('invalid event when none are defaulted', () => {
      const store = createStore();
      store.setSchema({
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
