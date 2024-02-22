import {
  MergeableChanges,
  createCustomPersister,
  createMergeableStore,
  createStore,
} from 'tinybase/debug';
import {START_TIME} from '../common/mergeable';

beforeEach(() => jest.useFakeTimers({now: START_TIME}));

afterEach(() => jest.useRealTimers());

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

describe('Supported, MergeableStore', () => {
  test('load / save', async () => {
    const store = createMergeableStore('s1');
    const changes: MergeableChanges = [
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
    ];
    let persisted = '';
    const persister = createCustomPersister(
      store,
      async () => changes,
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
    expect(persisted).toEqual(JSON.stringify(changes));
  });

  test('loading from legacy', async () => {
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
