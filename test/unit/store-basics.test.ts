/* eslint-disable @typescript-eslint/ban-ts-comment */
import {Store, createStore} from '../../lib/debug/tinybase';

let store: Store;

// Note that these tests run in order to mutate the store in a sequence.

describe('Change state', () => {
  beforeAll(() => {
    store = createStore();
  });

  test('reset 1', () => {
    store.delTables();
    expect(store.getTables()).toEqual({});
  });

  test('setTables', () => {
    store.setTables({t1: {r1: {c1: 1}}});
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    expect(store.getTableIds()).toEqual(['t1']);
    expect(store.getTable('t1')).toEqual({r1: {c1: 1}});
    expect(store.getRowIds('t1')).toEqual(['r1']);
    expect(store.getRow('t1', 'r1')).toEqual({c1: 1});
    expect(store.getCellIds('t1', 'r1')).toEqual(['c1']);
    expect(store.getCell('t1', 'r1', 'c1')).toEqual(1);
  });

  test('setTables, same table, same row, same cell', () => {
    store.setTables({t1: {r1: {c1: 1}}});
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
  });

  test('setTables, same table, same row, change cell', () => {
    store.setTables({t1: {r1: {c1: 2}}});
    expect(store.getTables()).toEqual({t1: {r1: {c1: 2}}});
  });

  test('setTables, same table, same row, different cell', () => {
    store.setTables({t1: {r1: {c2: 2}}});
    expect(store.getTables()).toEqual({t1: {r1: {c2: 2}}});
  });

  test('setTables, same table, different row', () => {
    store.setTables({t1: {r2: {c1: 1}}});
    expect(store.getTables()).toEqual({t1: {r2: {c1: 1}}});
  });

  test('setTables, different table', () => {
    store.setTables({t2: {r1: {c1: 1}}});
    expect(store.getTables()).toEqual({t2: {r1: {c1: 1}}});
  });

  test('reset 2', () => {
    store.delTables();
    expect(store.getTables()).toEqual({});
  });

  test('setTable', () => {
    store.setTable('t1', {r1: {c1: 1}});
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
  });

  test('setTable, same table, same row, same cell', () => {
    store.setTable('t1', {r1: {c1: 1}});
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
  });

  test('setTable, same table, same row, change cell', () => {
    store.setTable('t1', {r1: {c1: 2}});
    expect(store.getTables()).toEqual({t1: {r1: {c1: 2}}});
  });

  test('setTable, same table, same row, different cell', () => {
    store.setTable('t1', {r1: {c2: 2}});
    expect(store.getTables()).toEqual({t1: {r1: {c2: 2}}});
  });

  test('setTable, same table, different row', () => {
    store.setTable('t1', {r2: {c1: 1}});
    expect(store.getTables()).toEqual({t1: {r2: {c1: 1}}});
  });

  test('setTable, different table', () => {
    store.setTable('t2', {r1: {c1: 1}});
    expect(store.getTables()).toEqual({t1: {r2: {c1: 1}}, t2: {r1: {c1: 1}}});
  });

  test('reset 3', () => {
    store.delTables();
    expect(store.getTables()).toEqual({});
  });

  test('setRow', () => {
    store.setRow('t1', 'r1', {c1: 1});
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
  });

  test('setRow, same table, same row, same cell', () => {
    store.setRow('t1', 'r1', {c1: 1});
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
  });

  test('setRow, same table, same row, change cell', () => {
    store.setRow('t1', 'r1', {c1: 2});
    expect(store.getTables()).toEqual({t1: {r1: {c1: 2}}});
  });

  test('setRow, same table, same row, different cell', () => {
    store.setRow('t1', 'r1', {c2: 2});
    expect(store.getTables()).toEqual({t1: {r1: {c2: 2}}});
  });

  test('setRow, same table, different row', () => {
    store.setRow('t1', 'r2', {c1: 1});
    expect(store.getTables()).toEqual({t1: {r1: {c2: 2}, r2: {c1: 1}}});
  });

  test('setRow, different table', () => {
    store.setRow('t2', 'r1', {c1: 1});
    expect(store.getTables()).toEqual({
      t1: {r1: {c2: 2}, r2: {c1: 1}},
      t2: {r1: {c1: 1}},
    });
  });

  test('addRow', () => {
    store.addRow('t2', {c1: 1});
    expect(store.getTables()).toEqual({
      t1: {r1: {c2: 2}, r2: {c1: 1}},
      t2: {r1: {c1: 1}, 0: {c1: 1}},
    });
  });

  test('addRow, over existing row', () => {
    store.transaction(() =>
      store.setRow('t2', '1', {c1: 1}).addRow('t2', {c1: 1}),
    );
    expect(store.getTables()).toEqual({
      t1: {r1: {c2: 2}, r2: {c1: 1}},
      t2: {r1: {c1: 1}, 0: {c1: 1}, 1: {c1: 1}, 2: {c1: 1}},
    });
  });

  test('setPartialRow', () => {
    // @ts-ignore
    store.setPartialRow('t1', 'r1', {c1: 1, c2: 3, c3: undefined});
    expect(store.getTables()).toEqual({
      t1: {r1: {c1: 1, c2: 3}, r2: {c1: 1}},
      t2: {r1: {c1: 1}, 0: {c1: 1}, 1: {c1: 1}, 2: {c1: 1}},
    });
  });

  test('reset 4', () => {
    store.delTables();
    expect(store.getTables()).toEqual({});
  });

  test('setCell', () => {
    store.setCell('t1', 'r1', 'c1', 1);
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
  });

  test('setCell, same table, same row, same cell', () => {
    store.setCell('t1', 'r1', 'c1', 1);
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
  });

  test('setCell, same table, same row, change cell', () => {
    store.setCell('t1', 'r1', 'c1', 2);
    expect(store.getTables()).toEqual({t1: {r1: {c1: 2}}});
  });

  test('setCell, same table, same row, different cell', () => {
    store.setCell('t1', 'r1', 'c2', 2);
    expect(store.getTables()).toEqual({t1: {r1: {c1: 2, c2: 2}}});
  });

  test('setCell, same table, different row', () => {
    store.setCell('t1', 'r2', 'c1', 1);
    expect(store.getTables()).toEqual({
      t1: {r1: {c1: 2, c2: 2}, r2: {c1: 1}},
    });
  });

  test('setCell, different table', () => {
    store.setCell('t2', 'r1', 'c1', 1);
    expect(store.getTables()).toEqual({
      t1: {r1: {c1: 2, c2: 2}, r2: {c1: 1}},
      t2: {r1: {c1: 1}},
    });
  });

  test('setCell, mapped', () => {
    store.setCell('t2', 'r1', 'c1', (cell) => (cell as number) + 1);
    expect(store.getTables()).toEqual({
      t1: {r1: {c1: 2, c2: 2}, r2: {c1: 1}},
      t2: {r1: {c1: 2}},
    });
  });

  test('Add things to delete', () => {
    store.transaction(() =>
      store.setTable('t3', {r1: {c1: 1}}).setTable('t4', {r1: {c1: 1}}),
    );
    expect(store.getTables()).toEqual({
      t1: {r1: {c1: 2, c2: 2}, r2: {c1: 1}},
      t2: {r1: {c1: 2}},
      t3: {r1: {c1: 1}},
      t4: {r1: {c1: 1}},
    });
  });

  test('delCell', () => {
    store.delCell('t1', 'r1', 'c2');
    expect(store.getTables()).toEqual({
      t1: {r1: {c1: 2}, r2: {c1: 1}},
      t2: {r1: {c1: 2}},
      t3: {r1: {c1: 1}},
      t4: {r1: {c1: 1}},
    });
  });

  test('delCell, cascade', () => {
    store.delCell('t2', 'r1', 'c1');
    expect(store.getTables()).toEqual({
      t1: {r1: {c1: 2}, r2: {c1: 1}},
      t3: {r1: {c1: 1}},
      t4: {r1: {c1: 1}},
    });
  });

  test('delRow', () => {
    store.delRow('t1', 'r2');
    expect(store.getTables()).toEqual({
      t1: {r1: {c1: 2}},
      t3: {r1: {c1: 1}},
      t4: {r1: {c1: 1}},
    });
  });

  test('delRow, cascade', () => {
    store.delRow('t1', 'r1');
    expect(store.getTables()).toEqual({t3: {r1: {c1: 1}}, t4: {r1: {c1: 1}}});
  });

  test('delTable', () => {
    store.delTable('t3');
    expect(store.getTables()).toEqual({t4: {r1: {c1: 1}}});
  });

  test('delTables', () => {
    store.delTables();
    expect(store.getTables()).toEqual({});
  });
});
