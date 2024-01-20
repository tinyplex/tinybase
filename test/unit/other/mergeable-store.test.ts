import {createMergeableStore} from 'tinybase/debug';

test('Create', () => {
  const mergeableStore = createMergeableStore();
  expect(mergeableStore.getJson()).toEqual(JSON.stringify([{}, {}]));
});
