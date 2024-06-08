import {createQueries, createStore} from 'tinybase/debug';
import type {Store} from 'tinybase/debug';
import {repeatRows} from './common';

let store: Store;
beforeEach(() => {
  store = createStore();
});

repeatRows(
  'Grow store, different table to query',
  (n) => store.setRow('t2', 'row' + n, {c1: n}),
  90,
  () =>
    createQueries(store).setQueryDefinition('q1', 't1', ({select}) =>
      select('c1'),
    ),
);

repeatRows(
  'Grow store, same table as query, unrelated cells',
  (n) => store.setRow('t1', 'r' + n, {c2: n}),
  90,
  () =>
    createQueries(store).setQueryDefinition('q1', 't1', ({select}) =>
      select('c1'),
    ),
);

repeatRows(
  'Grow store, same table as query, select root cell',
  (n) => store.setRow('t1', 'r' + n, {c1: n}),
  90,
  () =>
    createQueries(store).setQueryDefinition('q1', 't1', ({select}) =>
      select('c1'),
    ),
);

repeatRows(
  'Grow store, same table as query, select calculated cell',
  (n) => store.setRow('t1', 'r' + n, {c1: n}),
  90,
  () =>
    createQueries(store).setQueryDefinition('q1', 't1', ({select}) =>
      select((getTableCell) => (getTableCell('c1') as number) + 1).as('c1'),
    ),
);

repeatRows(
  'Grow store, with where',
  (n) => store.setRow('t1', 'r' + n, {c1: n}),
  90,
  () =>
    createQueries(store).setQueryDefinition('q1', 't1', ({select, where}) => {
      select('c1');
      where((getTableCell) => (getTableCell('c1') as number) < 100);
    }),
);

repeatRows(
  'Grow store, with two tables joined',
  (n) => store.setRow('t1', 'r' + n, {c1: n, c2: 'r' + n}),
  90,
  () =>
    createQueries(store).setQueryDefinition('q1', 't1', ({select, join}) => {
      select('t1', 'c1');
      select('t1', 'c1');
      join('t1', 'c2').as('t2');
    }),
);

['sum', 'avg', 'min', 'max'].forEach((aggregate: string) =>
  repeatRows(
    `Grow store, with ${aggregate} group`,
    (n) =>
      store.setRow('t1', 'r' + n, {
        c1: Math.random() < 0.5 ? 'a' : 'b',
        c2: Math.random(),
      }),
    90,
    () =>
      createQueries(store).setQueryDefinition('q1', 't1', ({select, group}) => {
        select('c1');
        select('c2');
        group('c2', aggregate as 'sum' | 'avg' | 'min' | 'max');
      }),
  ),
);

['sum', 'avg', 'min', 'max'].forEach((aggregate: string) =>
  repeatRows(
    `Grow store, with ${aggregate} group and having`,
    (n) =>
      store.setRow('t1', 'r' + n, {
        c1: Math.random() < 0.5 ? 'a' : 'b',
        c2: Math.random(),
      }),
    90,
    () =>
      createQueries(store).setQueryDefinition(
        'q1',
        't1',
        ({select, group, having}) => {
          select('c1');
          select('c2');
          group('c2', aggregate as 'sum' | 'avg' | 'min' | 'max');
          having(
            (getSelectedOrGroupedCell) =>
              (getSelectedOrGroupedCell('c2') as number) > 0.25,
          );
        },
      ),
  ),
);
