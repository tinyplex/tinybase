import {
  Changes,
  Content,
  MergeableChanges,
  MergeableContent,
  createCustomPersister,
  createMergeableStore,
  createStore,
} from 'tinybase/debug';
import {START_TIME} from '../common/mergeable';
import {pause} from '../common/other';

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
  test('Content in setPersisted', async () => {
    const store = createMergeableStore('s1');
    const content: MergeableContent = [
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
      async () => content,
      async (getContent: () => Content | MergeableContent) => {
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
    expect(persisted).toEqual(JSON.stringify(content));
  });

  test('Changes in setPersisted', async () => {
    const store = createMergeableStore('s1');
    const persisted: string[] = [];
    const persister = createCustomPersister(
      store,
      async () => [{}, {}],
      async (
        _getContent: () => Content | MergeableContent,
        getChanges?: () => Changes | MergeableChanges,
      ) => {
        const changes = getChanges?.();
        if (changes != undefined) {
          persisted.push(JSON.stringify(changes));
        }
      },
      () => null,
      () => null,
      () => null,
      true,
    );
    await persister.startAutoSave();
    store.setCell('t1', 'r1', 'c1', 1);
    await pause(1, true);
    store.setValue('v1', 1);
    await pause(1, true);
    persister.destroy();
    expect(persisted).toEqual([
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
          ['HeS2L2000000FG2W', {}],
        ],
      ]),
      JSON.stringify([
        'HeS2L2100000FG2W',
        [
          ['HeS2L2100000FG2W', {}],
          ['HeS2L2100000FG2W', {v1: ['HeS2L2100000FG2W', 1]}],
        ],
      ]),
    ]);
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
