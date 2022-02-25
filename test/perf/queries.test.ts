import {Store, createQueries, createStore} from '../../lib/debug/tinybase';
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
