import type {Id, Queries, Store} from 'tinybase/debug';
import {createQueries, createStore} from 'tinybase/debug';
import {expectChanges, expectNoChanges} from '../common/expect.ts';
import {QueriesListener} from '../common/types.ts';
import {createQueriesListener} from '../common/listeners.ts';
import {jest} from '@jest/globals';

let store: Store;
let queries: Queries;
let listener: QueriesListener;

beforeEach(() => {
  store = createStore();
  queries = createQueries(store);
});

const setCells = (
  tableId: Id = 't1',
  cellIdSuffix = '',
  stringSuffix = '',
  numberPrefix = '',
) => {
  const cellId = (cellId: Id) => `${cellId}${cellIdSuffix}`;
  const string = (string: Id) => `${string}${stringSuffix}`;
  const number = (number: number) =>
    numberPrefix === '' ? number : `${numberPrefix}${number}`;

  const r1 = {
    [cellId('c1')]: string('one'),
    [cellId('c2')]: string('odd'),
    [cellId('c3')]: number(1),
  };

  if (store.hasTables()) {
    store.setRow(tableId, 'r1', r1);
  } else {
    store.setTables({[tableId]: {r1}});
  }
  store
    .setTable(tableId, {
      r2: {
        [cellId('c1')]: string('two'),
        [cellId('c2')]: string('even'),
        [cellId('c3')]: number(2),
      },
      r3: {
        [cellId('c1')]: string('three'),
        [cellId('c2')]: string('odd'),
        [cellId('c3')]: number(3),
      },
    })
    .setRow(tableId, 'r1', r1)
    .setCell(tableId, 'r4', cellId('c1'), string('four'))
    .setCell(tableId, 'r4', cellId('c2'), string('even'))
    .setCell(tableId, 'r4', cellId('c3'), number(4));
};

const delCells = (tableId: Id = 't1') => {
  const cellId = (cellId: Id, cellIdSuffix = '') => `${cellId}${cellIdSuffix}`;
  store
    .delCell(tableId, 'r4', cellId('c3'))
    .delCell(tableId, 'r4', cellId('c2'))
    .delCell(tableId, 'r4', cellId('c1'))
    .delRow(tableId, 'r3')
    .delRow(tableId, 'r2')
    .delTable(tableId);
  if (store.hasTables()) {
    store.delRow(tableId, 'r1');
  } else {
    store.delTables();
  }
};

describe('Sets', () => {
  describe('Selects', () => {
    test('root table column by id', () => {
      setCells();
      queries.setQueryDefinition('q1', 't1', ({select}) => select('c1'));
      expect(queries.getResultTable('q1')).toEqual({
        r1: {c1: 'one'},
        r2: {c1: 'two'},
        r3: {c1: 'three'},
        r4: {c1: 'four'},
      });
      expect(queries.getResultTableCellIds('q1')).toEqual(['c1']);
      expect(queries.getResultRowCount('q1')).toEqual(4);
      expect(queries.getResultRowIds('q1')).toEqual(['r2', 'r3', 'r1', 'r4']);
      expect(queries.getResultRow('q1', 'r3')).toEqual({c1: 'three'});
      expect(queries.getResultCellIds('q1', 'r3')).toEqual(['c1']);
      expect(queries.getResultCell('q1', 'r1', 'c1')).toEqual('one');
      delCells();
      expect(queries.getResultTable('q1')).toEqual({});
      expect(queries.getStore().getListenerStats().row).toEqual(1);
      queries.delQueryDefinition('q1');
      expect(queries.getStore().getListenerStats().row).toEqual(0);
    });

    test('one root table column by id, aliased once', () => {
      setCells();
      queries.setQueryDefinition('q1', 't1', ({select}) => {
        select('c1');
        select('t1', 'c1').as('c_1');
      });
      expect(queries.getResultTable('q1')).toEqual({
        r1: {c1: 'one', c_1: 'one'},
        r2: {c1: 'two', c_1: 'two'},
        r3: {c1: 'three', c_1: 'three'},
        r4: {c1: 'four', c_1: 'four'},
      });
      delCells();
      expect(queries.getResultTable('q1')).toEqual({});
      expect(queries.getStore().getListenerStats().row).toEqual(1);
      queries.delQueryDefinition('q1');
      expect(queries.getStore().getListenerStats().row).toEqual(0);
    });

    test('two root table columns by id, aliased vice versa', () => {
      setCells();
      queries.setQueryDefinition('q1', 't1', ({select}) => {
        select('c1').as('c2');
        select('t1', 'c2').as('c1');
      });
      expect(queries.getResultTable('q1')).toEqual({
        r1: {c2: 'one', c1: 'odd'},
        r2: {c2: 'two', c1: 'even'},
        r3: {c2: 'three', c1: 'odd'},
        r4: {c2: 'four', c1: 'even'},
      });
      delCells();
      expect(queries.getResultTable('q1')).toEqual({});
      expect(queries.getStore().getListenerStats().row).toEqual(1);
      queries.delQueryDefinition('q1');
      expect(queries.getStore().getListenerStats().row).toEqual(0);
    });

    test('one root table column by derivation, some missing', () => {
      setCells();
      queries.setQueryDefinition('q1', 't1', ({select}) => {
        select((getTableCell) =>
          getTableCell('c2') == 'even' ? getTableCell('c1') : undefined,
        ).as('c1e');
      });
      expect(queries.getResultTable('q1')).toEqual({
        r2: {c1e: 'two'},
        r4: {c1e: 'four'},
      });
      delCells();
      expect(queries.getResultTable('q1')).toEqual({});
      expect(queries.getStore().getListenerStats().row).toEqual(1);
      queries.delQueryDefinition('q1');
      expect(queries.getStore().getListenerStats().row).toEqual(0);
    });

    test('two root table columns by derivation, un-aliased', () => {
      setCells();
      queries.setQueryDefinition('q1', 't1', ({select}) => {
        select((getTableCell) => (getTableCell('c1') as string)?.[0]);
        select((getTableCell) => (getTableCell('t1', 'c1') as string)?.[1]);
      });
      expect(queries.getResultTable('q1')).toEqual({
        r1: {0: 'o', 1: 'n'},
        r2: {0: 't', 1: 'w'},
        r3: {0: 't', 1: 'h'},
        r4: {0: 'f', 1: 'o'},
      });
      delCells();
      expect(queries.getResultTable('q1')).toEqual({});
      expect(queries.getStore().getListenerStats().row).toEqual(1);
      queries.delQueryDefinition('q1');
      expect(queries.getStore().getListenerStats().row).toEqual(0);
    });

    test('four root table columns by derivation, aliased', () => {
      setCells();
      queries.setQueryDefinition('q1', 't1', ({select}) => {
        select((getTableCell) => (getTableCell('c1') as string)?.[0]).as(
          'c1.0',
        );
        select((getTableCell) => (getTableCell('t1', 'c1') as string)?.[1]).as(
          'c1.1',
        );
        select(
          (getTableCell) => `${getTableCell('c1')}_${getTableCell('c2')}`,
        ).as('c1_2');
        select((_getTableCell, rowId) => rowId).as('r');
      });
      expect(queries.getResultTable('q1')).toEqual({
        r1: {'c1.0': 'o', 'c1.1': 'n', c1_2: 'one_odd', r: 'r1'},
        r2: {'c1.0': 't', 'c1.1': 'w', c1_2: 'two_even', r: 'r2'},
        r3: {'c1.0': 't', 'c1.1': 'h', c1_2: 'three_odd', r: 'r3'},
        r4: {'c1.0': 'f', 'c1.1': 'o', c1_2: 'four_even', r: 'r4'},
      });
      delCells();
      expect(queries.getResultTable('q1')).toEqual({});
      expect(queries.getStore().getListenerStats().row).toEqual(1);
      queries.delQueryDefinition('q1');
      expect(queries.getStore().getListenerStats().row).toEqual(0);
    });
  });

  describe('Joins', () => {
    test('table by id, select by id', () => {
      setCells('t1', '', '', 'r');
      setCells('t2', '', '.j');
      queries.setQueryDefinition('q1', 't1', ({select, join}) => {
        select('c1').as('t1.c1');
        select('t2', 'c1').as('t2.c1');
        join('t2', 'c3');
      });
      expect(queries.getResultTable('q1')).toEqual({
        r1: {'t1.c1': 'one', 't2.c1': 'one.j'},
        r2: {'t1.c1': 'two', 't2.c1': 'two.j'},
        r3: {'t1.c1': 'three', 't2.c1': 'three.j'},
        r4: {'t1.c1': 'four', 't2.c1': 'four.j'},
      });
      expect(queries.getStore().getListenerStats().row).toEqual(5);
      delCells('t2');
      delCells();
      expect(queries.getResultTable('q1')).toEqual({});
      expect(queries.getStore().getListenerStats().row).toEqual(1);
      queries.delQueryDefinition('q1');
      expect(queries.getStore().getListenerStats().row).toEqual(0);
    });

    test('table by id, select non-root id', () => {
      setCells('t1', '', '', 'r');
      setCells('t2', '', '.j');
      queries.setQueryDefinition('q1', 't1', ({select, join}) => {
        select('t2', 'c1').as('t2.c1');
        join('t2', 'c3');
      });
      expect(queries.getResultTable('q1')).toEqual({
        r1: {'t2.c1': 'one.j'},
        r2: {'t2.c1': 'two.j'},
        r3: {'t2.c1': 'three.j'},
        r4: {'t2.c1': 'four.j'},
      });
      expect(queries.getStore().getListenerStats().row).toEqual(5);
      delCells('t2');
      delCells();
      expect(queries.getResultTable('q1')).toEqual({});
      expect(queries.getStore().getListenerStats().row).toEqual(1);
      queries.delQueryDefinition('q1');
      expect(queries.getStore().getListenerStats().row).toEqual(0);
    });

    test('table by id, select by derivation', () => {
      setCells('t1', '', '', 'r');
      setCells('t2', '', '.j');
      queries.setQueryDefinition('q1', 't1', ({select, join}) => {
        select(
          (getTableCell) => `${getTableCell('c1')}.${getTableCell('t2', 'c2')}`,
        );
        join('t2', 'c3');
      });
      expect(queries.getResultTable('q1')).toEqual({
        r1: {0: 'one.odd.j'},
        r2: {0: 'two.even.j'},
        r3: {0: 'three.odd.j'},
        r4: {0: 'four.even.j'},
      });
      expect(queries.getStore().getListenerStats().row).toEqual(5);
      delCells('t2');
      delCells();
      expect(queries.getResultTable('q1')).toEqual({});
      expect(queries.getStore().getListenerStats().row).toEqual(1);
      queries.delQueryDefinition('q1');
      expect(queries.getStore().getListenerStats().row).toEqual(0);
    });

    test('table by derivation, select by id & derivation, some missing', () => {
      setCells();
      setCells('t2', '', '.j');
      queries.setQueryDefinition('q1', 't1', ({select, join}) => {
        select('c1').as('t1.c1');
        select('t2', 'c1').as('t2.c1');
        select((getTableCell) => `${getTableCell('t2', 'c2')}.d`).as('t2.c2');
        join('t2', (getCell, rowId) =>
          getCell('c2') === 'odd' || rowId === 'r2'
            ? `r${getCell('c3')}`
            : undefined,
        );
      });
      expect(queries.getResultTable('q1')).toEqual({
        r1: {'t1.c1': 'one', 't2.c1': 'one.j', 't2.c2': 'odd.j.d'},
        r2: {'t1.c1': 'two', 't2.c1': 'two.j', 't2.c2': 'even.j.d'},
        r3: {'t1.c1': 'three', 't2.c1': 'three.j', 't2.c2': 'odd.j.d'},
        r4: {'t1.c1': 'four', 't2.c2': 'undefined.d'},
      });
      expect(queries.getStore().getListenerStats().row).toEqual(4);
      delCells('t2');
      delCells();
      expect(queries.getResultTable('q1')).toEqual({});
      expect(queries.getStore().getListenerStats().row).toEqual(1);
      queries.delQueryDefinition('q1');
      expect(queries.getStore().getListenerStats().row).toEqual(0);
    });

    test('self by derivation', () => {
      setCells();
      queries.setQueryDefinition('q1', 't1', ({select, join}) => {
        select('c1').as('t1.c1');
        select('t2', 'c1').as('t2.c1');
        join('t1', (getCell) => `r${(getCell('c2') as string)?.length}`).as(
          't2',
        );
      });
      expect(queries.getResultTable('q1')).toEqual({
        r1: {'t1.c1': 'one', 't2.c1': 'three'},
        r2: {'t1.c1': 'two', 't2.c1': 'four'},
        r3: {'t1.c1': 'three', 't2.c1': 'three'},
        r4: {'t1.c1': 'four', 't2.c1': 'four'},
      });
      expect(queries.getStore().getListenerStats().row).toEqual(5);
      delCells();
      expect(queries.getResultTable('q1')).toEqual({});
      expect(queries.getStore().getListenerStats().row).toEqual(1);
      queries.delQueryDefinition('q1');
      expect(queries.getStore().getListenerStats().row).toEqual(0);
    });

    test('one table twice by derivation', () => {
      setCells();
      setCells('t2', '', '.j');
      queries.setQueryDefinition('q1', 't1', ({select, join}) => {
        select('c1').as('t1.c1');
        select('t2', 'c1').as('t2.c1');
        select('t3', 'c1').as('t3.c1');
        join('t2', (getCell) => `r${(getCell('c2') as string)?.length}`);
        join('t2', (getCell) => `r${(getCell('c2') as string)?.length - 1}`).as(
          't3',
        );
      });
      expect(queries.getResultTable('q1')).toEqual({
        r1: {'t1.c1': 'one', 't2.c1': 'three.j', 't3.c1': 'two.j'},
        r2: {'t1.c1': 'two', 't2.c1': 'four.j', 't3.c1': 'three.j'},
        r3: {'t1.c1': 'three', 't2.c1': 'three.j', 't3.c1': 'two.j'},
        r4: {'t1.c1': 'four', 't2.c1': 'four.j', 't3.c1': 'three.j'},
      });
      expect(queries.getStore().getListenerStats().row).toEqual(9);
      delCells('t2');
      delCells();
      expect(queries.getResultTable('q1')).toEqual({});
      expect(queries.getStore().getListenerStats().row).toEqual(1);
      queries.delQueryDefinition('q1');
      expect(queries.getStore().getListenerStats().row).toEqual(0);
    });

    test('two tables by derivation', () => {
      setCells();
      setCells('t2', '', '.j1');
      setCells('t3', '', '.j2');
      queries.setQueryDefinition('q1', 't1', ({select, join}) => {
        select('c1').as('t1.c1');
        select('t2', 'c1').as('t2.c1');
        select('t3', 'c1').as('t3.c1');
        join('t2', (getCell) => `r${(getCell('c2') as string)?.length}`);
        join('t3', (getCell) => `r${(getCell('c2') as string)?.length - 1}`);
      });
      expect(queries.getResultTable('q1')).toEqual({
        r1: {'t1.c1': 'one', 't2.c1': 'three.j1', 't3.c1': 'two.j2'},
        r2: {'t1.c1': 'two', 't2.c1': 'four.j1', 't3.c1': 'three.j2'},
        r3: {'t1.c1': 'three', 't2.c1': 'three.j1', 't3.c1': 'two.j2'},
        r4: {'t1.c1': 'four', 't2.c1': 'four.j1', 't3.c1': 'three.j2'},
      });
      expect(queries.getStore().getListenerStats().row).toEqual(9);
      delCells('t3');
      delCells('t2');
      delCells();
      expect(queries.getResultTable('q1')).toEqual({});
      expect(queries.getStore().getListenerStats().row).toEqual(1);
      queries.delQueryDefinition('q1');
      expect(queries.getStore().getListenerStats().row).toEqual(0);
    });

    test('double-joined table by id, aliased intermediate', () => {
      setCells();
      setCells('t2', '', '.j1');
      setCells('t3', '', '.j2');
      queries.setQueryDefinition('q1', 't1', ({select, join}) => {
        select('c1').as('t1.c1');
        select('t2a', 'c1').as('t2.c1');
        select('t3', 'c1').as('t3.c1');
        join('t2', (getCell) => `r${(getCell('c2') as string)?.length}`).as(
          't2a',
        );
        join(
          't3',
          't2a',
          (getCell) => `r${(getCell('c1') as string)?.length - 5}`,
        );
      });
      expect(queries.getResultTable('q1')).toEqual({
        r1: {'t1.c1': 'one', 't2.c1': 'three.j1', 't3.c1': 'three.j2'},
        r2: {'t1.c1': 'two', 't2.c1': 'four.j1', 't3.c1': 'two.j2'},
        r3: {'t1.c1': 'three', 't2.c1': 'three.j1', 't3.c1': 'three.j2'},
        r4: {'t1.c1': 'four', 't2.c1': 'four.j1', 't3.c1': 'two.j2'},
      });
      expect(queries.getStore().getListenerStats().row).toEqual(9);
      delCells('t3');
      delCells('t2');
      delCells();
      expect(queries.getResultTable('q1')).toEqual({});
      expect(queries.getStore().getListenerStats().row).toEqual(1);
      queries.delQueryDefinition('q1');
      expect(queries.getStore().getListenerStats().row).toEqual(0);
    });
  });

  describe('Wheres', () => {
    test('root table column by value', () => {
      setCells();
      queries.setQueryDefinition('q1', 't1', ({select, where}) => {
        select('c1');
        where('c1', 'two');
      });
      expect(queries.getResultTable('q1')).toEqual({r2: {c1: 'two'}});
      delCells();
      expect(queries.getResultTable('q1')).toEqual({});
      expect(queries.getStore().getListenerStats().row).toEqual(1);
      queries.delQueryDefinition('q1');
      expect(queries.getStore().getListenerStats().row).toEqual(0);
    });

    test('root table column by unselected value', () => {
      setCells();
      queries.setQueryDefinition('q1', 't1', ({select, where}) => {
        select('c1');
        where('c2', 'even');
      });
      expect(queries.getResultTable('q1')).toEqual({
        r2: {c1: 'two'},
        r4: {c1: 'four'},
      });
      delCells();
      expect(queries.getResultTable('q1')).toEqual({});
      expect(queries.getStore().getListenerStats().row).toEqual(1);
      queries.delQueryDefinition('q1');
      expect(queries.getStore().getListenerStats().row).toEqual(0);
    });

    test('root table column by derivation', () => {
      setCells();
      queries.setQueryDefinition('q1', 't1', ({select, where}) => {
        select('c1');
        where((getCell) => (getCell('c1') as string)[0] == 't');
      });
      expect(queries.getResultTable('q1')).toEqual({
        r2: {c1: 'two'},
        r3: {c1: 'three'},
      });
      delCells();
      expect(queries.getResultTable('q1')).toEqual({});
      expect(queries.getStore().getListenerStats().row).toEqual(1);
      queries.delQueryDefinition('q1');
      expect(queries.getStore().getListenerStats().row).toEqual(0);
    });

    test('root table two columns by derivation', () => {
      setCells();
      queries.setQueryDefinition('q1', 't1', ({select, where}) => {
        select('c1');
        where((getCell) => (getCell('c1') as string).includes('o'));
        where('c2', 'odd');
      });
      expect(queries.getResultTable('q1')).toEqual({r1: {c1: 'one'}});
      delCells();
      expect(queries.getResultTable('q1')).toEqual({});
      expect(queries.getStore().getListenerStats().row).toEqual(1);
      queries.delQueryDefinition('q1');
      expect(queries.getStore().getListenerStats().row).toEqual(0);
    });

    test('selected join table column by value', () => {
      setCells('t1', '', '', 'r');
      setCells('t2', '', '.j');
      queries.setQueryDefinition('q1', 't1', ({select, join, where}) => {
        select('c1').as('t1.c1');
        select('t2', 'c1').as('t2.c1');
        join('t2', 'c3');
        where('t2', 'c1', 'three.j');
      });
      expect(queries.getResultTable('q1')).toEqual({
        r3: {'t1.c1': 'three', 't2.c1': 'three.j'},
      });
      delCells();
      expect(queries.getResultTable('q1')).toEqual({});
      expect(queries.getStore().getListenerStats().row).toEqual(1);
      queries.delQueryDefinition('q1');
      expect(queries.getStore().getListenerStats().row).toEqual(0);
    });

    test('unselected join table column by value', () => {
      setCells('t1', '', '', 'r');
      setCells('t2', '', '.j');
      queries.setQueryDefinition('q1', 't1', ({select, join, where}) => {
        select('c1').as('t1.c1');
        select('t2', 'c1').as('t2.c1');
        join('t2', 'c3');
        where('t2', 'c2', 'odd.j');
      });
      expect(queries.getResultTable('q1')).toEqual({
        r1: {'t1.c1': 'one', 't2.c1': 'one.j'},
        r3: {'t1.c1': 'three', 't2.c1': 'three.j'},
      });
      delCells();
      expect(queries.getResultTable('q1')).toEqual({});
      expect(queries.getStore().getListenerStats().row).toEqual(1);
      queries.delQueryDefinition('q1');
      expect(queries.getStore().getListenerStats().row).toEqual(0);
    });

    test('root and join table columns by derivation', () => {
      setCells('t1', '', '', 'r');
      setCells('t2', '', '.j');
      queries.setQueryDefinition('q1', 't1', ({select, join, where}) => {
        select('c1').as('t1.c1');
        select('t2', 'c1').as('t2.c1');
        join('t2', 'c3');
        where(
          (getTableCell) =>
            getTableCell('c1') == 'four' || getTableCell('t2', 'c2') == 'odd.j',
        );
      });
      expect(queries.getResultTable('q1')).toEqual({
        r1: {'t1.c1': 'one', 't2.c1': 'one.j'},
        r3: {'t1.c1': 'three', 't2.c1': 'three.j'},
        r4: {'t1.c1': 'four', 't2.c1': 'four.j'},
      });
      delCells();
      expect(queries.getResultTable('q1')).toEqual({});
      expect(queries.getStore().getListenerStats().row).toEqual(1);
      queries.delQueryDefinition('q1');
      expect(queries.getStore().getListenerStats().row).toEqual(0);
    });
  });

  describe('Groups', () => {
    test('root table column by name', () => {
      setCells();
      queries.setQueryDefinition('q1', 't1', ({select, group}) => {
        select('c2');
        select('c3');
        group('c3', 'sum');
      });
      expect(queries.getResultTable('q1')).toEqual({
        0: {c2: 'even', c3: 6},
        1: {c2: 'odd', c3: 4},
      });
      delCells();
      expect(queries.getResultTable('q1')).toEqual({});
      expect(queries.getStore().getListenerStats().row).toEqual(1);
      queries.delQueryDefinition('q1');
      expect(queries.getStore().getListenerStats().row).toEqual(0);
    });

    test('root table column, changing groupBy', () => {
      store
        .setRow('t1', 'f1', {c1: 'f1', c2: 'fraction', c3: 0.25})
        .setRow('t1', 'f2', {c1: 'f2', c2: 'fraction', c3: 0.5})
        .setRow('t1', 'f3', {c1: 'f3', c2: 'fraction', c3: 1})
        .setRow('t1', 'f4', {c1: 'f4', c2: 'whole', c3: 2})
        .setCell('t1', 'f3', 'c2', 'whole');
      queries.setQueryDefinition('q1', 't1', ({select, group}) => {
        select('c2');
        select('c3');
        group('c3', 'sum');
      });
      expect(queries.getResultTable('q1')).toEqual({
        0: {c2: 'fraction', c3: 0.75},
        1: {c2: 'whole', c3: 3},
      });
      store.delTables();
      expect(queries.getResultTable('q1')).toEqual({});
      expect(queries.getStore().getListenerStats().row).toEqual(1);
      queries.delQueryDefinition('q1');
      expect(queries.getStore().getListenerStats().row).toEqual(0);
    });

    test('root table column, changing grouped', () => {
      store
        .setRow('t1', 'f1', {c1: 'f1', c2: 'fraction', c3: 0.25})
        .setRow('t1', 'f2', {c1: 'f2', c2: 'fraction', c3: 0.5})
        .setRow('t1', 'f3', {c1: 'f3', c2: 'fraction', c3: 1})
        .setRow('t1', 'f4', {c1: 'f4', c2: 'whole', c3: 2})
        .setCell('t1', 'f3', 'c3', 0.75);
      queries.setQueryDefinition('q1', 't1', ({select, group}) => {
        select('c2');
        select('c3');
        group('c3', 'sum');
      });
      expect(queries.getResultTable('q1')).toEqual({
        0: {c2: 'fraction', c3: 1.5},
        1: {c2: 'whole', c3: 2},
      });
      store.delTables();
      expect(queries.getResultTable('q1')).toEqual({});
      expect(queries.getStore().getListenerStats().row).toEqual(1);
      queries.delQueryDefinition('q1');
      expect(queries.getStore().getListenerStats().row).toEqual(0);
    });

    test('root table column by custom', () => {
      setCells();
      queries.setQueryDefinition('q1', 't1', ({select, group}) => {
        select('c2');
        select('c3');
        group('c3', (cells) => cells.join());
      });
      expect(queries.getResultTable('q1')).toEqual({
        0: {c2: 'even', c3: '2,4'},
        1: {c2: 'odd', c3: '3,1'},
      });
      delCells();
      expect(queries.getResultTable('q1')).toEqual({});
      expect(queries.getStore().getListenerStats().row).toEqual(1);
      queries.delQueryDefinition('q1');
      expect(queries.getStore().getListenerStats().row).toEqual(0);
    });

    test('one root table column twice', () => {
      setCells();
      queries.setQueryDefinition('q1', 't1', ({select, group}) => {
        select('c2');
        select('c3');
        group('c3', 'sum').as('sum');
        group('c3', 'avg').as('avg');
      });
      expect(queries.getResultTable('q1')).toEqual({
        0: {c2: 'even', sum: 6, avg: 3},
        1: {c2: 'odd', sum: 4, avg: 2},
      });
      delCells();
      expect(queries.getResultTable('q1')).toEqual({});
      expect(queries.getStore().getListenerStats().row).toEqual(1);
      queries.delQueryDefinition('q1');
      expect(queries.getStore().getListenerStats().row).toEqual(0);
    });

    test('join table column', () => {
      setCells('t1', '', '', 'r');
      setCells('t2', '', '.j');
      queries.setQueryDefinition('q1', 't1', ({select, join, group}) => {
        select('c2').as('t1.c2');
        select('t2', 'c3').as('t2.c3');
        join('t2', 'c3');
        group('t2.c3', 'sum');
      });
      expect(queries.getResultTable('q1')).toEqual({
        0: {'t1.c2': 'even', 't2.c3': 6},
        1: {'t1.c2': 'odd', 't2.c3': 4},
      });
      delCells();
      expect(queries.getResultTable('q1')).toEqual({});
      expect(queries.getStore().getListenerStats().row).toEqual(1);
      queries.delQueryDefinition('q1');
      expect(queries.getStore().getListenerStats().row).toEqual(0);
    });

    test('all groupBys', () => {
      store
        .setRow('t1', 'r1', {c1: 'one', c2: 'odd'})
        .setRow('t1', 'r2', {c1: 'two', c2: 'even'})
        .setRow('t1', 'r3', {c1: 'three', c2: 'odd'});
      queries.setQueryDefinition('q1', 't1', ({select, group}) => {
        select('c1');
        select('c2');
        select('c3');
        group('c3', 'sum');
      });
      expect(queries.getResultTable('q1')).toEqual({
        0: {c1: 'one', c2: 'odd'},
        1: {c1: 'two', c2: 'even'},
        2: {c1: 'three', c2: 'odd'},
      });
      store.delRow('t1', 'r1').delRow('t1', 'r2').delRow('t1', 'r3');
      expect(queries.getResultTable('q1')).toEqual({});
      expect(queries.getStore().getListenerStats().row).toEqual(1);
      queries.delQueryDefinition('q1');
      expect(queries.getStore().getListenerStats().row).toEqual(0);
    });

    test('all grouped', () => {
      store
        .setRow('t1', 'r1', {c1: 1})
        .setRow('t1', 'r2', {c1: 2})
        .setRow('t1', 'r3', {c1: 3});
      queries.setQueryDefinition('q1', 't1', ({select, group}) => {
        select('c1');
        group('c1', 'sum').as('sum');
        group('c1', 'avg').as('avg');
      });
      expect(queries.getResultTable('q1')).toEqual({0: {sum: 6, avg: 2}});
      store.delRow('t1', 'r1').delRow('t1', 'r2').delRow('t1', 'r3');
      expect(queries.getResultTable('q1')).toEqual({});
      expect(queries.getStore().getListenerStats().row).toEqual(1);
      queries.delQueryDefinition('q1');
      expect(queries.getStore().getListenerStats().row).toEqual(0);
    });

    test('multiple groupBys, multiple grouped, multiple changes', () => {
      store
        .setRow('t1', 'r1', {c1: 'A', c2: 'a', c3: 1, c4: 12})
        .setRow('t1', 'r2', {c1: 'A', c2: 'a', c3: 2, c4: 11})
        .setRow('t1', 'r3', {c1: 'A', c2: 'b', c3: 3, c4: 10})
        .setRow('t1', 'r4', {c1: 'A', c2: 'b', c3: 4, c4: 9})
        .setRow('t1', 'r5', {c1: 'B', c2: 'a', c3: 5, c4: 8})
        .setRow('t1', 'r6', {c1: 'B', c2: 'a', c3: 6, c4: 7})
        .setRow('t1', 'r7', {c1: 'B', c2: 'b', c3: 7, c4: 6})
        .setRow('t1', 'r8', {c1: 'B', c2: 'b', c3: 8, c4: 5})
        .setRow('t1', 'r9', {c1: 'C', c2: 'a', c3: 9, c4: 4})
        .setRow('t1', 'r10', {c1: 'C', c2: 'a', c3: 10, c4: 3})
        .setRow('t1', 'r11', {c1: 'C', c2: 'b', c3: 11, c4: 2})
        .setRow('t1', 'r12', {c1: 'C', c2: 'b', c3: 12, c4: 1})
        .delRow('t1', 'r1')
        .delCell('t1', 'r3', 'c1')
        .setRow('t1', 'r5', {c3: 5, c4: 4})
        .delCell('t1', 'r7', 'c3')
        .setRow('t1', 'r9', {c1: 'C', c2: 'a'})
        .setCell('t1', 'r11', 'c2', 'c');
      queries.setQueryDefinition('q1', 't1', ({select, group}) => {
        select('c1');
        select('c2');
        select('c3');
        select('c4');
        group('c3', 'count').as('cnt3');
        group('c3', 'avg').as('avg3');
        group('c4', 'avg').as('avg4');
        group('c3', 'sum').as('sum3');
        group('c4', 'sum').as('sum4');
      });
      expect(queries.getResultTable('q1')).toEqual({
        0: {c1: 'A', c2: 'a', cnt3: 1, avg3: 2, avg4: 11, sum3: 2, sum4: 11},
        1: {c2: 'b', cnt3: 1, sum3: 3, avg3: 3, avg4: 10, sum4: 10},
        2: {c1: 'A', c2: 'b', cnt3: 1, avg3: 4, avg4: 9, sum3: 4, sum4: 9},
        3: {cnt3: 1, sum3: 5, sum4: 4, avg3: 5, avg4: 4},
        4: {c1: 'B', c2: 'a', cnt3: 1, avg3: 6, avg4: 7, sum3: 6, sum4: 7},
        5: {c1: 'B', c2: 'b', cnt3: 1, avg3: 8, avg4: 5.5, sum3: 8, sum4: 11},
        6: {c1: 'C', c2: 'a', cnt3: 1, avg3: 10, avg4: 3, sum3: 10, sum4: 3},
        7: {c1: 'C', c2: 'c', cnt3: 1, avg3: 11, avg4: 2, sum3: 11, sum4: 2},
        8: {c1: 'C', c2: 'b', cnt3: 1, avg3: 12, avg4: 1, sum3: 12, sum4: 1},
      });
      store.delTable('t1');
      expect(queries.getResultTable('q1')).toEqual({});
      expect(queries.getStore().getListenerStats().row).toEqual(1);
      queries.delQueryDefinition('q1');
      expect(queries.getStore().getListenerStats().row).toEqual(0);
    });

    test('mixed type', () => {
      store
        .setRow('t1', 'r1', {c1: 'A', c2: 1})
        .setRow('t1', 'r2', {c1: 'A', c2: 2})
        .setRow('t1', 'r3', {c1: 'A', c2: 3})
        .setRow('t1', 'r3', {c1: 'A', c2: ''});
      queries.setQueryDefinition('q1', 't1', ({select, group}) => {
        select('c1');
        select('c2');
        group('c2', 'max').as('max');
      });
      expect(queries.getResultTable('q1')).toEqual({0: {c1: 'A', max: 2}});
      store.delRow('t1', 'r1').delRow('t1', 'r2').delRow('t1', 'r3');
      expect(queries.getResultTable('q1')).toEqual({});
      expect(queries.getStore().getListenerStats().row).toEqual(1);
      queries.delQueryDefinition('q1');
      expect(queries.getStore().getListenerStats().row).toEqual(0);
    });
  });

  describe('Havings', () => {
    test('grouped column by value', () => {
      setCells();
      queries.setQueryDefinition('q1', 't1', ({select, group, having}) => {
        select('c2');
        select('c3');
        group('c3', 'sum');
        having('c2', 'even');
      });
      expect(queries.getResultTable('q1')).toEqual({0: {c2: 'even', c3: 6}});
      delCells();
      expect(queries.getResultTable('q1')).toEqual({});
      expect(queries.getStore().getListenerStats().row).toEqual(1);
      queries.delQueryDefinition('q1');
      expect(queries.getStore().getListenerStats().row).toEqual(0);
    });

    test('group-by column by value', () => {
      setCells();
      queries.setQueryDefinition('q1', 't1', ({select, group, having}) => {
        select('c2');
        select('c3');
        group('c3', 'sum');
        having('c3', 4);
      });
      expect(queries.getResultTable('q1')).toEqual({0: {c2: 'odd', c3: 4}});
      delCells();
      expect(queries.getResultTable('q1')).toEqual({});
      expect(queries.getStore().getListenerStats().row).toEqual(1);
      queries.delQueryDefinition('q1');
      expect(queries.getStore().getListenerStats().row).toEqual(0);
    });

    test('aliased grouped and group-by column by derivation', () => {
      setCells();
      queries.setQueryDefinition('q1', 't1', ({select, group, having}) => {
        select('c2');
        select('c3');
        group('c3', 'sum').as('C3');
        having(
          (getSelectedOrGroupedCell) =>
            (getSelectedOrGroupedCell('c2') as string).length > 3,
        );
        having(
          (getSelectedOrGroupedCell) =>
            (getSelectedOrGroupedCell('C3') as number) > 4,
        );
      });
      expect(queries.getResultTable('q1')).toEqual({0: {c2: 'even', C3: 6}});
      delCells();
      expect(queries.getResultTable('q1')).toEqual({});
      expect(queries.getStore().getListenerStats().row).toEqual(1);
      queries.delQueryDefinition('q1');
      expect(queries.getStore().getListenerStats().row).toEqual(0);
    });

    test('without group', () => {
      setCells();
      queries.setQueryDefinition('q1', 't1', ({select, having}) => {
        select('c2');
        select('c3');
        having('c2', 'even');
      });
      expect(queries.getResultTable('q1')).toEqual({
        0: {c2: 'even', c3: 2},
        1: {c2: 'even', c3: 4},
      });
      delCells();
      expect(queries.getResultTable('q1')).toEqual({});
      expect(queries.getStore().getListenerStats().row).toEqual(1);
      queries.delQueryDefinition('q1');
      expect(queries.getStore().getListenerStats().row).toEqual(0);
    });
  });
});

test('Listens to QueryIds', () => {
  const listener = createQueriesListener(queries);
  const listenerId = listener.listenToQueryIds('/q');
  queries.setQueryDefinition('q1', 't1', () => 0);
  queries.setQueryDefinition('q2', 't2', () => 0);
  queries.delQueryDefinition('q1');
  expectChanges(listener, '/q', ['q1'], ['q1', 'q2'], ['q2']);
  expectNoChanges(listener);
  queries.delListener(listenerId);
});

describe('Listens to Queries when sets', () => {
  beforeEach(() => {
    listener = createQueriesListener(queries);
    listener.listenToResultTable('/q1', 'q1');
    listener.listenToResultTable('/q*', null);
  });

  test('and callback with ids', () => {
    expect.assertions(3);
    queries.setQueryDefinition('q1', 't1', ({select}) => select('c1'));
    const listener = jest.fn((queries2, queryId) => {
      expect(queries2).toEqual(queries);
      expect(queryId).toEqual('q1');
    });
    queries.addResultTableListener('q1', listener);
    store.setTables({t1: {r1: {c1: 'one'}}});
    expect(listener).toHaveBeenCalled();
  });

  describe('Selects', () => {
    test('root table column by id (all listeners)', () => {
      listener.listenToResultTableCellIds('/q1tc', 'q1');
      listener.listenToResultTableCellIds('/q*tc', null);
      listener.listenToResultRowCount('/q1r#', 'q1');
      listener.listenToResultRowCount('/q*r#', null);
      listener.listenToResultRowIds('/q1r', 'q1');
      listener.listenToResultRowIds('/q*r', null);
      listener.listenToResultSortedRowIds('/q1s', 'q1', 'c1', false, 0, 3);
      listener.listenToResultRow('/q1/r1', 'q1', 'r1');
      listener.listenToResultRow('/q1/r*', 'q1', null);
      listener.listenToResultCellIds('/q1/r1c', 'q1', 'r1');
      listener.listenToResultCellIds('/q1/r*c', 'q1', null);
      listener.listenToResultCell('/q1/r1/c1', 'q1', 'r1', 'c1');
      listener.listenToResultCell('/q1/r1/c*', 'q1', 'r1', null);
      queries.setQueryDefinition('q1', 't1', ({select}) => select('c1'));
      setCells();
      delCells();
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: {r1: {c1: 'one'}}},
          {q1: {r2: {c1: 'two'}, r3: {c1: 'three'}}},
          {q1: {r2: {c1: 'two'}, r3: {c1: 'three'}, r1: {c1: 'one'}}},
          {
            q1: {
              r2: {c1: 'two'},
              r3: {c1: 'three'},
              r1: {c1: 'one'},
              r4: {c1: 'four'},
            },
          },
          {q1: {r2: {c1: 'two'}, r3: {c1: 'three'}, r1: {c1: 'one'}}},
          {q1: {r2: {c1: 'two'}, r1: {c1: 'one'}}},
          {q1: {r1: {c1: 'one'}}},
          {q1: {}},
        ),
      );
      ['/q1tc', '/q*tc'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: [['c1'], {c1: 1}]},
          {q1: [[], {c1: -1}]},
        ),
      );
      ['/q1r#', '/q*r#'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: 1},
          {q1: 2},
          {q1: 3},
          {q1: 4},
          {q1: 3},
          {q1: 2},
          {q1: 1},
          {q1: 0},
        ),
      );
      ['/q1r', '/q*r'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: [['r1'], {r1: 1}]},
          {q1: [['r2', 'r3'], {r2: 1, r3: 1, r1: -1}]},
          {q1: [['r2', 'r3', 'r1'], {r1: 1}]},
          {q1: [['r2', 'r3', 'r1', 'r4'], {r4: 1}]},
          {q1: [['r2', 'r3', 'r1'], {r4: -1}]},
          {q1: [['r2', 'r1'], {r3: -1}]},
          {q1: [['r1'], {r2: -1}]},
          {q1: [[], {r1: -1}]},
        ),
      );
      expectChanges(
        listener,
        '/q1s',
        ['r1'],
        ['r3', 'r2'],
        ['r1', 'r3', 'r2'],
        ['r4', 'r1', 'r3'],
        ['r1', 'r3', 'r2'],
        ['r1', 'r2'],
        ['r1'],
        [],
      );
      expectChanges(
        listener,
        '/q1/r1',
        {q1: {r1: {c1: 'one'}}},
        {q1: {r1: {}}},
        {q1: {r1: {c1: 'one'}}},
        {q1: {r1: {}}},
      );
      expectChanges(
        listener,
        '/q1/r*',
        {q1: {r1: {c1: 'one'}}},
        {q1: {r2: {c1: 'two'}}},
        {q1: {r3: {c1: 'three'}}},
        {q1: {r1: {}}},
        {q1: {r1: {c1: 'one'}}},
        {q1: {r4: {c1: 'four'}}},
        {q1: {r4: {}}},
        {q1: {r3: {}}},
        {q1: {r2: {}}},
        {q1: {r1: {}}},
      );
      expectChanges(
        listener,
        '/q1/r1c',
        {q1: {r1: [['c1'], {c1: 1}]}},
        {q1: {r1: [[], {c1: -1}]}},
        {q1: {r1: [['c1'], {c1: 1}]}},
        {q1: {r1: [[], {c1: -1}]}},
      );
      expectChanges(
        listener,
        '/q1/r*c',
        {q1: {r1: [['c1'], {c1: 1}]}},
        {q1: {r2: [['c1'], {c1: 1}]}},
        {q1: {r3: [['c1'], {c1: 1}]}},
        {q1: {r1: [[], {c1: -1}]}},
        {q1: {r1: [['c1'], {c1: 1}]}},
        {q1: {r4: [['c1'], {c1: 1}]}},
        {q1: {r4: [[], {c1: -1}]}},
        {q1: {r3: [[], {c1: -1}]}},
        {q1: {r2: [[], {c1: -1}]}},
        {q1: {r1: [[], {c1: -1}]}},
      );
      ['/q1/r1/c*', '/q1/r1/c1'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: {r1: {c1: 'one'}}},
          {q1: {r1: {c1: undefined}}},
          {q1: {r1: {c1: 'one'}}},
          {q1: {r1: {c1: undefined}}},
        ),
      );
      expectNoChanges(listener);
    });

    test('one root table column by id, aliased once', () => {
      queries.setQueryDefinition('q1', 't1', ({select}) => {
        select('c1');
        select('t1', 'c1').as('c_1');
      });
      setCells();
      delCells();
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: {r1: {c1: 'one', c_1: 'one'}}},
          {q1: {r2: {c1: 'two', c_1: 'two'}, r3: {c1: 'three', c_1: 'three'}}},
          {
            q1: {
              r2: {c1: 'two', c_1: 'two'},
              r3: {c1: 'three', c_1: 'three'},
              r1: {c1: 'one', c_1: 'one'},
            },
          },
          {
            q1: {
              r2: {c1: 'two', c_1: 'two'},
              r3: {c1: 'three', c_1: 'three'},
              r1: {c1: 'one', c_1: 'one'},
              r4: {c1: 'four', c_1: 'four'},
            },
          },
          {
            q1: {
              r2: {c1: 'two', c_1: 'two'},
              r3: {c1: 'three', c_1: 'three'},
              r1: {c1: 'one', c_1: 'one'},
            },
          },
          {q1: {r2: {c1: 'two', c_1: 'two'}, r1: {c1: 'one', c_1: 'one'}}},
          {q1: {r1: {c1: 'one', c_1: 'one'}}},
          {q1: {}},
        ),
      );
      expectNoChanges(listener);
    });

    test('two root table columns by id, aliased vice versa', () => {
      queries.setQueryDefinition('q1', 't1', ({select}) => {
        select('c1').as('c2');
        select('t1', 'c2').as('c1');
      });
      setCells();
      delCells();
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: {r1: {c2: 'one', c1: 'odd'}}},
          {q1: {r2: {c2: 'two', c1: 'even'}, r3: {c2: 'three', c1: 'odd'}}},
          {
            q1: {
              r2: {c2: 'two', c1: 'even'},
              r3: {c2: 'three', c1: 'odd'},
              r1: {c2: 'one', c1: 'odd'},
            },
          },
          {
            q1: {
              r2: {c2: 'two', c1: 'even'},
              r3: {c2: 'three', c1: 'odd'},
              r1: {c2: 'one', c1: 'odd'},
              r4: {c2: 'four'},
            },
          },
          {
            q1: {
              r2: {c2: 'two', c1: 'even'},
              r3: {c2: 'three', c1: 'odd'},
              r1: {c2: 'one', c1: 'odd'},
              r4: {c2: 'four', c1: 'even'},
            },
          },
          {
            q1: {
              r2: {c2: 'two', c1: 'even'},
              r3: {c2: 'three', c1: 'odd'},
              r1: {c2: 'one', c1: 'odd'},
              r4: {c2: 'four'},
            },
          },
          {
            q1: {
              r2: {c2: 'two', c1: 'even'},
              r3: {c2: 'three', c1: 'odd'},
              r1: {c2: 'one', c1: 'odd'},
            },
          },
          {q1: {r2: {c2: 'two', c1: 'even'}, r1: {c2: 'one', c1: 'odd'}}},
          {q1: {r1: {c2: 'one', c1: 'odd'}}},
          {q1: {}},
        ),
      );
      expectNoChanges(listener);
    });

    test('one root table column by derivation, some missing', () => {
      queries.setQueryDefinition('q1', 't1', ({select}) => {
        select((getTableCell) =>
          getTableCell('c2') == 'even' ? getTableCell('c1') : undefined,
        ).as('c1e');
      });
      setCells();
      delCells();
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: {r2: {c1e: 'two'}}},
          {q1: {r2: {c1e: 'two'}, r4: {c1e: 'four'}}},
          {q1: {r2: {c1e: 'two'}}},
          {q1: {}},
        ),
      );
      expectNoChanges(listener);
    });

    test('two root table columns by derivation, un-aliased', () => {
      queries.setQueryDefinition('q1', 't1', ({select}) => {
        select((getTableCell) => (getTableCell('c1') as string)?.[0]);
        select((getTableCell) => (getTableCell('t1', 'c1') as string)?.[1]);
      });
      setCells();
      delCells();
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: {r1: {0: 'o', 1: 'n'}}},
          {q1: {r2: {0: 't', 1: 'w'}, r3: {0: 't', 1: 'h'}}},
          {
            q1: {
              r2: {0: 't', 1: 'w'},
              r3: {0: 't', 1: 'h'},
              r1: {0: 'o', 1: 'n'},
            },
          },
          {
            q1: {
              r2: {0: 't', 1: 'w'},
              r3: {0: 't', 1: 'h'},
              r1: {0: 'o', 1: 'n'},
              r4: {0: 'f', 1: 'o'},
            },
          },
          {
            q1: {
              r2: {0: 't', 1: 'w'},
              r3: {0: 't', 1: 'h'},
              r1: {0: 'o', 1: 'n'},
            },
          },
          {q1: {r2: {0: 't', 1: 'w'}, r1: {0: 'o', 1: 'n'}}},
          {q1: {r1: {0: 'o', 1: 'n'}}},
          {q1: {}},
        ),
      );
      expectNoChanges(listener);
    });

    test('four root table columns by derivation, aliased', () => {
      queries.setQueryDefinition('q1', 't1', ({select}) => {
        select((getTableCell) => (getTableCell('c1') as string)?.[0]).as(
          'c1.0',
        );
        select((getTableCell) => (getTableCell('t1', 'c1') as string)?.[1]).as(
          'c1.1',
        );
        select(
          (getTableCell) => `${getTableCell('c1')}_${getTableCell('c2')}`,
        ).as('c1_2');
        select((_getTableCell, rowId) => rowId).as('r');
      });
      setCells();
      delCells();
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: {r1: {'c1.0': 'o', 'c1.1': 'n', c1_2: 'one_odd', r: 'r1'}}},
          {
            q1: {
              r2: {'c1.0': 't', 'c1.1': 'w', c1_2: 'two_even', r: 'r2'},
              r3: {'c1.0': 't', 'c1.1': 'h', c1_2: 'three_odd', r: 'r3'},
            },
          },
          {
            q1: {
              r2: {'c1.0': 't', 'c1.1': 'w', c1_2: 'two_even', r: 'r2'},
              r3: {'c1.0': 't', 'c1.1': 'h', c1_2: 'three_odd', r: 'r3'},
              r1: {'c1.0': 'o', 'c1.1': 'n', c1_2: 'one_odd', r: 'r1'},
            },
          },
          {
            q1: {
              r2: {'c1.0': 't', 'c1.1': 'w', c1_2: 'two_even', r: 'r2'},
              r3: {'c1.0': 't', 'c1.1': 'h', c1_2: 'three_odd', r: 'r3'},
              r1: {'c1.0': 'o', 'c1.1': 'n', c1_2: 'one_odd', r: 'r1'},
              r4: {'c1.0': 'f', 'c1.1': 'o', c1_2: 'four_undefined', r: 'r4'},
            },
          },
          {
            q1: {
              r2: {'c1.0': 't', 'c1.1': 'w', c1_2: 'two_even', r: 'r2'},
              r3: {'c1.0': 't', 'c1.1': 'h', c1_2: 'three_odd', r: 'r3'},
              r1: {'c1.0': 'o', 'c1.1': 'n', c1_2: 'one_odd', r: 'r1'},
              r4: {'c1.0': 'f', 'c1.1': 'o', c1_2: 'four_even', r: 'r4'},
            },
          },
          {
            q1: {
              r2: {'c1.0': 't', 'c1.1': 'w', c1_2: 'two_even', r: 'r2'},
              r3: {'c1.0': 't', 'c1.1': 'h', c1_2: 'three_odd', r: 'r3'},
              r1: {'c1.0': 'o', 'c1.1': 'n', c1_2: 'one_odd', r: 'r1'},
              r4: {'c1.0': 'f', 'c1.1': 'o', c1_2: 'four_undefined', r: 'r4'},
            },
          },
          {
            q1: {
              r2: {'c1.0': 't', 'c1.1': 'w', c1_2: 'two_even', r: 'r2'},
              r3: {'c1.0': 't', 'c1.1': 'h', c1_2: 'three_odd', r: 'r3'},
              r1: {'c1.0': 'o', 'c1.1': 'n', c1_2: 'one_odd', r: 'r1'},
            },
          },
          {
            q1: {
              r2: {'c1.0': 't', 'c1.1': 'w', c1_2: 'two_even', r: 'r2'},
              r1: {'c1.0': 'o', 'c1.1': 'n', c1_2: 'one_odd', r: 'r1'},
            },
          },
          {q1: {r1: {'c1.0': 'o', 'c1.1': 'n', c1_2: 'one_odd', r: 'r1'}}},
          {q1: {}},
        ),
      );
      expectNoChanges(listener);
    });
  });

  describe('Joins', () => {
    test('table by id, select by id; t1, t2', () => {
      queries.setQueryDefinition('q1', 't1', ({select, join}) => {
        select('c1').as('t1.c1');
        select('t2', 'c1').as('t2.c1');
        join('t2', 'c3');
      });
      setCells('t1', '', '', 'r');
      setCells('t2', '', '.j');
      delCells('t2');
      delCells();
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: {r1: {'t1.c1': 'one'}}},
          {q1: {r2: {'t1.c1': 'two'}, r3: {'t1.c1': 'three'}}},
          {
            q1: {
              r2: {'t1.c1': 'two'},
              r3: {'t1.c1': 'three'},
              r1: {'t1.c1': 'one'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two'},
              r3: {'t1.c1': 'three'},
              r1: {'t1.c1': 'one'},
              r4: {'t1.c1': 'four'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two'},
              r3: {'t1.c1': 'three'},
              r1: {'t1.c1': 'one', 't2.c1': 'one.j'},
              r4: {'t1.c1': 'four'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c1': 'two.j'},
              r3: {'t1.c1': 'three', 't2.c1': 'three.j'},
              r1: {'t1.c1': 'one'},
              r4: {'t1.c1': 'four'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c1': 'two.j'},
              r3: {'t1.c1': 'three', 't2.c1': 'three.j'},
              r1: {'t1.c1': 'one', 't2.c1': 'one.j'},
              r4: {'t1.c1': 'four'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c1': 'two.j'},
              r3: {'t1.c1': 'three', 't2.c1': 'three.j'},
              r1: {'t1.c1': 'one', 't2.c1': 'one.j'},
              r4: {'t1.c1': 'four', 't2.c1': 'four.j'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c1': 'two.j'},
              r3: {'t1.c1': 'three', 't2.c1': 'three.j'},
              r1: {'t1.c1': 'one', 't2.c1': 'one.j'},
              r4: {'t1.c1': 'four'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c1': 'two.j'},
              r3: {'t1.c1': 'three'},
              r1: {'t1.c1': 'one', 't2.c1': 'one.j'},
              r4: {'t1.c1': 'four'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two'},
              r3: {'t1.c1': 'three'},
              r1: {'t1.c1': 'one', 't2.c1': 'one.j'},
              r4: {'t1.c1': 'four'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two'},
              r3: {'t1.c1': 'three'},
              r1: {'t1.c1': 'one'},
              r4: {'t1.c1': 'four'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two'},
              r3: {'t1.c1': 'three'},
              r1: {'t1.c1': 'one'},
            },
          },
          {q1: {r2: {'t1.c1': 'two'}, r1: {'t1.c1': 'one'}}},
          {q1: {r1: {'t1.c1': 'one'}}},
          {q1: {}},
        ),
      );
      expectNoChanges(listener);
    });

    test('table by id, select non-root id', () => {
      queries.setQueryDefinition('q1', 't1', ({select, join}) => {
        select('t2', 'c1').as('t2.c1');
        join('t2', 'c3');
      });
      setCells('t1', '', '', 'r');
      setCells('t2', '', '.j');
      delCells('t2');
      delCells();
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: {r1: {'t2.c1': 'one.j'}}},
          {q1: {r2: {'t2.c1': 'two.j'}, r3: {'t2.c1': 'three.j'}}},
          {
            q1: {
              r2: {'t2.c1': 'two.j'},
              r3: {'t2.c1': 'three.j'},
              r1: {'t2.c1': 'one.j'},
            },
          },
          {
            q1: {
              r2: {'t2.c1': 'two.j'},
              r3: {'t2.c1': 'three.j'},
              r1: {'t2.c1': 'one.j'},
              r4: {'t2.c1': 'four.j'},
            },
          },
          {
            q1: {
              r2: {'t2.c1': 'two.j'},
              r3: {'t2.c1': 'three.j'},
              r1: {'t2.c1': 'one.j'},
            },
          },
          {q1: {r2: {'t2.c1': 'two.j'}, r1: {'t2.c1': 'one.j'}}},
          {q1: {r1: {'t2.c1': 'one.j'}}},
          {q1: {}},
        ),
      );
      expectNoChanges(listener);
    });

    test('table by id, select by id; t2, t1', () => {
      queries.setQueryDefinition('q1', 't1', ({select, join}) => {
        select('c1').as('t1.c1');
        select('t2', 'c1').as('t2.c1');
        join('t2', 'c3');
      });
      setCells('t2', '', '.j');
      setCells('t1', '', '', 'r');
      delCells();
      delCells('t2');
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: {r1: {'t1.c1': 'one', 't2.c1': 'one.j'}}},
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c1': 'two.j'},
              r3: {'t1.c1': 'three', 't2.c1': 'three.j'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c1': 'two.j'},
              r3: {'t1.c1': 'three', 't2.c1': 'three.j'},
              r1: {'t1.c1': 'one', 't2.c1': 'one.j'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c1': 'two.j'},
              r3: {'t1.c1': 'three', 't2.c1': 'three.j'},
              r1: {'t1.c1': 'one', 't2.c1': 'one.j'},
              r4: {'t1.c1': 'four'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c1': 'two.j'},
              r3: {'t1.c1': 'three', 't2.c1': 'three.j'},
              r1: {'t1.c1': 'one', 't2.c1': 'one.j'},
              r4: {'t1.c1': 'four', 't2.c1': 'four.j'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c1': 'two.j'},
              r3: {'t1.c1': 'three', 't2.c1': 'three.j'},
              r1: {'t1.c1': 'one', 't2.c1': 'one.j'},
              r4: {'t1.c1': 'four'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c1': 'two.j'},
              r3: {'t1.c1': 'three', 't2.c1': 'three.j'},
              r1: {'t1.c1': 'one', 't2.c1': 'one.j'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c1': 'two.j'},
              r1: {'t1.c1': 'one', 't2.c1': 'one.j'},
            },
          },
          {q1: {r1: {'t1.c1': 'one', 't2.c1': 'one.j'}}},
          {q1: {}},
        ),
      );
      expectNoChanges(listener);
    });

    test('table by id, select by derivation; t1, t2', () => {
      queries.setQueryDefinition('q1', 't1', ({select, join}) => {
        select(
          (getTableCell) => `${getTableCell('c1')}.${getTableCell('t2', 'c2')}`,
        );
        join('t2', 'c3');
      });
      setCells('t1', '', '', 'r');
      setCells('t2', '', '.j');
      delCells('t2');
      delCells();
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: {r1: {0: 'one.undefined'}}},
          {q1: {r2: {0: 'two.undefined'}, r3: {0: 'three.undefined'}}},
          {
            q1: {
              r2: {0: 'two.undefined'},
              r3: {0: 'three.undefined'},
              r1: {0: 'one.undefined'},
            },
          },
          {
            q1: {
              r2: {0: 'two.undefined'},
              r3: {0: 'three.undefined'},
              r1: {0: 'one.undefined'},
              r4: {0: 'four.undefined'},
            },
          },
          {
            q1: {
              r2: {0: 'two.undefined'},
              r3: {0: 'three.undefined'},
              r1: {0: 'one.odd.j'},
              r4: {0: 'four.undefined'},
            },
          },
          {
            q1: {
              r2: {0: 'two.even.j'},
              r3: {0: 'three.odd.j'},
              r1: {0: 'one.undefined'},
              r4: {0: 'four.undefined'},
            },
          },
          {
            q1: {
              r2: {0: 'two.even.j'},
              r3: {0: 'three.odd.j'},
              r1: {0: 'one.odd.j'},
              r4: {0: 'four.undefined'},
            },
          },
          {
            q1: {
              r2: {0: 'two.even.j'},
              r3: {0: 'three.odd.j'},
              r1: {0: 'one.odd.j'},
              r4: {0: 'four.even.j'},
            },
          },
          {
            q1: {
              r2: {0: 'two.even.j'},
              r3: {0: 'three.odd.j'},
              r1: {0: 'one.odd.j'},
              r4: {0: 'four.undefined'},
            },
          },
          {
            q1: {
              r2: {0: 'two.even.j'},
              r3: {0: 'three.undefined'},
              r1: {0: 'one.odd.j'},
              r4: {0: 'four.undefined'},
            },
          },
          {
            q1: {
              r2: {0: 'two.undefined'},
              r3: {0: 'three.undefined'},
              r1: {0: 'one.odd.j'},
              r4: {0: 'four.undefined'},
            },
          },
          {
            q1: {
              r2: {0: 'two.undefined'},
              r3: {0: 'three.undefined'},
              r1: {0: 'one.undefined'},
              r4: {0: 'four.undefined'},
            },
          },
          {
            q1: {
              r2: {0: 'two.undefined'},
              r3: {0: 'three.undefined'},
              r1: {0: 'one.undefined'},
            },
          },
          {q1: {r2: {0: 'two.undefined'}, r1: {0: 'one.undefined'}}},
          {q1: {r1: {0: 'one.undefined'}}},
          {q1: {}},
        ),
      );
      expectNoChanges(listener);
    });

    test('table by id, select by derivation; t2, t1', () => {
      queries.setQueryDefinition('q1', 't1', ({select, join}) => {
        select(
          (getTableCell) => `${getTableCell('c1')}.${getTableCell('t2', 'c2')}`,
        );
        join('t2', 'c3');
      });
      setCells('t2', '', '.j');
      setCells('t1', '', '', 'r');
      delCells();
      delCells('t2');
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: {r1: {0: 'one.odd.j'}}},
          {q1: {r2: {0: 'two.even.j'}, r3: {0: 'three.odd.j'}}},
          {
            q1: {
              r2: {0: 'two.even.j'},
              r3: {0: 'three.odd.j'},
              r1: {0: 'one.odd.j'},
            },
          },
          {
            q1: {
              r2: {0: 'two.even.j'},
              r3: {0: 'three.odd.j'},
              r1: {0: 'one.odd.j'},
              r4: {0: 'four.undefined'},
            },
          },
          {
            q1: {
              r2: {0: 'two.even.j'},
              r3: {0: 'three.odd.j'},
              r1: {0: 'one.odd.j'},
              r4: {0: 'four.even.j'},
            },
          },
          {
            q1: {
              r2: {0: 'two.even.j'},
              r3: {0: 'three.odd.j'},
              r1: {0: 'one.odd.j'},
              r4: {0: 'four.undefined'},
            },
          },
          {
            q1: {
              r2: {0: 'two.even.j'},
              r3: {0: 'three.odd.j'},
              r1: {0: 'one.odd.j'},
            },
          },
          {q1: {r2: {0: 'two.even.j'}, r1: {0: 'one.odd.j'}}},
          {q1: {r1: {0: 'one.odd.j'}}},
          {q1: {}},
        ),
      );
      expectNoChanges(listener);
    });

    test('table by derivation, select by id & dv, some missing; t1, t2', () => {
      queries.setQueryDefinition('q1', 't1', ({select, join}) => {
        select('c1').as('t1.c1');
        select('t2', 'c1').as('t2.c1');
        select((getTableCell) => `${getTableCell('t2', 'c2')}.d`).as('t2.c2');
        join('t2', (getCell, rowId) =>
          getCell('c2') === 'odd' || rowId === 'r2'
            ? `r${getCell('c3')}`
            : undefined,
        );
      });
      setCells();
      setCells('t2', '', '.j');
      delCells('t2');
      delCells();
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: {r1: {'t1.c1': 'one', 't2.c2': 'undefined.d'}}},
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c2': 'undefined.d'},
              r3: {'t1.c1': 'three', 't2.c2': 'undefined.d'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c2': 'undefined.d'},
              r3: {'t1.c1': 'three', 't2.c2': 'undefined.d'},
              r1: {'t1.c1': 'one', 't2.c2': 'undefined.d'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c2': 'undefined.d'},
              r3: {'t1.c1': 'three', 't2.c2': 'undefined.d'},
              r1: {'t1.c1': 'one', 't2.c2': 'undefined.d'},
              r4: {'t1.c1': 'four', 't2.c2': 'undefined.d'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c2': 'undefined.d'},
              r3: {'t1.c1': 'three', 't2.c2': 'undefined.d'},
              r1: {'t1.c1': 'one', 't2.c2': 'odd.j.d', 't2.c1': 'one.j'},
              r4: {'t1.c1': 'four', 't2.c2': 'undefined.d'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c2': 'even.j.d', 't2.c1': 'two.j'},
              r3: {'t1.c1': 'three', 't2.c2': 'odd.j.d', 't2.c1': 'three.j'},
              r1: {'t1.c1': 'one', 't2.c2': 'undefined.d'},
              r4: {'t1.c1': 'four', 't2.c2': 'undefined.d'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c2': 'even.j.d', 't2.c1': 'two.j'},
              r3: {'t1.c1': 'three', 't2.c2': 'odd.j.d', 't2.c1': 'three.j'},
              r1: {'t1.c1': 'one', 't2.c2': 'odd.j.d', 't2.c1': 'one.j'},
              r4: {'t1.c1': 'four', 't2.c2': 'undefined.d'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c2': 'even.j.d', 't2.c1': 'two.j'},
              r3: {'t1.c1': 'three', 't2.c2': 'undefined.d'},
              r1: {'t1.c1': 'one', 't2.c2': 'odd.j.d', 't2.c1': 'one.j'},
              r4: {'t1.c1': 'four', 't2.c2': 'undefined.d'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c2': 'undefined.d'},
              r3: {'t1.c1': 'three', 't2.c2': 'undefined.d'},
              r1: {'t1.c1': 'one', 't2.c2': 'odd.j.d', 't2.c1': 'one.j'},
              r4: {'t1.c1': 'four', 't2.c2': 'undefined.d'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c2': 'undefined.d'},
              r3: {'t1.c1': 'three', 't2.c2': 'undefined.d'},
              r1: {'t1.c1': 'one', 't2.c2': 'undefined.d'},
              r4: {'t1.c1': 'four', 't2.c2': 'undefined.d'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c2': 'undefined.d'},
              r3: {'t1.c1': 'three', 't2.c2': 'undefined.d'},
              r1: {'t1.c1': 'one', 't2.c2': 'undefined.d'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c2': 'undefined.d'},
              r1: {'t1.c1': 'one', 't2.c2': 'undefined.d'},
            },
          },
          {q1: {r1: {'t1.c1': 'one', 't2.c2': 'undefined.d'}}},
          {q1: {}},
        ),
      );
      expectNoChanges(listener);
    });

    test('table by derivation, select by id & dv, some missing; t2, t1', () => {
      queries.setQueryDefinition('q1', 't1', ({select, join}) => {
        select('c1').as('t1.c1');
        select('t2', 'c1').as('t2.c1');
        select((getTableCell) => `${getTableCell('t2', 'c2')}.d`).as('t2.c2');
        join('t2', (getCell, rowId) =>
          getCell('c2') === 'odd' || rowId === 'r2'
            ? `r${getCell('c3')}`
            : undefined,
        );
      });
      setCells('t2', '', '.j');
      setCells();
      delCells();
      delCells('t2');
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: {r1: {'t1.c1': 'one', 't2.c2': 'odd.j.d', 't2.c1': 'one.j'}}},
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c2': 'even.j.d', 't2.c1': 'two.j'},
              r3: {'t1.c1': 'three', 't2.c2': 'odd.j.d', 't2.c1': 'three.j'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c2': 'even.j.d', 't2.c1': 'two.j'},
              r3: {'t1.c1': 'three', 't2.c2': 'odd.j.d', 't2.c1': 'three.j'},
              r1: {'t1.c1': 'one', 't2.c2': 'odd.j.d', 't2.c1': 'one.j'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c2': 'even.j.d', 't2.c1': 'two.j'},
              r3: {'t1.c1': 'three', 't2.c2': 'odd.j.d', 't2.c1': 'three.j'},
              r1: {'t1.c1': 'one', 't2.c2': 'odd.j.d', 't2.c1': 'one.j'},
              r4: {'t1.c1': 'four', 't2.c2': 'undefined.d'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c2': 'even.j.d', 't2.c1': 'two.j'},
              r3: {'t1.c1': 'three', 't2.c2': 'odd.j.d', 't2.c1': 'three.j'},
              r1: {'t1.c1': 'one', 't2.c2': 'odd.j.d', 't2.c1': 'one.j'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c2': 'even.j.d', 't2.c1': 'two.j'},
              r1: {'t1.c1': 'one', 't2.c2': 'odd.j.d', 't2.c1': 'one.j'},
            },
          },
          {q1: {r1: {'t1.c1': 'one', 't2.c2': 'odd.j.d', 't2.c1': 'one.j'}}},
          {q1: {}},
        ),
      );
      expectNoChanges(listener);
    });

    test('self by derivation', () => {
      queries.setQueryDefinition('q1', 't1', ({select, join}) => {
        select('c1').as('t1.c1');
        select('t2', 'c1').as('t2.c1');
        join('t1', (getCell) => `r${(getCell('c2') as string)?.length}`).as(
          't2',
        );
      });
      setCells();
      delCells();
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: {r1: {'t1.c1': 'one'}}},
          {
            q1: {
              r2: {'t1.c1': 'two'},
              r3: {'t1.c1': 'three', 't2.c1': 'three'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two'},
              r3: {'t1.c1': 'three', 't2.c1': 'three'},
              r1: {'t1.c1': 'one', 't2.c1': 'three'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c1': 'four'},
              r3: {'t1.c1': 'three', 't2.c1': 'three'},
              r1: {'t1.c1': 'one', 't2.c1': 'three'},
              r4: {'t1.c1': 'four'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c1': 'four'},
              r3: {'t1.c1': 'three', 't2.c1': 'three'},
              r1: {'t1.c1': 'one', 't2.c1': 'three'},
              r4: {'t1.c1': 'four', 't2.c1': 'four'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c1': 'four'},
              r3: {'t1.c1': 'three', 't2.c1': 'three'},
              r1: {'t1.c1': 'one', 't2.c1': 'three'},
              r4: {'t1.c1': 'four'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two'},
              r3: {'t1.c1': 'three', 't2.c1': 'three'},
              r1: {'t1.c1': 'one', 't2.c1': 'three'},
            },
          },
          {q1: {r2: {'t1.c1': 'two'}, r1: {'t1.c1': 'one'}}},
          {q1: {r1: {'t1.c1': 'one'}}},
          {q1: {}},
        ),
      );
      expectNoChanges(listener);
    });

    test('one table twice by derivation; t1, t2', () => {
      queries.setQueryDefinition('q1', 't1', ({select, join}) => {
        select('c1').as('t1.c1');
        select('t2', 'c1').as('t2.c1');
        select('t3', 'c1').as('t3.c1');
        join('t2', (getCell) => `r${(getCell('c2') as string)?.length}`);
        join('t2', (getCell) => `r${(getCell('c2') as string)?.length - 1}`).as(
          't3',
        );
      });
      setCells();
      setCells('t2', '', '.j');
      delCells('t2');
      delCells();
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: {r1: {'t1.c1': 'one'}}},
          {q1: {r2: {'t1.c1': 'two'}, r3: {'t1.c1': 'three'}}},
          {
            q1: {
              r2: {'t1.c1': 'two'},
              r3: {'t1.c1': 'three'},
              r1: {'t1.c1': 'one'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two'},
              r3: {'t1.c1': 'three'},
              r1: {'t1.c1': 'one'},
              r4: {'t1.c1': 'four'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't3.c1': 'three.j'},
              r3: {'t1.c1': 'three', 't2.c1': 'three.j', 't3.c1': 'two.j'},
              r1: {'t1.c1': 'one', 't2.c1': 'three.j', 't3.c1': 'two.j'},
              r4: {'t1.c1': 'four', 't3.c1': 'three.j'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't3.c1': 'three.j', 't2.c1': 'four.j'},
              r3: {'t1.c1': 'three', 't2.c1': 'three.j', 't3.c1': 'two.j'},
              r1: {'t1.c1': 'one', 't2.c1': 'three.j', 't3.c1': 'two.j'},
              r4: {'t1.c1': 'four', 't3.c1': 'three.j', 't2.c1': 'four.j'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't3.c1': 'three.j'},
              r3: {'t1.c1': 'three', 't2.c1': 'three.j', 't3.c1': 'two.j'},
              r1: {'t1.c1': 'one', 't2.c1': 'three.j', 't3.c1': 'two.j'},
              r4: {'t1.c1': 'four', 't3.c1': 'three.j'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two'},
              r3: {'t1.c1': 'three', 't3.c1': 'two.j'},
              r1: {'t1.c1': 'one', 't3.c1': 'two.j'},
              r4: {'t1.c1': 'four'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two'},
              r3: {'t1.c1': 'three'},
              r1: {'t1.c1': 'one'},
              r4: {'t1.c1': 'four'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two'},
              r3: {'t1.c1': 'three'},
              r1: {'t1.c1': 'one'},
            },
          },
          {q1: {r2: {'t1.c1': 'two'}, r1: {'t1.c1': 'one'}}},
          {q1: {r1: {'t1.c1': 'one'}}},
          {q1: {}},
        ),
      );
      expectNoChanges(listener);
    });

    test('one table twice by derivation; t2, t1', () => {
      queries.setQueryDefinition('q1', 't1', ({select, join}) => {
        select('c1').as('t1.c1');
        select('t2', 'c1').as('t2.c1');
        select('t3', 'c1').as('t3.c1');
        join('t2', (getCell) => `r${(getCell('c2') as string)?.length}`);
        join('t2', (getCell) => `r${(getCell('c2') as string)?.length - 1}`).as(
          't3',
        );
      });
      setCells('t2', '', '.j');
      setCells();
      delCells();
      delCells('t2');
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: {r1: {'t1.c1': 'one', 't2.c1': 'three.j', 't3.c1': 'two.j'}}},
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c1': 'four.j', 't3.c1': 'three.j'},
              r3: {'t1.c1': 'three', 't2.c1': 'three.j', 't3.c1': 'two.j'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c1': 'four.j', 't3.c1': 'three.j'},
              r3: {'t1.c1': 'three', 't2.c1': 'three.j', 't3.c1': 'two.j'},
              r1: {'t1.c1': 'one', 't2.c1': 'three.j', 't3.c1': 'two.j'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c1': 'four.j', 't3.c1': 'three.j'},
              r3: {'t1.c1': 'three', 't2.c1': 'three.j', 't3.c1': 'two.j'},
              r1: {'t1.c1': 'one', 't2.c1': 'three.j', 't3.c1': 'two.j'},
              r4: {'t1.c1': 'four'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c1': 'four.j', 't3.c1': 'three.j'},
              r3: {'t1.c1': 'three', 't2.c1': 'three.j', 't3.c1': 'two.j'},
              r1: {'t1.c1': 'one', 't2.c1': 'three.j', 't3.c1': 'two.j'},
              r4: {'t1.c1': 'four', 't2.c1': 'four.j', 't3.c1': 'three.j'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c1': 'four.j', 't3.c1': 'three.j'},
              r3: {'t1.c1': 'three', 't2.c1': 'three.j', 't3.c1': 'two.j'},
              r1: {'t1.c1': 'one', 't2.c1': 'three.j', 't3.c1': 'two.j'},
              r4: {'t1.c1': 'four'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c1': 'four.j', 't3.c1': 'three.j'},
              r3: {'t1.c1': 'three', 't2.c1': 'three.j', 't3.c1': 'two.j'},
              r1: {'t1.c1': 'one', 't2.c1': 'three.j', 't3.c1': 'two.j'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c1': 'four.j', 't3.c1': 'three.j'},
              r1: {'t1.c1': 'one', 't2.c1': 'three.j', 't3.c1': 'two.j'},
            },
          },
          {q1: {r1: {'t1.c1': 'one', 't2.c1': 'three.j', 't3.c1': 'two.j'}}},
          {q1: {}},
        ),
      );
      expectNoChanges(listener);
    });

    test('two tables by derivation; t1, t2, t3', () => {
      queries.setQueryDefinition('q1', 't1', ({select, join}) => {
        select('c1').as('t1.c1');
        select('t2', 'c1').as('t2.c1');
        select('t3', 'c1').as('t3.c1');
        join('t2', (getCell) => `r${(getCell('c2') as string)?.length}`);
        join('t3', (getCell) => `r${(getCell('c2') as string)?.length - 1}`);
      });
      setCells();
      setCells('t2', '', '.j1');
      setCells('t3', '', '.j2');
      delCells('t3');
      delCells('t2');
      delCells();
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: {r1: {'t1.c1': 'one'}}},
          {q1: {r2: {'t1.c1': 'two'}, r3: {'t1.c1': 'three'}}},
          {
            q1: {
              r2: {'t1.c1': 'two'},
              r3: {'t1.c1': 'three'},
              r1: {'t1.c1': 'one'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two'},
              r3: {'t1.c1': 'three'},
              r1: {'t1.c1': 'one'},
              r4: {'t1.c1': 'four'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two'},
              r3: {'t1.c1': 'three', 't2.c1': 'three.j1'},
              r1: {'t1.c1': 'one', 't2.c1': 'three.j1'},
              r4: {'t1.c1': 'four'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c1': 'four.j1'},
              r3: {'t1.c1': 'three', 't2.c1': 'three.j1'},
              r1: {'t1.c1': 'one', 't2.c1': 'three.j1'},
              r4: {'t1.c1': 'four', 't2.c1': 'four.j1'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c1': 'four.j1', 't3.c1': 'three.j2'},
              r3: {'t1.c1': 'three', 't2.c1': 'three.j1', 't3.c1': 'two.j2'},
              r1: {'t1.c1': 'one', 't2.c1': 'three.j1', 't3.c1': 'two.j2'},
              r4: {'t1.c1': 'four', 't2.c1': 'four.j1', 't3.c1': 'three.j2'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c1': 'four.j1'},
              r3: {'t1.c1': 'three', 't2.c1': 'three.j1', 't3.c1': 'two.j2'},
              r1: {'t1.c1': 'one', 't2.c1': 'three.j1', 't3.c1': 'two.j2'},
              r4: {'t1.c1': 'four', 't2.c1': 'four.j1'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c1': 'four.j1'},
              r3: {'t1.c1': 'three', 't2.c1': 'three.j1'},
              r1: {'t1.c1': 'one', 't2.c1': 'three.j1'},
              r4: {'t1.c1': 'four', 't2.c1': 'four.j1'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two'},
              r3: {'t1.c1': 'three', 't2.c1': 'three.j1'},
              r1: {'t1.c1': 'one', 't2.c1': 'three.j1'},
              r4: {'t1.c1': 'four'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two'},
              r3: {'t1.c1': 'three'},
              r1: {'t1.c1': 'one'},
              r4: {'t1.c1': 'four'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two'},
              r3: {'t1.c1': 'three'},
              r1: {'t1.c1': 'one'},
            },
          },
          {q1: {r2: {'t1.c1': 'two'}, r1: {'t1.c1': 'one'}}},
          {q1: {r1: {'t1.c1': 'one'}}},
          {q1: {}},
        ),
      );
      expectNoChanges(listener);
    });

    test('two tables by derivation; t2, t3, t1', () => {
      queries.setQueryDefinition('q1', 't1', ({select, join}) => {
        select('c1').as('t1.c1');
        select('t2', 'c1').as('t2.c1');
        select('t3', 'c1').as('t3.c1');
        join('t2', (getCell) => `r${(getCell('c2') as string)?.length}`);
        join('t3', (getCell) => `r${(getCell('c2') as string)?.length - 1}`);
      });
      setCells('t2', '', '.j1');
      setCells('t3', '', '.j2');
      setCells();
      delCells();
      delCells('t3');
      delCells('t2');
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: {r1: {'t1.c1': 'one', 't2.c1': 'three.j1', 't3.c1': 'two.j2'}}},
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c1': 'four.j1', 't3.c1': 'three.j2'},
              r3: {'t1.c1': 'three', 't2.c1': 'three.j1', 't3.c1': 'two.j2'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c1': 'four.j1', 't3.c1': 'three.j2'},
              r3: {'t1.c1': 'three', 't2.c1': 'three.j1', 't3.c1': 'two.j2'},
              r1: {'t1.c1': 'one', 't2.c1': 'three.j1', 't3.c1': 'two.j2'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c1': 'four.j1', 't3.c1': 'three.j2'},
              r3: {'t1.c1': 'three', 't2.c1': 'three.j1', 't3.c1': 'two.j2'},
              r1: {'t1.c1': 'one', 't2.c1': 'three.j1', 't3.c1': 'two.j2'},
              r4: {'t1.c1': 'four'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c1': 'four.j1', 't3.c1': 'three.j2'},
              r3: {'t1.c1': 'three', 't2.c1': 'three.j1', 't3.c1': 'two.j2'},
              r1: {'t1.c1': 'one', 't2.c1': 'three.j1', 't3.c1': 'two.j2'},
              r4: {'t1.c1': 'four', 't2.c1': 'four.j1', 't3.c1': 'three.j2'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c1': 'four.j1', 't3.c1': 'three.j2'},
              r3: {'t1.c1': 'three', 't2.c1': 'three.j1', 't3.c1': 'two.j2'},
              r1: {'t1.c1': 'one', 't2.c1': 'three.j1', 't3.c1': 'two.j2'},
              r4: {'t1.c1': 'four'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c1': 'four.j1', 't3.c1': 'three.j2'},
              r3: {'t1.c1': 'three', 't2.c1': 'three.j1', 't3.c1': 'two.j2'},
              r1: {'t1.c1': 'one', 't2.c1': 'three.j1', 't3.c1': 'two.j2'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c1': 'four.j1', 't3.c1': 'three.j2'},
              r1: {'t1.c1': 'one', 't2.c1': 'three.j1', 't3.c1': 'two.j2'},
            },
          },
          {q1: {r1: {'t1.c1': 'one', 't2.c1': 'three.j1', 't3.c1': 'two.j2'}}},
          {q1: {}},
        ),
      );
      expectNoChanges(listener);
    });

    test('double-joined table by id, aliased intermediate; t1, t2, t3', () => {
      queries.setQueryDefinition('q1', 't1', ({select, join}) => {
        select('c1').as('t1.c1');
        select('t2a', 'c1').as('t2.c1');
        select('t3', 'c1').as('t3.c1');
        join('t2', (getCell) => `r${(getCell('c2') as string)?.length}`).as(
          't2a',
        );
        join(
          't3',
          't2a',
          (getCell) => `r${(getCell('c1') as string)?.length - 5}`,
        );
      });
      setCells();
      setCells('t2', '', '.j1');
      setCells('t3', '', '.j2');
      delCells('t3');
      delCells('t2');
      delCells();
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: {r1: {'t1.c1': 'one'}}},
          {q1: {r2: {'t1.c1': 'two'}, r3: {'t1.c1': 'three'}}},
          {
            q1: {
              r2: {'t1.c1': 'two'},
              r3: {'t1.c1': 'three'},
              r1: {'t1.c1': 'one'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two'},
              r3: {'t1.c1': 'three'},
              r1: {'t1.c1': 'one'},
              r4: {'t1.c1': 'four'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two'},
              r3: {'t1.c1': 'three', 't2.c1': 'three.j1'},
              r1: {'t1.c1': 'one', 't2.c1': 'three.j1'},
              r4: {'t1.c1': 'four'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c1': 'four.j1'},
              r3: {'t1.c1': 'three', 't2.c1': 'three.j1'},
              r1: {'t1.c1': 'one', 't2.c1': 'three.j1'},
              r4: {'t1.c1': 'four', 't2.c1': 'four.j1'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c1': 'four.j1', 't3.c1': 'two.j2'},
              r3: {'t1.c1': 'three', 't2.c1': 'three.j1', 't3.c1': 'three.j2'},
              r1: {'t1.c1': 'one', 't2.c1': 'three.j1', 't3.c1': 'three.j2'},
              r4: {'t1.c1': 'four', 't2.c1': 'four.j1', 't3.c1': 'two.j2'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c1': 'four.j1', 't3.c1': 'two.j2'},
              r3: {'t1.c1': 'three', 't2.c1': 'three.j1'},
              r1: {'t1.c1': 'one', 't2.c1': 'three.j1'},
              r4: {'t1.c1': 'four', 't2.c1': 'four.j1', 't3.c1': 'two.j2'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c1': 'four.j1'},
              r3: {'t1.c1': 'three', 't2.c1': 'three.j1'},
              r1: {'t1.c1': 'one', 't2.c1': 'three.j1'},
              r4: {'t1.c1': 'four', 't2.c1': 'four.j1'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two'},
              r3: {'t1.c1': 'three', 't2.c1': 'three.j1'},
              r1: {'t1.c1': 'one', 't2.c1': 'three.j1'},
              r4: {'t1.c1': 'four'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two'},
              r3: {'t1.c1': 'three'},
              r1: {'t1.c1': 'one'},
              r4: {'t1.c1': 'four'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two'},
              r3: {'t1.c1': 'three'},
              r1: {'t1.c1': 'one'},
            },
          },
          {q1: {r2: {'t1.c1': 'two'}, r1: {'t1.c1': 'one'}}},
          {q1: {r1: {'t1.c1': 'one'}}},
          {q1: {}},
        ),
      );
      expectNoChanges(listener);
    });

    test('double-joined table by id, aliased intermediate; t1, t3, t2', () => {
      queries.setQueryDefinition('q1', 't1', ({select, join}) => {
        select('c1').as('t1.c1');
        select('t2a', 'c1').as('t2.c1');
        select('t3', 'c1').as('t3.c1');
        join('t2', (getCell) => `r${(getCell('c2') as string)?.length}`).as(
          't2a',
        );
        join(
          't3',
          't2a',
          (getCell) => `r${(getCell('c1') as string)?.length - 5}`,
        );
      });
      setCells();
      setCells('t3', '', '.j2');
      setCells('t2', '', '.j1');
      delCells('t2');
      delCells('t3');
      delCells();
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: {r1: {'t1.c1': 'one'}}},
          {q1: {r2: {'t1.c1': 'two'}, r3: {'t1.c1': 'three'}}},
          {
            q1: {
              r2: {'t1.c1': 'two'},
              r3: {'t1.c1': 'three'},
              r1: {'t1.c1': 'one'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two'},
              r3: {'t1.c1': 'three'},
              r1: {'t1.c1': 'one'},
              r4: {'t1.c1': 'four'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two'},
              r3: {'t1.c1': 'three', 't2.c1': 'three.j1', 't3.c1': 'three.j2'},
              r1: {'t1.c1': 'one', 't2.c1': 'three.j1', 't3.c1': 'three.j2'},
              r4: {'t1.c1': 'four'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't2.c1': 'four.j1', 't3.c1': 'two.j2'},
              r3: {'t1.c1': 'three', 't2.c1': 'three.j1', 't3.c1': 'three.j2'},
              r1: {'t1.c1': 'one', 't2.c1': 'three.j1', 't3.c1': 'three.j2'},
              r4: {'t1.c1': 'four', 't2.c1': 'four.j1', 't3.c1': 'two.j2'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two'},
              r3: {'t1.c1': 'three', 't2.c1': 'three.j1', 't3.c1': 'three.j2'},
              r1: {'t1.c1': 'one', 't2.c1': 'three.j1', 't3.c1': 'three.j2'},
              r4: {'t1.c1': 'four'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two'},
              r3: {'t1.c1': 'three'},
              r1: {'t1.c1': 'one'},
              r4: {'t1.c1': 'four'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two'},
              r3: {'t1.c1': 'three'},
              r1: {'t1.c1': 'one'},
            },
          },
          {q1: {r2: {'t1.c1': 'two'}, r1: {'t1.c1': 'one'}}},
          {q1: {r1: {'t1.c1': 'one'}}},
          {q1: {}},
        ),
      );
      expectNoChanges(listener);
    });

    test('double-joined table by id, aliased intermediate; t2, t3, t1', () => {
      queries.setQueryDefinition('q1', 't1', ({select, join}) => {
        select('c1').as('t1.c1');
        select('t2a', 'c1').as('t2.c1');
        select('t3', 'c1').as('t3.c1');
        join('t2', (getCell) => `r${(getCell('c2') as string)?.length}`).as(
          't2a',
        );
        join(
          't3',
          't2a',
          (getCell) => `r${(getCell('c1') as string)?.length - 5}`,
        );
      });
      setCells('t2', '', '.j1');
      setCells('t3', '', '.j2');
      setCells();
      delCells();
      delCells('t3');
      delCells('t2');
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {
            q1: {
              r1: {'t1.c1': 'one', 't3.c1': 'three.j2', 't2.c1': 'three.j1'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't3.c1': 'two.j2', 't2.c1': 'four.j1'},
              r3: {'t1.c1': 'three', 't3.c1': 'three.j2', 't2.c1': 'three.j1'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't3.c1': 'two.j2', 't2.c1': 'four.j1'},
              r3: {'t1.c1': 'three', 't3.c1': 'three.j2', 't2.c1': 'three.j1'},
              r1: {'t1.c1': 'one', 't3.c1': 'three.j2', 't2.c1': 'three.j1'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't3.c1': 'two.j2', 't2.c1': 'four.j1'},
              r3: {'t1.c1': 'three', 't3.c1': 'three.j2', 't2.c1': 'three.j1'},
              r1: {'t1.c1': 'one', 't3.c1': 'three.j2', 't2.c1': 'three.j1'},
              r4: {'t1.c1': 'four'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't3.c1': 'two.j2', 't2.c1': 'four.j1'},
              r3: {'t1.c1': 'three', 't3.c1': 'three.j2', 't2.c1': 'three.j1'},
              r1: {'t1.c1': 'one', 't3.c1': 'three.j2', 't2.c1': 'three.j1'},
              r4: {'t1.c1': 'four', 't3.c1': 'two.j2', 't2.c1': 'four.j1'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't3.c1': 'two.j2', 't2.c1': 'four.j1'},
              r3: {'t1.c1': 'three', 't3.c1': 'three.j2', 't2.c1': 'three.j1'},
              r1: {'t1.c1': 'one', 't3.c1': 'three.j2', 't2.c1': 'three.j1'},
              r4: {'t1.c1': 'four'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't3.c1': 'two.j2', 't2.c1': 'four.j1'},
              r3: {'t1.c1': 'three', 't3.c1': 'three.j2', 't2.c1': 'three.j1'},
              r1: {'t1.c1': 'one', 't3.c1': 'three.j2', 't2.c1': 'three.j1'},
            },
          },
          {
            q1: {
              r2: {'t1.c1': 'two', 't3.c1': 'two.j2', 't2.c1': 'four.j1'},
              r1: {'t1.c1': 'one', 't3.c1': 'three.j2', 't2.c1': 'three.j1'},
            },
          },
          {
            q1: {
              r1: {'t1.c1': 'one', 't3.c1': 'three.j2', 't2.c1': 'three.j1'},
            },
          },
          {q1: {}},
        ),
      );
      expectNoChanges(listener);
    });
  });

  describe('Wheres', () => {
    test('root table column by value', () => {
      queries.setQueryDefinition('q1', 't1', ({select, where}) => {
        select('c1');
        where('c1', 'two');
      });
      setCells();
      delCells();
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(listener, listenerId, {q1: {r2: {c1: 'two'}}}, {q1: {}}),
      );
      expectNoChanges(listener);
    });

    test('root table column by unselected value', () => {
      queries.setQueryDefinition('q1', 't1', ({select, where}) => {
        select('c1');
        where('c2', 'even');
      });
      setCells();
      delCells();
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: {r2: {c1: 'two'}}},
          {q1: {r2: {c1: 'two'}, r4: {c1: 'four'}}},
          {q1: {r2: {c1: 'two'}}},
          {q1: {}},
        ),
      );
      expectNoChanges(listener);
    });

    test('root table column by derivation', () => {
      queries.setQueryDefinition('q1', 't1', ({select, where}) => {
        select('c1');
        where((getCell) => (getCell('c1') as string)[0] == 't');
      });
      setCells();
      delCells();
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: {r2: {c1: 'two'}, r3: {c1: 'three'}}},
          {q1: {r2: {c1: 'two'}}},
          {q1: {}},
        ),
      );
      expectNoChanges(listener);
    });

    test('root table two columns by derivation', () => {
      queries.setQueryDefinition('q1', 't1', ({select, where}) => {
        select('c1');
        where((getCell) => (getCell('c1') as string).includes('o'));
        where('c2', 'odd');
      });
      setCells();
      delCells();
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: {r1: {c1: 'one'}}},
          {q1: {}},
          {q1: {r1: {c1: 'one'}}},
          {q1: {}},
        ),
      );
      expectNoChanges(listener);
    });

    test('selected join table column by value; t1, t2', () => {
      queries.setQueryDefinition('q1', 't1', ({select, join, where}) => {
        select('c1').as('t1.c1');
        select('t2', 'c1').as('t2.c1');
        join('t2', 'c3');
        where('t2', 'c1', 'three.j');
      });
      setCells('t1', '', '', 'r');
      setCells('t2', '', '.j');
      delCells('t2');
      delCells();
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: {r3: {'t1.c1': 'three', 't2.c1': 'three.j'}}},
          {q1: {}},
        ),
      );
      expectNoChanges(listener);
    });

    test('selected join table column by value; t2, t1', () => {
      queries.setQueryDefinition('q1', 't1', ({select, join, where}) => {
        select('c1').as('t1.c1');
        select('t2', 'c1').as('t2.c1');
        join('t2', 'c3');
        where('t2', 'c1', 'three.j');
      });
      setCells('t2', '', '.j');
      setCells('t1', '', '', 'r');
      delCells();
      delCells('t2');
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: {r3: {'t1.c1': 'three', 't2.c1': 'three.j'}}},
          {q1: {}},
        ),
      );
      expectNoChanges(listener);
    });

    test('unselected join table column by value; t1, t2', () => {
      queries.setQueryDefinition('q1', 't1', ({select, join, where}) => {
        select('c1').as('t1.c1');
        select('t2', 'c1').as('t2.c1');
        join('t2', 'c3');
        where('t2', 'c2', 'odd.j');
      });
      setCells('t1', '', '', 'r');
      setCells('t2', '', '.j');
      delCells('t2');
      delCells();
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: {r1: {'t1.c1': 'one', 't2.c1': 'one.j'}}},
          {q1: {r3: {'t1.c1': 'three', 't2.c1': 'three.j'}}},
          {
            q1: {
              r3: {'t1.c1': 'three', 't2.c1': 'three.j'},
              r1: {'t1.c1': 'one', 't2.c1': 'one.j'},
            },
          },
          {q1: {r1: {'t1.c1': 'one', 't2.c1': 'one.j'}}},
          {q1: {}},
        ),
      );
      expectNoChanges(listener);
    });

    test('unselected join table column by value; t2, t1', () => {
      queries.setQueryDefinition('q1', 't1', ({select, join, where}) => {
        select('c1').as('t1.c1');
        select('t2', 'c1').as('t2.c1');
        join('t2', 'c3');
        where('t2', 'c2', 'odd.j');
      });
      setCells('t2', '', '.j');
      setCells('t1', '', '', 'r');
      delCells();
      delCells('t2');
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: {r1: {'t1.c1': 'one', 't2.c1': 'one.j'}}},
          {q1: {r3: {'t1.c1': 'three', 't2.c1': 'three.j'}}},
          {
            q1: {
              r3: {'t1.c1': 'three', 't2.c1': 'three.j'},
              r1: {'t1.c1': 'one', 't2.c1': 'one.j'},
            },
          },
          {q1: {r1: {'t1.c1': 'one', 't2.c1': 'one.j'}}},
          {q1: {}},
        ),
      );
      expectNoChanges(listener);
    });

    test('root and join table columns by derivation; t1, t2', () => {
      queries.setQueryDefinition('q1', 't1', ({select, join, where}) => {
        select('c1').as('t1.c1');
        select('t2', 'c1').as('t2.c1');
        join('t2', 'c3');
        where(
          (getTableCell) =>
            getTableCell('c1') == 'four' || getTableCell('t2', 'c2') == 'odd.j',
        );
      });
      setCells('t1', '', '', 'r');
      setCells('t2', '', '.j');
      delCells('t2');
      delCells();
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: {r4: {'t1.c1': 'four'}}},
          {q1: {r4: {'t1.c1': 'four'}, r1: {'t1.c1': 'one', 't2.c1': 'one.j'}}},
          {
            q1: {
              r4: {'t1.c1': 'four'},
              r3: {'t1.c1': 'three', 't2.c1': 'three.j'},
            },
          },
          {
            q1: {
              r4: {'t1.c1': 'four'},
              r3: {'t1.c1': 'three', 't2.c1': 'three.j'},
              r1: {'t1.c1': 'one', 't2.c1': 'one.j'},
            },
          },
          {
            q1: {
              r4: {'t1.c1': 'four', 't2.c1': 'four.j'},
              r3: {'t1.c1': 'three', 't2.c1': 'three.j'},
              r1: {'t1.c1': 'one', 't2.c1': 'one.j'},
            },
          },
          {
            q1: {
              r4: {'t1.c1': 'four'},
              r3: {'t1.c1': 'three', 't2.c1': 'three.j'},
              r1: {'t1.c1': 'one', 't2.c1': 'one.j'},
            },
          },
          {q1: {r4: {'t1.c1': 'four'}, r1: {'t1.c1': 'one', 't2.c1': 'one.j'}}},
          {q1: {r4: {'t1.c1': 'four'}}},
          {q1: {}},
        ),
      );
      expectNoChanges(listener);
    });

    test('root and join table columns by derivation; t2, t1', () => {
      queries.setQueryDefinition('q1', 't1', ({select, join, where}) => {
        select('c1').as('t1.c1');
        select('t2', 'c1').as('t2.c1');
        join('t2', 'c3');
        where(
          (getTableCell) =>
            getTableCell('c1') == 'four' || getTableCell('t2', 'c2') == 'odd.j',
        );
      });
      setCells('t2', '', '.j');
      setCells('t1', '', '', 'r');
      delCells();
      delCells('t2');
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: {r1: {'t1.c1': 'one', 't2.c1': 'one.j'}}},
          {q1: {r3: {'t1.c1': 'three', 't2.c1': 'three.j'}}},
          {
            q1: {
              r3: {'t1.c1': 'three', 't2.c1': 'three.j'},
              r1: {'t1.c1': 'one', 't2.c1': 'one.j'},
            },
          },
          {
            q1: {
              r3: {'t1.c1': 'three', 't2.c1': 'three.j'},
              r1: {'t1.c1': 'one', 't2.c1': 'one.j'},
              r4: {'t1.c1': 'four'},
            },
          },
          {
            q1: {
              r3: {'t1.c1': 'three', 't2.c1': 'three.j'},
              r1: {'t1.c1': 'one', 't2.c1': 'one.j'},
              r4: {'t1.c1': 'four', 't2.c1': 'four.j'},
            },
          },
          {
            q1: {
              r3: {'t1.c1': 'three', 't2.c1': 'three.j'},
              r1: {'t1.c1': 'one', 't2.c1': 'one.j'},
              r4: {'t1.c1': 'four'},
            },
          },
          {
            q1: {
              r3: {'t1.c1': 'three', 't2.c1': 'three.j'},
              r1: {'t1.c1': 'one', 't2.c1': 'one.j'},
            },
          },
          {q1: {r1: {'t1.c1': 'one', 't2.c1': 'one.j'}}},
          {q1: {}},
        ),
      );
      expectNoChanges(listener);
    });
  });

  describe('Groups', () => {
    test('root table column by name', () => {
      queries.setQueryDefinition('q1', 't1', ({select, group}) => {
        select('c2');
        select('c3');
        group('c3', 'sum');
      });
      setCells();
      delCells();
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: {0: {c2: 'odd', c3: 1}}},
          {q1: {0: {c2: 'odd', c3: 3}, 1: {c2: 'even', c3: 2}}},
          {q1: {0: {c2: 'odd', c3: 4}, 1: {c2: 'even', c3: 2}}},
          {q1: {0: {c2: 'odd', c3: 4}, 1: {c2: 'even', c3: 6}}},
          {q1: {0: {c2: 'odd', c3: 4}, 1: {c2: 'even', c3: 2}}},
          {q1: {0: {c2: 'odd', c3: 1}, 1: {c2: 'even', c3: 2}}},
          {q1: {0: {c2: 'odd', c3: 1}}},
          {q1: {}},
        ),
      );
      expectNoChanges(listener);
    });

    test('root table column, changing groupBy', () => {
      queries.setQueryDefinition('q1', 't1', ({select, group}) => {
        select('c2');
        select('c3');
        group('c3', 'sum');
      });
      store
        .setRow('t1', 'r1', {c1: 'f1', c2: 'fraction', c3: 0.25})
        .setRow('t1', 'r2', {c1: 'f2', c2: 'fraction', c3: 0.5})
        .setRow('t1', 'r3', {c1: 'f3', c2: 'fraction', c3: 1})
        .setRow('t1', 'r4', {c1: 'f4', c2: 'whole', c3: 2})
        .setCell('t1', 'r3', 'c2', 'whole');
      store.delTables();
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: {0: {c2: 'fraction', c3: 0.25}}},
          {q1: {0: {c2: 'fraction', c3: 0.75}}},
          {q1: {0: {c2: 'fraction', c3: 1.75}}},
          {q1: {0: {c2: 'fraction', c3: 1.75}, 1: {c2: 'whole', c3: 2}}},
          {q1: {0: {c2: 'fraction', c3: 0.75}, 1: {c2: 'whole', c3: 3}}},
          {q1: {}},
        ),
      );
      expectNoChanges(listener);
    });

    test('root table column, changing grouped', () => {
      queries.setQueryDefinition('q1', 't1', ({select, group}) => {
        select('c2');
        select('c3');
        group('c3', 'sum');
      });
      store
        .setRow('t1', 'r1', {c1: 'f1', c2: 'fraction', c3: 0.25})
        .setRow('t1', 'r2', {c1: 'f2', c2: 'fraction', c3: 0.5})
        .setRow('t1', 'r3', {c1: 'f3', c2: 'fraction', c3: 1})
        .setRow('t1', 'r4', {c1: 'f4', c2: 'whole', c3: 2})
        .setCell('t1', 'r3', 'c3', 0.75);
      store.delTables();
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: {0: {c2: 'fraction', c3: 0.25}}},
          {q1: {0: {c2: 'fraction', c3: 0.75}}},
          {q1: {0: {c2: 'fraction', c3: 1.75}}},
          {q1: {0: {c2: 'fraction', c3: 1.75}, 1: {c2: 'whole', c3: 2}}},
          {q1: {0: {c2: 'fraction', c3: 1.5}, 1: {c2: 'whole', c3: 2}}},
          {q1: {}},
        ),
      );
      expectNoChanges(listener);
    });

    test('root table column by custom', () => {
      queries.setQueryDefinition('q1', 't1', ({select, group}) => {
        select('c2');
        select('c3');
        group('c3', (cells) => cells.join());
      });
      setCells();
      delCells();
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: {0: {c2: 'odd', c3: '1'}}},
          {q1: {0: {c2: 'odd', c3: '3'}, 1: {c2: 'even', c3: '2'}}},
          {q1: {0: {c2: 'odd', c3: '3,1'}, 1: {c2: 'even', c3: '2'}}},
          {q1: {0: {c2: 'odd', c3: '3,1'}, 1: {c2: 'even', c3: '2,4'}}},
          {q1: {0: {c2: 'odd', c3: '3,1'}, 1: {c2: 'even', c3: '2'}}},
          {q1: {0: {c2: 'odd', c3: '1'}, 1: {c2: 'even', c3: '2'}}},
          {q1: {0: {c2: 'odd', c3: '1'}}},
          {q1: {}},
        ),
      );
      expectNoChanges(listener);
    });

    test('one root table column twice', () => {
      queries.setQueryDefinition('q1', 't1', ({select, group}) => {
        select('c2');
        select('c3');
        group('c3', 'sum').as('sum');
        group('c3', 'avg').as('avg');
      });
      setCells();
      delCells();
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: {0: {c2: 'odd', sum: 1, avg: 1}}},
          {
            q1: {
              0: {c2: 'odd', sum: 3, avg: 3},
              1: {c2: 'even', sum: 2, avg: 2},
            },
          },
          {
            q1: {
              0: {c2: 'odd', sum: 4, avg: 2},
              1: {c2: 'even', sum: 2, avg: 2},
            },
          },
          {
            q1: {
              0: {c2: 'odd', sum: 4, avg: 2},
              1: {c2: 'even', sum: 6, avg: 3},
            },
          },
          {
            q1: {
              0: {c2: 'odd', sum: 4, avg: 2},
              1: {c2: 'even', sum: 2, avg: 2},
            },
          },
          {
            q1: {
              0: {c2: 'odd', sum: 1, avg: 1},
              1: {c2: 'even', sum: 2, avg: 2},
            },
          },
          {q1: {0: {c2: 'odd', sum: 1, avg: 1}}},
          {q1: {}},
        ),
      );
      expectNoChanges(listener);
    });

    test('join table column; t1, t2', () => {
      queries.setQueryDefinition('q1', 't1', ({select, join, group}) => {
        select('c2').as('t1.c2');
        select('t2', 'c3').as('t2.c3');
        join('t2', 'c3');
        group('t2.c3', 'sum');
      });
      setCells('t1', '', '', 'r');
      setCells('t2', '', '.j');
      delCells('t2');
      delCells();
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: {0: {'t1.c2': 'odd'}}},
          {q1: {0: {'t1.c2': 'odd'}, 1: {'t1.c2': 'even'}}},
          {q1: {0: {'t1.c2': 'odd', 't2.c3': 1}, 1: {'t1.c2': 'even'}}},
          {
            q1: {
              0: {'t1.c2': 'odd', 't2.c3': 3},
              1: {'t1.c2': 'even', 't2.c3': 2},
            },
          },
          {
            q1: {
              0: {'t1.c2': 'odd', 't2.c3': 4},
              1: {'t1.c2': 'even', 't2.c3': 2},
            },
          },
          {
            q1: {
              0: {'t1.c2': 'odd', 't2.c3': 4},
              1: {'t1.c2': 'even', 't2.c3': 6},
            },
          },
          {
            q1: {
              0: {'t1.c2': 'odd', 't2.c3': 4},
              1: {'t1.c2': 'even', 't2.c3': 2},
            },
          },
          {
            q1: {
              0: {'t1.c2': 'odd', 't2.c3': 1},
              1: {'t1.c2': 'even', 't2.c3': 2},
            },
          },
          {q1: {0: {'t1.c2': 'odd', 't2.c3': 1}, 1: {'t1.c2': 'even'}}},
          {q1: {0: {'t1.c2': 'odd'}, 1: {'t1.c2': 'even'}}},
          {q1: {0: {'t1.c2': 'odd'}}},
          {q1: {}},
        ),
      );
      expectNoChanges(listener);
    });

    test('join table column; t2, t1', () => {
      queries.setQueryDefinition('q1', 't1', ({select, join, group}) => {
        select('c2').as('t1.c2');
        select('t2', 'c3').as('t2.c3');
        join('t2', 'c3');
        group('t2.c3', 'sum');
      });
      setCells('t2', '', '.j');
      setCells('t1', '', '', 'r');
      delCells();
      delCells('t2');
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: {0: {'t1.c2': 'odd', 't2.c3': 1}}},
          {
            q1: {
              0: {'t1.c2': 'odd', 't2.c3': 3},
              1: {'t1.c2': 'even', 't2.c3': 2},
            },
          },
          {
            q1: {
              0: {'t1.c2': 'odd', 't2.c3': 4},
              1: {'t1.c2': 'even', 't2.c3': 2},
            },
          },
          {
            q1: {
              0: {'t1.c2': 'odd', 't2.c3': 4},
              1: {'t1.c2': 'even', 't2.c3': 6},
            },
          },
          {
            q1: {
              0: {'t1.c2': 'odd', 't2.c3': 4},
              1: {'t1.c2': 'even', 't2.c3': 2},
            },
          },
          {
            q1: {
              0: {'t1.c2': 'odd', 't2.c3': 1},
              1: {'t1.c2': 'even', 't2.c3': 2},
            },
          },
          {q1: {0: {'t1.c2': 'odd', 't2.c3': 1}}},
          {q1: {}},
        ),
      );
      expectNoChanges(listener);
    });

    test('all groupBys', () => {
      queries.setQueryDefinition('q1', 't1', ({select, group}) => {
        select('c1');
        select('c2');
        select('c3');
        group('c3', 'sum');
      });
      store
        .setRow('t1', 'r1', {c1: 'one', c2: 'odd'})
        .setRow('t1', 'r2', {c1: 'two', c2: 'even'})
        .setRow('t1', 'r3', {c1: 'three', c2: 'odd'})
        .delRow('t1', 'r1')
        .delRow('t1', 'r2')
        .delRow('t1', 'r3');
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: {0: {c1: 'one', c2: 'odd'}}},
          {q1: {0: {c1: 'one', c2: 'odd'}, 1: {c1: 'two', c2: 'even'}}},
          {
            q1: {
              0: {c1: 'one', c2: 'odd'},
              1: {c1: 'two', c2: 'even'},
              2: {c1: 'three', c2: 'odd'},
            },
          },
          {q1: {1: {c1: 'two', c2: 'even'}, 2: {c1: 'three', c2: 'odd'}}},
          {q1: {2: {c1: 'three', c2: 'odd'}}},
          {q1: {}},
        ),
      );
      expectNoChanges(listener);
    });

    test('all grouped', () => {
      queries.setQueryDefinition('q1', 't1', ({select, group}) => {
        select('c3');
        group('c3', 'sum').as('sum');
        group('c3', 'avg').as('avg');
      });
      store
        .setRow('t1', 'r1', {c3: 1})
        .setRow('t1', 'r2', {c3: 2})
        .setRow('t1', 'r3', {c3: 3})
        .delRow('t1', 'r1')
        .delRow('t1', 'r2')
        .delRow('t1', 'r3');
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: {0: {sum: 1, avg: 1}}},
          {q1: {0: {sum: 3, avg: 1.5}}},
          {q1: {0: {sum: 6, avg: 2}}},
          {q1: {0: {sum: 5, avg: 2.5}}},
          {q1: {0: {sum: 3, avg: 3}}},
          {q1: {}},
        ),
      );
      expectNoChanges(listener);
    });

    test('multiple groupBys, multiple grouped, multiple changes', () => {
      queries.setQueryDefinition('q1', 't1', ({select, group}) => {
        select('c1');
        select('c2');
        select('c3');
        select('c4');
        group('c3', 'count').as('cnt3');
        group('c3', 'avg').as('avg3');
        group('c4', 'avg').as('avg4');
        group('c3', 'sum').as('sum3');
        group('c4', 'sum').as('sum4');
      });
      store
        .setRow('t1', 'r1', {c1: 'A', c2: 'a', c3: 1, c4: 12})
        .setRow('t1', 'r2', {c1: 'A', c2: 'a', c3: 2, c4: 11})
        .setRow('t1', 'r3', {c1: 'A', c2: 'b', c3: 3, c4: 10})
        .setRow('t1', 'r4', {c1: 'A', c2: 'b', c3: 4, c4: 9})
        .setRow('t1', 'r5', {c1: 'B', c2: 'a', c3: 5, c4: 8})
        .setRow('t1', 'r6', {c1: 'B', c2: 'a', c3: 6, c4: 7})
        .setRow('t1', 'r7', {c1: 'B', c2: 'b', c3: 7, c4: 6})
        .setRow('t1', 'r8', {c1: 'B', c2: 'b', c3: 8, c4: 5})
        .setRow('t1', 'r9', {c1: 'C', c2: 'a', c3: 9, c4: 4})
        .setRow('t1', 'r10', {c1: 'C', c2: 'a', c3: 10, c4: 3})
        .setRow('t1', 'r11', {c1: 'C', c2: 'b', c3: 11, c4: 2})
        .setRow('t1', 'r12', {c1: 'C', c2: 'b', c3: 12, c4: 1})
        .delRow('t1', 'r1')
        .delCell('t1', 'r3', 'c1')
        .setRow('t1', 'r5', {c3: 5, c4: 4})
        .delCell('t1', 'r7', 'c3')
        .setRow('t1', 'r9', {c1: 'C', c2: 'a'})
        .setCell('t1', 'r11', 'c2', 'c')
        .delTable('t1');
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {
            q1: {
              0: {
                c1: 'A',
                c2: 'a',
                cnt3: 1,
                avg3: 1,
                sum3: 1,
                avg4: 12,
                sum4: 12,
              },
            },
          },
          {
            q1: {
              0: {
                c1: 'A',
                c2: 'a',
                cnt3: 2,
                avg3: 1.5,
                sum3: 3,
                avg4: 11.5,
                sum4: 23,
              },
            },
          },
          {
            q1: {
              0: {
                c1: 'A',
                c2: 'a',
                cnt3: 2,
                avg3: 1.5,
                sum3: 3,
                avg4: 11.5,
                sum4: 23,
              },
              1: {
                c1: 'A',
                c2: 'b',
                cnt3: 1,
                avg3: 3,
                sum3: 3,
                avg4: 10,
                sum4: 10,
              },
            },
          },
          {
            q1: {
              0: {
                c1: 'A',
                c2: 'a',
                cnt3: 2,
                avg3: 1.5,
                sum3: 3,
                avg4: 11.5,
                sum4: 23,
              },
              1: {
                c1: 'A',
                c2: 'b',
                cnt3: 2,
                avg3: 3.5,
                sum3: 7,
                avg4: 9.5,
                sum4: 19,
              },
            },
          },
          {
            q1: {
              0: {
                c1: 'A',
                c2: 'a',
                cnt3: 2,
                avg3: 1.5,
                sum3: 3,
                avg4: 11.5,
                sum4: 23,
              },
              1: {
                c1: 'A',
                c2: 'b',
                cnt3: 2,
                avg3: 3.5,
                sum3: 7,
                avg4: 9.5,
                sum4: 19,
              },
              2: {
                c1: 'B',
                c2: 'a',
                cnt3: 1,
                avg3: 5,
                sum3: 5,
                avg4: 8,
                sum4: 8,
              },
            },
          },
          {
            q1: {
              0: {
                c1: 'A',
                c2: 'a',
                cnt3: 2,
                avg3: 1.5,
                sum3: 3,
                avg4: 11.5,
                sum4: 23,
              },
              1: {
                c1: 'A',
                c2: 'b',
                cnt3: 2,
                avg3: 3.5,
                sum3: 7,
                avg4: 9.5,
                sum4: 19,
              },
              2: {
                c1: 'B',
                c2: 'a',
                cnt3: 2,
                avg3: 5.5,
                sum3: 11,
                avg4: 7.5,
                sum4: 15,
              },
            },
          },
          {
            q1: {
              0: {
                c1: 'A',
                c2: 'a',
                cnt3: 2,
                avg3: 1.5,
                sum3: 3,
                avg4: 11.5,
                sum4: 23,
              },
              1: {
                c1: 'A',
                c2: 'b',
                cnt3: 2,
                avg3: 3.5,
                sum3: 7,
                avg4: 9.5,
                sum4: 19,
              },
              2: {
                c1: 'B',
                c2: 'a',
                cnt3: 2,
                avg3: 5.5,
                sum3: 11,
                avg4: 7.5,
                sum4: 15,
              },
              3: {
                c1: 'B',
                c2: 'b',
                cnt3: 1,
                avg3: 7,
                sum3: 7,
                avg4: 6,
                sum4: 6,
              },
            },
          },
          {
            q1: {
              0: {
                c1: 'A',
                c2: 'a',
                cnt3: 2,
                avg3: 1.5,
                sum3: 3,
                avg4: 11.5,
                sum4: 23,
              },
              1: {
                c1: 'A',
                c2: 'b',
                cnt3: 2,
                avg3: 3.5,
                sum3: 7,
                avg4: 9.5,
                sum4: 19,
              },
              2: {
                c1: 'B',
                c2: 'a',
                cnt3: 2,
                avg3: 5.5,
                sum3: 11,
                avg4: 7.5,
                sum4: 15,
              },
              3: {
                c1: 'B',
                c2: 'b',
                cnt3: 2,
                avg3: 7.5,
                sum3: 15,
                avg4: 5.5,
                sum4: 11,
              },
            },
          },
          {
            q1: {
              0: {
                c1: 'A',
                c2: 'a',
                cnt3: 2,
                avg3: 1.5,
                sum3: 3,
                avg4: 11.5,
                sum4: 23,
              },
              1: {
                c1: 'A',
                c2: 'b',
                cnt3: 2,
                avg3: 3.5,
                sum3: 7,
                avg4: 9.5,
                sum4: 19,
              },
              2: {
                c1: 'B',
                c2: 'a',
                cnt3: 2,
                avg3: 5.5,
                sum3: 11,
                avg4: 7.5,
                sum4: 15,
              },
              3: {
                c1: 'B',
                c2: 'b',
                cnt3: 2,
                avg3: 7.5,
                sum3: 15,
                avg4: 5.5,
                sum4: 11,
              },
              4: {
                c1: 'C',
                c2: 'a',
                cnt3: 1,
                avg3: 9,
                sum3: 9,
                avg4: 4,
                sum4: 4,
              },
            },
          },
          {
            q1: {
              0: {
                c1: 'A',
                c2: 'a',
                cnt3: 2,
                avg3: 1.5,
                sum3: 3,
                avg4: 11.5,
                sum4: 23,
              },
              1: {
                c1: 'A',
                c2: 'b',
                cnt3: 2,
                avg3: 3.5,
                sum3: 7,
                avg4: 9.5,
                sum4: 19,
              },
              2: {
                c1: 'B',
                c2: 'a',
                cnt3: 2,
                avg3: 5.5,
                sum3: 11,
                avg4: 7.5,
                sum4: 15,
              },
              3: {
                c1: 'B',
                c2: 'b',
                cnt3: 2,
                avg3: 7.5,
                sum3: 15,
                avg4: 5.5,
                sum4: 11,
              },
              4: {
                c1: 'C',
                c2: 'a',
                cnt3: 2,
                avg3: 9.5,
                sum3: 19,
                avg4: 3.5,
                sum4: 7,
              },
            },
          },
          {
            q1: {
              0: {
                c1: 'A',
                c2: 'a',
                cnt3: 2,
                avg3: 1.5,
                sum3: 3,
                avg4: 11.5,
                sum4: 23,
              },
              1: {
                c1: 'A',
                c2: 'b',
                cnt3: 2,
                avg3: 3.5,
                sum3: 7,
                avg4: 9.5,
                sum4: 19,
              },
              2: {
                c1: 'B',
                c2: 'a',
                cnt3: 2,
                avg3: 5.5,
                sum3: 11,
                avg4: 7.5,
                sum4: 15,
              },
              3: {
                c1: 'B',
                c2: 'b',
                cnt3: 2,
                avg3: 7.5,
                sum3: 15,
                avg4: 5.5,
                sum4: 11,
              },
              4: {
                c1: 'C',
                c2: 'a',
                cnt3: 2,
                avg3: 9.5,
                sum3: 19,
                avg4: 3.5,
                sum4: 7,
              },
              5: {
                c1: 'C',
                c2: 'b',
                cnt3: 1,
                avg3: 11,
                sum3: 11,
                avg4: 2,
                sum4: 2,
              },
            },
          },
          {
            q1: {
              0: {
                c1: 'A',
                c2: 'a',
                cnt3: 2,
                avg3: 1.5,
                sum3: 3,
                avg4: 11.5,
                sum4: 23,
              },
              1: {
                c1: 'A',
                c2: 'b',
                cnt3: 2,
                avg3: 3.5,
                sum3: 7,
                avg4: 9.5,
                sum4: 19,
              },
              2: {
                c1: 'B',
                c2: 'a',
                cnt3: 2,
                avg3: 5.5,
                sum3: 11,
                avg4: 7.5,
                sum4: 15,
              },
              3: {
                c1: 'B',
                c2: 'b',
                cnt3: 2,
                avg3: 7.5,
                sum3: 15,
                avg4: 5.5,
                sum4: 11,
              },
              4: {
                c1: 'C',
                c2: 'a',
                cnt3: 2,
                avg3: 9.5,
                sum3: 19,
                avg4: 3.5,
                sum4: 7,
              },
              5: {
                c1: 'C',
                c2: 'b',
                cnt3: 2,
                avg3: 11.5,
                sum3: 23,
                avg4: 1.5,
                sum4: 3,
              },
            },
          },
          {
            q1: {
              0: {
                c1: 'A',
                c2: 'a',
                cnt3: 1,
                avg3: 2,
                sum3: 2,
                avg4: 11,
                sum4: 11,
              },
              1: {
                c1: 'A',
                c2: 'b',
                cnt3: 2,
                avg3: 3.5,
                sum3: 7,
                avg4: 9.5,
                sum4: 19,
              },
              2: {
                c1: 'B',
                c2: 'a',
                cnt3: 2,
                avg3: 5.5,
                sum3: 11,
                avg4: 7.5,
                sum4: 15,
              },
              3: {
                c1: 'B',
                c2: 'b',
                cnt3: 2,
                avg3: 7.5,
                sum3: 15,
                avg4: 5.5,
                sum4: 11,
              },
              4: {
                c1: 'C',
                c2: 'a',
                cnt3: 2,
                avg3: 9.5,
                sum3: 19,
                avg4: 3.5,
                sum4: 7,
              },
              5: {
                c1: 'C',
                c2: 'b',
                cnt3: 2,
                avg3: 11.5,
                sum3: 23,
                avg4: 1.5,
                sum4: 3,
              },
            },
          },
          {
            q1: {
              0: {
                c1: 'A',
                c2: 'a',
                cnt3: 1,
                avg3: 2,
                sum3: 2,
                avg4: 11,
                sum4: 11,
              },
              1: {
                c1: 'A',
                c2: 'b',
                cnt3: 1,
                avg3: 4,
                sum3: 4,
                avg4: 9,
                sum4: 9,
              },
              2: {
                c1: 'B',
                c2: 'a',
                cnt3: 2,
                avg3: 5.5,
                sum3: 11,
                avg4: 7.5,
                sum4: 15,
              },
              3: {
                c1: 'B',
                c2: 'b',
                cnt3: 2,
                avg3: 7.5,
                sum3: 15,
                avg4: 5.5,
                sum4: 11,
              },
              4: {
                c1: 'C',
                c2: 'a',
                cnt3: 2,
                avg3: 9.5,
                sum3: 19,
                avg4: 3.5,
                sum4: 7,
              },
              5: {
                c1: 'C',
                c2: 'b',
                cnt3: 2,
                avg3: 11.5,
                sum3: 23,
                avg4: 1.5,
                sum4: 3,
              },
              6: {c2: 'b', cnt3: 1, avg3: 3, sum3: 3, avg4: 10, sum4: 10},
            },
          },
          {
            q1: {
              0: {
                c1: 'A',
                c2: 'a',
                cnt3: 1,
                avg3: 2,
                sum3: 2,
                avg4: 11,
                sum4: 11,
              },
              1: {
                c1: 'A',
                c2: 'b',
                cnt3: 1,
                avg3: 4,
                sum3: 4,
                avg4: 9,
                sum4: 9,
              },
              2: {
                c1: 'B',
                c2: 'a',
                cnt3: 1,
                avg3: 6,
                sum3: 6,
                avg4: 7,
                sum4: 7,
              },
              3: {
                c1: 'B',
                c2: 'b',
                cnt3: 2,
                avg3: 7.5,
                sum3: 15,
                avg4: 5.5,
                sum4: 11,
              },
              4: {
                c1: 'C',
                c2: 'a',
                cnt3: 2,
                avg3: 9.5,
                sum3: 19,
                avg4: 3.5,
                sum4: 7,
              },
              5: {
                c1: 'C',
                c2: 'b',
                cnt3: 2,
                avg3: 11.5,
                sum3: 23,
                avg4: 1.5,
                sum4: 3,
              },
              6: {c2: 'b', cnt3: 1, avg3: 3, sum3: 3, avg4: 10, sum4: 10},
              7: {cnt3: 1, avg3: 5, sum3: 5, avg4: 4, sum4: 4},
            },
          },
          {
            q1: {
              0: {
                c1: 'A',
                c2: 'a',
                cnt3: 1,
                avg3: 2,
                sum3: 2,
                avg4: 11,
                sum4: 11,
              },
              1: {
                c1: 'A',
                c2: 'b',
                cnt3: 1,
                avg3: 4,
                sum3: 4,
                avg4: 9,
                sum4: 9,
              },
              2: {
                c1: 'B',
                c2: 'a',
                cnt3: 1,
                avg3: 6,
                sum3: 6,
                avg4: 7,
                sum4: 7,
              },
              3: {
                c1: 'B',
                c2: 'b',
                cnt3: 1,
                avg3: 8,
                sum3: 8,
                avg4: 5.5,
                sum4: 11,
              },
              4: {
                c1: 'C',
                c2: 'a',
                cnt3: 2,
                avg3: 9.5,
                sum3: 19,
                avg4: 3.5,
                sum4: 7,
              },
              5: {
                c1: 'C',
                c2: 'b',
                cnt3: 2,
                avg3: 11.5,
                sum3: 23,
                avg4: 1.5,
                sum4: 3,
              },
              6: {c2: 'b', cnt3: 1, avg3: 3, sum3: 3, avg4: 10, sum4: 10},
              7: {cnt3: 1, avg3: 5, sum3: 5, avg4: 4, sum4: 4},
            },
          },
          {
            q1: {
              0: {
                c1: 'A',
                c2: 'a',
                cnt3: 1,
                avg3: 2,
                sum3: 2,
                avg4: 11,
                sum4: 11,
              },
              1: {
                c1: 'A',
                c2: 'b',
                cnt3: 1,
                avg3: 4,
                sum3: 4,
                avg4: 9,
                sum4: 9,
              },
              2: {
                c1: 'B',
                c2: 'a',
                cnt3: 1,
                avg3: 6,
                sum3: 6,
                avg4: 7,
                sum4: 7,
              },
              3: {
                c1: 'B',
                c2: 'b',
                cnt3: 1,
                avg3: 8,
                sum3: 8,
                avg4: 5.5,
                sum4: 11,
              },
              4: {
                c1: 'C',
                c2: 'a',
                cnt3: 1,
                avg3: 10,
                sum3: 10,
                avg4: 3,
                sum4: 3,
              },
              5: {
                c1: 'C',
                c2: 'b',
                cnt3: 2,
                avg3: 11.5,
                sum3: 23,
                avg4: 1.5,
                sum4: 3,
              },
              6: {c2: 'b', cnt3: 1, avg3: 3, sum3: 3, avg4: 10, sum4: 10},
              7: {cnt3: 1, avg3: 5, sum3: 5, avg4: 4, sum4: 4},
            },
          },
          {
            q1: {
              0: {
                c1: 'A',
                c2: 'a',
                cnt3: 1,
                avg3: 2,
                sum3: 2,
                avg4: 11,
                sum4: 11,
              },
              1: {
                c1: 'A',
                c2: 'b',
                cnt3: 1,
                avg3: 4,
                sum3: 4,
                avg4: 9,
                sum4: 9,
              },
              2: {
                c1: 'B',
                c2: 'a',
                cnt3: 1,
                avg3: 6,
                sum3: 6,
                avg4: 7,
                sum4: 7,
              },
              3: {
                c1: 'B',
                c2: 'b',
                cnt3: 1,
                avg3: 8,
                sum3: 8,
                avg4: 5.5,
                sum4: 11,
              },
              4: {
                c1: 'C',
                c2: 'a',
                cnt3: 1,
                avg3: 10,
                sum3: 10,
                avg4: 3,
                sum4: 3,
              },
              5: {
                c1: 'C',
                c2: 'b',
                cnt3: 1,
                avg3: 12,
                sum3: 12,
                avg4: 1,
                sum4: 1,
              },
              6: {c2: 'b', cnt3: 1, avg3: 3, sum3: 3, avg4: 10, sum4: 10},
              7: {cnt3: 1, avg3: 5, sum3: 5, avg4: 4, sum4: 4},
              8: {
                c1: 'C',
                c2: 'c',
                cnt3: 1,
                avg3: 11,
                sum3: 11,
                avg4: 2,
                sum4: 2,
              },
            },
          },
          {q1: {}},
        ),
      );
      expectNoChanges(listener);
    });

    test('mixed type', () => {
      queries.setQueryDefinition('q1', 't1', ({select, group}) => {
        select('c1');
        select('c2');
        group('c2', 'max').as('max');
      });
      store
        .setRow('t1', 'r1', {c1: 'A', c2: 1})
        .setRow('t1', 'r2', {c1: 'A', c2: 2})
        .setRow('t1', 'r3', {c1: 'A', c2: 3})
        .setRow('t1', 'r3', {c1: 'A', c2: ''})
        .delRow('t1', 'r1')
        .delRow('t1', 'r2')
        .delRow('t1', 'r3');
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: {0: {c1: 'A', max: 1}}},
          {q1: {0: {c1: 'A', max: 2}}},
          {q1: {0: {c1: 'A', max: 3}}},
          {q1: {0: {c1: 'A', max: 2}}},
          {q1: {0: {c1: 'A', max: 0}}},
          {q1: {}},
        ),
      );
      expectNoChanges(listener);
    });
  });

  describe('Havings', () => {
    test('grouped column by value', () => {
      queries.setQueryDefinition('q1', 't1', ({select, group, having}) => {
        select('c2');
        select('c3');
        group('c3', 'sum');
        having('c2', 'even');
      });
      setCells();
      delCells();
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: {0: {c2: 'even', c3: 2}}},
          {q1: {0: {c2: 'even', c3: 6}}},
          {q1: {0: {c2: 'even', c3: 2}}},
          {q1: {}},
        ),
      );
      expectNoChanges(listener);
    });

    test('group-by column by value', () => {
      queries.setQueryDefinition('q1', 't1', ({select, group, having}) => {
        select('c2');
        select('c3');
        group('c3', 'sum');
        having('c3', 4);
      });
      setCells();
      delCells();
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: {0: {c2: 'odd', c3: 4}}},
          {q1: {}},
        ),
      );
      expectNoChanges(listener);
    });

    test('aliased grouped and group-by column by derivation', () => {
      queries.setQueryDefinition('q1', 't1', ({select, group, having}) => {
        select('c2');
        select('c3');
        group('c3', 'sum').as('C3');
        having(
          (getSelectedOrGroupedCell) =>
            (getSelectedOrGroupedCell('c2') as string).length > 3,
        );
        having(
          (getSelectedOrGroupedCell) =>
            (getSelectedOrGroupedCell('C3') as number) > 4,
        );
      });
      setCells();
      delCells();
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: {0: {c2: 'even', C3: 6}}},
          {q1: {}},
        ),
      );
      expectNoChanges(listener);
    });

    test('without group', () => {
      queries.setQueryDefinition('q1', 't1', ({select, having}) => {
        select('c2');
        select('c3');
        having('c2', 'even');
      });
      setCells();
      delCells();
      ['/q1', '/q*'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: {0: {c2: 'even', c3: 2}}},
          {q1: {0: {c2: 'even', c3: 2}, 1: {c2: 'even'}}},
          {q1: {0: {c2: 'even', c3: 2}, 1: {c2: 'even', c3: 4}}},
          {q1: {0: {c2: 'even', c3: 2}, 1: {c2: 'even'}}},
          {q1: {0: {c2: 'even', c3: 2}}},
          {q1: {}},
        ),
      );
      expectNoChanges(listener);
    });
  });
});

describe('Sorted Row Ids', () => {
  beforeEach(() => {
    store = createStore().setTables({
      t1: {
        r1: {c1: 1, c2: 'one', c3: 3},
        r3: {c1: 3, c2: 'three', c3: 3},
        r5: {c1: 5, c2: 'five', c3: 3},
        r2: {c1: 2, c2: 'two', c3: 3},
        r4: {c1: 4, c2: 'four', c3: 3},
        r6: {c1: 6, c2: 'six', c3: 3},
      },
    });
    queries = createQueries(store).setQueryDefinition(
      'q1',
      't1',
      ({select, where}) => {
        select('c1');
        select('c2');
        where((getCell) => getCell('c1') != 4 && getCell('c1') != 6);
      },
    );
  });

  test('Cell sort', () => {
    expect(queries.getResultSortedRowIds('q1', 'c2')).toEqual([
      'r5',
      'r1',
      'r3',
      'r2',
    ]);
  });

  test('Cell sort, limit', () => {
    expect(queries.getResultSortedRowIds('q1', 'c2', false, 0, 3)).toEqual([
      'r5',
      'r1',
      'r3',
    ]);
  });

  test('Cell sort, offset', () => {
    expect(queries.getResultSortedRowIds('q1', 'c2', false, 1)).toEqual([
      'r1',
      'r3',
      'r2',
    ]);
  });

  test('Cell sort, offset & limit', () => {
    expect(queries.getResultSortedRowIds('q1', 'c2', false, 1, 2)).toEqual([
      'r1',
      'r3',
    ]);
  });

  test('Cell sort, reverse', () => {
    expect(queries.getResultSortedRowIds('q1', 'c2', true)).toEqual([
      'r2',
      'r3',
      'r1',
      'r5',
    ]);
  });

  test('Cell sort, missing cell (hence id)', () => {
    expect(queries.getResultSortedRowIds('q1')).toEqual([
      'r1',
      'r2',
      'r3',
      'r5',
    ]);
  });

  test('Cell sort listener, add row with relevant cell', () => {
    expect.assertions(7);
    queries.addResultSortedRowIdsListener(
      'q1',
      'c2',
      false,
      0,
      8,
      (_queries, queryId, cellId, descending, offset, limit, sortedRowIds) => {
        expect(queryId).toEqual('q1');
        expect(cellId).toEqual('c2');
        expect(descending).toEqual(false);
        expect(offset).toEqual(0);
        expect(limit).toEqual(8);
        expect(sortedRowIds).toEqual(['r5', 'r1', 'r7', 'r3', 'r2']);
        expect(queries.getResultSortedRowIds('q1', 'c2')).toEqual([
          'r5',
          'r1',
          'r7',
          'r3',
          'r2',
        ]);
      },
    );
    store.setRow('t1', 'r7', {c1: 7, c2: 'seven'});
  });

  test('Cell sort listener, add row without relevant cell', () => {
    expect.assertions(1);
    queries.addResultSortedRowIdsListener(
      'q1',
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
        expect(sortedRowIds).toEqual(['r5', 'r1', 'r3', 'r2', 'r7']);
      },
    );
    store.setRow('t1', 'r7', {c1: 7});
  });

  test('Cell sort listener, alter relevant cell', () => {
    expect.assertions(1);
    queries.addResultSortedRowIdsListener(
      'q1',
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
        expect(sortedRowIds).toEqual(['r5', 'r3', 'r2', 'r1']);
      },
    );
    store.setCell('t1', 'r1', 'c2', 'uno');
  });

  test('Cell sort listener, alter relevant cell, no change', () => {
    const listener = jest.fn();
    queries.addResultSortedRowIdsListener(
      'q1',
      'c2',
      false,
      0,
      undefined,
      listener,
    );
    store.setCell('t1', 'r5', 'c2', 'cinq');
    expect(listener).toHaveBeenCalledTimes(0);
  });

  test('Cell sort listener, alter relevant cell, after page', () => {
    const listener = jest.fn();
    queries.addResultSortedRowIdsListener('q1', 'c2', false, 0, 2, listener);
    store.setRow('t1', 'r7', {c1: 7, c2: 'seven'});
    expect(listener).toHaveBeenCalledTimes(0);
  });

  test('Cell sort listener, alter non-relevant cell', () => {
    const listener = jest.fn();
    queries.addResultSortedRowIdsListener(
      'q1',
      'c2',
      false,
      0,
      undefined,
      listener,
    );
    store.setCell('t1', 'r1', 'c1', '1.0');
    expect(listener).toHaveBeenCalledTimes(0);
  });
});

describe('Miscellaneous', () => {
  test('Listener cannot mutate original store', () => {
    const listener = jest.fn(() => {
      store.setValue('mutated', true);
    });
    queries.setQueryDefinition('q1', 't1', ({select}) => select('c1'));
    queries.addResultTableListener('q1', listener);
    store.setCell('t1', 'r1', 'c1', 1);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    expect(queries.getResultTable('q1')).toEqual({r1: {c1: 1}});
    expect(store.getValues()).toEqual({});
  });

  test('Listener can create new query, immediately available', () => {
    const listener = jest.fn(() => {
      queries.setQueryDefinition('q2', 't1', ({select}) => select('c2'));
      expect(queries.getResultTable('q2')).toEqual({r1: {c2: 2}});
    });
    queries.setQueryDefinition('q1', 't1', ({select}) => select('c1'));
    queries.addResultTableListener('q1', listener);
    store.setRow('t1', 'r1', {c1: 1, c2: 2});
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1, c2: 2}}});
    expect(queries.getResultTable('q1')).toEqual({r1: {c1: 1}});
    expect(queries.getResultTable('q2')).toEqual({r1: {c2: 2}});
    expect(store.getValues()).toEqual({});
  });

  test('cleans results when deleted', () => {
    setCells();
    queries.setQueryDefinition('q1', 't1', ({select}) => select('c1'));
    expect(queries.getResultTable('q1')).toEqual({
      r1: {c1: 'one'},
      r2: {c1: 'two'},
      r3: {c1: 'three'},
      r4: {c1: 'four'},
    });
    queries.delQueryDefinition('q1');
    expect(queries.getResultTable('q1')).toEqual({});
  });

  test('resets results when select changes', () => {
    setCells();
    queries.setQueryDefinition('q1', 't1', ({select}) => select('c1'));
    expect(queries.getResultTable('q1')).toEqual({
      r1: {c1: 'one'},
      r2: {c1: 'two'},
      r3: {c1: 'three'},
      r4: {c1: 'four'},
    });
    queries.setQueryDefinition('q1', 't1', ({select}) => select('c2'));
    expect(queries.getResultTable('q1')).toEqual({
      r1: {c2: 'odd'},
      r2: {c2: 'even'},
      r3: {c2: 'odd'},
      r4: {c2: 'even'},
    });
  });

  test('resets results when where changes', () => {
    setCells();
    queries.setQueryDefinition('q1', 't1', ({select, where}) => {
      select('c1');
      where((getCell) => (getCell('c1') as string)[0] == 't');
    });
    expect(queries.getResultTable('q1')).toEqual({
      r2: {c1: 'two'},
      r3: {c1: 'three'},
    });
    queries.setQueryDefinition('q1', 't1', ({select, where}) => {
      select('c1');
      where((getCell) => (getCell('c1') as string)[0] != 't');
    });
    expect(queries.getResultTable('q1')).toEqual({
      r1: {c1: 'one'},
      r4: {c1: 'four'},
    });
  });

  test('resets results when group changes', () => {
    setCells();
    queries.setQueryDefinition('q1', 't1', ({select, group}) => {
      select((getCell) => (getCell('c1') as string)[0]).as('c1');
      select('c3');
      group('c3', 'avg');
    });
    expect(queries.getResultTable('q1')).toEqual({
      0: {c1: 't', c3: 2.5},
      1: {c1: 'o', c3: 1},
      2: {c1: 'f', c3: 4},
    });
    queries.setQueryDefinition('q1', 't1', ({select, group}) => {
      select('c2');
      select('c3');
      group('c3', 'avg');
    });
    expect(queries.getResultTable('q1')).toEqual({
      0: {c2: 'even', c3: 3},
      1: {c2: 'odd', c3: 2},
    });
  });

  test('remove listener', () => {
    listener = createQueriesListener(queries);
    const listenerId = listener.listenToResultTable('/q1', 'q1');
    expect(queries.getListenerStats().table).toEqual(1);
    expect(listenerId).toEqual('0');
    queries.setQueryDefinition('q1', 't1', () => null);
    expectChanges(listener, '/q1');
    expectNoChanges(listener);
    queries.delListener(listenerId);
    expect(queries.getListenerStats().table).toEqual(0);
    expectNoChanges(listener);
  });

  test('forEachQuery', () => {
    queries
      .setQueryDefinition('q1', 't1', () => null)
      .setQueryDefinition('q2', 't1', () => null);
    const eachQuery: any = {};
    queries.forEachQuery(
      (queryId) => (eachQuery[queryId] = queries.getResultTable(queryId)),
    );
    expect(eachQuery).toEqual({q1: {}, q2: {}});
  });

  test('getQueryIds', () => {
    queries
      .setQueryDefinition('q1', 't1', () => null)
      .setQueryDefinition('q2', 't1', () => null);
    expect(queries.getQueryIds()).toEqual(['q1', 'q2']);
  });

  test('are things present', () => {
    expect(queries.hasQuery('q1')).toEqual(false);
    setCells();
    queries.setQueryDefinition('q1', 't1', ({select}) => select('c1'));
    expect(queries.hasQuery('q1')).toEqual(true);
    expect(queries.hasResultTable('q1')).toEqual(true);
    expect(queries.hasResultRow('q1', 'r1')).toEqual(true);
    expect(queries.hasResultRow('q1', 'R1')).toEqual(false);
    expect(queries.hasResultCell('q1', 'r1', 'c1')).toEqual(true);
    expect(queries.hasResultCell('q1', 'r1', 'C1')).toEqual(false);
  });

  test('forEachResultTable', () => {
    queries
      .setQueryDefinition('q1', 't1', ({select}) => select('c1'))
      .setQueryDefinition('q2', 't1', ({select}) => select('c2'));
    setCells();
    const eachQuery: any = {};
    queries.forEachResultTable((queryId, forEachResultRow) => {
      const eachRow: any = {};
      forEachResultRow((rowId, forEachResultCell) => {
        const eachCell: any = {};
        forEachResultCell((cellId, cell) => (eachCell[cellId] = cell));
        eachRow[rowId] = eachCell;
      });
      queries.forEachResultRow(queryId, (rowId) =>
        queries.forEachResultCell(queryId, rowId, (cellId, cell) =>
          expect(eachRow[rowId][cellId]).toEqual(cell),
        ),
      );
      eachQuery[queryId] = eachRow;
    });
    expect(eachQuery).toEqual({
      q1: {
        r1: {c1: 'one'},
        r2: {c1: 'two'},
        r3: {c1: 'three'},
        r4: {c1: 'four'},
      },
      q2: {
        r1: {c2: 'odd'},
        r2: {c2: 'even'},
        r3: {c2: 'odd'},
        r4: {c2: 'even'},
      },
    });
  });

  test('get the tables back out', () => {
    queries.setQueryDefinition('q1', 't1', () => null);
    expect(queries.getTableId('q1')).toEqual('t1');
  });

  test('creates new queries against different store', () => {
    const store1 = createStore();
    const store2 = createStore();
    const queries1 = createQueries(store1);
    const queries2 = createQueries(store2);
    expect(queries1).not.toBe(queries2);
  });

  test('re-uses queries against existing store', () => {
    const store = createStore();
    const queries1 = createQueries(store);
    const queries2 = createQueries(store);
    expect(queries1).toBe(queries2);
  });

  test('getStore', () => {
    expect(queries.getStore()).toEqual(store);
  });

  test('removes query definition', () => {
    expect(queries.getStore().getListenerStats().row).toEqual(0);
    queries.setQueryDefinition('q1', 't1', ({select}) => select(''));
    expect(queries.getStore().getListenerStats().row).toEqual(1);
    queries.delQueryDefinition('q1');
    expect(queries.getStore().getListenerStats().row).toEqual(0);
    expect(queries.getResultTable('q1')).toEqual({});
  });

  test('destroys', () => {
    expect(queries.getStore().getListenerStats().row).toEqual(0);
    queries.setQueryDefinition('q1', 't1', ({select}) => select(''));
    expect(queries.getStore().getListenerStats().row).toEqual(1);
    queries.destroy();
    expect(queries.getStore().getListenerStats().row).toEqual(0);
  });
});
