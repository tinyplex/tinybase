import {createIndexes, createStore} from 'tinybase/debug';
import type {Store} from 'tinybase/debug';
import {repeatRows} from './common.ts';

let store: Store;
beforeEach(() => {
  store = createStore();
  createIndexes(store).setIndexDefinition('i1', 't1', (getCell) =>
    (getCell('c1') as any as number) % 2 == 0 ? 'even' : 'odd',
  );
});

repeatRows(
  'Grow store, different table to index',
  (n) => store.setRow('t2', 'r' + n, {c1: n}),
  90,
);

repeatRows(
  'Grow store, same table as index, unrelated cells',
  (n) => store.setRow('t1', 'r' + n, {c2: n}),
  90,
);

repeatRows(
  'Grow store, with index',
  (n) => store.setRow('t1', 'r' + n, {c1: n}),
  90,
);
