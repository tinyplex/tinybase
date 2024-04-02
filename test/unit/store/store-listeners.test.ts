/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  Cell,
  Id,
  IdOrNull,
  Store,
  Value,
  createMergeableStore,
  createStore,
} from 'tinybase/debug';
import {
  expectChanges,
  expectChangesNoJson,
  expectNoChanges,
} from '../common/expect';
import {StoreListener} from '../common/types';
import {createStoreListener} from '../common/listeners';
import {jest} from '@jest/globals';

const EMPTY_CHANGES_AND_LOG = [
  [{}, {}, 1],
  [false, false, {}, {}, {}, {}, {}, {}, {}, {}],
];

let store: Store;
let listener: StoreListener;

const getTablesMutator = (cell: Cell) => () =>
  store.setCell('t0', 'r0', 'c0', cell);

const getTableMutator =
  (cell: Cell, tableId?: IdOrNull) =>
  (store: Store, tableId2: Id = 't0') =>
    store.setCell(tableId ?? tableId2, 'r0', 'c0', cell);

const getRowMutator =
  (cell: Cell, tableId?: IdOrNull, rowId?: IdOrNull) =>
  (store: Store, tableId2: Id = 't0', rowId2: Id = 'r0') =>
    store.setCell(tableId ?? tableId2, rowId ?? rowId2, 'c0', cell);

const getCellMutator =
  (cell: Cell, tableId?: IdOrNull, rowId?: IdOrNull, cellId?: IdOrNull) =>
  (store: Store, tableId2: Id = 't0', rowId2: Id = 'r0', cellId2: Id = 'c0') =>
    store.setCell(
      tableId ?? tableId2,
      rowId ?? rowId2,
      cellId ?? cellId2,
      cell,
    );

const getValuesMutator = () => (store: Store) => store.setValue('v0', 0);

const getValueMutator =
  (suffix: string) => (store: Store, valueId: Id, value: Value) =>
    store.setValue(valueId + suffix, value);

const getInvalidValueMutator =
  (suffix: string) => (store: Store, valueId: Id, invalidValues: any[]) =>
    // @ts-ignore
    store.setValue(valueId + suffix, invalidValues);

describe.each([
  ['store', createStore],
  ['mergeableStore', () => createMergeableStore('s1')],
])('Testing %s', (_name, createStore) => {
  // Note that these tests run in order to mutate the store in a sequence.
  describe('Listeners', () => {
    describe('json', () => {
      beforeAll(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToTables('/t');
        listener.listenToValues('/v');
        listener.listenToDidFinishTransaction('/');
      });

      test('setTablesJson', () => {
        store.setTablesJson('{"t1":{"r1":{"c1":1}}}');
        expectChanges(listener, '/t', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/', [
          [{t1: {r1: {c1: 1}}}, {}, 1],
          [
            true,
            false,
            {t1: {r1: {c1: [null, 1]}}},
            {},
            {},
            {},
            {t1: 1},
            {t1: {r1: 1}},
            {t1: {r1: {c1: 1}}},
            {},
          ],
        ]);
        expectNoChanges(listener);
      });

      test('setValuesJson', () => {
        store.setValuesJson('{"v1":1}');
        expectChanges(listener, '/v', {v1: 1});
        expectChanges(listener, '/', [
          [{}, {v1: 1}, 1],
          [false, true, {}, {}, {v1: [null, 1]}, {}, {}, {}, {}, {v1: 1}],
        ]);
        expectNoChanges(listener);
      });

      test('setJson', () => {
        store.setJson('[{"t1":{"r1":{"c1":2}}},{"v1":2}]');
        expectChanges(listener, '/t', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/v', {v1: 2});
        expectChanges(listener, '/', [
          [{t1: {r1: {c1: 2}}}, {v1: 2}, 1],
          [
            true,
            true,
            {t1: {r1: {c1: [1, 2]}}},
            {},
            {v1: [1, 2]},
            {},
            {},
            {},
            {},
            {},
          ],
        ]);
        expectNoChanges(listener);
      });
    });

    describe('hasTables', () => {
      beforeAll(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToHasTables('/');
      });

      test('reset 1', () => {
        store.delTables();
        expectNoChanges(listener);
      });

      test('setTables', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/', true);
        expectNoChanges(listener);
      });

      test('setTables, same table, same row, same cell', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setTables, same table, same row, change cell', () => {
        store.setTables({t1: {r1: {c1: 2}}});
        expectNoChanges(listener);
      });

      test('setTables, same table, same row, different cell', () => {
        store.setTables({t1: {r1: {c2: 2}}});
        expectNoChanges(listener);
      });

      test('setTables, same table, different row', () => {
        store.setTables({t1: {r2: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setTables, different table', () => {
        store.setTables({t2: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('reset 2', () => {
        store.delTables();
        expectChanges(listener, '/', false);
        expectNoChanges(listener);
      });

      test('setTable', () => {
        store.setTable('t1', {r1: {c1: 1}});
        expectChanges(listener, '/', true);
        expectNoChanges(listener);
      });

      test('setTable, same table, same row, same cell', () => {
        store.setTable('t1', {r1: {c1: 1}});
        expectNoChanges(listener);
      });

      test('setTable, same table, same row, change cell', () => {
        store.setTable('t1', {r1: {c1: 2}});
        expectNoChanges(listener);
      });

      test('setTable, same table, same row, different cell', () => {
        store.setTable('t1', {r1: {c2: 2}});
        expectNoChanges(listener);
      });

      test('setTable, same table, different row', () => {
        store.setTable('t1', {r2: {c1: 1}});
        expectNoChanges(listener);
      });

      test('setTable, different table', () => {
        store.setTable('t2', {r1: {c1: 1}});
        expectNoChanges(listener);
      });

      test('reset 3', () => {
        store.delTables();
        expectChanges(listener, '/', false);
        expectNoChanges(listener);
      });

      test('setRow', () => {
        store.setRow('t1', 'r1', {c1: 1});
        expectChanges(listener, '/', true);
        expectNoChanges(listener);
      });

      test('setRow, same table, same row, same cell', () => {
        store.setRow('t1', 'r1', {c1: 1});
        expectNoChanges(listener);
      });

      test('setRow, same table, same row, change cell', () => {
        store.setRow('t1', 'r1', {c1: 2});
        expectNoChanges(listener);
      });

      test('setRow, same table, same row, different cell', () => {
        store.setRow('t1', 'r1', {c2: 2});
        expectNoChanges(listener);
      });

      test('setRow, same table, different row', () => {
        store.setRow('t1', 'r2', {c1: 1});
        expectNoChanges(listener);
      });

      test('setRow, different table', () => {
        store.setRow('t2', 'r1', {c1: 1});
        expectNoChanges(listener);
      });

      test('addRow', () => {
        store.addRow('t2', {c1: 1});
        expectNoChanges(listener);
      });

      test('addRow, over existing row', () => {
        store.transaction(() =>
          store.setRow('t2', '1', {c1: 1}).addRow('t2', {c1: 1}),
        );
        expectNoChanges(listener);
      });

      test('setPartialRow', () => {
        // @ts-ignore
        store.setPartialRow('t1', 'r1', {c1: 1, c2: 3, c3: undefined});
        expectNoChanges(listener);
      });

      test('reset 4', () => {
        store.delTables();
        expectChanges(listener, '/', false);
        expectNoChanges(listener);
      });

      test('setCell', () => {
        store.setCell('t1', 'r1', 'c1', 1);
        expectChanges(listener, '/', true);
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, same cell', () => {
        store.setCell('t1', 'r1', 'c1', 1);
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, change cell', () => {
        store.setCell('t1', 'r1', 'c1', 2);
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, different cell', () => {
        store.setCell('t1', 'r1', 'c2', 2);
        expectNoChanges(listener);
      });

      test('setCell, same table, different row', () => {
        store.setCell('t1', 'r2', 'c1', 1);
        expectNoChanges(listener);
      });

      test('setCell, different table', () => {
        store.setCell('t2', 'r1', 'c1', 1);
        expectNoChanges(listener);
      });

      test('setCell, mapped', () => {
        store.setCell('t2', 'r1', 'c1', (cell) => (cell as number) + 1);
        expectNoChanges(listener);
      });

      test('Add things to delete', () => {
        store.transaction(() =>
          store.setTable('t3', {r1: {c1: 1}}).setTable('t4', {r1: {c1: 1}}),
        );
        expectNoChanges(listener);
      });

      test('delCell', () => {
        store.delCell('t1', 'r1', 'c2');
        expectNoChanges(listener);
      });

      test('delCell, cascade', () => {
        store.delCell('t2', 'r1', 'c1');
        expectNoChanges(listener);
      });

      test('delRow', () => {
        store.delRow('t1', 'r2');
        expectNoChanges(listener);
      });

      test('delRow, cascade', () => {
        store.delRow('t1', 'r1');
        expectNoChanges(listener);
      });

      test('delTable', () => {
        store.delTable('t3');
        expectNoChanges(listener);
      });

      test('delTables', () => {
        store.delTables();
        expectChanges(listener, '/', false);
      });
    });

    describe('tables', () => {
      beforeAll(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToTables('/');
      });

      test('reset 1', () => {
        store.delTables();
        expectNoChanges(listener);
      });

      test('setTables', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/', {t1: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setTables, same table, same row, same cell', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setTables, same table, same row, change cell', () => {
        store.setTables({t1: {r1: {c1: 2}}});
        expectChanges(listener, '/', {t1: {r1: {c1: 2}}});
        expectNoChanges(listener);
      });

      test('setTables, same table, same row, different cell', () => {
        store.setTables({t1: {r1: {c2: 2}}});
        expectChanges(listener, '/', {t1: {r1: {c2: 2}}});
        expectNoChanges(listener);
      });

      test('setTables, same table, different row', () => {
        store.setTables({t1: {r2: {c1: 1}}});
        expectChanges(listener, '/', {t1: {r2: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setTables, different table', () => {
        store.setTables({t2: {r1: {c1: 1}}});
        expectChanges(listener, '/', {t2: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('reset 2', () => {
        store.delTables();
        expectChanges(listener, '/', {});
        expectNoChanges(listener);
      });

      test('setTable', () => {
        store.setTable('t1', {r1: {c1: 1}});
        expectChanges(listener, '/', {t1: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setTable, same table, same row, same cell', () => {
        store.setTable('t1', {r1: {c1: 1}});
        expectNoChanges(listener);
      });

      test('setTable, same table, same row, change cell', () => {
        store.setTable('t1', {r1: {c1: 2}});
        expectChanges(listener, '/', {t1: {r1: {c1: 2}}});
        expectNoChanges(listener);
      });

      test('setTable, same table, same row, different cell', () => {
        store.setTable('t1', {r1: {c2: 2}});
        expectChanges(listener, '/', {t1: {r1: {c2: 2}}});
        expectNoChanges(listener);
      });

      test('setTable, same table, different row', () => {
        store.setTable('t1', {r2: {c1: 1}});
        expectChanges(listener, '/', {t1: {r2: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setTable, different table', () => {
        store.setTable('t2', {r1: {c1: 1}});
        expectChanges(listener, '/', {t1: {r2: {c1: 1}}, t2: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('reset 3', () => {
        store.delTables();
        expectChanges(listener, '/', {});
        expectNoChanges(listener);
      });

      test('setRow', () => {
        store.setRow('t1', 'r1', {c1: 1});
        expectChanges(listener, '/', {t1: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setRow, same table, same row, same cell', () => {
        store.setRow('t1', 'r1', {c1: 1});
        expectNoChanges(listener);
      });

      test('setRow, same table, same row, change cell', () => {
        store.setRow('t1', 'r1', {c1: 2});
        expectChanges(listener, '/', {t1: {r1: {c1: 2}}});
        expectNoChanges(listener);
      });

      test('setRow, same table, same row, different cell', () => {
        store.setRow('t1', 'r1', {c2: 2});
        expectChanges(listener, '/', {t1: {r1: {c2: 2}}});
        expectNoChanges(listener);
      });

      test('setRow, same table, different row', () => {
        store.setRow('t1', 'r2', {c1: 1});
        expectChanges(listener, '/', {t1: {r1: {c2: 2}, r2: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setRow, different table', () => {
        store.setRow('t2', 'r1', {c1: 1});
        expectChanges(listener, '/', {
          t1: {r1: {c2: 2}, r2: {c1: 1}},
          t2: {r1: {c1: 1}},
        });
        expectNoChanges(listener);
      });

      test('addRow', () => {
        store.addRow('t2', {c1: 1});
        expectChanges(listener, '/', {
          t1: {r1: {c2: 2}, r2: {c1: 1}},
          t2: {0: {c1: 1}, r1: {c1: 1}},
        });
        expectNoChanges(listener);
      });

      test('addRow, over existing row', () => {
        store.transaction(() =>
          store.setRow('t2', '1', {c1: 1}).addRow('t2', {c1: 1}),
        );
        expectChanges(listener, '/', {
          t1: {r1: {c2: 2}, r2: {c1: 1}},
          t2: {0: {c1: 1}, 1: {c1: 1}, 2: {c1: 1}, r1: {c1: 1}},
        });
        expectNoChanges(listener);
      });

      test('setPartialRow', () => {
        // @ts-ignore
        store.setPartialRow('t1', 'r1', {c1: 1, c2: 3, c3: undefined});
        expectChanges(listener, '/', {
          t1: {r1: {c2: 3, c1: 1}, r2: {c1: 1}},
          t2: {0: {c1: 1}, 1: {c1: 1}, 2: {c1: 1}, r1: {c1: 1}},
        });
        expectNoChanges(listener);
      });

      test('reset 4', () => {
        store.delTables();
        expectChanges(listener, '/', {});
        expectNoChanges(listener);
      });

      test('setCell', () => {
        store.setCell('t1', 'r1', 'c1', 1);
        expectChanges(listener, '/', {t1: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, same cell', () => {
        store.setCell('t1', 'r1', 'c1', 1);
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, change cell', () => {
        store.setCell('t1', 'r1', 'c1', 2);
        expectChanges(listener, '/', {t1: {r1: {c1: 2}}});
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, different cell', () => {
        store.setCell('t1', 'r1', 'c2', 2);
        expectChanges(listener, '/', {t1: {r1: {c1: 2, c2: 2}}});
        expectNoChanges(listener);
      });

      test('setCell, same table, different row', () => {
        store.setCell('t1', 'r2', 'c1', 1);
        expectChanges(listener, '/', {t1: {r1: {c1: 2, c2: 2}, r2: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setCell, different table', () => {
        store.setCell('t2', 'r1', 'c1', 1);
        expectChanges(listener, '/', {
          t1: {r1: {c1: 2, c2: 2}, r2: {c1: 1}},
          t2: {r1: {c1: 1}},
        });
        expectNoChanges(listener);
      });

      test('setCell, mapped', () => {
        store.setCell('t2', 'r1', 'c1', (cell) => (cell as number) + 1);
        expectChanges(listener, '/', {
          t1: {r1: {c1: 2, c2: 2}, r2: {c1: 1}},
          t2: {r1: {c1: 2}},
        });
        expectNoChanges(listener);
      });

      test('Add things to delete', () => {
        store.transaction(() =>
          store.setTable('t3', {r1: {c1: 1}}).setTable('t4', {r1: {c1: 1}}),
        );
        expectChanges(listener, '/', {
          t1: {r1: {c1: 2, c2: 2}, r2: {c1: 1}},
          t2: {r1: {c1: 2}},
          t3: {r1: {c1: 1}},
          t4: {r1: {c1: 1}},
        });
        expectNoChanges(listener);
      });

      test('delCell', () => {
        store.delCell('t1', 'r1', 'c2');
        expectChanges(listener, '/', {
          t1: {r1: {c1: 2}, r2: {c1: 1}},
          t2: {r1: {c1: 2}},
          t3: {r1: {c1: 1}},
          t4: {r1: {c1: 1}},
        });
        expectNoChanges(listener);
      });

      test('delCell, cascade', () => {
        store.delCell('t2', 'r1', 'c1');
        expectChanges(listener, '/', {
          t1: {r1: {c1: 2}, r2: {c1: 1}},
          t3: {r1: {c1: 1}},
          t4: {r1: {c1: 1}},
        });
        expectNoChanges(listener);
      });

      test('delRow', () => {
        store.delRow('t1', 'r2');
        expectChanges(listener, '/', {
          t1: {r1: {c1: 2}},
          t3: {r1: {c1: 1}},
          t4: {r1: {c1: 1}},
        });
        expectNoChanges(listener);
      });

      test('delRow, cascade', () => {
        store.delRow('t1', 'r1');
        expectChanges(listener, '/', {t3: {r1: {c1: 1}}, t4: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('delTable', () => {
        store.delTable('t3');
        expectChanges(listener, '/', {t4: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('delTables', () => {
        store.delTables();
        expectChanges(listener, '/', {});
      });
    });

    describe('tableIds', () => {
      beforeAll(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToTableIds('/t');
      });

      test('reset 1', () => {
        store.delTables();
        expectNoChanges(listener);
      });

      test('setTables', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t', [['t1'], {t1: 1}]);
        expectNoChanges(listener);
      });

      test('setTables, same table, same row, same cell', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setTables, same table, same row, change cell', () => {
        store.setTables({t1: {r1: {c1: 2}}});
        expectNoChanges(listener);
      });

      test('setTables, same table, same row, different cell', () => {
        store.setTables({t1: {r1: {c2: 2}}});
        expectNoChanges(listener);
      });

      test('setTables, same table, different row', () => {
        store.setTables({t1: {r2: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setTables, different table', () => {
        store.setTables({t2: {r1: {c1: 1}}});
        expectChanges(listener, '/t', [['t2'], {t2: 1, t1: -1}]);
        expectNoChanges(listener);
      });

      test('reset 2', () => {
        store.delTables();
        expectChanges(listener, '/t', [[], {t2: -1}]);
        expectNoChanges(listener);
      });

      test('setTable', () => {
        store.setTable('t1', {r1: {c1: 1}});
        expectChanges(listener, '/t', [['t1'], {t1: 1}]);
        expectNoChanges(listener);
      });

      test('setTable, same table, same row, same cell', () => {
        store.setTable('t1', {r1: {c1: 1}});
        expectNoChanges(listener);
      });

      test('setTable, same table, same row, change cell', () => {
        store.setTable('t1', {r1: {c1: 2}});
        expectNoChanges(listener);
      });

      test('setTable, same table, same row, different cell', () => {
        store.setTable('t1', {r1: {c2: 2}});
        expectNoChanges(listener);
      });

      test('setTable, same table, different row', () => {
        store.setTable('t1', {r2: {c1: 1}});
        expectNoChanges(listener);
      });

      test('setTable, different table', () => {
        store.setTable('t2', {r1: {c1: 1}});
        expectChanges(listener, '/t', [['t1', 't2'], {t2: 1}]);
        expectNoChanges(listener);
      });

      test('reset 3', () => {
        store.delTables();
        expectChanges(listener, '/t', [[], {t1: -1, t2: -1}]);
        expectNoChanges(listener);
      });

      test('setRow', () => {
        store.setRow('t1', 'r1', {c1: 1});
        expectChanges(listener, '/t', [['t1'], {t1: 1}]);
        expectNoChanges(listener);
      });

      test('setRow, same table, same row, same cell', () => {
        store.setRow('t1', 'r1', {c1: 1});
        expectNoChanges(listener);
      });

      test('setRow, same table, same row, change cell', () => {
        store.setRow('t1', 'r1', {c1: 2});
        expectNoChanges(listener);
      });

      test('setRow, same table, same row, different cell', () => {
        store.setRow('t1', 'r1', {c2: 2});
        expectNoChanges(listener);
      });

      test('setRow, same table, different row', () => {
        store.setRow('t1', 'r2', {c1: 1});
        expectNoChanges(listener);
      });

      test('setRow, different table', () => {
        store.setRow('t2', 'r1', {c1: 1});
        expectChanges(listener, '/t', [['t1', 't2'], {t2: 1}]);
        expectNoChanges(listener);
      });

      test('addRow', () => {
        store.addRow('t2', {c1: 1});
        expectNoChanges(listener);
      });

      test('addRow, over existing row', () => {
        store.transaction(() =>
          store.setRow('t2', '1', {c1: 1}).addRow('t2', {c1: 1}),
        );
        expectNoChanges(listener);
      });

      test('setPartialRow', () => {
        // @ts-ignore
        store.setPartialRow('t1', 'r1', {c1: 1, c2: 3, c3: undefined});
        expectNoChanges(listener);
      });

      test('reset 4', () => {
        store.delTables();
        expectChanges(listener, '/t', [[], {t1: -1, t2: -1}]);
        expectNoChanges(listener);
      });

      test('setCell', () => {
        store.setCell('t1', 'r1', 'c1', 1);
        expectChanges(listener, '/t', [['t1'], {t1: 1}]);
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, same cell', () => {
        store.setCell('t1', 'r1', 'c1', 1);
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, change cell', () => {
        store.setCell('t1', 'r1', 'c1', 2);
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, different cell', () => {
        store.setCell('t1', 'r1', 'c2', 2);
        expectNoChanges(listener);
      });

      test('setCell, same table, different row', () => {
        store.setCell('t1', 'r2', 'c1', 1);
        expectNoChanges(listener);
      });

      test('setCell, different table', () => {
        store.setCell('t2', 'r1', 'c1', 1);
        expectChanges(listener, '/t', [['t1', 't2'], {t2: 1}]);
        expectNoChanges(listener);
      });

      test('setCell, mapped', () => {
        store.setCell('t2', 'r1', 'c1', (cell) => (cell as number) + 1);
        expectNoChanges(listener);
      });

      test('Add things to delete', () => {
        store.transaction(() =>
          store.setTable('t3', {r1: {c1: 1}}).setTable('t4', {r1: {c1: 1}}),
        );
        expectChanges(listener, '/t', [
          ['t1', 't2', 't3', 't4'],
          {t3: 1, t4: 1},
        ]);
        expectNoChanges(listener);
      });

      test('delCell', () => {
        store.delCell('t1', 'r1', 'c2');
        expectNoChanges(listener);
      });

      test('delCell, cascade', () => {
        store.delCell('t2', 'r1', 'c1');
        expectChanges(listener, '/t', [['t1', 't3', 't4'], {t2: -1}]);
        expectNoChanges(listener);
      });

      test('delRow', () => {
        store.delRow('t1', 'r2');
        expectNoChanges(listener);
      });

      test('delRow, cascade', () => {
        store.delRow('t1', 'r1');
        expectChanges(listener, '/t', [['t3', 't4'], {t1: -1}]);
        expectNoChanges(listener);
      });

      test('delTable', () => {
        store.delTable('t3');
        expectChanges(listener, '/t', [['t4'], {t3: -1}]);
        expectNoChanges(listener);
      });

      test('delTables', () => {
        store.delTables();
        expectChanges(listener, '/t', [[], {t4: -1}]);
      });
    });

    describe('hasTable', () => {
      beforeAll(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToHasTable('/t1', 't1');
        listener.listenToHasTable('/t2', 't2');
        listener.listenToHasTable('/t3', 't3');
        listener.listenToHasTable('/t4', 't4');
        listener.listenToHasTable('/t*', null);
      });

      test('reset 1', () => {
        store.delTables();
        expectNoChanges(listener);
      });

      test('setTables', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1', {t1: true});
        expectChanges(listener, '/t*', {t1: true});
        expectNoChanges(listener);
      });

      test('setTables, same table, same row, same cell', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setTables, same table, same row, change cell', () => {
        store.setTables({t1: {r1: {c1: 2}}});
        expectNoChanges(listener);
      });

      test('setTables, same table, same row, different cell', () => {
        store.setTables({t1: {r1: {c2: 2}}});
        expectNoChanges(listener);
      });

      test('setTables, same table, different row', () => {
        store.setTables({t1: {r2: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setTables, different table', () => {
        store.setTables({t2: {r1: {c1: 1}}});
        expectChanges(listener, '/t1', {t1: false});
        expectChanges(listener, '/t2', {t2: true});
        expectChanges(listener, '/t*', {t2: true}, {t1: false});
        expectNoChanges(listener);
      });

      test('reset 2', () => {
        store.delTables();
        expectChanges(listener, '/t2', {t2: false});
        expectChanges(listener, '/t*', {t2: false});
        expectNoChanges(listener);
      });

      test('setTable', () => {
        store.setTable('t1', {r1: {c1: 1}});
        expectChanges(listener, '/t1', {t1: true});
        expectChanges(listener, '/t*', {t1: true});
        expectNoChanges(listener);
      });

      test('setTable, same table, same row, same cell', () => {
        store.setTable('t1', {r1: {c1: 1}});
        expectNoChanges(listener);
      });

      test('setTable, same table, same row, change cell', () => {
        store.setTable('t1', {r1: {c1: 2}});
        expectNoChanges(listener);
      });

      test('setTable, same table, same row, different cell', () => {
        store.setTable('t1', {r1: {c2: 2}});
        expectNoChanges(listener);
      });

      test('setTable, same table, different row', () => {
        store.setTable('t1', {r2: {c1: 1}});
        expectNoChanges(listener);
      });

      test('setTable, different table', () => {
        store.setTable('t2', {r1: {c1: 1}});
        expectChanges(listener, '/t2', {t2: true});
        expectChanges(listener, '/t*', {t2: true});
        expectNoChanges(listener);
      });

      test('reset 3', () => {
        store.delTables();
        expectChanges(listener, '/t1', {t1: false});
        expectChanges(listener, '/t2', {t2: false});
        expectChanges(listener, '/t*', {t1: false}, {t2: false});
        expectNoChanges(listener);
      });

      test('setRow', () => {
        store.setRow('t1', 'r1', {c1: 1});
        expectChanges(listener, '/t1', {t1: true});
        expectChanges(listener, '/t*', {t1: true});
        expectNoChanges(listener);
      });

      test('setRow, same table, same row, same cell', () => {
        store.setRow('t1', 'r1', {c1: 1});
        expectNoChanges(listener);
      });

      test('setRow, same table, same row, change cell', () => {
        store.setRow('t1', 'r1', {c1: 2});
        expectNoChanges(listener);
      });

      test('setRow, same table, same row, different cell', () => {
        store.setRow('t1', 'r1', {c2: 2});
        expectNoChanges(listener);
      });

      test('setRow, same table, different row', () => {
        store.setRow('t1', 'r2', {c1: 1});
        expectNoChanges(listener);
      });

      test('setRow, different table', () => {
        store.setRow('t2', 'r1', {c1: 1});
        expectChanges(listener, '/t2', {t2: true});
        expectChanges(listener, '/t*', {t2: true});
        expectNoChanges(listener);
      });

      test('addRow', () => {
        store.addRow('t2', {c1: 1});
        expectNoChanges(listener);
      });

      test('addRow, over existing row', () => {
        store.transaction(() =>
          store.setRow('t2', '1', {c1: 1}).addRow('t2', {c1: 1}),
        );
        expectNoChanges(listener);
      });

      test('setPartialRow', () => {
        // @ts-ignore
        store.setPartialRow('t1', 'r1', {c1: 1, c2: 3, c3: undefined});
        expectNoChanges(listener);
      });

      test('reset 4', () => {
        store.delTables();
        expectChanges(listener, '/t1', {t1: false});
        expectChanges(listener, '/t2', {t2: false});
        expectChanges(listener, '/t*', {t1: false}, {t2: false});
        expectNoChanges(listener);
      });

      test('setCell', () => {
        store.setCell('t1', 'r1', 'c1', 1);
        expectChanges(listener, '/t1', {t1: true});
        expectChanges(listener, '/t*', {t1: true});
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, same cell', () => {
        store.setCell('t1', 'r1', 'c1', 1);
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, change cell', () => {
        store.setCell('t1', 'r1', 'c1', 2);
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, different cell', () => {
        store.setCell('t1', 'r1', 'c2', 2);
        expectNoChanges(listener);
      });

      test('setCell, same table, different row', () => {
        store.setCell('t1', 'r2', 'c1', 1);
        expectNoChanges(listener);
      });

      test('setCell, different table', () => {
        store.setCell('t2', 'r1', 'c1', 1);
        expectChanges(listener, '/t2', {t2: true});
        expectChanges(listener, '/t*', {t2: true});
        expectNoChanges(listener);
      });

      test('setCell, mapped', () => {
        store.setCell('t2', 'r1', 'c1', (cell) => (cell as number) + 1);
        expectNoChanges(listener);
      });

      test('Add things to delete', () => {
        store.transaction(() =>
          store.setTable('t3', {r1: {c1: 1}}).setTable('t4', {r1: {c1: 1}}),
        );
        expectChanges(listener, '/t3', {t3: true});
        expectChanges(listener, '/t4', {t4: true});
        expectChanges(listener, '/t*', {t3: true}, {t4: true});
        expectNoChanges(listener);
      });

      test('delCell', () => {
        store.delCell('t1', 'r1', 'c2');
        expectNoChanges(listener);
      });

      test('delCell, cascade', () => {
        store.delCell('t2', 'r1', 'c1');
        expectChanges(listener, '/t2', {t2: false});
        expectChanges(listener, '/t*', {t2: false});
        expectNoChanges(listener);
      });

      test('delRow', () => {
        store.delRow('t1', 'r2');
        expectNoChanges(listener);
      });

      test('delRow, cascade', () => {
        store.delRow('t1', 'r1');
        expectChanges(listener, '/t1', {t1: false});
        expectChanges(listener, '/t*', {t1: false});
        expectNoChanges(listener);
      });

      test('delTable', () => {
        store.delTable('t3');
        expectChanges(listener, '/t3', {t3: false});
        expectChanges(listener, '/t*', {t3: false});
        expectNoChanges(listener);
      });

      test('delTables', () => {
        store.delTables();
        expectChanges(listener, '/t4', {t4: false});
        expectChanges(listener, '/t*', {t4: false});
      });
    });

    describe('table', () => {
      beforeAll(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToTable('/t1', 't1');
        listener.listenToTable('/t2', 't2');
        listener.listenToTable('/t3', 't3');
        listener.listenToTable('/t4', 't4');
        listener.listenToTable('/t*', null);
      });

      test('reset 1', () => {
        store.delTables();
        expectNoChanges(listener);
      });

      test('setTables', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t*', {t1: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setTables, same table, same row, same cell', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setTables, same table, same row, change cell', () => {
        store.setTables({t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t1', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t*', {t1: {r1: {c1: 2}}});
        expectNoChanges(listener);
      });

      test('setTables, same table, same row, different cell', () => {
        store.setTables({t1: {r1: {c2: 2}}});
        expectChanges(listener, '/t1', {t1: {r1: {c2: 2}}});
        expectChanges(listener, '/t*', {t1: {r1: {c2: 2}}});
        expectNoChanges(listener);
      });

      test('setTables, same table, different row', () => {
        store.setTables({t1: {r2: {c1: 1}}});
        expectChanges(listener, '/t1', {t1: {r2: {c1: 1}}});
        expectChanges(listener, '/t*', {t1: {r2: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setTables, different table', () => {
        store.setTables({t2: {r1: {c1: 1}}});
        expectChanges(listener, '/t1', {t1: {}});
        expectChanges(listener, '/t2', {t2: {r1: {c1: 1}}});
        expectChanges(listener, '/t*', {t2: {r1: {c1: 1}}}, {t1: {}});
        expectNoChanges(listener);
      });

      test('reset 2', () => {
        store.delTables();
        expectChanges(listener, '/t2', {t2: {}});
        expectChanges(listener, '/t*', {t2: {}});
        expectNoChanges(listener);
      });

      test('setTable', () => {
        store.setTable('t1', {r1: {c1: 1}});
        expectChanges(listener, '/t1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t*', {t1: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setTable, same table, same row, same cell', () => {
        store.setTable('t1', {r1: {c1: 1}});
        expectNoChanges(listener);
      });

      test('setTable, same table, same row, change cell', () => {
        store.setTable('t1', {r1: {c1: 2}});
        expectChanges(listener, '/t1', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t*', {t1: {r1: {c1: 2}}});
        expectNoChanges(listener);
      });

      test('setTable, same table, same row, different cell', () => {
        store.setTable('t1', {r1: {c2: 2}});
        expectChanges(listener, '/t1', {t1: {r1: {c2: 2}}});
        expectChanges(listener, '/t*', {t1: {r1: {c2: 2}}});
        expectNoChanges(listener);
      });

      test('setTable, same table, different row', () => {
        store.setTable('t1', {r2: {c1: 1}});
        expectChanges(listener, '/t1', {t1: {r2: {c1: 1}}});
        expectChanges(listener, '/t*', {t1: {r2: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setTable, different table', () => {
        store.setTable('t2', {r1: {c1: 1}});
        expectChanges(listener, '/t2', {t2: {r1: {c1: 1}}});
        expectChanges(listener, '/t*', {t2: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('reset 3', () => {
        store.delTables();
        expectChanges(listener, '/t1', {t1: {}});
        expectChanges(listener, '/t2', {t2: {}});
        expectChanges(listener, '/t*', {t1: {}}, {t2: {}});
        expectNoChanges(listener);
      });

      test('setRow', () => {
        store.setRow('t1', 'r1', {c1: 1});
        expectChanges(listener, '/t1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t*', {t1: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setRow, same table, same row, same cell', () => {
        store.setRow('t1', 'r1', {c1: 1});
        expectNoChanges(listener);
      });

      test('setRow, same table, same row, change cell', () => {
        store.setRow('t1', 'r1', {c1: 2});
        expectChanges(listener, '/t1', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t*', {t1: {r1: {c1: 2}}});
        expectNoChanges(listener);
      });

      test('setRow, same table, same row, different cell', () => {
        store.setRow('t1', 'r1', {c2: 2});
        expectChanges(listener, '/t*', {t1: {r1: {c2: 2}}});
        expectChanges(listener, '/t1', {t1: {r1: {c2: 2}}});
        expectNoChanges(listener);
      });

      test('setRow, same table, different row', () => {
        store.setRow('t1', 'r2', {c1: 1});
        expectChanges(listener, '/t1', {t1: {r1: {c2: 2}, r2: {c1: 1}}});
        expectChanges(listener, '/t*', {t1: {r1: {c2: 2}, r2: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setRow, different table', () => {
        store.setRow('t2', 'r1', {c1: 1});
        expectChanges(listener, '/t2', {t2: {r1: {c1: 1}}});
        expectChanges(listener, '/t*', {t2: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('addRow', () => {
        store.addRow('t2', {c1: 1});
        expectChanges(listener, '/t2', {t2: {0: {c1: 1}, r1: {c1: 1}}});
        expectChanges(listener, '/t*', {t2: {0: {c1: 1}, r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('addRow, over existing row', () => {
        store.transaction(() =>
          store.setRow('t2', '1', {c1: 1}).addRow('t2', {c1: 1}),
        );
        expectChanges(listener, '/t2', {
          t2: {0: {c1: 1}, 1: {c1: 1}, 2: {c1: 1}, r1: {c1: 1}},
        });
        expectChanges(listener, '/t*', {
          t2: {0: {c1: 1}, 1: {c1: 1}, 2: {c1: 1}, r1: {c1: 1}},
        });
        expectNoChanges(listener);
      });

      test('setPartialRow', () => {
        // @ts-ignore
        store.setPartialRow('t1', 'r1', {c1: 1, c2: 3, c3: undefined});
        expectChanges(listener, '/t1', {t1: {r1: {c2: 3, c1: 1}, r2: {c1: 1}}});
        expectChanges(listener, '/t*', {t1: {r1: {c2: 3, c1: 1}, r2: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('reset 4', () => {
        store.delTables();
        expectChanges(listener, '/t1', {t1: {}});
        expectChanges(listener, '/t2', {t2: {}});
        expectChanges(listener, '/t*', {t1: {}}, {t2: {}});
        expectNoChanges(listener);
      });

      test('setCell', () => {
        store.setCell('t1', 'r1', 'c1', 1);
        expectChanges(listener, '/t1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t*', {t1: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, same cell', () => {
        store.setCell('t1', 'r1', 'c1', 1);
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, change cell', () => {
        store.setCell('t1', 'r1', 'c1', 2);
        expectChanges(listener, '/t1', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t*', {t1: {r1: {c1: 2}}});
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, different cell', () => {
        store.setCell('t1', 'r1', 'c2', 2);
        expectChanges(listener, '/t1', {t1: {r1: {c1: 2, c2: 2}}});
        expectChanges(listener, '/t*', {t1: {r1: {c1: 2, c2: 2}}});
        expectNoChanges(listener);
      });

      test('setCell, same table, different row', () => {
        store.setCell('t1', 'r2', 'c1', 1);
        expectChanges(listener, '/t1', {t1: {r1: {c1: 2, c2: 2}, r2: {c1: 1}}});
        expectChanges(listener, '/t*', {t1: {r1: {c1: 2, c2: 2}, r2: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setCell, different table', () => {
        store.setCell('t2', 'r1', 'c1', 1);
        expectChanges(listener, '/t2', {t2: {r1: {c1: 1}}});
        expectChanges(listener, '/t*', {t2: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setCell, mapped', () => {
        store.setCell('t2', 'r1', 'c1', (cell) => (cell as number) + 1);
        expectChanges(listener, '/t2', {t2: {r1: {c1: 2}}});
        expectChanges(listener, '/t*', {t2: {r1: {c1: 2}}});
        expectNoChanges(listener);
      });

      test('Add things to delete', () => {
        store.transaction(() =>
          store.setTable('t3', {r1: {c1: 1}}).setTable('t4', {r1: {c1: 1}}),
        );
        expectChanges(listener, '/t3', {t3: {r1: {c1: 1}}});
        expectChanges(listener, '/t4', {t4: {r1: {c1: 1}}});
        expectChanges(
          listener,
          '/t*',
          {t3: {r1: {c1: 1}}},
          {t4: {r1: {c1: 1}}},
        );
        expectNoChanges(listener);
      });

      test('delCell', () => {
        store.delCell('t1', 'r1', 'c2');
        expectChanges(listener, '/t1', {t1: {r1: {c1: 2}, r2: {c1: 1}}});
        expectChanges(listener, '/t*', {t1: {r1: {c1: 2}, r2: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('delCell, cascade', () => {
        store.delCell('t2', 'r1', 'c1');
        expectChanges(listener, '/t2', {t2: {}});
        expectChanges(listener, '/t*', {t2: {}});
        expectNoChanges(listener);
      });

      test('delRow', () => {
        store.delRow('t1', 'r2');
        expectChanges(listener, '/t1', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t*', {t1: {r1: {c1: 2}}});
        expectNoChanges(listener);
      });

      test('delRow, cascade', () => {
        store.delRow('t1', 'r1');
        expectChanges(listener, '/t1', {t1: {}});
        expectChanges(listener, '/t*', {t1: {}});
        expectNoChanges(listener);
      });

      test('delTable', () => {
        store.delTable('t3');
        expectChanges(listener, '/t3', {t3: {}});
        expectChanges(listener, '/t*', {t3: {}});
        expectNoChanges(listener);
      });

      test('delTables', () => {
        store.delTables();
        expectChanges(listener, '/t4', {t4: {}});
        expectChanges(listener, '/t*', {t4: {}});
      });
    });

    describe('tableCellId', () => {
      beforeAll(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToTableCellIds('/t1c', 't1');
        listener.listenToTableCellIds('/t2c', 't2');
        listener.listenToTableCellIds('/t3c', 't3');
        listener.listenToTableCellIds('/t4c', 't4');
        listener.listenToTableCellIds('/t*c', null);
      });

      test('reset 1', () => {
        store.delTables();
        expectNoChanges(listener);
      });

      test('setTables', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1c', {t1: [['c1'], {c1: 1}]});
        expectChanges(listener, '/t*c', {t1: [['c1'], {c1: 1}]});
        expectNoChanges(listener);
      });

      test('setTables, same table, same row, same cell', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setTables, same table, same row, change cell', () => {
        store.setTables({t1: {r1: {c1: 2}}});
        expectNoChanges(listener);
      });

      test('setTables, same table, same row, different cell', () => {
        store.setTables({t1: {r1: {c2: 2}}});
        expectChanges(listener, '/t1c', {t1: [['c2'], {c2: 1, c1: -1}]});
        expectChanges(listener, '/t*c', {t1: [['c2'], {c2: 1, c1: -1}]});
        expectNoChanges(listener);
      });

      test('setTables, same table, different row', () => {
        store.setTables({t1: {r2: {c1: 1}}});
        expectChanges(listener, '/t1c', {t1: [['c1'], {c1: 1, c2: -1}]});
        expectChanges(listener, '/t*c', {t1: [['c1'], {c1: 1, c2: -1}]});
        expectNoChanges(listener);
      });

      test('setTables, different table', () => {
        store.setTables({t2: {r1: {c1: 1}}});
        expectChanges(listener, '/t1c', {t1: [[], {c1: -1}]});
        expectChanges(listener, '/t2c', {t2: [['c1'], {c1: 1}]});
        expectChanges(
          listener,
          '/t*c',
          {t2: [['c1'], {c1: 1}]},
          {t1: [[], {c1: -1}]},
        );
        expectNoChanges(listener);
      });

      test('reset 2', () => {
        store.delTables();
        expectChanges(listener, '/t2c', {t2: [[], {c1: -1}]});
        expectChanges(listener, '/t*c', {t2: [[], {c1: -1}]});
        expectNoChanges(listener);
      });

      test('setTable', () => {
        store.setTable('t1', {r1: {c1: 1}});
        expectChanges(listener, '/t1c', {t1: [['c1'], {c1: 1}]});
        expectChanges(listener, '/t*c', {t1: [['c1'], {c1: 1}]});
        expectNoChanges(listener);
      });

      test('setTable, same table, same row, same cell', () => {
        store.setTable('t1', {r1: {c1: 1}});
        expectNoChanges(listener);
      });

      test('setTable, same table, same row, change cell', () => {
        store.setTable('t1', {r1: {c1: 2}});
        expectNoChanges(listener);
      });

      test('setTable, same table, same row, different cell', () => {
        store.setTable('t1', {r1: {c2: 2}});
        expectChanges(listener, '/t1c', {t1: [['c2'], {c2: 1, c1: -1}]});
        expectChanges(listener, '/t*c', {t1: [['c2'], {c2: 1, c1: -1}]});
        expectNoChanges(listener);
      });

      test('setTable, same table, different row', () => {
        store.setTable('t1', {r2: {c1: 1}});
        expectChanges(listener, '/t1c', {t1: [['c1'], {c1: 1, c2: -1}]});
        expectChanges(listener, '/t*c', {t1: [['c1'], {c1: 1, c2: -1}]});
        expectNoChanges(listener);
      });

      test('setTable, different table', () => {
        store.setTable('t2', {r1: {c1: 1}});
        expectChanges(listener, '/t2c', {t2: [['c1'], {c1: 1}]});
        expectChanges(listener, '/t*c', {t2: [['c1'], {c1: 1}]});
        expectNoChanges(listener);
      });

      test('reset 3', () => {
        store.delTables();
        expectChanges(listener, '/t1c', {t1: [[], {c1: -1}]});
        expectChanges(listener, '/t2c', {t2: [[], {c1: -1}]});
        expectChanges(
          listener,
          '/t*c',
          {t1: [[], {c1: -1}]},
          {t2: [[], {c1: -1}]},
        );
        expectNoChanges(listener);
      });

      test('setRow', () => {
        store.setRow('t1', 'r1', {c1: 1});
        expectChanges(listener, '/t1c', {t1: [['c1'], {c1: 1}]});
        expectChanges(listener, '/t*c', {t1: [['c1'], {c1: 1}]});
        expectNoChanges(listener);
      });

      test('setRow, same table, same row, same cell', () => {
        store.setRow('t1', 'r1', {c1: 1});
        expectNoChanges(listener);
      });

      test('setRow, same table, same row, change cell', () => {
        store.setRow('t1', 'r1', {c1: 2});
        expectNoChanges(listener);
      });

      test('setRow, same table, same row, different cell', () => {
        store.setRow('t1', 'r1', {c2: 2});
        expectChanges(listener, '/t1c', {t1: [['c2'], {c2: 1, c1: -1}]});
        expectChanges(listener, '/t*c', {t1: [['c2'], {c2: 1, c1: -1}]});
        expectNoChanges(listener);
      });

      test('setRow, same table, different row', () => {
        store.setRow('t1', 'r2', {c1: 1});
        expectChanges(listener, '/t1c', {t1: [['c2', 'c1'], {c1: 1}]});
        expectChanges(listener, '/t*c', {t1: [['c2', 'c1'], {c1: 1}]});
        expectNoChanges(listener);
      });

      test('setRow, different table', () => {
        store.setRow('t2', 'r1', {c1: 1});
        expectChanges(listener, '/t2c', {t2: [['c1'], {c1: 1}]});
        expectChanges(listener, '/t*c', {t2: [['c1'], {c1: 1}]});
        expectNoChanges(listener);
      });

      test('addRow', () => {
        store.addRow('t2', {c1: 1});
        expectNoChanges(listener);
      });

      test('addRow, over existing row', () => {
        store.transaction(() =>
          store.setRow('t2', '1', {c1: 1}).addRow('t2', {c1: 1}),
        );
        expectNoChanges(listener);
      });

      test('setPartialRow', () => {
        // @ts-ignore
        store.setPartialRow('t1', 'r1', {c1: 1, c2: 3, c3: undefined});
        expectNoChanges(listener);
      });

      test('reset 4', () => {
        store.delTables();
        expectChanges(listener, '/t1c', {t1: [[], {c2: -1, c1: -1}]});
        expectChanges(listener, '/t2c', {t2: [[], {c1: -1}]});
        expectChanges(
          listener,
          '/t*c',
          {t1: [[], {c2: -1, c1: -1}]},
          {t2: [[], {c1: -1}]},
        );
        expectNoChanges(listener);
      });

      test('setCell', () => {
        store.setCell('t1', 'r1', 'c1', 1);
        expectChanges(listener, '/t1c', {t1: [['c1'], {c1: 1}]});
        expectChanges(listener, '/t*c', {t1: [['c1'], {c1: 1}]});
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, same cell', () => {
        store.setCell('t1', 'r1', 'c1', 1);
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, change cell', () => {
        store.setCell('t1', 'r1', 'c1', 2);
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, different cell', () => {
        store.setCell('t1', 'r1', 'c2', 2);
        expectChanges(listener, '/t1c', {t1: [['c1', 'c2'], {c2: 1}]});
        expectChanges(listener, '/t*c', {t1: [['c1', 'c2'], {c2: 1}]});
        expectNoChanges(listener);
      });

      test('setCell, same table, different row', () => {
        store.setCell('t1', 'r2', 'c1', 1);
        expectNoChanges(listener);
      });

      test('setCell, different table', () => {
        store.setCell('t2', 'r1', 'c1', 1);
        expectChanges(listener, '/t2c', {t2: [['c1'], {c1: 1}]});
        expectChanges(listener, '/t*c', {t2: [['c1'], {c1: 1}]});
        expectNoChanges(listener);
      });

      test('setCell, mapped', () => {
        store.setCell('t2', 'r1', 'c1', (cell) => (cell as number) + 1);
        expectNoChanges(listener);
      });

      test('Add things to delete', () => {
        store.transaction(() =>
          store.setTable('t3', {r1: {c1: 1}}).setTable('t4', {r1: {c1: 1}}),
        );
        expectChanges(listener, '/t3c', {t3: [['c1'], {c1: 1}]});
        expectChanges(listener, '/t4c', {t4: [['c1'], {c1: 1}]});
        expectChanges(
          listener,
          '/t*c',
          {t3: [['c1'], {c1: 1}]},
          {t4: [['c1'], {c1: 1}]},
        );
        expectNoChanges(listener);
      });

      test('delCell', () => {
        store.delCell('t1', 'r1', 'c2');
        expectChanges(listener, '/t1c', {t1: [['c1'], {c2: -1}]});
        expectChanges(listener, '/t*c', {t1: [['c1'], {c2: -1}]});
        expectNoChanges(listener);
      });

      test('delCell, cascade', () => {
        store.delCell('t2', 'r1', 'c1');
        expectChanges(listener, '/t2c', {t2: [[], {c1: -1}]});
        expectChanges(listener, '/t*c', {t2: [[], {c1: -1}]});
        expectNoChanges(listener);
      });

      test('delRow', () => {
        store.delRow('t1', 'r2');
        expectNoChanges(listener);
      });

      test('delRow, cascade', () => {
        store.delRow('t1', 'r1');
        expectChanges(listener, '/t1c', {t1: [[], {c1: -1}]});
        expectChanges(listener, '/t*c', {t1: [[], {c1: -1}]});
        expectNoChanges(listener);
      });

      test('delTable', () => {
        store.delTable('t3');
        expectChanges(listener, '/t3c', {t3: [[], {c1: -1}]});
        expectChanges(listener, '/t*c', {t3: [[], {c1: -1}]});
        expectNoChanges(listener);
      });

      test('delTables', () => {
        store.delTables();
        expectChanges(listener, '/t4c', {t4: [[], {c1: -1}]});
        expectChanges(listener, '/t*c', {t4: [[], {c1: -1}]});
      });
    });

    describe('hasTableCell', () => {
      beforeAll(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToHasTableCell('/t1/c1', 't1', 'c1');
        listener.listenToHasTableCell('/t1/c2', 't1', 'c2');
        listener.listenToHasTableCell('/t1/c*', 't1', null);
        listener.listenToHasTableCell('/t*/c1', null, 'c1');
        listener.listenToHasTableCell('/t*/c*', null, null);
      });

      test('reset 1', () => {
        store.delTables();
        expectNoChanges(listener);
      });

      test('setTables', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/c1', {t1: {c1: true}});
        expectChanges(listener, '/t1/c*', {t1: {c1: true}});
        expectChanges(listener, '/t*/c1', {t1: {c1: true}});
        expectChanges(listener, '/t*/c*', {t1: {c1: true}});
        expectNoChanges(listener);
      });

      test('setTables, same table, same row, same cell', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setTables, same table, same row, change cell', () => {
        store.setTables({t1: {r1: {c1: 2}}});
        expectNoChanges(listener);
      });

      test('setTables, same table, same row, different cell', () => {
        store.setTables({t1: {r1: {c2: 2}}});
        expectChanges(listener, '/t1/c1', {t1: {c1: false}});
        expectChanges(listener, '/t1/c2', {t1: {c2: true}});
        expectChanges(listener, '/t1/c*', {t1: {c2: true}}, {t1: {c1: false}});
        expectChanges(listener, '/t*/c1', {t1: {c1: false}});
        expectChanges(listener, '/t*/c*', {t1: {c2: true}}, {t1: {c1: false}});
        expectNoChanges(listener);
      });

      test('setTables, same table, different row', () => {
        store.setTables({t1: {r2: {c1: 1}}});
        expectChanges(listener, '/t1/c1', {t1: {c1: true}});
        expectChanges(listener, '/t1/c2', {t1: {c2: false}});
        expectChanges(listener, '/t1/c*', {t1: {c1: true}}, {t1: {c2: false}});
        expectChanges(listener, '/t*/c1', {t1: {c1: true}});
        expectChanges(listener, '/t*/c*', {t1: {c1: true}}, {t1: {c2: false}});
        expectNoChanges(listener);
      });

      test('setTables, different table', () => {
        store.setTables({t2: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/c1', {t1: {c1: false}});
        expectChanges(listener, '/t1/c*', {t1: {c1: false}});
        expectChanges(listener, '/t*/c1', {t2: {c1: true}}, {t1: {c1: false}});
        expectChanges(listener, '/t*/c*', {t2: {c1: true}}, {t1: {c1: false}});
        expectNoChanges(listener);
      });

      test('reset 2', () => {
        store.delTables();
        expectChanges(listener, '/t*/c1', {t2: {c1: false}});
        expectChanges(listener, '/t*/c*', {t2: {c1: false}});
        expectNoChanges(listener);
      });

      test('setTable', () => {
        store.setTable('t1', {r1: {c1: 1}});
        expectChanges(listener, '/t1/c1', {t1: {c1: true}});
        expectChanges(listener, '/t1/c*', {t1: {c1: true}});
        expectChanges(listener, '/t*/c1', {t1: {c1: true}});
        expectChanges(listener, '/t*/c*', {t1: {c1: true}});
        expectNoChanges(listener);
      });

      test('setTable, same table, same row, same cell', () => {
        store.setTable('t1', {r1: {c1: 1}});
        expectNoChanges(listener);
      });

      test('setTable, same table, same row, change cell', () => {
        store.setTable('t1', {r1: {c1: 2}});
        expectNoChanges(listener);
      });

      test('setTable, same table, same row, different cell', () => {
        store.setTable('t1', {r1: {c2: 2}});
        expectChanges(listener, '/t1/c1', {t1: {c1: false}});
        expectChanges(listener, '/t1/c2', {t1: {c2: true}});
        expectChanges(listener, '/t1/c*', {t1: {c2: true}}, {t1: {c1: false}});
        expectChanges(listener, '/t*/c1', {t1: {c1: false}});
        expectChanges(listener, '/t*/c*', {t1: {c2: true}}, {t1: {c1: false}});
        expectNoChanges(listener);
      });

      test('setTable, same table, different row', () => {
        store.setTable('t1', {r2: {c1: 1}});
        expectChanges(listener, '/t1/c1', {t1: {c1: true}});
        expectChanges(listener, '/t1/c2', {t1: {c2: false}});
        expectChanges(listener, '/t1/c*', {t1: {c1: true}}, {t1: {c2: false}});
        expectChanges(listener, '/t*/c1', {t1: {c1: true}});
        expectChanges(listener, '/t*/c*', {t1: {c1: true}}, {t1: {c2: false}});
        expectNoChanges(listener);
      });

      test('setTable, different table', () => {
        store.setTable('t2', {r1: {c1: 1}});
        expectChanges(listener, '/t*/c1', {t2: {c1: true}});
        expectChanges(listener, '/t*/c*', {t2: {c1: true}});
        expectNoChanges(listener);
      });

      test('reset 3', () => {
        store.delTables();
        expectChanges(listener, '/t1/c1', {t1: {c1: false}});
        expectChanges(listener, '/t1/c*', {t1: {c1: false}});
        expectChanges(listener, '/t*/c1', {t1: {c1: false}}, {t2: {c1: false}});
        expectChanges(listener, '/t*/c*', {t1: {c1: false}}, {t2: {c1: false}});
        expectNoChanges(listener);
      });

      test('setRow', () => {
        store.setRow('t1', 'r1', {c1: true});
        expectChanges(listener, '/t1/c1', {t1: {c1: true}});
        expectChanges(listener, '/t1/c*', {t1: {c1: true}});
        expectChanges(listener, '/t*/c1', {t1: {c1: true}});
        expectChanges(listener, '/t*/c*', {t1: {c1: true}});
        expectNoChanges(listener);
      });

      test('setRow, same table, same row, same cell', () => {
        store.setRow('t1', 'r1', {c1: 1});
        expectNoChanges(listener);
      });

      test('setRow, same table, same row, change cell', () => {
        store.setRow('t1', 'r1', {c1: 2});
        expectNoChanges(listener);
      });

      test('setRow, same table, same row, different cell', () => {
        store.setRow('t1', 'r1', {c2: 2});
        expectChanges(listener, '/t1/c1', {t1: {c1: false}});
        expectChanges(listener, '/t1/c2', {t1: {c2: true}});
        expectChanges(listener, '/t1/c*', {t1: {c2: true}}, {t1: {c1: false}});
        expectChanges(listener, '/t*/c1', {t1: {c1: false}});
        expectChanges(listener, '/t*/c*', {t1: {c2: true}}, {t1: {c1: false}});
        expectNoChanges(listener);
      });

      test('setRow, same table, different row', () => {
        store.setRow('t1', 'r2', {c1: 1});
        expectChanges(listener, '/t1/c1', {t1: {c1: true}});
        expectChanges(listener, '/t1/c*', {t1: {c1: true}});
        expectChanges(listener, '/t*/c1', {t1: {c1: true}});
        expectChanges(listener, '/t*/c*', {t1: {c1: true}});
        expectNoChanges(listener);
      });

      test('setRow, different table', () => {
        store.setRow('t2', 'r1', {c1: 1});
        expectChanges(listener, '/t*/c1', {t2: {c1: true}});
        expectChanges(listener, '/t*/c*', {t2: {c1: true}});
        expectNoChanges(listener);
      });

      test('addRow', () => {
        store.addRow('t2', {c1: 1});
        expectNoChanges(listener);
      });

      test('addRow, over existing row', () => {
        store.transaction(() =>
          store.setRow('t2', '1', {c1: 1}).addRow('t2', {c1: 1}),
        );
        expectNoChanges(listener);
      });

      test('setPartialRow', () => {
        // @ts-ignore
        store.setPartialRow('t1', 'r1', {c1: 1, c2: 3, c3: undefined});
        expectNoChanges(listener);
      });

      test('reset 4', () => {
        store.delTables();
        expectChanges(listener, '/t1/c1', {t1: {c1: false}});
        expectChanges(listener, '/t1/c2', {t1: {c2: false}});
        expectChanges(listener, '/t1/c*', {t1: {c2: false}}, {t1: {c1: false}});
        expectChanges(listener, '/t*/c1', {t1: {c1: false}}, {t2: {c1: false}});
        expectChanges(
          listener,
          '/t*/c*',
          {t1: {c2: false}},
          {t1: {c1: false}},
          {t2: {c1: false}},
        );
        expectNoChanges(listener);
      });

      test('setCell', () => {
        store.setCell('t1', 'r1', 'c1', 1);
        expectChanges(listener, '/t1/c1', {t1: {c1: true}});
        expectChanges(listener, '/t1/c*', {t1: {c1: true}});
        expectChanges(listener, '/t*/c1', {t1: {c1: true}});
        expectChanges(listener, '/t*/c*', {t1: {c1: true}});
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, same cell', () => {
        store.setCell('t1', 'r1', 'c1', 1);
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, change cell', () => {
        store.setCell('t1', 'r1', 'c1', 2);
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, different cell', () => {
        store.setCell('t1', 'r1', 'c2', 2);
        expectChanges(listener, '/t1/c2', {t1: {c2: true}});
        expectChanges(listener, '/t1/c*', {t1: {c2: true}});
        expectChanges(listener, '/t*/c*', {t1: {c2: true}});
        expectNoChanges(listener);
      });

      test('setCell, same table, different row', () => {
        store.setCell('t1', 'r2', 'c1', 1);
        expectNoChanges(listener);
      });

      test('setCell, different table', () => {
        store.setCell('t2', 'r1', 'c1', 1);
        expectChanges(listener, '/t*/c1', {t2: {c1: true}});
        expectChanges(listener, '/t*/c*', {t2: {c1: true}});
        expectNoChanges(listener);
      });

      test('setCell, mapped', () => {
        store.setCell('t2', 'r1', 'c1', (cell) => (cell as number) + 1);
        expectNoChanges(listener);
      });

      test('Add things to delete', () => {
        store.transaction(() =>
          store.setTable('t3', {r1: {c1: 1}}).setTable('t4', {r1: {c1: 1}}),
        );
        expectChanges(listener, '/t*/c1', {t3: {c1: true}}, {t4: {c1: true}});
        expectChanges(listener, '/t*/c*', {t3: {c1: true}}, {t4: {c1: true}});
        expectNoChanges(listener);
      });

      test('delCell', () => {
        store.delCell('t1', 'r1', 'c2');
        expectChanges(listener, '/t1/c2', {t1: {c2: false}});
        expectChanges(listener, '/t1/c*', {t1: {c2: false}});
        expectChanges(listener, '/t*/c*', {t1: {c2: false}});
        expectNoChanges(listener);
      });

      test('delCell, cascade', () => {
        store.delCell('t2', 'r1', 'c1');
        expectChanges(listener, '/t*/c1', {t2: {c1: false}});
        expectChanges(listener, '/t*/c*', {t2: {c1: false}});
        expectNoChanges(listener);
      });

      test('delRow', () => {
        store.delRow('t1', 'r2');
        expectNoChanges(listener);
      });

      test('delRow, cascade', () => {
        store.delRow('t1', 'r1');
        expectChanges(listener, '/t1/c1', {t1: {c1: false}});
        expectChanges(listener, '/t1/c*', {t1: {c1: false}});
        expectChanges(listener, '/t*/c1', {t1: {c1: false}});
        expectChanges(listener, '/t*/c*', {t1: {c1: false}});
        expectNoChanges(listener);
      });

      test('delTable', () => {
        store.delTable('t3');
        expectChanges(listener, '/t*/c1', {t3: {c1: false}});
        expectChanges(listener, '/t*/c*', {t3: {c1: false}});
        expectNoChanges(listener);
      });

      test('delTables', () => {
        store.delTables();
        expectChanges(listener, '/t*/c1', {t4: {c1: false}});
        expectChanges(listener, '/t*/c*', {t4: {c1: false}});
      });
    });

    describe('rowCount', () => {
      beforeAll(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToRowCount('/t1r', 't1');
        listener.listenToRowCount('/t2r', 't2');
        listener.listenToRowCount('/t3r', 't3');
        listener.listenToRowCount('/t4r', 't4');
        listener.listenToRowCount('/t*r', null);
      });

      test('reset 1', () => {
        store.delTables();
        expectNoChanges(listener);
      });

      test('setTables', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1r', {t1: 1});
        expectChanges(listener, '/t*r', {t1: 1});
        expectNoChanges(listener);
      });

      test('setTables, same table, same row, same cell', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setTables, same table, same row, change cell', () => {
        store.setTables({t1: {r1: {c1: 2}}});
        expectNoChanges(listener);
      });

      test('setTables, same table, same row, different cell', () => {
        store.setTables({t1: {r1: {c2: 2}}});
        expectNoChanges(listener);
      });

      test('setTables, same table, different row', () => {
        store.setTables({t1: {r2: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setTables, different table', () => {
        store.setTables({t2: {r1: {c1: 1}}});
        expectChanges(listener, '/t1r', {t1: 0});
        expectChanges(listener, '/t2r', {t2: 1});
        expectChanges(listener, '/t*r', {t2: 1}, {t1: 0});
        expectNoChanges(listener);
      });

      test('reset 2', () => {
        store.delTables();
        expectChanges(listener, '/t2r', {t2: 0});
        expectChanges(listener, '/t*r', {t2: 0});
        expectNoChanges(listener);
      });

      test('setTable', () => {
        store.setTable('t1', {r1: {c1: 1}});
        expectChanges(listener, '/t1r', {t1: 1});
        expectChanges(listener, '/t*r', {t1: 1});
        expectNoChanges(listener);
      });

      test('setTable, same table, same row, same cell', () => {
        store.setTable('t1', {r1: {c1: 1}});
        expectNoChanges(listener);
      });

      test('setTable, same table, same row, change cell', () => {
        store.setTable('t1', {r1: {c1: 2}});
        expectNoChanges(listener);
      });

      test('setTable, same table, same row, different cell', () => {
        store.setTable('t1', {r1: {c2: 2}});
        expectNoChanges(listener);
      });

      test('setTable, same table, different row', () => {
        store.setTable('t1', {r2: {c1: 1}});
        expectNoChanges(listener);
      });

      test('setTable, different table', () => {
        store.setTable('t2', {r1: {c1: 1}});
        expectChanges(listener, '/t2r', {t2: 1});
        expectChanges(listener, '/t*r', {t2: 1});
        expectNoChanges(listener);
      });

      test('reset 3', () => {
        store.delTables();
        expectChanges(listener, '/t1r', {t1: 0});
        expectChanges(listener, '/t2r', {t2: 0});
        expectChanges(listener, '/t*r', {t1: 0}, {t2: 0});
        expectNoChanges(listener);
      });

      test('setRow', () => {
        store.setRow('t1', 'r1', {c1: 1});
        expectChanges(listener, '/t1r', {t1: 1});
        expectChanges(listener, '/t*r', {t1: 1});
        expectNoChanges(listener);
      });

      test('setRow, same table, same row, same cell', () => {
        store.setRow('t1', 'r1', {c1: 1});
        expectNoChanges(listener);
      });

      test('setRow, same table, same row, change cell', () => {
        store.setRow('t1', 'r1', {c1: 2});
        expectNoChanges(listener);
      });

      test('setRow, same table, same row, different cell', () => {
        store.setRow('t1', 'r1', {c2: 2});
        expectNoChanges(listener);
      });

      test('setRow, same table, different row', () => {
        store.setRow('t1', 'r2', {c1: 1});
        expectChanges(listener, '/t1r', {t1: 2});
        expectChanges(listener, '/t*r', {t1: 2});
        expectNoChanges(listener);
      });

      test('setRow, different table', () => {
        store.setRow('t2', 'r1', {c1: 1});
        expectChanges(listener, '/t2r', {t2: 1});
        expectChanges(listener, '/t*r', {t2: 1});
        expectNoChanges(listener);
      });

      test('addRow', () => {
        store.addRow('t2', {c1: 1});
        expectChanges(listener, '/t2r', {t2: 2});
        expectChanges(listener, '/t*r', {t2: 2});
        expectNoChanges(listener);
      });

      test('addRow, over existing row', () => {
        store.transaction(() =>
          store.setRow('t2', '1', {c1: 1}).addRow('t2', {c1: 1}),
        );
        expectChanges(listener, '/t2r', {t2: 4});
        expectChanges(listener, '/t*r', {t2: 4});
        expectNoChanges(listener);
      });

      test('setPartialRow', () => {
        // @ts-ignore
        store.setPartialRow('t1', 'r1', {c1: 1, c2: 3, c3: undefined});
        expectNoChanges(listener);
      });

      test('reset 4', () => {
        store.delTables();
        expectChanges(listener, '/t1r', {t1: 0});
        expectChanges(listener, '/t2r', {
          t2: 0,
        });
        expectChanges(listener, '/t*r', {t1: 0}, {t2: 0});
        expectNoChanges(listener);
      });

      test('setCell', () => {
        store.setCell('t1', 'r1', 'c1', 1);
        expectChanges(listener, '/t1r', {t1: 1});
        expectChanges(listener, '/t*r', {t1: 1});
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, same cell', () => {
        store.setCell('t1', 'r1', 'c1', 1);
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, change cell', () => {
        store.setCell('t1', 'r1', 'c1', 2);
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, different cell', () => {
        store.setCell('t1', 'r1', 'c2', 2);
        expectNoChanges(listener);
      });

      test('setCell, same table, different row', () => {
        store.setCell('t1', 'r2', 'c1', 1);
        expectChanges(listener, '/t1r', {t1: 2});
        expectChanges(listener, '/t*r', {t1: 2});
        expectNoChanges(listener);
      });

      test('setCell, different table', () => {
        store.setCell('t2', 'r1', 'c1', 1);
        expectChanges(listener, '/t2r', {t2: 1});
        expectChanges(listener, '/t*r', {t2: 1});
        expectNoChanges(listener);
      });

      test('setCell, mapped', () => {
        store.setCell('t2', 'r1', 'c1', (cell) => (cell as number) + 1);
        expectNoChanges(listener);
      });

      test('Add things to delete', () => {
        store.transaction(() =>
          store.setTable('t3', {r1: {c1: 1}}).setTable('t4', {r1: {c1: 1}}),
        );
        expectChanges(listener, '/t3r', {t3: 1});
        expectChanges(listener, '/t4r', {t4: 1});
        expectChanges(listener, '/t*r', {t3: 1}, {t4: 1});
        expectNoChanges(listener);
      });

      test('delCell', () => {
        store.delCell('t1', 'r1', 'c2');
        expectNoChanges(listener);
      });

      test('delCell, cascade', () => {
        store.delCell('t2', 'r1', 'c1');
        expectChanges(listener, '/t2r', {t2: 0});
        expectChanges(listener, '/t*r', {t2: 0});
        expectNoChanges(listener);
      });

      test('delRow', () => {
        store.delRow('t1', 'r2');
        expectChanges(listener, '/t1r', {t1: 1});
        expectChanges(listener, '/t*r', {t1: 1});
        expectNoChanges(listener);
      });

      test('delRow, cascade', () => {
        store.delRow('t1', 'r1');
        expectChanges(listener, '/t1r', {t1: 0});
        expectChanges(listener, '/t*r', {t1: 0});
        expectNoChanges(listener);
      });

      test('delTable', () => {
        store.delTable('t3');
        expectChanges(listener, '/t3r', {t3: 0});
        expectChanges(listener, '/t*r', {t3: 0});
        expectNoChanges(listener);
      });

      test('delTables', () => {
        store.delTables();
        expectChanges(listener, '/t4r', {t4: 0});
        expectChanges(listener, '/t*r', {t4: 0});
      });
    });

    describe('rowIds', () => {
      beforeAll(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToRowIds('/t1r', 't1');
        listener.listenToRowIds('/t2r', 't2');
        listener.listenToRowIds('/t3r', 't3');
        listener.listenToRowIds('/t4r', 't4');
        listener.listenToRowIds('/t*r', null);
      });

      test('reset 1', () => {
        store.delTables();
        expectNoChanges(listener);
      });

      test('setTables', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1r', {t1: [['r1'], {r1: 1}]});
        expectChanges(listener, '/t*r', {t1: [['r1'], {r1: 1}]});
        expectNoChanges(listener);
      });

      test('setTables, same table, same row, same cell', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setTables, same table, same row, change cell', () => {
        store.setTables({t1: {r1: {c1: 2}}});
        expectNoChanges(listener);
      });

      test('setTables, same table, same row, different cell', () => {
        store.setTables({t1: {r1: {c2: 2}}});
        expectNoChanges(listener);
      });

      test('setTables, same table, different row', () => {
        store.setTables({t1: {r2: {c1: 1}}});
        expectChanges(listener, '/t1r', {t1: [['r2'], {r2: 1, r1: -1}]});
        expectChanges(listener, '/t*r', {t1: [['r2'], {r2: 1, r1: -1}]});
        expectNoChanges(listener);
      });

      test('setTables, different table', () => {
        store.setTables({t2: {r1: {c1: 1}}});
        expectChanges(listener, '/t1r', {t1: [[], {r2: -1}]});
        expectChanges(listener, '/t2r', {t2: [['r1'], {r1: 1}]});
        expectChanges(
          listener,
          '/t*r',
          {t2: [['r1'], {r1: 1}]},
          {t1: [[], {r2: -1}]},
        );
        expectNoChanges(listener);
      });

      test('reset 2', () => {
        store.delTables();
        expectChanges(listener, '/t2r', {t2: [[], {r1: -1}]});
        expectChanges(listener, '/t*r', {t2: [[], {r1: -1}]});
        expectNoChanges(listener);
      });

      test('setTable', () => {
        store.setTable('t1', {r1: {c1: 1}});
        expectChanges(listener, '/t1r', {t1: [['r1'], {r1: 1}]});
        expectChanges(listener, '/t*r', {t1: [['r1'], {r1: 1}]});
        expectNoChanges(listener);
      });

      test('setTable, same table, same row, same cell', () => {
        store.setTable('t1', {r1: {c1: 1}});
        expectNoChanges(listener);
      });

      test('setTable, same table, same row, change cell', () => {
        store.setTable('t1', {r1: {c1: 2}});
        expectNoChanges(listener);
      });

      test('setTable, same table, same row, different cell', () => {
        store.setTable('t1', {r1: {c2: 2}});
        expectNoChanges(listener);
      });

      test('setTable, same table, different row', () => {
        store.setTable('t1', {r2: {c1: 1}});
        expectChanges(listener, '/t1r', {t1: [['r2'], {r2: 1, r1: -1}]});
        expectChanges(listener, '/t*r', {t1: [['r2'], {r2: 1, r1: -1}]});
        expectNoChanges(listener);
      });

      test('setTable, different table', () => {
        store.setTable('t2', {r1: {c1: 1}});
        expectChanges(listener, '/t2r', {t2: [['r1'], {r1: 1}]});
        expectChanges(listener, '/t*r', {t2: [['r1'], {r1: 1}]});
        expectNoChanges(listener);
      });

      test('reset 3', () => {
        store.delTables();
        expectChanges(listener, '/t1r', {t1: [[], {r2: -1}]});
        expectChanges(listener, '/t2r', {t2: [[], {r1: -1}]});
        expectChanges(
          listener,
          '/t*r',
          {t1: [[], {r2: -1}]},
          {t2: [[], {r1: -1}]},
        );
        expectNoChanges(listener);
      });

      test('setRow', () => {
        store.setRow('t1', 'r1', {c1: 1});
        expectChanges(listener, '/t1r', {t1: [['r1'], {r1: 1}]});
        expectChanges(listener, '/t*r', {t1: [['r1'], {r1: 1}]});
        expectNoChanges(listener);
      });

      test('setRow, same table, same row, same cell', () => {
        store.setRow('t1', 'r1', {c1: 1});
        expectNoChanges(listener);
      });

      test('setRow, same table, same row, change cell', () => {
        store.setRow('t1', 'r1', {c1: 2});
        expectNoChanges(listener);
      });

      test('setRow, same table, same row, different cell', () => {
        store.setRow('t1', 'r1', {c2: 2});
        expectNoChanges(listener);
      });

      test('setRow, same table, different row', () => {
        store.setRow('t1', 'r2', {c1: 1});
        expectChanges(listener, '/t1r', {t1: [['r1', 'r2'], {r2: 1}]});
        expectChanges(listener, '/t*r', {t1: [['r1', 'r2'], {r2: 1}]});
        expectNoChanges(listener);
      });

      test('setRow, different table', () => {
        store.setRow('t2', 'r1', {c1: 1});
        expectChanges(listener, '/t2r', {t2: [['r1'], {r1: 1}]});
        expectChanges(listener, '/t*r', {t2: [['r1'], {r1: 1}]});
        expectNoChanges(listener);
      });

      test('addRow', () => {
        store.addRow('t2', {c1: 1});
        expectChanges(listener, '/t2r', {t2: [['r1', '0'], {0: 1}]});
        expectChanges(listener, '/t*r', {t2: [['r1', '0'], {0: 1}]});
        expectNoChanges(listener);
      });

      test('addRow, over existing row', () => {
        store.transaction(() =>
          store.setRow('t2', '1', {c1: 1}).addRow('t2', {c1: 1}),
        );
        expectChanges(listener, '/t2r', {
          t2: [['r1', '0', '1', '2'], {1: 1, 2: 1}],
        });
        expectChanges(listener, '/t*r', {
          t2: [['r1', '0', '1', '2'], {1: 1, 2: 1}],
        });
        expectNoChanges(listener);
      });

      test('setPartialRow', () => {
        // @ts-ignore
        store.setPartialRow('t1', 'r1', {c1: 1, c2: 3, c3: undefined});
        expectNoChanges(listener);
      });

      test('reset 4', () => {
        store.delTables();
        expectChanges(listener, '/t1r', {t1: [[], {r1: -1, r2: -1}]});
        expectChanges(listener, '/t2r', {
          t2: [[], {'0': -1, '1': -1, '2': -1, r1: -1}],
        });
        expectChanges(
          listener,
          '/t*r',
          {t1: [[], {r1: -1, r2: -1}]},
          {t2: [[], {'0': -1, '1': -1, '2': -1, r1: -1}]},
        );
        expectNoChanges(listener);
      });

      test('setCell', () => {
        store.setCell('t1', 'r1', 'c1', 1);
        expectChanges(listener, '/t1r', {t1: [['r1'], {r1: 1}]});
        expectChanges(listener, '/t*r', {t1: [['r1'], {r1: 1}]});
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, same cell', () => {
        store.setCell('t1', 'r1', 'c1', 1);
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, change cell', () => {
        store.setCell('t1', 'r1', 'c1', 2);
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, different cell', () => {
        store.setCell('t1', 'r1', 'c2', 2);
        expectNoChanges(listener);
      });

      test('setCell, same table, different row', () => {
        store.setCell('t1', 'r2', 'c1', 1);
        expectChanges(listener, '/t1r', {t1: [['r1', 'r2'], {r2: 1}]});
        expectChanges(listener, '/t*r', {t1: [['r1', 'r2'], {r2: 1}]});
        expectNoChanges(listener);
      });

      test('setCell, different table', () => {
        store.setCell('t2', 'r1', 'c1', 1);
        expectChanges(listener, '/t2r', {t2: [['r1'], {r1: 1}]});
        expectChanges(listener, '/t*r', {t2: [['r1'], {r1: 1}]});
        expectNoChanges(listener);
      });

      test('setCell, mapped', () => {
        store.setCell('t2', 'r1', 'c1', (cell) => (cell as number) + 1);
        expectNoChanges(listener);
      });

      test('Add things to delete', () => {
        store.transaction(() =>
          store.setTable('t3', {r1: {c1: 1}}).setTable('t4', {r1: {c1: 1}}),
        );
        expectChanges(listener, '/t3r', {t3: [['r1'], {r1: 1}]});
        expectChanges(listener, '/t4r', {t4: [['r1'], {r1: 1}]});
        expectChanges(
          listener,
          '/t*r',
          {t3: [['r1'], {r1: 1}]},
          {t4: [['r1'], {r1: 1}]},
        );
        expectNoChanges(listener);
      });

      test('delCell', () => {
        store.delCell('t1', 'r1', 'c2');
        expectNoChanges(listener);
      });

      test('delCell, cascade', () => {
        store.delCell('t2', 'r1', 'c1');
        expectChanges(listener, '/t2r', {t2: [[], {r1: -1}]});
        expectChanges(listener, '/t*r', {t2: [[], {r1: -1}]});
        expectNoChanges(listener);
      });

      test('delRow', () => {
        store.delRow('t1', 'r2');
        expectChanges(listener, '/t1r', {t1: [['r1'], {r2: -1}]});
        expectChanges(listener, '/t*r', {t1: [['r1'], {r2: -1}]});
        expectNoChanges(listener);
      });

      test('delRow, cascade', () => {
        store.delRow('t1', 'r1');
        expectChanges(listener, '/t1r', {t1: [[], {r1: -1}]});
        expectChanges(listener, '/t*r', {t1: [[], {r1: -1}]});
        expectNoChanges(listener);
      });

      test('delTable', () => {
        store.delTable('t3');
        expectChanges(listener, '/t3r', {t3: [[], {r1: -1}]});
        expectChanges(listener, '/t*r', {t3: [[], {r1: -1}]});
        expectNoChanges(listener);
      });

      test('delTables', () => {
        store.delTables();
        expectChanges(listener, '/t4r', {t4: [[], {r1: -1}]});
        expectChanges(listener, '/t*r', {t4: [[], {r1: -1}]});
      });
    });

    describe('sortedRowIds', () => {
      beforeAll(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToSortedRowIds('/t1s', 't1', 'c1', false, 0, undefined);
        listener.listenToSortedRowIds('/t2s', 't2', 'c1', true, 0, undefined);
        listener.listenToSortedRowIds('/t3s', 't3', 'c1', false, 0, undefined);
        listener.listenToSortedRowIds('/t4s', 't4', 'c1', true, 0, undefined);
      });

      test('reset 1', () => {
        store.delTables();
        expectNoChanges(listener);
      });

      test('setTables', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1s', ['r1']);
        expectNoChanges(listener);
      });

      test('setTables, same table, same row, same cell', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setTables, same table, same row, change cell', () => {
        store.setTables({t1: {r1: {c1: 2}}});
        expectNoChanges(listener);
      });

      test('setTables, same table, same row, different cell', () => {
        store.setTables({t1: {r1: {c2: 2}}});
        expectNoChanges(listener);
      });

      test('setTables, same table, different row', () => {
        store.setTables({t1: {r2: {c1: 1}}});
        expectChanges(listener, '/t1s', ['r2']);
        expectNoChanges(listener);
      });

      test('setTables, different table', () => {
        store.setTables({t2: {r1: {c1: 1}}});
        expectChanges(listener, '/t1s', []);
        expectChanges(listener, '/t2s', ['r1']);
        expectNoChanges(listener);
      });

      test('reset 2', () => {
        store.delTables();
        expectChanges(listener, '/t2s', []);
        expectNoChanges(listener);
      });

      test('setTable', () => {
        store.setTable('t1', {r1: {c1: 1}});
        expectChanges(listener, '/t1s', ['r1']);
        expectNoChanges(listener);
      });

      test('setTable, same table, same row, same cell', () => {
        store.setTable('t1', {r1: {c1: 1}});
        expectNoChanges(listener);
      });

      test('setTable, same table, same row, change cell', () => {
        store.setTable('t1', {r1: {c1: 2}});
        expectNoChanges(listener);
      });

      test('setTable, same table, same row, different cell', () => {
        store.setTable('t1', {r1: {c2: 2}});
        expectNoChanges(listener);
      });

      test('setTable, same table, different row', () => {
        store.setTable('t1', {r2: {c1: 1}});
        expectChanges(listener, '/t1s', ['r2']);
        expectNoChanges(listener);
      });

      test('setTable, different table', () => {
        store.setTable('t2', {r1: {c1: 1}});
        expectChanges(listener, '/t2s', ['r1']);
        expectNoChanges(listener);
      });

      test('reset 3', () => {
        store.delTables();
        expectChanges(listener, '/t1s', []);
        expectChanges(listener, '/t2s', []);
        expectNoChanges(listener);
      });

      test('setRow', () => {
        store.setRow('t1', 'r1', {c1: 1});
        expectChanges(listener, '/t1s', ['r1']);
        expectNoChanges(listener);
      });

      test('setRow, same table, same row, same cell', () => {
        store.setRow('t1', 'r1', {c1: 1});
        expectNoChanges(listener);
      });

      test('setRow, same table, same row, change cell', () => {
        store.setRow('t1', 'r1', {c1: 2});
        expectNoChanges(listener);
      });

      test('setRow, same table, same row, different cell', () => {
        store.setRow('t1', 'r1', {c2: 2});
        expectNoChanges(listener);
      });

      test('setRow, same table, different row', () => {
        store.setRow('t1', 'r2', {c1: 1});
        expectChanges(listener, '/t1s', ['r1', 'r2']);
        expectNoChanges(listener);
      });

      test('setRow, different table', () => {
        store.setRow('t2', 'r1', {c1: 1});
        expectChanges(listener, '/t2s', ['r1']);
        expectNoChanges(listener);
      });

      test('addRow', () => {
        store.addRow('t2', {c1: 1});
        expectChanges(listener, '/t2s', ['0', 'r1']);
        expectNoChanges(listener);
      });

      test('addRow, over existing row', () => {
        store.transaction(() =>
          store.setRow('t2', '1', {c1: 1}).addRow('t2', {c1: 1}),
        );
        expectChanges(listener, '/t2s', ['2', '1', '0', 'r1']);
        expectNoChanges(listener);
      });

      test('setPartialRow', () => {
        // @ts-ignore
        store.setPartialRow('t1', 'r1', {c1: 1, c2: 3, c3: undefined});
        expectNoChanges(listener);
      });

      test('reset 4', () => {
        store.delTables();
        expectChanges(listener, '/t1s', []);
        expectChanges(listener, '/t2s', []);
        expectNoChanges(listener);
      });

      test('setCell', () => {
        store.setCell('t1', 'r1', 'c1', 1);
        expectChanges(listener, '/t1s', ['r1']);
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, same cell', () => {
        store.setCell('t1', 'r1', 'c1', 1);
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, back to same cell', () => {
        store.transaction(() =>
          store.setCell('t1', 'r1', 'c1', 2).setCell('t1', 'r1', 'c1', 1),
        );
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, change cell', () => {
        store.setCell('t1', 'r1', 'c1', 2);
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, different cell', () => {
        store.setCell('t1', 'r1', 'c2', 2);
        expectNoChanges(listener);
      });

      test('setCell, same table, different row', () => {
        store.setCell('t1', 'r2', 'c1', 1);
        expectChanges(listener, '/t1s', ['r2', 'r1']);
        expectNoChanges(listener);
      });

      test('setCell, different table', () => {
        store.setCell('t2', 'r1', 'c1', 1);
        expectChanges(listener, '/t2s', ['r1']);
        expectNoChanges(listener);
      });

      test('setCell, mapped', () => {
        store.setCell('t2', 'r1', 'c1', (cell) => (cell as number) + 1);
        expectNoChanges(listener);
      });

      test('Add things to delete', () => {
        store.transaction(() =>
          store
            .setTable('t3', {r1: {c1: 1}, r2: {c1: 2}})
            .setTable('t4', {r1: {c1: 1}, r2: {c1: 2}}),
        );
        expectChanges(listener, '/t3s', ['r1', 'r2']);
        expectChanges(listener, '/t4s', ['r2', 'r1']);
        expectNoChanges(listener);
      });

      test('delCell', () => {
        store.delCell('t1', 'r1', 'c2');
        expectNoChanges(listener);
      });

      test('delCell, cascade', () => {
        store.delCell('t2', 'r1', 'c1');
        expectChanges(listener, '/t2s', []);
        expectNoChanges(listener);
      });

      test('delRow', () => {
        store.delRow('t1', 'r2');
        expectChanges(listener, '/t1s', ['r1']);
        expectNoChanges(listener);
      });

      test('delRow, cascade', () => {
        store.delRow('t1', 'r1');
        expectChanges(listener, '/t1s', []);
        expectNoChanges(listener);
      });

      test('delTable', () => {
        store.delTable('t3');
        expectChanges(listener, '/t3s', []);
        expectNoChanges(listener);
      });

      test('delTables', () => {
        store.delTables();
        expectChanges(listener, '/t4s', []);
      });
    });

    describe('hasRow', () => {
      beforeAll(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToHasRow('/t1/r1', 't1', 'r1');
        listener.listenToHasRow('/t1/r2', 't1', 'r2');
        listener.listenToHasRow('/t1/r*', 't1', null);
        listener.listenToHasRow('/t*/r1', null, 'r1');
        listener.listenToHasRow('/t*/r*', null, null);
      });

      test('reset 1', () => {
        store.delTables();
        expectNoChanges(listener);
      });

      test('setTables', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r1', {t1: {r1: true}});
        expectChanges(listener, '/t1/r*', {t1: {r1: true}});
        expectChanges(listener, '/t*/r1', {t1: {r1: true}});
        expectChanges(listener, '/t*/r*', {t1: {r1: true}});
        expectNoChanges(listener);
      });

      test('setTables, same table, same row, same cell', () => {
        expectNoChanges(listener);
      });

      test('setTables, same table, same row, change cell', () => {
        store.setTables({t1: {r1: {c1: 2}}});
        expectNoChanges(listener);
      });

      test('setTables, same table, same row, different cell', () => {
        store.setTables({t1: {r1: {c2: 2}}});
        expectNoChanges(listener);
      });

      test('setTables, same table, different row', () => {
        store.setTables({t1: {r2: {c1: 1}}});
        expectChanges(listener, '/t1/r1', {t1: {r1: false}});
        expectChanges(listener, '/t1/r2', {t1: {r2: true}});
        expectChanges(listener, '/t1/r*', {t1: {r2: true}}, {t1: {r1: false}});
        expectChanges(listener, '/t*/r1', {t1: {r1: false}});
        expectChanges(listener, '/t*/r*', {t1: {r2: true}}, {t1: {r1: false}});
        expectNoChanges(listener);
      });

      test('setTables, different table', () => {
        store.setTables({t2: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r2', {t1: {r2: false}});
        expectChanges(listener, '/t1/r*', {t1: {r2: false}});
        expectChanges(listener, '/t*/r1', {t2: {r1: true}});
        expectChanges(listener, '/t*/r*', {t2: {r1: true}}, {t1: {r2: false}});
        expectNoChanges(listener);
      });

      test('reset 2', () => {
        store.delTables();
        expectChanges(listener, '/t*/r1', {t2: {r1: false}});
        expectChanges(listener, '/t*/r*', {t2: {r1: false}});
        expectNoChanges(listener);
      });

      test('setTable', () => {
        store.setTable('t1', {r1: {c1: 1}});
        expectChanges(listener, '/t1/r1', {t1: {r1: true}});
        expectChanges(listener, '/t1/r*', {t1: {r1: true}});
        expectChanges(listener, '/t*/r1', {t1: {r1: true}});
        expectChanges(listener, '/t*/r*', {t1: {r1: true}});
        expectNoChanges(listener);
      });

      test('setTable, same table, same row, same cell', () => {
        store.setTable('t1', {r1: {c1: 1}});
        expectNoChanges(listener);
      });

      test('setTable, same table, same row, change cell', () => {
        store.setTable('t1', {r1: {c1: 2}});
        expectNoChanges(listener);
      });

      test('setTable, same table, same row, different cell', () => {
        store.setTable('t1', {r1: {c2: 2}});
        expectNoChanges(listener);
      });

      test('setTable, same table, different row', () => {
        store.setTable('t1', {r2: {c1: 1}});
        expectChanges(listener, '/t1/r1', {t1: {r1: false}});
        expectChanges(listener, '/t1/r2', {t1: {r2: true}});
        expectChanges(listener, '/t1/r*', {t1: {r2: true}}, {t1: {r1: false}});
        expectChanges(listener, '/t*/r1', {t1: {r1: false}});
        expectChanges(listener, '/t*/r*', {t1: {r2: true}}, {t1: {r1: false}});
        expectNoChanges(listener);
      });

      test('setTable, different table', () => {
        store.setTable('t2', {r1: {c1: 1}});
        expectChanges(listener, '/t*/r1', {t2: {r1: true}});
        expectChanges(listener, '/t*/r*', {t2: {r1: true}});
        expectNoChanges(listener);
      });

      test('reset 3', () => {
        store.delTables();
        expectChanges(listener, '/t1/r2', {t1: {r2: false}});
        expectChanges(listener, '/t1/r*', {t1: {r2: false}});
        expectChanges(listener, '/t*/r1', {t2: {r1: false}});
        expectChanges(listener, '/t*/r*', {t1: {r2: false}}, {t2: {r1: false}});
        expectNoChanges(listener);
      });

      test('setRow', () => {
        store.setRow('t1', 'r1', {c1: true});
        expectChanges(listener, '/t1/r1', {t1: {r1: true}});
        expectChanges(listener, '/t1/r*', {t1: {r1: true}});
        expectChanges(listener, '/t*/r1', {t1: {r1: true}});
        expectChanges(listener, '/t*/r*', {t1: {r1: true}});
        expectNoChanges(listener);
      });

      test('setRow, same table, same row, same cell', () => {
        store.setRow('t1', 'r1', {c1: 1});
        expectNoChanges(listener);
      });

      test('setRow, same table, same row, change cell', () => {
        store.setRow('t1', 'r1', {c1: 2});
        expectNoChanges(listener);
      });

      test('setRow, same table, same row, different cell', () => {
        store.setRow('t1', 'r1', {c2: 2});
        expectNoChanges(listener);
      });

      test('setRow, same table, different row', () => {
        store.setRow('t1', 'r2', {c1: 1});
        expectChanges(listener, '/t1/r2', {t1: {r2: true}});
        expectChanges(listener, '/t1/r*', {t1: {r2: true}});
        expectChanges(listener, '/t*/r*', {t1: {r2: true}});
        expectNoChanges(listener);
      });

      test('setRow, different table', () => {
        store.setRow('t2', 'r1', {c1: 1});
        expectChanges(listener, '/t*/r1', {t2: {r1: true}});
        expectChanges(listener, '/t*/r*', {t2: {r1: true}});
        expectNoChanges(listener);
      });

      test('addRow', () => {
        store.addRow('t2', {c1: 1});
        expectChanges(listener, '/t*/r*', {t2: {0: true}});
        expectNoChanges(listener);
      });

      test('addRow, over existing row', () => {
        store.transaction(() =>
          store.setRow('t2', '1', {c1: 1}).addRow('t2', {c1: 1}),
        );
        expectChanges(listener, '/t*/r*', {t2: {1: true}}, {t2: {2: true}});
        expectNoChanges(listener);
      });

      test('setPartialRow', () => {
        // @ts-ignore
        store.setPartialRow('t1', 'r1', {c1: 1, c2: 3, c3: undefined});
        expectNoChanges(listener);
      });

      test('reset 4', () => {
        store.delTables();
        expectChanges(listener, '/t1/r1', {t1: {r1: false}});
        expectChanges(listener, '/t1/r2', {t1: {r2: false}});
        expectChanges(listener, '/t1/r*', {t1: {r1: false}}, {t1: {r2: false}});
        expectChanges(listener, '/t*/r1', {t1: {r1: false}}, {t2: {r1: false}});
        expectChanges(
          listener,
          '/t*/r*',
          {t1: {r1: false}},
          {t1: {r2: false}},
          {t2: {r1: false}},
          {t2: {0: false}},
          {t2: {1: false}},
          {t2: {2: false}},
        );
        expectNoChanges(listener);
      });

      test('setCell', () => {
        store.setCell('t1', 'r1', 'c1', 1);
        expectChanges(listener, '/t1/r1', {t1: {r1: true}});
        expectChanges(listener, '/t1/r*', {t1: {r1: true}});
        expectChanges(listener, '/t*/r1', {t1: {r1: true}});
        expectChanges(listener, '/t*/r*', {t1: {r1: true}});
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, same cell', () => {
        store.setCell('t1', 'r1', 'c1', 1);
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, change cell', () => {
        store.setCell('t1', 'r1', 'c1', 2);
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, different cell', () => {
        store.setCell('t1', 'r1', 'c2', 2);
        expectNoChanges(listener);
      });

      test('setCell, same table, different row', () => {
        store.setCell('t1', 'r2', 'c1', 1);
        expectChanges(listener, '/t1/r2', {t1: {r2: true}});
        expectChanges(listener, '/t1/r*', {t1: {r2: true}});
        expectChanges(listener, '/t*/r*', {t1: {r2: true}});
        expectNoChanges(listener);
      });

      test('setCell, different table', () => {
        store.setCell('t2', 'r1', 'c1', 1);
        expectChanges(listener, '/t*/r1', {t2: {r1: true}});
        expectChanges(listener, '/t*/r*', {t2: {r1: true}});
        expectNoChanges(listener);
      });

      test('setCell, mapped', () => {
        store.setCell('t2', 'r1', 'c1', (cell) => (cell as number) + 1);
        expectNoChanges(listener);
      });

      test('Add things to delete', () => {
        store.transaction(() =>
          store.setTable('t3', {r1: {c1: 1}}).setTable('t4', {r1: {c1: 1}}),
        );
        expectChanges(listener, '/t*/r1', {t3: {r1: true}}, {t4: {r1: true}});
        expectChanges(listener, '/t*/r*', {t3: {r1: true}}, {t4: {r1: true}});
        expectNoChanges(listener);
      });

      test('delCell', () => {
        store.delCell('t1', 'r1', 'c2');
        expectNoChanges(listener);
      });

      test('delCell, cascade', () => {
        store.delCell('t2', 'r1', 'c1');
        expectChanges(listener, '/t*/r1', {t2: {r1: false}});
        expectChanges(listener, '/t*/r*', {t2: {r1: false}});
        expectNoChanges(listener);
      });

      test('delRow', () => {
        store.delRow('t1', 'r2');
        expectChanges(listener, '/t1/r2', {t1: {r2: false}});
        expectChanges(listener, '/t1/r*', {t1: {r2: false}});
        expectChanges(listener, '/t*/r*', {t1: {r2: false}});
        expectNoChanges(listener);
      });

      test('delRow, cascade', () => {
        store.delRow('t1', 'r1');
        expectChanges(listener, '/t1/r1', {t1: {r1: false}});
        expectChanges(listener, '/t1/r*', {t1: {r1: false}});
        expectChanges(listener, '/t*/r1', {t1: {r1: false}});
        expectChanges(listener, '/t*/r*', {t1: {r1: false}});
        expectNoChanges(listener);
      });

      test('delTable', () => {
        store.delTable('t3');
        expectChanges(listener, '/t*/r1', {t3: {r1: false}});
        expectChanges(listener, '/t*/r*', {t3: {r1: false}});
        expectNoChanges(listener);
      });

      test('delTables', () => {
        store.delTables();
        expectChanges(listener, '/t*/r1', {t4: {r1: false}});
        expectChanges(listener, '/t*/r*', {t4: {r1: false}});
      });
    });

    describe('row', () => {
      beforeAll(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToRow('/t1/r1', 't1', 'r1');
        listener.listenToRow('/t1/r2', 't1', 'r2');
        listener.listenToRow('/t1/r*', 't1', null);
        listener.listenToRow('/t*/r1', null, 'r1');
        listener.listenToRow('/t*/r*', null, null);
      });

      test('reset 1', () => {
        store.delTables();
        expectNoChanges(listener);
      });

      test('setTables', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r*', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r*', {t1: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setTables, same table, same row, same cell', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setTables, same table, same row, change cell', () => {
        store.setTables({t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t1/r1', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t1/r*', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t*/r1', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t*/r*', {t1: {r1: {c1: 2}}});
        expectNoChanges(listener);
      });

      test('setTables, same table, same row, different cell', () => {
        store.setTables({t1: {r1: {c2: 2}}});
        expectChanges(listener, '/t1/r1', {t1: {r1: {c2: 2}}});
        expectChanges(listener, '/t1/r*', {t1: {r1: {c2: 2}}});
        expectChanges(listener, '/t*/r1', {t1: {r1: {c2: 2}}});
        expectChanges(listener, '/t*/r*', {t1: {r1: {c2: 2}}});
        expectNoChanges(listener);
      });

      test('setTables, same table, different row', () => {
        store.setTables({t1: {r2: {c1: 1}}});
        expectChanges(listener, '/t1/r1', {t1: {r1: {}}});
        expectChanges(listener, '/t1/r2', {t1: {r2: {c1: 1}}});
        expectChanges(listener, '/t1/r*', {t1: {r2: {c1: 1}}}, {t1: {r1: {}}});
        expectChanges(listener, '/t*/r1', {t1: {r1: {}}});
        expectChanges(listener, '/t*/r*', {t1: {r2: {c1: 1}}}, {t1: {r1: {}}});
      });

      test('setTables, different table', () => {
        store.setTables({t2: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r2', {t1: {r2: {}}});
        expectChanges(listener, '/t1/r*', {t1: {r2: {}}});
        expectChanges(listener, '/t*/r1', {t2: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r*', {t2: {r1: {c1: 1}}}, {t1: {r2: {}}});
        expectNoChanges(listener);
      });

      test('reset 2', () => {
        store.delTables();
        expectChanges(listener, '/t*/r1', {t2: {r1: {}}});
        expectChanges(listener, '/t*/r*', {t2: {r1: {}}});
        expectNoChanges(listener);
      });

      test('setTable', () => {
        store.setTable('t1', {r1: {c1: 1}});
        expectChanges(listener, '/t1/r1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r*', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r*', {t1: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setTable, same table, same row, same cell', () => {
        store.setTable('t1', {r1: {c1: 1}});
        expectNoChanges(listener);
      });

      test('setTable, same table, same row, change cell', () => {
        store.setTable('t1', {r1: {c1: 2}});
        expectChanges(listener, '/t1/r1', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t1/r*', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t*/r1', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t*/r*', {t1: {r1: {c1: 2}}});
        expectNoChanges(listener);
      });

      test('setTable, same table, same row, different cell', () => {
        store.setTable('t1', {r1: {c2: 2}});
        expectChanges(listener, '/t1/r1', {t1: {r1: {c2: 2}}});
        expectChanges(listener, '/t1/r*', {t1: {r1: {c2: 2}}});
        expectChanges(listener, '/t*/r1', {t1: {r1: {c2: 2}}});
        expectChanges(listener, '/t*/r*', {t1: {r1: {c2: 2}}});
        expectNoChanges(listener);
      });

      test('setTable, same table, different row', () => {
        store.setTable('t1', {r2: {c1: 1}});
        expectChanges(listener, '/t1/r1', {t1: {r1: {}}});
        expectChanges(listener, '/t1/r2', {t1: {r2: {c1: 1}}});
        expectChanges(listener, '/t1/r*', {t1: {r2: {c1: 1}}}, {t1: {r1: {}}});
        expectChanges(listener, '/t*/r1', {t1: {r1: {}}});
        expectChanges(listener, '/t*/r*', {t1: {r2: {c1: 1}}}, {t1: {r1: {}}});
        expectNoChanges(listener);
      });

      test('setTable, different table', () => {
        store.setTable('t2', {r1: {c1: 1}});
        expectChanges(listener, '/t*/r1', {t2: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r*', {t2: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('reset 3', () => {
        store.delTables();
        expectChanges(listener, '/t1/r2', {t1: {r2: {}}});
        expectChanges(listener, '/t1/r*', {t1: {r2: {}}});
        expectChanges(listener, '/t*/r1', {t2: {r1: {}}});
        expectChanges(listener, '/t*/r*', {t1: {r2: {}}}, {t2: {r1: {}}});
        expectNoChanges(listener);
      });

      test('setRow', () => {
        store.setRow('t1', 'r1', {c1: 1});
        expectChanges(listener, '/t1/r1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r*', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r*', {t1: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setRow, same table, same row, same cell', () => {
        store.setRow('t1', 'r1', {c1: 1});
        expectNoChanges(listener);
      });

      test('setRow, same table, same row, change cell', () => {
        store.setRow('t1', 'r1', {c1: 2});
        expectChanges(listener, '/t1/r1', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t1/r*', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t*/r1', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t*/r*', {t1: {r1: {c1: 2}}});
        expectNoChanges(listener);
      });

      test('setRow, same table, same row, different cell', () => {
        store.setRow('t1', 'r1', {c2: 2});
        expectChanges(listener, '/t1/r1', {t1: {r1: {c2: 2}}});
        expectChanges(listener, '/t1/r*', {t1: {r1: {c2: 2}}});
        expectChanges(listener, '/t*/r1', {t1: {r1: {c2: 2}}});
        expectChanges(listener, '/t*/r*', {t1: {r1: {c2: 2}}});
        expectNoChanges(listener);
      });

      test('setRow, same table, different row', () => {
        store.setRow('t1', 'r2', {c1: 1});
        expectChanges(listener, '/t1/r2', {t1: {r2: {c1: 1}}});
        expectChanges(listener, '/t1/r*', {t1: {r2: {c1: 1}}});
        expectChanges(listener, '/t*/r*', {t1: {r2: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setRow, different table', () => {
        store.setRow('t2', 'r1', {c1: 1});
        expectChanges(listener, '/t*/r1', {t2: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r*', {t2: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('addRow', () => {
        store.addRow('t2', {c1: 1});
        expectChanges(listener, '/t*/r*', {t2: {0: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('addRow, over existing row', () => {
        store.transaction(() =>
          store.setRow('t2', '1', {c1: 1}).addRow('t2', {c1: 1}),
        );
        expectChanges(
          listener,
          '/t*/r*',
          {t2: {1: {c1: 1}}},
          {t2: {2: {c1: 1}}},
        );
        expectNoChanges(listener);
      });

      test('setPartialRow', () => {
        // @ts-ignore
        store.setPartialRow('t1', 'r1', {c1: 1, c2: 3, c3: undefined});
        expectChanges(listener, '/t1/r1', {t1: {r1: {c2: 3, c1: 1}}});
        expectChanges(listener, '/t1/r*', {t1: {r1: {c2: 3, c1: 1}}});
        expectChanges(listener, '/t*/r1', {t1: {r1: {c2: 3, c1: 1}}});
        expectChanges(listener, '/t*/r*', {t1: {r1: {c2: 3, c1: 1}}});
        expectNoChanges(listener);
      });

      test('reset 4', () => {
        store.delTables();
        expectChanges(listener, '/t1/r1', {t1: {r1: {}}});
        expectChanges(listener, '/t1/r2', {t1: {r2: {}}});
        expectChanges(listener, '/t1/r*', {t1: {r1: {}}}, {t1: {r2: {}}});
        expectChanges(listener, '/t*/r1', {t1: {r1: {}}}, {t2: {r1: {}}});
        expectChanges(
          listener,
          '/t*/r*',
          {t1: {r1: {}}},
          {t1: {r2: {}}},
          {t2: {r1: {}}},
          {t2: {0: {}}},
          {t2: {1: {}}},
          {t2: {2: {}}},
        );
        expectNoChanges(listener);
      });

      test('setCell', () => {
        store.setCell('t1', 'r1', 'c1', 1);
        expectChanges(listener, '/t1/r1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r*', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r*', {t1: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, same cell', () => {
        store.setCell('t1', 'r1', 'c1', 1);
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, change cell', () => {
        store.setCell('t1', 'r1', 'c1', 2);
        expectChanges(listener, '/t1/r1', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t1/r*', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t*/r1', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t*/r*', {t1: {r1: {c1: 2}}});
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, different cell', () => {
        store.setCell('t1', 'r1', 'c2', 2);
        expectChanges(listener, '/t1/r1', {t1: {r1: {c1: 2, c2: 2}}});
        expectChanges(listener, '/t1/r*', {t1: {r1: {c1: 2, c2: 2}}});
        expectChanges(listener, '/t*/r1', {t1: {r1: {c1: 2, c2: 2}}});
        expectChanges(listener, '/t*/r*', {t1: {r1: {c1: 2, c2: 2}}});
        expectNoChanges(listener);
      });

      test('setCell, same table, different row', () => {
        store.setCell('t1', 'r2', 'c1', 1);
        expectChanges(listener, '/t1/r2', {t1: {r2: {c1: 1}}});
        expectChanges(listener, '/t1/r*', {t1: {r2: {c1: 1}}});
        expectChanges(listener, '/t*/r*', {t1: {r2: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setCell, different table', () => {
        store.setCell('t2', 'r1', 'c1', 1);
        expectChanges(listener, '/t*/r1', {t2: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r*', {t2: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setCell, mapped', () => {
        store.setCell('t2', 'r1', 'c1', (cell) => (cell as number) + 1);
        expectChanges(listener, '/t*/r1', {t2: {r1: {c1: 2}}});
        expectChanges(listener, '/t*/r*', {t2: {r1: {c1: 2}}});
        expectNoChanges(listener);
      });

      test('Add things to delete', () => {
        store.transaction(() =>
          store.setTable('t3', {r1: {c1: 1}}).setTable('t4', {r1: {c1: 1}}),
        );
        expectChanges(
          listener,
          '/t*/r1',
          {t3: {r1: {c1: 1}}},
          {t4: {r1: {c1: 1}}},
        );
        expectChanges(
          listener,
          '/t*/r*',
          {t3: {r1: {c1: 1}}},
          {t4: {r1: {c1: 1}}},
        );
        expectNoChanges(listener);
      });

      test('delCell', () => {
        store.delCell('t1', 'r1', 'c2');
        expectChanges(listener, '/t1/r1', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t1/r*', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t*/r1', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t*/r*', {t1: {r1: {c1: 2}}});
        expectNoChanges(listener);
      });

      test('delCell, cascade', () => {
        store.delCell('t2', 'r1', 'c1');
        expectChanges(listener, '/t*/r1', {t2: {r1: {}}});
        expectChanges(listener, '/t*/r*', {t2: {r1: {}}});
        expectNoChanges(listener);
      });

      test('delRow', () => {
        store.delRow('t1', 'r2');
        expectChanges(listener, '/t1/r2', {t1: {r2: {}}});
        expectChanges(listener, '/t1/r*', {t1: {r2: {}}});
        expectChanges(listener, '/t*/r*', {t1: {r2: {}}});
        expectNoChanges(listener);
      });

      test('delRow, cascade', () => {
        store.delRow('t1', 'r1');
        expectChanges(listener, '/t1/r1', {t1: {r1: {}}});
        expectChanges(listener, '/t1/r*', {t1: {r1: {}}});
        expectChanges(listener, '/t*/r1', {t1: {r1: {}}});
        expectChanges(listener, '/t*/r*', {t1: {r1: {}}});
        expectNoChanges(listener);
      });

      test('delTable', () => {
        store.delTable('t3');
        expectChanges(listener, '/t*/r1', {t3: {r1: {}}});
        expectChanges(listener, '/t*/r*', {t3: {r1: {}}});
        expectNoChanges(listener);
      });

      test('delTables', () => {
        store.delTables();
        expectChanges(listener, '/t*/r1', {t4: {r1: {}}});
        expectChanges(listener, '/t*/r*', {t4: {r1: {}}});
      });
    });

    describe('cellIds', () => {
      beforeAll(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToCellIds('/t1/r1c', 't1', 'r1');
        listener.listenToCellIds('/t1/r2c', 't1', 'r2');
        listener.listenToCellIds('/t1/r*c', 't1', null);
        listener.listenToCellIds('/t*/r1c', null, 'r1');
        listener.listenToCellIds('/t*/r*c', null, null);
      });

      test('reset 1', () => {
        store.delTables();
        expectNoChanges(listener);
      });

      test('setTables', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r1c', {t1: {r1: [['c1'], {c1: 1}]}});
        expectChanges(listener, '/t1/r*c', {t1: {r1: [['c1'], {c1: 1}]}});
        expectChanges(listener, '/t*/r1c', {t1: {r1: [['c1'], {c1: 1}]}});
        expectChanges(listener, '/t*/r*c', {t1: {r1: [['c1'], {c1: 1}]}});
        expectNoChanges(listener);
      });

      test('setTables, same table, same row, same cell', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setTables, same table, same row, change cell', () => {
        store.setTables({t1: {r1: {c1: 2}}});
        expectNoChanges(listener);
      });

      test('setTables, same table, same row, different cell', () => {
        store.setTables({t1: {r1: {c2: 2}}});
        expectChanges(listener, '/t1/r1c', {
          t1: {r1: [['c2'], {c2: 1, c1: -1}]},
        });
        expectChanges(listener, '/t1/r*c', {
          t1: {r1: [['c2'], {c2: 1, c1: -1}]},
        });
        expectChanges(listener, '/t*/r1c', {
          t1: {r1: [['c2'], {c2: 1, c1: -1}]},
        });
        expectChanges(listener, '/t*/r*c', {
          t1: {r1: [['c2'], {c2: 1, c1: -1}]},
        });
        expectNoChanges(listener);
      });

      test('setTables, same table, different row', () => {
        store.setTables({t1: {r2: {c1: 1}}});
        expectChanges(listener, '/t1/r1c', {t1: {r1: [[], {c2: -1}]}});
        expectChanges(listener, '/t1/r2c', {t1: {r2: [['c1'], {c1: 1}]}});
        expectChanges(
          listener,
          '/t1/r*c',
          {t1: {r2: [['c1'], {c1: 1}]}},
          {t1: {r1: [[], {c2: -1}]}},
        );
        expectChanges(listener, '/t*/r1c', {t1: {r1: [[], {c2: -1}]}});
        expectChanges(
          listener,
          '/t*/r*c',
          {t1: {r2: [['c1'], {c1: 1}]}},
          {t1: {r1: [[], {c2: -1}]}},
        );
      });

      test('setTables, different table', () => {
        store.setTables({t2: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r2c', {t1: {r2: [[], {c1: -1}]}});
        expectChanges(listener, '/t1/r*c', {t1: {r2: [[], {c1: -1}]}});
        expectChanges(listener, '/t*/r1c', {t2: {r1: [['c1'], {c1: 1}]}});
        expectChanges(
          listener,
          '/t*/r*c',
          {t2: {r1: [['c1'], {c1: 1}]}},
          {t1: {r2: [[], {c1: -1}]}},
        );
        expectNoChanges(listener);
      });

      test('reset 2', () => {
        store.delTables();
        expectChanges(listener, '/t*/r1c', {t2: {r1: [[], {c1: -1}]}});
        expectChanges(listener, '/t*/r*c', {t2: {r1: [[], {c1: -1}]}});
        expectNoChanges(listener);
      });

      test('setTable', () => {
        store.setTable('t1', {r1: {c1: 1}});
        expectChanges(listener, '/t1/r1c', {t1: {r1: [['c1'], {c1: 1}]}});
        expectChanges(listener, '/t1/r*c', {t1: {r1: [['c1'], {c1: 1}]}});
        expectChanges(listener, '/t*/r1c', {t1: {r1: [['c1'], {c1: 1}]}});
        expectChanges(listener, '/t*/r*c', {t1: {r1: [['c1'], {c1: 1}]}});
        expectNoChanges(listener);
      });

      test('setTable, same table, same row, same cell', () => {
        store.setTable('t1', {r1: {c1: 1}});
        expectNoChanges(listener);
      });

      test('setTable, same table, same row, change cell', () => {
        store.setTable('t1', {r1: {c1: 2}});
        expectNoChanges(listener);
      });

      test('setTable, same table, same row, different cell', () => {
        store.setTable('t1', {r1: {c2: 2}});
        expectChanges(listener, '/t1/r1c', {
          t1: {r1: [['c2'], {c2: 1, c1: -1}]},
        });
        expectChanges(listener, '/t1/r*c', {
          t1: {r1: [['c2'], {c2: 1, c1: -1}]},
        });
        expectChanges(listener, '/t*/r1c', {
          t1: {r1: [['c2'], {c2: 1, c1: -1}]},
        });
        expectChanges(listener, '/t*/r*c', {
          t1: {r1: [['c2'], {c2: 1, c1: -1}]},
        });
        expectNoChanges(listener);
      });

      test('setTable, same table, different row', () => {
        store.setTable('t1', {r2: {c1: 1}});
        expectChanges(listener, '/t1/r1c', {t1: {r1: [[], {c2: -1}]}});
        expectChanges(listener, '/t1/r2c', {t1: {r2: [['c1'], {c1: 1}]}});
        expectChanges(
          listener,
          '/t1/r*c',
          {t1: {r2: [['c1'], {c1: 1}]}},
          {t1: {r1: [[], {c2: -1}]}},
        );
        expectChanges(listener, '/t*/r1c', {t1: {r1: [[], {c2: -1}]}});
        expectChanges(
          listener,
          '/t*/r*c',
          {t1: {r2: [['c1'], {c1: 1}]}},
          {t1: {r1: [[], {c2: -1}]}},
        );
        expectNoChanges(listener);
      });

      test('setTable, different table', () => {
        store.setTable('t2', {r1: {c1: 1}});
        expectChanges(listener, '/t*/r1c', {t2: {r1: [['c1'], {c1: 1}]}});
        expectChanges(listener, '/t*/r*c', {t2: {r1: [['c1'], {c1: 1}]}});
        expectNoChanges(listener);
      });

      test('reset 3', () => {
        store.delTables();
        expectChanges(listener, '/t1/r2c', {t1: {r2: [[], {c1: -1}]}});
        expectChanges(listener, '/t1/r*c', {t1: {r2: [[], {c1: -1}]}});
        expectChanges(listener, '/t*/r1c', {t2: {r1: [[], {c1: -1}]}});
        expectChanges(
          listener,
          '/t*/r*c',
          {t1: {r2: [[], {c1: -1}]}},
          {t2: {r1: [[], {c1: -1}]}},
        );
        expectNoChanges(listener);
      });

      test('setRow', () => {
        store.setRow('t1', 'r1', {c1: 1});
        expectChanges(listener, '/t1/r1c', {t1: {r1: [['c1'], {c1: 1}]}});
        expectChanges(listener, '/t1/r*c', {t1: {r1: [['c1'], {c1: 1}]}});
        expectChanges(listener, '/t*/r1c', {t1: {r1: [['c1'], {c1: 1}]}});
        expectChanges(listener, '/t*/r*c', {t1: {r1: [['c1'], {c1: 1}]}});
        expectNoChanges(listener);
      });

      test('setRow, same table, same row, same cell', () => {
        store.setRow('t1', 'r1', {c1: 1});
        expectNoChanges(listener);
      });

      test('setRow, same table, same row, change cell', () => {
        store.setRow('t1', 'r1', {c1: 2});
        expectNoChanges(listener);
      });

      test('setRow, same table, same row, different cell', () => {
        store.setRow('t1', 'r1', {c2: 2});
        expectChanges(listener, '/t1/r1c', {
          t1: {r1: [['c2'], {c2: 1, c1: -1}]},
        });
        expectChanges(listener, '/t1/r*c', {
          t1: {r1: [['c2'], {c2: 1, c1: -1}]},
        });
        expectChanges(listener, '/t*/r1c', {
          t1: {r1: [['c2'], {c2: 1, c1: -1}]},
        });
        expectChanges(listener, '/t*/r*c', {
          t1: {r1: [['c2'], {c2: 1, c1: -1}]},
        });
        expectNoChanges(listener);
      });

      test('setRow, same table, different row', () => {
        store.setRow('t1', 'r2', {c1: 1});
        expectChanges(listener, '/t1/r2c', {t1: {r2: [['c1'], {c1: 1}]}});
        expectChanges(listener, '/t1/r*c', {t1: {r2: [['c1'], {c1: 1}]}});
        expectChanges(listener, '/t*/r*c', {t1: {r2: [['c1'], {c1: 1}]}});
        expectNoChanges(listener);
      });

      test('setRow, different table', () => {
        store.setRow('t2', 'r1', {c1: 1});
        expectChanges(listener, '/t*/r1c', {t2: {r1: [['c1'], {c1: 1}]}});
        expectChanges(listener, '/t*/r*c', {t2: {r1: [['c1'], {c1: 1}]}});
        expectNoChanges(listener);
      });

      test('addRow', () => {
        store.addRow('t2', {c1: 1});
        expectChanges(listener, '/t*/r*c', {t2: {0: [['c1'], {c1: 1}]}});
        expectNoChanges(listener);
      });

      test('addRow, over existing row', () => {
        store.transaction(() =>
          store.setRow('t2', '1', {c1: 1}).addRow('t2', {c1: 1}),
        );
        expectChanges(
          listener,
          '/t*/r*c',
          {t2: {1: [['c1'], {c1: 1}]}},
          {t2: {2: [['c1'], {c1: 1}]}},
        );
        expectNoChanges(listener);
      });

      test('setPartialRow', () => {
        // @ts-ignore
        store.setPartialRow('t1', 'r1', {c1: 1, c2: 3, c3: undefined});
        expectChanges(listener, '/t1/r1c', {t1: {r1: [['c2', 'c1'], {c1: 1}]}});
        expectChanges(listener, '/t1/r*c', {t1: {r1: [['c2', 'c1'], {c1: 1}]}});
        expectChanges(listener, '/t*/r1c', {t1: {r1: [['c2', 'c1'], {c1: 1}]}});
        expectChanges(listener, '/t*/r*c', {t1: {r1: [['c2', 'c1'], {c1: 1}]}});
        expectNoChanges(listener);
      });

      test('reset 4', () => {
        store.delTables();
        expectChanges(listener, '/t1/r1c', {t1: {r1: [[], {c2: -1, c1: -1}]}});
        expectChanges(listener, '/t1/r2c', {t1: {r2: [[], {c1: -1}]}});
        expectChanges(
          listener,
          '/t1/r*c',
          {t1: {r1: [[], {c2: -1, c1: -1}]}},
          {t1: {r2: [[], {c1: -1}]}},
        );
        expectChanges(
          listener,
          '/t*/r1c',
          {t1: {r1: [[], {c2: -1, c1: -1}]}},
          {t2: {r1: [[], {c1: -1}]}},
        );
        expectChanges(
          listener,
          '/t*/r*c',
          {t1: {r1: [[], {c2: -1, c1: -1}]}},
          {t1: {r2: [[], {c1: -1}]}},
          {t2: {r1: [[], {c1: -1}]}},
          {t2: {0: [[], {c1: -1}]}},
          {t2: {1: [[], {c1: -1}]}},
          {t2: {2: [[], {c1: -1}]}},
        );
        expectNoChanges(listener);
      });

      test('setCell', () => {
        store.setCell('t1', 'r1', 'c1', 1);
        expectChanges(listener, '/t1/r1c', {t1: {r1: [['c1'], {c1: 1}]}});
        expectChanges(listener, '/t1/r*c', {t1: {r1: [['c1'], {c1: 1}]}});
        expectChanges(listener, '/t*/r1c', {t1: {r1: [['c1'], {c1: 1}]}});
        expectChanges(listener, '/t*/r*c', {t1: {r1: [['c1'], {c1: 1}]}});
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, same cell', () => {
        store.setCell('t1', 'r1', 'c1', 1);
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, change cell', () => {
        store.setCell('t1', 'r1', 'c1', 2);
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, different cell', () => {
        store.setCell('t1', 'r1', 'c2', 2);
        expectChanges(listener, '/t1/r1c', {t1: {r1: [['c1', 'c2'], {c2: 1}]}});
        expectChanges(listener, '/t1/r*c', {t1: {r1: [['c1', 'c2'], {c2: 1}]}});
        expectChanges(listener, '/t*/r1c', {t1: {r1: [['c1', 'c2'], {c2: 1}]}});
        expectChanges(listener, '/t*/r*c', {t1: {r1: [['c1', 'c2'], {c2: 1}]}});
        expectNoChanges(listener);
      });

      test('setCell, same table, different row', () => {
        store.setCell('t1', 'r2', 'c1', 1);
        expectChanges(listener, '/t1/r2c', {t1: {r2: [['c1'], {c1: 1}]}});
        expectChanges(listener, '/t1/r*c', {t1: {r2: [['c1'], {c1: 1}]}});
        expectChanges(listener, '/t*/r*c', {t1: {r2: [['c1'], {c1: 1}]}});
        expectNoChanges(listener);
      });

      test('setCell, different table', () => {
        store.setCell('t2', 'r1', 'c1', 1);
        expectChanges(listener, '/t*/r1c', {t2: {r1: [['c1'], {c1: 1}]}});
        expectChanges(listener, '/t*/r*c', {t2: {r1: [['c1'], {c1: 1}]}});
        expectNoChanges(listener);
      });

      test('setCell, mapped', () => {
        store.setCell('t2', 'r1', 'c1', (cell) => (cell as number) + 1);
        expectNoChanges(listener);
      });

      test('Add things to delete', () => {
        store.transaction(() =>
          store.setTable('t3', {r1: {c1: 1}}).setTable('t4', {r1: {c1: 1}}),
        );
        expectChanges(
          listener,
          '/t*/r1c',
          {t3: {r1: [['c1'], {c1: 1}]}},
          {t4: {r1: [['c1'], {c1: 1}]}},
        );
        expectChanges(
          listener,
          '/t*/r*c',
          {t3: {r1: [['c1'], {c1: 1}]}},
          {t4: {r1: [['c1'], {c1: 1}]}},
        );
        expectNoChanges(listener);
      });

      test('delCell', () => {
        store.delCell('t1', 'r1', 'c2');
        expectChanges(listener, '/t1/r1c', {t1: {r1: [['c1'], {c2: -1}]}});
        expectChanges(listener, '/t1/r*c', {t1: {r1: [['c1'], {c2: -1}]}});
        expectChanges(listener, '/t*/r1c', {t1: {r1: [['c1'], {c2: -1}]}});
        expectChanges(listener, '/t*/r*c', {t1: {r1: [['c1'], {c2: -1}]}});
        expectNoChanges(listener);
      });

      test('delCell, cascade', () => {
        store.delCell('t2', 'r1', 'c1');
        expectChanges(listener, '/t*/r1c', {t2: {r1: [[], {c1: -1}]}});
        expectChanges(listener, '/t*/r*c', {t2: {r1: [[], {c1: -1}]}});
        expectNoChanges(listener);
      });

      test('delRow', () => {
        store.delRow('t1', 'r2');
        expectChanges(listener, '/t1/r2c', {t1: {r2: [[], {c1: -1}]}});
        expectChanges(listener, '/t1/r*c', {t1: {r2: [[], {c1: -1}]}});
        expectChanges(listener, '/t*/r*c', {t1: {r2: [[], {c1: -1}]}});
        expectNoChanges(listener);
      });

      test('delRow, cascade', () => {
        store.delRow('t1', 'r1');
        expectChanges(listener, '/t1/r1c', {t1: {r1: [[], {c1: -1}]}});
        expectChanges(listener, '/t1/r*c', {t1: {r1: [[], {c1: -1}]}});
        expectChanges(listener, '/t*/r1c', {t1: {r1: [[], {c1: -1}]}});
        expectChanges(listener, '/t*/r*c', {t1: {r1: [[], {c1: -1}]}});
        expectNoChanges(listener);
      });

      test('delTable', () => {
        store.delTable('t3');
        expectChanges(listener, '/t*/r1c', {t3: {r1: [[], {c1: -1}]}});
        expectChanges(listener, '/t*/r*c', {t3: {r1: [[], {c1: -1}]}});
        expectNoChanges(listener);
      });

      test('delTables', () => {
        store.delTables();
        expectChanges(listener, '/t*/r1c', {t4: {r1: [[], {c1: -1}]}});
        expectChanges(listener, '/t*/r*c', {t4: {r1: [[], {c1: -1}]}});
      });
    });

    describe('hasCell', () => {
      beforeAll(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToHasCell('/t1/r1/c1', 't1', 'r1', 'c1');
        listener.listenToHasCell('/t1/r1/c2', 't1', 'r1', 'c2');
        listener.listenToHasCell('/t1/r1/c*', 't1', 'r1', null);
        listener.listenToHasCell('/t1/r*/c1', 't1', null, 'c1');
        listener.listenToHasCell('/t1/r*/c*', 't1', null, null);
        listener.listenToHasCell('/t*/r1/c1', null, 'r1', 'c1');
        listener.listenToHasCell('/t*/r1/c*', null, 'r1', null);
        listener.listenToHasCell('/t*/r*/c1', null, null, 'c1');
        listener.listenToHasCell('/t*/r*/c*', null, null, null);
      });

      test('reset 1', () => {
        store.delTables();
        expectNoChanges(listener);
      });

      test('setTables', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: true}}});
        expectChanges(listener, '/t1/r1/c*', {t1: {r1: {c1: true}}});
        expectChanges(listener, '/t1/r*/c1', {t1: {r1: {c1: true}}});
        expectChanges(listener, '/t1/r*/c*', {t1: {r1: {c1: true}}});
        expectChanges(listener, '/t*/r1/c1', {t1: {r1: {c1: true}}});
        expectChanges(listener, '/t*/r1/c*', {t1: {r1: {c1: true}}});
        expectChanges(listener, '/t*/r*/c1', {t1: {r1: {c1: true}}});
        expectChanges(listener, '/t*/r*/c*', {t1: {r1: {c1: true}}});
        expectNoChanges(listener);
      });

      test('setTables, same table, same row, same cell', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setTables, same table, same row, change cell', () => {
        store.setTables({t1: {r1: {c1: 2}}});
        expectNoChanges(listener);
      });

      test('setTables, same table, same row, different cell', () => {
        store.setTables({t1: {r1: {c2: 2}}});
        expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: false}}});
        expectChanges(listener, '/t1/r1/c2', {t1: {r1: {c2: true}}});
        expectChanges(
          listener,
          '/t1/r1/c*',
          {t1: {r1: {c2: true}}},
          {t1: {r1: {c1: false}}},
        );
        expectChanges(listener, '/t1/r*/c1', {t1: {r1: {c1: false}}});
        expectChanges(
          listener,
          '/t1/r*/c*',
          {t1: {r1: {c2: true}}},
          {t1: {r1: {c1: false}}},
        );
        expectChanges(listener, '/t*/r1/c1', {t1: {r1: {c1: false}}});
        expectChanges(
          listener,
          '/t*/r1/c*',
          {t1: {r1: {c2: true}}},
          {t1: {r1: {c1: false}}},
        );
        expectChanges(listener, '/t*/r*/c1', {t1: {r1: {c1: false}}});
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {r1: {c2: true}}},
          {t1: {r1: {c1: false}}},
        );
        expectNoChanges(listener);
      });

      test('setTables, same table, different row', () => {
        store.setTables({t1: {r2: {c1: 1}}});
        expectChanges(listener, '/t1/r1/c2', {t1: {r1: {c2: false}}});
        expectChanges(listener, '/t1/r1/c*', {t1: {r1: {c2: false}}});
        expectChanges(listener, '/t1/r*/c1', {t1: {r2: {c1: true}}});
        expectChanges(
          listener,
          '/t1/r*/c*',
          {t1: {r2: {c1: true}}},
          {t1: {r1: {c2: false}}},
        );
        expectChanges(listener, '/t*/r1/c*', {t1: {r1: {c2: false}}});
        expectChanges(listener, '/t*/r*/c1', {t1: {r2: {c1: true}}});
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {r2: {c1: true}}},
          {t1: {r1: {c2: false}}},
        );
        expectNoChanges(listener);
      });

      test('setTables, different table', () => {
        store.setTables({t2: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r*/c1', {t1: {r2: {c1: false}}});
        expectChanges(listener, '/t1/r*/c*', {t1: {r2: {c1: false}}});
        expectChanges(listener, '/t*/r1/c1', {t2: {r1: {c1: true}}});
        expectChanges(listener, '/t*/r1/c*', {t2: {r1: {c1: true}}});
        expectChanges(
          listener,
          '/t*/r*/c1',
          {t2: {r1: {c1: true}}},
          {t1: {r2: {c1: false}}},
        );
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t2: {r1: {c1: true}}},
          {t1: {r2: {c1: false}}},
        );
        expectNoChanges(listener);
      });

      test('reset 2', () => {
        store.delTables();
        expectChanges(listener, '/t*/r1/c1', {t2: {r1: {c1: false}}});
        expectChanges(listener, '/t*/r1/c*', {t2: {r1: {c1: false}}});
        expectChanges(listener, '/t*/r*/c1', {t2: {r1: {c1: false}}});
        expectChanges(listener, '/t*/r*/c*', {t2: {r1: {c1: false}}});
        expectNoChanges(listener);
      });

      test('setTable', () => {
        store.setTable('t1', {r1: {c1: 1}});
        expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: true}}});
        expectChanges(listener, '/t1/r1/c*', {t1: {r1: {c1: true}}});
        expectChanges(listener, '/t1/r*/c1', {t1: {r1: {c1: true}}});
        expectChanges(listener, '/t1/r*/c*', {t1: {r1: {c1: true}}});
        expectChanges(listener, '/t*/r1/c1', {t1: {r1: {c1: true}}});
        expectChanges(listener, '/t*/r1/c*', {t1: {r1: {c1: true}}});
        expectChanges(listener, '/t*/r*/c1', {t1: {r1: {c1: true}}});
        expectChanges(listener, '/t*/r*/c*', {t1: {r1: {c1: true}}});
        expectNoChanges(listener);
      });

      test('setTable, same table, same row, same cell', () => {
        store.setTable('t1', {r1: {c1: 1}});
        expectNoChanges(listener);
      });

      test('setTable, same table, same row, change cell', () => {
        store.setTable('t1', {r1: {c1: 2}});
        expectNoChanges(listener);
      });

      test('setTable, same table, same row, different cell', () => {
        store.setTable('t1', {r1: {c2: 2}});
        expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: false}}});
        expectChanges(listener, '/t1/r1/c2', {t1: {r1: {c2: true}}});
        expectChanges(
          listener,
          '/t1/r1/c*',
          {t1: {r1: {c2: true}}},
          {t1: {r1: {c1: false}}},
        );
        expectChanges(listener, '/t1/r*/c1', {t1: {r1: {c1: false}}});
        expectChanges(
          listener,
          '/t1/r*/c*',
          {t1: {r1: {c2: true}}},
          {t1: {r1: {c1: false}}},
        );
        expectChanges(listener, '/t*/r1/c1', {t1: {r1: {c1: false}}});
        expectChanges(
          listener,
          '/t*/r1/c*',
          {t1: {r1: {c2: true}}},
          {t1: {r1: {c1: false}}},
        );
        expectChanges(listener, '/t*/r*/c1', {t1: {r1: {c1: false}}});
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {r1: {c2: true}}},
          {t1: {r1: {c1: false}}},
        );
        expectNoChanges(listener);
      });

      test('setTable, same table, different row', () => {
        store.setTable('t1', {r2: {c1: 1}});
        expectChanges(listener, '/t1/r1/c2', {t1: {r1: {c2: false}}});
        expectChanges(listener, '/t1/r1/c*', {t1: {r1: {c2: false}}});
        expectChanges(listener, '/t1/r*/c1', {t1: {r2: {c1: true}}});
        expectChanges(
          listener,
          '/t1/r*/c*',
          {t1: {r2: {c1: true}}},
          {t1: {r1: {c2: false}}},
        );
        expectChanges(listener, '/t*/r1/c*', {t1: {r1: {c2: false}}});
        expectChanges(listener, '/t*/r*/c1', {t1: {r2: {c1: true}}});
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {r2: {c1: true}}},
          {t1: {r1: {c2: false}}},
        );
        expectNoChanges(listener);
      });

      test('setTable, different table', () => {
        store.setTable('t2', {r1: {c1: 1}});
        expectChanges(listener, '/t*/r1/c1', {t2: {r1: {c1: true}}});
        expectChanges(listener, '/t*/r1/c*', {t2: {r1: {c1: true}}});
        expectChanges(listener, '/t*/r*/c1', {t2: {r1: {c1: true}}});
        expectChanges(listener, '/t*/r*/c*', {t2: {r1: {c1: true}}});
        expectNoChanges(listener);
      });

      test('reset 3', () => {
        store.delTables();
        expectChanges(listener, '/t1/r*/c1', {t1: {r2: {c1: false}}});
        expectChanges(listener, '/t1/r*/c*', {t1: {r2: {c1: false}}});
        expectChanges(listener, '/t*/r1/c1', {t2: {r1: {c1: false}}});
        expectChanges(listener, '/t*/r1/c*', {t2: {r1: {c1: false}}});
        expectChanges(
          listener,
          '/t*/r*/c1',
          {t1: {r2: {c1: false}}},
          {t2: {r1: {c1: false}}},
        );
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {r2: {c1: false}}},
          {t2: {r1: {c1: false}}},
        );
        expectNoChanges(listener);
      });

      test('setRow', () => {
        store.setRow('t1', 'r1', {c1: 1});
        expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: true}}});
        expectChanges(listener, '/t1/r1/c*', {t1: {r1: {c1: true}}});
        expectChanges(listener, '/t1/r*/c1', {t1: {r1: {c1: true}}});
        expectChanges(listener, '/t1/r*/c*', {t1: {r1: {c1: true}}});
        expectChanges(listener, '/t*/r1/c1', {t1: {r1: {c1: true}}});
        expectChanges(listener, '/t*/r1/c*', {t1: {r1: {c1: true}}});
        expectChanges(listener, '/t*/r*/c1', {t1: {r1: {c1: true}}});
        expectChanges(listener, '/t*/r*/c*', {t1: {r1: {c1: true}}});
        expectNoChanges(listener);
      });

      test('setRow, same table, same row, same cell', () => {
        store.setRow('t1', 'r1', {c1: 1});
        expectNoChanges(listener);
      });

      test('setRow, same table, same row, change cell', () => {
        store.setRow('t1', 'r1', {c1: 2});
        expectNoChanges(listener);
      });

      test('setRow, same table, same row, different cell', () => {
        store.setRow('t1', 'r1', {c2: 2});
        expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: false}}});
        expectChanges(listener, '/t1/r1/c2', {t1: {r1: {c2: true}}});
        expectChanges(
          listener,
          '/t1/r1/c*',
          {t1: {r1: {c2: true}}},
          {t1: {r1: {c1: false}}},
        );
        expectChanges(listener, '/t1/r*/c1', {t1: {r1: {c1: false}}});
        expectChanges(
          listener,
          '/t1/r*/c*',
          {t1: {r1: {c2: true}}},
          {t1: {r1: {c1: false}}},
        );
        expectChanges(listener, '/t*/r1/c1', {t1: {r1: {c1: false}}});
        expectChanges(
          listener,
          '/t*/r1/c*',
          {t1: {r1: {c2: true}}},
          {t1: {r1: {c1: false}}},
        );
        expectChanges(listener, '/t*/r*/c1', {t1: {r1: {c1: false}}});
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {r1: {c2: true}}},
          {t1: {r1: {c1: false}}},
        );
        expectNoChanges(listener);
      });

      test('setRow, same table, different row', () => {
        store.setRow('t1', 'r2', {c1: 1});
        expectChanges(listener, '/t1/r*/c1', {t1: {r2: {c1: true}}});
        expectChanges(listener, '/t1/r*/c*', {t1: {r2: {c1: true}}});
        expectChanges(listener, '/t*/r*/c1', {t1: {r2: {c1: true}}});
        expectChanges(listener, '/t*/r*/c*', {t1: {r2: {c1: true}}});
        expectNoChanges(listener);
      });

      test('setRow, different table', () => {
        store.setRow('t2', 'r1', {c1: 1});
        expectChanges(listener, '/t*/r1/c1', {t2: {r1: {c1: true}}});
        expectChanges(listener, '/t*/r1/c*', {t2: {r1: {c1: true}}});
        expectChanges(listener, '/t*/r*/c1', {t2: {r1: {c1: true}}});
        expectChanges(listener, '/t*/r*/c*', {t2: {r1: {c1: true}}});
        expectNoChanges(listener);
      });

      test('addRow', () => {
        store.addRow('t2', {c1: 1});
        expectChanges(listener, '/t*/r*/c1', {t2: {0: {c1: true}}});
        expectChanges(listener, '/t*/r*/c*', {t2: {0: {c1: true}}});
        expectNoChanges(listener);
      });

      test('addRow, over existing row', () => {
        store.transaction(() =>
          store.setRow('t2', '1', {c1: 1}).addRow('t2', {c1: 1}),
        );
        expectChanges(
          listener,
          '/t*/r*/c1',
          {t2: {1: {c1: true}}},
          {t2: {2: {c1: true}}},
        );
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t2: {1: {c1: true}}},
          {t2: {2: {c1: true}}},
        );
        expectNoChanges(listener);
      });

      test('setPartialRow', () => {
        // @ts-ignore
        store.setPartialRow('t1', 'r1', {c1: 1, c2: 3, c3: undefined});
        expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: true}}});
        expectChanges(listener, '/t1/r1/c*', {t1: {r1: {c1: true}}});
        expectChanges(listener, '/t1/r*/c1', {t1: {r1: {c1: true}}});
        expectChanges(listener, '/t1/r*/c*', {t1: {r1: {c1: true}}});
        expectChanges(listener, '/t*/r1/c1', {t1: {r1: {c1: true}}});
        expectChanges(listener, '/t*/r1/c*', {t1: {r1: {c1: true}}});
        expectChanges(listener, '/t*/r*/c1', {t1: {r1: {c1: true}}});
        expectChanges(listener, '/t*/r*/c*', {t1: {r1: {c1: true}}});
        expectNoChanges(listener);
      });

      test('reset 4', () => {
        store.delTables();
        expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: false}}});
        expectChanges(listener, '/t1/r1/c2', {t1: {r1: {c2: false}}});
        expectChanges(
          listener,
          '/t1/r1/c*',
          {t1: {r1: {c2: false}}},
          {t1: {r1: {c1: false}}},
        );
        expectChanges(
          listener,
          '/t1/r*/c1',
          {t1: {r1: {c1: false}}},
          {t1: {r2: {c1: false}}},
        );
        expectChanges(
          listener,
          '/t1/r*/c*',
          {t1: {r1: {c2: false}}},
          {t1: {r1: {c1: false}}},
          {t1: {r2: {c1: false}}},
        );
        expectChanges(
          listener,
          '/t*/r1/c1',
          {t1: {r1: {c1: false}}},
          {t2: {r1: {c1: false}}},
        );
        expectChanges(
          listener,
          '/t*/r1/c*',
          {t1: {r1: {c2: false}}},
          {t1: {r1: {c1: false}}},
          {t2: {r1: {c1: false}}},
        );
        expectChanges(
          listener,
          '/t*/r*/c1',
          {t1: {r1: {c1: false}}},
          {t1: {r2: {c1: false}}},
          {t2: {r1: {c1: false}}},
          {t2: {0: {c1: false}}},
          {t2: {1: {c1: false}}},
          {t2: {2: {c1: false}}},
        );
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {r1: {c2: false}}},
          {t1: {r1: {c1: false}}},
          {t1: {r2: {c1: false}}},
          {t2: {r1: {c1: false}}},
          {t2: {0: {c1: false}}},
          {t2: {1: {c1: false}}},
          {t2: {2: {c1: false}}},
        );
        expectNoChanges(listener);
      });

      test('setCell', () => {
        store.setCell('t1', 'r1', 'c1', 1);
        expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: true}}});
        expectChanges(listener, '/t1/r1/c*', {t1: {r1: {c1: true}}});
        expectChanges(listener, '/t1/r*/c1', {t1: {r1: {c1: true}}});
        expectChanges(listener, '/t1/r*/c*', {t1: {r1: {c1: true}}});
        expectChanges(listener, '/t*/r1/c1', {t1: {r1: {c1: true}}});
        expectChanges(listener, '/t*/r1/c*', {t1: {r1: {c1: true}}});
        expectChanges(listener, '/t*/r*/c1', {t1: {r1: {c1: true}}});
        expectChanges(listener, '/t*/r*/c*', {t1: {r1: {c1: true}}});
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, same cell', () => {
        store.setCell('t1', 'r1', 'c1', 1);
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, change cell', () => {
        store.setCell('t1', 'r1', 'c1', 2);
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, different cell', () => {
        store.setCell('t1', 'r1', 'c2', 2);
        expectChanges(listener, '/t1/r1/c2', {t1: {r1: {c2: true}}});
        expectChanges(listener, '/t1/r1/c*', {t1: {r1: {c2: true}}});
        expectChanges(listener, '/t1/r*/c*', {t1: {r1: {c2: true}}});
        expectChanges(listener, '/t*/r1/c*', {t1: {r1: {c2: true}}});
        expectChanges(listener, '/t*/r*/c*', {t1: {r1: {c2: true}}});
        expectNoChanges(listener);
      });

      test('setCell, same table, different row', () => {
        store.setCell('t1', 'r2', 'c1', 1);
        expectChanges(listener, '/t1/r*/c1', {t1: {r2: {c1: true}}});
        expectChanges(listener, '/t1/r*/c*', {t1: {r2: {c1: true}}});
        expectChanges(listener, '/t*/r*/c1', {t1: {r2: {c1: true}}});
        expectChanges(listener, '/t*/r*/c*', {t1: {r2: {c1: true}}});
        expectNoChanges(listener);
      });

      test('setCell, different table', () => {
        store.setCell('t2', 'r1', 'c1', 1);
        expectChanges(listener, '/t*/r1/c1', {t2: {r1: {c1: true}}});
        expectChanges(listener, '/t*/r1/c*', {t2: {r1: {c1: true}}});
        expectChanges(listener, '/t*/r*/c1', {t2: {r1: {c1: true}}});
        expectChanges(listener, '/t*/r*/c*', {t2: {r1: {c1: true}}});
        expectNoChanges(listener);
      });

      test('setCell, mapped', () => {
        store.setCell('t2', 'r1', 'c1', (cell) => (cell as number) + 1);
        expectNoChanges(listener);
      });

      test('Add things to delete', () => {
        store.transaction(() =>
          store.setTable('t3', {r1: {c1: 1}}).setTable('t4', {r1: {c1: 1}}),
        );
        expectChanges(
          listener,
          '/t*/r1/c1',
          {t3: {r1: {c1: true}}},
          {t4: {r1: {c1: true}}},
        );
        expectChanges(
          listener,
          '/t*/r1/c*',
          {t3: {r1: {c1: true}}},
          {t4: {r1: {c1: true}}},
        );
        expectChanges(
          listener,
          '/t*/r*/c1',
          {t3: {r1: {c1: true}}},
          {t4: {r1: {c1: true}}},
        );
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t3: {r1: {c1: true}}},
          {t4: {r1: {c1: true}}},
        );
        expectNoChanges(listener);
      });

      test('delCell', () => {
        store.delCell('t1', 'r1', 'c2');
        expectChanges(listener, '/t1/r1/c2', {t1: {r1: {c2: false}}});
        expectChanges(listener, '/t1/r1/c*', {t1: {r1: {c2: false}}});
        expectChanges(listener, '/t1/r*/c*', {t1: {r1: {c2: false}}});
        expectChanges(listener, '/t*/r1/c*', {t1: {r1: {c2: false}}});
        expectChanges(listener, '/t*/r*/c*', {t1: {r1: {c2: false}}});
        expectNoChanges(listener);
      });

      test('delCell, cascade', () => {
        store.delCell('t2', 'r1', 'c1');
        expectChanges(listener, '/t*/r1/c1', {t2: {r1: {c1: false}}});
        expectChanges(listener, '/t*/r1/c*', {t2: {r1: {c1: false}}});
        expectChanges(listener, '/t*/r*/c1', {t2: {r1: {c1: false}}});
        expectChanges(listener, '/t*/r*/c*', {t2: {r1: {c1: false}}});
        expectNoChanges(listener);
      });

      test('delRow', () => {
        store.delRow('t1', 'r2');
        expectChanges(listener, '/t1/r*/c1', {t1: {r2: {c1: false}}});
        expectChanges(listener, '/t1/r*/c*', {t1: {r2: {c1: false}}});
        expectChanges(listener, '/t*/r*/c1', {t1: {r2: {c1: false}}});
        expectChanges(listener, '/t*/r*/c*', {t1: {r2: {c1: false}}});
        expectNoChanges(listener);
      });

      test('delRow, cascade', () => {
        store.delRow('t1', 'r1');
        expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: false}}});
        expectChanges(listener, '/t1/r1/c*', {t1: {r1: {c1: false}}});
        expectChanges(listener, '/t1/r*/c1', {t1: {r1: {c1: false}}});
        expectChanges(listener, '/t1/r*/c*', {t1: {r1: {c1: false}}});
        expectChanges(listener, '/t*/r1/c1', {t1: {r1: {c1: false}}});
        expectChanges(listener, '/t*/r1/c*', {t1: {r1: {c1: false}}});
        expectChanges(listener, '/t*/r*/c1', {t1: {r1: {c1: false}}});
        expectChanges(listener, '/t*/r*/c*', {t1: {r1: {c1: false}}});
        expectNoChanges(listener);
      });

      test('delTable', () => {
        store.delTable('t3');
        expectChanges(listener, '/t*/r1/c1', {t3: {r1: {c1: false}}});
        expectChanges(listener, '/t*/r1/c*', {t3: {r1: {c1: false}}});
        expectChanges(listener, '/t*/r*/c1', {t3: {r1: {c1: false}}});
        expectChanges(listener, '/t*/r*/c*', {t3: {r1: {c1: false}}});
        expectNoChanges(listener);
      });

      test('delTables', () => {
        store.delTables();
        expectChanges(listener, '/t*/r1/c1', {t4: {r1: {c1: false}}});
        expectChanges(listener, '/t*/r1/c*', {t4: {r1: {c1: false}}});
        expectChanges(listener, '/t*/r*/c1', {t4: {r1: {c1: false}}});
        expectChanges(listener, '/t*/r*/c*', {t4: {r1: {c1: false}}});
      });
    });

    describe('cell', () => {
      beforeAll(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToCell('/t1/r1/c1', 't1', 'r1', 'c1');
        listener.listenToCell('/t1/r1/c2', 't1', 'r1', 'c2');
        listener.listenToCell('/t1/r1/c*', 't1', 'r1', null);
        listener.listenToCell('/t1/r*/c1', 't1', null, 'c1');
        listener.listenToCell('/t1/r*/c*', 't1', null, null);
        listener.listenToCell('/t*/r1/c1', null, 'r1', 'c1');
        listener.listenToCell('/t*/r1/c*', null, 'r1', null);
        listener.listenToCell('/t*/r*/c1', null, null, 'c1');
        listener.listenToCell('/t*/r*/c*', null, null, null);
      });

      test('reset 1', () => {
        store.delTables();
        expectNoChanges(listener);
      });

      test('setTables', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r1/c*', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r*/c1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r*/c*', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r1/c1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r1/c*', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r*/c1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r*/c*', {t1: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setTables, same table, same row, same cell', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setTables, same table, same row, change cell', () => {
        store.setTables({t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t1/r1/c*', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t1/r*/c1', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t1/r*/c*', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t*/r1/c1', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t*/r1/c*', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t*/r*/c1', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t*/r*/c*', {t1: {r1: {c1: 2}}});
        expectNoChanges(listener);
      });

      test('setTables, same table, same row, different cell', () => {
        store.setTables({t1: {r1: {c2: 2}}});
        expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: undefined}}});
        expectChanges(listener, '/t1/r1/c2', {t1: {r1: {c2: 2}}});
        expectChanges(
          listener,
          '/t1/r1/c*',
          {t1: {r1: {c2: 2}}},
          {t1: {r1: {c1: undefined}}},
        );
        expectChanges(listener, '/t1/r*/c1', {t1: {r1: {c1: undefined}}});
        expectChanges(
          listener,
          '/t1/r*/c*',
          {t1: {r1: {c2: 2}}},
          {t1: {r1: {c1: undefined}}},
        );
        expectChanges(listener, '/t*/r1/c1', {t1: {r1: {c1: undefined}}});
        expectChanges(
          listener,
          '/t*/r1/c*',
          {t1: {r1: {c2: 2}}},
          {t1: {r1: {c1: undefined}}},
        );
        expectChanges(listener, '/t*/r*/c1', {t1: {r1: {c1: undefined}}});
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {r1: {c2: 2}}},
          {t1: {r1: {c1: undefined}}},
        );
        expectNoChanges(listener);
      });

      test('setTables, same table, different row', () => {
        store.setTables({t1: {r2: {c1: 1}}});
        expectChanges(listener, '/t1/r1/c2', {t1: {r1: {c2: undefined}}});
        expectChanges(listener, '/t1/r1/c*', {t1: {r1: {c2: undefined}}});
        expectChanges(listener, '/t1/r*/c1', {t1: {r2: {c1: 1}}});
        expectChanges(
          listener,
          '/t1/r*/c*',
          {t1: {r2: {c1: 1}}},
          {t1: {r1: {c2: undefined}}},
        );
        expectChanges(listener, '/t*/r1/c*', {t1: {r1: {c2: undefined}}});
        expectChanges(listener, '/t*/r*/c1', {t1: {r2: {c1: 1}}});
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {r2: {c1: 1}}},
          {t1: {r1: {c2: undefined}}},
        );
        expectNoChanges(listener);
      });

      test('setTables, different table', () => {
        store.setTables({t2: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r*/c1', {t1: {r2: {c1: undefined}}});
        expectChanges(listener, '/t1/r*/c*', {t1: {r2: {c1: undefined}}});
        expectChanges(listener, '/t*/r1/c1', {t2: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r1/c*', {t2: {r1: {c1: 1}}});
        expectChanges(
          listener,
          '/t*/r*/c1',
          {t2: {r1: {c1: 1}}},
          {t1: {r2: {c1: undefined}}},
        );
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t2: {r1: {c1: 1}}},
          {t1: {r2: {c1: undefined}}},
        );
        expectNoChanges(listener);
      });

      test('reset 2', () => {
        store.delTables();
        expectChanges(listener, '/t*/r1/c1', {t2: {r1: {c1: undefined}}});
        expectChanges(listener, '/t*/r1/c*', {t2: {r1: {c1: undefined}}});
        expectChanges(listener, '/t*/r*/c1', {t2: {r1: {c1: undefined}}});
        expectChanges(listener, '/t*/r*/c*', {t2: {r1: {c1: undefined}}});
        expectNoChanges(listener);
      });

      test('setTable', () => {
        store.setTable('t1', {r1: {c1: 1}});
        expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r1/c*', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r*/c1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r*/c*', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r1/c1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r1/c*', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r*/c1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r*/c*', {t1: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setTable, same table, same row, same cell', () => {
        store.setTable('t1', {r1: {c1: 1}});
        expectNoChanges(listener);
      });

      test('setTable, same table, same row, change cell', () => {
        store.setTable('t1', {r1: {c1: 2}});
        expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t1/r1/c*', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t1/r*/c1', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t1/r*/c*', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t*/r1/c1', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t*/r1/c*', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t*/r*/c1', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t*/r*/c*', {t1: {r1: {c1: 2}}});
        expectNoChanges(listener);
      });

      test('setTable, same table, same row, different cell', () => {
        store.setTable('t1', {r1: {c2: 2}});
        expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: undefined}}});
        expectChanges(listener, '/t1/r1/c2', {t1: {r1: {c2: 2}}});
        expectChanges(
          listener,
          '/t1/r1/c*',
          {t1: {r1: {c2: 2}}},
          {t1: {r1: {c1: undefined}}},
        );
        expectChanges(listener, '/t1/r*/c1', {t1: {r1: {c1: undefined}}});
        expectChanges(
          listener,
          '/t1/r*/c*',
          {t1: {r1: {c2: 2}}},
          {t1: {r1: {c1: undefined}}},
        );
        expectChanges(listener, '/t*/r1/c1', {t1: {r1: {c1: undefined}}});
        expectChanges(
          listener,
          '/t*/r1/c*',
          {t1: {r1: {c2: 2}}},
          {t1: {r1: {c1: undefined}}},
        );
        expectChanges(listener, '/t*/r*/c1', {t1: {r1: {c1: undefined}}});
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {r1: {c2: 2}}},
          {t1: {r1: {c1: undefined}}},
        );
        expectNoChanges(listener);
      });

      test('setTable, same table, different row', () => {
        store.setTable('t1', {r2: {c1: 1}});
        expectChanges(listener, '/t1/r1/c2', {t1: {r1: {c2: undefined}}});
        expectChanges(listener, '/t1/r1/c*', {t1: {r1: {c2: undefined}}});
        expectChanges(listener, '/t1/r*/c1', {t1: {r2: {c1: 1}}});
        expectChanges(
          listener,
          '/t1/r*/c*',
          {t1: {r2: {c1: 1}}},
          {t1: {r1: {c2: undefined}}},
        );
        expectChanges(listener, '/t*/r1/c*', {t1: {r1: {c2: undefined}}});
        expectChanges(listener, '/t*/r*/c1', {t1: {r2: {c1: 1}}});
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {r2: {c1: 1}}},
          {t1: {r1: {c2: undefined}}},
        );
        expectNoChanges(listener);
      });

      test('setTable, different table', () => {
        store.setTable('t2', {r1: {c1: 1}});
        expectChanges(listener, '/t*/r1/c1', {t2: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r1/c*', {t2: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r*/c1', {t2: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r*/c*', {t2: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('reset 3', () => {
        store.delTables();
        expectChanges(listener, '/t1/r*/c1', {t1: {r2: {c1: undefined}}});
        expectChanges(listener, '/t1/r*/c*', {t1: {r2: {c1: undefined}}});
        expectChanges(listener, '/t*/r1/c1', {t2: {r1: {c1: undefined}}});
        expectChanges(listener, '/t*/r1/c*', {t2: {r1: {c1: undefined}}});
        expectChanges(
          listener,
          '/t*/r*/c1',
          {t1: {r2: {c1: undefined}}},
          {t2: {r1: {c1: undefined}}},
        );
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {r2: {c1: undefined}}},
          {t2: {r1: {c1: undefined}}},
        );
        expectNoChanges(listener);
      });

      test('setRow', () => {
        store.setRow('t1', 'r1', {c1: 1});
        expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r1/c*', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r*/c1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r*/c*', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r1/c1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r1/c*', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r*/c1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r*/c*', {t1: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setRow, same table, same row, same cell', () => {
        store.setRow('t1', 'r1', {c1: 1});
        expectNoChanges(listener);
      });

      test('setRow, same table, same row, change cell', () => {
        store.setRow('t1', 'r1', {c1: 2});
        expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t1/r1/c*', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t1/r*/c1', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t1/r*/c*', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t*/r1/c1', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t*/r1/c*', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t*/r*/c1', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t*/r*/c*', {t1: {r1: {c1: 2}}});
        expectNoChanges(listener);
      });

      test('setRow, same table, same row, different cell', () => {
        store.setRow('t1', 'r1', {c2: 2});
        expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: undefined}}});
        expectChanges(listener, '/t1/r1/c2', {t1: {r1: {c2: 2}}});
        expectChanges(
          listener,
          '/t1/r1/c*',
          {t1: {r1: {c2: 2}}},
          {t1: {r1: {c1: undefined}}},
        );
        expectChanges(listener, '/t1/r*/c1', {t1: {r1: {c1: undefined}}});
        expectChanges(
          listener,
          '/t1/r*/c*',
          {t1: {r1: {c2: 2}}},
          {t1: {r1: {c1: undefined}}},
        );
        expectChanges(listener, '/t*/r1/c1', {t1: {r1: {c1: undefined}}});
        expectChanges(
          listener,
          '/t*/r1/c*',
          {t1: {r1: {c2: 2}}},
          {t1: {r1: {c1: undefined}}},
        );
        expectChanges(listener, '/t*/r*/c1', {t1: {r1: {c1: undefined}}});
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {r1: {c2: 2}}},
          {t1: {r1: {c1: undefined}}},
        );
        expectNoChanges(listener);
      });

      test('setRow, same table, different row', () => {
        store.setRow('t1', 'r2', {c1: 1});
        expectChanges(listener, '/t1/r*/c1', {t1: {r2: {c1: 1}}});
        expectChanges(listener, '/t1/r*/c*', {t1: {r2: {c1: 1}}});
        expectChanges(listener, '/t*/r*/c1', {t1: {r2: {c1: 1}}});
        expectChanges(listener, '/t*/r*/c*', {t1: {r2: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setRow, different table', () => {
        store.setRow('t2', 'r1', {c1: 1});
        expectChanges(listener, '/t*/r1/c1', {t2: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r1/c*', {t2: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r*/c1', {t2: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r*/c*', {t2: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('addRow', () => {
        store.addRow('t2', {c1: 1});
        expectChanges(listener, '/t*/r*/c1', {t2: {0: {c1: 1}}});
        expectChanges(listener, '/t*/r*/c*', {t2: {0: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('addRow, over existing row', () => {
        store.transaction(() =>
          store.setRow('t2', '1', {c1: 1}).addRow('t2', {c1: 1}),
        );
        expectChanges(
          listener,
          '/t*/r*/c1',
          {t2: {1: {c1: 1}}},
          {t2: {2: {c1: 1}}},
        );
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t2: {1: {c1: 1}}},
          {t2: {2: {c1: 1}}},
        );
        expectNoChanges(listener);
      });

      test('setPartialRow', () => {
        // @ts-ignore
        store.setPartialRow('t1', 'r1', {c1: 1, c2: 3, c3: undefined});
        expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r1/c2', {t1: {r1: {c2: 3}}});
        expectChanges(
          listener,
          '/t1/r1/c*',
          {t1: {r1: {c1: 1}}},
          {t1: {r1: {c2: 3}}},
        );
        expectChanges(listener, '/t1/r*/c1', {t1: {r1: {c1: 1}}});
        expectChanges(
          listener,
          '/t1/r*/c*',
          {t1: {r1: {c1: 1}}},
          {t1: {r1: {c2: 3}}},
        );
        expectChanges(listener, '/t*/r1/c1', {t1: {r1: {c1: 1}}});
        expectChanges(
          listener,
          '/t*/r1/c*',
          {t1: {r1: {c1: 1}}},
          {t1: {r1: {c2: 3}}},
        );
        expectChanges(listener, '/t*/r*/c1', {t1: {r1: {c1: 1}}});
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {r1: {c1: 1}}},
          {t1: {r1: {c2: 3}}},
        );
        expectNoChanges(listener);
      });

      test('reset 4', () => {
        store.delTables();
        expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: undefined}}});
        expectChanges(listener, '/t1/r1/c2', {t1: {r1: {c2: undefined}}});
        expectChanges(
          listener,
          '/t1/r1/c*',
          {t1: {r1: {c1: undefined}}},
          {t1: {r1: {c2: undefined}}},
        );
        expectChanges(
          listener,
          '/t1/r*/c1',
          {t1: {r1: {c1: undefined}}},
          {t1: {r2: {c1: undefined}}},
        );
        expectChanges(
          listener,
          '/t1/r*/c*',
          {t1: {r1: {c1: undefined}}},
          {t1: {r1: {c2: undefined}}},
          {t1: {r2: {c1: undefined}}},
        );
        expectChanges(
          listener,
          '/t*/r1/c1',
          {t1: {r1: {c1: undefined}}},
          {t2: {r1: {c1: undefined}}},
        );
        expectChanges(
          listener,
          '/t*/r1/c*',
          {t1: {r1: {c1: undefined}}},
          {t1: {r1: {c2: undefined}}},
          {t2: {r1: {c1: undefined}}},
        );
        expectChanges(
          listener,
          '/t*/r*/c1',
          {t1: {r1: {c1: undefined}}},
          {t1: {r2: {c1: undefined}}},
          {t2: {r1: {c1: undefined}}},
          {t2: {0: {c1: undefined}}},
          {t2: {1: {c1: undefined}}},
          {t2: {2: {c1: undefined}}},
        );
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {r1: {c1: undefined}}},
          {t1: {r1: {c2: undefined}}},
          {t1: {r2: {c1: undefined}}},
          {t2: {r1: {c1: undefined}}},
          {t2: {0: {c1: undefined}}},
          {t2: {1: {c1: undefined}}},
          {t2: {2: {c1: undefined}}},
        );
        expectNoChanges(listener);
      });

      test('setCell', () => {
        store.setCell('t1', 'r1', 'c1', 1);
        expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r1/c*', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r*/c1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r*/c*', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r1/c1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r1/c*', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r*/c1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r*/c*', {t1: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, same cell', () => {
        store.setCell('t1', 'r1', 'c1', 1);
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, change cell', () => {
        store.setCell('t1', 'r1', 'c1', 2);
        expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t1/r1/c*', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t1/r*/c1', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t1/r*/c*', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t*/r1/c1', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t*/r1/c*', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t*/r*/c1', {t1: {r1: {c1: 2}}});
        expectChanges(listener, '/t*/r*/c*', {t1: {r1: {c1: 2}}});
        expectNoChanges(listener);
      });

      test('setCell, same table, same row, different cell', () => {
        store.setCell('t1', 'r1', 'c2', 2);
        expectChanges(listener, '/t1/r1/c2', {t1: {r1: {c2: 2}}});
        expectChanges(listener, '/t1/r1/c*', {t1: {r1: {c2: 2}}});
        expectChanges(listener, '/t1/r*/c*', {t1: {r1: {c2: 2}}});
        expectChanges(listener, '/t*/r1/c*', {t1: {r1: {c2: 2}}});
        expectChanges(listener, '/t*/r*/c*', {t1: {r1: {c2: 2}}});
        expectNoChanges(listener);
      });

      test('setCell, same table, different row', () => {
        store.setCell('t1', 'r2', 'c1', 1);
        expectChanges(listener, '/t1/r*/c1', {t1: {r2: {c1: 1}}});
        expectChanges(listener, '/t1/r*/c*', {t1: {r2: {c1: 1}}});
        expectChanges(listener, '/t*/r*/c1', {t1: {r2: {c1: 1}}});
        expectChanges(listener, '/t*/r*/c*', {t1: {r2: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setCell, different table', () => {
        store.setCell('t2', 'r1', 'c1', 1);
        expectChanges(listener, '/t*/r1/c1', {t2: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r1/c*', {t2: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r*/c1', {t2: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r*/c*', {t2: {r1: {c1: 1}}});
        expectNoChanges(listener);
      });

      test('setCell, mapped', () => {
        store.setCell('t2', 'r1', 'c1', (cell) => (cell as number) + 1);
        expectChanges(listener, '/t*/r1/c1', {t2: {r1: {c1: 2}}});
        expectChanges(listener, '/t*/r1/c*', {t2: {r1: {c1: 2}}});
        expectChanges(listener, '/t*/r*/c1', {t2: {r1: {c1: 2}}});
        expectChanges(listener, '/t*/r*/c*', {t2: {r1: {c1: 2}}});
        expectNoChanges(listener);
      });

      test('Add things to delete', () => {
        store.transaction(() =>
          store.setTable('t3', {r1: {c1: 1}}).setTable('t4', {r1: {c1: 1}}),
        );
        expectChanges(
          listener,
          '/t*/r1/c1',
          {t3: {r1: {c1: 1}}},
          {t4: {r1: {c1: 1}}},
        );
        expectChanges(
          listener,
          '/t*/r1/c*',
          {t3: {r1: {c1: 1}}},
          {t4: {r1: {c1: 1}}},
        );
        expectChanges(
          listener,
          '/t*/r*/c1',
          {t3: {r1: {c1: 1}}},
          {t4: {r1: {c1: 1}}},
        );
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t3: {r1: {c1: 1}}},
          {t4: {r1: {c1: 1}}},
        );
        expectNoChanges(listener);
      });

      test('delCell', () => {
        store.delCell('t1', 'r1', 'c2');
        expectChanges(listener, '/t1/r1/c2', {t1: {r1: {c2: undefined}}});
        expectChanges(listener, '/t1/r1/c*', {t1: {r1: {c2: undefined}}});
        expectChanges(listener, '/t1/r*/c*', {t1: {r1: {c2: undefined}}});
        expectChanges(listener, '/t*/r1/c*', {t1: {r1: {c2: undefined}}});
        expectChanges(listener, '/t*/r*/c*', {t1: {r1: {c2: undefined}}});
        expectNoChanges(listener);
      });

      test('delCell, cascade', () => {
        store.delCell('t2', 'r1', 'c1');
        expectChanges(listener, '/t*/r1/c1', {t2: {r1: {c1: undefined}}});
        expectChanges(listener, '/t*/r1/c*', {t2: {r1: {c1: undefined}}});
        expectChanges(listener, '/t*/r*/c1', {t2: {r1: {c1: undefined}}});
        expectChanges(listener, '/t*/r*/c*', {t2: {r1: {c1: undefined}}});
        expectNoChanges(listener);
      });

      test('delRow', () => {
        store.delRow('t1', 'r2');
        expectChanges(listener, '/t1/r*/c1', {t1: {r2: {c1: undefined}}});
        expectChanges(listener, '/t1/r*/c*', {t1: {r2: {c1: undefined}}});
        expectChanges(listener, '/t*/r*/c1', {t1: {r2: {c1: undefined}}});
        expectChanges(listener, '/t*/r*/c*', {t1: {r2: {c1: undefined}}});
        expectNoChanges(listener);
      });

      test('delRow, cascade', () => {
        store.delRow('t1', 'r1');
        expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: undefined}}});
        expectChanges(listener, '/t1/r1/c*', {t1: {r1: {c1: undefined}}});
        expectChanges(listener, '/t1/r*/c1', {t1: {r1: {c1: undefined}}});
        expectChanges(listener, '/t1/r*/c*', {t1: {r1: {c1: undefined}}});
        expectChanges(listener, '/t*/r1/c1', {t1: {r1: {c1: undefined}}});
        expectChanges(listener, '/t*/r1/c*', {t1: {r1: {c1: undefined}}});
        expectChanges(listener, '/t*/r*/c1', {t1: {r1: {c1: undefined}}});
        expectChanges(listener, '/t*/r*/c*', {t1: {r1: {c1: undefined}}});
        expectNoChanges(listener);
      });

      test('delTable', () => {
        store.delTable('t3');
        expectChanges(listener, '/t*/r1/c1', {t3: {r1: {c1: undefined}}});
        expectChanges(listener, '/t*/r1/c*', {t3: {r1: {c1: undefined}}});
        expectChanges(listener, '/t*/r*/c1', {t3: {r1: {c1: undefined}}});
        expectChanges(listener, '/t*/r*/c*', {t3: {r1: {c1: undefined}}});
        expectNoChanges(listener);
      });

      test('delTables', () => {
        store.delTables();
        expectChanges(listener, '/t*/r1/c1', {t4: {r1: {c1: undefined}}});
        expectChanges(listener, '/t*/r1/c*', {t4: {r1: {c1: undefined}}});
        expectChanges(listener, '/t*/r*/c1', {t4: {r1: {c1: undefined}}});
        expectChanges(listener, '/t*/r*/c*', {t4: {r1: {c1: undefined}}});
      });
    });

    describe('invalid cell', () => {
      beforeEach(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToInvalidCell('i:/t1/r1/c1', 't1', 'r1', 'c1');
        listener.listenToInvalidCell('i:/t1/r1/c2', 't1', 'r1', 'c2');
        listener.listenToInvalidCell('i:/t1/r1/c*', 't1', 'r1', null);
        listener.listenToInvalidCell('i:/t1/r*/c1', 't1', null, 'c1');
        listener.listenToInvalidCell('i:/t1/r*/c*', 't1', null, null);
        listener.listenToInvalidCell('i:/t*/r1/c1', null, 'r1', 'c1');
        listener.listenToInvalidCell('i:/t*/r1/c*', null, 'r1', null);
        listener.listenToInvalidCell('i:/t*/r*/c1', null, null, 'c1');
        listener.listenToInvalidCell('i:/t*/r*/c*', null, null, null);
      });

      test('reset', () => {
        store.delTables();
        expectNoChanges(listener);
      });

      test('setTables', () => {
        // @ts-ignore
        store.setTables({t1: {r1: {c1: []}}});
        expectChanges(listener, 'i:/t1/r1/c1', {t1: {r1: {c1: [[]]}}});
        expectChanges(listener, 'i:/t1/r1/c*', {t1: {r1: {c1: [[]]}}});
        expectChanges(listener, 'i:/t1/r*/c1', {t1: {r1: {c1: [[]]}}});
        expectChanges(listener, 'i:/t1/r*/c*', {t1: {r1: {c1: [[]]}}});
        expectChanges(listener, 'i:/t*/r1/c1', {t1: {r1: {c1: [[]]}}});
        expectChanges(listener, 'i:/t*/r1/c*', {t1: {r1: {c1: [[]]}}});
        expectChanges(listener, 'i:/t*/r*/c1', {t1: {r1: {c1: [[]]}}});
        expectChanges(listener, 'i:/t*/r*/c*', {t1: {r1: {c1: [[]]}}});
        expectNoChanges(listener);
      });

      test('setTables, empty', () => {
        // @ts-ignore
        store.setTables({});
        expectChangesNoJson(listener, 'i:/t*/r*/c*', {
          undefined: {undefined: {undefined: [undefined]}},
        });
        expectNoChanges(listener);
      });

      test('setTable', () => {
        // @ts-ignore
        store.setTable('t1', {r1: {c1: []}});
        expectChanges(listener, 'i:/t1/r1/c1', {t1: {r1: {c1: [[]]}}});
        expectChanges(listener, 'i:/t1/r1/c*', {t1: {r1: {c1: [[]]}}});
        expectChanges(listener, 'i:/t1/r*/c1', {t1: {r1: {c1: [[]]}}});
        expectChanges(listener, 'i:/t1/r*/c*', {t1: {r1: {c1: [[]]}}});
        expectChanges(listener, 'i:/t*/r1/c1', {t1: {r1: {c1: [[]]}}});
        expectChanges(listener, 'i:/t*/r1/c*', {t1: {r1: {c1: [[]]}}});
        expectChanges(listener, 'i:/t*/r*/c1', {t1: {r1: {c1: [[]]}}});
        expectChanges(listener, 'i:/t*/r*/c*', {t1: {r1: {c1: [[]]}}});
        expectNoChanges(listener);
      });

      test('setTable, empty', () => {
        // @ts-ignore
        store.setTable('t1', {});
        expectChangesNoJson(listener, 'i:/t1/r*/c*', {
          t1: {undefined: {undefined: [undefined]}},
        });
        expectChangesNoJson(listener, 'i:/t*/r*/c*', {
          t1: {undefined: {undefined: [undefined]}},
        });
        expectNoChanges(listener);
      });

      test('setRow', () => {
        // @ts-ignore
        store.setRow('t1', 'r1', {c1: []});
        expectChanges(listener, 'i:/t1/r1/c1', {t1: {r1: {c1: [[]]}}});
        expectChanges(listener, 'i:/t1/r1/c*', {t1: {r1: {c1: [[]]}}});
        expectChanges(listener, 'i:/t1/r*/c1', {t1: {r1: {c1: [[]]}}});
        expectChanges(listener, 'i:/t1/r*/c*', {t1: {r1: {c1: [[]]}}});
        expectChanges(listener, 'i:/t*/r1/c1', {t1: {r1: {c1: [[]]}}});
        expectChanges(listener, 'i:/t*/r1/c*', {t1: {r1: {c1: [[]]}}});
        expectChanges(listener, 'i:/t*/r*/c1', {t1: {r1: {c1: [[]]}}});
        expectChanges(listener, 'i:/t*/r*/c*', {t1: {r1: {c1: [[]]}}});
        expectNoChanges(listener);
      });

      test('setRow, empty', () => {
        // @ts-ignore
        store.setRow('t1', 'r1', {});
        expectChangesNoJson(listener, 'i:/t1/r1/c*', {
          t1: {r1: {undefined: [undefined]}},
        });
        expectChangesNoJson(listener, 'i:/t1/r*/c*', {
          t1: {r1: {undefined: [undefined]}},
        });
        expectChangesNoJson(listener, 'i:/t*/r1/c*', {
          t1: {r1: {undefined: [undefined]}},
        });
        expectChangesNoJson(listener, 'i:/t*/r*/c*', {
          t1: {r1: {undefined: [undefined]}},
        });
        expectNoChanges(listener);
      });

      test('addRow', () => {
        // @ts-ignore
        store.addRow('t2', {c1: []});
        expectChanges(listener, 'i:/t*/r*/c1', {t2: {undefined: {c1: [[]]}}});
        expectChanges(listener, 'i:/t*/r*/c*', {t2: {undefined: {c1: [[]]}}});
        expectNoChanges(listener);
      });

      test('addRow, empty', () => {
        // @ts-ignore
        store.addRow('t2', {});
        expectChangesNoJson(listener, 'i:/t*/r*/c*', {
          t2: {undefined: {undefined: [undefined]}},
        });
        expectNoChanges(listener);
      });

      test('setPartialRow', () => {
        // @ts-ignore
        store.setPartialRow('t1', 'r1', {c1: 1, c2: []});
        expectChanges(listener, 'i:/t1/r1/c2', {t1: {r1: {c2: [[]]}}});
        expectChanges(listener, 'i:/t1/r1/c*', {t1: {r1: {c2: [[]]}}});
        expectChanges(listener, 'i:/t1/r*/c*', {t1: {r1: {c2: [[]]}}});
        expectChanges(listener, 'i:/t*/r1/c*', {t1: {r1: {c2: [[]]}}});
        expectChanges(listener, 'i:/t*/r*/c*', {t1: {r1: {c2: [[]]}}});
        expectNoChanges(listener);
        store.delTables();
      });

      test('setCell', () => {
        // @ts-ignore
        store.setCell('t1', 'r1', 'c1', []);
        expectChanges(listener, 'i:/t1/r1/c1', {t1: {r1: {c1: [[]]}}});
        expectChanges(listener, 'i:/t1/r1/c*', {t1: {r1: {c1: [[]]}}});
        expectChanges(listener, 'i:/t1/r*/c1', {t1: {r1: {c1: [[]]}}});
        expectChanges(listener, 'i:/t1/r*/c*', {t1: {r1: {c1: [[]]}}});
        expectChanges(listener, 'i:/t*/r1/c1', {t1: {r1: {c1: [[]]}}});
        expectChanges(listener, 'i:/t*/r1/c*', {t1: {r1: {c1: [[]]}}});
        expectChanges(listener, 'i:/t*/r*/c1', {t1: {r1: {c1: [[]]}}});
        expectChanges(listener, 'i:/t*/r*/c*', {t1: {r1: {c1: [[]]}}});
        expectNoChanges(listener);
      });

      test('setCell, mapped', () => {
        store.setCell('t2', 'r1', 'c1', 1);
        // @ts-ignore
        store.setCell('t2', 'r1', 'c1', (cell) => [cell]);
        expectChanges(listener, 'i:/t*/r1/c1', {t2: {r1: {c1: [[1]]}}});
        expectChanges(listener, 'i:/t*/r1/c*', {t2: {r1: {c1: [[1]]}}});
        expectChanges(listener, 'i:/t*/r*/c1', {t2: {r1: {c1: [[1]]}}});
        expectChanges(listener, 'i:/t*/r*/c*', {t2: {r1: {c1: [[1]]}}});
        expectNoChanges(listener);
      });
    });

    describe('hasValues', () => {
      beforeAll(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToHasValues('/');
      });

      test('reset 1', () => {
        store.delValues();
        expectNoChanges(listener);
      });

      test('setValues', () => {
        store.setValues({v1: 1});
        expectChanges(listener, '/', true);
        expectNoChanges(listener);
      });

      test('setValues, same value', () => {
        store.setValues({v1: 1});
        expectNoChanges(listener);
      });

      test('setValues, change value', () => {
        store.setValues({v1: 2});
        expectNoChanges(listener);
      });

      test('setValues, different value', () => {
        store.setValues({v2: 2});
        expectNoChanges(listener);
      });

      test('setPartialValues', () => {
        // @ts-ignore
        store.setPartialValues({v1: 1, v3: undefined});
        expectNoChanges(listener);
      });

      test('reset 2', () => {
        store.delValues();
        expectChanges(listener, '/', false);
        expectNoChanges(listener);
      });

      test('setValue', () => {
        store.setValue('v1', 1);
        expectChanges(listener, '/', true);
        expectNoChanges(listener);
      });

      test('setValue, same value', () => {
        store.setValue('v1', 1);
        expectNoChanges(listener);
      });

      test('setValue, change value', () => {
        store.setValue('v1', 2);
        expectNoChanges(listener);
      });

      test('setValue, different value', () => {
        store.setValue('v2', 2);
        expectNoChanges(listener);
      });

      test('setValue, mapped', () => {
        store.setValue('v2', (value) => (value as number) + 1);
        expectNoChanges(listener);
      });

      test('Add things to delete', () => {
        store.setValues({v1: 1, v2: 2, v3: 3});
        expectNoChanges(listener);
      });

      test('delValue', () => {
        store.delValue('v1');
        expectNoChanges(listener);
      });

      test('delValues', () => {
        store.delValues();
        expectChanges(listener, '/', false);
        expectNoChanges(listener);
      });
    });

    describe('values', () => {
      beforeAll(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToValues('/');
      });

      test('reset 1', () => {
        store.delValues();
        expectNoChanges(listener);
      });

      test('setValues', () => {
        store.setValues({v1: 1});
        expectChanges(listener, '/', {v1: 1});
        expectNoChanges(listener);
      });

      test('setValues, same value', () => {
        store.setValues({v1: 1});
        expectNoChanges(listener);
      });

      test('setValues, change value', () => {
        store.setValues({v1: 2});
        expectChanges(listener, '/', {v1: 2});
        expectNoChanges(listener);
      });

      test('setValues, different value', () => {
        store.setValues({v2: 2});
        expectChanges(listener, '/', {v2: 2});
        expectNoChanges(listener);
      });

      test('setPartialValues', () => {
        // @ts-ignore
        store.setPartialValues({v1: 1, v3: undefined});
        expectChanges(listener, '/', {v2: 2, v1: 1});
        expectNoChanges(listener);
      });

      test('reset 2', () => {
        store.delValues();
        expectChanges(listener, '/', {});
        expectNoChanges(listener);
      });

      test('setValue', () => {
        store.setValue('v1', 1);
        expectChanges(listener, '/', {v1: 1});
        expectNoChanges(listener);
      });

      test('setValue, same value', () => {
        store.setValue('v1', 1);
        expectNoChanges(listener);
      });

      test('setValue, change value', () => {
        store.setValue('v1', 2);
        expectChanges(listener, '/', {v1: 2});
        expectNoChanges(listener);
      });

      test('setValue, different value', () => {
        store.setValue('v2', 2);
        expectChanges(listener, '/', {v1: 2, v2: 2});
        expectNoChanges(listener);
      });

      test('setValue, mapped', () => {
        store.setValue('v2', (value) => (value as number) + 1);
        expectChanges(listener, '/', {v1: 2, v2: 3});
        expectNoChanges(listener);
      });

      test('Add things to delete', () => {
        store.setValues({v1: 1, v2: 2, v3: 3});
        expectChanges(listener, '/', {v1: 1, v2: 2, v3: 3});
        expectNoChanges(listener);
      });

      test('delValue', () => {
        store.delValue('v1');
        expectChanges(listener, '/', {v2: 2, v3: 3});
        expectNoChanges(listener);
      });

      test('delValues', () => {
        store.delValues();
        expectChanges(listener, '/', {});
        expectNoChanges(listener);
      });
    });

    describe('valueIds', () => {
      beforeAll(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToValueIds('/');
      });

      test('reset 1', () => {
        store.delValues();
        expectNoChanges(listener);
      });

      test('setValues', () => {
        store.setValues({v1: 1});
        expectChanges(listener, '/', [['v1'], {v1: 1}]);
        expectNoChanges(listener);
      });

      test('setValues, same value', () => {
        store.setValues({v1: 1});
        expectNoChanges(listener);
      });

      test('setValues, change value', () => {
        store.setValues({v1: 2});
        expectNoChanges(listener);
      });

      test('setValues, different value', () => {
        store.setValues({v2: 2});
        expectChanges(listener, '/', [['v2'], {v2: 1, v1: -1}]);
        expectNoChanges(listener);
      });

      test('setPartialValues', () => {
        // @ts-ignore
        store.setPartialValues({v1: 1, v3: undefined});
        expectChanges(listener, '/', [['v2', 'v1'], {v1: 1}]);
        expectNoChanges(listener);
      });

      test('reset 2', () => {
        store.delValues();
        expectChanges(listener, '/', [[], {v2: -1, v1: -1}]);
        expectNoChanges(listener);
      });

      test('setValue', () => {
        store.setValue('v1', 1);
        expectChanges(listener, '/', [['v1'], {v1: 1}]);
        expectNoChanges(listener);
      });

      test('setValue, same value', () => {
        store.setValue('v1', 1);
        expectNoChanges(listener);
      });

      test('setValue, change value', () => {
        store.setValue('v1', 2);
        expectNoChanges(listener);
      });

      test('setValue, different value', () => {
        store.setValue('v2', 2);
        expectChanges(listener, '/', [['v1', 'v2'], {v2: 1}]);
        expectNoChanges(listener);
      });

      test('setValue, mapped', () => {
        store.setValue('v2', (value) => (value as number) + 1);
        expectNoChanges(listener);
      });

      test('Add things to delete', () => {
        store.setValues({v1: 1, v2: 2, v3: 3});
        expectChanges(listener, '/', [['v1', 'v2', 'v3'], {v3: 1}]);
        expectNoChanges(listener);
      });

      test('delValue', () => {
        store.delValue('v1');
        expectChanges(listener, '/', [['v2', 'v3'], {v1: -1}]);
        expectNoChanges(listener);
      });

      test('delValues', () => {
        store.delValues();
        expectChanges(listener, '/', [[], {v2: -1, v3: -1}]);
        expectNoChanges(listener);
      });
    });

    describe('hasValue', () => {
      beforeAll(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToHasValue('/v1', 'v1');
        listener.listenToHasValue('/v2', 'v2');
        listener.listenToHasValue('/v*', null);
      });

      test('reset 1', () => {
        store.delValues();
        expectNoChanges(listener);
      });

      test('setValues', () => {
        store.setValues({v1: 1});
        expectChanges(listener, '/v1', {v1: true});
        expectChanges(listener, '/v*', {v1: true});
        expectNoChanges(listener);
      });

      test('setValues, same value', () => {
        store.setValues({v1: 1});
        expectNoChanges(listener);
      });

      test('setValues, change value', () => {
        store.setValues({v1: 2});
        expectNoChanges(listener);
      });

      test('setValues, different value', () => {
        store.setValues({v2: 2});
        expectChanges(listener, '/v2', {v2: true});
        expectChanges(listener, '/v1', {v1: false});
        expectChanges(listener, '/v*', {v2: true}, {v1: false});
        expectNoChanges(listener);
      });

      test('setPartialValues', () => {
        // @ts-ignore
        store.setPartialValues({v1: 1, v3: undefined});
        expectChanges(listener, '/v1', {v1: true});
        expectChanges(listener, '/v*', {v1: true});
        expectNoChanges(listener);
      });

      test('reset 2', () => {
        store.delValues();
        expectChanges(listener, '/v1', {v1: false});
        expectChanges(listener, '/v2', {v2: false});
        expectChanges(listener, '/v*', {v2: false}, {v1: false});
        expectNoChanges(listener);
      });

      test('setValue', () => {
        store.setValue('v1', 1);
        expectChanges(listener, '/v1', {v1: true});
        expectChanges(listener, '/v*', {v1: true});
        expectNoChanges(listener);
      });

      test('setValue, same value', () => {
        store.setValue('v1', 1);
        expectNoChanges(listener);
      });

      test('setValue, change value', () => {
        store.setValue('v1', 2);
        expectNoChanges(listener);
      });

      test('setValue, different value', () => {
        store.setValue('v2', 2);
        expectChanges(listener, '/v2', {v2: true});
        expectChanges(listener, '/v*', {v2: true});
        expectNoChanges(listener);
      });

      test('setValue, mapped', () => {
        store.setValue('v2', (value) => (value as number) + 1);
        expectNoChanges(listener);
      });

      test('Add things to delete', () => {
        store.setValues({v1: 1, v2: 2, v3: 3});
        expectChanges(listener, '/v*', {v3: true});
        expectNoChanges(listener);
      });

      test('delValue', () => {
        store.delValue('v1');
        expectChanges(listener, '/v1', {v1: false});
        expectChanges(listener, '/v*', {v1: false});
        expectNoChanges(listener);
      });

      test('delValues', () => {
        store.delValues();
        expectChanges(listener, '/v2', {v2: false});
        expectChanges(listener, '/v*', {v2: false}, {v3: false});
        expectNoChanges(listener);
      });
    });

    describe('value', () => {
      beforeAll(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToValue('/v1', 'v1');
        listener.listenToValue('/v2', 'v2');
        listener.listenToValue('/v*', null);
      });

      test('reset 1', () => {
        store.delValues();
        expectNoChanges(listener);
      });

      test('setValues', () => {
        store.setValues({v1: 1});
        expectChanges(listener, '/v1', {v1: 1});
        expectChanges(listener, '/v*', {v1: 1});
        expectNoChanges(listener);
      });

      test('setValues, same value', () => {
        store.setValues({v1: 1});
        expectNoChanges(listener);
      });

      test('setValues, change value', () => {
        store.setValues({v1: 2});
        expectChanges(listener, '/v1', {v1: 2});
        expectChanges(listener, '/v*', {v1: 2});
        expectNoChanges(listener);
      });

      test('setValues, different value', () => {
        store.setValues({v2: 2});
        expectChanges(listener, '/v1', {v1: undefined});
        expectChanges(listener, '/v2', {v2: 2});
        expectChanges(listener, '/v*', {v2: 2}, {v1: undefined});
        expectNoChanges(listener);
      });

      test('setPartialValues', () => {
        // @ts-ignore
        store.setPartialValues({v1: 1, v3: undefined});
        expectChanges(listener, '/v1', {v1: 1});
        expectChanges(listener, '/v*', {v1: 1});
        expectNoChanges(listener);
      });

      test('reset 2', () => {
        store.delValues();
        expectChanges(listener, '/v1', {v1: undefined});
        expectChanges(listener, '/v2', {v2: undefined});
        expectChanges(listener, '/v*', {v1: undefined}, {v2: undefined});
        expectNoChanges(listener);
      });

      test('setValue', () => {
        store.setValue('v1', 1);
        expectChanges(listener, '/v1', {v1: 1});
        expectChanges(listener, '/v*', {v1: 1});
        expectNoChanges(listener);
      });

      test('setValue, same value', () => {
        store.setValue('v1', 1);
        expectNoChanges(listener);
      });

      test('setValue, change value', () => {
        store.setValue('v1', 2);
        expectChanges(listener, '/v1', {v1: 2});
        expectChanges(listener, '/v*', {v1: 2});
        expectNoChanges(listener);
      });

      test('setValue, different value', () => {
        store.setValue('v2', 2);
        expectChanges(listener, '/v2', {v2: 2});
        expectChanges(listener, '/v*', {v2: 2});
        expectNoChanges(listener);
      });

      test('setValue, mapped', () => {
        store.setValue('v2', (value) => (value as number) + 1);
        expectChanges(listener, '/v2', {v2: 3});
        expectChanges(listener, '/v*', {v2: 3});
        expectNoChanges(listener);
      });

      test('Add things to delete', () => {
        store.setValues({v1: 1, v2: 2, v3: 3});
        expectChanges(listener, '/v1', {v1: 1});
        expectChanges(listener, '/v2', {v2: 2});
        expectChanges(listener, '/v*', {v1: 1}, {v2: 2}, {v3: 3});
        expectNoChanges(listener);
      });

      test('delValue', () => {
        store.delValue('v1');
        expectChanges(listener, '/v1', {v1: undefined});
        expectChanges(listener, '/v*', {v1: undefined});
        expectNoChanges(listener);
      });

      test('delValues', () => {
        store.delValues();
        expectChanges(listener, '/v2', {v2: undefined});
        expectChanges(listener, '/v*', {v2: undefined}, {v3: undefined});
        expectNoChanges(listener);
      });
    });

    describe('invalid value', () => {
      beforeEach(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToInvalidValue('i:/v1', 'v1');
        listener.listenToInvalidValue('i:/v*', null);
      });

      test('reset', () => {
        store.delValues();
        expectNoChanges(listener);
      });

      test('setValues', () => {
        // @ts-ignore
        store.setValues({v1: []});
        expectChanges(listener, 'i:/v1', {v1: [[]]});
        expectChanges(listener, 'i:/v*', {v1: [[]]});
        expectNoChanges(listener);
      });

      test('setValues, empty', () => {
        // @ts-ignore
        store.setValues({});
        expectChangesNoJson(listener, 'i:/v*', {undefined: [undefined]});
        expectNoChanges(listener);
      });

      test('setPartialValues', () => {
        // @ts-ignore
        store.setValues({v1: 1, v2: []});
        expectChanges(listener, 'i:/v*', {v2: [[]]});
        expectNoChanges(listener);
      });

      test('setValue', () => {
        // @ts-ignore
        store.setValue('v1', []);
        expectChanges(listener, 'i:/v1', {v1: [[]]});
        expectChanges(listener, 'i:/v*', {v1: [[]]});
        expectNoChanges(listener);
      });

      test('setValue, mapped', () => {
        store.setValue('v1', 1);
        // @ts-ignore
        store.setValue('v1', (value) => [value]);
        expectChanges(listener, 'i:/v1', {v1: [[1]]});
        expectChanges(listener, 'i:/v*', {v1: [[1]]});
        expectNoChanges(listener);
      });
    });

    describe('transaction', () => {
      beforeEach(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToStartTransaction('/start');
        listener.listenToWillFinishTransaction('/willFinish');
        listener.listenToDidFinishTransaction('/didFinish');
      });

      test('in implicit transactions', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectChangesNoJson(listener, '/start', EMPTY_CHANGES_AND_LOG);
        ['/willFinish', '/didFinish'].forEach((label) =>
          expectChangesNoJson(listener, label, [
            [{t1: {r1: {c1: 1}}}, {}, 1],
            [
              true,
              false,
              {t1: {r1: {c1: [undefined, 1]}}},
              {},
              {},
              {},
              {t1: 1},
              {t1: {r1: 1}},
              {t1: {r1: {c1: 1}}},
              {},
            ],
          ]),
        );
        expectNoChanges(listener);
        store.delTables();
        expectChangesNoJson(listener, '/start', EMPTY_CHANGES_AND_LOG);
        ['/willFinish', '/didFinish'].forEach((label) =>
          expectChangesNoJson(listener, label, [
            [{t1: undefined}, {}, 1],
            [
              true,
              false,
              {t1: {r1: {c1: [1, undefined]}}},
              {},
              {},
              {},
              {t1: -1},
              {t1: {r1: -1}},
              {t1: {r1: {c1: -1}}},
              {},
            ],
          ]),
        );
        expectNoChanges(listener);
        store.delTables();
        expectChangesNoJson(listener, '/start', EMPTY_CHANGES_AND_LOG);
        ['/willFinish', '/didFinish'].forEach((label) =>
          expectChangesNoJson(listener, label, [
            [{}, {}, 1],
            [false, false, {}, {}, {}, {}, {}, {}, {}, {}],
          ]),
        );
        expectNoChanges(listener);
        store.setValues({v1: 1});
        expectChangesNoJson(listener, '/start', EMPTY_CHANGES_AND_LOG);
        ['/willFinish', '/didFinish'].forEach((label) =>
          expectChangesNoJson(listener, label, [
            [{}, {v1: 1}, 1],
            [
              false,
              true,
              {},
              {},
              {v1: [undefined, 1]},
              {},
              {},
              {},
              {},
              {v1: 1},
            ],
          ]),
        );
        expectNoChanges(listener);
        store.delValues();
        expectChangesNoJson(listener, '/start', EMPTY_CHANGES_AND_LOG);
        ['/willFinish', '/didFinish'].forEach((label) =>
          expectChangesNoJson(listener, label, [
            [{}, {v1: undefined}, 1],
            [
              false,
              true,
              {},
              {},
              {v1: [1, undefined]},
              {},
              {},
              {},
              {},
              {v1: -1},
            ],
          ]),
        );
        expectNoChanges(listener);
        store.delValues();
        expectChangesNoJson(listener, '/start', EMPTY_CHANGES_AND_LOG);
        ['/willFinish', '/didFinish'].forEach((label) =>
          expectChangesNoJson(listener, label, [
            [{}, {}, 1],
            [false, false, {}, {}, {}, {}, {}, {}, {}, {}],
          ]),
        );
        expectNoChanges(listener);
      });

      test('in explicit transaction', () => {
        store.startTransaction();
        expectChangesNoJson(listener, '/start', EMPTY_CHANGES_AND_LOG);
        store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
        expectNoChanges(listener);
        store.finishTransaction();
        ['/willFinish', '/didFinish'].forEach((label) =>
          expectChangesNoJson(listener, label, [
            [{t1: {r1: {c1: 1}}}, {v1: 1}, 1],
            [
              true,
              true,
              {t1: {r1: {c1: [undefined, 1]}}},
              {},
              {v1: [undefined, 1]},
              {},
              {t1: 1},
              {t1: {r1: 1}},
              {t1: {r1: {c1: 1}}},
              {v1: 1},
            ],
          ]),
        );
        expectNoChanges(listener);
      });

      test('in wrapped transaction with changes', () => {
        store.transaction(() => {
          store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
          expectChangesNoJson(listener, '/start', EMPTY_CHANGES_AND_LOG);
          expectNoChanges(listener);
        });
        ['/willFinish', '/didFinish'].forEach((label) =>
          expectChangesNoJson(listener, label, [
            [{t1: {r1: {c1: 1}}}, {v1: 1}, 1],
            [
              true,
              true,
              {t1: {r1: {c1: [undefined, 1]}}},
              {},
              {v1: [undefined, 1]},
              {},
              {t1: 1},
              {t1: {r1: 1}},
              {t1: {r1: {c1: 1}}},
              {v1: 1},
            ],
          ]),
        );
        expectNoChanges(listener);
      });

      test('in wrapped transaction with no actions', () => {
        store.transaction(() => {
          expectChangesNoJson(listener, '/start', EMPTY_CHANGES_AND_LOG);
          expectNoChanges(listener);
        });
        ['/willFinish', '/didFinish'].forEach((label) =>
          expectChangesNoJson(listener, label, [
            [{}, {}, 1],
            [false, false, {}, {}, {}, {}, {}, {}, {}, {}],
          ]),
        );
        expectNoChanges(listener);
      });

      test('in wrapped transaction with no touches', () => {
        store.transaction(() => {
          expectChangesNoJson(listener, '/start', EMPTY_CHANGES_AND_LOG);
          store.delTables();
          expectNoChanges(listener);
        });
        ['/willFinish', '/didFinish'].forEach((label) =>
          expectChangesNoJson(listener, label, [
            [{}, {}, 1],
            [false, false, {}, {}, {}, {}, {}, {}, {}, {}],
          ]),
        );
        expectNoChanges(listener);
      });

      describe('in wrapped transaction, various operations & touches', () => {
        beforeEach(() => {
          store.transaction(() => {
            store
              .setTables({
                t1: {r1: {c1: 1, c2: 2}, r2: {c1: 1}},
                t2: {r1: {c1: 1}},
              })
              .setValues({v1: 1, v2: 2});
          });
          expectChangesNoJson(listener, '/start', EMPTY_CHANGES_AND_LOG);
          ['/willFinish', '/didFinish'].forEach((label) =>
            expectChangesNoJson(listener, label, [
              [
                {t1: {r1: {c1: 1, c2: 2}, r2: {c1: 1}}, t2: {r1: {c1: 1}}},
                {v1: 1, v2: 2},
                1,
              ],
              [
                true,
                true,
                {
                  t1: {
                    r1: {c1: [undefined, 1], c2: [undefined, 2]},
                    r2: {c1: [undefined, 1]},
                  },
                  t2: {r1: {c1: [undefined, 1]}},
                },
                {},
                {v1: [undefined, 1], v2: [undefined, 2]},
                {},
                {t1: 1, t2: 1},
                {t1: {r1: 1, r2: 1}, t2: {r1: 1}},
                {
                  t1: {r1: {c1: 1, c2: 1}, r2: {c1: 1}},
                  t2: {r1: {c1: 1}},
                },
                {v1: 1, v2: 1},
              ],
            ]),
          );
          expectNoChanges(listener);
        });

        test('change back to same value', () => {
          store.transaction(() => {
            store.setCell('t1', 'r1', 'c1', 2).setValue('v1', 2);
            store.setCell('t1', 'r1', 'c1', 1).setValue('v1', 1);
          });
          expectChangesNoJson(listener, '/start', EMPTY_CHANGES_AND_LOG);
          ['/willFinish', '/didFinish'].forEach((label) =>
            expectChangesNoJson(listener, label, [
              [{}, {}, 1],
              [true, true, {}, {}, {}, {}, {}, {}, {}, {}],
            ]),
          );
          expectNoChanges(listener);
        });

        test('delete cell & value', () => {
          store.transaction(() =>
            store.delCell('t1', 'r1', 'c2').delValue('v2'),
          );
          expectChangesNoJson(listener, '/start', EMPTY_CHANGES_AND_LOG);
          ['/willFinish', '/didFinish'].forEach((label) =>
            expectChangesNoJson(listener, label, [
              [{t1: {r1: {c2: undefined}}}, {v2: undefined}, 1],
              [
                true,
                true,
                {t1: {r1: {c2: [2, undefined]}}},
                {},
                {v2: [2, undefined]},
                {},
                {},
                {},
                {t1: {r1: {c2: -1}}},
                {v2: -1},
              ],
            ]),
          );
        });
        test('delete row', () => {
          store.delRow('t1', 'r2');
          expectChangesNoJson(listener, '/start', EMPTY_CHANGES_AND_LOG);
          ['/willFinish', '/didFinish'].forEach((label) =>
            expectChangesNoJson(listener, label, [
              [{t1: {r2: undefined}}, {}, 1],
              [
                true,
                false,
                {t1: {r2: {c1: [1, undefined]}}},
                {},
                {},
                {},
                {},
                {t1: {r2: -1}},
                {t1: {r2: {c1: -1}}},
                {},
              ],
            ]),
          );
        });
        test('delete table', () => {
          store.delTable('t1');
          expectChangesNoJson(listener, '/start', EMPTY_CHANGES_AND_LOG);
          ['/willFinish', '/didFinish'].forEach((label) =>
            expectChangesNoJson(listener, label, [
              [{t1: undefined}, {}, 1],
              [
                true,
                false,
                {
                  t1: {
                    r1: {c1: [1, undefined], c2: [2, undefined]},
                    r2: {c1: [1, undefined]},
                  },
                },
                {},
                {},
                {},
                {t1: -1},
                {t1: {r1: -1, r2: -1}},
                {t1: {r1: {c1: -1, c2: -1}, r2: {c1: -1}}},
                {},
              ],
            ]),
          );
        });
        test('delete everything', () => {
          store.transaction(() => store.delTables().delValues());
          expectChangesNoJson(listener, '/start', EMPTY_CHANGES_AND_LOG);
          ['/willFinish', '/didFinish'].forEach((label) =>
            expectChangesNoJson(listener, label, [
              [
                {t1: undefined, t2: undefined},
                {v1: undefined, v2: undefined},
                1,
              ],
              [
                true,
                true,
                {
                  t1: {
                    r1: {c1: [1, undefined], c2: [2, undefined]},
                    r2: {c1: [1, undefined]},
                  },
                  t2: {r1: {c1: [1, undefined]}},
                },
                {},
                {v1: [1, undefined], v2: [2, undefined]},
                {},
                {t1: -1, t2: -1},
                {t1: {r1: -1, r2: -1}, t2: {r1: -1}},
                {
                  t1: {r1: {c1: -1, c2: -1}, r2: {c1: -1}},
                  t2: {r1: {c1: -1}},
                },
                {v1: -1, v2: -1},
              ],
            ]),
          );
        });
      });

      test('in wrapped transaction with rollback', () => {
        store.transaction(
          () => {
            expectChangesNoJson(listener, '/start', EMPTY_CHANGES_AND_LOG);
            store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
            expectNoChanges(listener);
          },
          () => true,
        );
        ['/willFinish', '/didFinish'].forEach((label) =>
          expectChangesNoJson(listener, label, [
            [{}, {}, 1],
            [false, false, {}, {}, {}, {}, {}, {}, {}, {}],
          ]),
        );
        expectNoChanges(listener);
      });
    });
  });

  describe('Mutating listeners', () => {
    describe('hasTables', () => {
      beforeEach(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToHasTables('/');
      });

      const setMutatorListener = () => {
        store.addTablesListener(getTablesMutator(2), true);
      };

      test('setTables', () => {
        setMutatorListener();
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/', true);
        expectNoChanges(listener);
      });

      test('setTable', () => {
        setMutatorListener();
        store.setTable('t1', {r1: {c1: 1}});
        expectChanges(listener, '/', true);
        expectNoChanges(listener);
      });

      test('setRow', () => {
        setMutatorListener();
        store.setRow('t1', 'r1', {c1: 1});
        expectChanges(listener, '/', true);
        expectNoChanges(listener);
      });

      test('addRow', () => {
        setMutatorListener();
        store.addRow('t1', {c1: 1});
        expectChanges(listener, '/', true);
        expectNoChanges(listener);
      });

      test('setPartialRow', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/', true);
        setMutatorListener();
        // @ts-ignore
        store.setPartialRow('t1', 'r1', {c1: 1, c2: 1, c3: undefined});
        expectNoChanges(listener);
      });

      test('setCell', () => {
        setMutatorListener();
        store.setCell('t1', 'r1', 'c1', 1);
        expectChanges(listener, '/', true);
        expectNoChanges(listener);
      });
    });

    describe('tables', () => {
      beforeEach(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToTables('/');
      });

      const setMutatorListener = () => {
        store.addTablesListener(getTablesMutator(2), true);
      };

      test('setTables', () => {
        setMutatorListener();
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/', {t1: {r1: {c1: 1}}, t0: {r0: {c0: 2}}});
        expectNoChanges(listener);
      });

      test('setTable', () => {
        setMutatorListener();
        store.setTable('t1', {r1: {c1: 1}});
        expectChanges(listener, '/', {t1: {r1: {c1: 1}}, t0: {r0: {c0: 2}}});
        expectNoChanges(listener);
      });

      test('setRow', () => {
        setMutatorListener();
        store.setRow('t1', 'r1', {c1: 1});
        expectChanges(listener, '/', {t1: {r1: {c1: 1}}, t0: {r0: {c0: 2}}});
        expectNoChanges(listener);
      });

      test('addRow', () => {
        setMutatorListener();
        store.addRow('t1', {c1: 1});
        expectChanges(listener, '/', {t1: {0: {c1: 1}}, t0: {r0: {c0: 2}}});
        expectNoChanges(listener);
      });

      test('setPartialRow', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/', {t1: {r1: {c1: 1}}});
        setMutatorListener();
        // @ts-ignore
        store.setPartialRow('t1', 'r1', {c1: 1, c2: 1, c3: undefined});
        expectChanges(listener, '/', {
          t1: {r1: {c1: 1, c2: 1}},
          t0: {r0: {c0: 2}},
        });
        expectNoChanges(listener);
      });

      test('setCell', () => {
        setMutatorListener();
        store.setCell('t1', 'r1', 'c1', 1);
        expectChanges(listener, '/', {t1: {r1: {c1: 1}}, t0: {r0: {c0: 2}}});
        expectNoChanges(listener);
      });
    });

    describe('tableIds', () => {
      beforeEach(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToTableIds('/t');
      });

      const setMutatorListener = () => {
        store.addTableIdsListener(getTablesMutator(2), true);
      };

      test('setTables', () => {
        setMutatorListener();
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t', [['t1', 't0'], {t1: 1, t0: 1}]);
        expectNoChanges(listener);
      });

      test('setTable', () => {
        setMutatorListener();
        store.setTable('t1', {r1: {c1: 1}});
        expectChanges(listener, '/t', [['t1', 't0'], {t1: 1, t0: 1}]);
        expectNoChanges(listener);
      });

      test('setRow', () => {
        setMutatorListener();
        store.setRow('t1', 'r1', {c1: 1});
        expectChanges(listener, '/t', [['t1', 't0'], {t1: 1, t0: 1}]);
        expectNoChanges(listener);
      });

      test('addRow', () => {
        setMutatorListener();
        store.addRow('t1', {c1: 1});
        expectChanges(listener, '/t', [['t1', 't0'], {t1: 1, t0: 1}]);
        expectNoChanges(listener);
      });

      test('setPartialRow', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t', [['t1'], {t1: 1}]);
        setMutatorListener();
        // @ts-ignore
        store.setPartialRow('t1', 'r1', {c1: 1, c2: 1, c3: undefined});
        expectNoChanges(listener);
      });

      test('setCell', () => {
        setMutatorListener();
        store.setCell('t1', 'r1', 'c1', 1);
        expectChanges(listener, '/t', [['t1', 't0'], {t1: 1, t0: 1}]);
        expectNoChanges(listener);
      });
    });

    describe('table', () => {
      beforeEach(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToTable('/t1', 't1');
        listener.listenToTable('/t*', null);
      });

      const setMutatorListeners = () => {
        store.addTableListener('t1', getTableMutator(2), true);
        store.addTableListener(null, getTableMutator(3, 't_'), true);
      };

      test('setTables', () => {
        setMutatorListeners();
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1', {t1: {r1: {c1: 1}, r0: {c0: 2}}});
        expectChanges(
          listener,
          '/t*',
          {t1: {r1: {c1: 1}, r0: {c0: 2}}},
          {t_: {r0: {c0: 3}}},
        );
        expectNoChanges(listener);
      });

      test('setTable', () => {
        setMutatorListeners();
        store.setTable('t1', {r1: {c1: 1}});
        expectChanges(listener, '/t1', {t1: {r1: {c1: 1}, r0: {c0: 2}}});
        expectChanges(
          listener,
          '/t*',
          {t1: {r1: {c1: 1}, r0: {c0: 2}}},
          {t_: {r0: {c0: 3}}},
        );
        expectNoChanges(listener);
      });

      test('setRow', () => {
        setMutatorListeners();
        store.setRow('t1', 'r1', {c1: 1});
        expectChanges(listener, '/t1', {t1: {r1: {c1: 1}, r0: {c0: 2}}});
        expectChanges(
          listener,
          '/t*',
          {t1: {r1: {c1: 1}, r0: {c0: 2}}},
          {t_: {r0: {c0: 3}}},
        );
        expectNoChanges(listener);
      });

      test('addRow', () => {
        setMutatorListeners();
        store.addRow('t1', {c1: 1});
        expectChanges(listener, '/t1', {t1: {0: {c1: 1}, r0: {c0: 2}}});
        expectChanges(
          listener,
          '/t*',
          {t1: {0: {c1: 1}, r0: {c0: 2}}},
          {t_: {r0: {c0: 3}}},
        );
        expectNoChanges(listener);
      });

      test('setPartialRow', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t*', {t1: {r1: {c1: 1}}});
        setMutatorListeners();
        // @ts-ignore
        store.setPartialRow('t1', 'r1', {c1: 1, c2: 1, c3: undefined});
        expectChanges(listener, '/t1', {t1: {r1: {c1: 1, c2: 1}, r0: {c0: 2}}});
        expectChanges(
          listener,
          '/t*',
          {t1: {r1: {c1: 1, c2: 1}, r0: {c0: 2}}},
          {t_: {r0: {c0: 3}}},
        );
        expectNoChanges(listener);
      });

      test('setCell', () => {
        setMutatorListeners();
        store.setCell('t1', 'r1', 'c1', 1);
        expectChanges(listener, '/t1', {t1: {r1: {c1: 1}, r0: {c0: 2}}});
        expectChanges(
          listener,
          '/t*',
          {t1: {r1: {c1: 1}, r0: {c0: 2}}},
          {t_: {r0: {c0: 3}}},
        );
        expectNoChanges(listener);
      });
    });

    describe('hasTable', () => {
      beforeEach(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToHasTable('/t1', 't1');
        listener.listenToHasTable('/t*', null);
      });

      const setMutatorListeners = () => {
        store.addTableListener('t1', getTableMutator(2), true);
        store.addTableListener(null, getTableMutator(3, 't_'), true);
      };

      test('setTables', () => {
        setMutatorListeners();
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1', {t1: true});
        expectChanges(listener, '/t*', {t1: true}, {t_: true});
        expectNoChanges(listener);
      });

      test('setTable', () => {
        setMutatorListeners();
        store.setTable('t1', {r1: {c1: 1}});
        expectChanges(listener, '/t1', {t1: true});
        expectChanges(listener, '/t*', {t1: true}, {t_: true});
        expectNoChanges(listener);
      });

      test('setRow', () => {
        setMutatorListeners();
        store.setRow('t1', 'r1', {c1: 1});
        expectChanges(listener, '/t1', {t1: true});
        expectChanges(listener, '/t*', {t1: true}, {t_: true});
        expectNoChanges(listener);
      });

      test('addRow', () => {
        setMutatorListeners();
        store.addRow('t1', {c1: 1});
        expectChanges(listener, '/t1', {t1: true});
        expectChanges(listener, '/t*', {t1: true}, {t_: true});
        expectNoChanges(listener);
      });

      test('setPartialRow', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1', {t1: true});
        expectChanges(listener, '/t*', {t1: true});
        setMutatorListeners();
        // @ts-ignore
        store.setPartialRow('t1', 'r1', {c1: 1, c2: 1, c3: undefined});
        expectChanges(listener, '/t*', {t_: true});
        expectNoChanges(listener);
      });

      test('setCell', () => {
        setMutatorListeners();
        store.setCell('t1', 'r1', 'c1', 1);
        expectChanges(listener, '/t1', {t1: true});
        expectChanges(listener, '/t*', {t1: true}, {t_: true});
        expectNoChanges(listener);
      });
    });

    describe('tableCellIds', () => {
      beforeEach(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToTableCellIds('/t1c', 't1');
        listener.listenToTableCellIds('/t*c', null);
      });

      const setMutatorListeners = () => {
        store.addRowIdsListener('t1', getTableMutator(2), true);
        store.addRowIdsListener(null, getTableMutator(3, 't_'), true);
      };

      test('setTables', () => {
        setMutatorListeners();
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1c', {t1: [['c1', 'c0'], {c1: 1, c0: 1}]});
        expectChanges(
          listener,
          '/t*c',
          {t1: [['c1', 'c0'], {c1: 1, c0: 1}]},
          {t_: [['c0'], {c0: 1}]},
        );
        expectNoChanges(listener);
      });

      test('setTable', () => {
        setMutatorListeners();
        store.setTable('t1', {r1: {c1: 1}});
        expectChanges(listener, '/t1c', {t1: [['c1', 'c0'], {c1: 1, c0: 1}]});
        expectChanges(
          listener,
          '/t*c',
          {t1: [['c1', 'c0'], {c1: 1, c0: 1}]},
          {t_: [['c0'], {c0: 1}]},
        );
        expectNoChanges(listener);
      });

      test('setRow', () => {
        setMutatorListeners();
        store.setRow('t1', 'r1', {c1: 1});
        expectChanges(listener, '/t1c', {t1: [['c1', 'c0'], {c1: 1, c0: 1}]});
        expectChanges(
          listener,
          '/t*c',
          {t1: [['c1', 'c0'], {c1: 1, c0: 1}]},
          {t_: [['c0'], {c0: 1}]},
        );
        expectNoChanges(listener);
      });

      test('addRow', () => {
        setMutatorListeners();
        store.addRow('t1', {c1: 1});
        expectChanges(listener, '/t1c', {t1: [['c1', 'c0'], {c1: 1, c0: 1}]});
        expectChanges(
          listener,
          '/t*c',
          {t1: [['c1', 'c0'], {c1: 1, c0: 1}]},
          {t_: [['c0'], {c0: 1}]},
        );
        expectNoChanges(listener);
      });

      test('setPartialRow', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1c', {t1: [['c1'], {c1: 1}]});
        expectChanges(listener, '/t*c', {t1: [['c1'], {c1: 1}]});
        setMutatorListeners();
        // @ts-ignore
        store.setPartialRow('t1', 'r1', {c1: 1, c2: 1, c3: undefined});
        expectChanges(listener, '/t1c', {t1: [['c1', 'c2'], {c2: 1}]});
        expectChanges(listener, '/t*c', {t1: [['c1', 'c2'], {c2: 1}]});
        expectNoChanges(listener);
      });

      test('setCell', () => {
        setMutatorListeners();
        store.setCell('t1', 'r1', 'c1', 1);
        expectChanges(listener, '/t1c', {t1: [['c1', 'c0'], {c1: 1, c0: 1}]});
        expectChanges(
          listener,
          '/t*c',
          {t1: [['c1', 'c0'], {c1: 1, c0: 1}]},
          {t_: [['c0'], {c0: 1}]},
        );
        expectNoChanges(listener);
      });
    });

    describe('hasTableCell', () => {
      beforeEach(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToHasTableCell('/t1/c1', 't1', 'c1');
        listener.listenToHasTableCell('/t1/c*', 't1', null);
        listener.listenToHasTableCell('/t*/c1', null, 'c1');
        listener.listenToHasTableCell('/t*/c*', null, null);
      });

      const setMutatorListeners = () => {
        store.addRowListener('t1', 'r1', getRowMutator(2), true);
        store.addRowListener('t1', null, getRowMutator(3, null, 'r_'), true);
        store.addRowListener(null, 'r1', getRowMutator(4, 't_'), true);
        store.addRowListener(null, null, getRowMutator(5, 't_', 'r_'), true);
      };

      test('setTables', () => {
        setMutatorListeners();
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/c1', {t1: {c1: true}});
        expectChanges(listener, '/t1/c*', {t1: {c1: true}}, {t1: {c0: true}});
        expectChanges(listener, '/t*/c1', {t1: {c1: true}});
        expectChanges(
          listener,
          '/t*/c*',
          {t1: {c1: true}},
          {t1: {c0: true}},
          {t_: {c0: true}},
        );
        expectNoChanges(listener);
      });

      test('setTable', () => {
        setMutatorListeners();
        store.setTable('t1', {r1: {c1: 1}});
        expectChanges(listener, '/t1/c1', {t1: {c1: true}});
        expectChanges(listener, '/t1/c*', {t1: {c1: true}}, {t1: {c0: true}});
        expectChanges(listener, '/t*/c1', {t1: {c1: true}});
        expectChanges(
          listener,
          '/t*/c*',
          {t1: {c1: true}},
          {t1: {c0: true}},
          {t_: {c0: true}},
        );
        expectNoChanges(listener);
      });

      test('setRow', () => {
        setMutatorListeners();
        store.setRow('t1', 'c1', {c1: 1});
        expectChanges(listener, '/t1/c1', {t1: {c1: true}});
        expectChanges(listener, '/t1/c*', {t1: {c1: true}}, {t1: {c0: true}});
        expectChanges(listener, '/t*/c1', {t1: {c1: true}});
        expectChanges(
          listener,
          '/t*/c*',
          {t1: {c1: true}},
          {t1: {c0: true}},
          {t_: {c0: true}},
        );
        expectNoChanges(listener);
      });

      test('addRow', () => {
        setMutatorListeners();
        store.addRow('t1', {c1: 1});
        expectChanges(listener, '/t1/c1', {t1: {c1: true}});
        expectChanges(listener, '/t1/c*', {t1: {c1: true}}, {t1: {c0: true}});
        expectChanges(listener, '/t*/c1', {t1: {c1: true}});
        expectChanges(
          listener,
          '/t*/c*',
          {t1: {c1: true}},
          {t1: {c0: true}},
          {t_: {c0: true}},
        );
        expectNoChanges(listener);
      });

      test('setPartialRow', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/c1', {t1: {c1: true}});
        expectChanges(listener, '/t1/c*', {t1: {c1: true}});
        expectChanges(listener, '/t*/c1', {t1: {c1: true}});
        expectChanges(listener, '/t*/c*', {t1: {c1: true}});
        setMutatorListeners();
        // @ts-ignore
        store.setPartialRow('t1', 'c1', {c1: 1, c2: 1, c3: undefined});
        expectChanges(listener, '/t1/c*', {t1: {c2: true}}, {t1: {c0: true}});
        expectChanges(
          listener,
          '/t*/c*',
          {t1: {c2: true}},
          {t1: {c0: true}},
          {t_: {c0: true}},
        );
        expectNoChanges(listener);
      });

      test('setCell', () => {
        setMutatorListeners();
        store.setCell('t1', 'c1', 'c1', 1);
        expectChanges(listener, '/t1/c1', {t1: {c1: true}});
        expectChanges(listener, '/t1/c*', {t1: {c1: true}}, {t1: {c0: true}});
        expectChanges(listener, '/t*/c1', {t1: {c1: true}});
        expectChanges(
          listener,
          '/t*/c*',
          {t1: {c1: true}},
          {t1: {c0: true}},
          {t_: {c0: true}},
        );
        expectNoChanges(listener);
      });
    });

    describe('rowIds', () => {
      beforeEach(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToRowIds('/t1r', 't1');
        listener.listenToRowIds('/t*r', null);
      });

      const setMutatorListeners = () => {
        store.addRowIdsListener('t1', getTableMutator(2), true);
        store.addRowIdsListener(null, getTableMutator(3, 't_'), true);
      };

      test('setTables', () => {
        setMutatorListeners();
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1r', {t1: [['r1', 'r0'], {r1: 1, r0: 1}]});
        expectChanges(
          listener,
          '/t*r',
          {t1: [['r1', 'r0'], {r1: 1, r0: 1}]},
          {t_: [['r0'], {r0: 1}]},
        );
        expectNoChanges(listener);
      });

      test('setTable', () => {
        setMutatorListeners();
        store.setTable('t1', {r1: {c1: 1}});
        expectChanges(listener, '/t1r', {t1: [['r1', 'r0'], {r1: 1, r0: 1}]});
        expectChanges(
          listener,
          '/t*r',
          {t1: [['r1', 'r0'], {r1: 1, r0: 1}]},
          {t_: [['r0'], {r0: 1}]},
        );
        expectNoChanges(listener);
      });

      test('setRow', () => {
        setMutatorListeners();
        store.setRow('t1', 'r1', {c1: 1});
        expectChanges(listener, '/t1r', {t1: [['r1', 'r0'], {r1: 1, r0: 1}]});
        expectChanges(
          listener,
          '/t*r',
          {t1: [['r1', 'r0'], {r1: 1, r0: 1}]},
          {t_: [['r0'], {r0: 1}]},
        );
        expectNoChanges(listener);
      });

      test('addRow', () => {
        setMutatorListeners();
        store.addRow('t1', {c1: 1});
        expectChanges(listener, '/t1r', {t1: [['0', 'r0'], {0: 1, r0: 1}]});
        expectChanges(
          listener,
          '/t*r',
          {t1: [['0', 'r0'], {0: 1, r0: 1}]},
          {t_: [['r0'], {r0: 1}]},
        );
        expectNoChanges(listener);
      });

      test('setPartialRow', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1r', {t1: [['r1'], {r1: 1}]});
        expectChanges(listener, '/t*r', {t1: [['r1'], {r1: 1}]});
        setMutatorListeners();
        // @ts-ignore
        store.setPartialRow('t1', 'r1', {c1: 1, c2: 1, c3: undefined});
        expectNoChanges(listener);
      });

      test('setCell', () => {
        setMutatorListeners();
        store.setCell('t1', 'r1', 'c1', 1);
        expectChanges(listener, '/t1r', {t1: [['r1', 'r0'], {r1: 1, r0: 1}]});
        expectChanges(
          listener,
          '/t*r',
          {t1: [['r1', 'r0'], {r1: 1, r0: 1}]},
          {t_: [['r0'], {r0: 1}]},
        );
        expectNoChanges(listener);
      });
    });

    describe('sortedRowIds', () => {
      beforeEach(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToSortedRowIds('/t1s', 't1', 'c1', false, 0, undefined);
      });

      const setMutatorListener = () => {
        store.addSortedRowIdsListener(
          't1',
          'c1',
          false,
          0,
          undefined,
          () => store.setCell('t1', 'r0', 'c1', 0),
          true,
        );
      };

      test('setTables', () => {
        setMutatorListener();
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1s', ['r0', 'r1']);
        expectNoChanges(listener);
      });

      test('setTable', () => {
        setMutatorListener();
        store.setTable('t1', {r1: {c1: 1}});
        expectChanges(listener, '/t1s', ['r0', 'r1']);
        expectNoChanges(listener);
      });

      test('setRow', () => {
        setMutatorListener();
        store.setRow('t1', 'r1', {c1: 1});
        expectChanges(listener, '/t1s', ['r0', 'r1']);
        expectNoChanges(listener);
      });

      test('addRow', () => {
        setMutatorListener();
        store.addRow('t1', {c1: 1});
        expectChanges(listener, '/t1s', ['r0', '0']);
        expectNoChanges(listener);
      });

      test('setPartialRow', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1s', ['r1']);
        setMutatorListener();
        // @ts-ignore
        store.setPartialRow('t1', 'r1', {c1: 1, c2: 1, c3: undefined});
        expectNoChanges(listener);
      });

      test('setCell', () => {
        setMutatorListener();
        store.setCell('t1', 'r1', 'c1', 1);
        expectChanges(listener, '/t1s', ['r0', 'r1']);
        expectNoChanges(listener);
      });
    });

    describe('hasRow', () => {
      beforeEach(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToHasRow('/t1/r1', 't1', 'r1');
        listener.listenToHasRow('/t1/r*', 't1', null);
        listener.listenToHasRow('/t*/r1', null, 'r1');
        listener.listenToHasRow('/t*/r*', null, null);
      });

      const setMutatorListeners = () => {
        store.addRowListener('t1', 'r1', getRowMutator(2), true);
        store.addRowListener('t1', null, getRowMutator(3, null, 'r_'), true);
        store.addRowListener(null, 'r1', getRowMutator(4, 't_'), true);
        store.addRowListener(null, null, getRowMutator(5, 't_', 'r_'), true);
      };

      test('setTables', () => {
        setMutatorListeners();
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r1', {t1: {r1: true}});
        expectChanges(listener, '/t1/r*', {t1: {r1: true}}, {t1: {r_: true}});
        expectChanges(listener, '/t*/r1', {t1: {r1: true}}, {t_: {r1: true}});
        expectChanges(
          listener,
          '/t*/r*',
          {t1: {r1: true}},
          {t1: {r_: true}},
          {t_: {r1: true}},
          {t_: {r_: true}},
        );
        expectNoChanges(listener);
      });

      test('setTable', () => {
        setMutatorListeners();
        store.setTable('t1', {r1: {c1: 1}});
        expectChanges(listener, '/t1/r1', {t1: {r1: true}});
        expectChanges(listener, '/t1/r*', {t1: {r1: true}}, {t1: {r_: true}});
        expectChanges(listener, '/t*/r1', {t1: {r1: true}}, {t_: {r1: true}});
        expectChanges(
          listener,
          '/t*/r*',
          {t1: {r1: true}},
          {t1: {r_: true}},
          {t_: {r1: true}},
          {t_: {r_: true}},
        );
        expectNoChanges(listener);
      });

      test('setRow', () => {
        setMutatorListeners();
        store.setRow('t1', 'r1', {c1: 1});
        expectChanges(listener, '/t1/r1', {t1: {r1: true}});
        expectChanges(listener, '/t1/r*', {t1: {r1: true}}, {t1: {r_: true}});
        expectChanges(listener, '/t*/r1', {t1: {r1: true}}, {t_: {r1: true}});
        expectChanges(
          listener,
          '/t*/r*',
          {t1: {r1: true}},
          {t1: {r_: true}},
          {t_: {r1: true}},
          {t_: {r_: true}},
        );
        expectNoChanges(listener);
      });

      test('addRow', () => {
        setMutatorListeners();
        store.addRow('t1', {c1: 1});
        expectChanges(listener, '/t1/r*', {t1: {0: true}}, {t1: {r_: true}});
        expectChanges(
          listener,
          '/t*/r*',
          {t1: {0: true}},
          {t1: {r_: true}},
          {t_: {r_: true}},
        );
        expectNoChanges(listener);
      });

      test('setPartialRow', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r1', {t1: {r1: true}});
        expectChanges(listener, '/t1/r*', {t1: {r1: true}});
        expectChanges(listener, '/t*/r1', {t1: {r1: true}});
        expectChanges(listener, '/t*/r*', {t1: {r1: true}});
        setMutatorListeners();
        // @ts-ignore
        store.setPartialRow('t1', 'r1', {c1: 1, c2: 1, c3: undefined});
        expectChanges(listener, '/t1/r*', {t1: {r_: true}});
        expectChanges(listener, '/t*/r1', {t_: {r1: true}});
        expectChanges(
          listener,
          '/t*/r*',
          {t1: {r_: true}},
          {t_: {r1: true}},
          {t_: {r_: true}},
        );
        expectNoChanges(listener);
      });

      test('setCell', () => {
        setMutatorListeners();
        store.setCell('t1', 'r1', 'c1', 1);
        expectChanges(listener, '/t1/r1', {t1: {r1: true}});
        expectChanges(listener, '/t1/r*', {t1: {r1: true}}, {t1: {r_: true}});
        expectChanges(listener, '/t*/r1', {t1: {r1: true}}, {t_: {r1: true}});
        expectChanges(
          listener,
          '/t*/r*',
          {t1: {r1: true}},
          {t1: {r_: true}},
          {t_: {r1: true}},
          {t_: {r_: true}},
        );
        expectNoChanges(listener);
      });
    });

    describe('row', () => {
      beforeEach(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToRow('/t1/r1', 't1', 'r1');
        listener.listenToRow('/t1/r*', 't1', null);
        listener.listenToRow('/t*/r1', null, 'r1');
        listener.listenToRow('/t*/r*', null, null);
      });

      const setMutatorListeners = () => {
        store.addRowListener('t1', 'r1', getRowMutator(2), true);
        store.addRowListener('t1', null, getRowMutator(3, null, 'r_'), true);
        store.addRowListener(null, 'r1', getRowMutator(4, 't_'), true);
        store.addRowListener(null, null, getRowMutator(5, 't_', 'r_'), true);
      };

      test('setTables', () => {
        setMutatorListeners();
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r1', {t1: {r1: {c1: 1, c0: 2}}});
        expectChanges(
          listener,
          '/t1/r*',
          {t1: {r1: {c1: 1, c0: 2}}},
          {t1: {r_: {c0: 3}}},
        );
        expectChanges(
          listener,
          '/t*/r1',
          {t1: {r1: {c1: 1, c0: 2}}},
          {t_: {r1: {c0: 4}}},
        );
        expectChanges(
          listener,
          '/t*/r*',
          {t1: {r1: {c1: 1, c0: 2}}},
          {t1: {r_: {c0: 3}}},
          {t_: {r1: {c0: 4}}},
          {t_: {r_: {c0: 5}}},
        );
        expectNoChanges(listener);
      });

      test('setTable', () => {
        setMutatorListeners();
        store.setTable('t1', {r1: {c1: 1}});
        expectChanges(listener, '/t1/r1', {t1: {r1: {c1: 1, c0: 2}}});
        expectChanges(
          listener,
          '/t1/r*',
          {t1: {r1: {c1: 1, c0: 2}}},
          {t1: {r_: {c0: 3}}},
        );
        expectChanges(
          listener,
          '/t*/r1',
          {t1: {r1: {c1: 1, c0: 2}}},
          {t_: {r1: {c0: 4}}},
        );
        expectChanges(
          listener,
          '/t*/r*',
          {t1: {r1: {c1: 1, c0: 2}}},
          {t1: {r_: {c0: 3}}},
          {t_: {r1: {c0: 4}}},
          {t_: {r_: {c0: 5}}},
        );
        expectNoChanges(listener);
      });

      test('setRow', () => {
        setMutatorListeners();
        store.setRow('t1', 'r1', {c1: 1});
        expectChanges(listener, '/t1/r1', {t1: {r1: {c1: 1, c0: 2}}});
        expectChanges(
          listener,
          '/t1/r*',
          {t1: {r1: {c1: 1, c0: 2}}},
          {t1: {r_: {c0: 3}}},
        );
        expectChanges(
          listener,
          '/t*/r1',
          {t1: {r1: {c1: 1, c0: 2}}},
          {t_: {r1: {c0: 4}}},
        );
        expectChanges(
          listener,
          '/t*/r*',
          {t1: {r1: {c1: 1, c0: 2}}},
          {t1: {r_: {c0: 3}}},
          {t_: {r1: {c0: 4}}},
          {t_: {r_: {c0: 5}}},
        );
        expectNoChanges(listener);
      });

      test('addRow', () => {
        setMutatorListeners();
        store.addRow('t1', {c1: 1});
        expectChanges(
          listener,
          '/t1/r*',
          {t1: {0: {c1: 1}}},
          {t1: {r_: {c0: 3}}},
        );
        expectChanges(
          listener,
          '/t*/r*',
          {t1: {0: {c1: 1}}},
          {t1: {r_: {c0: 3}}},
          {t_: {r_: {c0: 5}}},
        );
        expectNoChanges(listener);
      });

      test('setPartialRow', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r*', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r*', {t1: {r1: {c1: 1}}});
        setMutatorListeners();
        // @ts-ignore
        store.setPartialRow('t1', 'r1', {c1: 1, c2: 1, c3: undefined});
        expectChanges(listener, '/t1/r1', {t1: {r1: {c1: 1, c2: 1, c0: 2}}});
        expectChanges(
          listener,
          '/t1/r*',
          {t1: {r1: {c1: 1, c2: 1, c0: 2}}},
          {t1: {r_: {c0: 3}}},
        );
        expectChanges(
          listener,
          '/t*/r1',
          {t1: {r1: {c1: 1, c2: 1, c0: 2}}},
          {t_: {r1: {c0: 4}}},
        );
        expectChanges(
          listener,
          '/t*/r*',
          {t1: {r1: {c1: 1, c2: 1, c0: 2}}},
          {t1: {r_: {c0: 3}}},
          {t_: {r1: {c0: 4}}},
          {t_: {r_: {c0: 5}}},
        );
        expectNoChanges(listener);
      });

      test('setCell', () => {
        setMutatorListeners();
        store.setCell('t1', 'r1', 'c1', 1);
        expectChanges(listener, '/t1/r1', {t1: {r1: {c1: 1, c0: 2}}});
        expectChanges(
          listener,
          '/t1/r*',
          {t1: {r1: {c1: 1, c0: 2}}},
          {t1: {r_: {c0: 3}}},
        );
        expectChanges(
          listener,
          '/t*/r1',
          {t1: {r1: {c1: 1, c0: 2}}},
          {t_: {r1: {c0: 4}}},
        );
        expectChanges(
          listener,
          '/t*/r*',
          {t1: {r1: {c1: 1, c0: 2}}},
          {t1: {r_: {c0: 3}}},
          {t_: {r1: {c0: 4}}},
          {t_: {r_: {c0: 5}}},
        );
        expectNoChanges(listener);
      });
    });

    describe('cellIds', () => {
      beforeEach(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToCellIds('/t1/r1c', 't1', 'r1');
        listener.listenToCellIds('/t1/r*c', 't1', null);
        listener.listenToCellIds('/t*/r1c', null, 'r1');
        listener.listenToCellIds('/t*/r*c', null, null);
      });

      const setMutatorListeners = () => {
        store.addCellIdsListener('t1', 'r1', getRowMutator(2), true);
        store.addCellIdsListener(
          't1',
          null,
          getRowMutator(3, null, 'r_'),
          true,
        );
        store.addCellIdsListener(null, 'r1', getRowMutator(4, 't_'), true);
        store.addCellIdsListener(
          null,
          null,
          getRowMutator(5, 't_', 'r_'),
          true,
        );
      };

      test('setTables', () => {
        setMutatorListeners();
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r1c', {
          t1: {r1: [['c1', 'c0'], {c1: 1, c0: 1}]},
        });
        expectChanges(
          listener,
          '/t1/r*c',
          {t1: {r1: [['c1', 'c0'], {c1: 1, c0: 1}]}},
          {t1: {r_: [['c0'], {c0: 1}]}},
        );
        expectChanges(
          listener,
          '/t*/r1c',
          {t1: {r1: [['c1', 'c0'], {c1: 1, c0: 1}]}},
          {t_: {r1: [['c0'], {c0: 1}]}},
        );
        expectChanges(
          listener,
          '/t*/r*c',
          {t1: {r1: [['c1', 'c0'], {c1: 1, c0: 1}]}},
          {t1: {r_: [['c0'], {c0: 1}]}},
          {t_: {r1: [['c0'], {c0: 1}]}},
          {t_: {r_: [['c0'], {c0: 1}]}},
        );
        expectNoChanges(listener);
      });

      test('setTable', () => {
        setMutatorListeners();
        store.setTable('t1', {r1: {c1: 1}});
        expectChanges(listener, '/t1/r1c', {
          t1: {r1: [['c1', 'c0'], {c1: 1, c0: 1}]},
        });
        expectChanges(
          listener,
          '/t1/r*c',
          {t1: {r1: [['c1', 'c0'], {c1: 1, c0: 1}]}},
          {t1: {r_: [['c0'], {c0: 1}]}},
        );
        expectChanges(
          listener,
          '/t*/r1c',
          {t1: {r1: [['c1', 'c0'], {c1: 1, c0: 1}]}},
          {t_: {r1: [['c0'], {c0: 1}]}},
        );
        expectChanges(
          listener,
          '/t*/r*c',
          {t1: {r1: [['c1', 'c0'], {c1: 1, c0: 1}]}},
          {t1: {r_: [['c0'], {c0: 1}]}},
          {t_: {r1: [['c0'], {c0: 1}]}},
          {t_: {r_: [['c0'], {c0: 1}]}},
        );
        expectNoChanges(listener);
      });

      test('setRow', () => {
        setMutatorListeners();
        store.setRow('t1', 'r1', {c1: 1});
        expectChanges(listener, '/t1/r1c', {
          t1: {r1: [['c1', 'c0'], {c1: 1, c0: 1}]},
        });
        expectChanges(
          listener,
          '/t1/r*c',
          {t1: {r1: [['c1', 'c0'], {c1: 1, c0: 1}]}},
          {t1: {r_: [['c0'], {c0: 1}]}},
        );
        expectChanges(
          listener,
          '/t*/r1c',
          {t1: {r1: [['c1', 'c0'], {c1: 1, c0: 1}]}},
          {t_: {r1: [['c0'], {c0: 1}]}},
        );
        expectChanges(
          listener,
          '/t*/r*c',
          {t1: {r1: [['c1', 'c0'], {c1: 1, c0: 1}]}},
          {t1: {r_: [['c0'], {c0: 1}]}},
          {t_: {r1: [['c0'], {c0: 1}]}},
          {t_: {r_: [['c0'], {c0: 1}]}},
        );
        expectNoChanges(listener);
      });

      test('addRow', () => {
        setMutatorListeners();
        store.addRow('t1', {c1: 1});
        expectChanges(
          listener,
          '/t1/r*c',
          {t1: {0: [['c1'], {c1: 1}]}},
          {t1: {r_: [['c0'], {c0: 1}]}},
        );
        expectChanges(
          listener,
          '/t*/r*c',
          {t1: {0: [['c1'], {c1: 1}]}},
          {t1: {r_: [['c0'], {c0: 1}]}},
          {t_: {r_: [['c0'], {c0: 1}]}},
        );
        expectNoChanges(listener);
      });

      test('setPartialRow', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r1c', {t1: {r1: [['c1'], {c1: 1}]}});
        expectChanges(listener, '/t1/r*c', {t1: {r1: [['c1'], {c1: 1}]}});
        expectChanges(listener, '/t*/r1c', {t1: {r1: [['c1'], {c1: 1}]}});
        expectChanges(listener, '/t*/r*c', {t1: {r1: [['c1'], {c1: 1}]}});
        setMutatorListeners();
        // @ts-ignore
        store.setPartialRow('t1', 'r1', {c1: 1, c2: 1, c3: undefined});
        expectChanges(listener, '/t1/r1c', {
          t1: {r1: [['c1', 'c2', 'c0'], {c2: 1, c0: 1}]},
        });
        expectChanges(
          listener,
          '/t1/r*c',
          {t1: {r1: [['c1', 'c2', 'c0'], {c2: 1, c0: 1}]}},
          {t1: {r_: [['c0'], {c0: 1}]}},
        );
        expectChanges(
          listener,
          '/t*/r1c',
          {t1: {r1: [['c1', 'c2', 'c0'], {c2: 1, c0: 1}]}},
          {t_: {r1: [['c0'], {c0: 1}]}},
        );
        expectChanges(
          listener,
          '/t*/r*c',
          {t1: {r1: [['c1', 'c2', 'c0'], {c2: 1, c0: 1}]}},
          {t1: {r_: [['c0'], {c0: 1}]}},
          {t_: {r1: [['c0'], {c0: 1}]}},
          {t_: {r_: [['c0'], {c0: 1}]}},
        );
        expectNoChanges(listener);
      });

      test('setCell', () => {
        setMutatorListeners();
        store.setCell('t1', 'r1', 'c1', 1);
        expectChanges(listener, '/t1/r1c', {
          t1: {r1: [['c1', 'c0'], {c1: 1, c0: 1}]},
        });
        expectChanges(
          listener,
          '/t1/r*c',
          {t1: {r1: [['c1', 'c0'], {c1: 1, c0: 1}]}},
          {t1: {r_: [['c0'], {c0: 1}]}},
        );
        expectChanges(
          listener,
          '/t*/r1c',
          {t1: {r1: [['c1', 'c0'], {c1: 1, c0: 1}]}},
          {t_: {r1: [['c0'], {c0: 1}]}},
        );
        expectChanges(
          listener,
          '/t*/r*c',
          {t1: {r1: [['c1', 'c0'], {c1: 1, c0: 1}]}},
          {t1: {r_: [['c0'], {c0: 1}]}},
          {t_: {r1: [['c0'], {c0: 1}]}},
          {t_: {r_: [['c0'], {c0: 1}]}},
        );
        expectNoChanges(listener);
      });
    });

    describe('hasCell', () => {
      beforeEach(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToHasCell('/t1/r1/c1', 't1', 'r1', 'c1');
        listener.listenToHasCell('/t1/r1/c*', 't1', 'r1', null);
        listener.listenToHasCell('/t1/r*/c1', 't1', null, 'c1');
        listener.listenToHasCell('/t1/r*/c*', 't1', null, null);
        listener.listenToHasCell('/t*/r1/c1', null, 'r1', 'c1');
        listener.listenToHasCell('/t*/r1/c*', null, 'r1', null);
        listener.listenToHasCell('/t*/r*/c1', null, null, 'c1');
        listener.listenToHasCell('/t*/r*/c*', null, null, null);
      });

      const setMutatorListeners = () => {
        store.addCellListener('t1', 'r1', 'c1', getCellMutator(2), true);
        store.addCellListener(
          't1',
          'r1',
          null,
          getCellMutator(3, null, null, 'c_'),
          true,
        );
        store.addCellListener(
          't1',
          null,
          'c1',
          getCellMutator(4, null, 'r_'),
          true,
        );
        store.addCellListener(
          't1',
          null,
          null,
          getCellMutator(5, null, 'r_', 'c_'),
          true,
        );
        store.addCellListener(null, 'r1', 'c1', getCellMutator(6, 't_'), true);
        store.addCellListener(
          null,
          'r1',
          null,
          getCellMutator(7, 't_', null, 'c_'),
          true,
        );
        store.addCellListener(
          null,
          null,
          'c1',
          getCellMutator(8, 't_', 'r_'),
          true,
        );
        store.addCellListener(
          null,
          null,
          null,
          getCellMutator(9, 't_', 'r_', 'c_'),
          true,
        );
      };

      test('setTables', () => {
        setMutatorListeners();
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: true}}});
        expectChanges(
          listener,
          '/t1/r1/c*',
          {t1: {r1: {c1: true}}},
          {t1: {r1: {c_: true}}},
        );
        expectChanges(
          listener,
          '/t1/r*/c1',
          {t1: {r1: {c1: true}}},
          {t1: {r_: {c1: true}}},
        );
        expectChanges(
          listener,
          '/t1/r*/c*',
          {t1: {r1: {c1: true}}},
          {t1: {r1: {c_: true}}},
          {t1: {r_: {c1: true}}},
          {t1: {r_: {c_: true}}},
        );
        expectChanges(
          listener,
          '/t*/r1/c1',
          {t1: {r1: {c1: true}}},
          {t_: {r1: {c1: true}}},
        );
        expectChanges(
          listener,
          '/t*/r1/c*',
          {t1: {r1: {c1: true}}},
          {t1: {r1: {c_: true}}},
          {t_: {r1: {c1: true}}},
          {t_: {r1: {c_: true}}},
        );
        expectChanges(
          listener,
          '/t*/r*/c1',
          {t1: {r1: {c1: true}}},
          {t1: {r_: {c1: true}}},
          {t_: {r1: {c1: true}}},
          {t_: {r_: {c1: true}}},
        );
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {r1: {c1: true}}},
          {t1: {r1: {c_: true}}},
          {t1: {r_: {c1: true}}},
          {t1: {r_: {c_: true}}},
          {t_: {r1: {c1: true}}},
          {t_: {r1: {c_: true}}},
          {t_: {r_: {c1: true}}},
          {t_: {r_: {c_: true}}},
        );
        expectNoChanges(listener);
      });

      test('setTable', () => {
        setMutatorListeners();
        store.setTable('t1', {r1: {c1: 1}});
        expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: true}}});
        expectChanges(
          listener,
          '/t1/r1/c*',
          {t1: {r1: {c1: true}}},
          {t1: {r1: {c_: true}}},
        );
        expectChanges(
          listener,
          '/t1/r*/c1',
          {t1: {r1: {c1: true}}},
          {t1: {r_: {c1: true}}},
        );
        expectChanges(
          listener,
          '/t1/r*/c*',
          {t1: {r1: {c1: true}}},
          {t1: {r1: {c_: true}}},
          {t1: {r_: {c1: true}}},
          {t1: {r_: {c_: true}}},
        );
        expectChanges(
          listener,
          '/t*/r1/c1',
          {t1: {r1: {c1: true}}},
          {t_: {r1: {c1: true}}},
        );
        expectChanges(
          listener,
          '/t*/r1/c*',
          {t1: {r1: {c1: true}}},
          {t1: {r1: {c_: true}}},
          {t_: {r1: {c1: true}}},
          {t_: {r1: {c_: true}}},
        );
        expectChanges(
          listener,
          '/t*/r*/c1',
          {t1: {r1: {c1: true}}},
          {t1: {r_: {c1: true}}},
          {t_: {r1: {c1: true}}},
          {t_: {r_: {c1: true}}},
        );
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {r1: {c1: true}}},
          {t1: {r1: {c_: true}}},
          {t1: {r_: {c1: true}}},
          {t1: {r_: {c_: true}}},
          {t_: {r1: {c1: true}}},
          {t_: {r1: {c_: true}}},
          {t_: {r_: {c1: true}}},
          {t_: {r_: {c_: true}}},
        );
        expectNoChanges(listener);
      });

      test('setRow', () => {
        setMutatorListeners();
        store.setRow('t1', 'r1', {c1: 1});
        expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: true}}});
        expectChanges(
          listener,
          '/t1/r1/c*',
          {t1: {r1: {c1: true}}},
          {t1: {r1: {c_: true}}},
        );
        expectChanges(
          listener,
          '/t1/r*/c1',
          {t1: {r1: {c1: true}}},
          {t1: {r_: {c1: true}}},
        );
        expectChanges(
          listener,
          '/t1/r*/c*',
          {t1: {r1: {c1: true}}},
          {t1: {r1: {c_: true}}},
          {t1: {r_: {c1: true}}},
          {t1: {r_: {c_: true}}},
        );
        expectChanges(
          listener,
          '/t*/r1/c1',
          {t1: {r1: {c1: true}}},
          {t_: {r1: {c1: true}}},
        );
        expectChanges(
          listener,
          '/t*/r1/c*',
          {t1: {r1: {c1: true}}},
          {t1: {r1: {c_: true}}},
          {t_: {r1: {c1: true}}},
          {t_: {r1: {c_: true}}},
        );
        expectChanges(
          listener,
          '/t*/r*/c1',
          {t1: {r1: {c1: true}}},
          {t1: {r_: {c1: true}}},
          {t_: {r1: {c1: true}}},
          {t_: {r_: {c1: true}}},
        );
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {r1: {c1: true}}},
          {t1: {r1: {c_: true}}},
          {t1: {r_: {c1: true}}},
          {t1: {r_: {c_: true}}},
          {t_: {r1: {c1: true}}},
          {t_: {r1: {c_: true}}},
          {t_: {r_: {c1: true}}},
          {t_: {r_: {c_: true}}},
        );
        expectNoChanges(listener);
      });

      test('addRow', () => {
        setMutatorListeners();
        store.addRow('t1', {c1: 1});
        expectChanges(
          listener,
          '/t1/r*/c1',
          {t1: {0: {c1: true}}},
          {t1: {r_: {c1: true}}},
        );
        expectChanges(
          listener,
          '/t1/r*/c*',
          {t1: {0: {c1: true}}},
          {t1: {r_: {c1: true}}},
          {t1: {r_: {c_: true}}},
        );
        expectChanges(
          listener,
          '/t*/r*/c1',
          {t1: {0: {c1: true}}},
          {t1: {r_: {c1: true}}},
          {t_: {r_: {c1: true}}},
        );
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {0: {c1: true}}},
          {t1: {r_: {c1: true}}},
          {t1: {r_: {c_: true}}},
          {t_: {r_: {c1: true}}},
          {t_: {r_: {c_: true}}},
        );
        expectNoChanges(listener);
      });

      test('setPartialRow', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: true}}});
        expectChanges(listener, '/t1/r1/c*', {t1: {r1: {c1: true}}});
        expectChanges(listener, '/t1/r*/c1', {t1: {r1: {c1: true}}});
        expectChanges(listener, '/t1/r*/c*', {t1: {r1: {c1: true}}});
        expectChanges(listener, '/t*/r1/c1', {t1: {r1: {c1: true}}});
        expectChanges(listener, '/t*/r1/c*', {t1: {r1: {c1: true}}});
        expectChanges(listener, '/t*/r*/c1', {t1: {r1: {c1: true}}});
        expectChanges(listener, '/t*/r*/c*', {t1: {r1: {c1: true}}});
        setMutatorListeners();
        // @ts-ignore
        store.setPartialRow('t1', 'r1', {c1: 1, c2: 1, c3: undefined});
        expectChanges(
          listener,
          '/t1/r1/c*',
          {t1: {r1: {c2: true}}},
          {t1: {r1: {c_: true}}},
        );
        expectChanges(
          listener,
          '/t1/r*/c*',
          {t1: {r1: {c2: true}}},
          {t1: {r1: {c_: true}}},
          {t1: {r_: {c_: true}}},
        );
        expectChanges(
          listener,
          '/t*/r1/c*',
          {t1: {r1: {c2: true}}},
          {t1: {r1: {c_: true}}},
          {t_: {r1: {c_: true}}},
        );
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {r1: {c2: true}}},
          {t1: {r1: {c_: true}}},
          {t1: {r_: {c_: true}}},
          {t_: {r1: {c_: true}}},
          {t_: {r_: {c_: true}}},
        );
        expectNoChanges(listener);
      });

      test('setCell', () => {
        setMutatorListeners();
        store.setCell('t1', 'r1', 'c1', 1);
        expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: true}}});
        expectChanges(
          listener,
          '/t1/r1/c*',
          {t1: {r1: {c1: true}}},
          {t1: {r1: {c_: true}}},
        );
        expectChanges(
          listener,
          '/t1/r*/c1',
          {t1: {r1: {c1: true}}},
          {t1: {r_: {c1: true}}},
        );
        expectChanges(
          listener,
          '/t1/r*/c*',
          {t1: {r1: {c1: true}}},
          {t1: {r1: {c_: true}}},
          {t1: {r_: {c1: true}}},
          {t1: {r_: {c_: true}}},
        );
        expectChanges(
          listener,
          '/t*/r1/c1',
          {t1: {r1: {c1: true}}},
          {t_: {r1: {c1: true}}},
        );
        expectChanges(
          listener,
          '/t*/r1/c*',
          {t1: {r1: {c1: true}}},
          {t1: {r1: {c_: true}}},
          {t_: {r1: {c1: true}}},
          {t_: {r1: {c_: true}}},
        );
        expectChanges(
          listener,
          '/t*/r*/c1',
          {t1: {r1: {c1: true}}},
          {t1: {r_: {c1: true}}},
          {t_: {r1: {c1: true}}},
          {t_: {r_: {c1: true}}},
        );
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {r1: {c1: true}}},
          {t1: {r1: {c_: true}}},
          {t1: {r_: {c1: true}}},
          {t1: {r_: {c_: true}}},
          {t_: {r1: {c1: true}}},
          {t_: {r1: {c_: true}}},
          {t_: {r_: {c1: true}}},
          {t_: {r_: {c_: true}}},
        );
        expectNoChanges(listener);
      });
    });

    describe('cell', () => {
      beforeEach(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToCell('/t1/r1/c1', 't1', 'r1', 'c1');
        listener.listenToCell('/t1/r1/c*', 't1', 'r1', null);
        listener.listenToCell('/t1/r*/c1', 't1', null, 'c1');
        listener.listenToCell('/t1/r*/c*', 't1', null, null);
        listener.listenToCell('/t*/r1/c1', null, 'r1', 'c1');
        listener.listenToCell('/t*/r1/c*', null, 'r1', null);
        listener.listenToCell('/t*/r*/c1', null, null, 'c1');
        listener.listenToCell('/t*/r*/c*', null, null, null);
      });

      const setMutatorListeners = () => {
        store.addCellListener('t1', 'r1', 'c1', getCellMutator(2), true);
        store.addCellListener(
          't1',
          'r1',
          null,
          getCellMutator(3, null, null, 'c_'),
          true,
        );
        store.addCellListener(
          't1',
          null,
          'c1',
          getCellMutator(4, null, 'r_'),
          true,
        );
        store.addCellListener(
          't1',
          null,
          null,
          getCellMutator(5, null, 'r_', 'c_'),
          true,
        );
        store.addCellListener(null, 'r1', 'c1', getCellMutator(6, 't_'), true);
        store.addCellListener(
          null,
          'r1',
          null,
          getCellMutator(7, 't_', null, 'c_'),
          true,
        );
        store.addCellListener(
          null,
          null,
          'c1',
          getCellMutator(8, 't_', 'r_'),
          true,
        );
        store.addCellListener(
          null,
          null,
          null,
          getCellMutator(9, 't_', 'r_', 'c_'),
          true,
        );
      };

      test('setTables', () => {
        setMutatorListeners();
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: 2}}});
        expectChanges(
          listener,
          '/t1/r1/c*',
          {t1: {r1: {c1: 2}}},
          {t1: {r1: {c_: 3}}},
        );
        expectChanges(
          listener,
          '/t1/r*/c1',
          {t1: {r1: {c1: 2}}},
          {t1: {r_: {c1: 4}}},
        );
        expectChanges(
          listener,
          '/t1/r*/c*',
          {t1: {r1: {c1: 2}}},
          {t1: {r1: {c_: 3}}},
          {t1: {r_: {c1: 4}}},
          {t1: {r_: {c_: 5}}},
        );
        expectChanges(
          listener,
          '/t*/r1/c1',
          {t1: {r1: {c1: 2}}},
          {t_: {r1: {c1: 6}}},
        );
        expectChanges(
          listener,
          '/t*/r1/c*',
          {t1: {r1: {c1: 2}}},
          {t1: {r1: {c_: 3}}},
          {t_: {r1: {c1: 6}}},
          {t_: {r1: {c_: 7}}},
        );
        expectChanges(
          listener,
          '/t*/r*/c1',
          {t1: {r1: {c1: 2}}},
          {t1: {r_: {c1: 4}}},
          {t_: {r1: {c1: 6}}},
          {t_: {r_: {c1: 8}}},
        );
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {r1: {c1: 2}}},
          {t1: {r1: {c_: 3}}},
          {t1: {r_: {c1: 4}}},
          {t1: {r_: {c_: 5}}},
          {t_: {r1: {c1: 6}}},
          {t_: {r1: {c_: 7}}},
          {t_: {r_: {c1: 8}}},
          {t_: {r_: {c_: 9}}},
        );
        expectNoChanges(listener);
      });

      test('setTable', () => {
        setMutatorListeners();
        store.setTable('t1', {r1: {c1: 1}});
        expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: 2}}});
        expectChanges(
          listener,
          '/t1/r1/c*',
          {t1: {r1: {c1: 2}}},
          {t1: {r1: {c_: 3}}},
        );
        expectChanges(
          listener,
          '/t1/r*/c1',
          {t1: {r1: {c1: 2}}},
          {t1: {r_: {c1: 4}}},
        );
        expectChanges(
          listener,
          '/t1/r*/c*',
          {t1: {r1: {c1: 2}}},
          {t1: {r1: {c_: 3}}},
          {t1: {r_: {c1: 4}}},
          {t1: {r_: {c_: 5}}},
        );
        expectChanges(
          listener,
          '/t*/r1/c1',
          {t1: {r1: {c1: 2}}},
          {t_: {r1: {c1: 6}}},
        );
        expectChanges(
          listener,
          '/t*/r1/c*',
          {t1: {r1: {c1: 2}}},
          {t1: {r1: {c_: 3}}},
          {t_: {r1: {c1: 6}}},
          {t_: {r1: {c_: 7}}},
        );
        expectChanges(
          listener,
          '/t*/r*/c1',
          {t1: {r1: {c1: 2}}},
          {t1: {r_: {c1: 4}}},
          {t_: {r1: {c1: 6}}},
          {t_: {r_: {c1: 8}}},
        );
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {r1: {c1: 2}}},
          {t1: {r1: {c_: 3}}},
          {t1: {r_: {c1: 4}}},
          {t1: {r_: {c_: 5}}},
          {t_: {r1: {c1: 6}}},
          {t_: {r1: {c_: 7}}},
          {t_: {r_: {c1: 8}}},
          {t_: {r_: {c_: 9}}},
        );
        expectNoChanges(listener);
      });

      test('setRow', () => {
        setMutatorListeners();
        store.setRow('t1', 'r1', {c1: 1});
        expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: 2}}});
        expectChanges(
          listener,
          '/t1/r1/c*',
          {t1: {r1: {c1: 2}}},
          {t1: {r1: {c_: 3}}},
        );
        expectChanges(
          listener,
          '/t1/r*/c1',
          {t1: {r1: {c1: 2}}},
          {t1: {r_: {c1: 4}}},
        );
        expectChanges(
          listener,
          '/t1/r*/c*',
          {t1: {r1: {c1: 2}}},
          {t1: {r1: {c_: 3}}},
          {t1: {r_: {c1: 4}}},
          {t1: {r_: {c_: 5}}},
        );
        expectChanges(
          listener,
          '/t*/r1/c1',
          {t1: {r1: {c1: 2}}},
          {t_: {r1: {c1: 6}}},
        );
        expectChanges(
          listener,
          '/t*/r1/c*',
          {t1: {r1: {c1: 2}}},
          {t1: {r1: {c_: 3}}},
          {t_: {r1: {c1: 6}}},
          {t_: {r1: {c_: 7}}},
        );
        expectChanges(
          listener,
          '/t*/r*/c1',
          {t1: {r1: {c1: 2}}},
          {t1: {r_: {c1: 4}}},
          {t_: {r1: {c1: 6}}},
          {t_: {r_: {c1: 8}}},
        );
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {r1: {c1: 2}}},
          {t1: {r1: {c_: 3}}},
          {t1: {r_: {c1: 4}}},
          {t1: {r_: {c_: 5}}},
          {t_: {r1: {c1: 6}}},
          {t_: {r1: {c_: 7}}},
          {t_: {r_: {c1: 8}}},
          {t_: {r_: {c_: 9}}},
        );
        expectNoChanges(listener);
      });

      test('addRow', () => {
        setMutatorListeners();
        store.addRow('t1', {c1: 1});
        expectChanges(
          listener,
          '/t1/r*/c1',
          {t1: {0: {c1: 1}}},
          {t1: {r_: {c1: 4}}},
        );
        expectChanges(
          listener,
          '/t1/r*/c*',
          {t1: {0: {c1: 1}}},
          {t1: {r_: {c1: 4}}},
          {t1: {r_: {c_: 5}}},
        );
        expectChanges(
          listener,
          '/t*/r*/c1',
          {t1: {0: {c1: 1}}},
          {t1: {r_: {c1: 4}}},
          {t_: {r_: {c1: 8}}},
        );
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {0: {c1: 1}}},
          {t1: {r_: {c1: 4}}},
          {t1: {r_: {c_: 5}}},
          {t_: {r_: {c1: 8}}},
          {t_: {r_: {c_: 9}}},
        );
        expectNoChanges(listener);
      });

      test('setPartialRow', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r1/c*', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r*/c1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t1/r*/c*', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r1/c1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r1/c*', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r*/c1', {t1: {r1: {c1: 1}}});
        expectChanges(listener, '/t*/r*/c*', {t1: {r1: {c1: 1}}});
        setMutatorListeners();
        // @ts-ignore
        store.setPartialRow('t1', 'r1', {c1: 1, c2: 1, c3: undefined});
        expectChanges(
          listener,
          '/t1/r1/c*',
          {t1: {r1: {c2: 1}}},
          {t1: {r1: {c_: 3}}},
        );
        expectChanges(
          listener,
          '/t1/r*/c*',
          {t1: {r1: {c2: 1}}},
          {t1: {r1: {c_: 3}}},
          {t1: {r_: {c_: 5}}},
        );
        expectChanges(
          listener,
          '/t*/r1/c*',
          {t1: {r1: {c2: 1}}},
          {t1: {r1: {c_: 3}}},
          {t_: {r1: {c_: 7}}},
        );
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {r1: {c2: 1}}},
          {t1: {r1: {c_: 3}}},
          {t1: {r_: {c_: 5}}},
          {t_: {r1: {c_: 7}}},
          {t_: {r_: {c_: 9}}},
        );
        expectNoChanges(listener);
      });

      test('setCell', () => {
        setMutatorListeners();
        store.setCell('t1', 'r1', 'c1', 1);
        expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: 2}}});
        expectChanges(
          listener,
          '/t1/r1/c*',
          {t1: {r1: {c1: 2}}},
          {t1: {r1: {c_: 3}}},
        );
        expectChanges(
          listener,
          '/t1/r*/c1',
          {t1: {r1: {c1: 2}}},
          {t1: {r_: {c1: 4}}},
        );
        expectChanges(
          listener,
          '/t1/r*/c*',
          {t1: {r1: {c1: 2}}},
          {t1: {r1: {c_: 3}}},
          {t1: {r_: {c1: 4}}},
          {t1: {r_: {c_: 5}}},
        );
        expectChanges(
          listener,
          '/t*/r1/c1',
          {t1: {r1: {c1: 2}}},
          {t_: {r1: {c1: 6}}},
        );
        expectChanges(
          listener,
          '/t*/r1/c*',
          {t1: {r1: {c1: 2}}},
          {t1: {r1: {c_: 3}}},
          {t_: {r1: {c1: 6}}},
          {t_: {r1: {c_: 7}}},
        );
        expectChanges(
          listener,
          '/t*/r*/c1',
          {t1: {r1: {c1: 2}}},
          {t1: {r_: {c1: 4}}},
          {t_: {r1: {c1: 6}}},
          {t_: {r_: {c1: 8}}},
        );
        expectChanges(
          listener,
          '/t*/r*/c*',
          {t1: {r1: {c1: 2}}},
          {t1: {r1: {c_: 3}}},
          {t1: {r_: {c1: 4}}},
          {t1: {r_: {c_: 5}}},
          {t_: {r1: {c1: 6}}},
          {t_: {r1: {c_: 7}}},
          {t_: {r_: {c1: 8}}},
          {t_: {r_: {c_: 9}}},
        );
        expectNoChanges(listener);
      });
    });

    describe('invalid cell', () => {
      beforeEach(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToInvalidCell('i:/t1/r1/c1', 't1', 'r1', 'c1');
        listener.listenToInvalidCell('i:/t1/r1/c*', 't1', 'r1', null);
        listener.listenToInvalidCell('i:/t1/r*/c1', 't1', null, 'c1');
        listener.listenToInvalidCell('i:/t1/r*/c*', 't1', null, null);
        listener.listenToInvalidCell('i:/t*/r1/c1', null, 'r1', 'c1');
        listener.listenToInvalidCell('i:/t*/r1/c*', null, 'r1', null);
        listener.listenToInvalidCell('i:/t*/r*/c1', null, null, 'c1');
        listener.listenToInvalidCell('i:/t*/r*/c*', null, null, null);
      });

      const setMutatorListeners = () => {
        store.addInvalidCellListener(
          't1',
          'r1',
          'c1',
          // @ts-ignore
          getCellMutator([2]),
          true,
        );
        store.addInvalidCellListener(
          't1',
          'r1',
          null,
          // @ts-ignore
          getCellMutator([3], null, null, 'c_'),
          true,
        );
        store.addInvalidCellListener(
          't1',
          null,
          'c1',
          // @ts-ignore
          getCellMutator([4], null, 'r_'),
          true,
        );
        store.addInvalidCellListener(
          't1',
          null,
          null,
          // @ts-ignore
          getCellMutator([5], null, 'r_', 'c_'),
          true,
        );
        store.addInvalidCellListener(
          null,
          'r1',
          'c1',
          // @ts-ignore
          getCellMutator([6], 't_'),
          true,
        );
        store.addInvalidCellListener(
          null,
          'r1',
          null,
          // @ts-ignore
          getCellMutator([7], 't_', null, 'c_'),
          true,
        );
        store.addInvalidCellListener(
          null,
          null,
          'c1',
          // @ts-ignore
          getCellMutator([8], 't_', 'r_'),
          true,
        );
        store.addInvalidCellListener(
          null,
          null,
          null,
          // @ts-ignore
          getCellMutator([9], 't_', 'r_', 'c_'),
          true,
        );
      };

      test('setTables', () => {
        setMutatorListeners();
        // @ts-ignore
        store.setTables({t1: {r1: {c1: [1]}}});
        expectChanges(listener, 'i:/t1/r1/c1', {t1: {r1: {c1: [[1], [2]]}}});
        expectChanges(
          listener,
          'i:/t1/r1/c*',
          {t1: {r1: {c1: [[1], [2]]}}},
          {t1: {r1: {c_: [[3]]}}},
        );
        expectChanges(
          listener,
          'i:/t1/r*/c1',
          {t1: {r1: {c1: [[1], [2]]}}},
          {t1: {r_: {c1: [[4]]}}},
        );
        expectChanges(
          listener,
          'i:/t1/r*/c*',
          {t1: {r1: {c1: [[1], [2]]}}},
          {t1: {r1: {c_: [[3]]}}},
          {t1: {r_: {c1: [[4]]}}},
          {t1: {r_: {c_: [[5]]}}},
        );
        expectChanges(
          listener,
          'i:/t*/r1/c1',
          {t1: {r1: {c1: [[1], [2]]}}},
          {t_: {r1: {c1: [[6]]}}},
        );
        expectChanges(
          listener,
          'i:/t*/r1/c*',
          {t1: {r1: {c1: [[1], [2]]}}},
          {t1: {r1: {c_: [[3]]}}},
          {t_: {r1: {c1: [[6]]}}},
          {t_: {r1: {c_: [[7]]}}},
        );
        expectChanges(
          listener,
          'i:/t*/r*/c1',
          {t1: {r1: {c1: [[1], [2]]}}},
          {t1: {r_: {c1: [[4]]}}},
          {t_: {r1: {c1: [[6]]}}},
          {t_: {r_: {c1: [[8]]}}},
        );
        expectChanges(
          listener,
          'i:/t*/r*/c*',
          {t1: {r1: {c1: [[1], [2]]}}},
          {t1: {r1: {c_: [[3]]}}},
          {t1: {r_: {c1: [[4]]}}},
          {t1: {r_: {c_: [[5]]}}},
          {t_: {r1: {c1: [[6]]}}},
          {t_: {r1: {c_: [[7]]}}},
          {t_: {r_: {c1: [[8]]}}},
          {t_: {r_: {c_: [[9]]}}},
        );
        expectNoChanges(listener);
      });

      test('setTable', () => {
        setMutatorListeners();
        // @ts-ignore
        store.setTable('t1', {r1: {c1: [1]}});
        expectChanges(listener, 'i:/t1/r1/c1', {t1: {r1: {c1: [[1], [2]]}}});
        expectChanges(
          listener,
          'i:/t1/r1/c*',
          {t1: {r1: {c1: [[1], [2]]}}},
          {t1: {r1: {c_: [[3]]}}},
        );
        expectChanges(
          listener,
          'i:/t1/r*/c1',
          {t1: {r1: {c1: [[1], [2]]}}},
          {t1: {r_: {c1: [[4]]}}},
        );
        expectChanges(
          listener,
          'i:/t1/r*/c*',
          {t1: {r1: {c1: [[1], [2]]}}},
          {t1: {r1: {c_: [[3]]}}},
          {t1: {r_: {c1: [[4]]}}},
          {t1: {r_: {c_: [[5]]}}},
        );
        expectChanges(
          listener,
          'i:/t*/r1/c1',
          {t1: {r1: {c1: [[1], [2]]}}},
          {t_: {r1: {c1: [[6]]}}},
        );
        expectChanges(
          listener,
          'i:/t*/r1/c*',
          {t1: {r1: {c1: [[1], [2]]}}},
          {t1: {r1: {c_: [[3]]}}},
          {t_: {r1: {c1: [[6]]}}},
          {t_: {r1: {c_: [[7]]}}},
        );
        expectChanges(
          listener,
          'i:/t*/r*/c1',
          {t1: {r1: {c1: [[1], [2]]}}},
          {t1: {r_: {c1: [[4]]}}},
          {t_: {r1: {c1: [[6]]}}},
          {t_: {r_: {c1: [[8]]}}},
        );
        expectChanges(
          listener,
          'i:/t*/r*/c*',
          {t1: {r1: {c1: [[1], [2]]}}},
          {t1: {r1: {c_: [[3]]}}},
          {t1: {r_: {c1: [[4]]}}},
          {t1: {r_: {c_: [[5]]}}},
          {t_: {r1: {c1: [[6]]}}},
          {t_: {r1: {c_: [[7]]}}},
          {t_: {r_: {c1: [[8]]}}},
          {t_: {r_: {c_: [[9]]}}},
        );
        expectNoChanges(listener);
      });

      test('setRow', () => {
        setMutatorListeners();
        // @ts-ignore
        store.setRow('t1', 'r1', {c1: [1]});
        expectChanges(listener, 'i:/t1/r1/c1', {t1: {r1: {c1: [[1], [2]]}}});
        expectChanges(
          listener,
          'i:/t1/r1/c*',
          {t1: {r1: {c1: [[1], [2]]}}},
          {t1: {r1: {c_: [[3]]}}},
        );
        expectChanges(
          listener,
          'i:/t1/r*/c1',
          {t1: {r1: {c1: [[1], [2]]}}},
          {t1: {r_: {c1: [[4]]}}},
        );
        expectChanges(
          listener,
          'i:/t1/r*/c*',
          {t1: {r1: {c1: [[1], [2]]}}},
          {t1: {r1: {c_: [[3]]}}},
          {t1: {r_: {c1: [[4]]}}},
          {t1: {r_: {c_: [[5]]}}},
        );
        expectChanges(
          listener,
          'i:/t*/r1/c1',
          {t1: {r1: {c1: [[1], [2]]}}},
          {t_: {r1: {c1: [[6]]}}},
        );
        expectChanges(
          listener,
          'i:/t*/r1/c*',
          {t1: {r1: {c1: [[1], [2]]}}},
          {t1: {r1: {c_: [[3]]}}},
          {t_: {r1: {c1: [[6]]}}},
          {t_: {r1: {c_: [[7]]}}},
        );
        expectChanges(
          listener,
          'i:/t*/r*/c1',
          {t1: {r1: {c1: [[1], [2]]}}},
          {t1: {r_: {c1: [[4]]}}},
          {t_: {r1: {c1: [[6]]}}},
          {t_: {r_: {c1: [[8]]}}},
        );
        expectChanges(
          listener,
          'i:/t*/r*/c*',
          {t1: {r1: {c1: [[1], [2]]}}},
          {t1: {r1: {c_: [[3]]}}},
          {t1: {r_: {c1: [[4]]}}},
          {t1: {r_: {c_: [[5]]}}},
          {t_: {r1: {c1: [[6]]}}},
          {t_: {r1: {c_: [[7]]}}},
          {t_: {r_: {c1: [[8]]}}},
          {t_: {r_: {c_: [[9]]}}},
        );
        expectNoChanges(listener);
      });

      test('addRow', () => {
        setMutatorListeners();
        // @ts-ignore
        store.addRow('t1', {c1: [1]});
        expectChanges(
          listener,
          'i:/t1/r*/c1',
          {t1: {undefined: {c1: [[1]]}}},
          {t1: {r_: {c1: [[4]]}}},
        );
        expectChanges(
          listener,
          'i:/t1/r*/c*',
          {t1: {undefined: {c1: [[1]]}}},
          {t1: {r_: {c1: [[4]]}}},
          {t1: {r_: {c_: [[5]]}}},
        );
        expectChanges(
          listener,
          'i:/t*/r*/c1',
          {t1: {undefined: {c1: [[1]]}}},
          {t1: {r_: {c1: [[4]]}}},
          {t_: {r_: {c1: [[8]]}}},
        );
        expectChanges(
          listener,
          'i:/t*/r*/c*',
          {t1: {undefined: {c1: [[1]]}}},
          {t1: {r_: {c1: [[4]]}}},
          {t1: {r_: {c_: [[5]]}}},
          {t_: {r_: {c1: [[8]]}}},
          {t_: {r_: {c_: [[9]]}}},
        );
        expectNoChanges(listener);
      });

      test('setPartialRow', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        setMutatorListeners();
        // @ts-ignore
        store.setPartialRow('t1', 'r1', {c1: 1, c2: [1]});
        expectChanges(
          listener,
          'i:/t1/r1/c*',
          {t1: {r1: {c2: [[1]]}}},
          {t1: {r1: {c_: [[3]]}}},
        );
        expectChanges(
          listener,
          'i:/t1/r*/c*',
          {t1: {r1: {c2: [[1]]}}},
          {t1: {r1: {c_: [[3]]}}},
          {t1: {r_: {c_: [[5]]}}},
        );
        expectChanges(
          listener,
          'i:/t*/r1/c*',
          {t1: {r1: {c2: [[1]]}}},
          {t1: {r1: {c_: [[3]]}}},
          {t_: {r1: {c_: [[7]]}}},
        );
        expectChanges(
          listener,
          'i:/t*/r*/c*',
          {t1: {r1: {c2: [[1]]}}},
          {t1: {r1: {c_: [[3]]}}},
          {t1: {r_: {c_: [[5]]}}},
          {t_: {r1: {c_: [[7]]}}},
          {t_: {r_: {c_: [[9]]}}},
        );
        expectNoChanges(listener);
      });

      test('setCell', () => {
        setMutatorListeners();
        // @ts-ignore
        store.setCell('t1', 'r1', 'c1', [1]);
        expectChanges(listener, 'i:/t1/r1/c1', {t1: {r1: {c1: [[1], [2]]}}});
        expectChanges(
          listener,
          'i:/t1/r1/c*',
          {t1: {r1: {c1: [[1], [2]]}}},
          {t1: {r1: {c_: [[3]]}}},
        );
        expectChanges(
          listener,
          'i:/t1/r*/c1',
          {t1: {r1: {c1: [[1], [2]]}}},
          {t1: {r_: {c1: [[4]]}}},
        );
        expectChanges(
          listener,
          'i:/t1/r*/c*',
          {t1: {r1: {c1: [[1], [2]]}}},
          {t1: {r1: {c_: [[3]]}}},
          {t1: {r_: {c1: [[4]]}}},
          {t1: {r_: {c_: [[5]]}}},
        );
        expectChanges(
          listener,
          'i:/t*/r1/c1',
          {t1: {r1: {c1: [[1], [2]]}}},
          {t_: {r1: {c1: [[6]]}}},
        );
        expectChanges(
          listener,
          'i:/t*/r1/c*',
          {t1: {r1: {c1: [[1], [2]]}}},
          {t1: {r1: {c_: [[3]]}}},
          {t_: {r1: {c1: [[6]]}}},
          {t_: {r1: {c_: [[7]]}}},
        );
        expectChanges(
          listener,
          'i:/t*/r*/c1',
          {t1: {r1: {c1: [[1], [2]]}}},
          {t1: {r_: {c1: [[4]]}}},
          {t_: {r1: {c1: [[6]]}}},
          {t_: {r_: {c1: [[8]]}}},
        );
        expectChanges(
          listener,
          'i:/t*/r*/c*',
          {t1: {r1: {c1: [[1], [2]]}}},
          {t1: {r1: {c_: [[3]]}}},
          {t1: {r_: {c1: [[4]]}}},
          {t1: {r_: {c_: [[5]]}}},
          {t_: {r1: {c1: [[6]]}}},
          {t_: {r1: {c_: [[7]]}}},
          {t_: {r_: {c1: [[8]]}}},
          {t_: {r_: {c_: [[9]]}}},
        );
        expectNoChanges(listener);
      });
    });

    describe('hasValues', () => {
      beforeEach(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToHasValues('/');
      });

      const setMutatorListeners = () => {
        store.addValuesListener(getValuesMutator(), true);
      };

      test('setValues', () => {
        setMutatorListeners();
        store.setValues({v1: 1});
        expectChanges(listener, '/', true);
        expectNoChanges(listener);
      });

      test('setPartialValues', () => {
        store.setValues({v1: 1});
        expectChanges(listener, '/', true);
        setMutatorListeners();
        // @ts-ignore
        store.setPartialValues({v2: 1, v3: undefined});
        expectNoChanges(listener);
      });

      test('setValue', () => {
        setMutatorListeners();
        store.setValue('v1', 1);
        expectChanges(listener, '/', true);
        expectNoChanges(listener);
      });

      test('setValue, deleted', () => {
        store.addValuesListener(() => store.delValues(), true);
        store.setValue('v1', 1);
        expectNoChanges(listener);
      });

      test('delValue, added', () => {
        store.setValues({v1: 1});
        expectChanges(listener, '/', true);
        store.addValuesListener(() => store.setValue('v2', 2), true);
        store.delValue('v1');
        expectNoChanges(listener);
      });
    });

    describe('values', () => {
      beforeEach(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToValues('/');
      });

      const setMutatorListeners = () => {
        store.addValuesListener(getValuesMutator(), true);
      };

      test('setValues', () => {
        setMutatorListeners();
        store.setValues({v1: 1});
        expectChanges(listener, '/', {v1: 1, v0: 0});
        expectNoChanges(listener);
      });

      test('setPartialValues', () => {
        store.setValues({v1: 1});
        expectChanges(listener, '/', {v1: 1});
        setMutatorListeners();
        // @ts-ignore
        store.setPartialValues({v2: 1, v3: undefined});
        expectChanges(listener, '/', {v1: 1, v2: 1, v0: 0});
        expectNoChanges(listener);
      });

      test('setValue', () => {
        setMutatorListeners();
        store.setValue('v1', 1);
        expectChanges(listener, '/', {v1: 1, v0: 0});
        expectNoChanges(listener);
      });
    });

    describe('valueIds', () => {
      beforeEach(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToValueIds('/');
      });

      const setMutatorListeners = () => {
        store.addValueIdsListener(getValuesMutator(), true);
      };

      test('setValues', () => {
        setMutatorListeners();
        store.setValues({v1: 1});
        expectChanges(listener, '/', [['v1', 'v0'], {v1: 1, v0: 1}]);
        expectNoChanges(listener);
      });

      test('setPartialValues', () => {
        store.setValues({v1: 1});
        expectChanges(listener, '/', [['v1'], {v1: 1}]);
        setMutatorListeners();
        // @ts-ignore
        store.setPartialValues({v2: 1, v3: undefined});
        expectChanges(listener, '/', [['v1', 'v2', 'v0'], {v2: 1, v0: 1}]);
        expectNoChanges(listener);
      });

      test('setValue', () => {
        setMutatorListeners();
        store.setValue('v1', 1);
        expectChanges(listener, '/', [['v1', 'v0'], {v1: 1, v0: 1}]);
        expectNoChanges(listener);
      });
    });

    describe('hasValue', () => {
      beforeEach(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToValue('/v1', 'v1');
        listener.listenToValue('/v2', 'v2');
        listener.listenToValue('/v*', null);
      });

      const setMutatorListeners = () => {
        store.addHasValueListener('v1', getValueMutator('_1'), true);
        store.addHasValueListener('v2', getValueMutator('_2'), true);
        store.addHasValueListener(null, getValueMutator('__'), true);
      };

      test('setValues', () => {
        setMutatorListeners();
        store.setValues({v1: 1});
        expectChanges(listener, '/v1', {v1: 1});
        expectChanges(listener, '/v*', {v1: 1}, {v1_1: true}, {v1__: true});
        expectNoChanges(listener);
      });

      test('setPartialValues', () => {
        store.setValues({v1: 1});
        expectChanges(listener, '/v1', {v1: 1});
        expectChanges(listener, '/v*', {v1: 1});
        setMutatorListeners();
        // @ts-ignore
        store.setPartialValues({v2: 1, v3: undefined});
        expectChanges(listener, '/v2', {v2: 1});
        expectChanges(listener, '/v*', {v2: 1}, {v2_2: true}, {v2__: true});
        expectNoChanges(listener);
      });

      test('setValue', () => {
        setMutatorListeners();
        store.setValue('v1', 1);
        expectChanges(listener, '/v1', {v1: 1});
        expectChanges(listener, '/v*', {v1: 1}, {v1_1: true}, {v1__: true});
        expectNoChanges(listener);
      });
    });

    describe('value', () => {
      beforeEach(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToValue('/v1', 'v1');
        listener.listenToValue('/v2', 'v2');
        listener.listenToValue('/v*', null);
      });

      const setMutatorListeners = () => {
        store.addValueListener('v1', getValueMutator('_1'), true);
        store.addValueListener('v2', getValueMutator('_2'), true);
        store.addValueListener(null, getValueMutator('__'), true);
      };

      test('setValues', () => {
        setMutatorListeners();
        store.setValues({v1: 1});
        expectChanges(listener, '/v1', {v1: 1});
        expectChanges(listener, '/v*', {v1: 1}, {v1_1: 1}, {v1__: 1});
        expectNoChanges(listener);
      });

      test('setPartialValues', () => {
        store.setValues({v1: 1});
        expectChanges(listener, '/v1', {v1: 1});
        expectChanges(listener, '/v*', {v1: 1});
        setMutatorListeners();
        // @ts-ignore
        store.setPartialValues({v2: 1, v3: undefined});
        expectChanges(listener, '/v2', {v2: 1});
        expectChanges(listener, '/v*', {v2: 1}, {v2_2: 1}, {v2__: 1});
        expectNoChanges(listener);
      });

      test('setValue', () => {
        setMutatorListeners();
        store.setValue('v1', 1);
        expectChanges(listener, '/v1', {v1: 1});
        expectChanges(listener, '/v*', {v1: 1}, {v1_1: 1}, {v1__: 1});
        expectNoChanges(listener);
      });
    });

    describe('invalid value', () => {
      beforeEach(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToInvalidValue('/v1', 'v1');
        listener.listenToInvalidValue('/v2', 'v2');
        listener.listenToInvalidValue('/v*', null);
      });

      const setMutatorListeners = () => {
        store.addInvalidValueListener('v1', getInvalidValueMutator('_1'), true);
        store.addInvalidValueListener('v2', getInvalidValueMutator('_2'), true);
        store.addInvalidValueListener(null, getInvalidValueMutator('__'), true);
      };

      test('setValues', () => {
        setMutatorListeners();
        // @ts-ignore
        store.setValues({v1: [1]});
        expectChanges(listener, '/v1', {v1: [[1]]});
        expectChanges(
          listener,
          '/v*',
          {v1: [[1]]},
          {v1_1: [[[1]]]},
          {v1__: [[[1]]]},
        );
        expectNoChanges(listener);
      });

      test('setPartialValues', () => {
        store.setValues({v1: 1});
        setMutatorListeners();
        // @ts-ignore
        store.setPartialValues({v2: [2], v3: undefined});
        expectChanges(listener, '/v2', {v2: [[2]]});
        expectChanges(
          listener,
          '/v*',
          {v2: [[2]]},
          {v3: [undefined]},
          {v2_2: [[[2]]]},
          {v2__: [[[2]]]},
          {v3__: [[undefined]]},
        );
        expectNoChanges(listener);
      });

      test('setValue', () => {
        setMutatorListeners();
        // @ts-ignore
        store.setValue('v1', [1]);
        expectChanges(listener, '/v1', {v1: [[1]]});
        expectChanges(
          listener,
          '/v*',
          {v1: [[1]]},
          {v1_1: [[[1]]]},
          {v1__: [[[1]]]},
        );
        expectNoChanges(listener);
      });
    });

    describe('transaction', () => {
      beforeEach(() => {
        store = createStore();
      });

      test('start can mutate', () => {
        const listener = jest.fn(() => {
          store.setValue('mutated', true);
        });
        store.addStartTransactionListener(listener);
        store.setCell('t1', 'r1', 'c1', 'r1');
        expect(listener).toHaveBeenCalledTimes(1);
        expect(store.getTables()).toEqual({t1: {r1: {c1: 'r1'}}});
        expect(store.getValues()).toEqual({mutated: true});
      });

      test('willFinish can mutate', () => {
        const listener = jest.fn(() => {
          store.setValue('mutated', true);
        });
        store.addWillFinishTransactionListener(listener);
        store.setCell('t1', 'r1', 'c1', 'r1');
        expect(listener).toHaveBeenCalledTimes(1);
        expect(store.getTables()).toEqual({t1: {r1: {c1: 'r1'}}});
        expect(store.getValues()).toEqual({mutated: true});
      });

      test('didFinish cannot mutate', () => {
        const listener = jest.fn(() => {
          store.setValue('mutated', true);
        });
        store.addDidFinishTransactionListener(listener);
        store.setCell('t1', 'r1', 'c1', 'r1');
        expect(listener).toHaveBeenCalledTimes(1);
        expect(store.getTables()).toEqual({t1: {r1: {c1: 'r1'}}});
        expect(store.getValues()).toEqual({});
      });
    });

    describe('Miscellaneous', () => {
      beforeEach(() => {
        store = createStore();
        listener = createStoreListener(store);
        listener.listenToTables('/');
      });

      test('mutator not flagged', () => {
        store.addCellListener('t1', 'r1', 'c1', getCellMutator(2));
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/', {t1: {r1: {c1: 1}}});
        store.addCellListener('t1', 'r1', 'c1', getCellMutator(3), true);
        store.setTables({t1: {r1: {c1: 2}}});
        expectChanges(listener, '/', {t1: {r1: {c1: 3}}});
        expectNoChanges(listener);
      });

      test('mutator runs once', () => {
        store.addCellListener(
          't1',
          'r1',
          'c1',
          () =>
            store.setCell(
              't1',
              'r1',
              'c2',
              -(store.getCell('t1', 'r1', 'c1') as number),
            ),
          true,
        );
        store.transaction(() => {
          store.setTables({t1: {r1: {c1: 1}}});
          store.setTable('t1', {r1: {c1: 2}});
          store.setRow('t1', 'r1', {c1: 3});
          store.setCell('t1', 'r1', 'c1', 4);
        });
        expectChanges(listener, '/', {t1: {r1: {c1: 4, c2: -4}}});
        expectNoChanges(listener);
      });

      test('mutator cancels change', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/', {t1: {r1: {c1: 1}}});
        store.addCellListener('t1', 'r1', 'c1', getCellMutator(1), true);
        store.setTables({t1: {r1: {c1: 2}}});
        expectNoChanges(listener);
      });

      test('two mutators, same scope', () => {
        store.addCellListener('t1', 'r1', 'c1', getCellMutator(2), true);
        store.addCellListener('t1', 'r1', 'c1', getCellMutator(3), true);
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/', {t1: {r1: {c1: 3}}});
        expectNoChanges(listener);
      });

      test('two mutators, different scope', () => {
        store.addRowListener('t1', 'r1', getRowMutator(2, 't1', 'r1'), true);
        store.addCellListener('t1', 'r1', 'c1', getCellMutator(3), true);
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/', {t1: {r1: {c1: 3, c0: 2}}});
        expectNoChanges(listener);
      });

      test('cell values as args', () => {
        store.setTables({t1: {r1: {c1: 1}}});
        expectChanges(listener, '/', {t1: {r1: {c1: 1}}});
        store.addCellListener(
          't1',
          'r1',
          'c1',
          (store, tableId, rowId, cellId, newCell, oldCell) =>
            store.setCell(
              tableId,
              rowId,
              cellId,
              ((newCell as number) + (oldCell as number)) / 2,
            ),
          true,
        );
        store.setTables({t1: {r1: {c1: 3}}});
        expectChanges(listener, '/', {t1: {r1: {c1: 2}}});
        expectNoChanges(listener);
      });

      describe('mutation does not fire', () => {
        let secondMutator: jest.Mock;
        let secondListener: jest.Mock;

        beforeEach(() => {
          store = createStore();
          secondMutator = jest.fn(() => null);
          secondListener = jest.fn(() => null);
        });

        test('cell mutation, new cell', () => {
          store.addCellListener(
            't1',
            'r1',
            'c1',
            () => store.setCell('t2', 'r2', 'c2', 2),
            true,
          );
          store.addCellListener('t2', 'r2', 'c2', secondMutator, true);
          store.addCellListener('t2', 'r2', 'c2', secondListener);
          store.setCell('t1', 'r1', 'c1', 1);
          expect(secondMutator).toHaveBeenCalledTimes(0);
          expect(secondListener).toHaveBeenCalledTimes(1);
        });

        test('cell mutation, updated cell', () => {
          store.addCellListener(
            't1',
            'r1',
            'c1',
            () => store.setCell('t2', 'r2', 'c2', 2),
            true,
          );
          store.addCellListener('t2', 'r2', 'c2', secondMutator, true);
          store.addCellListener('t2', 'r2', 'c2', secondListener);
          store.transaction(() => {
            store.setCell('t1', 'r1', 'c1', 1);
            store.setCell('t2', 'r2', 'c2', 1);
          });
          expect(secondMutator).toHaveBeenCalledTimes(1);
          expect(secondMutator).toHaveBeenCalledWith(
            store,
            't2',
            'r2',
            'c2',
            2,
            undefined,
            expect.any(Function),
          );
          expect(secondListener).toHaveBeenCalledTimes(1);
        });

        test('cell mutation, reverted later cell', () => {
          store.addCellListener(
            't1',
            'r1',
            'c1',
            () => store.delCell('t2', 'r2', 'c2'),
            true,
          );
          store.addCellListener('t2', 'r2', 'c2', secondMutator, true);
          store.addCellListener('t2', 'r2', 'c2', secondListener);
          store.transaction(() => {
            store.setCell('t1', 'r1', 'c1', 1);
            store.setCell('t2', 'r2', 'c2', 2);
          });
          expect(secondMutator).toHaveBeenCalledTimes(0);
          expect(secondListener).toHaveBeenCalledTimes(0);
        });

        test('cell mutation, reverted earlier cell', () => {
          store.addCellListener(
            't2',
            'r2',
            'c2',
            () => store.delCell('t1', 'r1', 'c1'),
            true,
          );
          store.addCellListener('t1', 'r1', 'c1', secondMutator, true);
          store.addCellListener('t1', 'r1', 'c1', secondListener);
          store.transaction(() => {
            store.setCell('t1', 'r1', 'c1', 1);
            store.setCell('t2', 'r2', 'c2', 2);
          });
          expect(secondMutator).toHaveBeenCalledTimes(1);
          expect(secondMutator).toHaveBeenCalledWith(
            store,
            't1',
            'r1',
            'c1',
            1,
            undefined,
            expect.any(Function),
          );
          expect(secondListener).toHaveBeenCalledTimes(0);
        });

        test('cell mutation, reverted self', () => {
          store.setCell('t1', 'r1', 'c1', 1);
          store.addCellListener(
            't1',
            'r1',
            'c1',
            () => store.setCell('t1', 'r1', 'c1', 1),
            true,
          );
          store.addCellListener('t1', 'r1', 'c1', secondListener);
          store.setCell('t1', 'r1', 'c1', 2);
          expect(secondListener).toHaveBeenCalledTimes(0);
        });

        test('cell mutation, reverted self alongside another', () => {
          store.setCell('t1', 'r1', 'c1', 1);
          store.addCellListener(
            't1',
            'r1',
            'c1',
            () => store.setCell('t1', 'r1', 'c1', 1),
            true,
          );
          store.addCellListener('t1', 'r1', null, secondListener);
          store.setRow('t1', 'r1', {c1: 2, c2: 2});
          expect(secondListener).toHaveBeenCalledTimes(1);
          expect(secondListener).toHaveBeenCalledWith(
            store,
            't1',
            'r1',
            'c2',
            2,
            undefined,
            expect.any(Function),
          );
        });

        test('cell ids mutation', () => {
          store.addCellListener(
            't1',
            'r1',
            'c1',
            () => store.setCell('t2', 'r2', 'c2', 2),
            true,
          );
          store.addCellIdsListener(null, null, secondMutator, true);
          store.addCellIdsListener(null, null, secondListener);
          store.setCell('t1', 'r1', 'c1', 1);
          expect(secondMutator).toHaveBeenCalledTimes(1);
          expect(secondListener).toHaveBeenCalledTimes(2);
        });

        test('row mutation', () => {
          store.addCellListener(
            't1',
            'r1',
            'c1',
            () => store.setCell('t2', 'r2', 'c2', 2),
            true,
          );
          store.addRowListener(null, null, secondMutator, true);
          store.addRowListener(null, null, secondListener);
          store.setCell('t1', 'r1', 'c1', 1);
          expect(secondMutator).toHaveBeenCalledTimes(1);
          expect(secondListener).toHaveBeenCalledTimes(2);
        });

        test('row ids mutation', () => {
          store.addCellListener(
            't1',
            'r1',
            'c1',
            () => store.setCell('t2', 'r2', 'c2', 2),
            true,
          );
          store.addRowIdsListener(null, secondMutator, true);
          store.addRowIdsListener(null, secondListener);
          store.setCell('t1', 'r1', 'c1', 1);
          expect(secondMutator).toHaveBeenCalledTimes(1);
          expect(secondListener).toHaveBeenCalledTimes(2);
        });

        test('table mutation', () => {
          store.addCellListener(
            't1',
            'r1',
            'c1',
            () => store.setCell('t2', 'r2', 'c2', 2),
            true,
          );
          store.addTableListener(null, secondMutator, true);
          store.addTableListener(null, secondListener);
          store.setCell('t1', 'r1', 'c1', 1);
          expect(secondMutator).toHaveBeenCalledTimes(1);
          expect(secondListener).toHaveBeenCalledTimes(2);
        });

        test('table ids mutation', () => {
          store.addCellListener(
            't1',
            'r1',
            'c1',
            () => store.setCell('t2', 'r2', 'c2', 2),
            true,
          );
          store.addTableIdsListener(secondMutator, true);
          store.addTableIdsListener(secondListener);
          store.setCell('t1', 'r1', 'c1', 1);
          expect(secondMutator).toHaveBeenCalledTimes(1);
          expect(secondListener).toHaveBeenCalledTimes(1);
        });
      });

      test('cell mutation cancels listeners', () => {
        const store = createStore().setTables({t1: {r1: {c1: 1}}});
        const second = jest.fn(() => null);
        store.addCellListener(
          't1',
          'r1',
          'c1',
          () => store.setCell('t1', 'r1', 'c1', 1),
          true,
        );
        store.addCellListener(null, null, null, second);
        store.addCellIdsListener(null, null, second);
        store.addRowListener(null, null, second);
        store.addRowIdsListener(null, second);
        store.addTableListener(null, second);
        store.addTableIdsListener(second);
        store.addTablesListener(second);
        store.setCell('t1', 'r1', 'c1', 2);
        expect(second).toHaveBeenCalledTimes(0);
      });

      test('cell self-mutation does not stack overflow', () => {
        const store = createStore().setTables({t1: {r1: {c1: 1}}});
        const second = jest.fn(() => null);
        store.addCellListener(
          't1',
          'r1',
          'c1',
          () =>
            store.setCell(
              't1',
              'r1',
              'c1',
              (cell): Cell => (cell as number) - 1,
            ),
          true,
        );
        store.addCellListener(null, null, null, second);
        store.addCellIdsListener(null, null, second);
        store.addRowListener(null, null, second);
        store.addRowIdsListener(null, second);
        store.addTableListener(null, second);
        store.addTableIdsListener(second);
        store.addTablesListener(second);
        store.setCell('t1', 'r1', 'c1', 2);
        expect(second).toHaveBeenCalledTimes(0);
      });

      test('value mutation cancels listeners', () => {
        const store = createStore().setValues({v1: 1});
        const second = jest.fn(() => null);
        store.addValueListener('v1', () => store.setValue('v1', 1), true);
        store.addValueListener(null, second);
        store.addValueIdsListener(second);
        store.addValuesListener(second);
        store.setValue('v1', 2);
        expect(second).toHaveBeenCalledTimes(0);
      });

      test('value self-mutation does not stack overflow', () => {
        const store = createStore().setValues({v1: 1});
        const second = jest.fn(() => null);
        store.addValueListener(
          'v1',
          () => store.setValue('v1', (value): Value => (value as number) - 1),
          true,
        );
        store.addValueListener(null, second);
        store.addValueIdsListener(second);
        store.addValuesListener(second);
        store.setValue('v1', 2);
        expect(second).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('callListener', () => {
    let store: Store;
    let listener: () => null;
    beforeEach(() => {
      store = createStore()
        .setTables({
          t1: {r1: {c1: 1, c2: 2}, r2: {c1: 3, c2: 4}},
          t2: {r1: {c1: 5, c2: 6}, r2: {c1: 7, c2: 8}},
        })
        .setValues({v1: 1, v2: 2});
      listener = jest.fn(() => null);
    });

    test('non-existent', () => {
      store.callListener(store.addTablesListener(listener) + 1);
      expect(listener).toHaveBeenCalledTimes(0);
    });

    test('hasTables (non mutator)', () => {
      store.callListener(store.addHasTablesListener(listener));
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenNthCalledWith(1, store, true);
    });

    test('hasTables (mutator)', () => {
      store.callListener(store.addHasTablesListener(listener, true));
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenNthCalledWith(1, store, true);
    });

    test('tables (non mutator)', () => {
      store.callListener(store.addTablesListener(listener));
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenNthCalledWith(1, store);
    });

    test('tables (mutator)', () => {
      store.callListener(store.addTablesListener(listener, true));
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenNthCalledWith(1, store);
    });

    test('tableIds (non mutator)', () => {
      store.callListener(store.addTableIdsListener(listener));
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenNthCalledWith(1, store);
    });

    test('hasTable id (non mutator)', () => {
      store.callListener(store.addHasTableListener('t1', listener));
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenNthCalledWith(1, store, 't1', true);
    });

    test('hasTable id (mutator)', () => {
      store.callListener(store.addHasTableListener('t1', listener, true));
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenNthCalledWith(1, store, 't1', true);
    });

    test('hasTable * (non mutator)', () => {
      store.callListener(store.addHasTableListener(null, listener));
      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenNthCalledWith(1, store, 't1', true);
      expect(listener).toHaveBeenNthCalledWith(2, store, 't2', true);
    });

    test('hasTable * (mutator)', () => {
      store.callListener(store.addHasTableListener(null, listener, true));
      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenNthCalledWith(1, store, 't1', true);
      expect(listener).toHaveBeenNthCalledWith(2, store, 't2', true);
    });

    test('table id (non mutator)', () => {
      store.callListener(store.addTableListener('t1', listener));
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenNthCalledWith(1, store, 't1');
    });

    test('table id (mutator)', () => {
      store.callListener(store.addTableListener('t1', listener, true));
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenNthCalledWith(1, store, 't1');
    });

    test('table * (non mutator)', () => {
      store.callListener(store.addTableListener(null, listener));
      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenNthCalledWith(1, store, 't1');
      expect(listener).toHaveBeenNthCalledWith(2, store, 't2');
    });

    test('table * (mutator)', () => {
      store.callListener(store.addTableListener(null, listener, true));
      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenNthCalledWith(1, store, 't1');
      expect(listener).toHaveBeenNthCalledWith(2, store, 't2');
    });

    test('tableCellIds id (non mutator)', () => {
      store.callListener(store.addTableCellIdsListener('t1', listener));
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenNthCalledWith(1, store, 't1');
    });

    test('tableCellIds * (non mutator)', () => {
      store.callListener(store.addTableCellIdsListener(null, listener));
      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenNthCalledWith(1, store, 't1');
      expect(listener).toHaveBeenNthCalledWith(2, store, 't2');
    });

    test('hasTableCell id (non mutator)', () => {
      store.callListener(store.addHasTableCellListener('t1', 'c1', listener));
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'c1', true);
    });

    test('hasTableCell * (non mutator)', () => {
      store.callListener(store.addHasTableCellListener(null, null, listener));
      expect(listener).toHaveBeenCalledTimes(4);
      expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'c1', true);
      expect(listener).toHaveBeenNthCalledWith(2, store, 't1', 'c2', true);
      expect(listener).toHaveBeenNthCalledWith(3, store, 't2', 'c1', true);
      expect(listener).toHaveBeenNthCalledWith(4, store, 't2', 'c2', true);
    });

    test('rowIds id (non mutator)', () => {
      store.callListener(store.addRowIdsListener('t1', listener));
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenNthCalledWith(1, store, 't1');
    });

    test('rowIds * (non mutator)', () => {
      store.callListener(store.addRowIdsListener(null, listener));
      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenNthCalledWith(1, store, 't1');
      expect(listener).toHaveBeenNthCalledWith(2, store, 't2');
    });

    test('hasRow id/id (non mutator)', () => {
      store.callListener(store.addHasRowListener('t1', 'r1', listener));
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1', true);
    });

    test('hasRow id/id (mutator)', () => {
      store.callListener(store.addHasRowListener('t1', 'r1', listener, true));
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1', true);
    });

    test('hasRow id/* (non mutator)', () => {
      store.callListener(store.addHasRowListener('t1', null, listener));
      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1', true);
      expect(listener).toHaveBeenNthCalledWith(2, store, 't1', 'r2', true);
    });

    test('hasRow id/* (mutator)', () => {
      store.callListener(store.addHasRowListener('t1', null, listener, true));
      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1', true);
      expect(listener).toHaveBeenNthCalledWith(2, store, 't1', 'r2', true);
    });

    test('hasRow */id (non mutator)', () => {
      store.callListener(store.addHasRowListener(null, 'r1', listener));
      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1', true);
      expect(listener).toHaveBeenNthCalledWith(2, store, 't2', 'r1', true);
    });

    test('hasRow */id (mutator)', () => {
      store.callListener(store.addHasRowListener(null, 'r1', listener, true));
      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1', true);
      expect(listener).toHaveBeenNthCalledWith(2, store, 't2', 'r1', true);
    });

    test('hasRow */* (non mutator)', () => {
      store.callListener(store.addHasRowListener(null, null, listener));
      expect(listener).toHaveBeenCalledTimes(4);
      expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1', true);
      expect(listener).toHaveBeenNthCalledWith(2, store, 't1', 'r2', true);
      expect(listener).toHaveBeenNthCalledWith(3, store, 't2', 'r1', true);
      expect(listener).toHaveBeenNthCalledWith(4, store, 't2', 'r2', true);
    });

    test('hasRow */* (mutator)', () => {
      store.callListener(store.addHasRowListener(null, null, listener, true));
      expect(listener).toHaveBeenCalledTimes(4);
      expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1', true);
      expect(listener).toHaveBeenNthCalledWith(2, store, 't1', 'r2', true);
      expect(listener).toHaveBeenNthCalledWith(3, store, 't2', 'r1', true);
      expect(listener).toHaveBeenNthCalledWith(4, store, 't2', 'r2', true);
    });

    test('row id/id (non mutator)', () => {
      store.callListener(store.addRowListener('t1', 'r1', listener));
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1');
    });

    test('row id/id (mutator)', () => {
      store.callListener(store.addRowListener('t1', 'r1', listener, true));
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1');
    });

    test('row id/* (non mutator)', () => {
      store.callListener(store.addRowListener('t1', null, listener));
      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1');
      expect(listener).toHaveBeenNthCalledWith(2, store, 't1', 'r2');
    });

    test('row id/* (mutator)', () => {
      store.callListener(store.addRowListener('t1', null, listener, true));
      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1');
      expect(listener).toHaveBeenNthCalledWith(2, store, 't1', 'r2');
    });

    test('row */id (non mutator)', () => {
      store.callListener(store.addRowListener(null, 'r1', listener));
      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1');
      expect(listener).toHaveBeenNthCalledWith(2, store, 't2', 'r1');
    });

    test('row */id (mutator)', () => {
      store.callListener(store.addRowListener(null, 'r1', listener, true));
      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1');
      expect(listener).toHaveBeenNthCalledWith(2, store, 't2', 'r1');
    });

    test('row */* (non mutator)', () => {
      store.callListener(store.addRowListener(null, null, listener));
      expect(listener).toHaveBeenCalledTimes(4);
      expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1');
      expect(listener).toHaveBeenNthCalledWith(2, store, 't1', 'r2');
      expect(listener).toHaveBeenNthCalledWith(3, store, 't2', 'r1');
      expect(listener).toHaveBeenNthCalledWith(4, store, 't2', 'r2');
    });

    test('row */* (mutator)', () => {
      store.callListener(store.addRowListener(null, null, listener, true));
      expect(listener).toHaveBeenCalledTimes(4);
      expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1');
      expect(listener).toHaveBeenNthCalledWith(2, store, 't1', 'r2');
      expect(listener).toHaveBeenNthCalledWith(3, store, 't2', 'r1');
      expect(listener).toHaveBeenNthCalledWith(4, store, 't2', 'r2');
    });

    test('cellIds id/id (non mutator)', () => {
      store.callListener(store.addCellIdsListener('t1', 'r1', listener));
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1');
    });

    test('cellIds id/* (non mutator)', () => {
      store.callListener(store.addCellIdsListener('t1', null, listener));
      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1');
      expect(listener).toHaveBeenNthCalledWith(2, store, 't1', 'r2');
    });

    test('cellIds */id (non mutator)', () => {
      store.callListener(store.addCellIdsListener(null, 'r1', listener));
      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1');
      expect(listener).toHaveBeenNthCalledWith(2, store, 't2', 'r1');
    });

    test('cellIds */* (non mutator)', () => {
      store.callListener(store.addCellIdsListener(null, null, listener));
      expect(listener).toHaveBeenCalledTimes(4);
      expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1');
      expect(listener).toHaveBeenNthCalledWith(2, store, 't1', 'r2');
      expect(listener).toHaveBeenNthCalledWith(3, store, 't2', 'r1');
      expect(listener).toHaveBeenNthCalledWith(4, store, 't2', 'r2');
    });

    test('hasCell id/id/id (non mutator)', () => {
      store.callListener(store.addHasCellListener('t1', 'r1', 'c1', listener));
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenNthCalledWith(
        1,
        store,
        't1',
        'r1',
        'c1',
        true,
      );
    });

    test('hasCell id/id/id (mutator)', () => {
      store.callListener(
        store.addHasCellListener('t1', 'r1', 'c1', listener, true),
      );
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenNthCalledWith(
        1,
        store,
        't1',
        'r1',
        'c1',
        true,
      );
    });

    test('hasCell id/id/* (non mutator)', () => {
      store.callListener(store.addHasCellListener('t1', 'r1', null, listener));
      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenNthCalledWith(
        1,
        store,
        't1',
        'r1',
        'c1',
        true,
      );
      expect(listener).toHaveBeenNthCalledWith(
        2,
        store,
        't1',
        'r1',
        'c2',
        true,
      );
    });

    test('hasCell id/id/* (mutator)', () => {
      store.callListener(
        store.addHasCellListener('t1', 'r1', null, listener, true),
      );
      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenNthCalledWith(
        1,
        store,
        't1',
        'r1',
        'c1',
        true,
      );
      expect(listener).toHaveBeenNthCalledWith(
        2,
        store,
        't1',
        'r1',
        'c2',
        true,
      );
    });

    test('hasCell id/*/id (non mutator)', () => {
      store.callListener(store.addHasCellListener('t1', null, 'c1', listener));
      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenNthCalledWith(
        1,
        store,
        't1',
        'r1',
        'c1',
        true,
      );
      expect(listener).toHaveBeenNthCalledWith(
        2,
        store,
        't1',
        'r2',
        'c1',
        true,
      );
    });

    test('hasCell id/*/id (mutator)', () => {
      store.callListener(
        store.addHasCellListener('t1', null, 'c1', listener, true),
      );
      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenNthCalledWith(
        1,
        store,
        't1',
        'r1',
        'c1',
        true,
      );
      expect(listener).toHaveBeenNthCalledWith(
        2,
        store,
        't1',
        'r2',
        'c1',
        true,
      );
    });

    test('hasCell id/*/* (non mutator)', () => {
      store.callListener(store.addHasCellListener('t1', null, null, listener));
      expect(listener).toHaveBeenCalledTimes(4);
      expect(listener).toHaveBeenNthCalledWith(
        1,
        store,
        't1',
        'r1',
        'c1',
        true,
      );
      expect(listener).toHaveBeenNthCalledWith(
        2,
        store,
        't1',
        'r1',
        'c2',
        true,
      );
      expect(listener).toHaveBeenNthCalledWith(
        3,
        store,
        't1',
        'r2',
        'c1',
        true,
      );
      expect(listener).toHaveBeenNthCalledWith(
        4,
        store,
        't1',
        'r2',
        'c2',
        true,
      );
    });

    test('hasCell id/*/* (mutator)', () => {
      store.callListener(
        store.addHasCellListener('t1', null, null, listener, true),
      );
      expect(listener).toHaveBeenCalledTimes(4);
      expect(listener).toHaveBeenNthCalledWith(
        1,
        store,
        't1',
        'r1',
        'c1',
        true,
      );
      expect(listener).toHaveBeenNthCalledWith(
        2,
        store,
        't1',
        'r1',
        'c2',
        true,
      );
      expect(listener).toHaveBeenNthCalledWith(
        3,
        store,
        't1',
        'r2',
        'c1',
        true,
      );
      expect(listener).toHaveBeenNthCalledWith(
        4,
        store,
        't1',
        'r2',
        'c2',
        true,
      );
    });

    test('hasCell */id/id (non mutator)', () => {
      store.callListener(store.addHasCellListener(null, 'r1', 'c1', listener));
      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenNthCalledWith(
        1,
        store,
        't1',
        'r1',
        'c1',
        true,
      );
      expect(listener).toHaveBeenNthCalledWith(
        2,
        store,
        't2',
        'r1',
        'c1',
        true,
      );
    });

    test('hasCell */id/id (mutator)', () => {
      store.callListener(
        store.addHasCellListener(null, 'r1', 'c1', listener, true),
      );
      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenNthCalledWith(
        1,
        store,
        't1',
        'r1',
        'c1',
        true,
      );
      expect(listener).toHaveBeenNthCalledWith(
        2,
        store,
        't2',
        'r1',
        'c1',
        true,
      );
    });

    test('hasCell */id/* (non mutator)', () => {
      store.callListener(store.addHasCellListener(null, 'r1', null, listener));
      expect(listener).toHaveBeenCalledTimes(4);
      expect(listener).toHaveBeenNthCalledWith(
        1,
        store,
        't1',
        'r1',
        'c1',
        true,
      );
      expect(listener).toHaveBeenNthCalledWith(
        2,
        store,
        't1',
        'r1',
        'c2',
        true,
      );
      expect(listener).toHaveBeenNthCalledWith(
        3,
        store,
        't2',
        'r1',
        'c1',
        true,
      );
      expect(listener).toHaveBeenNthCalledWith(
        4,
        store,
        't2',
        'r1',
        'c2',
        true,
      );
    });

    test('hasCell */id/* (mutator)', () => {
      store.callListener(
        store.addHasCellListener(null, 'r1', null, listener, true),
      );
      expect(listener).toHaveBeenCalledTimes(4);
      expect(listener).toHaveBeenNthCalledWith(
        1,
        store,
        't1',
        'r1',
        'c1',
        true,
      );
      expect(listener).toHaveBeenNthCalledWith(
        2,
        store,
        't1',
        'r1',
        'c2',
        true,
      );
      expect(listener).toHaveBeenNthCalledWith(
        3,
        store,
        't2',
        'r1',
        'c1',
        true,
      );
      expect(listener).toHaveBeenNthCalledWith(
        4,
        store,
        't2',
        'r1',
        'c2',
        true,
      );
    });

    test('hasCell */*/id (non mutator)', () => {
      store.callListener(store.addHasCellListener(null, null, 'c1', listener));
      expect(listener).toHaveBeenCalledTimes(4);
      expect(listener).toHaveBeenNthCalledWith(
        1,
        store,
        't1',
        'r1',
        'c1',
        true,
      );
      expect(listener).toHaveBeenNthCalledWith(
        2,
        store,
        't1',
        'r2',
        'c1',
        true,
      );
      expect(listener).toHaveBeenNthCalledWith(
        3,
        store,
        't2',
        'r1',
        'c1',
        true,
      );
      expect(listener).toHaveBeenNthCalledWith(
        4,
        store,
        't2',
        'r2',
        'c1',
        true,
      );
    });

    test('hasCell */*/id (mutator)', () => {
      store.callListener(
        store.addHasCellListener(null, null, 'c1', listener, true),
      );
      expect(listener).toHaveBeenCalledTimes(4);
      expect(listener).toHaveBeenNthCalledWith(
        1,
        store,
        't1',
        'r1',
        'c1',
        true,
      );
      expect(listener).toHaveBeenNthCalledWith(
        2,
        store,
        't1',
        'r2',
        'c1',
        true,
      );
      expect(listener).toHaveBeenNthCalledWith(
        3,
        store,
        't2',
        'r1',
        'c1',
        true,
      );
      expect(listener).toHaveBeenNthCalledWith(
        4,
        store,
        't2',
        'r2',
        'c1',
        true,
      );
    });

    test('hasCell */*/* (non mutator)', () => {
      store.callListener(store.addHasCellListener(null, null, null, listener));
      expect(listener).toHaveBeenCalledTimes(8);
      expect(listener).toHaveBeenNthCalledWith(
        1,
        store,
        't1',
        'r1',
        'c1',
        true,
      );
      expect(listener).toHaveBeenNthCalledWith(
        2,
        store,
        't1',
        'r1',
        'c2',
        true,
      );
      expect(listener).toHaveBeenNthCalledWith(
        3,
        store,
        't1',
        'r2',
        'c1',
        true,
      );
      expect(listener).toHaveBeenNthCalledWith(
        4,
        store,
        't1',
        'r2',
        'c2',
        true,
      );
      expect(listener).toHaveBeenNthCalledWith(
        5,
        store,
        't2',
        'r1',
        'c1',
        true,
      );
      expect(listener).toHaveBeenNthCalledWith(
        6,
        store,
        't2',
        'r1',
        'c2',
        true,
      );
      expect(listener).toHaveBeenNthCalledWith(
        7,
        store,
        't2',
        'r2',
        'c1',
        true,
      );
      expect(listener).toHaveBeenNthCalledWith(
        8,
        store,
        't2',
        'r2',
        'c2',
        true,
      );
    });

    test('hasCell */*/* (mutator)', () => {
      store.callListener(
        store.addHasCellListener(null, null, null, listener, true),
      );
      expect(listener).toHaveBeenCalledTimes(8);
      expect(listener).toHaveBeenNthCalledWith(
        1,
        store,
        't1',
        'r1',
        'c1',
        true,
      );
      expect(listener).toHaveBeenNthCalledWith(
        2,
        store,
        't1',
        'r1',
        'c2',
        true,
      );
      expect(listener).toHaveBeenNthCalledWith(
        3,
        store,
        't1',
        'r2',
        'c1',
        true,
      );
      expect(listener).toHaveBeenNthCalledWith(
        4,
        store,
        't1',
        'r2',
        'c2',
        true,
      );
      expect(listener).toHaveBeenNthCalledWith(
        5,
        store,
        't2',
        'r1',
        'c1',
        true,
      );
      expect(listener).toHaveBeenNthCalledWith(
        6,
        store,
        't2',
        'r1',
        'c2',
        true,
      );
      expect(listener).toHaveBeenNthCalledWith(
        7,
        store,
        't2',
        'r2',
        'c1',
        true,
      );
      expect(listener).toHaveBeenNthCalledWith(
        8,
        store,
        't2',
        'r2',
        'c2',
        true,
      );
    });

    test('cell id/id/id (non mutator)', () => {
      store.callListener(store.addCellListener('t1', 'r1', 'c1', listener));
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenNthCalledWith(
        1,
        store,
        't1',
        'r1',
        'c1',
        1,
        1,
      );
    });

    test('cell id/id/id (mutator)', () => {
      store.callListener(
        store.addCellListener('t1', 'r1', 'c1', listener, true),
      );
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenNthCalledWith(
        1,
        store,
        't1',
        'r1',
        'c1',
        1,
        1,
      );
    });

    test('cell id/id/* (non mutator)', () => {
      store.callListener(store.addCellListener('t1', 'r1', null, listener));
      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenNthCalledWith(
        1,
        store,
        't1',
        'r1',
        'c1',
        1,
        1,
      );
      expect(listener).toHaveBeenNthCalledWith(
        2,
        store,
        't1',
        'r1',
        'c2',
        2,
        2,
      );
    });

    test('cell id/id/* (mutator)', () => {
      store.callListener(
        store.addCellListener('t1', 'r1', null, listener, true),
      );
      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenNthCalledWith(
        1,
        store,
        't1',
        'r1',
        'c1',
        1,
        1,
      );
      expect(listener).toHaveBeenNthCalledWith(
        2,
        store,
        't1',
        'r1',
        'c2',
        2,
        2,
      );
    });

    test('cell id/*/id (non mutator)', () => {
      store.callListener(store.addCellListener('t1', null, 'c1', listener));
      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenNthCalledWith(
        1,
        store,
        't1',
        'r1',
        'c1',
        1,
        1,
      );
      expect(listener).toHaveBeenNthCalledWith(
        2,
        store,
        't1',
        'r2',
        'c1',
        3,
        3,
      );
    });

    test('cell id/*/id (mutator)', () => {
      store.callListener(
        store.addCellListener('t1', null, 'c1', listener, true),
      );
      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenNthCalledWith(
        1,
        store,
        't1',
        'r1',
        'c1',
        1,
        1,
      );
      expect(listener).toHaveBeenNthCalledWith(
        2,
        store,
        't1',
        'r2',
        'c1',
        3,
        3,
      );
    });

    test('cell id/*/* (non mutator)', () => {
      store.callListener(store.addCellListener('t1', null, null, listener));
      expect(listener).toHaveBeenCalledTimes(4);
      expect(listener).toHaveBeenNthCalledWith(
        1,
        store,
        't1',
        'r1',
        'c1',
        1,
        1,
      );
      expect(listener).toHaveBeenNthCalledWith(
        2,
        store,
        't1',
        'r1',
        'c2',
        2,
        2,
      );
      expect(listener).toHaveBeenNthCalledWith(
        3,
        store,
        't1',
        'r2',
        'c1',
        3,
        3,
      );
      expect(listener).toHaveBeenNthCalledWith(
        4,
        store,
        't1',
        'r2',
        'c2',
        4,
        4,
      );
    });

    test('cell id/*/* (mutator)', () => {
      store.callListener(
        store.addCellListener('t1', null, null, listener, true),
      );
      expect(listener).toHaveBeenCalledTimes(4);
      expect(listener).toHaveBeenNthCalledWith(
        1,
        store,
        't1',
        'r1',
        'c1',
        1,
        1,
      );
      expect(listener).toHaveBeenNthCalledWith(
        2,
        store,
        't1',
        'r1',
        'c2',
        2,
        2,
      );
      expect(listener).toHaveBeenNthCalledWith(
        3,
        store,
        't1',
        'r2',
        'c1',
        3,
        3,
      );
      expect(listener).toHaveBeenNthCalledWith(
        4,
        store,
        't1',
        'r2',
        'c2',
        4,
        4,
      );
    });

    test('cell */id/id (non mutator)', () => {
      store.callListener(store.addCellListener(null, 'r1', 'c1', listener));
      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenNthCalledWith(
        1,
        store,
        't1',
        'r1',
        'c1',
        1,
        1,
      );
      expect(listener).toHaveBeenNthCalledWith(
        2,
        store,
        't2',
        'r1',
        'c1',
        5,
        5,
      );
    });

    test('cell */id/id (mutator)', () => {
      store.callListener(
        store.addCellListener(null, 'r1', 'c1', listener, true),
      );
      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenNthCalledWith(
        1,
        store,
        't1',
        'r1',
        'c1',
        1,
        1,
      );
      expect(listener).toHaveBeenNthCalledWith(
        2,
        store,
        't2',
        'r1',
        'c1',
        5,
        5,
      );
    });

    test('cell */id/* (non mutator)', () => {
      store.callListener(store.addCellListener(null, 'r1', null, listener));
      expect(listener).toHaveBeenCalledTimes(4);
      expect(listener).toHaveBeenNthCalledWith(
        1,
        store,
        't1',
        'r1',
        'c1',
        1,
        1,
      );
      expect(listener).toHaveBeenNthCalledWith(
        2,
        store,
        't1',
        'r1',
        'c2',
        2,
        2,
      );
      expect(listener).toHaveBeenNthCalledWith(
        3,
        store,
        't2',
        'r1',
        'c1',
        5,
        5,
      );
      expect(listener).toHaveBeenNthCalledWith(
        4,
        store,
        't2',
        'r1',
        'c2',
        6,
        6,
      );
    });

    test('cell */id/* (mutator)', () => {
      store.callListener(
        store.addCellListener(null, 'r1', null, listener, true),
      );
      expect(listener).toHaveBeenCalledTimes(4);
      expect(listener).toHaveBeenNthCalledWith(
        1,
        store,
        't1',
        'r1',
        'c1',
        1,
        1,
      );
      expect(listener).toHaveBeenNthCalledWith(
        2,
        store,
        't1',
        'r1',
        'c2',
        2,
        2,
      );
      expect(listener).toHaveBeenNthCalledWith(
        3,
        store,
        't2',
        'r1',
        'c1',
        5,
        5,
      );
      expect(listener).toHaveBeenNthCalledWith(
        4,
        store,
        't2',
        'r1',
        'c2',
        6,
        6,
      );
    });

    test('cell */*/id (non mutator)', () => {
      store.callListener(store.addCellListener(null, null, 'c1', listener));
      expect(listener).toHaveBeenCalledTimes(4);
      expect(listener).toHaveBeenNthCalledWith(
        1,
        store,
        't1',
        'r1',
        'c1',
        1,
        1,
      );
      expect(listener).toHaveBeenNthCalledWith(
        2,
        store,
        't1',
        'r2',
        'c1',
        3,
        3,
      );
      expect(listener).toHaveBeenNthCalledWith(
        3,
        store,
        't2',
        'r1',
        'c1',
        5,
        5,
      );
      expect(listener).toHaveBeenNthCalledWith(
        4,
        store,
        't2',
        'r2',
        'c1',
        7,
        7,
      );
    });

    test('cell */*/id (mutator)', () => {
      store.callListener(
        store.addCellListener(null, null, 'c1', listener, true),
      );
      expect(listener).toHaveBeenCalledTimes(4);
      expect(listener).toHaveBeenNthCalledWith(
        1,
        store,
        't1',
        'r1',
        'c1',
        1,
        1,
      );
      expect(listener).toHaveBeenNthCalledWith(
        2,
        store,
        't1',
        'r2',
        'c1',
        3,
        3,
      );
      expect(listener).toHaveBeenNthCalledWith(
        3,
        store,
        't2',
        'r1',
        'c1',
        5,
        5,
      );
      expect(listener).toHaveBeenNthCalledWith(
        4,
        store,
        't2',
        'r2',
        'c1',
        7,
        7,
      );
    });

    test('cell */*/* (non mutator)', () => {
      store.callListener(store.addCellListener(null, null, null, listener));
      expect(listener).toHaveBeenCalledTimes(8);
      expect(listener).toHaveBeenNthCalledWith(
        1,
        store,
        't1',
        'r1',
        'c1',
        1,
        1,
      );
      expect(listener).toHaveBeenNthCalledWith(
        2,
        store,
        't1',
        'r1',
        'c2',
        2,
        2,
      );
      expect(listener).toHaveBeenNthCalledWith(
        3,
        store,
        't1',
        'r2',
        'c1',
        3,
        3,
      );
      expect(listener).toHaveBeenNthCalledWith(
        4,
        store,
        't1',
        'r2',
        'c2',
        4,
        4,
      );
      expect(listener).toHaveBeenNthCalledWith(
        5,
        store,
        't2',
        'r1',
        'c1',
        5,
        5,
      );
      expect(listener).toHaveBeenNthCalledWith(
        6,
        store,
        't2',
        'r1',
        'c2',
        6,
        6,
      );
      expect(listener).toHaveBeenNthCalledWith(
        7,
        store,
        't2',
        'r2',
        'c1',
        7,
        7,
      );
      expect(listener).toHaveBeenNthCalledWith(
        8,
        store,
        't2',
        'r2',
        'c2',
        8,
        8,
      );
    });

    test('cell */*/* (mutator)', () => {
      store.callListener(
        store.addCellListener(null, null, null, listener, true),
      );
      expect(listener).toHaveBeenCalledTimes(8);
      expect(listener).toHaveBeenNthCalledWith(
        1,
        store,
        't1',
        'r1',
        'c1',
        1,
        1,
      );
      expect(listener).toHaveBeenNthCalledWith(
        2,
        store,
        't1',
        'r1',
        'c2',
        2,
        2,
      );
      expect(listener).toHaveBeenNthCalledWith(
        3,
        store,
        't1',
        'r2',
        'c1',
        3,
        3,
      );
      expect(listener).toHaveBeenNthCalledWith(
        4,
        store,
        't1',
        'r2',
        'c2',
        4,
        4,
      );
      expect(listener).toHaveBeenNthCalledWith(
        5,
        store,
        't2',
        'r1',
        'c1',
        5,
        5,
      );
      expect(listener).toHaveBeenNthCalledWith(
        6,
        store,
        't2',
        'r1',
        'c2',
        6,
        6,
      );
      expect(listener).toHaveBeenNthCalledWith(
        7,
        store,
        't2',
        'r2',
        'c1',
        7,
        7,
      );
      expect(listener).toHaveBeenNthCalledWith(
        8,
        store,
        't2',
        'r2',
        'c2',
        8,
        8,
      );
    });

    test('invalid cell */*/* (non mutator)', () => {
      store.callListener(
        store.addInvalidCellListener(null, null, null, listener),
      );
      expect(listener).toHaveBeenCalledTimes(0);
    });

    test('invalid cell */*/* (mutator)', () => {
      store.callListener(
        store.addInvalidCellListener(null, null, null, listener, true),
      );
      expect(listener).toHaveBeenCalledTimes(0);
    });

    test('hasValues (non mutator)', () => {
      store.callListener(store.addHasValuesListener(listener));
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenNthCalledWith(1, store, true);
    });

    test('hasValues (mutator)', () => {
      store.callListener(store.addHasValuesListener(listener, true));
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenNthCalledWith(1, store, true);
    });

    test('values (non mutator)', () => {
      store.callListener(store.addValuesListener(listener));
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenNthCalledWith(1, store);
    });

    test('values (mutator)', () => {
      store.callListener(store.addValuesListener(listener, true));
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenNthCalledWith(1, store);
    });

    test('valueIds (non mutator)', () => {
      store.callListener(store.addValueIdsListener(listener));
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenNthCalledWith(1, store);
    });

    test('valueIds (mutator)', () => {
      store.callListener(store.addValueIdsListener(listener, true));
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenNthCalledWith(1, store);
    });

    test('valueId (non mutator)', () => {
      store.callListener(store.addValueListener('v1', listener));
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenNthCalledWith(1, store, 'v1', 1, 1);
    });

    test('valueId (mutator)', () => {
      store.callListener(store.addValueListener('v1', listener, true));
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenNthCalledWith(1, store, 'v1', 1, 1);
    });

    test('hasValue (non mutator)', () => {
      store.callListener(store.addHasValueListener('v1', listener));
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenNthCalledWith(1, store, 'v1', true);
    });

    test('hasValue (mutator)', () => {
      store.callListener(store.addHasValueListener('v1', listener, true));
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenNthCalledWith(1, store, 'v1', true);
    });

    test('value * (non mutator)', () => {
      store.callListener(store.addValueListener(null, listener));
      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenNthCalledWith(1, store, 'v1', 1, 1);
      expect(listener).toHaveBeenNthCalledWith(2, store, 'v2', 2, 2);
    });

    test('value * (mutator)', () => {
      store.callListener(store.addValueListener(null, listener, true));
      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenNthCalledWith(1, store, 'v1', 1, 1);
      expect(listener).toHaveBeenNthCalledWith(2, store, 'v2', 2, 2);
    });

    test('invalid value * (non mutator)', () => {
      store.callListener(store.addInvalidValueListener(null, listener));
      expect(listener).toHaveBeenCalledTimes(0);
    });

    test('invalid value * (mutator)', () => {
      store.callListener(store.addInvalidValueListener(null, listener, true));
      expect(listener).toHaveBeenCalledTimes(0);
    });

    test('willFinishTransaction', () => {
      store.callListener(store.addWillFinishTransactionListener(listener));
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenNthCalledWith(1, store);
    });

    test('didFinishTransaction (mutator)', () => {
      store.callListener(store.addDidFinishTransactionListener(listener));
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenNthCalledWith(1, store);
    });
  });
});
