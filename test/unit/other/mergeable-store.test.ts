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

test('Log mergeable changes', () => {
  const store = createMergeableStore();
  store.setCell('t1', 'r1', 'c1', 1);
  store.setCell('t1', 'r1', 'c2', 2);
  store.setCell('t1', 'r2', 'c1', 3);
  store.setCell('t2', 'r1', 'c1', 4);
  store.setValue('v1', 5);
  expect(store.getMergeableChanges()).toEqual([
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

test('Merge', () => {
  const store = createMergeableStore();
  expect(store.merge()).toEqual(store);
});
