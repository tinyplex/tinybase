import {
  MergeableContent,
  MergeableStore,
  createMergeableStore,
} from 'tinybase/debug';
import {
  START_TIME,
  nullStamped,
  stamped1,
  stamped2,
  time,
} from '../common/mergeable';

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
    expect(store.applyChanges([{}, {}])).toEqual(store);
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
    expect(store.getMergeableContent()).toEqual(
      nullStamped([nullStamped({}), nullStamped({})]),
    );
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

  test('Set together', () => {
    store.setContent([
      {t1: {r1: {c1: 0, c2: 1}, r2: {c1: 2}}, t2: {r1: {c1: 3}}},
      {v1: 4, v2: 5},
    ]);
    expect(store.getMergeableContent()).toEqual(
      stamped1(0, 0, [
        stamped1(0, 0, {
          t1: stamped1(0, 0, {
            r1: stamped1(0, 0, {c1: stamped1(0, 0, 0), c2: stamped1(0, 0, 1)}),
            r2: stamped1(0, 0, {c1: stamped1(0, 0, 2)}),
          }),
          t2: stamped1(0, 0, {r1: stamped1(0, 0, {c1: stamped1(0, 0, 3)})}),
        }),
        stamped1(0, 0, {v1: stamped1(0, 0, 4), v2: stamped1(0, 0, 5)}),
      ]),
    );
  });

  test('Set in sequence', () => {
    store
      .setCell('t1', 'r1', 'c1', 0)
      .setCell('t1', 'r1', 'c2', 1)
      .setCell('t1', 'r2', 'c1', 2)
      .setCell('t2', 'r1', 'c1', 3)
      .setValue('v1', 4)
      .setValue('v2', 5);
    expect(store.getMergeableContent()).toEqual(
      stamped1(0, 5, [
        stamped1(0, 3, {
          t1: stamped1(0, 2, {
            r1: stamped1(0, 1, {c1: stamped1(0, 0, 0), c2: stamped1(0, 1, 1)}),
            r2: stamped1(0, 2, {c1: stamped1(0, 2, 2)}),
          }),
          t2: stamped1(0, 3, {r1: stamped1(0, 3, {c1: stamped1(0, 3, 3)})}),
        }),
        stamped1(0, 5, {v1: stamped1(0, 4, 4), v2: stamped1(0, 5, 5)}),
      ]),
    );
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
    expect(store.getMergeableContent()).toEqual(
      stamped1(0, 6, [
        stamped1(0, 4, {
          t1: stamped1(0, 3, {
            r1: stamped1(0, 2, {
              c1: stamped1(0, 1, 1),
              c2: stamped1(0, 2, undefined),
            }),
            r2: stamped1(0, 3, {c1: stamped1(0, 3, undefined)}),
          }),
          t2: stamped1(0, 4, {
            r1: stamped1(0, 4, {c1: stamped1(0, 4, undefined)}),
          }),
        }),
        stamped1(0, 6, {v1: stamped1(0, 5, 5), v2: stamped1(0, 6, undefined)}),
      ]),
    );
  });

  test('Empty transaction', () => {
    store.startTransaction().finishTransaction();
    expect(store.getMergeableContent()).toEqual(
      nullStamped([nullStamped({}), nullStamped({})]),
    );
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
      stamped1(0, 0, [
        stamped1(0, 0, {
          t1: stamped1(0, 0, {r1: stamped1(0, 0, {c1: stamped1(0, 0, 1)})}),
        }),
        nullStamped({}),
      ]),
    );
    expect(store.getTransactionMergeableChanges()).toEqual(
      stamped1(0, 0, [
        stamped1(0, 0, {
          t1: stamped1(0, 0, {r1: stamped1(0, 0, {c1: stamped1(0, 0, 1)})}),
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
        stamped1(0, 0, [
          stamped1(0, 0, {
            t1: stamped1(0, 0, {r1: stamped1(0, 0, {c1: stamped1(0, 0, 1)})}),
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
        stamped1(0, 0, [
          stamped1(0, 0, {
            t1: stamped1(0, 0, {r1: stamped1(0, 0, {c1: stamped1(0, 0, 1)})}),
          }),
          nullStamped({}),
        ]),
      );
    });
    store.startTransaction();
    store.setCell('t1', 'r1', 'c1', 1);
    expect(store.getTransactionMergeableChanges()).toEqual(
      stamped1(0, 0, [
        stamped1(0, 0, {
          t1: stamped1(0, 0, {r1: stamped1(0, 0, {c1: stamped1(0, 0, 1)})}),
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
        stamped1(0, count, [
          stamped1(0, count, {
            ['t' + count]: stamped1(0, count, {
              ['r' + count]: stamped1(0, count, {
                ['c' + count]: stamped1(0, count, count),
              }),
            }),
          }),
          nullStamped({}),
        ]),
      );
      expect(store.getMergeableContent()).toEqual(
        stamped1(0, count, [
          stamped1(
            0,
            count,
            Object.fromEntries(
              new Array(count + 1).fill('').map((_, c) => [
                ['t' + c],
                stamped1(0, c, {
                  ['r' + c]: stamped1(0, c, {['c' + c]: stamped1(0, c, c)}),
                }),
              ]),
            ),
          ),
          nullStamped({}),
        ]),
      );
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
      stamped1(0, 0, [
        stamped1(0, 0, {
          t1: stamped1(0, 0, {r1: stamped1(0, 0, {c1: stamped1(0, 0, 1)})}),
        }),
        stamped1(0, 0, {v1: stamped1(0, 0, 1)}),
      ]) as MergeableContent,
    );
    expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
    expect(store.getMergeableContent()).toEqual(
      stamped1(0, 0, [
        stamped1(0, 0, {
          t1: stamped1(0, 0, {r1: stamped1(0, 0, {c1: stamped1(0, 0, 1)})}),
        }),
        stamped1(0, 0, {v1: stamped1(0, 0, 1)}),
      ]),
    );
  });

  test('apply over existing content', () => {
    store.setContent([{t1: {r1: {c0: 0}}}, {v0: 0}]);
    store.applyMergeableChanges(
      stamped1(0, 1, [
        stamped1(0, 1, {
          t1: stamped1(0, 1, {r1: stamped1(0, 1, {c1: stamped1(0, 1, 1)})}),
        }),
        stamped1(0, 1, {v1: stamped1(0, 1, 1)}),
      ]) as MergeableContent,
    );
    expect(store.getContent()).toEqual([
      {t1: {r1: {c0: 0, c1: 1}}},
      {v0: 0, v1: 1},
    ]);
    expect(store.getMergeableContent()).toEqual(
      stamped1(0, 1, [
        stamped1(0, 1, {
          t1: stamped1(0, 1, {
            r1: stamped1(0, 1, {c0: stamped1(0, 0, 0), c1: stamped1(0, 1, 1)}),
          }),
        }),
        stamped1(0, 1, {v0: stamped1(0, 0, 0), v1: stamped1(0, 1, 1)}),
      ]),
    );
  });

  test('set into empty store', () => {
    store.setMergeableContent(
      stamped1(0, 0, [
        stamped1(0, 0, {
          t1: stamped1(0, 0, {r1: stamped1(0, 0, {c1: stamped1(0, 0, 1)})}),
        }),
        stamped1(0, 0, {v1: stamped1(0, 0, 1)}),
      ]) as MergeableContent,
    );
    expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
    expect(store.getMergeableContent()).toEqual(
      stamped1(0, 0, [
        stamped1(0, 0, {
          t1: stamped1(0, 0, {r1: stamped1(0, 0, {c1: stamped1(0, 0, 1)})}),
        }),
        stamped1(0, 0, {v1: stamped1(0, 0, 1)}),
      ]),
    );
  });

  test('set over existing content', () => {
    store.setContent([{t1: {r1: {c0: 0}}}, {v0: 0}]);
    store.setMergeableContent(
      stamped1(0, 1, [
        stamped1(0, 1, {
          t1: stamped1(0, 1, {r1: stamped1(0, 1, {c1: stamped1(0, 1, 1)})}),
        }),
        stamped1(0, 1, {v1: stamped1(0, 1, 1)}),
      ]) as MergeableContent,
    );
    expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
    expect(store.getMergeableContent()).toEqual(
      stamped1(0, 1, [
        stamped1(0, 1, {
          t1: stamped1(0, 1, {r1: stamped1(0, 1, {c1: stamped1(0, 1, 1)})}),
        }),
        stamped1(0, 1, {v1: stamped1(0, 1, 1)}),
      ]),
    );
    store.setCell('t1', 'r1', 'c2', 2);
    expect(store.getContent()).toEqual([{t1: {r1: {c1: 1, c2: 2}}}, {v1: 1}]);
    expect(store.getMergeableContent()).toEqual(
      stamped1(0, 2, [
        stamped1(0, 2, {
          t1: stamped1(0, 2, {
            r1: stamped1(0, 2, {c1: stamped1(0, 1, 1), c2: stamped1(0, 2, 2)}),
          }),
        }),
        stamped1(0, 1, {v1: stamped1(0, 1, 1)}),
      ]),
    );
  });
});

describe('Merge', () => {
  let store1: MergeableStore;
  let store2: MergeableStore;

  test('Nothing', () => {
    store1 = createMergeableStore('s1');
    store2 = createMergeableStore('s2');
    const noChanges: MergeableContent = nullStamped([
      nullStamped({}),
      nullStamped({}),
    ]);

    expect(store1.getContent()).toEqual([{}, {}]);
    const mergeableContent1 = store1.getMergeableContent();
    expect(mergeableContent1).toEqual(noChanges);
    expect(store1.applyMergeableChanges(noChanges)).toEqual(store1);
    expect(store1.getContent()).toEqual([{}, {}]);

    expect(store2.getContent()).toEqual([{}, {}]);
    const mergeableContent2 = store2.getMergeableContent();
    expect(mergeableContent2).toEqual(noChanges);
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
      expect(store1.getMergeableContent()).toEqual(
        stamped1(0, 0, [
          stamped1(0, 0, {
            t1: stamped1(0, 0, {
              r1: stamped1(0, 0, {
                c1: stamped1(0, 0, 0),
                c2: stamped1(0, 0, 0),
              }),
              r2: stamped1(0, 0, {c1: stamped1(0, 0, 0)}),
            }),
            t2: stamped1(0, 0, {r1: stamped1(0, 0, {c1: stamped1(0, 0, 0)})}),
          }),
          nullStamped({}),
        ]),
      );

      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getContent()).toEqual([
        {t1: {r1: {c1: 0, c2: 0}, r2: {c1: 0}}, t2: {r1: {c1: 0}}},
        {},
      ]);
      expect(store2.getMergeableContent()).toEqual(
        stamped1(0, 0, [
          stamped1(0, 0, {
            t1: stamped1(0, 0, {
              r1: stamped1(0, 0, {
                c1: stamped1(0, 0, 0),
                c2: stamped1(0, 0, 0),
              }),
              r2: stamped1(0, 0, {c1: stamped1(0, 0, 0)}),
            }),
            t2: stamped1(0, 0, {r1: stamped1(0, 0, {c1: stamped1(0, 0, 0)})}),
          }),
          nullStamped({}),
        ]),
      );
    });

    test('setCell', () => {
      store1.setCell('t1', 'r1', 'c1', 1);
      expect(store1.getMergeableContent()).toEqual(
        stamped1(0, 1, [
          stamped1(0, 1, {
            t1: stamped1(0, 1, {
              r1: stamped1(0, 1, {
                c1: stamped1(0, 1, 1),
                c2: stamped1(0, 0, 0),
              }),
              r2: stamped1(0, 0, {c1: stamped1(0, 0, 0)}),
            }),
            t2: stamped1(0, 0, {r1: stamped1(0, 0, {c1: stamped1(0, 0, 0)})}),
          }),
          nullStamped({}),
        ]),
      );

      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getContent()).toEqual([
        {t1: {r1: {c1: 1, c2: 0}, r2: {c1: 0}}, t2: {r1: {c1: 0}}},
        {},
      ]);
      expect(store2.getMergeableContent()).toEqual(
        stamped1(0, 1, [
          stamped1(0, 1, {
            t1: stamped1(0, 1, {
              r1: stamped1(0, 1, {
                c1: stamped1(0, 1, 1),
                c2: stamped1(0, 0, 0),
              }),
              r2: stamped1(0, 0, {c1: stamped1(0, 0, 0)}),
            }),
            t2: stamped1(0, 0, {r1: stamped1(0, 0, {c1: stamped1(0, 0, 0)})}),
          }),
          nullStamped({}),
        ]),
      );
    });

    test('delCell', () => {
      store1.delCell('t1', 'r1', 'c2');
      expect(store1.getMergeableContent()).toEqual(
        stamped1(0, 2, [
          stamped1(0, 2, {
            t1: stamped1(0, 2, {
              r1: stamped1(0, 2, {
                c1: stamped1(0, 1, 1),
                c2: stamped1(0, 2, undefined),
              }),
              r2: stamped1(0, 0, {c1: stamped1(0, 0, 0)}),
            }),
            t2: stamped1(0, 0, {r1: stamped1(0, 0, {c1: stamped1(0, 0, 0)})}),
          }),
          nullStamped({}),
        ]),
      );

      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getContent()).toEqual([
        {t1: {r1: {c1: 1}, r2: {c1: 0}}, t2: {r1: {c1: 0}}},
        {},
      ]);
      expect(store2.getMergeableContent()).toEqual(
        stamped1(0, 2, [
          stamped1(0, 2, {
            t1: stamped1(0, 2, {
              r1: stamped1(0, 2, {
                c1: stamped1(0, 1, 1),
                c2: stamped1(0, 2, undefined),
              }),
              r2: stamped1(0, 0, {c1: stamped1(0, 0, 0)}),
            }),
            t2: stamped1(0, 0, {r1: stamped1(0, 0, {c1: stamped1(0, 0, 0)})}),
          }),
          nullStamped({}),
        ]),
      );
    });

    test('delRow', () => {
      store1.delRow('t1', 'r2');
      expect(store1.getMergeableContent()).toEqual(
        stamped1(0, 3, [
          stamped1(0, 3, {
            t1: stamped1(0, 3, {
              r1: stamped1(0, 2, {
                c1: stamped1(0, 1, 1),
                c2: stamped1(0, 2, undefined),
              }),
              r2: stamped1(0, 3, {c1: stamped1(0, 3, undefined)}),
            }),
            t2: stamped1(0, 0, {r1: stamped1(0, 0, {c1: stamped1(0, 0, 0)})}),
          }),
          nullStamped({}),
        ]),
      );

      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getContent()).toEqual([
        {t1: {r1: {c1: 1}}, t2: {r1: {c1: 0}}},
        {},
      ]);
      expect(store2.getMergeableContent()).toEqual(
        stamped1(0, 3, [
          stamped1(0, 3, {
            t1: stamped1(0, 3, {
              r1: stamped1(0, 2, {
                c1: stamped1(0, 1, 1),
                c2: stamped1(0, 2, undefined),
              }),
              r2: stamped1(0, 3, {c1: stamped1(0, 3, undefined)}),
            }),
            t2: stamped1(0, 0, {r1: stamped1(0, 0, {c1: stamped1(0, 0, 0)})}),
          }),
          nullStamped({}),
        ]),
      );
    });

    test('delTable', () => {
      store1.delTable('t2');
      expect(store1.getMergeableContent()).toEqual(
        stamped1(0, 4, [
          stamped1(0, 4, {
            t1: stamped1(0, 3, {
              r1: stamped1(0, 2, {
                c1: stamped1(0, 1, 1),
                c2: stamped1(0, 2, undefined),
              }),
              r2: stamped1(0, 3, {c1: stamped1(0, 3, undefined)}),
            }),
            t2: stamped1(0, 4, {
              r1: stamped1(0, 4, {c1: stamped1(0, 4, undefined)}),
            }),
          }),
          nullStamped({}),
        ]),
      );

      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {}]);
      expect(store2.getMergeableContent()).toEqual(
        stamped1(0, 4, [
          stamped1(0, 4, {
            t1: stamped1(0, 3, {
              r1: stamped1(0, 2, {
                c1: stamped1(0, 1, 1),
                c2: stamped1(0, 2, undefined),
              }),
              r2: stamped1(0, 3, {c1: stamped1(0, 3, undefined)}),
            }),
            t2: stamped1(0, 4, {
              r1: stamped1(0, 4, {c1: stamped1(0, 4, undefined)}),
            }),
          }),
          nullStamped({}),
        ]),
      );
    });

    test('setCell 2', () => {
      store1.setCell('t2', 'r2', 'c2', 2);
      expect(store1.getMergeableContent()).toEqual(
        stamped1(0, 5, [
          stamped1(0, 5, {
            t1: stamped1(0, 3, {
              r1: stamped1(0, 2, {
                c1: stamped1(0, 1, 1),
                c2: stamped1(0, 2, undefined),
              }),
              r2: stamped1(0, 3, {c1: stamped1(0, 3, undefined)}),
            }),
            t2: stamped1(0, 5, {
              r1: stamped1(0, 4, {c1: stamped1(0, 4, undefined)}),
              r2: stamped1(0, 5, {c2: stamped1(0, 5, 2)}),
            }),
          }),
          nullStamped({}),
        ]),
      );

      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getContent()).toEqual([
        {t1: {r1: {c1: 1}}, t2: {r2: {c2: 2}}},
        {},
      ]);
      expect(store2.getMergeableContent()).toEqual(
        stamped1(0, 5, [
          stamped1(0, 5, {
            t1: stamped1(0, 3, {
              r1: stamped1(0, 2, {
                c1: stamped1(0, 1, 1),
                c2: stamped1(0, 2, undefined),
              }),
              r2: stamped1(0, 3, {c1: stamped1(0, 3, undefined)}),
            }),
            t2: stamped1(0, 5, {
              r1: stamped1(0, 4, {c1: stamped1(0, 4, undefined)}),
              r2: stamped1(0, 5, {c2: stamped1(0, 5, 2)}),
            }),
          }),
          nullStamped({}),
        ]),
      );
    });

    test('delTables', () => {
      store1.delTables();
      expect(store1.getMergeableContent()).toEqual(
        stamped1(0, 6, [
          stamped1(0, 6, {
            t1: stamped1(0, 6, {
              r1: stamped1(0, 6, {
                c1: stamped1(0, 6, undefined),
                c2: stamped1(0, 2, undefined),
              }),
              r2: stamped1(0, 3, {c1: stamped1(0, 3, undefined)}),
            }),
            t2: stamped1(0, 6, {
              r1: stamped1(0, 4, {c1: stamped1(0, 4, undefined)}),
              r2: stamped1(0, 6, {c2: stamped1(0, 6, undefined)}),
            }),
          }),
          nullStamped({}),
        ]),
      );

      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getContent()).toEqual([{}, {}]);
      expect(store2.getMergeableContent()).toEqual(
        stamped1(0, 6, [
          stamped1(0, 6, {
            t1: stamped1(0, 6, {
              r1: stamped1(0, 6, {
                c1: stamped1(0, 6, undefined),
                c2: stamped1(0, 2, undefined),
              }),
              r2: stamped1(0, 3, {c1: stamped1(0, 3, undefined)}),
            }),
            t2: stamped1(0, 6, {
              r1: stamped1(0, 4, {c1: stamped1(0, 4, undefined)}),
              r2: stamped1(0, 6, {c2: stamped1(0, 6, undefined)}),
            }),
          }),
          nullStamped({}),
        ]),
      );
    });

    test('setValues', () => {
      store1.setValues({v1: 0, v2: 0});
      expect(store1.getMergeableContent()).toEqual(
        stamped1(0, 7, [
          stamped1(0, 6, {
            t1: stamped1(0, 6, {
              r1: stamped1(0, 6, {
                c1: stamped1(0, 6, undefined),
                c2: stamped1(0, 2, undefined),
              }),
              r2: stamped1(0, 3, {c1: stamped1(0, 3, undefined)}),
            }),
            t2: stamped1(0, 6, {
              r1: stamped1(0, 4, {c1: stamped1(0, 4, undefined)}),
              r2: stamped1(0, 6, {c2: stamped1(0, 6, undefined)}),
            }),
          }),
          stamped1(0, 7, {v1: stamped1(0, 7, 0), v2: stamped1(0, 7, 0)}),
        ]),
      );

      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getContent()).toEqual([{}, {v1: 0, v2: 0}]);
      expect(store2.getMergeableContent()).toEqual(
        stamped1(0, 7, [
          stamped1(0, 6, {
            t1: stamped1(0, 6, {
              r1: stamped1(0, 6, {
                c1: stamped1(0, 6, undefined),
                c2: stamped1(0, 2, undefined),
              }),
              r2: stamped1(0, 3, {c1: stamped1(0, 3, undefined)}),
            }),
            t2: stamped1(0, 6, {
              r1: stamped1(0, 4, {c1: stamped1(0, 4, undefined)}),
              r2: stamped1(0, 6, {c2: stamped1(0, 6, undefined)}),
            }),
          }),
          stamped1(0, 7, {v1: stamped1(0, 7, 0), v2: stamped1(0, 7, 0)}),
        ]),
      );
    });

    test('setValue', () => {
      store1.setValue('v1', 1);
      expect(store1.getMergeableContent()).toEqual(
        stamped1(0, 8, [
          stamped1(0, 6, {
            t1: stamped1(0, 6, {
              r1: stamped1(0, 6, {
                c1: stamped1(0, 6, undefined),
                c2: stamped1(0, 2, undefined),
              }),
              r2: stamped1(0, 3, {c1: stamped1(0, 3, undefined)}),
            }),
            t2: stamped1(0, 6, {
              r1: stamped1(0, 4, {c1: stamped1(0, 4, undefined)}),
              r2: stamped1(0, 6, {c2: stamped1(0, 6, undefined)}),
            }),
          }),
          stamped1(0, 8, {v1: stamped1(0, 8, 1), v2: stamped1(0, 7, 0)}),
        ]),
      );

      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getContent()).toEqual([{}, {v1: 1, v2: 0}]);
      expect(store2.getMergeableContent()).toEqual(
        stamped1(0, 8, [
          stamped1(0, 6, {
            t1: stamped1(0, 6, {
              r1: stamped1(0, 6, {
                c1: stamped1(0, 6, undefined),
                c2: stamped1(0, 2, undefined),
              }),
              r2: stamped1(0, 3, {c1: stamped1(0, 3, undefined)}),
            }),
            t2: stamped1(0, 6, {
              r1: stamped1(0, 4, {c1: stamped1(0, 4, undefined)}),
              r2: stamped1(0, 6, {c2: stamped1(0, 6, undefined)}),
            }),
          }),
          stamped1(0, 8, {v1: stamped1(0, 8, 1), v2: stamped1(0, 7, 0)}),
        ]),
      );
    });

    test('delValue', () => {
      store1.delValue('v2');
      expect(store1.getMergeableContent()).toEqual(
        stamped1(0, 9, [
          stamped1(0, 6, {
            t1: stamped1(0, 6, {
              r1: stamped1(0, 6, {
                c1: stamped1(0, 6, undefined),
                c2: stamped1(0, 2, undefined),
              }),
              r2: stamped1(0, 3, {c1: stamped1(0, 3, undefined)}),
            }),
            t2: stamped1(0, 6, {
              r1: stamped1(0, 4, {c1: stamped1(0, 4, undefined)}),
              r2: stamped1(0, 6, {c2: stamped1(0, 6, undefined)}),
            }),
          }),
          stamped1(0, 9, {
            v1: stamped1(0, 8, 1),
            v2: stamped1(0, 9, undefined),
          }),
        ]),
      );

      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getContent()).toEqual([{}, {v1: 1}]);
      expect(store2.getMergeableContent()).toEqual(
        stamped1(0, 9, [
          stamped1(0, 6, {
            t1: stamped1(0, 6, {
              r1: stamped1(0, 6, {
                c1: stamped1(0, 6, undefined),
                c2: stamped1(0, 2, undefined),
              }),
              r2: stamped1(0, 3, {c1: stamped1(0, 3, undefined)}),
            }),
            t2: stamped1(0, 6, {
              r1: stamped1(0, 4, {c1: stamped1(0, 4, undefined)}),
              r2: stamped1(0, 6, {c2: stamped1(0, 6, undefined)}),
            }),
          }),
          stamped1(0, 9, {
            v1: stamped1(0, 8, 1),
            v2: stamped1(0, 9, undefined),
          }),
        ]),
      );
    });

    test('delValues', () => {
      store1.delValues();
      expect(store1.getMergeableContent()).toEqual(
        stamped1(0, 10, [
          stamped1(0, 6, {
            t1: stamped1(0, 6, {
              r1: stamped1(0, 6, {
                c1: stamped1(0, 6, undefined),
                c2: stamped1(0, 2, undefined),
              }),
              r2: stamped1(0, 3, {c1: stamped1(0, 3, undefined)}),
            }),
            t2: stamped1(0, 6, {
              r1: stamped1(0, 4, {c1: stamped1(0, 4, undefined)}),
              r2: stamped1(0, 6, {c2: stamped1(0, 6, undefined)}),
            }),
          }),
          stamped1(0, 10, {
            v1: stamped1(0, 10, undefined),
            v2: stamped1(0, 9, undefined),
          }),
        ]),
      );

      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getContent()).toEqual([{}, {}]);
      expect(store2.getMergeableContent()).toEqual(
        stamped1(0, 10, [
          stamped1(0, 6, {
            t1: stamped1(0, 6, {
              r1: stamped1(0, 6, {
                c1: stamped1(0, 6, undefined),
                c2: stamped1(0, 2, undefined),
              }),
              r2: stamped1(0, 3, {c1: stamped1(0, 3, undefined)}),
            }),
            t2: stamped1(0, 6, {
              r1: stamped1(0, 4, {c1: stamped1(0, 4, undefined)}),
              r2: stamped1(0, 6, {c2: stamped1(0, 6, undefined)}),
            }),
          }),
          stamped1(0, 10, {
            v1: stamped1(0, 10, undefined),
            v2: stamped1(0, 9, undefined),
          }),
        ]),
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
      const mergeableContent1 = store1.getMergeableContent();
      expect(mergeableContent1).toEqual(
        stamped1(0, 0, [
          stamped1(0, 0, {
            t1: stamped1(0, 0, {r1: stamped1(0, 0, {c1: stamped1(0, 0, 0)})}),
          }),
          nullStamped({}),
        ]),
      );

      jest.advanceTimersByTime(1);

      store2.setValues({v1: 0});
      const mergeableContent2 = store2.getMergeableContent();
      expect(mergeableContent2).toEqual(
        stamped2(1, 0, [
          nullStamped({}),
          stamped2(1, 0, {v1: stamped2(1, 0, 0)}),
        ]),
      );

      store1.merge(store2);

      expect(store1.getContent()).toEqual([{t1: {r1: {c1: 0}}}, {v1: 0}]);
      expect(store1.getMergeableContent()).toEqual(
        stamped2(1, 0, [
          stamped1(0, 0, {
            t1: stamped1(0, 0, {r1: stamped1(0, 0, {c1: stamped1(0, 0, 0)})}),
          }),
          stamped2(1, 0, {v1: stamped2(1, 0, 0)}),
        ]),
      );

      expect(store2.getContent()).toEqual(store1.getContent());
      expect(store2.getMergeableContent()).toEqual(
        store1.getMergeableContent(),
      );
    });

    test('Mutually exclusive tables & values', () => {
      store1.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
      const mergeableContent1 = store1.getMergeableContent();
      expect(mergeableContent1).toEqual(
        stamped1(0, 1, [
          stamped1(0, 0, {
            t1: stamped1(0, 0, {r1: stamped1(0, 0, {c1: stamped1(0, 0, 1)})}),
          }),
          stamped1(0, 1, {v1: stamped1(0, 1, 1)}),
        ]),
      );

      jest.advanceTimersByTime(1);

      store2
        .setTables({t1: {r1: {c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}})
        .setValues({v2: 2});
      const mergeableContent2 = store2.getMergeableContent();
      expect(mergeableContent2).toEqual(
        stamped2(1, 1, [
          stamped2(1, 0, {
            t1: stamped2(1, 0, {
              r1: stamped2(1, 0, {c2: stamped2(1, 0, 2)}),
              r2: stamped2(1, 0, {c2: stamped2(1, 0, 2)}),
            }),
            t2: stamped2(1, 0, {r2: stamped2(1, 0, {c2: stamped2(1, 0, 2)})}),
          }),
          stamped2(1, 1, {v2: stamped2(1, 1, 2)}),
        ]),
      );

      store1.merge(store2);

      expect(store1.getContent()).toEqual([
        {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
        {v1: 1, v2: 2},
      ]);
      expect(store1.getMergeableContent()).toEqual(
        stamped2(1, 1, [
          stamped2(1, 0, {
            t1: stamped2(1, 0, {
              r1: stamped2(1, 0, {
                c1: stamped1(0, 0, 1),
                c2: stamped2(1, 0, 2),
              }),
              r2: stamped2(1, 0, {c2: stamped2(1, 0, 2)}),
            }),
            t2: stamped2(1, 0, {r2: stamped2(1, 0, {c2: stamped2(1, 0, 2)})}),
          }),
          stamped2(1, 1, {v1: stamped1(0, 1, 1), v2: stamped2(1, 1, 2)}),
        ]),
      );

      expect(store2.getContent()).toEqual(store1.getContent());
      expect(store2.getMergeableContent()).toEqual(
        store1.getMergeableContent(),
      );
    });

    test('Conflict', () => {
      store1.setTables({t1: {r1: {c1: 1}}}).setValues({v0: 0, v1: 1});
      const mergeableContent1 = store1.getMergeableContent();
      expect(mergeableContent1).toEqual(
        stamped1(0, 1, [
          stamped1(0, 0, {
            t1: stamped1(0, 0, {r1: stamped1(0, 0, {c1: stamped1(0, 0, 1)})}),
          }),
          stamped1(0, 1, {v0: stamped1(0, 1, 0), v1: stamped1(0, 1, 1)}),
        ]),
      );

      jest.advanceTimersByTime(1);

      store2.setTables({t1: {r1: {c1: 2}}}).setValues({v1: 2});
      const mergeableContent2 = store2.getMergeableContent();
      expect(mergeableContent2).toEqual(
        stamped2(1, 1, [
          stamped2(1, 0, {
            t1: stamped2(1, 0, {r1: stamped2(1, 0, {c1: stamped2(1, 0, 2)})}),
          }),
          stamped2(1, 1, {v1: stamped2(1, 1, 2)}),
        ]),
      );

      store1.merge(store2);

      expect(store1.getContent()).toEqual([
        {t1: {r1: {c1: 2}}},
        {v0: 0, v1: 2},
      ]);
      expect(store1.getMergeableContent()).toEqual(
        stamped2(1, 1, [
          stamped2(1, 0, {
            t1: stamped2(1, 0, {r1: stamped2(1, 0, {c1: stamped2(1, 0, 2)})}),
          }),
          stamped2(1, 1, {v0: stamped1(0, 1, 0), v1: stamped2(1, 1, 2)}),
        ]),
      );

      expect(store2.getContent()).toEqual(store1.getContent());
      expect(store2.getMergeableContent()).toEqual(
        store1.getMergeableContent(),
      );
    });

    describe('Commutativity & idempotence', () => {
      const OPERATIONS = {
        set1: stamped1(0, 1, [
          stamped1(0, 1, {
            t1: stamped1(0, 1, {r1: stamped1(0, 1, {c1: stamped1(0, 1, 1)})}),
          }),
          stamped1(0, 1, {v1: stamped1(0, 1, 1)}),
        ]),

        set2: stamped1(0, 2, [
          stamped1(0, 2, {
            t2: stamped1(0, 2, {r2: stamped1(0, 2, {c2: stamped1(0, 2, 2)})}),
          }),
          stamped1(0, 2, {v2: stamped1(0, 2, 2)}),
        ]),

        set3: stamped1(0, 3, [
          stamped1(0, 3, {
            t1: stamped1(0, 3, {r2: stamped1(0, 3, {c2: stamped1(0, 3, 1)})}),
          }),
          stamped1(0, 2, {}),
        ]),

        set4: stamped1(0, 4, [
          stamped1(0, 4, {
            t1: stamped1(0, 4, {r1: stamped1(0, 4, {c2: stamped1(0, 4, 1)})}),
          }),
          stamped1(0, 2, {}),
        ]),

        upd5: stamped1(0, 5, [
          stamped1(0, 5, {
            t1: stamped1(0, 5, {r1: stamped1(0, 5, {c1: stamped1(0, 5, 2)})}),
          }),
          stamped1(0, 5, {v1: stamped1(0, 5, 2)}),
        ]),

        upd6: stamped1(0, 6, [
          stamped1(0, 6, {
            t1: stamped1(0, 6, {r2: stamped1(0, 6, {c2: stamped1(0, 6, 2)})}),
          }),
          stamped1(0, 5, {}),
        ]),

        upd7: stamped1(0, 7, [
          stamped1(0, 7, {
            t1: stamped1(0, 7, {r1: stamped1(0, 7, {c2: stamped1(0, 7, 2)})}),
          }),
          stamped1(0, 5, {}),
        ]),

        del8: stamped1(0, 8, [
          stamped1(0, 8, {
            t1: stamped1(0, 8, {
              r1: stamped1(0, 8, {c2: stamped1(0, 8, undefined)}),
            }),
          }),
          stamped1(0, 8, {v2: stamped1(0, 8, undefined)}),
        ]),

        del9: stamped1(0, 9, [
          stamped1(0, 9, {
            t1: stamped1(0, 9, {
              r2: stamped1(0, 9, {c2: stamped1(0, 9, undefined)}),
            }),
          }),
          stamped1(0, 5, {}),
        ]),

        del10: stamped1(0, 10, [
          stamped1(0, 10, {
            t2: stamped1(0, 10, {
              r2: stamped1(0, 10, {c2: stamped1(0, 10, undefined)}),
            }),
          }),
          stamped1(0, 5, {}),
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
      expect(store1.getMergeableContent()).toEqual(
        stamped2(0, 3, [
          stamped2(0, 2, {
            t1: stamped2(0, 2, {
              r1: stamped2(0, 2, {c1: stamped2(0, 2, 2)}),
            }),
          }),
          stamped2(0, 3, {v1: stamped2(0, 3, 2)}),
        ]),
      );

      expect(store2.getContent()).toEqual(store1.getContent());
      expect(store2.getMergeableContent()).toEqual(
        store1.getMergeableContent(),
      );

      store1
        .setCell('t1', 'r1', 'c1', (cell) => (cell as number) + 1)
        .setValue('v1', (value) => (value as number) + 1);
      store2.merge(store1);

      expect(store1.getContent()).toEqual([{t1: {r1: {c1: 3}}}, {v1: 3}]);
      expect(store1.getMergeableContent()).toEqual(
        stamped1(0, 5, [
          stamped1(0, 4, {
            t1: stamped1(0, 4, {
              r1: stamped1(0, 4, {c1: stamped1(0, 4, 3)}),
            }),
          }),
          stamped1(0, 5, {v1: stamped1(0, 5, 3)}),
        ]),
      );

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

      expect(store1.getMergeableContent()).toEqual(
        stamped1(2, 0, [
          stamped1(2, 0, {
            t1: stamped1(2, 0, {
              r1: stamped1(2, 0, {c1: stamped1(2, 0, undefined)}),
            }),
          }),
          nullStamped({}),
        ]),
      );
      expect(store2.getMergeableContent()).toEqual(
        stamped2(1, 0, [
          stamped2(1, 0, {
            t1: stamped2(1, 0, {
              r1: stamped2(1, 0, {c2: stamped2(1, 0, 2)}),
            }),
          }),
          nullStamped({}),
        ]),
      );

      store1.merge(store2);

      expect(store1.getContent()).toEqual([{t1: {r1: {c2: 2}}}, {}]);
      expect(store2.getContent()).toEqual([{t1: {r1: {c2: 2}}}, {}]);
    });
  });
});

describe('Hashing', () => {
  let store: MergeableStore;
  beforeEach(() => {
    store = createMergeableStore('s1');
    store.setContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c1: 3}}, t2: {r1: {c1: 4}}},
      {v1: 5, v2: 6},
    ]);
  });

  test('getContentHash', () => {
    expect(store.getContentHash()).toEqual(0);
  });

  test('getTablesHash', () => {
    expect(store.getTablesHash()).toEqual(0);
    store.setCell('t1', 'r1', 'c1', 2);
    expect(store.getTablesHash()).toEqual(0);
    store.setCell('t1', 'r1', 'c2', 3);
    expect(store.getTablesHash()).toEqual(0);
  });

  test('getTableHash', () => {
    expect(store.getTableHash('t0')).toEqual(0);
    expect(store.getTableHash('t1')).toEqual(0);
    expect(store.getTableHash('t2')).toEqual(0);
    store.setCell('t1', 'r1', 'c1', 2);
    expect(store.getTableHash('t1')).toEqual(0);
    store.setCell('t1', 'r1', 'c2', 3);
    expect(store.getTableHash('t1')).toEqual(0);
  });

  test('getRowHash', () => {
    expect(store.getRowHash('t0', 'r0')).toEqual(0);
    expect(store.getRowHash('t1', 'r0')).toEqual(0);
    expect(store.getRowHash('t1', 'r1')).toEqual(0);
    store.setCell('t1', 'r1', 'c1', 2);
    expect(store.getRowHash('t1', 'r1')).toEqual(0);
    store.setCell('t1', 'r1', 'c2', 3);
    expect(store.getRowHash('t1', 'r1')).toEqual(0);
  });

  test('getCellHash', () => {
    expect(store.getCellHash('t0', 'r1', 'c1')).toEqual(0);
    expect(store.getCellHash('t1', 'r0', 'c1')).toEqual(0);
    expect(store.getCellHash('t1', 'r1', 'c0')).toEqual(0);
    expect(store.getCellHash('t1', 'r1', 'c1')).toEqual(3549033955);
    expect(store.getCellHash('t1', 'r1', 'c2')).toEqual(3565811574);
    expect(store.getCellHash('t1', 'r2', 'c1')).toEqual(3582589193);
    expect(store.getCellHash('t2', 'r1', 'c1')).toEqual(3599366812);
    store.setCell('t1', 'r1', 'c1', 2);
    expect(store.getCellHash('t1', 'r1', 'c1')).toEqual(982820445);
    expect(store.getCellHash('t1', 'r1', 'c2')).toEqual(3565811574);
    store.setCell('t1', 'r1', 'c2', 3);
    expect(store.getCellHash('t1', 'r1', 'c1')).toEqual(982820445);
    expect(store.getCellHash('t1', 'r1', 'c2')).toEqual(1207380763);
  });

  test('getValuesHash', () => {
    expect(store.getValuesHash()).toEqual(0);
    store.setValue('v1', 6);
    expect(store.getValuesHash()).toEqual(0);
    store.setValue('v2', 7);
    expect(store.getValuesHash()).toEqual(0);
  });

  test('getValueHash', () => {
    expect(store.getValueHash('v0')).toEqual(0);
    expect(store.getValueHash('v1')).toEqual(3616144431);
    expect(store.getValueHash('v2')).toEqual(3632922050);
    store.setValue('v1', 6);
    expect(store.getValueHash('v1')).toEqual(915709969);
    expect(store.getValueHash('v2')).toEqual(3632922050);
    store.setValue('v2', 7);
    expect(store.getValueHash('v1')).toEqual(915709969);
    expect(store.getValueHash('v2')).toEqual(1274491239);
  });
});
