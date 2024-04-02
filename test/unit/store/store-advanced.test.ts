/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  Row,
  Store,
  Table,
  Tables,
  Values,
  createMergeableStore,
  createStore,
} from 'tinybase/debug';
import {expectChanges, expectNoChanges} from '../common/expect';
import {StoreListener} from '../common/types';
import {createStoreListener} from '../common/listeners';
import {jest} from '@jest/globals';

let store: Store;
let listener: StoreListener;

describe.each([
  ['store', createStore],
  ['mergeableStore', () => createMergeableStore('s1')],
])('Testing %s', (_name, createStore) => {
  beforeEach(() => {
    store = createStore();
    listener = createStoreListener(store);
  });

  describe('applyChanges', () => {
    beforeEach(() =>
      store
        .setTables({t1: {r1: {c1: 1, c2: 2}, r2: {c1: 1}}, t2: {r1: {c1: 1}}})
        .setValues({v1: 1, v2: 2}),
    );

    test('delete table', () => {
      store.applyChanges([{t2: undefined}, {}, 1]);
      expect(store.getTables()).toEqual({
        t1: {r1: {c1: 1, c2: 2}, r2: {c1: 1}},
      });
      expect(store.getValues()).toEqual({v1: 1, v2: 2});
    });

    test('delete row', () => {
      store.applyChanges([{t1: {r2: undefined}}, {}, 1]);
      expect(store.getTables()).toEqual({
        t1: {r1: {c1: 1, c2: 2}},
        t2: {r1: {c1: 1}},
      });
      expect(store.getValues()).toEqual({v1: 1, v2: 2});
    });

    test('delete cell', () => {
      store.applyChanges([{t1: {r1: {c2: undefined}}}, {}, 1]);
      expect(store.getTables()).toEqual({
        t1: {r1: {c1: 1}, r2: {c1: 1}},
        t2: {r1: {c1: 1}},
      });
      expect(store.getValues()).toEqual({v1: 1, v2: 2});
    });

    test('delete value', () => {
      store.applyChanges([{}, {v2: undefined}, 1]);
      expect(store.getTables()).toEqual({
        t1: {r1: {c1: 1, c2: 2}, r2: {c1: 1}},
        t2: {r1: {c1: 1}},
      });
      expect(store.getValues()).toEqual({v1: 1});
    });

    test('set cell', () => {
      store.applyChanges([{t1: {r1: {c1: 2}}}, {}, 1]);
      expect(store.getTables()).toEqual({
        t1: {r1: {c1: 2, c2: 2}, r2: {c1: 1}},
        t2: {r1: {c1: 1}},
      });
      expect(store.getValues()).toEqual({v1: 1, v2: 2});
    });

    test('set value', () => {
      store.applyChanges([{}, {v1: 2}, 1]);
      expect(store.getTables()).toEqual({
        t1: {r1: {c1: 1, c2: 2}, r2: {c1: 1}},
        t2: {r1: {c1: 1}},
      });
      expect(store.getValues()).toEqual({v1: 2, v2: 2});
    });

    test('multiple changes', () => {
      store.applyChanges([
        {t1: {r1: {c1: 2, c2: undefined}, r2: undefined}, t2: undefined},
        {v1: 2, v2: undefined},
        1,
      ]);
      expect(store.getTables()).toEqual({t1: {r1: {c1: 2}}});
      expect(store.getValues()).toEqual({v1: 2});
    });
  });

  describe('setTablesJson', () => {
    beforeEach(() => store.setTables({t1: {r1: {c1: 1, c2: 1}}}));

    test('valid', () => {
      store.setTablesJson('{"t2": {"r2": {"c2": 1, "d2": 2}}}');
      expect(store.getTables()).toEqual({t2: {r2: {c2: 1, d2: 2}}});
    });

    test('invalid', () => {
      store.setTablesJson('{');
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1, c2: 1}}});
    });

    test('part empty object', () => {
      store.setTablesJson('{"t2": {"r2": {}}}');
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1, c2: 1}}});
    });

    test('part invalid object', () => {
      store.setTablesJson('{"t2": {"r2": [1, 2, 3]}}');
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1, c2: 1}}});
    });

    test('empty object', () => {
      store.setTablesJson('{}');
      expect(store.getTables()).toEqual({});
    });

    test('invalid object 1', () => {
      store.setTablesJson('[1, 2, 3]');
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1, c2: 1}}});
    });

    test('invalid object 2', () => {
      store.setTablesJson('123');
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1, c2: 1}}});
    });

    test('empty', () => {
      store.setTablesJson('');
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1, c2: 1}}});
    });

    test('null', () => {
      store.setTablesJson('null');
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1, c2: 1}}});
    });
  });

  describe('setValuesJson', () => {
    beforeEach(() => store.setValues({v1: 1}));

    test('valid', () => {
      store.setValuesJson('{"v2": 2}');
      expect(store.getValues()).toEqual({v2: 2});
    });

    test('invalid', () => {
      store.setValuesJson('{');
      expect(store.getValues()).toEqual({v1: 1});
    });

    test('part invalid object', () => {
      store.setValuesJson('{"v1": [1, 2, 3]}');
      expect(store.getValues()).toEqual({v1: 1});
    });

    test('empty object', () => {
      store.setValuesJson('{}');
      expect(store.getValues()).toEqual({});
    });

    test('invalid object 1', () => {
      store.setValuesJson('[1, 2, 3]');
      expect(store.getValues()).toEqual({v1: 1});
    });

    test('invalid object 2', () => {
      store.setValuesJson('123');
      expect(store.getValues()).toEqual({v1: 1});
    });

    test('empty', () => {
      store.setValuesJson('');
      expect(store.getValues()).toEqual({v1: 1});
    });

    test('null', () => {
      store.setValuesJson('null');
      expect(store.getValues()).toEqual({v1: 1});
    });
  });

  describe('setJson', () => {
    beforeEach(() =>
      store.setTables({t1: {r1: {c1: 1, c2: 1}}}).setValues({v1: 1}),
    );

    test('valid', () => {
      store.setJson('[{"t2": {"r2": {"c2": 1, "d2": 2}}},{"v2": 2}]');
      expect(store.getTables()).toEqual({t2: {r2: {c2: 1, d2: 2}}});
      expect(store.getValues()).toEqual({v2: 2});
    });

    test('invalid', () => {
      store.setJson('{');
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1, c2: 1}}});
      expect(store.getValues()).toEqual({v1: 1});
    });

    test('invalid tables', () => {
      store.setJson('[0,{"v2": 2}]');
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1, c2: 1}}});
      expect(store.getValues()).toEqual({v2: 2});
    });

    test('invalid values', () => {
      store.setJson('[{"t2": {"r2": {"c2": 1, "d2": 2}}},0]');
      expect(store.getTables()).toEqual({t2: {r2: {c2: 1, d2: 2}}});
      expect(store.getValues()).toEqual({v1: 1});
    });

    test('empty', () => {
      store.setValuesJson('');
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1, c2: 1}}});
      expect(store.getValues()).toEqual({v1: 1});
    });

    test('null', () => {
      store.setValuesJson('null');
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1, c2: 1}}});
      expect(store.getValues()).toEqual({v1: 1});
    });

    test('backward compatible', () => {
      store.setJson('{"t2": {"r2": {"c2": 1, "d2": 2}}}');
      expect(store.getTables()).toEqual({t2: {r2: {c2: 1, d2: 2}}});
      expect(store.getValues()).toEqual({v1: 1});
    });
  });

  test('Table Cell Ids', () => {
    store = createStore();
    expect(store.getTableCellIds('t1')).toEqual([]);
    store.setRow('t1', 'r1', {c1: 1, c2: 2});
    expect(store.getTableCellIds('t1')).toEqual(['c1', 'c2']);
    store.setRow('t1', 'r2', {c2: 2, c3: 3});
    expect(store.getTableCellIds('t1')).toEqual(['c1', 'c2', 'c3']);
    store.setRow('t1', 'r2', {c4: 2, c5: 3});
    expect(store.getTableCellIds('t1')).toEqual(['c1', 'c2', 'c4', 'c5']);
    store.delRow('t1', 'r1');
    expect(store.getTableCellIds('t1')).toEqual(['c4', 'c5']);
  });

  describe('Sorted Row Ids', () => {
    beforeEach(() => {
      store = createStore().setTables({
        t1: {
          r1: {c1: 1, c2: 'one'},
          r3: {c1: 3, c2: 'three'},
          r5: {c1: 5, c2: 'five'},
          r2: {c1: 2, c2: 'two'},
          r4: {c1: 4, c2: 'four'},
          r6: {c1: 6, c2: 'six'},
        },
      });
    });

    test('Cell sort', () => {
      expect(store.getSortedRowIds('t1', 'c2')).toEqual([
        'r5',
        'r4',
        'r1',
        'r6',
        'r3',
        'r2',
      ]);
    });

    test('Cell sort, limit', () => {
      expect(store.getSortedRowIds('t1', 'c2', false, 0, 3)).toEqual([
        'r5',
        'r4',
        'r1',
      ]);
    });

    test('Cell sort, offset', () => {
      expect(store.getSortedRowIds('t1', 'c2', false, 3)).toEqual([
        'r6',
        'r3',
        'r2',
      ]);
    });

    test('Cell sort, offset & limit', () => {
      expect(store.getSortedRowIds('t1', 'c2', false, 3, 2)).toEqual([
        'r6',
        'r3',
      ]);
    });

    test('Cell sort, reverse', () => {
      expect(store.getSortedRowIds('t1', 'c2', true)).toEqual([
        'r2',
        'r3',
        'r6',
        'r1',
        'r4',
        'r5',
      ]);
    });

    test('Cell sort, missing cell (hence id)', () => {
      expect(store.getSortedRowIds('t1')).toEqual([
        'r1',
        'r2',
        'r3',
        'r4',
        'r5',
        'r6',
      ]);
    });

    test('Cell sort listener, add row with relevant cell', () => {
      expect.assertions(7);
      store.addSortedRowIdsListener(
        't1',
        'c2',
        false,
        0,
        8,
        (_store, tableId, cellId, descending, offset, limit, sortedRowIds) => {
          expect(tableId).toEqual('t1');
          expect(cellId).toEqual('c2');
          expect(descending).toEqual(false);
          expect(offset).toEqual(0);
          expect(limit).toEqual(8);
          expect(sortedRowIds).toEqual([
            'r5',
            'r4',
            'r1',
            'r7',
            'r6',
            'r3',
            'r2',
          ]);
          expect(store.getSortedRowIds('t1', 'c2')).toEqual([
            'r5',
            'r4',
            'r1',
            'r7',
            'r6',
            'r3',
            'r2',
          ]);
        },
      );
      store.setRow('t1', 'r7', {c1: 7, c2: 'seven'});
    });

    test('Cell sort listener, add row without relevant cell', () => {
      expect.assertions(1);
      store.addSortedRowIdsListener(
        't1',
        'c2',
        false,
        0,
        undefined,
        (
          _store,
          _tableId,
          _cellId,
          _descending,
          _offset,
          _limit,
          sortedRowIds,
        ) => {
          expect(sortedRowIds).toEqual([
            'r5',
            'r4',
            'r1',
            'r6',
            'r3',
            'r2',
            'r7',
          ]);
        },
      );
      store.setRow('t1', 'r7', {c1: 7});
    });

    test('Cell sort listener, alter relevant cell', () => {
      expect.assertions(1);
      store.addSortedRowIdsListener(
        't1',
        'c2',
        false,
        0,
        undefined,
        (
          _store,
          _tableId,
          _cellId,
          _descending,
          _offset,
          _limit,
          sortedRowIds,
        ) => {
          expect(sortedRowIds).toEqual(['r5', 'r4', 'r6', 'r3', 'r2', 'r1']);
        },
      );
      store.setCell('t1', 'r1', 'c2', 'uno');
    });

    test('Cell sort listener, alter relevant cell, no change', () => {
      const listener = jest.fn();
      store.addSortedRowIdsListener('t1', 'c2', false, 0, undefined, listener);
      store.setCell('t1', 'r5', 'c2', 'cinq');
      expect(listener).toHaveBeenCalledTimes(0);
    });

    test('Cell sort listener, alter relevant cell, after page', () => {
      const listener = jest.fn();
      store.addSortedRowIdsListener('t1', 'c2', false, 0, 3, listener);
      store.setRow('t1', 'r7', {c1: 7, c2: 'seven'});
      expect(listener).toHaveBeenCalledTimes(0);
    });

    test('Cell sort listener, alter non-relevant cell', () => {
      const listener = jest.fn();
      store.addSortedRowIdsListener('t1', 'c2', false, 0, undefined, listener);
      store.setCell('t1', 'r1', 'c1', '1.0');
      expect(listener).toHaveBeenCalledTimes(0);
    });
  });

  describe('Miscellaneous', () => {
    test('Null prototype objects', () => {
      const tables = Object.create(null);
      const table = Object.create(null);
      const row = Object.create(null);
      row.c1 = 1;
      table.r1 = row;
      tables.t1 = table;
      store.setTables(tables);
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});

      const values = Object.create(null);
      values.v1 = 1;
      store.setValues(values);
      expect(store.getValues()).toEqual({v1: 1});
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

      test('forEachTableCell', () => {
        store.setTables({t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2, c3: 3}}});
        const cells: Row = {};
        store.forEachTableCell(
          't1',
          (cellId, count) => (cells[cellId] = count),
        );
        expect(cells).toEqual({c1: 1, c2: 2, c3: 1});
      });

      test('forEachValue', () => {
        store.setValues({v1: 1, v2: 2});
        const values: Values = {};
        store.forEachValue((valueId, value) => (values[valueId] = value));
        expect(values).toEqual({v1: 1, v2: 2});
      });
    });

    test('are things present', () => {
      expect(store.hasTables()).toEqual(false);
      expect(store.hasTable('t1')).toEqual(false);
      expect(store.hasTableCell('t1', 'c1')).toEqual(false);
      expect(store.hasRow('t1', 'r1')).toEqual(false);
      expect(store.hasCell('t1', 'r1', 'c1')).toEqual(false);
      expect(store.hasValues()).toEqual(false);
      expect(store.hasValue('v1')).toEqual(false);
      store.setTables({t1: {r1: {c1: 1}}});
      expect(store.hasTables()).toEqual(true);
      expect(store.hasTable('t1')).toEqual(true);
      expect(store.hasTable('t2')).toEqual(false);
      expect(store.hasTableCell('t1', 'c1')).toEqual(true);
      expect(store.hasTableCell('t1', 'c2')).toEqual(false);
      expect(store.hasRow('t1', 'r1')).toEqual(true);
      expect(store.hasRow('t1', 'r2')).toEqual(false);
      expect(store.hasCell('t1', 'r1', 'c1')).toEqual(true);
      expect(store.hasCell('t1', 'r1', 'c2')).toEqual(false);
      store.setValues({v1: 1});
      expect(store.hasValues()).toEqual(true);
      expect(store.hasValue('v1')).toEqual(true);
      expect(store.hasValue('v2')).toEqual(false);
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
      expect(store.getListenerStats().row).toEqual(2);
      expectChanges(
        listener,
        '/t1/r1a',
        {t1: {r1: {c1: 1}}},
        {t1: {r1: {c1: 2}}},
      );
      expectChanges(listener, '/t1/r1b', {t1: {r1: {c1: 2}}});
      expectNoChanges(listener);
      store.delListener('0').delListener('1');
      expect(store.getListenerStats().row).toEqual(0);
      store.setRow('t1', 'r1', {c1: 3});
      expectNoChanges(listener);
    });

    test('increments or re-uses listenerId', () => {
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
      expect(store.addTablesListener(() => 0)).toEqual('0');
      expect(store.addTablesListener(() => 0)).toEqual('1');
      for (let i = 0; i < 998; i++) {
        store.addTablesListener(() => 0);
      }
      expect(store.addTablesListener(() => 0)).toEqual('1101');

      store.delListener('555');
      store.delListener('666');
      expect(store.addTablesListener(() => 0)).toEqual('555');
      expect(store.addTablesListener(() => 0)).toEqual('666');
    });

    describe('re-uses rowIds', () => {
      test('adding', () => {
        store.addRow('t1', {c0: 0});
        store.addRow('t1', {c1: 1});
        expect(store.getTables()).toEqual({t1: {0: {c0: 0}, 1: {c1: 1}}});
      });

      test('delete and add again', () => {
        store.addRow('t1', {c0: 0});
        store.addRow('t1', {c1: 1});
        store.delRow('t1', '1');
        expect(store.getTables()).toEqual({t1: {0: {c0: 0}}});
        store.addRow('t1', {c1: 1});
        expect(store.getTables()).toEqual({t1: {0: {c0: 0}, 1: {c1: 1}}});
      });

      test('delete all and add again', () => {
        store.addRow('t1', {c0: 0});
        store.addRow('t1', {c1: 1});
        store.delTables();
        store.addRow('t1', {c0: 0});
        store.addRow('t1', {c1: 1});
        expect(store.getTables()).toEqual({t1: {0: {c0: 0}, 1: {c1: 1}}});
      });

      test('delete one, then manually insert, then add again', () => {
        store.addRow('t1', {c0: 0});
        store.addRow('t1', {c1: 1});
        store.delTables();
        store.setRow('t1', '0', {c0: 0});
        store.setRow('t1', '1', {c1: 1});
        store.addRow('t1', {c2: 2});
        store.addRow('t1', {c3: 3});
        expect(store.getTables()).toEqual({
          t1: {0: {c0: 0}, 1: {c1: 1}, 2: {c2: 2}, 3: {c3: 3}},
        });
      });
    });

    describe('does not re-use rowIds', () => {
      test('delete and add again', () => {
        store.addRow('t1', {c0: 0});
        store.addRow('t1', {c1: 1});
        store.delRow('t1', '1');
        expect(store.getTables()).toEqual({t1: {0: {c0: 0}}});
        store.addRow('t1', {c1: 1}, false);
        expect(store.getTables()).toEqual({t1: {0: {c0: 0}, 2: {c1: 1}}});
      });

      test('delete all and add again', () => {
        store.addRow('t1', {c0: 0});
        store.addRow('t1', {c1: 1});
        store.delTables();
        store.addRow('t1', {c0: 0}, false);
        store.addRow('t1', {c1: 1}, false);
        expect(store.getTables()).toEqual({t1: {0: {c0: 0}, 1: {c1: 1}}});
      });
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
      expect(listener).toHaveBeenCalled();
    });

    test('row listener with cell changes function', () => {
      expect.assertions(5);
      store = createStore().setTables({t1: {r1: {c1: 1, c2: 2, c3: 3}}});
      const listener = jest.fn(
        (_store, _tableId, _rowId, getCellChange: any) => {
          expect(getCellChange('t1', 'r1', 'c1')).toEqual([false, 1, 1]);
          expect(getCellChange('t1', 'r1', 'c2')).toEqual([true, 2, 3]);
          expect(getCellChange('t1', 'r1', 'c3')).toEqual([true, 3, undefined]);
          expect(getCellChange('t1', 'r1', 'c4')).toEqual([true, undefined, 4]);
        },
      );
      store.addRowListener('t1', 'r1', listener);
      store.setTables({t1: {r1: {c1: 1, c2: 3, c4: 4}}});
      expect(listener).toHaveBeenCalled();
    });

    test('value listener with new and old value', () => {
      expect.assertions(7);
      store = createStore().setValues({v1: 1});
      const listener = jest.fn((store2, valueId, newValue, oldValue) => {
        expect(store2).toEqual(store);
        expect(newValue).toEqual(2);
        expect(oldValue).toEqual(valueId == 'v1' ? 1 : undefined);
      });
      store.addValueListener(null, listener);
      store.setValues({v1: 2, v2: 2});
      expect(listener).toHaveBeenCalled();
    });

    test('values listener with value changes function', () => {
      expect.assertions(5);
      store = createStore().setValues({v1: 1, v2: 2, v3: 3});
      const listener = jest.fn((_store, getValueChange: any) => {
        expect(getValueChange('v1')).toEqual([false, 1, 1]);
        expect(getValueChange('v2')).toEqual([true, 2, 3]);
        expect(getValueChange('v3')).toEqual([true, 3, undefined]);
        expect(getValueChange('v4')).toEqual([true, undefined, 4]);
      });
      store.addValuesListener(listener);
      store.setValues({v1: 1, v2: 3, v4: 4});
      expect(listener).toHaveBeenCalled();
    });
  });

  describe('Transactions', () => {
    const originalTables = {t1: {r1: {c1: 1}}};
    const originalValues = {v1: 1};
    beforeEach(() => {
      store.setTables(originalTables).setValues(originalValues);
    });

    test('Empty', () => {
      const actions = jest.fn(() => null);
      store.transaction(actions);
      expect(actions).toHaveBeenCalledTimes(1);
    });

    test('Empty, nested', () => {
      const actions = jest.fn(() => null);
      store.transaction(() => store.transaction(actions));
      expect(actions).toHaveBeenCalledTimes(1);
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

    test('Transaction in a listener ignored 1', () => {
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
      expect(listenerTransaction).not.toHaveBeenCalled();
    });

    test('Transaction in a listener ignored 2', () => {
      listener.listenToCell('/t1/r1/c1', 't1', 'r1', 'c1');
      const listenerTransaction = jest.fn(() => {
        store.setTables({t1: {r1: {c1: 3}}});
      });
      store.addCellListener('t1', 'r1', 'c1', () => {
        store.startTransaction();
        listenerTransaction();
        store.finishTransaction();
      });
      store.setTables({t1: {r1: {c1: 2}}});
      expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: 2}}});
      expectNoChanges(listener);
      expect(listenerTransaction).toHaveBeenCalledTimes(1);
    });

    test('Adding a peer listener in a listener', () => {
      const listener = jest.fn(() => null);
      store.addCellListener('t1', 'r1', 'c1', () => {
        store.addCellListener('t1', 'r1', 'c1', listener);
      });
      store.setTables({t1: {r1: {c1: 2}}});
      expect(listener).toHaveBeenCalledTimes(1);
    });

    test('Adding a higher listener in a listener', () => {
      const listener = jest.fn(() => null);
      store.addCellListener('t1', 'r1', 'c1', () => {
        store.addRowListener('t1', 'r1', listener);
      });
      store.setTables({t1: {r1: {c1: 2}}});
      expect(listener).toHaveBeenCalledTimes(1);
    });

    test('Adding a lower listener in a listener', () => {
      const listener = jest.fn(() => null);
      store.addRowListener('t1', 'r1', () => {
        store.addCellListener('t1', 'r1', 'c1', listener);
      });
      store.setTables({t1: {r1: {c1: 2}}});
      expect(listener).not.toHaveBeenCalled();
    });

    test('Removing an earlier peer listener in a listener', () => {
      const listener = jest.fn(() => null);
      const listenerId = store.addCellListener('t1', 'r1', 'c1', listener);
      store.addCellListener('t1', 'r1', 'c1', () => {
        store.delListener(listenerId);
      });
      store.setTables({t1: {r1: {c1: 2}}});
      expect(listener).toHaveBeenCalledTimes(1);
    });

    test('Removing a later peer listener in a listener', () => {
      const listener = jest.fn(() => null);
      store.addCellListener('t1', 'r1', 'c1', () => {
        store.delListener(listenerId);
      });
      const listenerId = store.addCellListener('t1', 'r1', 'c1', listener);
      store.setTables({t1: {r1: {c1: 2}}});
      expect(listener).not.toHaveBeenCalled();
    });

    test('Removing a lower listener in a listener', () => {
      const listener = jest.fn(() => null);
      const listenerId = store.addCellListener('t1', 'r1', 'c1', listener);
      store.addRowListener('t1', 'r1', () => {
        store.delListener(listenerId);
      });
      store.setTables({t1: {r1: {c1: 2}}});
      expect(listener).toHaveBeenCalledTimes(1);
    });

    test('Removing a higher listener in a listener', () => {
      const listener = jest.fn(() => null);
      const listenerId = store.addRowListener('t1', 'r1', listener);
      store.addCellListener('t1', 'r1', 'c1', () => {
        store.delListener(listenerId);
      });
      store.setTables({t1: {r1: {c1: 2}}});
      expect(listener).not.toHaveBeenCalled();
    });

    describe('Rolling back', () => {
      describe('doRollback gets changed & invalid cells, returns true', () => {
        test('with setTables', () => {
          expect.assertions(10);
          store.transaction(
            // @ts-ignore
            () => store.setTables({t2: {r2: {c2: 2, c3: [3]}}}),
            () => {
              const [
                ,
                ,
                changedCells,
                invalidCells,
                changedValues,
                invalidValues,
                changedTableIds,
                changedRowIds,
                changedCellIds,
                changedValueIds,
              ] = store.getTransactionLog();
              expect(store.getTables()).toEqual({t2: {r2: {c2: 2}}});
              expect(changedCells).toEqual({
                t1: {r1: {c1: [1, undefined]}},
                t2: {r2: {c2: [undefined, 2]}},
              });
              expect(invalidCells).toEqual({t2: {r2: {c3: [[3]]}}});
              expect(changedValues).toEqual({});
              expect(invalidValues).toEqual({});
              expect(changedTableIds).toEqual({t1: -1, t2: 1});
              expect(changedRowIds).toEqual({t1: {r1: -1}, t2: {r2: 1}});
              expect(changedCellIds).toEqual({
                t1: {r1: {c1: -1}},
                t2: {r2: {c2: 1}},
              });
              expect(changedValueIds).toEqual({});
              return true;
            },
          );
          expect(store.getTables()).toEqual(originalTables);
        });

        test('with setTable', () => {
          expect.assertions(10);
          store.transaction(
            // @ts-ignore
            () => store.setTable('t2', {r2: {c2: 2, c3: [3]}}),
            () => {
              const [
                ,
                ,
                changedCells,
                invalidCells,
                changedValues,
                invalidValues,
                changedTableIds,
                changedRowIds,
                changedCellIds,
                changedValueIds,
              ] = store.getTransactionLog();
              expect(store.getTables()).toEqual({
                t1: {r1: {c1: 1}},
                t2: {r2: {c2: 2}},
              });
              expect(changedCells).toEqual({t2: {r2: {c2: [undefined, 2]}}});
              expect(invalidCells).toEqual({t2: {r2: {c3: [[3]]}}});
              expect(changedValues).toEqual({});
              expect(invalidValues).toEqual({});
              expect(changedTableIds).toEqual({t2: 1});
              expect(changedRowIds).toEqual({t2: {r2: 1}});
              expect(changedCellIds).toEqual({t2: {r2: {c2: 1}}});
              expect(changedValueIds).toEqual({});
              return true;
            },
          );
          expect(store.getTables()).toEqual(originalTables);
        });

        test('with setRow', () => {
          expect.assertions(10);
          store.transaction(
            // @ts-ignore
            () => store.setRow('t2', 'r2', {c2: 2, c3: [3]}),
            () => {
              const [
                ,
                ,
                changedCells,
                invalidCells,
                changedValues,
                invalidValues,
                changedTableIds,
                changedRowIds,
                changedCellIds,
                changedValueIds,
              ] = store.getTransactionLog();
              expect(store.getTables()).toEqual({
                t1: {r1: {c1: 1}},
                t2: {r2: {c2: 2}},
              });
              expect(changedCells).toEqual({t2: {r2: {c2: [undefined, 2]}}});
              expect(invalidCells).toEqual({t2: {r2: {c3: [[3]]}}});
              expect(changedValues).toEqual({});
              expect(invalidValues).toEqual({});
              expect(changedTableIds).toEqual({t2: 1});
              expect(changedRowIds).toEqual({t2: {r2: 1}});
              expect(changedCellIds).toEqual({t2: {r2: {c2: 1}}});
              expect(changedValueIds).toEqual({});
              return true;
            },
          );
          expect(store.getTables()).toEqual(originalTables);
        });

        test('with valid setCells', () => {
          expect.assertions(10);
          store.transaction(
            () => {
              store.setCell('t1', 'r1', 'c1', 2);
              store.setCell('t2', 'r2', 'c2', 2);
            },
            () => {
              const [
                ,
                ,
                changedCells,
                invalidCells,
                changedValues,
                invalidValues,
                changedTableIds,
                changedRowIds,
                changedCellIds,
                changedValueIds,
              ] = store.getTransactionLog();
              expect(store.getTables()).toEqual({
                t1: {r1: {c1: 2}},
                t2: {r2: {c2: 2}},
              });
              expect(changedCells).toEqual({
                t1: {r1: {c1: [1, 2]}},
                t2: {r2: {c2: [undefined, 2]}},
              });
              expect(invalidCells).toEqual({});
              expect(changedValues).toEqual({});
              expect(invalidValues).toEqual({});
              expect(changedTableIds).toEqual({t2: 1});
              expect(changedRowIds).toEqual({t2: {r2: 1}});
              expect(changedCellIds).toEqual({t2: {r2: {c2: 1}}});
              expect(changedValueIds).toEqual({});
              return true;
            },
          );
          expect(store.getTables()).toEqual(originalTables);
        });

        test('with invalid setCell', () => {
          expect.assertions(10);
          store.transaction(
            // @ts-ignore
            () => store.setCell('t2', 'r2', 'c3', [3]),
            () => {
              const [
                ,
                ,
                changedCells,
                invalidCells,
                changedValues,
                invalidValues,
                changedTableIds,
                changedRowIds,
                changedCellIds,
                changedValueIds,
              ] = store.getTransactionLog();
              expect(store.getTables()).toEqual(originalTables);
              expect(changedCells).toEqual({});
              expect(invalidCells).toEqual({t2: {r2: {c3: [[3]]}}});
              expect(changedValues).toEqual({});
              expect(invalidValues).toEqual({});
              expect(changedTableIds).toEqual({});
              expect(changedRowIds).toEqual({});
              expect(changedCellIds).toEqual({});
              expect(changedValueIds).toEqual({});
              return true;
            },
          );
          expect(store.getTables()).toEqual(originalTables);
        });

        test('with setValues', () => {
          expect.assertions(10);
          store.transaction(
            // @ts-ignore
            () => store.setValues({v2: 2, v3: [3]}),
            () => {
              const [
                ,
                ,
                changedCells,
                invalidCells,
                changedValues,
                invalidValues,
                changedTableIds,
                changedRowIds,
                changedCellIds,
                changedValueIds,
              ] = store.getTransactionLog();
              expect(store.getValues()).toEqual({v2: 2});
              expect(changedCells).toEqual({});
              expect(invalidCells).toEqual({});
              expect(changedValues).toEqual({
                v1: [1, undefined],
                v2: [undefined, 2],
              });
              expect(invalidValues).toEqual({v3: [[3]]});
              expect(changedTableIds).toEqual({});
              expect(changedRowIds).toEqual({});
              expect(changedCellIds).toEqual({});
              expect(changedValueIds).toEqual({v1: -1, v2: 1});
              return true;
            },
          );
          expect(store.getValues()).toEqual(originalValues);
        });

        test('with valid setValues', () => {
          expect.assertions(10);
          store.transaction(
            () => {
              store.setValue('v1', 2);
              store.setValue('v2', 2);
            },
            () => {
              const [
                ,
                ,
                changedCells,
                invalidCells,
                changedValues,
                invalidValues,
                changedTableIds,
                changedRowIds,
                changedCellIds,
                changedValueIds,
              ] = store.getTransactionLog();
              expect(store.getValues()).toEqual({v1: 2, v2: 2});
              expect(changedCells).toEqual({});
              expect(invalidCells).toEqual({});
              expect(changedValues).toEqual({v1: [1, 2], v2: [undefined, 2]});
              expect(invalidValues).toEqual({});
              expect(changedTableIds).toEqual({});
              expect(changedRowIds).toEqual({});
              expect(changedCellIds).toEqual({});
              expect(changedValueIds).toEqual({v2: 1});
              return true;
            },
          );
          expect(store.getValues()).toEqual(originalValues);
        });

        test('with invalid setValue', () => {
          expect.assertions(10);
          store.transaction(
            // @ts-ignore
            () => store.setValue('v3', [3]),
            () => {
              const [
                ,
                ,
                changedCells,
                invalidCells,
                changedValues,
                invalidValues,
                changedTableIds,
                changedRowIds,
                changedCellIds,
                changedValueIds,
              ] = store.getTransactionLog();
              expect(store.getValues()).toEqual(originalValues);
              expect(changedCells).toEqual({});
              expect(invalidCells).toEqual({});
              expect(changedValues).toEqual({});
              expect(invalidValues).toEqual({v3: [[3]]});
              expect(changedTableIds).toEqual({});
              expect(changedRowIds).toEqual({});
              expect(changedCellIds).toEqual({});
              expect(changedValueIds).toEqual({});
              return true;
            },
          );
          expect(store.getValues()).toEqual(originalValues);
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
            () => {
              const [, , changedCells, invalidCells] =
                store.getTransactionLog();
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

    describe('Transactions with explicit start & finish', () => {
      test('Finishing without starting does nothing', () => {
        const doRollback = jest.fn(() => true);
        store.finishTransaction(doRollback);
        expect(doRollback).toHaveBeenCalledTimes(0);
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
        store.startTransaction();
        store.setCell('t1', 'r1', 'c1', 2);
        store.setCell('t1', 'r1', 'c1', 1);
        store.setCell('t1', 'r1', 'c2', 3);
        store.delCell('t1', 'r1', 'c2');
        store.setRow('t1', 'r1', {c1: 3});
        store.setRow('t1', 'r2', {c2: 3});
        store.setRow('t1', 'b3', {c3: 4});
        store.delRow('t1', 'r1');
        store.setTable('t1', {r1: {c1: 4}});
        store.setTable('t2', {r2: {c2: 4}});
        store.setTable('a3', {b3: {c3: 5}});
        store.delTable('t2');
        store.setTables({t1: {r1: {c1: 5}}});
        store.finishTransaction();
        expectChanges(listener, '/', {t1: {r1: {c1: 5}}});
        expectChanges(listener, '/t1', {t1: {r1: {c1: 5}}});
        expectChanges(listener, '/t*', {t1: {r1: {c1: 5}}});
        expectChanges(listener, '/t1/r1', {t1: {r1: {c1: 5}}});
        expectChanges(listener, '/t1/r*', {t1: {r1: {c1: 5}}});
        expectChanges(listener, '/t1/r1/c1', {t1: {r1: {c1: 5}}});
        expectChanges(listener, '/t1/r1/c*', {t1: {r1: {c1: 5}}});
        expectNoChanges(listener);
      });

      test('rolling back with interesting sequence', () => {
        expect.assertions(4);
        store.startTransaction();
        store.setCell('t2', 'r2', 'c2', 2);
        store.setRow('t2', 'r3', {c3: 3});
        store.setTable('t3', {r3: {c3: 3}});
        store.delRow('t1', 'r1');
        store.delTable('t2');
        store.finishTransaction(() => {
          const [, , changedCells, invalidCells] = store.getTransactionLog();
          expect(store.getTables()).toEqual({t3: {r3: {c3: 3}}});
          expect(changedCells).toEqual({
            t1: {r1: {c1: [1, undefined]}},
            t3: {r3: {c3: [undefined, 3]}},
          });
          expect(invalidCells).toEqual({});
          return true;
        });
        expect(store.getTables()).toEqual(originalTables);
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
        expect(store.getTables()).toEqual({
          t1: {r1: {c1: 1}},
          t2: {r2: {c2: 2}},
        });
      });

      test('with setRow', () => {
        store.transaction(
          // @ts-ignore
          () => store.setRow('t2', 'r2', {c2: 2, c3: [3]}),
          () => false,
        );
        expect(store.getTables()).toEqual({
          t1: {r1: {c1: 1}},
          t2: {r2: {c2: 2}},
        });
      });

      test('with valid setCells', () => {
        store.transaction(
          () => {
            store.setCell('t1', 'r1', 'c1', 2);
            store.setCell('t2', 'r2', 'c2', 2);
          },
          () => false,
        );
        expect(store.getTables()).toEqual({
          t1: {r1: {c1: 2}},
          t2: {r2: {c2: 2}},
        });
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
        hasTables: 0,
        tables: 0,
        tableIds: 0,
        hasTable: 0,
        table: 0,
        tableCellIds: 0,
        hasTableCell: 0,
        rowCount: 0,
        rowIds: 0,
        sortedRowIds: 0,
        hasRow: 0,
        row: 0,
        cellIds: 0,
        hasCell: 0,
        cell: 0,
        invalidCell: 0,
        hasValues: 0,
        values: 0,
        valueIds: 0,
        hasValue: 0,
        value: 0,
        invalidValue: 0,
        transaction: 0,
      };
    });

    test('empty', () => {
      expect(store.getListenerStats()).toEqual(expectedListenerStats);
    });

    describe('listeners', () => {
      test.each([
        ['hasTables', []],
        ['tables', []],
        ['tableIds', []],
        ['hasTable', ['t1']],
        ['table', ['t1']],
        ['tableCellIds', ['t1']],
        ['hasTableCell', ['t1', 'c1']],
        ['rowCount', ['t1']],
        ['rowIds', ['t1']],
        ['sortedRowIds', ['t1', 'c1', true]],
        ['hasRow', ['t1']],
        ['row', ['t1', 'r1']],
        ['cellIds', ['t1', 'r1']],
        ['hasCell', ['t1', 'r1', 'c1']],
        ['cell', ['t1', 'r1', 'c1']],
        ['invalidCell', ['t1', 'r1', 'c1']],
        ['hasValues', []],
        ['values', []],
        ['valueIds', []],
        ['hasValue', ['v1']],
        ['value', ['v1']],
        ['invalidValue', ['v1']],
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

      test.each([
        ['startTransaction'],
        ['willFinishTransaction'],
        ['didFinishTransaction'],
      ])('%s', (thing) => {
        const addListener =
          'add' + thing[0].toUpperCase() + thing.substr(1) + 'Listener';
        expect(((store as any)[addListener] as any)((): null => null)).toEqual(
          '0',
        );
        expect(((store as any)[addListener] as any)((): null => null)).toEqual(
          '1',
        );
        expectedListenerStats.transaction = 2;
        expect(store.getListenerStats()).toEqual(expectedListenerStats);
        store.delListener('1');
        expectedListenerStats.transaction = 1;
        expect(store.getListenerStats()).toEqual(expectedListenerStats);
        store.delListener('0');
        expectedListenerStats.transaction = 0;
        expect(store.getListenerStats()).toEqual(expectedListenerStats);
      });
    });
  });
});
