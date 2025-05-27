/* eslint-disable @typescript-eslint/ban-ts-comment */
import {createMergeableStore} from 'tinybase';
import {getTimeFunctions} from '../../common/mergeable.ts';

const [reset, getNow, pause] = getTimeFunctions();

beforeEach(() => {
  reset();
});

test('changes during transaction', () => {
  const store = createMergeableStore('s1', getNow);
  store.startTransaction().setCell('t1', 'r1', 'c1', 1).setValue('v1', 1);
  expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
  expect(store.getTransactionChanges()).toEqual([
    {t1: {r1: {c1: 1}}},
    {v1: 1},
    1,
  ]);
  expect(store.getTransactionMergeableChanges()).toEqual([[{}], [{}], 1]);
  expect(store.getMergeableContent()).toEqual([
    [{}, '', 0],
    [{}, '', 0],
  ]);
  store.finishTransaction();
  expect(store.getMergeableContent()).toEqual([
    [
      {
        t1: [
          {r1: [{c1: [1, 'Nn1JUF-----7JQY8', 1003668370]}, '', 550994372]},
          '',
          1072852846,
        ],
      },
      '',
      1771939739,
    ],
    [{v1: [1, 'Nn1JUF----07JQY8', 1130939691]}, '', 3877632732],
  ]);
});

test('changes at end of transaction', () => {
  const store = createMergeableStore('s1', getNow);
  store.addDidFinishTransactionListener(() => {
    expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
    expect(store.getTransactionChanges()).toEqual([
      {t1: {r1: {c1: 1}}},
      {v1: 1},
      1,
    ]);
    expect(store.getTransactionMergeableChanges()).toEqual([
      [{t1: [{r1: [{c1: [1, 'Nn1JUF-----7JQY8']}]}]}],
      [{v1: [1, 'Nn1JUF----07JQY8']}],
      1,
    ]);
    expect(store.getMergeableContent()).toEqual([
      [
        {
          t1: [
            {r1: [{c1: [1, 'Nn1JUF-----7JQY8', 1003668370]}, '', 550994372]},
            '',
            1072852846,
          ],
        },
        '',
        1771939739,
      ],
      [{v1: [1, 'Nn1JUF----07JQY8', 1130939691]}, '', 3877632732],
    ]);
  });
  store
    .startTransaction()
    .setCell('t1', 'r1', 'c1', 1)
    .setValue('v1', 1)
    .finishTransaction();
});

test('changes after transaction', () => {
  const store = createMergeableStore('s1', getNow);
  store
    .startTransaction()
    .setCell('t1', 'r1', 'c1', 1)
    .setValue('v1', 1)
    .finishTransaction();
  expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
  expect(store.getTransactionChanges()).toEqual([{}, {}, 1]);
  expect(store.getTransactionMergeableChanges()).toEqual([[{}], [{}], 1]);
  expect(store.getMergeableContent()).toEqual([
    [
      {
        t1: [
          {r1: [{c1: [1, 'Nn1JUF-----7JQY8', 1003668370]}, '', 550994372]},
          '',
          1072852846,
        ],
      },
      '',
      1771939739,
    ],
    [{v1: [1, 'Nn1JUF----07JQY8', 1130939691]}, '', 3877632732],
  ]);
});
