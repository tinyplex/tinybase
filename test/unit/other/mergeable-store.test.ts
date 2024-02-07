import {
  MergeableContent,
  MergeableStore,
  Stamped,
  createCustomPersister,
  createMergeableStore,
  createStore,
} from 'tinybase/debug';

const MASK6 = 63;
const SHIFT36 = 2 ** 36;
const SHIFT30 = 2 ** 30;
const SHIFT24 = 2 ** 24;
const SHIFT18 = 2 ** 18;
const SHIFT12 = 2 ** 12;
const SHIFT6 = 2 ** 6;

const toB64 = (num: number): string => String.fromCharCode(48 + (num & MASK6));

const encodeHlc = (
  logicalTime42: number,
  counter24: number,
  clientHash30: number,
): string =>
  toB64(logicalTime42 / SHIFT36) +
  toB64(logicalTime42 / SHIFT30) +
  toB64(logicalTime42 / SHIFT24) +
  toB64(logicalTime42 / SHIFT18) +
  toB64(logicalTime42 / SHIFT12) +
  toB64(logicalTime42 / SHIFT6) +
  toB64(logicalTime42) +
  toB64(counter24 / SHIFT18) +
  toB64(counter24 / SHIFT12) +
  toB64(counter24 / SHIFT6) +
  toB64(counter24) +
  toB64(clientHash30 / SHIFT24) +
  toB64(clientHash30 / SHIFT18) +
  toB64(clientHash30 / SHIFT12) +
  toB64(clientHash30 / SHIFT6) +
  toB64(clientHash30);

const START_TIME = new Date(2024, 1, 1);
const STORE_ID_HASHES: {[id: string]: number} = {s1: 5861543, s2: 5861540};

const stamp = (counter: number, storeId: string = 's1', time = 0) =>
  encodeHlc(START_TIME.valueOf() + time, counter, STORE_ID_HASHES[storeId]);

const stamped = (
  counter: number,
  thing: any,
  storeId: string = 's1',
  time = 0,
) => [stamp(counter, storeId, time), thing];

const nullStamped = <Thing>(thing: Thing): Stamped<Thing> => ['', thing];

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
    expect(store.setTransactionChanges([{}, {}])).toEqual(store);
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
    expect(store.delListener(stamp(0))).toEqual(store);
  });
  test('Other', () => {
    expect(store.callListener(stamp(0))).toEqual(store);
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

    mergeableContent[0] = stamp(1);
    expect(store.getMergeableContent()[0]).toEqual(stamp(0));

    mergeableContent[1][1][0] = stamp(1);
    expect(store.getMergeableContent()[1][1][0]).toEqual(stamp(0));

    mergeableContent[1][0][1].t1[0] = stamp(1);
    expect(store.getMergeableContent()[1][0][1].t1[0]).toEqual(stamp(0));

    mergeableContent[1][0][1].t1[1].r1[0] = stamp(1);
    expect(store.getMergeableContent()[1][0][1].t1[1].r1[0]).toEqual(stamp(0));

    mergeableContent[1][0][1].t1[1].r1[1].c1[0] = stamp(1);
    expect(store.getMergeableContent()[1][0][1].t1[1].r1[1].c1[0]).toEqual(
      stamp(0),
    );

    mergeableContent[1][1][1].v1[0] = stamp(1);
    expect(store.getMergeableContent()[1][1][1].v1[0]).toEqual(stamp(0));
  });

  test('Set together', () => {
    store.setContent([
      {t1: {r1: {c1: 0, c2: 1}, r2: {c1: 2}}, t2: {r1: {c1: 3}}},
      {v1: 4, v2: 5},
    ]);
    expect(store.getMergeableContent()).toEqual(
      stamped(0, [
        stamped(0, {
          t1: stamped(0, {
            r1: stamped(0, {c1: stamped(0, 0), c2: stamped(0, 1)}),
            r2: stamped(0, {c1: stamped(0, 2)}),
          }),
          t2: stamped(0, {r1: stamped(0, {c1: stamped(0, 3)})}),
        }),
        stamped(0, {v1: stamped(0, 4), v2: stamped(0, 5)}),
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
      stamped(5, [
        stamped(3, {
          t1: stamped(2, {
            r1: stamped(1, {c1: stamped(0, 0), c2: stamped(1, 1)}),
            r2: stamped(2, {c1: stamped(2, 2)}),
          }),
          t2: stamped(3, {r1: stamped(3, {c1: stamped(3, 3)})}),
        }),
        stamped(5, {v1: stamped(4, 4), v2: stamped(5, 5)}),
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
      stamped(6, [
        stamped(4, {
          t1: stamped(3, {
            r1: stamped(2, {
              c1: stamped(1, 1),
              c2: stamped(2, null),
            }),
            r2: stamped(3, null),
          }),
          t2: stamped(4, null),
        }),
        stamped(6, {v1: stamped(5, 5), v2: stamped(6, null)}),
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
    expect(store1.applyMergeableContent(noChanges)).toEqual(store1);
    expect(store1.getContent()).toEqual([{}, {}]);

    expect(store2.getContent()).toEqual([{}, {}]);
    const mergeableContent2 = store2.getMergeableContent();
    expect(mergeableContent2).toEqual(noChanges);
    expect(store2.applyMergeableContent(noChanges)).toEqual(store2);
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
        stamped(0, [
          stamped(0, {
            t1: stamped(0, {
              r1: stamped(0, {
                c1: stamped(0, 0),
                c2: stamped(0, 0),
              }),
              r2: stamped(0, {c1: stamped(0, 0)}),
            }),
            t2: stamped(0, {r1: stamped(0, {c1: stamped(0, 0)})}),
          }),
          nullStamped({}),
        ]),
      );

      store2.applyMergeableContent(store1.getMergeableContent());
      expect(store2.getContent()).toEqual([
        {t1: {r1: {c1: 0, c2: 0}, r2: {c1: 0}}, t2: {r1: {c1: 0}}},
        {},
      ]);
      expect(store2.getMergeableContent()).toEqual(
        stamped(0, [
          stamped(0, {
            t1: stamped(0, {
              r1: stamped(0, {
                c1: stamped(0, 0),
                c2: stamped(0, 0),
              }),
              r2: stamped(0, {c1: stamped(0, 0)}),
            }),
            t2: stamped(0, {r1: stamped(0, {c1: stamped(0, 0)})}),
          }),
          nullStamped({}),
        ]),
      );
    });

    test('setCell', () => {
      store1.setCell('t1', 'r1', 'c1', 1);
      expect(store1.getMergeableContent()).toEqual(
        stamped(1, [
          stamped(1, {
            t1: stamped(1, {
              r1: stamped(1, {
                c1: stamped(1, 1),
                c2: stamped(0, 0),
              }),
              r2: stamped(0, {c1: stamped(0, 0)}),
            }),
            t2: stamped(0, {r1: stamped(0, {c1: stamped(0, 0)})}),
          }),
          nullStamped({}),
        ]),
      );

      store2.applyMergeableContent(store1.getMergeableContent());
      expect(store2.getContent()).toEqual([
        {t1: {r1: {c1: 1, c2: 0}, r2: {c1: 0}}, t2: {r1: {c1: 0}}},
        {},
      ]);
      expect(store2.getMergeableContent()).toEqual(
        stamped(1, [
          stamped(1, {
            t1: stamped(1, {
              r1: stamped(1, {
                c1: stamped(1, 1),
                c2: stamped(0, 0),
              }),
              r2: stamped(0, {c1: stamped(0, 0)}),
            }),
            t2: stamped(0, {r1: stamped(0, {c1: stamped(0, 0)})}),
          }),
          nullStamped({}),
        ]),
      );
    });

    test('delCell', () => {
      store1.delCell('t1', 'r1', 'c2');
      expect(store1.getMergeableContent()).toEqual(
        stamped(2, [
          stamped(2, {
            t1: stamped(2, {
              r1: stamped(2, {
                c1: stamped(1, 1),
                c2: stamped(2, null),
              }),
              r2: stamped(0, {c1: stamped(0, 0)}),
            }),
            t2: stamped(0, {r1: stamped(0, {c1: stamped(0, 0)})}),
          }),
          nullStamped({}),
        ]),
      );

      store2.applyMergeableContent(store1.getMergeableContent());
      expect(store2.getContent()).toEqual([
        {t1: {r1: {c1: 1}, r2: {c1: 0}}, t2: {r1: {c1: 0}}},
        {},
      ]);
      expect(store2.getMergeableContent()).toEqual(
        stamped(2, [
          stamped(2, {
            t1: stamped(2, {
              r1: stamped(2, {
                c1: stamped(1, 1),
                c2: stamped(2, null),
              }),
              r2: stamped(0, {c1: stamped(0, 0)}),
            }),
            t2: stamped(0, {r1: stamped(0, {c1: stamped(0, 0)})}),
          }),
          nullStamped({}),
        ]),
      );
    });

    test('delRow', () => {
      store1.delRow('t1', 'r2');
      expect(store1.getMergeableContent()).toEqual(
        stamped(3, [
          stamped(3, {
            t1: stamped(3, {
              r1: stamped(2, {
                c1: stamped(1, 1),
                c2: stamped(2, null),
              }),
              r2: stamped(3, null),
            }),
            t2: stamped(0, {r1: stamped(0, {c1: stamped(0, 0)})}),
          }),
          nullStamped({}),
        ]),
      );

      store2.applyMergeableContent(store1.getMergeableContent());
      expect(store2.getContent()).toEqual([
        {t1: {r1: {c1: 1}}, t2: {r1: {c1: 0}}},
        {},
      ]);
      expect(store2.getMergeableContent()).toEqual(
        stamped(3, [
          stamped(3, {
            t1: stamped(3, {
              r1: stamped(2, {
                c1: stamped(1, 1),
                c2: stamped(2, null),
              }),
              r2: stamped(3, null),
            }),
            t2: stamped(0, {r1: stamped(0, {c1: stamped(0, 0)})}),
          }),
          nullStamped({}),
        ]),
      );
    });

    test('delTable', () => {
      store1.delTable('t2');
      expect(store1.getMergeableContent()).toEqual(
        stamped(4, [
          stamped(4, {
            t1: stamped(3, {
              r1: stamped(2, {
                c1: stamped(1, 1),
                c2: stamped(2, null),
              }),
              r2: stamped(3, null),
            }),
            t2: stamped(4, null),
          }),
          nullStamped({}),
        ]),
      );

      store2.applyMergeableContent(store1.getMergeableContent());
      expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {}]);
      expect(store2.getMergeableContent()).toEqual(
        stamped(4, [
          stamped(4, {
            t1: stamped(3, {
              r1: stamped(2, {
                c1: stamped(1, 1),
                c2: stamped(2, null),
              }),
              r2: stamped(3, null),
            }),
            t2: stamped(4, null),
          }),
          nullStamped({}),
        ]),
      );
    });

    test('setCell 2', () => {
      store1.setCell('t2', 'r2', 'c2', 2);
      expect(store1.getMergeableContent()).toEqual(
        stamped(5, [
          stamped(5, {
            t1: stamped(3, {
              r1: stamped(2, {
                c1: stamped(1, 1),
                c2: stamped(2, null),
              }),
              r2: stamped(3, null),
            }),
            t2: stamped(5, {r2: stamped(5, {c2: stamped(5, 2)})}),
          }),
          nullStamped({}),
        ]),
      );

      store2.applyMergeableContent(store1.getMergeableContent());
      expect(store2.getContent()).toEqual([
        {t1: {r1: {c1: 1}}, t2: {r2: {c2: 2}}},
        {},
      ]);
      expect(store2.getMergeableContent()).toEqual(
        stamped(5, [
          stamped(5, {
            t1: stamped(3, {
              r1: stamped(2, {
                c1: stamped(1, 1),
                c2: stamped(2, null),
              }),
              r2: stamped(3, null),
            }),
            t2: stamped(5, {r2: stamped(5, {c2: stamped(5, 2)})}),
          }),
          nullStamped({}),
        ]),
      );
    });

    test('delTables', () => {
      store1.delTables();
      expect(store1.getMergeableContent()).toEqual(
        stamped(6, [
          stamped(6, {t1: stamped(6, null), t2: stamped(6, null)}),
          nullStamped({}),
        ]),
      );

      store2.applyMergeableContent(store1.getMergeableContent());
      expect(store2.getContent()).toEqual([{}, {}]);
      expect(store2.getMergeableContent()).toEqual(
        stamped(6, [
          stamped(6, {t1: stamped(6, null), t2: stamped(6, null)}),
          nullStamped({}),
        ]),
      );
    });

    test('setValues', () => {
      store1.setValues({v1: 0, v2: 0});
      expect(store1.getMergeableContent()).toEqual(
        stamped(7, [
          stamped(6, {t1: stamped(6, null), t2: stamped(6, null)}),
          stamped(7, {v1: stamped(7, 0), v2: stamped(7, 0)}),
        ]),
      );

      store2.applyMergeableContent(store1.getMergeableContent());
      expect(store2.getContent()).toEqual([{}, {v1: 0, v2: 0}]);
      expect(store2.getMergeableContent()).toEqual(
        stamped(7, [
          stamped(6, {t1: stamped(6, null), t2: stamped(6, null)}),
          stamped(7, {v1: stamped(7, 0), v2: stamped(7, 0)}),
        ]),
      );
    });

    test('setValue', () => {
      store1.setValue('v1', 1);
      expect(store1.getMergeableContent()).toEqual(
        stamped(8, [
          stamped(6, {t1: stamped(6, null), t2: stamped(6, null)}),
          stamped(8, {v1: stamped(8, 1), v2: stamped(7, 0)}),
        ]),
      );

      store2.applyMergeableContent(store1.getMergeableContent());
      expect(store2.getContent()).toEqual([{}, {v1: 1, v2: 0}]);
      expect(store2.getMergeableContent()).toEqual(
        stamped(8, [
          stamped(6, {t1: stamped(6, null), t2: stamped(6, null)}),
          stamped(8, {v1: stamped(8, 1), v2: stamped(7, 0)}),
        ]),
      );
    });

    test('delValue', () => {
      store1.delValue('v2');
      expect(store1.getMergeableContent()).toEqual(
        stamped(9, [
          stamped(6, {t1: stamped(6, null), t2: stamped(6, null)}),
          stamped(9, {v1: stamped(8, 1), v2: stamped(9, null)}),
        ]),
      );

      store2.applyMergeableContent(store1.getMergeableContent());
      expect(store2.getContent()).toEqual([{}, {v1: 1}]);
      expect(store2.getMergeableContent()).toEqual(
        stamped(9, [
          stamped(6, {t1: stamped(6, null), t2: stamped(6, null)}),
          stamped(9, {v1: stamped(8, 1), v2: stamped(9, null)}),
        ]),
      );
    });

    test('delValues', () => {
      store1.delValues();
      expect(store1.getMergeableContent()).toEqual(
        stamped(10, [
          stamped(6, {t1: stamped(6, null), t2: stamped(6, null)}),
          stamped(10, {
            v1: stamped(10, null),
            v2: stamped(9, null),
          }),
        ]),
      );

      store2.applyMergeableContent(store1.getMergeableContent());
      expect(store2.getContent()).toEqual([{}, {}]);
      expect(store2.getMergeableContent()).toEqual(
        stamped(10, [
          stamped(6, {t1: stamped(6, null), t2: stamped(6, null)}),
          stamped(10, {
            v1: stamped(10, null),
            v2: stamped(9, null),
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
        stamped(
          0,
          [
            stamped(
              0,
              {
                t1: stamped(
                  0,
                  {r1: stamped(0, {c1: stamped(0, 0, 's1')}, 's1')},
                  's1',
                ),
              },
              's1',
            ),
            nullStamped({}),
          ],
          's1',
        ),
      );

      jest.advanceTimersByTime(1);

      store2.setValues({v1: 0});
      const mergeableContent2 = store2.getMergeableContent();
      expect(mergeableContent2).toEqual(
        stamped(
          0,
          [nullStamped({}), stamped(0, {v1: stamped(0, 0, 's2', 1)}, 's2', 1)],
          's2',
          1,
        ),
      );

      store1.merge(store2);

      expect(store1.getContent()).toEqual([{t1: {r1: {c1: 0}}}, {v1: 0}]);
      expect(store1.getMergeableContent()).toEqual(
        stamped(
          0,
          [
            stamped(
              0,
              {
                t1: stamped(
                  0,
                  {r1: stamped(0, {c1: stamped(0, 0, 's1')}, 's1')},
                  's1',
                ),
              },
              's1',
            ),
            stamped(0, {v1: stamped(0, 0, 's2', 1)}, 's2', 1),
          ],
          's2',
          1,
        ),
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
        stamped(
          1,
          [
            stamped(
              0,
              {
                t1: stamped(
                  0,
                  {r1: stamped(0, {c1: stamped(0, 1, 's1')}, 's1')},
                  's1',
                ),
              },
              's1',
            ),
            stamped(1, {v1: stamped(1, 1, 's1')}, 's1'),
          ],
          's1',
        ),
      );

      jest.advanceTimersByTime(1);

      store2
        .setTables({t1: {r1: {c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}})
        .setValues({v2: 2});
      const mergeableContent2 = store2.getMergeableContent();
      expect(mergeableContent2).toEqual(
        stamped(
          1,
          [
            stamped(
              0,
              {
                t1: stamped(
                  0,
                  {
                    r1: stamped(0, {c2: stamped(0, 2, 's2', 1)}, 's2', 1),
                    r2: stamped(0, {c2: stamped(0, 2, 's2', 1)}, 's2', 1),
                  },
                  's2',
                  1,
                ),
                t2: stamped(
                  0,
                  {r2: stamped(0, {c2: stamped(0, 2, 's2', 1)}, 's2', 1)},
                  's2',
                  1,
                ),
              },
              's2',
              1,
            ),
            stamped(1, {v2: stamped(1, 2, 's2', 1)}, 's2', 1),
          ],
          's2',
          1,
        ),
      );

      store1.merge(store2);

      expect(store1.getContent()).toEqual([
        {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
        {v1: 1, v2: 2},
      ]);
      expect(store1.getMergeableContent()).toEqual(
        stamped(
          1,
          [
            stamped(
              0,
              {
                t1: stamped(
                  0,
                  {
                    r1: stamped(
                      0,
                      {c1: stamped(0, 1, 's1'), c2: stamped(0, 2, 's2', 1)},
                      's2',
                      1,
                    ),
                    r2: stamped(0, {c2: stamped(0, 2, 's2', 1)}, 's2', 1),
                  },
                  's2',
                  1,
                ),
                t2: stamped(
                  0,
                  {r2: stamped(0, {c2: stamped(0, 2, 's2', 1)}, 's2', 1)},
                  's2',
                  1,
                ),
              },
              's2',
              1,
            ),
            stamped(
              1,
              {v1: stamped(1, 1, 's1'), v2: stamped(1, 2, 's2', 1)},
              's2',
              1,
            ),
          ],
          's2',
          1,
        ),
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
        stamped(
          1,
          [
            stamped(
              0,
              {
                t1: stamped(
                  0,
                  {r1: stamped(0, {c1: stamped(0, 1, 's1')}, 's1')},
                  's1',
                ),
              },
              's1',
            ),
            stamped(
              1,
              {v0: stamped(1, 0, 's1'), v1: stamped(1, 1, 's1')},
              's1',
            ),
          ],
          's1',
        ),
      );

      jest.advanceTimersByTime(1);

      store2.setTables({t1: {r1: {c1: 2}}}).setValues({v1: 2});
      const mergeableContent2 = store2.getMergeableContent();
      expect(mergeableContent2).toEqual(
        stamped(
          1,
          [
            stamped(
              0,
              {
                t1: stamped(
                  0,
                  {r1: stamped(0, {c1: stamped(0, 2, 's2', 1)}, 's2', 1)},
                  's2',
                  1,
                ),
              },
              's2',
              1,
            ),
            stamped(1, {v1: stamped(1, 2, 's2', 1)}, 's2', 1),
          ],
          's2',
          1,
        ),
      );

      store1.merge(store2);

      expect(store1.getContent()).toEqual([
        {t1: {r1: {c1: 2}}},
        {v0: 0, v1: 2},
      ]);
      expect(store1.getMergeableContent()).toEqual(
        stamped(
          1,
          [
            stamped(
              0,
              {
                t1: stamped(
                  0,
                  {r1: stamped(0, {c1: stamped(0, 2, 's2', 1)}, 's2', 1)},
                  's2',
                  1,
                ),
              },
              's2',
              1,
            ),
            stamped(
              1,
              {v0: stamped(1, 0, 's1'), v1: stamped(1, 2, 's2', 1)},
              's2',
              1,
            ),
          ],
          's2',
          1,
        ),
      );

      expect(store2.getContent()).toEqual(store1.getContent());
      expect(store2.getMergeableContent()).toEqual(
        store1.getMergeableContent(),
      );
    });

    describe('Commutativity & idempotence', () => {
      const OPERATIONS = {
        set1: stamped(1, [
          stamped(1, {t1: stamped(1, {r1: stamped(1, {c1: stamped(1, 1)})})}),
          stamped(1, {v1: stamped(1, 1)}),
        ]),

        set2: stamped(2, [
          stamped(2, {t2: stamped(2, {r2: stamped(2, {c2: stamped(2, 2)})})}),
          stamped(2, {v2: stamped(2, 2)}),
        ]),

        set3: stamped(3, [
          stamped(3, {t1: stamped(3, {r2: stamped(3, {c2: stamped(3, 1)})})}),
          stamped(2, {}),
        ]),

        set4: stamped(4, [
          stamped(4, {t1: stamped(4, {r1: stamped(4, {c2: stamped(4, 1)})})}),
          stamped(2, {}),
        ]),

        upd5: stamped(5, [
          stamped(5, {t1: stamped(5, {r1: stamped(5, {c1: stamped(5, 2)})})}),
          stamped(5, {v1: stamped(5, 2)}),
        ]),

        upd6: stamped(6, [
          stamped(6, {t1: stamped(6, {r2: stamped(6, {c2: stamped(6, 2)})})}),
          stamped(5, {}),
        ]),

        upd7: stamped(7, [
          stamped(7, {t1: stamped(7, {r1: stamped(7, {c2: stamped(7, 2)})})}),
          stamped(5, {}),
        ]),

        del8: stamped(8, [
          stamped(8, {
            t1: stamped(8, {r1: stamped(8, {c2: stamped(8, null)})}),
          }),
          stamped(8, {v2: stamped(8, null)}),
        ]),

        del9: stamped(9, [
          stamped(9, {t1: stamped(9, {r2: stamped(9, null)})}),
          stamped(5, {}),
        ]),

        del10: stamped(10, [
          stamped(10, {t2: stamped(10, null)}),
          stamped(5, {}),
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
          store1.applyMergeableContent(OPERATIONS[id]),
        );
        expect(store1.getContent()).toEqual([{t1: {r1: {c1: 2}}}, {v1: 2}]);
      });

      test.each(
        permute(['set1', 'set2', 'upd5', 'upd6', 'del10']).map((p) => [p]),
      )('Some, %s', (order) => {
        order.forEach((id: string) =>
          store1.applyMergeableContent(OPERATIONS[id]),
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
            store1.applyMergeableContent(OPERATIONS[id]),
          );
          expect(store1.getContent()).toEqual([{t1: {r2: {c2: 1}}}, {}]);
        },
      );
    });

    test('Causality', () => {
      store1.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
      store2.applyMergeableContent(store1.getMergeableContent());

      store2
        .setCell('t1', 'r1', 'c1', (cell) => (cell as number) + 1)
        .setValue('v1', (value) => (value as number) + 1);
      store1.merge(store2);

      expect(store1.getContent()).toEqual([{t1: {r1: {c1: 2}}}, {v1: 2}]);
      expect(store1.getMergeableContent()).toEqual(
        stamped(
          3,
          [
            stamped(
              2,
              {
                t1: stamped(
                  2,
                  {r1: stamped(2, {c1: stamped(2, 2, 's2')}, 's2')},
                  's2',
                ),
              },
              's2',
            ),
            stamped(3, {v1: stamped(3, 2, 's2')}, 's2'),
          ],
          's2',
        ),
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
        stamped(
          5,
          [
            stamped(
              4,
              {
                t1: stamped(
                  4,
                  {r1: stamped(4, {c1: stamped(4, 3, 's1')}, 's1')},
                  's1',
                ),
              },
              's1',
            ),
            stamped(5, {v1: stamped(5, 3, 's1')}, 's1'),
          ],
          's1',
        ),
      );

      expect(store2.getContent()).toEqual(store1.getContent());
      expect(store2.getMergeableContent()).toEqual(
        store1.getMergeableContent(),
      );
    });
  });
});

describe('Persistence', () => {
  test('Not supported, MergeableStore', async () => {
    const store = createMergeableStore('s1');
    let persisted = '';
    const persister = createCustomPersister(
      store,
      async () => [{t1: {r1: {c1: 1}}}, {v1: 1}],
      async (getContent: () => any) => {
        persisted = JSON.stringify(getContent());
      },
      () => null,
      () => null,
    );
    await persister.load();
    await persister.save();
    persister.destroy();
    expect(persisted).toEqual('[{"t1":{"r1":{"c1":1}}},{"v1":1}]');
  });

  test('Supported, Store', async () => {
    const store = createStore();
    let persisted = '';
    const persister = createCustomPersister(
      store,
      async () => [{t1: {r1: {c1: 1}}}, {v1: 1}],
      async (getContent: () => any) => {
        persisted = JSON.stringify(getContent());
      },
      () => null,
      () => null,
      () => null,
      true,
    );
    await persister.load();
    await persister.save();
    persister.destroy();
    expect(persisted).toEqual('[{"t1":{"r1":{"c1":1}}},{"v1":1}]');
  });

  test('Supported, MergeableStore', async () => {
    const store = createMergeableStore('s1');
    let persisted = '';
    const persister = createCustomPersister(
      store,
      async () => [
        'HeS2L2000000FG2W',
        [
          [
            'HeS2L2000000FG2W',
            {
              t1: [
                'HeS2L2000000FG2W',
                {r1: ['HeS2L2000000FG2W', {c1: ['HeS2L2000000FG2W', 1]}]},
              ],
            },
          ],
          ['HeS2L2000000FG2W', {v1: ['HeS2L2000000FG2W', 1]}],
        ],
      ],
      async (getContent: () => any) => {
        persisted = JSON.stringify(getContent());
      },
      () => null,
      () => null,
      () => null,
      true,
    );
    await persister.load();
    await persister.save();
    persister.destroy();
    expect(persisted).toEqual(
      JSON.stringify([
        'HeS2L2000000FG2W',
        [
          [
            'HeS2L2000000FG2W',
            {
              t1: [
                'HeS2L2000000FG2W',
                {r1: ['HeS2L2000000FG2W', {c1: ['HeS2L2000000FG2W', 1]}]},
              ],
            },
          ],
          ['HeS2L2000000FG2W', {v1: ['HeS2L2000000FG2W', 1]}],
        ],
      ]),
    );
  });

  test('Supported, MergeableStore, loading from legacy', async () => {
    const store = createMergeableStore('s1');
    let persisted = '';
    const persister = createCustomPersister(
      store,
      async () => [{t1: {r1: {c1: 1}}}, {v1: 1}],
      async (getContent: () => any) => {
        persisted = JSON.stringify(getContent());
      },
      () => null,
      () => null,
      () => null,
      true,
    );
    await persister.load();
    await persister.save();
    persister.destroy();
    expect(persisted).toEqual(
      JSON.stringify([
        'HeS2L2000000FG2W',
        [
          [
            'HeS2L2000000FG2W',
            {
              t1: [
                'HeS2L2000000FG2W',
                {r1: ['HeS2L2000000FG2W', {c1: ['HeS2L2000000FG2W', 1]}]},
              ],
            },
          ],
          ['HeS2L2000000FG2W', {v1: ['HeS2L2000000FG2W', 1]}],
        ],
      ]),
    );
  });
});
