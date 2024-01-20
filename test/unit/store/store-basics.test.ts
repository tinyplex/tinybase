/* eslint-disable @typescript-eslint/ban-ts-comment */
import {Store, createMergeableStore, createStore} from 'tinybase/debug';

let store: Store;

// Note that these tests run in order to mutate the store in a sequence.

describe.each([
  ['store', createStore],
  ['mergeableStore', createMergeableStore],
])('Testing %s', (_name, createStore) => {
  describe('Change tabular state', () => {
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
      expect(store.getTableCellIds('t1')).toEqual(['c1']);
      expect(store.getRowCount('t1')).toEqual(1);
      expect(store.getRowIds('t1')).toEqual(['r1']);
      expect(store.getRow('t1', 'r1')).toEqual({c1: 1});
      expect(store.getCellIds('t1', 'r1')).toEqual(['c1']);
      expect(store.getCell('t1', 'r1', 'c1')).toEqual(1);
      expect(store.getTablesJson()).toEqual(
        JSON.stringify({t1: {r1: {c1: 1}}}),
      );
      expect(store.getValuesJson()).toEqual(JSON.stringify({}));
      expect(store.getJson()).toEqual(
        JSON.stringify([{t1: {r1: {c1: 1}}}, {}]),
      );
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

  describe('Change keyed value state', () => {
    beforeAll(() => {
      store = createStore();
    });

    test('reset 1', () => {
      store.delValues();
      expect(store.getValues()).toEqual({});
    });

    test('setValues', () => {
      store.setValues({v1: 1});
      expect(store.getValues()).toEqual({v1: 1});
      expect(store.getValueIds()).toEqual(['v1']);
      expect(store.getValue('v1')).toEqual(1);
      expect(store.getTablesJson()).toEqual(JSON.stringify({}));
      expect(store.getValuesJson()).toEqual(JSON.stringify({v1: 1}));
      expect(store.getJson()).toEqual(JSON.stringify([{}, {v1: 1}]));
    });

    test('setValues, same value', () => {
      store.setValues({v1: 1});
      expect(store.getValues()).toEqual({v1: 1});
    });

    test('setValues, change value', () => {
      store.setValues({v1: 2});
      expect(store.getValues()).toEqual({v1: 2});
    });

    test('setValues, different value', () => {
      store.setValues({v2: 2});
      expect(store.getValues()).toEqual({v2: 2});
    });

    test('setPartialValues', () => {
      // @ts-ignore
      store.setPartialValues({v1: 1, v3: undefined});
      expect(store.getValues()).toEqual({v1: 1, v2: 2});
    });

    test('reset 2', () => {
      store.delValues();
      expect(store.getValues()).toEqual({});
    });

    test('setValue', () => {
      store.setValue('v1', 1);
      expect(store.getValues()).toEqual({v1: 1});
    });

    test('setValue, same value', () => {
      store.setValue('v1', 1);
      expect(store.getValues()).toEqual({v1: 1});
    });

    test('setValue, change value', () => {
      store.setValue('v1', 2);
      expect(store.getValues()).toEqual({v1: 2});
    });

    test('setValue, different value', () => {
      store.setValue('v2', 2);
      expect(store.getValues()).toEqual({v1: 2, v2: 2});
    });

    test('setValue, mapped', () => {
      store.setValue('v2', (value) => (value as number) + 1);
      expect(store.getValues()).toEqual({v1: 2, v2: 3});
    });

    test('Add things to delete', () => {
      store.setValues({v1: 1, v2: 2, v3: 3});
      expect(store.getValues()).toEqual({v1: 1, v2: 2, v3: 3});
    });

    test('delValue', () => {
      store.delValue('v1');
      expect(store.getValues()).toEqual({v2: 2, v3: 3});
    });

    test('delValues', () => {
      store.delValues();
      expect(store.getValues()).toEqual({});
    });
  });

  test('setTables and setValues', () => {
    store = createStore()
      .setTables({t1: {r1: {c1: 1}}})
      .setValues({v1: 1});
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    expect(store.getValues()).toEqual({v1: 1});
    expect(store.getTablesJson()).toEqual(JSON.stringify({t1: {r1: {c1: 1}}}));
    expect(store.getValuesJson()).toEqual(JSON.stringify({v1: 1}));
    expect(store.getJson()).toEqual(
      JSON.stringify([{t1: {r1: {c1: 1}}}, {v1: 1}]),
    );
  });

  test('setContent & getContent', () => {
    store = createStore().setContent([{t1: {r1: {c1: 1}}}, {v1: 1}]);
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    expect(store.getValues()).toEqual({v1: 1});
    expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
  });
});
