import {Store, createStore} from '../../lib/debug/tinybase';
import {repeatRows} from './common';

let store: Store;
beforeEach(() => {
  store = createStore();
});

repeatRows(
  'Grow store with setRow (string rowIds)',
  (n) => store.setRow('table', 'row' + n, {cell: n}),
  90,
);

repeatRows(
  'Grow store with setRow (number-like rowIds)',
  (n) => store.setRow('table', n.toString(), {cell: n}),
  90,
);

repeatRows(
  'Grow store with setPartialRow (string rowIds)',
  (n) => store.setPartialRow('table', 'row' + n, {cell1: n}),
  90,
);

repeatRows(
  'Grow store with setPartialRow (number-like rowIds)',
  (n) => store.setPartialRow('table', n.toString(), {cell1: n}),
  90,
);

repeatRows(
  'Grow store with addRow',
  (n) => store.addRow('table', {cell: n}),
  90,
);

repeatRows(
  'Grow store with addRow and listener',
  (n) => store.addRow('table', {cell: n}),
  90,
  () => store.addRowIdsListener('table', () => null),
);
