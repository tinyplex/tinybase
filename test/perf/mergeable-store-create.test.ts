import {
  getNCells,
  getNRows,
  getNTables,
  getNValues,
  repeat,
  µs,
} from './common';
import {createMergeableStore} from 'tinybase/debug';

repeat(
  'Create mergeable store without schema',
  'tables',
  'µs per table',
  (N) => [µs(() => createMergeableStore('s1').setTables(getNTables(N))), N],
  30,
);

repeat(
  'Create mergeable store without schema',
  'rows',
  'µs per row',
  (N) => [µs(() => createMergeableStore('s1').setTables({t1: getNRows(N)})), N],
  20,
);

repeat(
  'Create mergeable store without schema',
  'cells',
  'µs per cell',
  (N) => [
    µs(() => createMergeableStore('s1').setTables({t1: {r1: getNCells(N)}})),
    N,
  ],
  20,
);

repeat(
  'Create mergeable store without schema',
  'values',
  'µs per value',
  (N) => [µs(() => createMergeableStore('s1').setValues(getNValues(N))), N],
  20,
);
