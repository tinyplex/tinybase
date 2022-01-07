import {Store, createIndexes, createStore} from '../../lib/debug/tinybase';
import {repeatRows} from './common';

let store: Store;
beforeEach(() => {
  store = createStore();
  createIndexes(store).setIndexDefinition('oddEven', 'table', (getCell) =>
    (getCell('cell') as any as number) % 2 == 0 ? 'even' : 'odd',
  );
});

repeatRows(
  'Grow store, different table to index',
  (n) => store.setRow('table2', 'row' + n, {cell: n}),
  90,
);

repeatRows(
  'Grow store, same table as index, unrelated cells',
  (n) => store.setRow('table', 'row' + n, {cell2: n}),
  90,
);

repeatRows(
  'Grow store, with index',
  (n) => store.setRow('table', 'row' + n, {cell: n}),
  90,
);
