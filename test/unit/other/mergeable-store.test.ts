import {MergeableStore, createMergeableStore} from 'tinybase/debug';

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
const STORE_ID_HASHES: {[id: string]: number} = {s1: 5861543};

const timestamp = (counter: number, storeId: string = 's1') =>
  encodeHlc(START_TIME.valueOf(), counter, STORE_ID_HASHES[storeId]);

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
    expect(store.getMergeableContent()).toEqual([
      timestamp(0),
      [
        [timestamp(0), {}],
        [timestamp(0), {}],
      ],
    ]);
  });

  test('Set together, and immutability', () => {
    store.setContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c1: 3}}, t2: {r1: {c1: 4}}},
      {v1: 5},
    ]);
    const mergeableContent = store.getMergeableContent();
    expect(mergeableContent).toEqual([
      timestamp(1),
      [
        [
          timestamp(1),
          {
            t1: [
              timestamp(1),
              {
                r1: [
                  timestamp(1),
                  {c1: [timestamp(1), 1], c2: [timestamp(1), 2]},
                ],
                r2: [timestamp(1), {c1: [timestamp(1), 3]}],
              },
            ],
            t2: [timestamp(1), {r1: [timestamp(1), {c1: [timestamp(1), 4]}]}],
          },
        ],
        [timestamp(1), {v1: [timestamp(1), 5]}],
      ],
    ]);

    mergeableContent[0] = timestamp(0);
    expect(store.getMergeableContent()[0]).toEqual(timestamp(1));

    mergeableContent[1][1][0] = timestamp(0);
    expect(store.getMergeableContent()[1][1][0]).toEqual(timestamp(1));

    mergeableContent[1][0][1].t1[0] = timestamp(0);
    expect(store.getMergeableContent()[1][0][1].t1[0]).toEqual(timestamp(1));

    mergeableContent[1][0][1].t1[1].r1[0] = timestamp(0);
    expect(store.getMergeableContent()[1][0][1].t1[1].r1[0]).toEqual(
      timestamp(1),
    );

    mergeableContent[1][0][1].t1[1].r1[1].c1[0] = timestamp(0);
    expect(store.getMergeableContent()[1][0][1].t1[1].r1[1].c1[0]).toEqual(
      timestamp(1),
    );

    mergeableContent[1][1][1].v1[0] = timestamp(0);
    expect(store.getMergeableContent()[1][1][1].v1[0]).toEqual(timestamp(1));
  });

  test('Set in sequence', () => {
    store
      .setCell('t1', 'r1', 'c1', 1)
      .setCell('t1', 'r1', 'c2', 2)
      .setCell('t1', 'r2', 'c1', 3)
      .setCell('t2', 'r1', 'c1', 4)
      .setValue('v1', 5);
    expect(store.getMergeableContent()).toEqual([
      timestamp(5),
      [
        [
          timestamp(4),
          {
            t1: [
              timestamp(3),
              {
                r1: [
                  timestamp(2),
                  {c1: [timestamp(1), 1], c2: [timestamp(2), 2]},
                ],
                r2: [timestamp(3), {c1: [timestamp(3), 3]}],
              },
            ],
            t2: [timestamp(4), {r1: [timestamp(4), {c1: [timestamp(4), 4]}]}],
          },
        ],
        [timestamp(5), {v1: [timestamp(5), 5]}],
      ],
    ]);
  });

  test('Mutate', () => {
    store
      .setContent([
        {t1: {r1: {c1: 1, c2: 2}, r2: {c1: 3}}, t2: {r1: {c1: 4}}},
        {v1: 5, v2: 6},
      ])
      .setCell('t1', 'r1', 'c1', 2)
      .delCell('t1', 'r1', 'c2')
      .delRow('t1', 'r2')
      .delTable('t2')
      .setValue('v1', 6)
      .delValue('v2');
    expect(store.getMergeableContent()).toEqual([
      timestamp(7),
      [
        [
          timestamp(5),
          {
            t1: [
              timestamp(4),
              {
                r1: [
                  timestamp(3),
                  {c1: [timestamp(2), 2], c2: [timestamp(3), null]},
                ],
                r2: [timestamp(4), null],
              },
            ],
            t2: [timestamp(5), null],
          },
        ],
        [timestamp(7), {v1: [timestamp(6), 6], v2: [timestamp(7), null]}],
      ],
    ]);
  });
});

test('Merge', () => {
  const store = createMergeableStore('s1');
  expect(store.merge()).toEqual(store);
});
