import {once} from 'events';
import type {MergeableStore, Tables} from 'tinybase';
import {createMergeableStore} from 'tinybase';
import {createCustomPersister} from 'tinybase/persisters';
import type {Synchronizer} from 'tinybase/synchronizers';
import {Message} from 'tinybase/synchronizers';
import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
import {createWsServerSimple} from 'tinybase/synchronizers/synchronizer-ws-server-simple';
import {afterEach, beforeEach, expect, test} from 'vitest';
import {WebSocket} from 'ws';
import {getTimeFunctions} from '../common/mergeable.ts';
import {
  createTestWebSocketServer,
  getTestWebSocketUrl,
} from '../common/websocket.ts';

const [reset, getNow, pause] = getTimeFunctions();

const getRows = (count: number): Tables[string] =>
  Object.fromEntries(
    Array.from({length: count}, (_, row) => ['pet' + row, {legs: 4}]),
  );

const createMemoryPersister = (store: MergeableStore) =>
  createCustomPersister(
    store,
    async () => undefined,
    async () => {},
    () => 0,
    () => {},
    undefined,
    2,
  );

let cleanups: (() => Promise<unknown> | unknown)[];

beforeEach(() => {
  reset();
  cleanups = [];
});

afterEach(async () => {
  for (const cleanup of cleanups.reverse()) {
    await cleanup();
  }
});

const openClient = async (
  port: number,
  store: MergeableStore,
): Promise<[Synchronizer, number[], number[]]> => {
  const sent: number[] = [];
  const received: number[] = [];
  const synchronizer = await createWsSynchronizer(
    store,
    new WebSocket(getTestWebSocketUrl(port, '/shop')),
    1,
    (_, __, message) => sent.push(message),
    (_, __, message) => received.push(message),
  );
  cleanups.push(() => synchronizer.destroy());
  await synchronizer.startSync();
  await pause(100);
  return [synchronizer, sent, received];
};

const seedStores = (
  serverStore: MergeableStore,
  clientStore: MergeableStore,
) => {
  serverStore.setTable('pets', getRows(1_000)).setValue('open', true);
  clientStore.merge(
    createMergeableStore('seed', getNow).setMergeableContent(
      serverStore.getMergeableContent(),
    ),
  );
  serverStore
    .setCell('pets', 'pet1', 'legs', 3)
    .setRow('pets', 'serverOnly', {legs: 2})
    .delRow('pets', 'pet2')
    .setValue('open', false);
  clientStore
    .setCell('pets', 'pet3', 'legs', 5)
    .setRow('pets', 'clientOnly', {legs: 6});
};

test('large tables are compared in buckets with a newer server', async () => {
  const [webSocketServer, port] = await createTestWebSocketServer();
  const serverStore = createMergeableStore('server', getNow);
  const wsServer = createWsServer(webSocketServer, () =>
    createMemoryPersister(serverStore),
  );
  cleanups.push(() => wsServer.destroy());
  const clientStore = createMergeableStore('client', getNow);
  seedStores(serverStore, clientStore);

  const [, sent, received] = await openClient(port, clientStore);

  expect(clientStore.getMergeableContent()).toEqual(
    serverStore.getMergeableContent(),
  );
  expect(clientStore.getRow('pets', 'pet1')).toEqual({legs: 3});
  expect(clientStore.getRow('pets', 'pet2')).toEqual({});
  expect(clientStore.getRow('pets', 'pet3')).toEqual({legs: 5});
  expect(clientStore.getRow('pets', 'serverOnly')).toEqual({legs: 2});
  expect(clientStore.getRow('pets', 'clientOnly')).toEqual({legs: 6});
  expect(clientStore.getValue('open')).toEqual(false);
  expect(sent).toContain(Message.GetBucketDiff);
  expect(sent).not.toContain(Message.GetRowDiff);
  expect(received).toContain(Message.GetBucketDiff);
});

test('buckets are not used through a server that has not greeted', async () => {
  const [webSocketServer, port] = await createTestWebSocketServer();
  const wsServer = createWsServerSimple(webSocketServer);
  cleanups.push(() => wsServer.destroy());
  const store1 = createMergeableStore('client1', getNow);
  const store2 = createMergeableStore('client2', getNow);
  seedStores(store1, store2);

  const [, sent1] = await openClient(port, store1);
  const [, sent2] = await openClient(port, store2);

  expect(store1.getMergeableContent()).toEqual(store2.getMergeableContent());
  expect([...sent1, ...sent2]).not.toContain(Message.GetBucketDiff);
  expect([...sent1, ...sent2]).toContain(Message.GetRowDiff);
});

test('small tables are not compared in buckets', async () => {
  const [webSocketServer, port] = await createTestWebSocketServer();
  const serverStore = createMergeableStore('server', getNow);
  const wsServer = createWsServer(webSocketServer, () =>
    createMemoryPersister(serverStore),
  );
  cleanups.push(() => wsServer.destroy());
  serverStore.setTable('pets', getRows(10));
  const clientStore = createMergeableStore('client', getNow);
  clientStore.setTable('pets', getRows(10)).setCell('pets', 'pet1', 'legs', 3);

  const [, sent] = await openClient(port, clientStore);

  expect(clientStore.getMergeableContent()).toEqual(
    serverStore.getMergeableContent(),
  );
  expect(sent).not.toContain(Message.GetBucketDiff);
});

test('malformed bucket requests are refused', async () => {
  const errors: string[] = [];
  const [webSocketServer, port] = await createTestWebSocketServer();
  const wsServer = createWsServer(webSocketServer, undefined, (error) =>
    errors.push(error.message),
  );
  cleanups.push(() => wsServer.destroy());
  const webSocket = new WebSocket(getTestWebSocketUrl(port, '/shop'));
  await once(webSocket, 'open');
  const closed = once(webSocket, 'close');
  webSocket.send(
    'S\n["~abcdefghijk",8,' + JSON.stringify({pets: [0, 1, 2]}) + ']',
  );
  expect((await closed)[0]).toEqual(1007);
  expect(errors).toEqual(['tinybase:14']);
});
