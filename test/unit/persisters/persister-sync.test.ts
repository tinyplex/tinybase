/* eslint-disable jest/no-conditional-expect */

import {
  Content,
  MergeableStore,
  Persister,
  createMergeableStore,
} from 'tinybase/debug';
import {START_TIME} from '../common/mergeable';
import {createSyncPersister} from 'tinybase/debug/persisters/persister-sync';
import {pause} from '../common/other';

beforeEach(() => {
  jest.useFakeTimers({now: START_TIME});
});

afterEach(() => {
  jest.useRealTimers();
});

describe('Syncs', () => {
  let store1: MergeableStore;
  let store2: MergeableStore;
  let persister: Persister<true>;

  beforeEach(async () => {
    store1 = createMergeableStore('s1');
    store2 = createMergeableStore('s2');
    persister = createSyncPersister(store1, store2);
    await persister.startAutoLoad();
    await persister.startAutoSave();
  });

  afterEach(() => {
    persister.destroy();
  });

  const expectBothToHaveContent = async (content: Content) => {
    await pause(1, true);
    expect(store1.getContent()).toEqual(content);
    expect(store2.getContent()).toEqual(content);
    expect(store1.getMergeableContent()).toMatchSnapshot();
    expect(store2.getMergeableContent()).toEqual(store1.getMergeableContent());
  };

  // ---

  test('Both empty', async () => {
    await expectBothToHaveContent([{}, {}]);
  });

  test('Both match', async () => {
    store1.setContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {v1: 2, v2: 2},
    ]);
    store2.setContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {v1: 2, v2: 2},
    ]);
    await expectBothToHaveContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {v1: 2, v2: 2},
    ]);
  });

  test('store1 empty', async () => {
    store2.setContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {v1: 2, v2: 2},
    ]);
    await expectBothToHaveContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {v1: 2, v2: 2},
    ]);
  });

  test('store2 empty', async () => {
    store1.setContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {v1: 2, v2: 2},
    ]);
    await expectBothToHaveContent([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
      {v1: 2, v2: 2},
    ]);
  });

  test('store1 missing tables', async () => {
    store1.setValues({v1: 2, v2: 2});
    await pause(1, true);
    store2.setTables({
      t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}},
      t2: {r2: {c2: 2}},
    });
    await expectBothToHaveContent([
      {
        t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}},
        t2: {r2: {c2: 2}},
      },
      {v1: 2, v2: 2},
    ]);
  });
});
