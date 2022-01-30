/* eslint-disable @typescript-eslint/ban-ts-comment */
import {Cell, Id, IdOrNull, Store, createStore} from '../../lib/debug/tinybase';
import {
  StoreListener,
  createStoreListener,
  expectChanges,
  expectNoChanges,
} from './common';

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

// Note that these tests run in order to mutate the store in a sequence.
describe('Listeners', () => {
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
      expectChanges(listener, '/t', ['t1']);
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
      expectChanges(listener, '/t', ['t2']);
      expectNoChanges(listener);
    });

    test('reset 2', () => {
      store.delTables();
      expectChanges(listener, '/t', []);
      expectNoChanges(listener);
    });

    test('setTable', () => {
      store.setTable('t1', {r1: {c1: 1}});
      expectChanges(listener, '/t', ['t1']);
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
      expectChanges(listener, '/t', ['t1', 't2']);
      expectNoChanges(listener);
    });

    test('reset 3', () => {
      store.delTables();
      expectChanges(listener, '/t', []);
      expectNoChanges(listener);
    });

    test('setRow', () => {
      store.setRow('t1', 'r1', {c1: 1});
      expectChanges(listener, '/t', ['t1']);
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
      expectChanges(listener, '/t', ['t1', 't2']);
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
      expectChanges(listener, '/t', []);
      expectNoChanges(listener);
    });

    test('setCell', () => {
      store.setCell('t1', 'r1', 'c1', 1);
      expectChanges(listener, '/t', ['t1']);
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
      expectChanges(listener, '/t', ['t1', 't2']);
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
      expectChanges(listener, '/t', ['t1', 't2', 't3', 't4']);
      expectNoChanges(listener);
    });

    test('delCell', () => {
      store.delCell('t1', 'r1', 'c2');
      expectNoChanges(listener);
    });

    test('delCell, cascade', () => {
      store.delCell('t2', 'r1', 'c1');
      expectChanges(listener, '/t', ['t1', 't3', 't4']);
      expectNoChanges(listener);
    });

    test('delRow', () => {
      store.delRow('t1', 'r2');
      expectNoChanges(listener);
    });

    test('delRow, cascade', () => {
      store.delRow('t1', 'r1');
      expectChanges(listener, '/t', ['t3', 't4']);
      expectNoChanges(listener);
    });

    test('delTable', () => {
      store.delTable('t3');
      expectChanges(listener, '/t', ['t4']);
      expectNoChanges(listener);
    });

    test('delTables', () => {
      store.delTables();
      expectChanges(listener, '/t', []);
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
      expectChanges(listener, '/t*', {t3: {r1: {c1: 1}}}, {t4: {r1: {c1: 1}}});
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
      expectChanges(listener, '/t1r', {t1: ['r1']});
      expectChanges(listener, '/t*r', {t1: ['r1']});
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
      expectChanges(listener, '/t1r', {t1: ['r2']});
      expectChanges(listener, '/t*r', {t1: ['r2']});
      expectNoChanges(listener);
    });

    test('setTables, different table', () => {
      store.setTables({t2: {r1: {c1: 1}}});
      expectChanges(listener, '/t1r', {t1: []});
      expectChanges(listener, '/t2r', {t2: ['r1']});
      expectChanges(listener, '/t*r', {t2: ['r1']}, {t1: []});
      expectNoChanges(listener);
    });

    test('reset 2', () => {
      store.delTables();
      expectChanges(listener, '/t2r', {t2: []});
      expectChanges(listener, '/t*r', {t2: []});
      expectNoChanges(listener);
    });

    test('setTable', () => {
      store.setTable('t1', {r1: {c1: 1}});
      expectChanges(listener, '/t1r', {t1: ['r1']});
      expectChanges(listener, '/t*r', {t1: ['r1']});
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
      expectChanges(listener, '/t1r', {t1: ['r2']});
      expectChanges(listener, '/t*r', {t1: ['r2']});
      expectNoChanges(listener);
    });

    test('setTable, different table', () => {
      store.setTable('t2', {r1: {c1: 1}});
      expectChanges(listener, '/t2r', {t2: ['r1']});
      expectChanges(listener, '/t*r', {t2: ['r1']});
      expectNoChanges(listener);
    });

    test('reset 3', () => {
      store.delTables();
      expectChanges(listener, '/t1r', {t1: []});
      expectChanges(listener, '/t2r', {t2: []});
      expectChanges(listener, '/t*r', {t1: []}, {t2: []});
      expectNoChanges(listener);
    });

    test('setRow', () => {
      store.setRow('t1', 'r1', {c1: 1});
      expectChanges(listener, '/t1r', {t1: ['r1']});
      expectChanges(listener, '/t*r', {t1: ['r1']});
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
      expectChanges(listener, '/t1r', {t1: ['r1', 'r2']});
      expectChanges(listener, '/t*r', {t1: ['r1', 'r2']});
      expectNoChanges(listener);
    });

    test('setRow, different table', () => {
      store.setRow('t2', 'r1', {c1: 1});
      expectChanges(listener, '/t2r', {t2: ['r1']});
      expectChanges(listener, '/t*r', {t2: ['r1']});
      expectNoChanges(listener);
    });

    test('addRow', () => {
      store.addRow('t2', {c1: 1});
      expectChanges(listener, '/t2r', {t2: ['r1', '0']});
      expectChanges(listener, '/t*r', {t2: ['r1', '0']});
      expectNoChanges(listener);
    });

    test('addRow, over existing row', () => {
      store.transaction(() =>
        store.setRow('t2', '1', {c1: 1}).addRow('t2', {c1: 1}),
      );
      expectChanges(listener, '/t2r', {t2: ['r1', '0', '1', '2']});
      expectChanges(listener, '/t*r', {t2: ['r1', '0', '1', '2']});
      expectNoChanges(listener);
    });

    test('setPartialRow', () => {
      // @ts-ignore
      store.setPartialRow('t1', 'r1', {c1: 1, c2: 3, c3: undefined});
      expectNoChanges(listener);
    });

    test('reset 4', () => {
      store.delTables();
      expectChanges(listener, '/t1r', {t1: []});
      expectChanges(listener, '/t2r', {t2: []});
      expectChanges(listener, '/t*r', {t1: []}, {t2: []});
      expectNoChanges(listener);
    });

    test('setCell', () => {
      store.setCell('t1', 'r1', 'c1', 1);
      expectChanges(listener, '/t1r', {t1: ['r1']});
      expectChanges(listener, '/t*r', {t1: ['r1']});
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
      expectChanges(listener, '/t1r', {t1: ['r1', 'r2']});
      expectChanges(listener, '/t*r', {t1: ['r1', 'r2']});
      expectNoChanges(listener);
    });

    test('setCell, different table', () => {
      store.setCell('t2', 'r1', 'c1', 1);
      expectChanges(listener, '/t2r', {t2: ['r1']});
      expectChanges(listener, '/t*r', {t2: ['r1']});
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
      expectChanges(listener, '/t3r', {t3: ['r1']});
      expectChanges(listener, '/t4r', {t4: ['r1']});
      expectChanges(listener, '/t*r', {t3: ['r1']}, {t4: ['r1']});
      expectNoChanges(listener);
    });

    test('delCell', () => {
      store.delCell('t1', 'r1', 'c2');
      expectNoChanges(listener);
    });

    test('delCell, cascade', () => {
      store.delCell('t2', 'r1', 'c1');
      expectChanges(listener, '/t2r', {t2: []});
      expectChanges(listener, '/t*r', {t2: []});
      expectNoChanges(listener);
    });

    test('delRow', () => {
      store.delRow('t1', 'r2');
      expectChanges(listener, '/t1r', {t1: ['r1']});
      expectChanges(listener, '/t*r', {t1: ['r1']});
      expectNoChanges(listener);
    });

    test('delRow, cascade', () => {
      store.delRow('t1', 'r1');
      expectChanges(listener, '/t1r', {t1: []});
      expectChanges(listener, '/t*r', {t1: []});
      expectNoChanges(listener);
    });

    test('delTable', () => {
      store.delTable('t3');
      expectChanges(listener, '/t3r', {t3: []});
      expectChanges(listener, '/t*r', {t3: []});
      expectNoChanges(listener);
    });

    test('delTables', () => {
      store.delTables();
      expectChanges(listener, '/t4r', {t4: []});
      expectChanges(listener, '/t*r', {t4: []});
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
      expectChanges(listener, '/t*/r*', {t2: {1: {c1: 1}}}, {t2: {2: {c1: 1}}});
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
      expectChanges(listener, '/t1/r1c', {t1: {r1: ['c1']}});
      expectChanges(listener, '/t1/r*c', {t1: {r1: ['c1']}});
      expectChanges(listener, '/t*/r1c', {t1: {r1: ['c1']}});
      expectChanges(listener, '/t*/r*c', {t1: {r1: ['c1']}});
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
      expectChanges(listener, '/t1/r1c', {t1: {r1: ['c2']}});
      expectChanges(listener, '/t1/r*c', {t1: {r1: ['c2']}});
      expectChanges(listener, '/t*/r1c', {t1: {r1: ['c2']}});
      expectChanges(listener, '/t*/r*c', {t1: {r1: ['c2']}});
      expectNoChanges(listener);
    });

    test('setTables, same table, different row', () => {
      store.setTables({t1: {r2: {c1: 1}}});
      expectChanges(listener, '/t1/r1c', {t1: {r1: []}});
      expectChanges(listener, '/t1/r2c', {t1: {r2: ['c1']}});
      expectChanges(listener, '/t1/r*c', {t1: {r2: ['c1']}}, {t1: {r1: []}});
      expectChanges(listener, '/t*/r1c', {t1: {r1: []}});
      expectChanges(listener, '/t*/r*c', {t1: {r2: ['c1']}}, {t1: {r1: []}});
    });

    test('setTables, different table', () => {
      store.setTables({t2: {r1: {c1: 1}}});
      expectChanges(listener, '/t1/r2c', {t1: {r2: []}});
      expectChanges(listener, '/t1/r*c', {t1: {r2: []}});
      expectChanges(listener, '/t*/r1c', {t2: {r1: ['c1']}});
      expectChanges(listener, '/t*/r*c', {t2: {r1: ['c1']}}, {t1: {r2: []}});
      expectNoChanges(listener);
    });

    test('reset 2', () => {
      store.delTables();
      expectChanges(listener, '/t*/r1c', {t2: {r1: []}});
      expectChanges(listener, '/t*/r*c', {t2: {r1: []}});
      expectNoChanges(listener);
    });

    test('setTable', () => {
      store.setTable('t1', {r1: {c1: 1}});
      expectChanges(listener, '/t1/r1c', {t1: {r1: ['c1']}});
      expectChanges(listener, '/t1/r*c', {t1: {r1: ['c1']}});
      expectChanges(listener, '/t*/r1c', {t1: {r1: ['c1']}});
      expectChanges(listener, '/t*/r*c', {t1: {r1: ['c1']}});
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
      expectChanges(listener, '/t1/r1c', {t1: {r1: ['c2']}});
      expectChanges(listener, '/t1/r*c', {t1: {r1: ['c2']}});
      expectChanges(listener, '/t*/r1c', {t1: {r1: ['c2']}});
      expectChanges(listener, '/t*/r*c', {t1: {r1: ['c2']}});
      expectNoChanges(listener);
    });

    test('setTable, same table, different row', () => {
      store.setTable('t1', {r2: {c1: 1}});
      expectChanges(listener, '/t1/r1c', {t1: {r1: []}});
      expectChanges(listener, '/t1/r2c', {t1: {r2: ['c1']}});
      expectChanges(listener, '/t1/r*c', {t1: {r2: ['c1']}}, {t1: {r1: []}});
      expectChanges(listener, '/t*/r1c', {t1: {r1: []}});
      expectChanges(listener, '/t*/r*c', {t1: {r2: ['c1']}}, {t1: {r1: []}});
      expectNoChanges(listener);
    });

    test('setTable, different table', () => {
      store.setTable('t2', {r1: {c1: 1}});
      expectChanges(listener, '/t*/r1c', {t2: {r1: ['c1']}});
      expectChanges(listener, '/t*/r*c', {t2: {r1: ['c1']}});
      expectNoChanges(listener);
    });

    test('reset 3', () => {
      store.delTables();
      expectChanges(listener, '/t1/r2c', {t1: {r2: []}});
      expectChanges(listener, '/t1/r*c', {t1: {r2: []}});
      expectChanges(listener, '/t*/r1c', {t2: {r1: []}});
      expectChanges(listener, '/t*/r*c', {t1: {r2: []}}, {t2: {r1: []}});
      expectNoChanges(listener);
    });

    test('setRow', () => {
      store.setRow('t1', 'r1', {c1: 1});
      expectChanges(listener, '/t1/r1c', {t1: {r1: ['c1']}});
      expectChanges(listener, '/t1/r*c', {t1: {r1: ['c1']}});
      expectChanges(listener, '/t*/r1c', {t1: {r1: ['c1']}});
      expectChanges(listener, '/t*/r*c', {t1: {r1: ['c1']}});
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
      expectChanges(listener, '/t1/r1c', {t1: {r1: ['c2']}});
      expectChanges(listener, '/t1/r*c', {t1: {r1: ['c2']}});
      expectChanges(listener, '/t*/r1c', {t1: {r1: ['c2']}});
      expectChanges(listener, '/t*/r*c', {t1: {r1: ['c2']}});
      expectNoChanges(listener);
    });

    test('setRow, same table, different row', () => {
      store.setRow('t1', 'r2', {c1: 1});
      expectChanges(listener, '/t1/r2c', {t1: {r2: ['c1']}});
      expectChanges(listener, '/t1/r*c', {t1: {r2: ['c1']}});
      expectChanges(listener, '/t*/r*c', {t1: {r2: ['c1']}});
      expectNoChanges(listener);
    });

    test('setRow, different table', () => {
      store.setRow('t2', 'r1', {c1: 1});
      expectChanges(listener, '/t*/r1c', {t2: {r1: ['c1']}});
      expectChanges(listener, '/t*/r*c', {t2: {r1: ['c1']}});
      expectNoChanges(listener);
    });

    test('addRow', () => {
      store.addRow('t2', {c1: 1});
      expectChanges(listener, '/t*/r*c', {t2: {0: ['c1']}});
      expectNoChanges(listener);
    });

    test('addRow, over existing row', () => {
      store.transaction(() =>
        store.setRow('t2', '1', {c1: 1}).addRow('t2', {c1: 1}),
      );
      expectChanges(listener, '/t*/r*c', {t2: {1: ['c1']}}, {t2: {2: ['c1']}});
      expectNoChanges(listener);
    });

    test('setPartialRow', () => {
      // @ts-ignore
      store.setPartialRow('t1', 'r1', {c1: 1, c2: 3, c3: undefined});
      expectChanges(listener, '/t1/r1c', {t1: {r1: ['c2', 'c1']}});
      expectChanges(listener, '/t1/r*c', {t1: {r1: ['c2', 'c1']}});
      expectChanges(listener, '/t*/r1c', {t1: {r1: ['c2', 'c1']}});
      expectChanges(listener, '/t*/r*c', {t1: {r1: ['c2', 'c1']}});
      expectNoChanges(listener);
    });

    test('reset 4', () => {
      store.delTables();
      expectChanges(listener, '/t1/r1c', {t1: {r1: []}});
      expectChanges(listener, '/t1/r2c', {t1: {r2: []}});
      expectChanges(listener, '/t1/r*c', {t1: {r1: []}}, {t1: {r2: []}});
      expectChanges(listener, '/t*/r1c', {t1: {r1: []}}, {t2: {r1: []}});
      expectChanges(
        listener,
        '/t*/r*c',
        {t1: {r1: []}},
        {t1: {r2: []}},
        {t2: {r1: []}},
        {t2: {0: []}},
        {t2: {1: []}},
        {t2: {2: []}},
      );
      expectNoChanges(listener);
    });

    test('setCell', () => {
      store.setCell('t1', 'r1', 'c1', 1);
      expectChanges(listener, '/t1/r1c', {t1: {r1: ['c1']}});
      expectChanges(listener, '/t1/r*c', {t1: {r1: ['c1']}});
      expectChanges(listener, '/t*/r1c', {t1: {r1: ['c1']}});
      expectChanges(listener, '/t*/r*c', {t1: {r1: ['c1']}});
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
      expectChanges(listener, '/t1/r1c', {t1: {r1: ['c1', 'c2']}});
      expectChanges(listener, '/t1/r*c', {t1: {r1: ['c1', 'c2']}});
      expectChanges(listener, '/t*/r1c', {t1: {r1: ['c1', 'c2']}});
      expectChanges(listener, '/t*/r*c', {t1: {r1: ['c1', 'c2']}});
      expectNoChanges(listener);
    });

    test('setCell, same table, different row', () => {
      store.setCell('t1', 'r2', 'c1', 1);
      expectChanges(listener, '/t1/r2c', {t1: {r2: ['c1']}});
      expectChanges(listener, '/t1/r*c', {t1: {r2: ['c1']}});
      expectChanges(listener, '/t*/r*c', {t1: {r2: ['c1']}});
      expectNoChanges(listener);
    });

    test('setCell, different table', () => {
      store.setCell('t2', 'r1', 'c1', 1);
      expectChanges(listener, '/t*/r1c', {t2: {r1: ['c1']}});
      expectChanges(listener, '/t*/r*c', {t2: {r1: ['c1']}});
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
        {t3: {r1: ['c1']}},
        {t4: {r1: ['c1']}},
      );
      expectChanges(
        listener,
        '/t*/r*c',
        {t3: {r1: ['c1']}},
        {t4: {r1: ['c1']}},
      );
      expectNoChanges(listener);
    });

    test('delCell', () => {
      store.delCell('t1', 'r1', 'c2');
      expectChanges(listener, '/t1/r1c', {t1: {r1: ['c1']}});
      expectChanges(listener, '/t1/r*c', {t1: {r1: ['c1']}});
      expectChanges(listener, '/t*/r1c', {t1: {r1: ['c1']}});
      expectChanges(listener, '/t*/r*c', {t1: {r1: ['c1']}});
      expectNoChanges(listener);
    });

    test('delCell, cascade', () => {
      store.delCell('t2', 'r1', 'c1');
      expectChanges(listener, '/t*/r1c', {t2: {r1: []}});
      expectChanges(listener, '/t*/r*c', {t2: {r1: []}});
      expectNoChanges(listener);
    });

    test('delRow', () => {
      store.delRow('t1', 'r2');
      expectChanges(listener, '/t1/r2c', {t1: {r2: []}});
      expectChanges(listener, '/t1/r*c', {t1: {r2: []}});
      expectChanges(listener, '/t*/r*c', {t1: {r2: []}});
      expectNoChanges(listener);
    });

    test('delRow, cascade', () => {
      store.delRow('t1', 'r1');
      expectChanges(listener, '/t1/r1c', {t1: {r1: []}});
      expectChanges(listener, '/t1/r*c', {t1: {r1: []}});
      expectChanges(listener, '/t*/r1c', {t1: {r1: []}});
      expectChanges(listener, '/t*/r*c', {t1: {r1: []}});
      expectNoChanges(listener);
    });

    test('delTable', () => {
      store.delTable('t3');
      expectChanges(listener, '/t*/r1c', {t3: {r1: []}});
      expectChanges(listener, '/t*/r*c', {t3: {r1: []}});
      expectNoChanges(listener);
    });

    test('delTables', () => {
      store.delTables();
      expectChanges(listener, '/t*/r1c', {t4: {r1: []}});
      expectChanges(listener, '/t*/r*c', {t4: {r1: []}});
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
        {t2: {2: {c2: undefined}}},
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
    beforeAll(() => {
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

    test('addRow', () => {
      // @ts-ignore
      store.addRow('t2', {c1: []});
      expectChanges(listener, 'i:/t*/r*/c1', {t2: {undefined: {c1: [[]]}}});
      expectChanges(listener, 'i:/t*/r*/c*', {t2: {undefined: {c1: [[]]}}});
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
});

describe('Mutating listeners', () => {
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
      expectChanges(listener, '/t', ['t1', 't0']);
      expectNoChanges(listener);
    });

    test('setTable', () => {
      setMutatorListener();
      store.setTable('t1', {r1: {c1: 1}});
      expectChanges(listener, '/t', ['t1', 't0']);
      expectNoChanges(listener);
    });

    test('setRow', () => {
      setMutatorListener();
      store.setRow('t1', 'r1', {c1: 1});
      expectChanges(listener, '/t', ['t1', 't0']);
      expectNoChanges(listener);
    });

    test('addRow', () => {
      setMutatorListener();
      store.addRow('t1', {c1: 1});
      expectChanges(listener, '/t', ['t1', 't0']);
      expectNoChanges(listener);
    });

    test('setPartialRow', () => {
      store.setTables({t1: {r1: {c1: 1}}});
      expectChanges(listener, '/t', ['t1']);
      setMutatorListener();
      // @ts-ignore
      store.setPartialRow('t1', 'r1', {c1: 1, c2: 1, c3: undefined});
      expectNoChanges(listener);
    });

    test('setCell', () => {
      setMutatorListener();
      store.setCell('t1', 'r1', 'c1', 1);
      expectChanges(listener, '/t', ['t1', 't0']);
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
      expectChanges(listener, '/t1r', {t1: ['r1', 'r0']});
      expectChanges(listener, '/t*r', {t1: ['r1', 'r0']}, {t_: ['r0']});
      expectNoChanges(listener);
    });

    test('setTable', () => {
      setMutatorListeners();
      store.setTable('t1', {r1: {c1: 1}});
      expectChanges(listener, '/t1r', {t1: ['r1', 'r0']});
      expectChanges(listener, '/t*r', {t1: ['r1', 'r0']}, {t_: ['r0']});
      expectNoChanges(listener);
    });

    test('setRow', () => {
      setMutatorListeners();
      store.setRow('t1', 'r1', {c1: 1});
      expectChanges(listener, '/t1r', {t1: ['r1', 'r0']});
      expectChanges(listener, '/t*r', {t1: ['r1', 'r0']}, {t_: ['r0']});
      expectNoChanges(listener);
    });

    test('addRow', () => {
      setMutatorListeners();
      store.addRow('t1', {c1: 1});
      expectChanges(listener, '/t1r', {t1: ['0', 'r0']});
      expectChanges(listener, '/t*r', {t1: ['0', 'r0']}, {t_: ['r0']});
      expectNoChanges(listener);
    });

    test('setPartialRow', () => {
      store.setTables({t1: {r1: {c1: 1}}});
      expectChanges(listener, '/t1r', {t1: ['r1']});
      expectChanges(listener, '/t*r', {t1: ['r1']});
      setMutatorListeners();
      // @ts-ignore
      store.setPartialRow('t1', 'r1', {c1: 1, c2: 1, c3: undefined});
      expectNoChanges(listener);
    });

    test('setCell', () => {
      setMutatorListeners();
      store.setCell('t1', 'r1', 'c1', 1);
      expectChanges(listener, '/t1r', {t1: ['r1', 'r0']});
      expectChanges(listener, '/t*r', {t1: ['r1', 'r0']}, {t_: ['r0']});
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
      store.addCellIdsListener('t1', null, getRowMutator(3, null, 'r_'), true);
      store.addCellIdsListener(null, 'r1', getRowMutator(4, 't_'), true);
      store.addCellIdsListener(null, null, getRowMutator(5, 't_', 'r_'), true);
    };

    test('setTables', () => {
      setMutatorListeners();
      store.setTables({t1: {r1: {c1: 1}}});
      expectChanges(listener, '/t1/r1c', {t1: {r1: ['c1', 'c0']}});
      expectChanges(
        listener,
        '/t1/r*c',
        {t1: {r1: ['c1', 'c0']}},
        {t1: {r_: ['c0']}},
      );
      expectChanges(
        listener,
        '/t*/r1c',
        {t1: {r1: ['c1', 'c0']}},
        {t_: {r1: ['c0']}},
      );
      expectChanges(
        listener,
        '/t*/r*c',
        {t1: {r1: ['c1', 'c0']}},
        {t1: {r_: ['c0']}},
        {t_: {r1: ['c0']}},
        {t_: {r_: ['c0']}},
      );
      expectNoChanges(listener);
    });

    test('setTable', () => {
      setMutatorListeners();
      store.setTable('t1', {r1: {c1: 1}});
      expectChanges(listener, '/t1/r1c', {t1: {r1: ['c1', 'c0']}});
      expectChanges(
        listener,
        '/t1/r*c',
        {t1: {r1: ['c1', 'c0']}},
        {t1: {r_: ['c0']}},
      );
      expectChanges(
        listener,
        '/t*/r1c',
        {t1: {r1: ['c1', 'c0']}},
        {t_: {r1: ['c0']}},
      );
      expectChanges(
        listener,
        '/t*/r*c',
        {t1: {r1: ['c1', 'c0']}},
        {t1: {r_: ['c0']}},
        {t_: {r1: ['c0']}},
        {t_: {r_: ['c0']}},
      );
      expectNoChanges(listener);
    });

    test('setRow', () => {
      setMutatorListeners();
      store.setRow('t1', 'r1', {c1: 1});
      expectChanges(listener, '/t1/r1c', {t1: {r1: ['c1', 'c0']}});
      expectChanges(
        listener,
        '/t1/r*c',
        {t1: {r1: ['c1', 'c0']}},
        {t1: {r_: ['c0']}},
      );
      expectChanges(
        listener,
        '/t*/r1c',
        {t1: {r1: ['c1', 'c0']}},
        {t_: {r1: ['c0']}},
      );
      expectChanges(
        listener,
        '/t*/r*c',
        {t1: {r1: ['c1', 'c0']}},
        {t1: {r_: ['c0']}},
        {t_: {r1: ['c0']}},
        {t_: {r_: ['c0']}},
      );
      expectNoChanges(listener);
    });

    test('addRow', () => {
      setMutatorListeners();
      store.addRow('t1', {c1: 1});
      expectChanges(listener, '/t1/r*c', {t1: {0: ['c1']}}, {t1: {r_: ['c0']}});
      expectChanges(
        listener,
        '/t*/r*c',
        {t1: {0: ['c1']}},
        {t1: {r_: ['c0']}},
        {t_: {r_: ['c0']}},
      );
      expectNoChanges(listener);
    });

    test('setPartialRow', () => {
      store.setTables({t1: {r1: {c1: 1}}});
      expectChanges(listener, '/t1/r1c', {t1: {r1: ['c1']}});
      expectChanges(listener, '/t1/r*c', {t1: {r1: ['c1']}});
      expectChanges(listener, '/t*/r1c', {t1: {r1: ['c1']}});
      expectChanges(listener, '/t*/r*c', {t1: {r1: ['c1']}});
      setMutatorListeners();
      // @ts-ignore
      store.setPartialRow('t1', 'r1', {c1: 1, c2: 1, c3: undefined});
      expectChanges(listener, '/t1/r1c', {t1: {r1: ['c1', 'c2', 'c0']}});
      expectChanges(
        listener,
        '/t1/r*c',
        {t1: {r1: ['c1', 'c2', 'c0']}},
        {t1: {r_: ['c0']}},
      );
      expectChanges(
        listener,
        '/t*/r1c',
        {t1: {r1: ['c1', 'c2', 'c0']}},
        {t_: {r1: ['c0']}},
      );
      expectChanges(
        listener,
        '/t*/r*c',
        {t1: {r1: ['c1', 'c2', 'c0']}},
        {t1: {r_: ['c0']}},
        {t_: {r1: ['c0']}},
        {t_: {r_: ['c0']}},
      );
      expectNoChanges(listener);
    });

    test('setCell', () => {
      setMutatorListeners();
      store.setCell('t1', 'r1', 'c1', 1);
      expectChanges(listener, '/t1/r1c', {t1: {r1: ['c1', 'c0']}});
      expectChanges(
        listener,
        '/t1/r*c',
        {t1: {r1: ['c1', 'c0']}},
        {t1: {r_: ['c0']}},
      );
      expectChanges(
        listener,
        '/t*/r1c',
        {t1: {r1: ['c1', 'c0']}},
        {t_: {r1: ['c0']}},
      );
      expectChanges(
        listener,
        '/t*/r*c',
        {t1: {r1: ['c1', 'c0']}},
        {t1: {r_: ['c0']}},
        {t_: {r1: ['c0']}},
        {t_: {r_: ['c0']}},
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
      // @ts-ignore
      store.addInvalidCellListener('t1', 'r1', 'c1', getCellMutator([2]), true);
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

      test('cell mutation', () => {
        store.addCellListener(
          't1',
          'r1',
          'c1',
          () => store.setCell('t2', 'r2', 'c2', 2),
          true,
        );
        store.addCellListener(null, null, null, secondMutator, true);
        store.addCellListener(null, null, null, secondListener);
        store.setCell('t1', 'r1', 'c1', 1);
        expect(secondMutator).toBeCalledTimes(1);
        expect(secondListener).toBeCalledTimes(2);
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
        expect(secondMutator).toBeCalledTimes(1);
        expect(secondListener).toBeCalledTimes(2);
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
        expect(secondMutator).toBeCalledTimes(1);
        expect(secondListener).toBeCalledTimes(2);
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
        expect(secondMutator).toBeCalledTimes(1);
        expect(secondListener).toBeCalledTimes(2);
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
        expect(secondMutator).toBeCalledTimes(1);
        expect(secondListener).toBeCalledTimes(2);
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
      expect(second).toBeCalledTimes(0);
    });

    test('cell self-mutation does not stack overflow', () => {
      const store = createStore().setTables({t1: {r1: {c1: 1}}});
      const second = jest.fn(() => null);
      store.addCellListener(
        't1',
        'r1',
        'c1',
        () =>
          store.setCell('t1', 'r1', 'c1', (cell): Cell => (cell as number) - 1),
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
      expect(second).toBeCalledTimes(0);
    });
  });
});

describe('callListener', () => {
  let store: Store;
  let listener: () => null;
  beforeEach(() => {
    store = createStore().setTables({
      t1: {r1: {c1: 1, c2: 2}, r2: {c1: 3, c2: 4}},
      t2: {r1: {c1: 5, c2: 6}, r2: {c1: 7, c2: 8}},
    });
    listener = jest.fn(() => null);
  });

  test('non-existent', () => {
    store.callListener(store.addTablesListener(listener) + 1);
    expect(listener).toBeCalledTimes(0);
  });

  test('tables (non mutator)', () => {
    store.callListener(store.addTablesListener(listener));
    expect(listener).toBeCalledTimes(1);
    expect(listener).toHaveBeenNthCalledWith(1, store);
  });

  test('tables (mutator)', () => {
    store.callListener(store.addTablesListener(listener, true));
    expect(listener).toBeCalledTimes(1);
    expect(listener).toHaveBeenNthCalledWith(1, store);
  });

  test('table ids (non mutator)', () => {
    store.callListener(store.addTableIdsListener(listener));
    expect(listener).toBeCalledTimes(1);
    expect(listener).toHaveBeenNthCalledWith(1, store);
  });

  test('table id (non mutator)', () => {
    store.callListener(store.addTableListener('t1', listener));
    expect(listener).toBeCalledTimes(1);
    expect(listener).toHaveBeenNthCalledWith(1, store, 't1');
  });

  test('table id (mutator)', () => {
    store.callListener(store.addTableListener('t1', listener, true));
    expect(listener).toBeCalledTimes(1);
    expect(listener).toHaveBeenNthCalledWith(1, store, 't1');
  });

  test('table * (non mutator)', () => {
    store.callListener(store.addTableListener(null, listener));
    expect(listener).toBeCalledTimes(2);
    expect(listener).toHaveBeenNthCalledWith(1, store, 't1');
    expect(listener).toHaveBeenNthCalledWith(2, store, 't2');
  });

  test('table * (mutator)', () => {
    store.callListener(store.addTableListener(null, listener, true));
    expect(listener).toBeCalledTimes(2);
    expect(listener).toHaveBeenNthCalledWith(1, store, 't1');
    expect(listener).toHaveBeenNthCalledWith(2, store, 't2');
  });

  test('row ids id (non mutator)', () => {
    store.callListener(store.addRowIdsListener('t1', listener));
    expect(listener).toBeCalledTimes(1);
    expect(listener).toHaveBeenNthCalledWith(1, store, 't1');
  });

  test('row ids * (non mutator)', () => {
    store.callListener(store.addRowIdsListener(null, listener));
    expect(listener).toBeCalledTimes(2);
    expect(listener).toHaveBeenNthCalledWith(1, store, 't1');
    expect(listener).toHaveBeenNthCalledWith(2, store, 't2');
  });

  test('row id/id (non mutator)', () => {
    store.callListener(store.addRowListener('t1', 'r1', listener));
    expect(listener).toBeCalledTimes(1);
    expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1');
  });

  test('row id/id (mutator)', () => {
    store.callListener(store.addRowListener('t1', 'r1', listener, true));
    expect(listener).toBeCalledTimes(1);
    expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1');
  });

  test('row id/* (non mutator)', () => {
    store.callListener(store.addRowListener('t1', null, listener));
    expect(listener).toBeCalledTimes(2);
    expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1');
    expect(listener).toHaveBeenNthCalledWith(2, store, 't1', 'r2');
  });

  test('row id/* (mutator)', () => {
    store.callListener(store.addRowListener('t1', null, listener, true));
    expect(listener).toBeCalledTimes(2);
    expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1');
    expect(listener).toHaveBeenNthCalledWith(2, store, 't1', 'r2');
  });

  test('row */id (non mutator)', () => {
    store.callListener(store.addRowListener(null, 'r1', listener));
    expect(listener).toBeCalledTimes(2);
    expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1');
    expect(listener).toHaveBeenNthCalledWith(2, store, 't2', 'r1');
  });

  test('row */id (mutator)', () => {
    store.callListener(store.addRowListener(null, 'r1', listener, true));
    expect(listener).toBeCalledTimes(2);
    expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1');
    expect(listener).toHaveBeenNthCalledWith(2, store, 't2', 'r1');
  });

  test('row */* (non mutator)', () => {
    store.callListener(store.addRowListener(null, null, listener));
    expect(listener).toBeCalledTimes(4);
    expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1');
    expect(listener).toHaveBeenNthCalledWith(2, store, 't1', 'r2');
    expect(listener).toHaveBeenNthCalledWith(3, store, 't2', 'r1');
    expect(listener).toHaveBeenNthCalledWith(4, store, 't2', 'r2');
  });

  test('row */* (mutator)', () => {
    store.callListener(store.addRowListener(null, null, listener, true));
    expect(listener).toBeCalledTimes(4);
    expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1');
    expect(listener).toHaveBeenNthCalledWith(2, store, 't1', 'r2');
    expect(listener).toHaveBeenNthCalledWith(3, store, 't2', 'r1');
    expect(listener).toHaveBeenNthCalledWith(4, store, 't2', 'r2');
  });

  test('cell ids id/id (non mutator)', () => {
    store.callListener(store.addCellIdsListener('t1', 'r1', listener));
    expect(listener).toBeCalledTimes(1);
    expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1');
  });

  test('cell ids id/* (non mutator)', () => {
    store.callListener(store.addCellIdsListener('t1', null, listener));
    expect(listener).toBeCalledTimes(2);
    expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1');
    expect(listener).toHaveBeenNthCalledWith(2, store, 't1', 'r2');
  });

  test('cell ids */id (non mutator)', () => {
    store.callListener(store.addCellIdsListener(null, 'r1', listener));
    expect(listener).toBeCalledTimes(2);
    expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1');
    expect(listener).toHaveBeenNthCalledWith(2, store, 't2', 'r1');
  });

  test('cell ids */* (non mutator)', () => {
    store.callListener(store.addCellIdsListener(null, null, listener));
    expect(listener).toBeCalledTimes(4);
    expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1');
    expect(listener).toHaveBeenNthCalledWith(2, store, 't1', 'r2');
    expect(listener).toHaveBeenNthCalledWith(3, store, 't2', 'r1');
    expect(listener).toHaveBeenNthCalledWith(4, store, 't2', 'r2');
  });

  test('cell id/id/id (non mutator)', () => {
    store.callListener(store.addCellListener('t1', 'r1', 'c1', listener));
    expect(listener).toBeCalledTimes(1);
    expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1', 'c1', 1, 1);
  });

  test('cell id/id/id (mutator)', () => {
    store.callListener(store.addCellListener('t1', 'r1', 'c1', listener, true));
    expect(listener).toBeCalledTimes(1);
    expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1', 'c1', 1, 1);
  });

  test('cell id/id/* (non mutator)', () => {
    store.callListener(store.addCellListener('t1', 'r1', null, listener));
    expect(listener).toBeCalledTimes(2);
    expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1', 'c1', 1, 1);
    expect(listener).toHaveBeenNthCalledWith(2, store, 't1', 'r1', 'c2', 2, 2);
  });

  test('cell id/id/* (mutator)', () => {
    store.callListener(store.addCellListener('t1', 'r1', null, listener, true));
    expect(listener).toBeCalledTimes(2);
    expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1', 'c1', 1, 1);
    expect(listener).toHaveBeenNthCalledWith(2, store, 't1', 'r1', 'c2', 2, 2);
  });

  test('cell id/*/id (non mutator)', () => {
    store.callListener(store.addCellListener('t1', null, 'c1', listener));
    expect(listener).toBeCalledTimes(2);
    expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1', 'c1', 1, 1);
    expect(listener).toHaveBeenNthCalledWith(2, store, 't1', 'r2', 'c1', 3, 3);
  });

  test('cell id/*/id (mutator)', () => {
    store.callListener(store.addCellListener('t1', null, 'c1', listener, true));
    expect(listener).toBeCalledTimes(2);
    expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1', 'c1', 1, 1);
    expect(listener).toHaveBeenNthCalledWith(2, store, 't1', 'r2', 'c1', 3, 3);
  });

  test('cell id/*/* (non mutator)', () => {
    store.callListener(store.addCellListener('t1', null, null, listener));
    expect(listener).toBeCalledTimes(4);
    expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1', 'c1', 1, 1);
    expect(listener).toHaveBeenNthCalledWith(2, store, 't1', 'r1', 'c2', 2, 2);
    expect(listener).toHaveBeenNthCalledWith(3, store, 't1', 'r2', 'c1', 3, 3);
    expect(listener).toHaveBeenNthCalledWith(4, store, 't1', 'r2', 'c2', 4, 4);
  });

  test('cell id/*/* (mutator)', () => {
    store.callListener(store.addCellListener('t1', null, null, listener, true));
    expect(listener).toBeCalledTimes(4);
    expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1', 'c1', 1, 1);
    expect(listener).toHaveBeenNthCalledWith(2, store, 't1', 'r1', 'c2', 2, 2);
    expect(listener).toHaveBeenNthCalledWith(3, store, 't1', 'r2', 'c1', 3, 3);
    expect(listener).toHaveBeenNthCalledWith(4, store, 't1', 'r2', 'c2', 4, 4);
  });

  test('cell */id/id (non mutator)', () => {
    store.callListener(store.addCellListener(null, 'r1', 'c1', listener));
    expect(listener).toBeCalledTimes(2);
    expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1', 'c1', 1, 1);
    expect(listener).toHaveBeenNthCalledWith(2, store, 't2', 'r1', 'c1', 5, 5);
  });

  test('cell */id/id (mutator)', () => {
    store.callListener(store.addCellListener(null, 'r1', 'c1', listener, true));
    expect(listener).toBeCalledTimes(2);
    expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1', 'c1', 1, 1);
    expect(listener).toHaveBeenNthCalledWith(2, store, 't2', 'r1', 'c1', 5, 5);
  });

  test('cell */id/* (non mutator)', () => {
    store.callListener(store.addCellListener(null, 'r1', null, listener));
    expect(listener).toBeCalledTimes(4);
    expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1', 'c1', 1, 1);
    expect(listener).toHaveBeenNthCalledWith(2, store, 't1', 'r1', 'c2', 2, 2);
    expect(listener).toHaveBeenNthCalledWith(3, store, 't2', 'r1', 'c1', 5, 5);
    expect(listener).toHaveBeenNthCalledWith(4, store, 't2', 'r1', 'c2', 6, 6);
  });

  test('cell */id/* (mutator)', () => {
    store.callListener(store.addCellListener(null, 'r1', null, listener, true));
    expect(listener).toBeCalledTimes(4);
    expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1', 'c1', 1, 1);
    expect(listener).toHaveBeenNthCalledWith(2, store, 't1', 'r1', 'c2', 2, 2);
    expect(listener).toHaveBeenNthCalledWith(3, store, 't2', 'r1', 'c1', 5, 5);
    expect(listener).toHaveBeenNthCalledWith(4, store, 't2', 'r1', 'c2', 6, 6);
  });

  test('cell */*/id (non mutator)', () => {
    store.callListener(store.addCellListener(null, null, 'c1', listener));
    expect(listener).toBeCalledTimes(4);
    expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1', 'c1', 1, 1);
    expect(listener).toHaveBeenNthCalledWith(2, store, 't1', 'r2', 'c1', 3, 3);
    expect(listener).toHaveBeenNthCalledWith(3, store, 't2', 'r1', 'c1', 5, 5);
    expect(listener).toHaveBeenNthCalledWith(4, store, 't2', 'r2', 'c1', 7, 7);
  });

  test('cell */*/id (mutator)', () => {
    store.callListener(store.addCellListener(null, null, 'c1', listener, true));
    expect(listener).toBeCalledTimes(4);
    expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1', 'c1', 1, 1);
    expect(listener).toHaveBeenNthCalledWith(2, store, 't1', 'r2', 'c1', 3, 3);
    expect(listener).toHaveBeenNthCalledWith(3, store, 't2', 'r1', 'c1', 5, 5);
    expect(listener).toHaveBeenNthCalledWith(4, store, 't2', 'r2', 'c1', 7, 7);
  });

  test('cell */*/* (non mutator)', () => {
    store.callListener(store.addCellListener(null, null, null, listener));
    expect(listener).toBeCalledTimes(8);
    expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1', 'c1', 1, 1);
    expect(listener).toHaveBeenNthCalledWith(2, store, 't1', 'r1', 'c2', 2, 2);
    expect(listener).toHaveBeenNthCalledWith(3, store, 't1', 'r2', 'c1', 3, 3);
    expect(listener).toHaveBeenNthCalledWith(4, store, 't1', 'r2', 'c2', 4, 4);
    expect(listener).toHaveBeenNthCalledWith(5, store, 't2', 'r1', 'c1', 5, 5);
    expect(listener).toHaveBeenNthCalledWith(6, store, 't2', 'r1', 'c2', 6, 6);
    expect(listener).toHaveBeenNthCalledWith(7, store, 't2', 'r2', 'c1', 7, 7);
    expect(listener).toHaveBeenNthCalledWith(8, store, 't2', 'r2', 'c2', 8, 8);
  });

  test('cell */*/* (mutator)', () => {
    store.callListener(store.addCellListener(null, null, null, listener, true));
    expect(listener).toBeCalledTimes(8);
    expect(listener).toHaveBeenNthCalledWith(1, store, 't1', 'r1', 'c1', 1, 1);
    expect(listener).toHaveBeenNthCalledWith(2, store, 't1', 'r1', 'c2', 2, 2);
    expect(listener).toHaveBeenNthCalledWith(3, store, 't1', 'r2', 'c1', 3, 3);
    expect(listener).toHaveBeenNthCalledWith(4, store, 't1', 'r2', 'c2', 4, 4);
    expect(listener).toHaveBeenNthCalledWith(5, store, 't2', 'r1', 'c1', 5, 5);
    expect(listener).toHaveBeenNthCalledWith(6, store, 't2', 'r1', 'c2', 6, 6);
    expect(listener).toHaveBeenNthCalledWith(7, store, 't2', 'r2', 'c1', 7, 7);
    expect(listener).toHaveBeenNthCalledWith(8, store, 't2', 'r2', 'c2', 8, 8);
  });
});
