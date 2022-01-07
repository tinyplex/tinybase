import {
  Store,
  createRelationships,
  createStore,
} from '../../lib/debug/tinybase';
import {repeatRows} from './common';

let store: Store;
beforeEach(() => {
  store = createStore();
  createRelationships(store).setRelationshipDefinition(
    'previousRow',
    'table',
    'table',
    (getCell) => 'row' + ((getCell('cell') as number) - 1),
  );
});

repeatRows(
  'Grow store, different table to relationship',
  (n) => store.setRow('table2', 'row' + n, {cell: n}),
  90,
);

repeatRows(
  'Grow store, same table as relationship, unrelated cells',
  (n) => store.setRow('table', 'row' + n, {cell2: n}),
  90,
);

repeatRows(
  'Grow store, with relationship',
  (n) => store.setRow('table', 'row' + n, {cell: n}),
  90,
);
