/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  MergeableChanges,
  MergeableContent,
  MergeableStore,
  createMergeableStore,
} from 'tinybase/debug';
import {START_TIME, nullStamped, stamped, time} from '../common/mergeable';

const permute = (arr: any[]): any[] => {
  if (arr.length == 1) {
    return [arr[0]];
  }
  const permutations: any[] = [];
  arr.forEach((item, i) =>
    permute([...arr.slice(0, i), ...arr.slice(i + 1)]).forEach((other) =>
      permutations.push([item, other].flat()),
    ),
  );
  return permutations;
};

beforeEach(() => jest.useFakeTimers({now: START_TIME}));

afterEach(() => jest.useRealTimers());

test('Create', () => {
  const store = createMergeableStore('s1');
  expect(store.getJson()).toEqual(JSON.stringify([{}, {}]));
});

describe('Fluency of inherited methods', () => {
  let store: MergeableStore;
  beforeEach(() => {
    store = createMergeableStore('s1');
  });
  test('Setters', () => {
    expect(store.setContent([{}, {}])).toEqual(store);
    expect(store.setTables({})).toEqual(store);
    expect(store.setTable('t1', {})).toEqual(store);
    expect(store.setRow('t1', 'r1', {})).toEqual(store);
    expect(store.setPartialRow('t1', 'r1', {})).toEqual(store);
    expect(store.setCell('t1', 'r1', 'c1', 1)).toEqual(store);
    expect(store.setValues({})).toEqual(store);
    expect(store.setPartialValues({})).toEqual(store);
    expect(store.setValue('v1', 1)).toEqual(store);
    expect(store.applyChanges([{}, {}, 1])).toEqual(store);
    expect(store.setTablesJson('{}')).toEqual(store);
    expect(store.setValuesJson('{}')).toEqual(store);
    expect(store.setJson('[{}, {}]')).toEqual(store);
    expect(store.setTablesSchema({})).toEqual(store);
    expect(store.setValuesSchema({})).toEqual(store);
    expect(store.setSchema({}, {})).toEqual(store);
  });
  test('Deleters', () => {
    expect(store.delTables()).toEqual(store);
    expect(store.delTable('t1')).toEqual(store);
    expect(store.delRow('t1', 'r1')).toEqual(store);
    expect(store.delCell('t1', 'r1', 'c1')).toEqual(store);
    expect(store.delValues()).toEqual(store);
    expect(store.delValue('v1')).toEqual(store);
    expect(store.delTablesSchema()).toEqual(store);
    expect(store.delValuesSchema()).toEqual(store);
    expect(store.delSchema()).toEqual(store);
    expect(store.delListener('0')).toEqual(store);
  });
  test('Other', () => {
    expect(store.callListener('0')).toEqual(store);
    expect(store.startTransaction()).toEqual(store);
    expect(store.finishTransaction()).toEqual(store);
  });
});

describe('getMergeableContent', () => {
  let store: MergeableStore;

  beforeEach(() => {
    store = createMergeableStore('s1');
  });

  test('Initialize', () => {
    expect(store.getMergeableContent()).toMatchSnapshot();
  });

  test('Set together', () => {
    store.setContent([
      {t1: {r1: {c1: 0, c2: 1}, r2: {c1: 2}}, t2: {r1: {c1: 3}}},
      {v1: 4, v2: 5},
    ]);
    expect(store.getMergeableContent()).toMatchSnapshot();
  });

  test('Set in sequence', () => {
    store
      .setCell('t1', 'r1', 'c1', 0)
      .setCell('t1', 'r1', 'c2', 1)
      .setCell('t1', 'r2', 'c1', 2)
      .setCell('t2', 'r1', 'c1', 3)
      .setValue('v1', 4)
      .setValue('v2', 5);
    expect(store.getMergeableContent()).toMatchSnapshot();
  });

  test('Mutate', () => {
    store
      .setContent([
        {t1: {r1: {c1: 0, c2: 1}, r2: {c1: 2}}, t2: {r1: {c1: 3}}},
        {v1: 4, v2: 5},
      ])
      .setCell('t1', 'r1', 'c1', 1)
      .delCell('t1', 'r1', 'c2')
      .delRow('t1', 'r2')
      .delTable('t2')
      .setValue('v1', 5)
      .delValue('v2');
    expect(store.getMergeableContent()).toMatchSnapshot();
  });

  test('Empty transaction', () => {
    store.startTransaction().finishTransaction();
    expect(store.getMergeableContent()).toMatchSnapshot();
  });

  test('Immutability', () => {
    store.setContent([
      {t1: {r1: {c1: 0, c2: 1}, r2: {c1: 2}}, t2: {r1: {c1: 3}}},
      {v1: 4, v2: 5},
    ]);
    const mergeableContent = store.getMergeableContent();

    mergeableContent[0] = time(0, 1, 's1');
    expect(store.getMergeableContent()[0]).toEqual(time(0, 0, 's1'));

    mergeableContent[1][0][0] = time(0, 1, 's1');
    expect(store.getMergeableContent()[1][0][0]).toEqual(time(0, 0, 's1'));

    mergeableContent[1][0][1].t1[0] = time(0, 1, 's1');
    expect(store.getMergeableContent()[1][0][1].t1[0]).toEqual(
      time(0, 0, 's1'),
    );

    mergeableContent[1][0][1].t1[1].r1[0] = time(0, 1, 's1');
    expect(store.getMergeableContent()[1][0][1].t1[1].r1[0]).toEqual(
      time(0, 0, 's1'),
    );

    mergeableContent[1][0][1].t1[1].r1[1].c1[0] = time(0, 1, 's1');
    expect(store.getMergeableContent()[1][0][1].t1[1].r1[1].c1[0]).toEqual(
      time(0, 0, 's1'),
    );

    mergeableContent[1][1][1].v1[0] = time(0, 1, 's1');
    expect(store.getMergeableContent()[1][1][1].v1[0]).toEqual(
      time(0, 0, 's1'),
    );
  });
});

describe('Deltas & Hashes', () => {
  let store1: MergeableStore;
  let store2: MergeableStore;

  beforeEach(() => {
    store1 = createMergeableStore('s1');
    store2 = createMergeableStore('s2');
  });

  describe('getMergeableContentHashes', () => {
    test('Empty', () => {
      expect(store1.getMergeableContentHashes()).toMatchSnapshot();
    });

    test('Non-empty', () => {
      store1.setContent([
        {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
        {v1: 1, v2: 2},
      ]);
      expect(store1.getMergeableContentHashes()).toMatchSnapshot();
    });
  });

  describe('getMergeableTablesHashes', () => {
    test('Empty', () => {
      expect(store1.getMergeableTablesHashes()).toMatchSnapshot();
    });

    test('Non-empty', () => {
      store1.setTables({
        t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}},
        t2: {r2: {c2: 2}},
      });
      expect(store1.getMergeableTablesHashes()).toMatchSnapshot();
    });
  });

  describe('getMergeableTableHashes', () => {
    test('Empty', () => {
      expect(store1.getMergeableTableHashes('t1')).toMatchSnapshot();
    });

    test('Non-empty', () => {
      store1.setTables({
        t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}},
        t2: {r2: {c2: 2}},
      });
      expect(store1.getMergeableTableHashes('t1')).toMatchSnapshot();
    });
  });

  describe('getMergeableRowHashes', () => {
    test('Empty', () => {
      expect(store1.getMergeableRowHashes('t1', 'r1')).toMatchSnapshot();
    });

    test('Non-empty', () => {
      store1.setTables({
        t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}},
        t2: {r2: {c2: 2}},
      });
      expect(store1.getMergeableRowHashes('t1', 'r1')).toMatchSnapshot();
    });
  });

  describe('getMergeableValuesHashes', () => {
    test('Empty', () => {
      expect(store1.getMergeableValuesHashes()).toMatchSnapshot();
    });

    test('Non-empty', () => {
      store1.setValues({v1: 1, v2: 2});
      expect(store1.getMergeableValuesHashes()).toMatchSnapshot();
    });
  });

  const expectDeltas = () => {
    expect(
      store1.getMergeableTablesDelta(store2.getMergeableTablesHashes()),
    ).toMatchSnapshot('getMergeableTablesDelta');
    expect(
      store1.getMergeableTableDelta('t1', store2.getMergeableTableHashes('t1')),
    ).toMatchSnapshot('getMergeableTableDelta t1');
    expect(
      store1.getMergeableTableDelta('t2', store2.getMergeableTableHashes('t2')),
    ).toMatchSnapshot('getMergeableTableDelta t2');
    expect(
      store1.getMergeableRowDelta(
        't1',
        'r1',
        store2.getMergeableRowHashes('t1', 'r1'),
      ),
    ).toMatchSnapshot('getMergeableRowDelta t1 r1');
    expect(
      store1.getMergeableRowDelta(
        't1',
        'r2',
        store2.getMergeableRowHashes('t1', 'r2'),
      ),
    ).toMatchSnapshot('getMergeableRowDelta t1 r2');
    expect(
      store1.getMergeableValuesDelta(store2.getMergeableValuesHashes()),
    ).toMatchSnapshot('getMergeableValuesDelta');
  };

  describe('Deltas', () => {
    test('Both empty', () => {
      expectDeltas();
    });

    test('Both match', () => {
      store1.setContent([
        {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
        {v1: 2, v2: 2},
      ]);
      store2.merge(store1);
      expectDeltas();
    });

    describe('No match', () => {
      test('store1 empty', () => {
        store2.setContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
          {v1: 1, v2: 2},
        ]);
        expectDeltas();
      });

      test('store2 empty', () => {
        store1.setContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
          {v1: 1, v2: 2},
        ]);
        expectDeltas();
      });

      test('store1 missing tables', () => {
        store2.setTables({
          t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}},
          t2: {r2: {c2: 2}},
        });
        expectDeltas();
      });

      test('store2 missing tables', () => {
        store1.setTables({
          t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}},
          t2: {r2: {c2: 2}},
        });
        expectDeltas();
      });

      test('different tables', () => {
        store1.setTable('t1', {r1: {c1: 1, c2: 2}, r2: {c2: 2}});
        store2.setTable('t2', {r2: {c2: 2}});
        expectDeltas();
      });

      test('store1 missing table', () => {
        store2.setTables({t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}});
        store1.merge(store2);
        store2.setTable('t2', {r2: {c2: 2}});
        expectDeltas();
      });

      test('store2 missing table', () => {
        store1.setTables({t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}});
        store2.merge(store1);
        store1.setTable('t2', {r2: {c2: 2}});
        expectDeltas();
      });

      test('different table', () => {
        store1.setRow('t1', 'r1', {c1: 1, c2: 2});
        store2.setRow('t1', 'r2', {c2: 2});
        expectDeltas();
      });

      test('store1 missing row', () => {
        store2.setTable('t1', {r1: {c1: 1, c2: 2}});
        store1.merge(store2);
        store2.setRow('t1', 'r2', {c2: 2});
        expectDeltas();
      });

      test('store2 missing row', () => {
        store1.setTable('t1', {r1: {c1: 1, c2: 2}});
        store2.merge(store1);
        store1.setRow('t1', 'r2', {c2: 2});
        expectDeltas();
      });

      test('different row', () => {
        store1.setCell('t1', 'r1', 'c1', 1);
        store2.setCell('t1', 'r1', 'c2', 2);
        expectDeltas();
      });

      test('store1 missing cell', () => {
        store1.setRow('t1', 'r1', {c1: 1});
        store1.merge(store2);
        store2.setCell('t1', 'r1', 'c2', 2);
        expectDeltas();
      });

      test('store2 missing cell', () => {
        store2.setRow('t1', 'r1', {c1: 1});
        store2.merge(store1);
        store1.setCell('t1', 'r1', 'c2', 2);
        expectDeltas();
      });

      test('different cell', () => {
        store1.setCell('t1', 'r1', 'c1', 1);
        store2.setCell('t1', 'r1', 'c1', 2);
        expectDeltas();
      });

      test('store1 missing values', () => {
        store2.setValues({v1: 1, v2: 2});
        expectDeltas();
      });

      test('store2 missing values', () => {
        store1.setValues({v1: 1, v2: 2});
        expectDeltas();
      });

      test('different values', () => {
        store1.setValue('v1', 1);
        store2.setValue('v2', 2);
        expectDeltas();
      });

      test('store1 missing value', () => {
        store2.setValues({v1: 1});
        store1.merge(store2);
        store2.setValue('v2', 2);
        expectDeltas();
      });

      test('store2 missing value', () => {
        store1.setValues({v1: 1});
        store2.merge(store1);
        store1.setValue('v2', 2);
        expectDeltas();
      });

      test('different value', () => {
        store1.setValue('v1', 1);
        store2.setValue('v1', 2);
        expectDeltas();
      });
    });
  });
});

describe('getTransactionMergeableChanges', () => {
  let store: MergeableStore;

  beforeEach(() => {
    store = createMergeableStore('s1');
  });

  test('Outside transaction', () => {
    expect(store.getTransactionMergeableChanges()).toEqual(
      nullStamped([nullStamped({}), nullStamped({})]),
    );
    expect(store.getTransactionMergeableChanges()).toEqual(
      nullStamped([nullStamped({}), nullStamped({})]),
    );
  });

  test('Inside noop transaction', () => {
    store.startTransaction();
    expect(store.getTransactionMergeableChanges()).toEqual(
      nullStamped([nullStamped({}), nullStamped({})]),
    );
    expect(store.getTransactionMergeableChanges()).toEqual(
      nullStamped([nullStamped({}), nullStamped({})]),
    );
    store.finishTransaction();
  });

  test('Inside net noop transaction', () => {
    store.startTransaction();
    store.setCell('t1', 'r1', 'c1', 1);
    expect(store.getTransactionMergeableChanges()).toEqual(
      stamped(0, 0, [
        stamped(0, 0, {
          t1: stamped(0, 0, {r1: stamped(0, 0, {c1: stamped(0, 0, 1)})}),
        }),
        nullStamped({}),
      ]),
    );
    expect(store.getTransactionMergeableChanges()).toEqual(
      stamped(0, 0, [
        stamped(0, 0, {
          t1: stamped(0, 0, {r1: stamped(0, 0, {c1: stamped(0, 0, 1)})}),
        }),
        nullStamped({}),
      ]),
    );
    store.delCell('t1', 'r1', 'c1');
    expect(store.getTransactionMergeableChanges()).toEqual(
      nullStamped([nullStamped({}), nullStamped({})]),
    );
    expect(store.getTransactionMergeableChanges()).toEqual(
      nullStamped([nullStamped({}), nullStamped({})]),
    );
    store.finishTransaction();
  });

  test('After net noop transaction', () => {
    store.addDidFinishTransactionListener(() => {
      expect(store.getTransactionMergeableChanges()).toEqual(
        nullStamped([nullStamped({}), nullStamped({})]),
      );
      expect(store.getTransactionMergeableChanges()).toEqual(
        nullStamped([nullStamped({}), nullStamped({})]),
      );
    });
    store.startTransaction();
    store.setCell('t1', 'r1', 'c1', 1);
    store.delCell('t1', 'r1', 'c1');
    store.finishTransaction();
  });

  test('After transaction', () => {
    store.addDidFinishTransactionListener(() => {
      expect(store.getTransactionMergeableChanges()).toEqual(
        stamped(0, 0, [
          stamped(0, 0, {
            t1: stamped(0, 0, {r1: stamped(0, 0, {c1: stamped(0, 0, 1)})}),
          }),
          nullStamped({}),
        ]),
      );
    });
    store.startTransaction();
    store.setCell('t1', 'r1', 'c1', 1);
    store.finishTransaction();
  });

  test('During and after transaction', () => {
    store.addDidFinishTransactionListener(() => {
      expect(store.getTransactionMergeableChanges()).toEqual(
        stamped(0, 0, [
          stamped(0, 0, {
            t1: stamped(0, 0, {r1: stamped(0, 0, {c1: stamped(0, 0, 1)})}),
          }),
          nullStamped({}),
        ]),
      );
    });
    store.startTransaction();
    store.setCell('t1', 'r1', 'c1', 1);
    expect(store.getTransactionMergeableChanges()).toEqual(
      stamped(0, 0, [
        stamped(0, 0, {
          t1: stamped(0, 0, {r1: stamped(0, 0, {c1: stamped(0, 0, 1)})}),
        }),
        nullStamped({}),
      ]),
    );
    store.finishTransaction();
  });

  test('After two transactions', () => {
    let count = 0;
    store.addDidFinishTransactionListener(() => {
      expect(store.getTransactionMergeableChanges()).toEqual(
        stamped(0, count, [
          stamped(0, count, {
            ['t' + count]: stamped(0, count, {
              ['r' + count]: stamped(0, count, {
                ['c' + count]: stamped(0, count, count),
              }),
            }),
          }),
          nullStamped({}),
        ]),
      );
      expect(store.getMergeableContent()).toMatchSnapshot();
      count++;
    });
    store.setCell('t0', 'r0', 'c0', 0);
    store.setCell('t1', 'r1', 'c1', 1);
  });
});

describe('apply/setMergeableContent', () => {
  let store: MergeableStore;

  beforeEach(() => {
    store = createMergeableStore('s1');
  });

  test('apply into empty store', () => {
    store.applyMergeableChanges(
      stamped(0, 0, [
        stamped(0, 0, {
          t1: stamped(0, 0, {r1: stamped(0, 0, {c1: stamped(0, 0, 1)})}),
        }),
        stamped(0, 0, {v1: stamped(0, 0, 1)}),
      ]) as MergeableContent,
    );
    expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
    expect(store.getMergeableContent()).toMatchSnapshot();
  });

  test('apply over existing content', () => {
    store.setContent([{t1: {r1: {c0: 0}}}, {v0: 0}]);
    store.applyMergeableChanges(
      stamped(0, 1, [
        stamped(0, 1, {
          t1: stamped(0, 1, {r1: stamped(0, 1, {c1: stamped(0, 1, 1)})}),
        }),
        stamped(0, 1, {v1: stamped(0, 1, 1)}),
      ]) as MergeableContent,
    );
    expect(store.getContent()).toEqual([
      {t1: {r1: {c0: 0, c1: 1}}},
      {v0: 0, v1: 1},
    ]);
    expect(store.getMergeableContent()).toMatchSnapshot();
  });

  test('set into empty store', () => {
    store.setMergeableContent([
      'Hc2DO@000008DKS9',
      [
        [
          'Hc2DO@000008DKS9',
          {
            t1: [
              'Hc2DO@000008DKS9',
              {
                r1: [
                  'Hc2DO@000008DKS9',
                  {c1: ['Hc2DO@000008DKS9', 1, 4065945599]},
                  1279994494,
                ],
              },
              1293085726,
            ],
          },
          4033596827,
        ],
        [
          'Hc2DO@000008DKS9',
          {v1: ['Hc2DO@000008DKS9', 1, 4065945599]},
          2304392760,
        ],
      ],
      2033316771,
    ] as MergeableContent);
    expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
    expect(store.getMergeableContent()).toMatchSnapshot();
  });

  test('set over existing content', () => {
    store.setContent([{t1: {r1: {c0: 0}}}, {v0: 0}]);
    store.setMergeableContent([
      'Hc2DO@000018DKS9',
      [
        [
          'Hc2DO@000018DKS9',
          {
            t1: [
              'Hc2DO@000018DKS9',
              {
                r1: [
                  'Hc2DO@000018DKS9',
                  {c1: ['Hc2DO@000018DKS9', 1, 3207404266]},
                  1254797189,
                ],
              },
              423436526,
            ],
          },
          639574078,
        ],
        [
          'Hc2DO@000018DKS9',
          {v1: ['Hc2DO@000018DKS9', 1, 3207404266]},
          2404136035,
        ],
      ],
      2840794205,
    ] as MergeableContent);
    expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
    expect(store.getMergeableContent()).toMatchSnapshot();
    store.setCell('t1', 'r1', 'c2', 2);
    expect(store.getContent()).toEqual([{t1: {r1: {c1: 1, c2: 2}}}, {v1: 1}]);
    expect(store.getMergeableContent()).toMatchSnapshot();
  });

  test('set with wrong hashes', () => {
    store.setMergeableContent([
      'Hc2DO@000018DKS9',
      [
        [
          'Hc2DO@000018DKS9',
          {
            t1: [
              'Hc2DO@000018DKS9',
              {r1: ['Hc2DO@000018DKS9', {c1: ['Hc2DO@000018DKS9', 1, 1]}, 2]},
              3,
            ],
          },
          4,
        ],
        ['Hc2DO@000018DKS9', {v1: ['Hc2DO@000018DKS9', 1, 5]}, 6],
      ],
      7,
    ] as MergeableContent);
    expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
    expect(store.getMergeableContent()).toMatchSnapshot();
  });

  test.each([
    '',
    1,
    true,
    {},
    [],
    [''],
    ['', {}],
    [0, {}, 0],
    ['', {}, 0],
    ['', {}, ''],
    ['', [0, 0], 0],
    ['', [[], []], 0],
    [
      '',
      [
        ['', 0, 0],
        ['', 0, 0],
      ],
      0,
    ],
  ])('set with invalid structure, %s', (invalid: any) => {
    store.setContent([{t1: {r1: {c1: 1}}}, {v1: 1}]);
    // @ts-ignore
    store.setMergeableContent(invalid);
    expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
  });
});

describe('Merge', () => {
  let store1: MergeableStore;
  let store2: MergeableStore;

  test('Nothing', () => {
    store1 = createMergeableStore('s1');
    store2 = createMergeableStore('s2');
    const noChanges: MergeableChanges = nullStamped([
      nullStamped({}),
      nullStamped({}),
    ]);

    expect(store1.getContent()).toEqual([{}, {}]);
    expect(store1.getMergeableContent()).toMatchSnapshot();
    expect(store1.applyMergeableChanges(noChanges)).toEqual(store1);
    expect(store1.getContent()).toEqual([{}, {}]);

    expect(store2.getContent()).toEqual([{}, {}]);
    expect(store2.getMergeableContent()).toMatchSnapshot();
    expect(store2.applyMergeableChanges(noChanges)).toEqual(store2);
    expect(store2.getContent()).toEqual([{}, {}]);
  });

  describe('One way', () => {
    // Note that these tests run in order to mutate the store in a sequence.
    beforeAll(() => {
      store1 = createMergeableStore('s1');
      store2 = createMergeableStore('s2');
    });

    test('setTables', () => {
      store1.setTables({
        t1: {r1: {c1: 0, c2: 0}, r2: {c1: 0}},
        t2: {r1: {c1: 0}},
      });
      expect(store1.getMergeableContent()).toMatchSnapshot();

      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getContent()).toEqual(store1.getContent());
      expect(store2.getMergeableContent()).toEqual(
        store1.getMergeableContent(),
      );
    });

    test('setCell', () => {
      store1.setCell('t1', 'r1', 'c1', 1);
      expect(store1.getMergeableContent()).toMatchSnapshot();

      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getContent()).toEqual(store1.getContent());
      expect(store2.getMergeableContent()).toEqual(
        store1.getMergeableContent(),
      );
    });

    test('delCell', () => {
      store1.delCell('t1', 'r1', 'c2');
      expect(store1.getMergeableContent()).toMatchSnapshot();

      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getContent()).toEqual(store1.getContent());
      expect(store2.getMergeableContent()).toEqual(
        store1.getMergeableContent(),
      );
    });

    test('delRow', () => {
      store1.delRow('t1', 'r2');
      expect(store1.getMergeableContent()).toMatchSnapshot();

      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getContent()).toEqual(store1.getContent());
      expect(store2.getMergeableContent()).toEqual(
        store1.getMergeableContent(),
      );
    });

    test('delTable', () => {
      store1.delTable('t2');
      expect(store1.getMergeableContent()).toMatchSnapshot();

      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getContent()).toEqual(store1.getContent());
      expect(store2.getMergeableContent()).toEqual(
        store1.getMergeableContent(),
      );
    });

    test('setCell 2', () => {
      store1.setCell('t2', 'r2', 'c2', 2);
      expect(store1.getMergeableContent()).toMatchSnapshot();

      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getContent()).toEqual(store1.getContent());
      expect(store2.getMergeableContent()).toEqual(
        store1.getMergeableContent(),
      );
    });

    test('delTables', () => {
      store1.delTables();
      expect(store1.getMergeableContent()).toMatchSnapshot();

      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getContent()).toEqual(store1.getContent());
      expect(store2.getMergeableContent()).toEqual(
        store1.getMergeableContent(),
      );
    });

    test('setValues', () => {
      store1.setValues({v1: 0, v2: 0});
      expect(store1.getMergeableContent()).toMatchSnapshot();

      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getContent()).toEqual(store1.getContent());
      expect(store2.getMergeableContent()).toEqual(
        store1.getMergeableContent(),
      );
    });

    test('setValue', () => {
      store1.setValue('v1', 1);
      expect(store1.getMergeableContent()).toMatchSnapshot();

      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getContent()).toEqual(store1.getContent());
      expect(store2.getMergeableContent()).toEqual(
        store1.getMergeableContent(),
      );
    });

    test('delValue', () => {
      store1.delValue('v2');
      expect(store1.getMergeableContent()).toMatchSnapshot();

      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getContent()).toEqual(store1.getContent());
      expect(store2.getMergeableContent()).toEqual(
        store1.getMergeableContent(),
      );
    });

    test('delValues', () => {
      store1.delValues();
      expect(store1.getMergeableContent()).toMatchSnapshot();

      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getContent()).toEqual(store1.getContent());
      expect(store2.getMergeableContent()).toEqual(
        store1.getMergeableContent(),
      );
    });
  });

  describe('Two way', () => {
    beforeEach(() => {
      store1 = createMergeableStore('s1');
      store2 = createMergeableStore('s2');
    });

    test('Mutually exclusive tables vs values', () => {
      store1.setTables({t1: {r1: {c1: 0}}});
      expect(store1.getMergeableContent()).toMatchSnapshot();

      jest.advanceTimersByTime(1);

      store2.setValues({v1: 0});
      expect(store2.getMergeableContent()).toMatchSnapshot();

      store1.merge(store2);

      expect(store1.getContent()).toEqual([{t1: {r1: {c1: 0}}}, {v1: 0}]);
      expect(store1.getMergeableContent()).toMatchSnapshot();

      expect(store2.getContent()).toEqual(store1.getContent());
      expect(store2.getMergeableContent()).toEqual(
        store1.getMergeableContent(),
      );
    });

    test('Mutually exclusive tables & values', () => {
      store1.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
      expect(store1.getMergeableContent()).toMatchSnapshot();

      jest.advanceTimersByTime(1);

      store2
        .setTables({t1: {r1: {c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}})
        .setValues({v2: 2});
      expect(store2.getMergeableContent()).toMatchSnapshot();

      store1.merge(store2);

      expect(store1.getContent()).toEqual([
        {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
        {v1: 1, v2: 2},
      ]);
      expect(store1.getMergeableContent()).toMatchSnapshot();

      expect(store2.getContent()).toEqual(store1.getContent());
      expect(store2.getMergeableContent()).toEqual(
        store1.getMergeableContent(),
      );
    });

    test('Conflict', () => {
      store1.setTables({t1: {r1: {c1: 1}}}).setValues({v0: 0, v1: 1});
      expect(store1.getMergeableContent()).toMatchSnapshot();

      jest.advanceTimersByTime(1);

      store2.setTables({t1: {r1: {c1: 2}}}).setValues({v1: 2});
      expect(store2.getMergeableContent()).toMatchSnapshot();

      store1.merge(store2);

      expect(store1.getContent()).toEqual([
        {t1: {r1: {c1: 2}}},
        {v0: 0, v1: 2},
      ]);
      expect(store1.getMergeableContent()).toMatchSnapshot();

      expect(store2.getContent()).toEqual(store1.getContent());
      expect(store2.getMergeableContent()).toEqual(
        store1.getMergeableContent(),
      );
    });

    describe('Commutativity & idempotence', () => {
      const OPERATIONS = {
        set1: stamped(0, 1, [
          stamped(0, 1, {
            t1: stamped(0, 1, {r1: stamped(0, 1, {c1: stamped(0, 1, 1)})}),
          }),
          stamped(0, 1, {v1: stamped(0, 1, 1)}),
        ]),

        set2: stamped(0, 2, [
          stamped(0, 2, {
            t2: stamped(0, 2, {r2: stamped(0, 2, {c2: stamped(0, 2, 2)})}),
          }),
          stamped(0, 2, {v2: stamped(0, 2, 2)}),
        ]),

        set3: stamped(0, 3, [
          stamped(0, 3, {
            t1: stamped(0, 3, {r2: stamped(0, 3, {c2: stamped(0, 3, 1)})}),
          }),
          stamped(0, 2, {}),
        ]),

        set4: stamped(0, 4, [
          stamped(0, 4, {
            t1: stamped(0, 4, {r1: stamped(0, 4, {c2: stamped(0, 4, 1)})}),
          }),
          stamped(0, 2, {}),
        ]),

        upd5: stamped(0, 5, [
          stamped(0, 5, {
            t1: stamped(0, 5, {r1: stamped(0, 5, {c1: stamped(0, 5, 2)})}),
          }),
          stamped(0, 5, {v1: stamped(0, 5, 2)}),
        ]),

        upd6: stamped(0, 6, [
          stamped(0, 6, {
            t1: stamped(0, 6, {r2: stamped(0, 6, {c2: stamped(0, 6, 2)})}),
          }),
          stamped(0, 5, {}),
        ]),

        upd7: stamped(0, 7, [
          stamped(0, 7, {
            t1: stamped(0, 7, {r1: stamped(0, 7, {c2: stamped(0, 7, 2)})}),
          }),
          stamped(0, 5, {}),
        ]),

        del8: stamped(0, 8, [
          stamped(0, 8, {
            t1: stamped(0, 8, {
              r1: stamped(0, 8, {c2: stamped(0, 8, undefined)}),
            }),
          }),
          stamped(0, 8, {v2: stamped(0, 8, undefined)}),
        ]),

        del9: stamped(0, 9, [
          stamped(0, 9, {
            t1: stamped(0, 9, {
              r2: stamped(0, 9, {c2: stamped(0, 9, undefined)}),
            }),
          }),
          stamped(0, 5, {}),
        ]),

        del10: stamped(0, 10, [
          stamped(0, 10, {
            t2: stamped(0, 10, {
              r2: stamped(0, 10, {c2: stamped(0, 10, undefined)}),
            }),
          }),
          stamped(0, 5, {}),
        ]),
      } as any as {[id: string]: MergeableContent};
      const SAMPLE_ALL_PERMUTATIONS = 0;

      test.each([
        [Object.keys(OPERATIONS)],
        [Object.keys(OPERATIONS).reverse()],
        [[...Object.keys(OPERATIONS), ...Object.keys(OPERATIONS)]],
        ...(SAMPLE_ALL_PERMUTATIONS
          ? permute(Object.keys(OPERATIONS))
              .map((p) => [p])
              .filter(() => Math.random() * 10000 < 1)
              .slice(0, SAMPLE_ALL_PERMUTATIONS)
          : []),
      ])('All, %s', (order) => {
        order.forEach((id: string) =>
          store1.applyMergeableChanges(OPERATIONS[id]),
        );
        expect(store1.getContent()).toEqual([{t1: {r1: {c1: 2}}}, {v1: 2}]);
      });

      test.each(
        permute(['set1', 'set2', 'upd5', 'upd6', 'del10']).map((p) => [p]),
      )('Some, %s', (order) => {
        order.forEach((id: string) =>
          store1.applyMergeableChanges(OPERATIONS[id]),
        );
        expect(store1.getContent()).toEqual([
          {t1: {r1: {c1: 2}, r2: {c2: 2}}},
          {v1: 2, v2: 2},
        ]);
      });

      test.each(permute(['set3', 'set4', 'upd7', 'del8']).map((p) => [p]))(
        'Others, %s',
        (order) => {
          order.forEach((id: string) =>
            store1.applyMergeableChanges(OPERATIONS[id]),
          );
          expect(store1.getContent()).toEqual([{t1: {r2: {c2: 1}}}, {}]);
        },
      );
    });

    test('Causality', () => {
      store1.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
      store2.applyMergeableChanges(store1.getMergeableContent());

      store2
        .setCell('t1', 'r1', 'c1', (cell) => (cell as number) + 1)
        .setValue('v1', (value) => (value as number) + 1);
      store1.merge(store2);

      expect(store1.getContent()).toEqual([{t1: {r1: {c1: 2}}}, {v1: 2}]);
      expect(store1.getMergeableContent()).toMatchSnapshot();

      expect(store2.getContent()).toEqual(store1.getContent());
      expect(store2.getMergeableContent()).toEqual(
        store1.getMergeableContent(),
      );

      store1
        .setCell('t1', 'r1', 'c1', (cell) => (cell as number) + 1)
        .setValue('v1', (value) => (value as number) + 1);
      store2.merge(store1);

      expect(store1.getContent()).toEqual([{t1: {r1: {c1: 3}}}, {v1: 3}]);
      expect(store1.getMergeableContent()).toMatchSnapshot();

      expect(store2.getContent()).toEqual(store1.getContent());
      expect(store2.getMergeableContent()).toEqual(
        store1.getMergeableContent(),
      );
    });

    test('Interleaving', () => {
      store1.setCell('t1', 'r1', 'c1', 1);
      jest.advanceTimersByTime(1);
      store2.setCell('t1', 'r1', 'c2', 2);
      jest.advanceTimersByTime(1);
      store1.delCell('t1', 'r1', 'c1');

      expect(store1.getMergeableContent()).toMatchSnapshot();
      expect(store2.getMergeableContent()).toMatchSnapshot();

      store1.merge(store2);

      expect(store1.getContent()).toEqual([{t1: {r1: {c2: 2}}}, {}]);
      expect(store2.getContent()).toEqual([{t1: {r1: {c2: 2}}}, {}]);
    });
  });
});
