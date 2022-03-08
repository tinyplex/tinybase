import {
  Id,
  Queries,
  Store,
  createQueries,
  createStore,
} from '../../lib/debug/tinybase';
import {
  QueriesListener,
  createQueriesListener,
  expectChanges,
  expectNoChanges,
} from './common';

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
  const number = (number: number) => `${numberPrefix}${number}`;

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

    test('double-joined table by id', () => {
      setCells();
      setCells('t2', '', '.j1');
      setCells('t3', '', '.j2');
      queries.setQueryDefinition('q1', 't1', ({select, join}) => {
        select('c1').as('t1.c1');
        select('t2', 'c1').as('t2.c1');
        select('t3', 'c1').as('t3.c1');
        join('t2', (getCell) => `r${(getCell('c2') as string)?.length}`);
        join(
          't3',
          't2',
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
    expect(listener).toBeCalled();
  });

  describe('Selects', () => {
    test('root table column by id (all listeners)', () => {
      listener.listenToResultRowIds('/q1r', 'q1');
      listener.listenToResultRowIds('/q*r', null);
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
      ['/q1r', '/q*r'].forEach((listenerId) =>
        expectChanges(
          listener,
          listenerId,
          {q1: ['r1']},
          {q1: ['r2', 'r3']},
          {q1: ['r2', 'r3', 'r1']},
          {q1: ['r2', 'r3', 'r1', 'r4']},
          {q1: ['r2', 'r3', 'r1']},
          {q1: ['r2', 'r1']},
          {q1: ['r1']},
          {q1: []},
        ),
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
        {q1: {r1: ['c1']}},
        {q1: {r1: []}},
        {q1: {r1: ['c1']}},
        {q1: {r1: []}},
      );
      expectChanges(
        listener,
        '/q1/r*c',
        {q1: {r1: ['c1']}},
        {q1: {r2: ['c1']}},
        {q1: {r3: ['c1']}},
        {q1: {r1: []}},
        {q1: {r1: ['c1']}},
        {q1: {r4: ['c1']}},
        {q1: {r4: []}},
        {q1: {r3: []}},
        {q1: {r2: []}},
        {q1: {r1: []}},
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

    test('double-joined table by id; t1, t2, t3', () => {
      queries.setQueryDefinition('q1', 't1', ({select, join}) => {
        select('c1').as('t1.c1');
        select('t2', 'c1').as('t2.c1');
        select('t3', 'c1').as('t3.c1');
        join('t2', (getCell) => `r${(getCell('c2') as string)?.length}`);
        join(
          't3',
          't2',
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

    test('double-joined table by id; t1, t3, t2', () => {
      queries.setQueryDefinition('q1', 't1', ({select, join}) => {
        select('c1').as('t1.c1');
        select('t2', 'c1').as('t2.c1');
        select('t3', 'c1').as('t3.c1');
        join('t2', (getCell) => `r${(getCell('c2') as string)?.length}`);
        join(
          't3',
          't2',
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

    test('double-joined table by id; t2, t3, t1', () => {
      queries.setQueryDefinition('q1', 't1', ({select, join}) => {
        select('c1').as('t1.c1');
        select('t2', 'c1').as('t2.c1');
        select('t3', 'c1').as('t3.c1');
        join('t2', (getCell) => `r${(getCell('c2') as string)?.length}`);
        join(
          't3',
          't2',
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
});

describe('Miscellaneous', () => {
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

  test('reuses queries against existing store', () => {
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
