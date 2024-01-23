import {MergeableStore, createMergeableStore} from 'tinybase/debug';

test('Create', () => {
  const store = createMergeableStore();
  expect(store.getJson()).toEqual(JSON.stringify([{}, {}]));
});

describe('Fluency of inherited methods', () => {
  let store: MergeableStore;
  beforeEach(() => {
    store = createMergeableStore();
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
    store = createMergeableStore();
  });

  test('Set together, and immutability', () => {
    store.setContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c1: 3}}, t2: {r1: {c1: 4}}},
      {v1: 5},
    ]);
    const mergeableContent = store.getMergeableContent();
    expect(mergeableContent).toEqual([
      '1',
      [
        [
          '1',
          {
            t1: [
              '1',
              {
                r1: ['1', {c1: ['1', 1], c2: ['1', 2]}],
                r2: ['1', {c1: ['1', 3]}],
              },
            ],
            t2: ['1', {r1: ['1', {c1: ['1', 4]}]}],
          },
        ],
        ['1', {v1: ['1', 5]}],
      ],
    ]);

    mergeableContent[0] = '0';
    expect(store.getMergeableContent()[0]).toEqual('1');

    mergeableContent[1][1][0] = '0';
    expect(store.getMergeableContent()[1][1][0]).toEqual('1');

    mergeableContent[1][0][1].t1[0] = '0';
    expect(store.getMergeableContent()[1][0][1].t1[0]).toEqual('1');

    mergeableContent[1][0][1].t1[1].r1[0] = '0';
    expect(store.getMergeableContent()[1][0][1].t1[1].r1[0]).toEqual('1');

    mergeableContent[1][0][1].t1[1].r1[1].c1[0] = '0';
    expect(store.getMergeableContent()[1][0][1].t1[1].r1[1].c1[0]).toEqual('1');

    mergeableContent[1][1][1].v1[0] = '0';
    expect(store.getMergeableContent()[1][1][1].v1[0]).toEqual('1');
  });

  test('Set in sequence', () => {
    store
      .setCell('t1', 'r1', 'c1', 1)
      .setCell('t1', 'r1', 'c2', 2)
      .setCell('t1', 'r2', 'c1', 3)
      .setCell('t2', 'r1', 'c1', 4)
      .setValue('v1', 5);
    expect(store.getMergeableContent()).toEqual([
      '5',
      [
        [
          '4',
          {
            t1: [
              '3',
              {
                r1: ['2', {c1: ['1', 1], c2: ['2', 2]}],
                r2: ['3', {c1: ['3', 3]}],
              },
            ],
            t2: ['4', {r1: ['4', {c1: ['4', 4]}]}],
          },
        ],
        ['5', {v1: ['5', 5]}],
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
      '7',
      [
        [
          '5',
          {
            t1: [
              '4',
              {
                r1: ['3', {c1: ['2', 2], c2: ['3', null]}],
                r2: ['4', null],
              },
            ],
            t2: ['5', null],
          },
        ],
        ['7', {v1: ['6', 6], v2: ['7', null]}],
      ],
    ]);
  });
});

test('Merge', () => {
  const store = createMergeableStore();
  expect(store.merge()).toEqual(store);
});
