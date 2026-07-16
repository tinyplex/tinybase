import {createMergeableStore} from 'tinybase';
import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
import {expect, test} from 'vitest';
import {WebSocket, WebSocketServer} from 'ws';
import {getTimeFunctions} from '../common/mergeable.ts';

const [, getNow, pause] = getTimeFunctions();

class MockWebSocket {
  OPEN = 1;
  CLOSED = 3;
  readyState = this.OPEN;
  bufferedAmount = 0;
  sentPayloads: string[] = [];
  closeCalls = 0;
  ignoredChannels = new Set<string>();
  readonly #listeners: {[event: string]: ((event: any) => void)[]} = {};

  addEventListener(event: string, listener: (event: any) => void): void {
    (this.#listeners[event] ??= []).push(listener);
  }

  removeEventListener(event: string, listener: (event: any) => void): void {
    this.#listeners[event] = (this.#listeners[event] ?? []).filter(
      (testListener) => testListener != listener,
    );
  }

  send(payload: string): void {
    this.sentPayloads.push(payload);
    const [toClientId, remainder] = splitPayload(payload);
    if (toClientId == 'S') {
      const [requestId, message, controlAndBody] = JSON.parse(remainder);
      if (
        message == -1 &&
        controlAndBody[0] != 2 &&
        !this.ignoredChannels.has(controlAndBody[1])
      ) {
        queueMicrotask(() =>
          this.receive(
            'S\n' + JSON.stringify([requestId, message, controlAndBody]),
          ),
        );
      }
    }
  }

  receive(payload: string): void {
    this.#listeners.message?.forEach((listener) => listener({data: payload}));
  }

  disconnect(): void {
    this.readyState = 3;
    this.#listeners.close?.forEach((listener) => listener({}));
  }

  reconnect(): void {
    this.readyState = this.OPEN;
    this.#listeners.open?.forEach((listener) => listener({}));
  }

  error(error: Error): void {
    this.#listeners.error?.forEach((listener) => listener(error));
  }

  close(): void {
    this.closeCalls++;
    this.readyState = 3;
  }
}

const splitPayload = (payload: string): [string, string] => {
  const splitAt = payload.indexOf('\n');
  return [payload.slice(0, splitAt), payload.slice(splitAt + 1)];
};

test('multiple stores share one WebSocket', async () => {
  const webSocket = new MockWebSocket();
  const filesReceives: any[] = [];
  const editorReceives: any[] = [];
  const filesSynchronizer = await createWsSynchronizer(
    createMergeableStore(),
    webSocket as any,
    'files',
    0.01,
    undefined,
    (...args) => filesReceives.push(args),
  );
  const editorSynchronizer = await createWsSynchronizer(
    createMergeableStore(),
    webSocket as any,
    'editor',
    0.01,
    undefined,
    (...args) => editorReceives.push(args),
  );

  await filesSynchronizer.startSync();
  await editorSynchronizer.startSync();

  expect(
    webSocket.sentPayloads.some((payload) => payload.startsWith('M\nfiles\n')),
  ).toBe(true);
  expect(
    webSocket.sentPayloads.some((payload) => payload.startsWith('M\neditor\n')),
  ).toBe(true);

  webSocket.receive('M\nfiles\nremote\n[null,1,""]');
  expect(filesReceives).toEqual([['remote', null, 1, '']]);
  expect(editorReceives).toEqual([]);

  await filesSynchronizer.destroy();
  expect(webSocket.closeCalls).toBe(0);
  expect(webSocket.sentPayloads.at(-1)).toContain('-1,[2,"files"]]');

  await editorSynchronizer.destroy();
  expect(webSocket.closeCalls).toBe(1);
});

test('malformed multiplexed traffic is reported and disconnected', async () => {
  for (const payload of ['S\n{', 'M\nfiles\nremote\n{']) {
    const errors: Error[] = [];
    const webSocket = new MockWebSocket();
    const synchronizer = await createWsSynchronizer(
      createMergeableStore(),
      webSocket as any,
      'files',
      1,
      undefined,
      undefined,
      (error) => errors.push(error),
    );

    expect(() => webSocket.receive(payload)).not.toThrow();
    expect(errors.map(({message}) => message)).toEqual(['tinybase:14']);
    expect(webSocket.closeCalls).toBe(1);

    await synchronizer.destroy();
  }
});

test('malformed multiplexed clients do not affect other clients', async () => {
  const errors: Error[] = [];
  const server = createWsServer(
    new WebSocketServer({port: 8058}),
    undefined,
    (error) => errors.push(error),
  );
  const attacker = new WebSocket('ws://localhost:8058', 'tinybase');
  const otherClient = new WebSocket('ws://localhost:8058', 'tinybase');
  const attackerSynchronizer = await createWsSynchronizer(
    createMergeableStore(),
    attacker,
    'files',
  );
  const otherSynchronizer = await createWsSynchronizer(
    createMergeableStore(),
    otherClient,
    'files',
  );
  const closed = new Promise<void>((resolve) =>
    attacker.on('close', () => resolve()),
  );

  attacker.send('M\nfiles\n\n{');
  await closed;
  await pause();

  expect(errors.map(({message}) => message)).toEqual(['tinybase:14']);
  expect(otherClient.readyState).toBe(WebSocket.OPEN);
  expect(server.getStats()).toEqual({clients: 1, paths: 1});

  await attackerSynchronizer.destroy();
  await otherSynchronizer.destroy();
  await server.destroy();
});

test('multiple channel Ids are validated and unique', async () => {
  const webSocket = new MockWebSocket();
  const synchronizer = await createWsSynchronizer(
    createMergeableStore(),
    webSocket as any,
    'files',
  );

  await expect(
    createWsSynchronizer(createMergeableStore(), webSocket as any, 'files'),
  ).rejects.toThrow('tinybase:7:files');
  for (const channelId of [
    '',
    '../files',
    './files',
    'files//pets',
    'files/..',
    'files?pets',
    'files#pets',
    'files\npets',
  ]) {
    await expect(
      createWsSynchronizer(createMergeableStore(), webSocket as any, channelId),
    ).rejects.toThrow('tinybase:6:' + channelId);
  }

  await synchronizer.destroy();
  expect(webSocket.closeCalls).toBe(1);
});

test('multiple stores resubscribe after reconnecting', async () => {
  const webSocket = new MockWebSocket();
  const filesStore = createMergeableStore();
  const editorStore = createMergeableStore();
  const synchronizers = await Promise.all([
    createWsSynchronizer(filesStore, webSocket as any, 'files', 0.01),
    createWsSynchronizer(editorStore, webSocket as any, 'editor', 0.01),
  ]);
  await Promise.all(
    synchronizers.map((synchronizer) => synchronizer.startSync()),
  );

  const sentPayloadCount = webSocket.sentPayloads.length;
  webSocket.disconnect();
  filesStore
    .setValue('updatedWhileOffline', true)
    .setValue('alsoUpdatedWhileOffline', true);
  webSocket.reconnect();
  await new Promise((resolve) => setTimeout(resolve, 20));

  const reconnectedPayloads = webSocket.sentPayloads.slice(sentPayloadCount);
  expect(
    reconnectedPayloads.some((payload) => payload.includes('-1,[0,1]')),
  ).toBe(true);
  expect(
    reconnectedPayloads.some((payload) => payload.includes('-1,[1,"files"]')),
  ).toBe(true);
  expect(
    reconnectedPayloads.some((payload) => payload.includes('-1,[1,"editor"]')),
  ).toBe(true);
  expect(
    reconnectedPayloads.some((payload) => payload.startsWith('M\nfiles\n')),
  ).toBe(true);
  expect(
    reconnectedPayloads.filter(
      (payload) => payload.startsWith('M\nfiles\n') && payload.includes(',2,['),
    ),
  ).toHaveLength(1);

  await Promise.all(
    synchronizers.map((synchronizer) => synchronizer.destroy()),
  );
  expect(webSocket.closeCalls).toBe(1);
});

test('multiplexed channel errors and timeouts keep their owners', async () => {
  const filesErrors: any[] = [];
  const editorErrors: any[] = [];
  const webSocket = new MockWebSocket();
  const filesSynchronizer = await createWsSynchronizer(
    createMergeableStore(),
    webSocket as any,
    'files',
    0.1,
    undefined,
    undefined,
    (error) => filesErrors.push(error),
  );
  const editorSynchronizer = await createWsSynchronizer(
    createMergeableStore(),
    webSocket as any,
    'editor',
    0.01,
    undefined,
    undefined,
    (error) => editorErrors.push(error),
  );
  const socketError = new Error('socket');

  webSocket.error(socketError);
  expect(filesErrors).toEqual([socketError]);
  expect(editorErrors).toEqual([socketError]);
  filesErrors.length = 0;
  editorErrors.length = 0;

  webSocket.ignoredChannels.add('editor');
  webSocket.disconnect();
  filesErrors.length = 0;
  editorErrors.length = 0;
  webSocket.reconnect();
  await new Promise((resolve) => setTimeout(resolve, 20));

  expect(filesErrors).toEqual([]);
  expect(editorErrors.map(({message}) => message)).toEqual(['tinybase:4:1']);

  const editorSubscriptions = () =>
    webSocket.sentPayloads.filter((payload) =>
      payload.includes('-1,[1,"editor"]'),
    ).length;
  const subscriptionsBeforeRetry = editorSubscriptions();
  webSocket.ignoredChannels.delete('editor');
  webSocket.reconnect();
  await new Promise((resolve) => setTimeout(resolve, 20));
  expect(editorSubscriptions()).toBe(subscriptionsBeforeRetry + 1);

  await filesSynchronizer.destroy();
  await editorSynchronizer.destroy();
});

test('queued multiplexed protocol traffic expires', async () => {
  const webSocket = new MockWebSocket();
  const synchronizer = await createWsSynchronizer(
    createMergeableStore(),
    webSocket as any,
    'files',
    0.01,
  );

  webSocket.disconnect();
  webSocket.receive('M\nfiles\nremote\n["expired",4,{}]');
  await new Promise((resolve) => setTimeout(resolve, 20));
  webSocket.reconnect();
  await new Promise((resolve) => setTimeout(resolve, 20));

  expect(
    webSocket.sentPayloads.some((payload) => payload.includes('"expired",0')),
  ).toBe(false);

  await synchronizer.destroy();
});

test('multiplexed queues have explicit overflow behavior', async () => {
  const errors: Error[] = [];
  const webSocket = new MockWebSocket();
  const filesSynchronizer = await createWsSynchronizer(
    createMergeableStore(),
    webSocket as any,
    'files',
    1,
    undefined,
    undefined,
    (error) => errors.push(error),
  );
  const editorSynchronizer = await createWsSynchronizer(
    createMergeableStore(),
    webSocket as any,
    'editor',
  );

  webSocket.disconnect();
  for (let request = 0; request < 1_001; request++) {
    const channelId = request % 2 ? 'files' : 'editor';
    webSocket.receive(
      'M\n' + channelId + '\nremote\n["request' + request + '",4,{}]',
    );
  }

  expect(errors.map(({message}) => message)).toContain('tinybase:15:client');
  expect(webSocket.closeCalls).toBe(1);

  await filesSynchronizer.destroy();
  await editorSynchronizer.destroy();
});

test('closed and backpressured WebSockets settle creation', async () => {
  const closedWebSocket = new MockWebSocket();
  closedWebSocket.readyState = closedWebSocket.CLOSED;
  await expect(
    createWsSynchronizer(
      createMergeableStore(),
      closedWebSocket as any,
      'files',
    ),
  ).rejects.toThrow('tinybase:5');

  const legacyWebSocket = new MockWebSocket();
  legacyWebSocket.readyState = legacyWebSocket.CLOSED;
  await expect(
    createWsSynchronizer(createMergeableStore(), legacyWebSocket as any),
  ).rejects.toThrow('tinybase:5');

  const errors: Error[] = [];
  const backpressuredWebSocket = new MockWebSocket();
  backpressuredWebSocket.bufferedAmount = 16_777_216;
  await expect(
    createWsSynchronizer(
      createMergeableStore(),
      backpressuredWebSocket as any,
      'files',
      1,
      undefined,
      undefined,
      (error) => errors.push(error),
    ),
  ).rejects.toThrow('tinybase:15:socket');
  expect(errors.map(({message}) => message)).toContain('tinybase:15:socket');
  expect(backpressuredWebSocket.closeCalls).toBe(1);
});

test('legacy and multiple modes cannot share one WebSocket', async () => {
  const multipleWebSocket = new MockWebSocket();
  const multipleSynchronizer = await createWsSynchronizer(
    createMergeableStore(),
    multipleWebSocket as any,
    'files',
    0.01,
  );
  await expect(
    createWsSynchronizer(
      createMergeableStore(),
      multipleWebSocket as any,
      0.01,
    ),
  ).rejects.toThrow('tinybase:10');
  await multipleSynchronizer.destroy();

  const legacyWebSocket = new MockWebSocket();
  const legacySynchronizer = await createWsSynchronizer(
    createMergeableStore(),
    legacyWebSocket as any,
    0.01,
  );
  await expect(
    createWsSynchronizer(
      createMergeableStore(),
      legacyWebSocket as any,
      'files',
      0.01,
    ),
  ).rejects.toThrow('tinybase:9');
  await legacySynchronizer.destroy();
});

test('multiple stores synchronize over one WebSocket', async () => {
  const createdPaths: string[] = [];
  const wsServer = createWsServer(
    new WebSocketServer({port: 8055}),
    (pathId) => {
      createdPaths.push(pathId);
      return undefined;
    },
  );
  const webSocket1 = new WebSocket('ws://localhost:8055/project', 'tinybase');
  const webSocket2 = new WebSocket('ws://localhost:8055/project', 'tinybase');
  const filesStore1 = createMergeableStore('files1', getNow);
  const filesStore2 = createMergeableStore('files2', getNow);
  const editorStore1 = createMergeableStore('editor1', getNow);
  const editorStore2 = createMergeableStore('editor2', getNow);

  const filesSynchronizer1 = await createWsSynchronizer(
    filesStore1,
    webSocket1,
    'files',
    1,
    undefined,
    undefined,
    undefined,
    12,
  );
  const editorSynchronizer1 = await createWsSynchronizer(
    editorStore1,
    webSocket1,
    'editor',
  );
  const filesSynchronizer2 = await createWsSynchronizer(
    filesStore2,
    webSocket2,
    'files',
  );
  const editorSynchronizer2 = await createWsSynchronizer(
    editorStore2,
    webSocket2,
    'editor',
  );

  await Promise.all([
    filesSynchronizer1.startSync(),
    editorSynchronizer1.startSync(),
    filesSynchronizer2.startSync(),
    editorSynchronizer2.startSync(),
  ]);
  filesStore1.setCell('files', 'f1', 'name', 'a-very-long-pets-file-name.json');
  editorStore2.setValue('selection', 'fido');
  await pause();

  expect(filesStore2.getTables()).toEqual({
    files: {f1: {name: 'a-very-long-pets-file-name.json'}},
  });
  expect(editorStore1.getValues()).toEqual({selection: 'fido'});
  expect(filesStore1.getValues()).toEqual({});
  expect(editorStore2.getTables()).toEqual({});
  expect(wsServer.getPathIds().toSorted()).toEqual([
    'project/editor',
    'project/files',
  ]);
  expect(wsServer.getStats()).toEqual({clients: 4, paths: 2});
  expect(wsServer.getWebSocketServer().clients.size).toBe(2);
  expect(createdPaths.toSorted()).toEqual(['project/editor', 'project/files']);

  await filesSynchronizer1.destroy();
  await editorSynchronizer1.destroy();
  await pause();
  expect(wsServer.getStats()).toEqual({clients: 2, paths: 2});
  await filesSynchronizer2.destroy();
  await editorSynchronizer2.destroy();
  await pause();
  expect(wsServer.getStats()).toEqual({clients: 0, paths: 0});
  await wsServer.destroy();
});

test('multiplexed and legacy clients share a logical path', async () => {
  const wsServer = createWsServer(new WebSocketServer({port: 8056}));
  const multiplexStore = createMergeableStore('multiple', getNow);
  const legacyStore = createMergeableStore('legacy', getNow);
  const multiplexSynchronizer = await createWsSynchronizer(
    multiplexStore,
    new WebSocket('ws://localhost:8056/project', 'tinybase'),
    'files',
  );
  const legacySynchronizer = await createWsSynchronizer(
    legacyStore,
    new WebSocket('ws://localhost:8056/project/files'),
  );

  await Promise.all([
    multiplexSynchronizer.startSync(),
    legacySynchronizer.startSync(),
  ]);
  multiplexStore.setCell('files', 'f1', 'name', 'pets.json');
  legacyStore.setCell('files', 'f2', 'name', 'people.json');
  await pause();

  expect(multiplexStore.getTables()).toEqual({
    files: {
      f1: {name: 'pets.json'},
      f2: {name: 'people.json'},
    },
  });
  expect(legacyStore.getTables()).toEqual(multiplexStore.getTables());
  expect(wsServer.getStats()).toEqual({clients: 2, paths: 1});

  await multiplexSynchronizer.destroy();
  await legacySynchronizer.destroy();
  await wsServer.destroy();
});

test('multiplexing fails cleanly against a legacy server', async () => {
  const legacyServer = new WebSocketServer({port: 8057});
  legacyServer.on('connection', (client) => client.on('message', () => {}));
  const webSocket = new WebSocket('ws://localhost:8057', 'tinybase');

  await expect(
    createWsSynchronizer(createMergeableStore(), webSocket, 'files', 0.01),
  ).rejects.toThrow('tinybase:4');
  expect([WebSocket.CLOSING, WebSocket.CLOSED]).toContain(webSocket.readyState);

  await new Promise<void>((resolve) => legacyServer.close(() => resolve()));
});
