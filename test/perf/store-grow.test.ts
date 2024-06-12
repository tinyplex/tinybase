import type {Store} from 'tinybase';
import {createStore} from 'tinybase';
import {repeatRows} from './common.ts';

let store: Store;
beforeEach(() => {
  store = createStore();
});

repeatRows(
  'Grow store with setRow (string rowIds)',
  (n) => store.setRow('t1', 'r' + n, {c1: n}),
  90,
);

repeatRows(
  'Grow store with setRow (number-like rowIds)',
  (n) => store.setRow('t1', n.toString(), {c1: n}),
  90,
);

repeatRows(
  'Grow store with setPartialRow (string rowIds)',
  (n) => store.setPartialRow('t1', 'r' + n, {c1: n}),
  90,
);

repeatRows(
  'Grow store with setPartialRow (number-like rowIds)',
  (n) => store.setPartialRow('t1', n.toString(), {c1: n}),
  90,
);

repeatRows('Grow store with addRow', (n) => store.addRow('t1', {c1: n}), 90);

repeatRows(
  'Grow store with addRow and listener',
  (n) => store.addRow('t1', {c1: n}),
  90,
  () => store.addRowIdsListener('t1', () => null),
);
