import {createMergeableStore} from 'tinybase';
import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
import {expect, test} from 'vitest';
import {WebSocket, WebSocketServer} from 'ws';
import {getTimeFunctions} from '../common/mergeable.ts';

const [, getNow, pause] = getTimeFunctions();

class MockWebSocket {
  OPEN = 1;
  readyState = this.OPEN;
  sentPayloads: string[] = [];
  closeCalls = 0;
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
      if (message == -1 && controlAndBody[0] != 2) {
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

  webSocket.receive('M\nfiles\nremote\n[null,99,null]');
  expect(filesReceives).toEqual([['remote', null, 99, null]]);
  expect(editorReceives).toEqual([]);

  await filesSynchronizer.destroy();
  expect(webSocket.closeCalls).toBe(0);
  expect(webSocket.sentPayloads.at(-1)).toContain('-1,[2,"files"]]');

  await editorSynchronizer.destroy();
  expect(webSocket.closeCalls).toBe(1);
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
  filesStore.setValue('updatedWhileOffline', true);
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

  await Promise.all(
    synchronizers.map((synchronizer) => synchronizer.destroy()),
  );
  expect(webSocket.closeCalls).toBe(1);
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
