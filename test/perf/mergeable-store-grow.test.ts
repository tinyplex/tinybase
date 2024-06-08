import type {Store} from 'tinybase/debug';
import {createMergeableStore} from 'tinybase/debug';
import {repeatRows} from './common';

let store: Store;
beforeEach(() => {
  store = createMergeableStore('s1');
});

repeatRows(
  'Grow mergeable store with setRow (string rowIds)',
  (n) => store.setRow('t1', 'r' + n, {c1: n}),
  90,
);

repeatRows(
  'Grow mergeable store with setRow (number-like rowIds)',
  (n) => store.setRow('t1', n.toString(), {c1: n}),
  90,
);

repeatRows(
  'Grow mergeable store with setPartialRow (string rowIds)',
  (n) => store.setPartialRow('t1', 'r' + n, {c1: n}),
  90,
);

repeatRows(
  'Grow mergeable store with setPartialRow (number-like rowIds)',
  (n) => store.setPartialRow('t1', n.toString(), {c1: n}),
  90,
);

repeatRows(
  'Grow mergeable store with addRow',
  (n) => store.addRow('t1', {c1: n}),
  90,
);

repeatRows(
  'Grow mergeable store with addRow and listener',
  (n) => store.addRow('t1', {c1: n}),
  90,
  () => store.addRowIdsListener('t1', () => null),
);
