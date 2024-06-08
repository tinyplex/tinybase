import {createRelationships, createStore} from 'tinybase/debug';
import type {Store} from 'tinybase/debug';
import {repeatRows} from './common';

let store: Store;
beforeEach(() => {
  store = createStore();
  createRelationships(store).setRelationshipDefinition(
    'previousRow',
    't1',
    't1',
    (getCell) => 'r' + ((getCell('c1') as number) - 1),
  );
});

repeatRows(
  'Grow store, different table to relationship',
  (n) => store.setRow('t2', 'r' + n, {c1: n}),
  90,
);

repeatRows(
  'Grow store, same table as relationship, unrelated cells',
  (n) => store.setRow('t1', 'r' + n, {c2: n}),
  90,
);

repeatRows(
  'Grow store, with relationship',
  (n) => store.setRow('t1', 'r' + n, {c1: n}),
  90,
);
