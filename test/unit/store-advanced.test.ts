/* eslint-disable @typescript-eslint/ban-ts-comment */
import {Row, Store, Table, Tables, createStore} from '../../lib/debug/tinybase';
import {
  StoreListener,
  createStoreListener,
  expectChanges,
  expectNoChanges,
} from './common';

let store: Store;
let listener: StoreListener;

beforeEach(() => {
  store = createStore();
  listener = createStoreListener(store);
});

describe('setJson', () => {
  test('valid', () => {
    store = createStore().setTables({t1: {r1: {c1: 1, c2: 1}}});
    store.setJson('{"t2": {"r2": {"c2": 1, "d2": 2}}}');
    expect(store.getTables()).toEqual({t2: {r2: {c2: 1, d2: 2}}});
  });

  test('invalid', () => {
    store = createStore().setTables({t1: {r1: {c1: 1, c2: 1}}});
    store.setJson('{');
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1, c2: 1}}});
  });

  test('part empty object', () => {
    store = createStore().setTables({t1: {r1: {c1: 1, c2: 1}}});
    store.setJson('{"t2": {"r2": {}}}');
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1, c2: 1}}});
  });

  test('part invalid object', () => {
    store = createStore().setTables({t1: {r1: {c1: 1, c2: 1}}});
    store.setJson('{"t2": {"r2": [1, 2, 3]}}');
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1, c2: 1}}});
  });

  test('empty object', () => {
    store = createStore().setTables({t1: {r1: {c1: 1, c2: 1}}});
    store.setJson('{}');
    expect(store.getTables()).toEqual({});
  });

  test('invalid object 1', () => {
    store = createStore().setTables({t1: {r1: {c1: 1, c2: 1}}});
    store.setJson('[1, 2, 3]');
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1, c2: 1}}});
  });

  test('invalid object 2', () => {
    store = createStore().setTables({t1: {r1: {c1: 1, c2: 1}}});
    store.setJson('123');
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1, c2: 1}}});
  });

  test('empty', () => {
    store = createStore().setTables({t1: {r1: {c1: 1, c2: 1}}});
    store.setJson('');
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1, c2: 1}}});
  });

  test('null', () => {
    store = createStore().setTables({t1: {r1: {c1: 1, c2: 1}}});
    store.setJson('null');
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1, c2: 1}}});
  });
});

describe('Miscellaneous', () => {
  test('Set in the constructor', () => {
    store = createStore().setTables({t1: {r1: {c1: 1, c2: 2}}});
    expect(store.getTables()).toEqual({
      t1: {r1: {c1: 1, c2: 2}},
    });
  });

  describe('forEach', () => {
    test('forEachTable', () => {
      store.setTables({t1: {r1: {c1: 1, c2: 2}}});
      const tables: Tables = {};
      store.forEachTable((tableId, forEachRow) => {
        const table: Table = {};
        forEachRow((rowId, forEachCell) => {
          const row: Row = {};
          forEachCell((cellId, cell) => (row[cellId] = cell));
          table[rowId] = row;
        });
        tables[tableId] = table;
      });
      expect(tables).toEqual({
        t1: {r1: {c1: 1, c2: 2}},
      });
    });

    test('forEachRow', () => {
      store.setTables({t1: {r1: {c1: 1, c2: 2}}});
      const table: Table = {};
      store.forEachRow('t1', (rowId, forEachCell) => {
        const row: Row = {};
        forEachCell((cellId, cell) => (row[cellId] = cell));
        table[rowId] = row;
      });
      expect(table).toEqual({r1: {c1: 1, c2: 2}});
    });

    test('forEachCell', () => {
      store.setTables({t1: {r1: {c1: 1, c2: 2}}});
      const row: Row = {};
      store.forEachCell('t1', 'r1', (cellId, cell) => (row[cellId] = cell));
      expect(row).toEqual({c1: 1, c2: 2});
    });
  });

  test('are things present', () => {
    expect(store.hasTables()).toEqual(false);
    expect(store.hasTable('t1')).toEqual(false);
    expect(store.hasRow('t1', 'r1')).toEqual(false);
    expect(store.hasCell('t1', 'r1', 'c1')).toEqual(false);
    store.setTables({t1: {r1: {c1: 1}}});
    expect(store.hasTables()).toEqual(true);
    expect(store.hasTable('t1')).toEqual(true);
    expect(store.hasTable('t2')).toEqual(false);
    expect(store.hasRow('t1', 'r1')).toEqual(true);
    expect(store.hasRow('t1', 'r2')).toEqual(false);
    expect(store.hasCell('t1', 'r1', 'c1')).toEqual(true);
    expect(store.hasCell('t1', 'r1', 'c2')).toEqual(false);
  });

  test('tracks multiple changes, with multiple listeners', () => {
    listener.listenToRow('/t1/r1a', 't1', 'r1');
    store.setRow('t1', 'r1', {c1: 1}).setRow('t1', 'r1', {c1: 2});
    listener.listenToRow('/t1/r1b', 't1', 'r1');
    store.setRow('t1', 'r1', {c1: 3});
    expect(store.getTables()).toEqual({t1: {r1: {c1: 3}}});
    expectChanges(
      listener,
      '/t1/r1a',
      {t1: {r1: {c1: 1}}},
      {t1: {r1: {c1: 2}}},
      {t1: {r1: {c1: 3}}},
    );
    expectChanges(listener, '/t1/r1b', {t1: {r1: {c1: 3}}});
    expectNoChanges(listener);
  });

  test('remove listener', () => {
    expect(listener.listenToRow('/t1/r1a', 't1', 'r1')).toEqual('0');
    store.setRow('t1', 'r1', {c1: 1});
    expect(listener.listenToRow('/t1/r1b', 't1', 'r1')).toEqual('1');
    store.setRow('t1', 'r1', {c1: 2});
    expectChanges(
      listener,
      '/t1/r1a',
      {t1: {r1: {c1: 1}}},
      {t1: {r1: {c1: 2}}},
    );
    expectChanges(listener, '/t1/r1b', {t1: {r1: {c1: 2}}});
    expectNoChanges(listener);
    store.delListener('0').delListener('1');
    store.setRow('t1', 'r1', {c1: 3});
    expectNoChanges(listener);
  });

  test('increments or reuses listenerId', () => {
    expect(listener.listenToRow('/t1/r1a', 't1', 'r1')).toEqual('0');
    store.setRow('t1', 'r1', {c1: 1});
    expect(listener.listenToRow('/t1/r1b', 't1', 'r1')).toEqual('1');
    store.setRow('t1', 'r1', {c1: 2});
    expect(listener.listenToRow('/t1/r1c', 't1', 'r1')).toEqual('2');
    store
      .setRow('t1', 'r1', {c1: 3})
      .delListener('1')
      .setRow('t1', 'r1', {c1: 4});
    expect(listener.listenToRow('/t1/r1d', 't1', 'r1')).toEqual('1');
    store.setRow('t1', 'r1', {c1: 5});
    expectChanges(
      listener,
      '/t1/r1a',
      {t1: {r1: {c1: 1}}},
      {t1: {r1: {c1: 2}}},
      {t1: {r1: {c1: 3}}},
      {t1: {r1: {c1: 4}}},
      {t1: {r1: {c1: 5}}},
    );
    expectChanges(
      listener,
      '/t1/r1b',
      {t1: {r1: {c1: 2}}},
      {t1: {r1: {c1: 3}}},
    );
    expectChanges(
      listener,
      '/t1/r1c',
      {t1: {r1: {c1: 3}}},
      {t1: {r1: {c1: 4}}},
      {t1: {r1: {c1: 5}}},
    );
    expectChanges(listener, '/t1/r1d', {t1: {r1: {c1: 5}}});
    expectNoChanges(listener);
    store.delListener('0').delListener('2').delListener('1');
  });

  test('fills listenerId pool', () => {
    for (let i = 0; i < 1100; i++) {
      store.addTablesListener(() => 0);
    }
    expect(store.addTablesListener(() => 0)).toEqual('1100');
    for (let i = 0; i < 1100; i++) {
      store.delListener(i.toString());
    }
    expect(store.addTablesListener(() => 0)).toEqual('999');
    expect(store.addTablesListener(() => 0)).toEqual('998');
    for (let i = 0; i < 998; i++) {
      store.addTablesListener(() => 0);
    }
    expect(store.addTablesListener(() => 0)).toEqual('1101');
  });

  test('removed non-existent listener', () => {
    expect(listener.listenToRow('/t1/r1a', 't1', 'r1')).toEqual('0');
    store.delListener('1');
  });

  test('cell listener with new and old value', () => {
    expect.assertions(11);
    store = createStore().setTables({t1: {r1: {c1: 1}}});
    const listener = jest.fn(
      (store2, tableId, rowId, cellId, newCell, oldCell) => {
        expect(store2).toEqual(store);
        expect(tableId).toEqual('t1');
        expect(rowId).toEqual('r1');
        expect(newCell).toEqual(2);
        expect(oldCell).toEqual(cellId == 'c1' ? 1 : undefined);
      },
    );
    store.addCellListener('t1', 'r1', null, listener);
    store.setTables({t1: {r1: {c1: 2, c2: 2}}});
    expect(listener).toBeCalled();
  });

  test('row listener with cell changes function', () => {
    expect.assertions(5);
    store = createStore().setTables({t1: {r1: {c1: 1, c2: 2, c3: 3}}});
    const listener = jest.fn((_store, _tableId, _rowId, getCellChange) => {
      expect(getCellChange('t1', 'r1', 'c1')).toEqual([false, 1, 1]);
      expect(getCellChange('t1', 'r1', 'c2')).toEqual([true, 2, 3]);
      expect(getCellChange('t1', 'r1', 'c3')).toEqual([true, 3, undefined]);
      expect(getCellChange('t1', 'r1', 'c4')).toEqual([true, undefined, 4]);
    });
    store.addRowListener('t1', 'r1', listener);
    store.setTables({t1: {r1: {c1: 1, c2: 3, c4: 4}}});
    expect(listener).toBeCalled();
  });
});

describe('Transactions', () => {
  const originalTables = {t1: {r1: {c1: 1}}};
  beforeEach(() => {
    store.setTables(originalTables);
  });

  test('Empty', () => {
    const actions = jest.fn(() => null);
    store.transaction(actions);
    expect(actions).toBeCalledTimes(1);
  });

  test('Empty, nested', () => {
    const actions = jest.fn(() => null);
    store.transaction(() => store.transaction(actions));
    expect(actions).toBeCalledTimes(1);
  });

  test('Debouncing to different', () => {
    listener.listenToTables('/');
    listener.listenToTableIds('/t');
    listener.listenToTable('/t1', 't1');
    listener.listenToTable('/t*', null);
    listener.listenToRowIds('/t1r', 't1');
    listener.listenToRow('/t1/r1', 't1', 'r1');
    listener.listenToRow('/t1/r*', 't1', null);
    listener.listenToCellIds('/t1/r1c', 't1', 'r1');
    listener.listenToCell('/t1/r1/c1', 't1', 'r1', 'c1');
    listener.listenToCell('/t1/r1/c*', 't1', 'r1', null);
    store.transaction(() =>
      store
        .setCell('t1', 'r1', 'c1', 2)
        .setCell('t1', 'r1', 'c1', 1)
        .setCell('t1', 'r1', 'c2', 3)
        .delCell('t1', 'r1', 'c2')
        .setRow('t1', 'r1', {c1: 3})
        .setRow('t1', 'r2', {c2: 3})
        .setRow('t1', 'b3', {c3: 4})
        .delRow('t1', 'r1')
        .setTable('t1', {r1: {c1: 4}})
        .setTable('t2', {r2: {c2: 4}})
        .setTable('a3', {b3: {c3: 5}})
        .delTable('t2')
        .setTables({t1: {r1: {c1: 5}}}),
    );
    expectChanges(listener, '/', {t1: {r1: {c1: 5}}});
    expectChanges(listener, '/t1', {t1: {r1: {c1: 5}}});
    expectChanges(listener, '/t*', {t1: {r1: {c1: 5}}});
    expectChanges(listener, '/t1/r1', {t1: {r1: {c1: 5}}});
    expectChanges(listener, '/t1/r*', {t1: {r1: {c1: 5}}});
    expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: 5}}});
    expectChanges(listener, '/t1/r1/c*', {t1: {r1: {c1: 5}}});
    expectNoChanges(listener);
  });

  test('Debouncing to same', () => {
    listener.listenToTables('/');
    listener.listenToTableIds('/');
    listener.listenToTable('/t1', 't1');
    listener.listenToTable('/t*', null);
    listener.listenToRowIds('/t1', 't1');
    listener.listenToRow('/t1/r1', 't1', 'r1');
    listener.listenToRow('/t1/r*', 't1', null);
    listener.listenToCellIds('/t1/r1', 't1', 'r1');
    listener.listenToCell('/t1/r1/c1', 't1', 'r1', 'c1');
    listener.listenToCell('/t1/r1/c*', 't1', 'r1', null);
    store.transaction(() =>
      store
        .setCell('t1', 'r1', 'c1', 2)
        .setCell('t1', 'r1', 'c1', 1)
        .setCell('t1', 'r1', 'c2', 3)
        .delCell('t1', 'r1', 'c2')
        .setRow('t1', 'r1', {c1: 3})
        .setRow('t1', 'r2', {c2: 3})
        .setRow('t1', 'b3', {c3: 4})
        .delRow('t1', 'r1')
        .setTable('t1', {r1: {c1: 4}})
        .setTable('t2', {r2: {c2: 4}})
        .setTable('a3', {b3: {c3: 5}})
        .delTable('t2')
        .setTables(originalTables),
    );
    expectNoChanges(listener);
  });

  test('Setting value in a listener ignored', () => {
    listener.listenToCell('/t1/r1/c1', 't1', 'r1', 'c1');
    store.addCellListener('t1', 'r1', 'c1', () => {
      store.setTables({t1: {r1: {c1: 3}}});
    });
    store.setTables({t1: {r1: {c1: 2}}});
    expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: 2}}});
    expectNoChanges(listener);
  });

  test('Transaction in a listener ignored', () => {
    listener.listenToCell('/t1/r1/c1', 't1', 'r1', 'c1');
    const listenerTransaction = jest.fn(() => {
      store.setTables({t1: {r1: {c1: 3}}});
    });
    store.addCellListener('t1', 'r1', 'c1', () => {
      store.transaction(listenerTransaction);
    });
    store.setTables({t1: {r1: {c1: 2}}});
    expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: 2}}});
    expectNoChanges(listener);
    expect(listenerTransaction).not.toBeCalled();
  });

  test('Adding a peer listener in a listener', () => {
    const listener = jest.fn(() => null);
    store.addCellListener('t1', 'r1', 'c1', () => {
      store.addCellListener('t1', 'r1', 'c1', listener);
    });
    store.setTables({t1: {r1: {c1: 2}}});
    expect(listener).toBeCalledTimes(1);
  });

  test('Adding a higher listener in a listener', () => {
    const listener = jest.fn(() => null);
    store.addCellListener('t1', 'r1', 'c1', () => {
      store.addRowListener('t1', 'r1', listener);
    });
    store.setTables({t1: {r1: {c1: 2}}});
    expect(listener).toBeCalledTimes(1);
  });

  test('Adding a lower listener in a listener', () => {
    const listener = jest.fn(() => null);
    store.addRowListener('t1', 'r1', () => {
      store.addCellListener('t1', 'r1', 'c1', listener);
    });
    store.setTables({t1: {r1: {c1: 2}}});
    expect(listener).not.toBeCalled();
  });

  test('Removing an earlier peer listener in a listener', () => {
    const listener = jest.fn(() => null);
    const listenerId = store.addCellListener('t1', 'r1', 'c1', listener);
    store.addCellListener('t1', 'r1', 'c1', () => {
      store.delListener(listenerId);
    });
    store.setTables({t1: {r1: {c1: 2}}});
    expect(listener).toBeCalledTimes(1);
  });

  test('Removing a later peer listener in a listener', () => {
    const listener = jest.fn(() => null);
    store.addCellListener('t1', 'r1', 'c1', () => {
      store.delListener(listenerId);
    });
    const listenerId = store.addCellListener('t1', 'r1', 'c1', listener);
    store.setTables({t1: {r1: {c1: 2}}});
    expect(listener).not.toBeCalled();
  });

  test('Removing a lower listener in a listener', () => {
    const listener = jest.fn(() => null);
    const listenerId = store.addCellListener('t1', 'r1', 'c1', listener);
    store.addRowListener('t1', 'r1', () => {
      store.delListener(listenerId);
    });
    store.setTables({t1: {r1: {c1: 2}}});
    expect(listener).toBeCalledTimes(1);
  });

  test('Removing a higher listener in a listener', () => {
    const listener = jest.fn(() => null);
    const listenerId = store.addRowListener('t1', 'r1', listener);
    store.addCellListener('t1', 'r1', 'c1', () => {
      store.delListener(listenerId);
    });
    store.setTables({t1: {r1: {c1: 2}}});
    expect(listener).not.toBeCalled();
  });

  describe('Rolling back', () => {
    describe('doRollback gets changed and invalid cells, returns true', () => {
      test('with setTables', () => {
        expect.assertions(4);
        store.transaction(
          // @ts-ignore
          () => store.setTables({t2: {r2: {c2: 2, c3: [3]}}}),
          (changedCells, invalidCells) => {
            expect(store.getTables()).toEqual({t2: {r2: {c2: 2}}});
            expect(changedCells).toEqual({
              t1: {r1: {c1: [1, undefined]}},
              t2: {r2: {c2: [undefined, 2]}},
            });
            expect(invalidCells).toEqual({t2: {r2: {c3: [[3]]}}});
            return true;
          },
        );
        expect(store.getTables()).toEqual(originalTables);
      });

      test('with setTable', () => {
        expect.assertions(4);
        store.transaction(
          // @ts-ignore
          () => store.setTable('t2', {r2: {c2: 2, c3: [3]}}),
          (changedCells, invalidCells) => {
            expect(store.getTables()).toEqual({
              t1: {r1: {c1: 1}},
              t2: {r2: {c2: 2}},
            });
            expect(changedCells).toEqual({t2: {r2: {c2: [undefined, 2]}}});
            expect(invalidCells).toEqual({t2: {r2: {c3: [[3]]}}});
            return true;
          },
        );
        expect(store.getTables()).toEqual(originalTables);
      });

      test('with setRow', () => {
        expect.assertions(4);
        store.transaction(
          // @ts-ignore
          () => store.setRow('t2', 'r2', {c2: 2, c3: [3]}),
          (changedCells, invalidCells) => {
            expect(store.getTables()).toEqual({
              t1: {r1: {c1: 1}},
              t2: {r2: {c2: 2}},
            });
            expect(changedCells).toEqual({t2: {r2: {c2: [undefined, 2]}}});
            expect(invalidCells).toEqual({t2: {r2: {c3: [[3]]}}});
            return true;
          },
        );
        expect(store.getTables()).toEqual(originalTables);
      });

      test('with valid setCells', () => {
        expect.assertions(4);
        store.transaction(
          () => {
            store.setCell('t1', 'r1', 'c1', 2);
            store.setCell('t2', 'r2', 'c2', 2);
          },
          (changedCells, invalidCells) => {
            expect(store.getTables()).toEqual({
              t1: {r1: {c1: 2}},
              t2: {r2: {c2: 2}},
            });
            expect(changedCells).toEqual({
              t1: {r1: {c1: [1, 2]}},
              t2: {r2: {c2: [undefined, 2]}},
            });
            expect(invalidCells).toEqual({});
            return true;
          },
        );
        expect(store.getTables()).toEqual(originalTables);
      });

      test('with invalid setCell', () => {
        expect.assertions(4);
        store.transaction(
          // @ts-ignore
          () => store.setCell('t2', 'r2', 'c3', [3]),
          (changedCells, invalidCells) => {
            expect(store.getTables()).toEqual(originalTables);
            expect(changedCells).toEqual({});
            expect(invalidCells).toEqual({t2: {r2: {c3: [[3]]}}});
            return true;
          },
        );
        expect(store.getTables()).toEqual(originalTables);
      });

      test('with interesting sequence', () => {
        expect.assertions(4);
        store.transaction(
          () => {
            store.setCell('t2', 'r2', 'c2', 2);
            store.setRow('t2', 'r3', {c3: 3});
            store.setTable('t3', {r3: {c3: 3}});
            store.delRow('t1', 'r1');
            store.delTable('t2');
          },
          (changedCells, invalidCells) => {
            expect(store.getTables()).toEqual({t3: {r3: {c3: 3}}});
            expect(changedCells).toEqual({
              t1: {r1: {c1: [1, undefined]}},
              t3: {r3: {c3: [undefined, 3]}},
            });
            expect(invalidCells).toEqual({});
            return true;
          },
        );
        expect(store.getTables()).toEqual(originalTables);
      });
    });
  });

  describe('doRollback returns false', () => {
    test('with setTables', () => {
      store.transaction(
        // @ts-ignore
        () => store.setTables({t2: {r2: {c2: 2, c3: [3]}}}),
        () => false,
      );
      expect(store.getTables()).toEqual({t2: {r2: {c2: 2}}});
    });

    test('with setTable', () => {
      store.transaction(
        // @ts-ignore
        () => store.setTable('t2', {r2: {c2: 2, c3: [3]}}),
        () => false,
      );
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}, t2: {r2: {c2: 2}}});
    });

    test('with setRow', () => {
      store.transaction(
        // @ts-ignore
        () => store.setRow('t2', 'r2', {c2: 2, c3: [3]}),
        () => false,
      );
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}, t2: {r2: {c2: 2}}});
    });

    test('with valid setCells', () => {
      store.transaction(
        () => {
          store.setCell('t1', 'r1', 'c1', 2);
          store.setCell('t2', 'r2', 'c2', 2);
        },
        () => false,
      );
      expect(store.getTables()).toEqual({t1: {r1: {c1: 2}}, t2: {r2: {c2: 2}}});
    });

    test('with invalid setCell', () => {
      store.transaction(
        // @ts-ignore
        () => store.setCell('t2', 'r2', 'c3', [3]),
        () => false,
      );
      expect(store.getTables()).toEqual(originalTables);
    });

    test('with interesting sequence', () => {
      store.transaction(
        () => {
          store.setCell('t2', 'r2', 'c2', 2);
          store.setRow('t2', 'r3', {c3: 3});
          store.setTable('t3', {r3: {c3: 3}});
          store.delRow('t1', 'r1');
          store.delTable('t2');
        },
        () => false,
      );
      expect(store.getTables()).toEqual({t3: {r3: {c3: 3}}});
    });
  });
});

describe('Stats', () => {
  let expectedListenerStats: any = {};

  beforeEach(() => {
    expectedListenerStats = {
      tables: 0,
      tableIds: 0,
      table: 0,
      rowIds: 0,
      row: 0,
      cellIds: 0,
      cell: 0,
      invalidCell: 0,
    };
  });

  test('empty', () => {
    expect(store.getListenerStats()).toEqual(expectedListenerStats);
  });

  describe('listeners', () => {
    test.each([
      ['tables', []],
      ['tableIds', []],
      ['table', ['t1']],
      ['rowIds', ['t1']],
      ['row', ['t1', 'r1']],
      ['cellIds', ['t1', 'r1']],
      ['cell', ['t1', 'r1', 'c1']],
      ['invalidCell', []],
    ])('%s', (thing, args) => {
      const addListener =
        'add' + thing[0].toUpperCase() + thing.substr(1) + 'Listener';
      expect(
        ((store as any)[addListener] as any)(...args, (): null => null),
      ).toEqual('0');
      expectedListenerStats[thing] = 1;
      expect(store.getListenerStats()).toEqual(expectedListenerStats);
      store.delListener('0');
      expectedListenerStats[thing] = 0;
      expect(store.getListenerStats()).toEqual(expectedListenerStats);
    });
  });
});
