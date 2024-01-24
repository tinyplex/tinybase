import {
  MergeableContent,
  MergeableStore,
  Timestamped,
  createMergeableStore,
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

const timestamp = (counter: number, storeId: string = 's1') =>
  encodeHlc(START_TIME.valueOf(), counter, STORE_ID_HASHES[storeId]);

const timestamped = (counter: number, value: any, storeId: string = 's1') => [
  timestamp(counter, storeId),
  value,
];

const nullTimestamped = <Thing>(value: Thing): Timestamped<Thing> => [
  '',
  value,
];

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
    expect(store.delListener(timestamp(0))).toEqual(store);
  });
  test('Other', () => {
    expect(store.callListener(timestamp(0))).toEqual(store);
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
      nullTimestamped([nullTimestamped({}), nullTimestamped({})]),
    );
  });

  test('Immutability', () => {
    store.setContent([
      {t1: {r1: {c1: 0, c2: 1}, r2: {c1: 2}}, t2: {r1: {c1: 3}}},
      {v1: 4, v2: 5},
    ]);
    const mergeableContent = store.getMergeableContent();

    mergeableContent[0] = timestamp(1);
    expect(store.getMergeableContent()[0]).toEqual(timestamp(0));

    mergeableContent[1][1][0] = timestamp(1);
    expect(store.getMergeableContent()[1][1][0]).toEqual(timestamp(0));

    mergeableContent[1][0][1].t1[0] = timestamp(1);
    expect(store.getMergeableContent()[1][0][1].t1[0]).toEqual(timestamp(0));

    mergeableContent[1][0][1].t1[1].r1[0] = timestamp(1);
    expect(store.getMergeableContent()[1][0][1].t1[1].r1[0]).toEqual(
      timestamp(0),
    );

    mergeableContent[1][0][1].t1[1].r1[1].c1[0] = timestamp(1);
    expect(store.getMergeableContent()[1][0][1].t1[1].r1[1].c1[0]).toEqual(
      timestamp(0),
    );

    mergeableContent[1][1][1].v1[0] = timestamp(1);
    expect(store.getMergeableContent()[1][1][1].v1[0]).toEqual(timestamp(0));
  });

  test('Set together', () => {
    store.setContent([
      {t1: {r1: {c1: 0, c2: 1}, r2: {c1: 2}}, t2: {r1: {c1: 3}}},
      {v1: 4, v2: 5},
    ]);
    expect(store.getMergeableContent()).toEqual(
      timestamped(0, [
        timestamped(0, {
          t1: timestamped(0, {
            r1: timestamped(0, {c1: timestamped(0, 0), c2: timestamped(0, 1)}),
            r2: timestamped(0, {c1: timestamped(0, 2)}),
          }),
          t2: timestamped(0, {r1: timestamped(0, {c1: timestamped(0, 3)})}),
        }),
        timestamped(0, {v1: timestamped(0, 4), v2: timestamped(0, 5)}),
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
      timestamped(5, [
        timestamped(3, {
          t1: timestamped(2, {
            r1: timestamped(1, {c1: timestamped(0, 0), c2: timestamped(1, 1)}),
            r2: timestamped(2, {c1: timestamped(2, 2)}),
          }),
          t2: timestamped(3, {r1: timestamped(3, {c1: timestamped(3, 3)})}),
        }),
        timestamped(5, {v1: timestamped(4, 4), v2: timestamped(5, 5)}),
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
      timestamped(6, [
        timestamped(4, {
          t1: timestamped(3, {
            r1: timestamped(2, {
              c1: timestamped(1, 1),
              c2: timestamped(2, null),
            }),
            r2: timestamped(3, null),
          }),
          t2: timestamped(4, null),
        }),
        timestamped(6, {v1: timestamped(5, 5), v2: timestamped(6, null)}),
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
    const noChanges: MergeableContent = nullTimestamped([
      nullTimestamped({}),
      nullTimestamped({}),
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
        timestamped(0, [
          timestamped(0, {
            t1: timestamped(0, {
              r1: timestamped(0, {
                c1: timestamped(0, 0),
                c2: timestamped(0, 0),
              }),
              r2: timestamped(0, {c1: timestamped(0, 0)}),
            }),
            t2: timestamped(0, {r1: timestamped(0, {c1: timestamped(0, 0)})}),
          }),
          nullTimestamped({}),
        ]),
      );

      store2.applyMergeableContent(store1.getMergeableContent());
      expect(store2.getContent()).toEqual([
        {t1: {r1: {c1: 0, c2: 0}, r2: {c1: 0}}, t2: {r1: {c1: 0}}},
        {},
      ]);
      expect(store2.getMergeableContent()).toEqual(
        timestamped(0, [
          timestamped(0, {
            t1: timestamped(0, {
              r1: timestamped(0, {
                c1: timestamped(0, 0),
                c2: timestamped(0, 0),
              }),
              r2: timestamped(0, {c1: timestamped(0, 0)}),
            }),
            t2: timestamped(0, {r1: timestamped(0, {c1: timestamped(0, 0)})}),
          }),
          nullTimestamped({}),
        ]),
      );
    });

    test('setCell', () => {
      store1.setCell('t1', 'r1', 'c1', 1);
      expect(store1.getMergeableContent()).toEqual(
        timestamped(1, [
          timestamped(1, {
            t1: timestamped(1, {
              r1: timestamped(1, {
                c1: timestamped(1, 1),
                c2: timestamped(0, 0),
              }),
              r2: timestamped(0, {c1: timestamped(0, 0)}),
            }),
            t2: timestamped(0, {r1: timestamped(0, {c1: timestamped(0, 0)})}),
          }),
          nullTimestamped({}),
        ]),
      );

      store2.applyMergeableContent(store1.getMergeableContent());
      expect(store2.getContent()).toEqual([
        {t1: {r1: {c1: 1, c2: 0}, r2: {c1: 0}}, t2: {r1: {c1: 0}}},
        {},
      ]);
      expect(store2.getMergeableContent()).toEqual(
        timestamped(1, [
          timestamped(1, {
            t1: timestamped(1, {
              r1: timestamped(1, {
                c1: timestamped(1, 1),
                c2: timestamped(0, 0),
              }),
              r2: timestamped(0, {c1: timestamped(0, 0)}),
            }),
            t2: timestamped(0, {r1: timestamped(0, {c1: timestamped(0, 0)})}),
          }),
          nullTimestamped({}),
        ]),
      );
    });

    test('delCell', () => {
      store1.delCell('t1', 'r1', 'c2');
      expect(store1.getMergeableContent()).toEqual(
        timestamped(2, [
          timestamped(2, {
            t1: timestamped(2, {
              r1: timestamped(2, {
                c1: timestamped(1, 1),
                c2: timestamped(2, null),
              }),
              r2: timestamped(0, {c1: timestamped(0, 0)}),
            }),
            t2: timestamped(0, {r1: timestamped(0, {c1: timestamped(0, 0)})}),
          }),
          nullTimestamped({}),
        ]),
      );

      store2.applyMergeableContent(store1.getMergeableContent());
      expect(store2.getContent()).toEqual([
        {t1: {r1: {c1: 1}, r2: {c1: 0}}, t2: {r1: {c1: 0}}},
        {},
      ]);
      expect(store2.getMergeableContent()).toEqual(
        timestamped(2, [
          timestamped(2, {
            t1: timestamped(2, {
              r1: timestamped(2, {
                c1: timestamped(1, 1),
                c2: timestamped(2, null),
              }),
              r2: timestamped(0, {c1: timestamped(0, 0)}),
            }),
            t2: timestamped(0, {r1: timestamped(0, {c1: timestamped(0, 0)})}),
          }),
          nullTimestamped({}),
        ]),
      );
    });

    test('delRow', () => {
      store1.delRow('t1', 'r2');
      expect(store1.getMergeableContent()).toEqual(
        timestamped(3, [
          timestamped(3, {
            t1: timestamped(3, {
              r1: timestamped(2, {
                c1: timestamped(1, 1),
                c2: timestamped(2, null),
              }),
              r2: timestamped(3, null),
            }),
            t2: timestamped(0, {r1: timestamped(0, {c1: timestamped(0, 0)})}),
          }),
          nullTimestamped({}),
        ]),
      );

      store2.applyMergeableContent(store1.getMergeableContent());
      expect(store2.getContent()).toEqual([
        {t1: {r1: {c1: 1}}, t2: {r1: {c1: 0}}},
        {},
      ]);
      expect(store2.getMergeableContent()).toEqual(
        timestamped(3, [
          timestamped(3, {
            t1: timestamped(3, {
              r1: timestamped(2, {
                c1: timestamped(1, 1),
                c2: timestamped(2, null),
              }),
              r2: timestamped(3, null),
            }),
            t2: timestamped(0, {r1: timestamped(0, {c1: timestamped(0, 0)})}),
          }),
          nullTimestamped({}),
        ]),
      );
    });

    test('delTable', () => {
      store1.delTable('t2');
      expect(store1.getMergeableContent()).toEqual(
        timestamped(4, [
          timestamped(4, {
            t1: timestamped(3, {
              r1: timestamped(2, {
                c1: timestamped(1, 1),
                c2: timestamped(2, null),
              }),
              r2: timestamped(3, null),
            }),
            t2: timestamped(4, null),
          }),
          nullTimestamped({}),
        ]),
      );

      store2.applyMergeableContent(store1.getMergeableContent());
      expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {}]);
      expect(store2.getMergeableContent()).toEqual(
        timestamped(4, [
          timestamped(4, {
            t1: timestamped(3, {
              r1: timestamped(2, {
                c1: timestamped(1, 1),
                c2: timestamped(2, null),
              }),
              r2: timestamped(3, null),
            }),
            t2: timestamped(4, null),
          }),
          nullTimestamped({}),
        ]),
      );
    });

    test('setCell 2', () => {
      store1.setCell('t2', 'r2', 'c2', 2);
      expect(store1.getMergeableContent()).toEqual(
        timestamped(5, [
          timestamped(5, {
            t1: timestamped(3, {
              r1: timestamped(2, {
                c1: timestamped(1, 1),
                c2: timestamped(2, null),
              }),
              r2: timestamped(3, null),
            }),
            t2: timestamped(5, {r2: timestamped(5, {c2: timestamped(5, 2)})}),
          }),
          nullTimestamped({}),
        ]),
      );

      store2.applyMergeableContent(store1.getMergeableContent());
      expect(store2.getContent()).toEqual([
        {t1: {r1: {c1: 1}}, t2: {r2: {c2: 2}}},
        {},
      ]);
      expect(store2.getMergeableContent()).toEqual(
        timestamped(5, [
          timestamped(5, {
            t1: timestamped(3, {
              r1: timestamped(2, {
                c1: timestamped(1, 1),
                c2: timestamped(2, null),
              }),
              r2: timestamped(3, null),
            }),
            t2: timestamped(5, {r2: timestamped(5, {c2: timestamped(5, 2)})}),
          }),
          nullTimestamped({}),
        ]),
      );
    });

    test('delTables', () => {
      store1.delTables();
      expect(store1.getMergeableContent()).toEqual(
        timestamped(6, [
          timestamped(6, {t1: timestamped(6, null), t2: timestamped(6, null)}),
          nullTimestamped({}),
        ]),
      );

      store2.applyMergeableContent(store1.getMergeableContent());
      expect(store2.getContent()).toEqual([{}, {}]);
      expect(store2.getMergeableContent()).toEqual(
        timestamped(6, [
          timestamped(6, {t1: timestamped(6, null), t2: timestamped(6, null)}),
          nullTimestamped({}),
        ]),
      );
    });

    test('setValues', () => {
      store1.setValues({v1: 0, v2: 0});
      expect(store1.getMergeableContent()).toEqual(
        timestamped(7, [
          timestamped(6, {t1: timestamped(6, null), t2: timestamped(6, null)}),
          timestamped(7, {v1: timestamped(7, 0), v2: timestamped(7, 0)}),
        ]),
      );

      store2.applyMergeableContent(store1.getMergeableContent());
      expect(store2.getContent()).toEqual([{}, {v1: 0, v2: 0}]);
      expect(store2.getMergeableContent()).toEqual(
        timestamped(7, [
          timestamped(6, {t1: timestamped(6, null), t2: timestamped(6, null)}),
          timestamped(7, {v1: timestamped(7, 0), v2: timestamped(7, 0)}),
        ]),
      );
    });

    test('setValue', () => {
      store1.setValue('v1', 1);
      expect(store1.getMergeableContent()).toEqual(
        timestamped(8, [
          timestamped(6, {t1: timestamped(6, null), t2: timestamped(6, null)}),
          timestamped(8, {v1: timestamped(8, 1), v2: timestamped(7, 0)}),
        ]),
      );

      store2.applyMergeableContent(store1.getMergeableContent());
      expect(store2.getContent()).toEqual([{}, {v1: 1, v2: 0}]);
      expect(store2.getMergeableContent()).toEqual(
        timestamped(8, [
          timestamped(6, {t1: timestamped(6, null), t2: timestamped(6, null)}),
          timestamped(8, {v1: timestamped(8, 1), v2: timestamped(7, 0)}),
        ]),
      );
    });

    test('delValue', () => {
      store1.delValue('v2');
      expect(store1.getMergeableContent()).toEqual(
        timestamped(9, [
          timestamped(6, {t1: timestamped(6, null), t2: timestamped(6, null)}),
          timestamped(9, {v1: timestamped(8, 1), v2: timestamped(9, null)}),
        ]),
      );

      store2.applyMergeableContent(store1.getMergeableContent());
      expect(store2.getContent()).toEqual([{}, {v1: 1}]);
      expect(store2.getMergeableContent()).toEqual(
        timestamped(9, [
          timestamped(6, {t1: timestamped(6, null), t2: timestamped(6, null)}),
          timestamped(9, {v1: timestamped(8, 1), v2: timestamped(9, null)}),
        ]),
      );
    });

    test('delValues', () => {
      store1.delValues();
      expect(store1.getMergeableContent()).toEqual(
        timestamped(10, [
          timestamped(6, {t1: timestamped(6, null), t2: timestamped(6, null)}),
          timestamped(10, {
            v1: timestamped(10, null),
            v2: timestamped(9, null),
          }),
        ]),
      );

      store2.applyMergeableContent(store1.getMergeableContent());
      expect(store2.getContent()).toEqual([{}, {}]);
      expect(store2.getMergeableContent()).toEqual(
        timestamped(10, [
          timestamped(6, {t1: timestamped(6, null), t2: timestamped(6, null)}),
          timestamped(10, {
            v1: timestamped(10, null),
            v2: timestamped(9, null),
          }),
        ]),
      );
    });
  });
});
