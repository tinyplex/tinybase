/* eslint-disable jest/no-conditional-expect */

import {
  Content,
  MergeableStore,
  Receive,
  Synchronizer,
  createCustomSynchronizer,
  createMergeableStore,
} from 'tinybase/debug';
import {WebSocket, WebSocketServer} from 'ws';
import {
  WsServer,
  createWsServer,
} from 'tinybase/debug/synchronizers/synchronizer-ws-server';
import {createLocalSynchronizer} from 'tinybase/debug/synchronizers/synchronizer-local';
import {createWsSynchronizer} from 'tinybase/debug/synchronizers/synchronizer-ws-client';
import {pause} from '../common/other';
import {resetHlc} from '../common/mergeable';

const messageTypes = [
  'RESPONSE',
  'CONTENT_HASHES',
  'GET_CONTENT_HASHES',
  'GET_TABLE_DIFF',
  'GET_ROW_DIFF',
  'GET_CELL_DIFF',
  'GET_VALUE_DIFF',
];

beforeEach(() => {
  resetHlc();
});

type Synchronizable<Environment> = {
  createEnvironment?: () => Environment;
  destroyEnvironment?: (environment: Environment) => void;
  getSynchronizer: (
    store: MergeableStore,
    environment: Environment,
  ) => Promise<Synchronizer>;
  pauseMilliseconds: number;
};

const mockLocalSynchronizer: Synchronizable<undefined> = {
  getSynchronizer: async (store: MergeableStore) =>
    createLocalSynchronizer(store),
  pauseMilliseconds: 2,
};

const mockWsSynchronizer: Synchronizable<WsServer> = {
  createEnvironment: () => createWsServer(new WebSocketServer({port: 8042})),
  destroyEnvironment: (wsServer: WsServer) => {
    wsServer.destroy();
  },
  getSynchronizer: async (store: MergeableStore) => {
    const webSocket = new WebSocket('ws://localhost:8042');
    return await createWsSynchronizer(store, webSocket, 0.04);
  },
  pauseMilliseconds: 50,
};

const mockCustomSynchronizer: Synchronizable<
  [Map<string, Receive>, Map<string, string[]>]
> = {
  createEnvironment: () => [new Map(), new Map()],
  getSynchronizer: async (
    store: MergeableStore,
    [clients, messages]: [Map<string, Receive>, Map<string, string[]>],
  ) => {
    const clientId = 'client' + clients.size;
    return createCustomSynchronizer(
      store,
      (toClientId, requestId, messageType, messageBody): void => {
        const requestKey =
          requestId == null ? 'push ' + messages.size : requestId;
        if (!messages.has(requestKey)) {
          messages.set(requestKey, []);
        }
        messages
          .get(requestKey)!
          .push(
            `${clientId}→${toClientId ?? 'all'} ${messageTypes[messageType]} ` +
              JSON.stringify(messageBody),
          );

        if (toClientId == null) {
          clients.forEach((receive, otherClientId) =>
            otherClientId != clientId
              ? receive(clientId, requestId, messageType, messageBody)
              : 0,
          );
        } else {
          clients.get(toClientId)?.(
            clientId,
            requestId,
            messageType,
            messageBody,
          );
        }
      },
      (receive: Receive): void => {
        clients.set(clientId, receive);
      },
      (): void => {
        clients.delete(clientId);
      },
      0.001,
    );
  },
  pauseMilliseconds: 2,
};

describe.each([
  ['localSynchronizer', mockLocalSynchronizer],
  ['wsSynchronizer', mockWsSynchronizer],
  ['customSynchronizer', mockCustomSynchronizer],
] as any[])(
  'Syncs to/from %s',
  <Environment>(_name: string, synchronizable: Synchronizable<Environment>) => {
    let environment: any;
    let store1: MergeableStore;
    let store2: MergeableStore;
    let synchronizer1: Synchronizer;
    let synchronizer2: Synchronizer;

    const expectEachToHaveContent = async (
      content1: Content,
      content2?: Content,
    ) => {
      expect(store1.getContent()).toEqual(content1);
      expect(store2.getContent()).toEqual(content2 ?? content1);
      expect(store1.getMergeableContent()).toMatchSnapshot();
      if (content2) {
        expect(store2.getMergeableContent()).toMatchSnapshot();
      } else {
        expect(store2.getMergeableContent()).toEqual(
          store1.getMergeableContent(),
        );
      }
      expect([
        synchronizer1.getSynchronizerStats(),
        synchronizer2.getSynchronizerStats(),
      ]).toMatchSnapshot('stats');
    };

    beforeEach(() => {
      environment = synchronizable.createEnvironment?.();
    });

    afterEach(() => {
      synchronizable.destroyEnvironment?.(environment);
    });

    describe('Unidirectional', () => {
      beforeEach(async () => {
        store1 = createMergeableStore('s1');
        store2 = createMergeableStore('s2');
        synchronizer1 = await synchronizable.getSynchronizer(
          store1,
          environment,
        );
        synchronizer2 = await synchronizable.getSynchronizer(
          store2,
          environment,
        );
      });

      afterEach(() => {
        synchronizer1.destroy();
        synchronizer2.destroy();
      });

      test('save1 but not autoLoad2', async () => {
        store1.setContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
          {v1: 1, v2: 2},
        ]);
        await synchronizer1.save();
        await pause(synchronizable.pauseMilliseconds, true);
        await expectEachToHaveContent(
          [
            {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
            {v1: 1, v2: 2},
          ],
          [{}, {}],
        );
      });

      test('autoSave1 but not autoLoad2', async () => {
        await synchronizer1.startAutoSave();
        store1.setContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
          {v1: 1, v2: 2},
        ]);
        await pause(synchronizable.pauseMilliseconds, true);
        await expectEachToHaveContent(
          [
            {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
            {v1: 1, v2: 2},
          ],
          [{}, {}],
        );
      });

      test('load1 but not autoSave2, defaults', async () => {
        store2.setContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
          {v1: 1, v2: 2},
        ]);
        await synchronizer1.load([{t0: {r0: {c0: 0}}}, {v0: 0}]);
        await pause(synchronizable.pauseMilliseconds, true);
        await expectEachToHaveContent(
          [{t0: {r0: {c0: 0}}}, {v0: 0}],
          [
            {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
            {v1: 1, v2: 2},
          ],
        );
      });

      test('autoLoad1 but not autoSave2, defaults', async () => {
        await synchronizer1.startAutoLoad([{t0: {r0: {c0: 0}}}, {v0: 0}]);
        store2.setContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
          {v1: 1, v2: 2},
        ]);
        await pause(synchronizable.pauseMilliseconds, true);
        await expectEachToHaveContent(
          [{t0: {r0: {c0: 0}}}, {v0: 0}],
          [
            {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
            {v1: 1, v2: 2},
          ],
        );
      });
    });

    test('Bidirectional, data already present', async () => {
      store1 = createMergeableStore('s1');
      store2 = createMergeableStore('s2');
      store1.setCell('t1', 'r1', 'c1', 1);
      store2.setCell('t1', 'r1', 'c2', 2);
      synchronizer1 = await synchronizable.getSynchronizer(store1, environment);
      synchronizer2 = await synchronizable.getSynchronizer(store2, environment);
      await synchronizer1.startSync();
      await synchronizer2.startSync();
      await pause(synchronizable.pauseMilliseconds, true);
      await expectEachToHaveContent([{t1: {r1: {c1: 1, c2: 2}}}, {}]);
      synchronizer1.destroy();
      synchronizer2.destroy();
    });

    describe('Bidirectional', () => {
      beforeEach(async () => {
        store1 = createMergeableStore('s1');
        store2 = createMergeableStore('s2');
        synchronizer1 = await synchronizable.getSynchronizer(
          store1,
          environment,
        );
        synchronizer2 = await synchronizable.getSynchronizer(
          store2,
          environment,
        );
        await synchronizer1.startSync();
        await synchronizer2.startSync();
        await pause(synchronizable.pauseMilliseconds, true);
      });

      afterEach(() => {
        synchronizer1.destroy();
        synchronizer2.destroy();
      });

      // ---

      test('Both empty', async () => {
        await expectEachToHaveContent([{}, {}]);
      });

      test('Both match', async () => {
        store1.setContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
          {v1: 1, v2: 2},
        ]);
        store2.setContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
          {v1: 1, v2: 2},
        ]);
        await pause(synchronizable.pauseMilliseconds, true);
        await expectEachToHaveContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
          {v1: 1, v2: 2},
        ]);
      });

      test('Both match, different times', async () => {
        store1.setContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
          {v1: 1, v2: 2},
        ]);
        await pause(synchronizable.pauseMilliseconds, true);
        store2.setContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
          {v1: 1, v2: 2},
        ]);
        await pause(synchronizable.pauseMilliseconds, true);
        await expectEachToHaveContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
          {v1: 1, v2: 2},
        ]);
      });

      test('store1 empty', async () => {
        store2.setContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
          {v1: 1, v2: 2},
        ]);
        await pause(synchronizable.pauseMilliseconds, true);
        await expectEachToHaveContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
          {v1: 1, v2: 2},
        ]);
      });

      test('store2 empty', async () => {
        store1.setContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
          {v1: 1, v2: 2},
        ]);
        await pause(synchronizable.pauseMilliseconds, true);
        await expectEachToHaveContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
          {v1: 1, v2: 2},
        ]);
      });

      test('store1 missing tables', async () => {
        store1.setValues({v1: 1, v2: 2});
        await pause(synchronizable.pauseMilliseconds, true);
        store2.setContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
          {v1: 1, v2: 2},
        ]);
        await pause(synchronizable.pauseMilliseconds, true);
        await expectEachToHaveContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
          {v1: 1, v2: 2},
        ]);
      });

      test('store2 missing tables', async () => {
        store2.setValues({v1: 1, v2: 2});
        await pause(synchronizable.pauseMilliseconds, true);
        store1.setContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
          {v1: 1, v2: 2},
        ]);
        await pause(synchronizable.pauseMilliseconds, true);
        await expectEachToHaveContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
          {v1: 1, v2: 2},
        ]);
      });

      test('different tables', async () => {
        store1.setTable('t1', {r1: {c1: 1, c2: 2}, r2: {c2: 2}});
        await pause(synchronizable.pauseMilliseconds, true);
        store2.setTable('t2', {r2: {c2: 2}});
        await pause(synchronizable.pauseMilliseconds, true);
        await expectEachToHaveContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
          {},
        ]);
      });

      test('store1 missing table', async () => {
        store1.setTable('t1', {r1: {c1: 1, c2: 2}, r2: {c2: 2}});
        await pause(synchronizable.pauseMilliseconds, true);
        store2.setTables({
          t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}},
          t2: {r2: {c2: 2}},
        });
        await pause(synchronizable.pauseMilliseconds, true);
        await expectEachToHaveContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
          {},
        ]);
      });

      test('store2 missing table', async () => {
        store2.setTable('t1', {r1: {c1: 1, c2: 2}, r2: {c2: 2}});
        await pause(synchronizable.pauseMilliseconds, true);
        store1.setTables({
          t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}},
          t2: {r2: {c2: 2}},
        });
        await pause(synchronizable.pauseMilliseconds, true);
        await expectEachToHaveContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
          {},
        ]);
      });

      test('different table', async () => {
        store1.setRow('t1', 'r1', {c1: 1, c2: 2});
        await pause(synchronizable.pauseMilliseconds, true);
        store2.setRow('t1', 'r2', {c2: 2});
        await pause(synchronizable.pauseMilliseconds, true);
        await expectEachToHaveContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}},
          {},
        ]);
      });

      test('store1 missing row', async () => {
        store1.setRow('t1', 'r1', {c1: 1, c2: 2});
        await pause(synchronizable.pauseMilliseconds, true);
        store2.setTable('t1', {r1: {c1: 1, c2: 2}, r2: {c2: 2}});
        await pause(synchronizable.pauseMilliseconds, true);
        await expectEachToHaveContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}},
          {},
        ]);
      });

      test('store2 missing row', async () => {
        store2.setRow('t1', 'r1', {c1: 1, c2: 2});
        await pause(synchronizable.pauseMilliseconds, true);
        store1.setTable('t1', {r1: {c1: 1, c2: 2}, r2: {c2: 2}});
        await pause(synchronizable.pauseMilliseconds, true);
        await expectEachToHaveContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}},
          {},
        ]);
      });

      test('different row', async () => {
        store1.setCell('t1', 'r1', 'c1', 1);
        await pause(synchronizable.pauseMilliseconds, true);
        store2.setCell('t1', 'r1', 'c2', 2);
        await pause(synchronizable.pauseMilliseconds, true);
        await expectEachToHaveContent([{t1: {r1: {c1: 1, c2: 2}}}, {}]);
      });

      test('store1 missing cell', async () => {
        store1.setCell('t1', 'r1', 'c1', 1);
        await pause(synchronizable.pauseMilliseconds, true);
        store2.setRow('t1', 'r1', {c1: 1, c2: 2});
        await pause(synchronizable.pauseMilliseconds, true);
        await expectEachToHaveContent([{t1: {r1: {c1: 1, c2: 2}}}, {}]);
      });

      test('store2 missing cell', async () => {
        store2.setCell('t1', 'r1', 'c1', 1);
        await pause(synchronizable.pauseMilliseconds, true);
        store1.setRow('t1', 'r1', {c1: 1, c2: 2});
        await pause(synchronizable.pauseMilliseconds, true);
        await expectEachToHaveContent([{t1: {r1: {c1: 1, c2: 2}}}, {}]);
      });

      test('different cell', async () => {
        store1.setCell('t1', 'r1', 'c1', 1);
        await pause(synchronizable.pauseMilliseconds, true);
        store2.setCell('t1', 'r1', 'c1', 2);
        await pause(synchronizable.pauseMilliseconds, true);
        await expectEachToHaveContent([{t1: {r1: {c1: 2}}}, {}]);
      });

      test('deleted tables', async () => {
        store1.setContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
          {v1: 1, v2: 2},
        ]);
        await pause(synchronizable.pauseMilliseconds, true);
        store2.delTables();
        await pause(synchronizable.pauseMilliseconds, true);
        await expectEachToHaveContent([{}, {v1: 1, v2: 2}]);
      });

      test('deleted table', async () => {
        store1.setContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
          {v1: 1, v2: 2},
        ]);
        await pause(synchronizable.pauseMilliseconds, true);
        store2.delTable('t2');
        await pause(synchronizable.pauseMilliseconds, true);
        await expectEachToHaveContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}},
          {v1: 1, v2: 2},
        ]);
      });

      test('deleted row', async () => {
        store1.setContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
          {v1: 1, v2: 2},
        ]);
        await pause(synchronizable.pauseMilliseconds, true);
        store2.delRow('t1', 'r2');
        await pause(synchronizable.pauseMilliseconds, true);
        await expectEachToHaveContent([
          {t1: {r1: {c1: 1, c2: 2}}, t2: {r2: {c2: 2}}},
          {v1: 1, v2: 2},
        ]);
      });

      test('deleted cell', async () => {
        store1.setContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
          {v1: 1, v2: 2},
        ]);
        await pause(synchronizable.pauseMilliseconds, true);
        store2.delCell('t1', 'r1', 'c2');
        await pause(synchronizable.pauseMilliseconds, true);
        await expectEachToHaveContent([
          {t1: {r1: {c1: 1}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
          {v1: 1, v2: 2},
        ]);
      });

      test('deleted values', async () => {
        store1.setContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
          {v1: 1, v2: 2},
        ]);
        await pause(synchronizable.pauseMilliseconds, true);
        store2.delValues();
        await pause(synchronizable.pauseMilliseconds, true);
        await expectEachToHaveContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
          {},
        ]);
      });

      test('deleted value', async () => {
        store1.setContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
          {v1: 1, v2: 2},
        ]);
        await pause(synchronizable.pauseMilliseconds, true);
        store2.delValue('v2');
        await pause(synchronizable.pauseMilliseconds, true);
        await expectEachToHaveContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
          {v1: 1},
        ]);
      });

      test('store1 missing values', async () => {
        store1.setTables({
          t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}},
          t2: {r2: {c2: 2}},
        });
        await pause(synchronizable.pauseMilliseconds, true);
        store2.setContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
          {v1: 1, v2: 2},
        ]);
        await pause(synchronizable.pauseMilliseconds, true);
        await expectEachToHaveContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
          {v1: 1, v2: 2},
        ]);
      });

      test('store2 missing values', async () => {
        store2.setTables({
          t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}},
          t2: {r2: {c2: 2}},
        });
        await pause(synchronizable.pauseMilliseconds, true);
        store1.setContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
          {v1: 1, v2: 2},
        ]);
        await pause(synchronizable.pauseMilliseconds, true);
        await expectEachToHaveContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
          {v1: 1, v2: 2},
        ]);
      });

      test('different values', async () => {
        store1.setValue('v1', 1);
        await pause(synchronizable.pauseMilliseconds, true);
        store2.setValue('v2', 2);
        await pause(synchronizable.pauseMilliseconds, true);
        await expectEachToHaveContent([{}, {v1: 1, v2: 2}]);
      });

      test('store1 missing value', async () => {
        store1.setValue('v2', 2);
        await pause(synchronizable.pauseMilliseconds, true);
        store2.setValues({v1: 1, v2: 2});
        await pause(synchronizable.pauseMilliseconds, true);
        await expectEachToHaveContent([{}, {v1: 1, v2: 2}]);
      });

      test('store2 missing value', async () => {
        store2.setValue('v2', 2);
        await pause(synchronizable.pauseMilliseconds, true);
        store1.setValues({v1: 1, v2: 2});
        await pause(synchronizable.pauseMilliseconds, true);
        await expectEachToHaveContent([{}, {v1: 1, v2: 2}]);
      });

      test('different value', async () => {
        store1.setValue('v1', 1);
        await pause(synchronizable.pauseMilliseconds, true);
        store2.setValue('v1', 2);
        await pause(synchronizable.pauseMilliseconds, true);
        await expectEachToHaveContent([{}, {v1: 2}]);
      });

      describe('tracking messages', () => {
        test('new tables, new table, new row, new cell; then all', async () => {
          if (environment && environment[1]) {
            environment[1].clear();
            store1.setTables({t1: {r1: {c1: 1}}});
            await pause(synchronizable.pauseMilliseconds, true);
            expect(environment[1]).toMatchSnapshot();
            await expectEachToHaveContent([{t1: {r1: {c1: 1}}}, {}]);

            environment[1].clear();
            store1.setTables({t1: {r1: {c1: 1}}, t2: {r2: {c2: 2}}});
            await pause(synchronizable.pauseMilliseconds, true);
            await expectEachToHaveContent([
              {t1: {r1: {c1: 1}}, t2: {r2: {c2: 2}}},
              {},
            ]);
            expect(environment[1]).toMatchSnapshot();

            environment[1].clear();
            store1.setTables({
              t1: {r1: {c1: 1}, r2: {c2: 2}},
              t2: {r2: {c2: 2}},
            });
            await pause(synchronizable.pauseMilliseconds, true);
            await expectEachToHaveContent([
              {t1: {r1: {c1: 1}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
              {},
            ]);
            expect(environment[1]).toMatchSnapshot();

            environment[1].clear();
            store1.setTables({
              t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}},
              t2: {r2: {c2: 2}},
            });
            await pause(synchronizable.pauseMilliseconds, true);
            await expectEachToHaveContent([
              {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
              {},
            ]);
            expect(environment[1]).toMatchSnapshot();

            environment[1].clear();
            store1.setTables({
              t1: {r1: {c1: 1, c2: 2, c3: 3}, r2: {c2: 2}, r3: {c3: 3}},
              t2: {r2: {c2: 2}},
              t3: {r3: {c3: 3}},
            });
            await pause(synchronizable.pauseMilliseconds, true);
            await expectEachToHaveContent([
              {
                t1: {r1: {c1: 1, c2: 2, c3: 3}, r2: {c2: 2}, r3: {c3: 3}},
                t2: {r2: {c2: 2}},
                t3: {r3: {c3: 3}},
              },
              {},
            ]);
            expect(environment[1]).toMatchSnapshot();
          }
        });

        test('single value', async () => {
          if (environment && environment[1]) {
            environment[1].clear();
            store1.setValue('v1', 1);
            await pause(synchronizable.pauseMilliseconds, true);
            expect(environment[1]).toMatchSnapshot();
            await expectEachToHaveContent([{}, {v1: 1}]);
          }
        });
      });
    });

    describe('Multidirectional', () => {
      const stores: MergeableStore[] = new Array(10);
      const synchronizers: Synchronizer[] = new Array(10);

      const expectAllToHaveContent = async (content: Content) => {
        const mergeableContent = stores[0].getMergeableContent();
        expect(mergeableContent).toMatchSnapshot();
        stores.forEach((store, s) => {
          expect(store.getContent()).toEqual(content);
          if (s > 0) {
            expect(store.getMergeableContent()).toEqual(mergeableContent);
          }
        });
        expect(
          synchronizers.reduce(
            (total, synchronizer) => {
              const stats = synchronizer.getSynchronizerStats();
              total.sends += stats.sends ?? 0;
              total.receives += stats.receives ?? 0;
              return total;
            },
            {sends: 0, receives: 0},
          ),
        ).toMatchSnapshot('stats');
      };

      beforeEach(async () => {
        await Promise.all(
          stores.fill(null as any).map(async (_, s) => {
            stores[s] = createMergeableStore('s' + (s + 1));
            synchronizers[s] = await synchronizable.getSynchronizer(
              stores[s],
              environment,
            );
          }),
        );
        await Promise.all(
          synchronizers.map(
            async (synchronizer) => await synchronizer.startSync(),
          ),
        );
        await pause(synchronizable.pauseMilliseconds, true);
      });

      afterEach(() => {
        synchronizers.forEach((synchronizer) => synchronizer.destroy());
      });

      // ---

      test('All empty', async () => {
        await expectAllToHaveContent([{}, {}]);
      });

      test('All match', async () => {
        stores.forEach((store) =>
          store.setContent([
            {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
            {v1: 1, v2: 2},
          ]),
        );
        await pause(synchronizable.pauseMilliseconds, true);
        await expectAllToHaveContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
          {v1: 1, v2: 2},
        ]);
      });

      test('All but first empty', async () => {
        stores[0].setContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
          {v1: 1, v2: 2},
        ]);
        await pause(synchronizable.pauseMilliseconds, true);
        await expectAllToHaveContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
          {v1: 1, v2: 2},
        ]);
      });

      test('All but last empty', async () => {
        stores[9].setContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
          {v1: 1, v2: 2},
        ]);
        await pause(synchronizable.pauseMilliseconds, true);
        await expectAllToHaveContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
          {v1: 1, v2: 2},
        ]);
      });

      test('half tables, half values', async () => {
        stores.forEach((store, s) => {
          if (s > 4) {
            store.setTables({
              t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}},
              t2: {r2: {c2: 2}},
            });
          } else {
            store.setValues({v1: 1, v2: 2});
          }
        });
        await pause(synchronizable.pauseMilliseconds, true);
        await expectAllToHaveContent([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c2: 2}}, t2: {r2: {c2: 2}}},
          {v1: 1, v2: 2},
        ]);
      });

      test('all different tables', async () => {
        stores.forEach((store, s) => {
          store.setTable('t' + (s + 1), {r1: {c1: 1}});
        });
        await pause(synchronizable.pauseMilliseconds, true);
        await expectAllToHaveContent([
          {
            t1: {r1: {c1: 1}},
            t2: {r1: {c1: 1}},
            t3: {r1: {c1: 1}},
            t4: {r1: {c1: 1}},
            t5: {r1: {c1: 1}},
            t6: {r1: {c1: 1}},
            t7: {r1: {c1: 1}},
            t8: {r1: {c1: 1}},
            t9: {r1: {c1: 1}},
            t10: {r1: {c1: 1}},
          },
          {},
        ]);
      });

      test('all different rows', async () => {
        stores.forEach((store, s) => {
          store.setRow('t1', 'r' + (s + 1), {c1: 1});
        });
        await pause(synchronizable.pauseMilliseconds, true);
        await expectAllToHaveContent([
          {
            t1: {
              r1: {c1: 1},
              r2: {c1: 1},
              r3: {c1: 1},
              r4: {c1: 1},
              r5: {c1: 1},
              r6: {c1: 1},
              r7: {c1: 1},
              r8: {c1: 1},
              r9: {c1: 1},
              r10: {c1: 1},
            },
          },
          {},
        ]);
      });

      test('all different cells', async () => {
        stores.forEach((store, s) => {
          store.setCell('t1', 'r1', 'c' + (s + 1), 1);
        });
        await pause(synchronizable.pauseMilliseconds, true);
        await expectAllToHaveContent([
          {
            t1: {
              r1: {
                c1: 1,
                c2: 1,
                c3: 1,
                c4: 1,
                c5: 1,
                c6: 1,
                c7: 1,
                c8: 1,
                c9: 1,
                c10: 1,
              },
            },
          },
          {},
        ]);
      });

      test('all conflicting cells', async () => {
        await expectAllToHaveContent([{}, {}]);
        stores.forEach((store, s) => {
          store.setCell('t1', 'r1', 'c1', s + 1);
        });
        await pause(synchronizable.pauseMilliseconds, true);
        await expectAllToHaveContent([{t1: {r1: {c1: 10}}}, {}]);
        stores[3].setCell('t1', 'r1', 'c1', 42);
        await pause(synchronizable.pauseMilliseconds, true);
        await expectAllToHaveContent([{t1: {r1: {c1: 42}}}, {}]);
      });

      test('all different values', async () => {
        stores.forEach((store, s) => {
          store.setValue('v' + (s + 1), 1);
        });
        await pause(synchronizable.pauseMilliseconds, true);
        await expectAllToHaveContent([
          {},
          {
            v1: 1,
            v2: 1,
            v3: 1,
            v4: 1,
            v5: 1,
            v6: 1,
            v7: 1,
            v8: 1,
            v9: 1,
            v10: 1,
          },
        ]);
      });

      test('all conflicting values', async () => {
        stores.forEach((store, s) => {
          store.setValue('v1', s + 1);
        });
        await pause(synchronizable.pauseMilliseconds, true);
        await expectAllToHaveContent([{}, {v1: 10}]);
        stores[5].setValue('v1', 42);
        await pause(synchronizable.pauseMilliseconds, true);
        await expectAllToHaveContent([{}, {v1: 42}]);
      });
    });
  },
);
