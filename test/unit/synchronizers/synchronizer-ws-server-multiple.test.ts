import {createMergeableStore} from 'tinybase';
import {createCustomPersister, Persists} from 'tinybase/persisters';
import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
import {expect, test, vi} from 'vitest';
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
  onRemove?: () => void;
  onSend?: (payload: string) => void;
  readonly #listeners: {[event: string]: ((event: any) => void)[]} = {};

  addEventListener(event: string, listener: (event: any) => void): void {
    (this.#listeners[event] ??= []).push(listener);
  }

  removeEventListener(event: string, listener: (event: any) => void): void {
    this.onRemove?.();
    this.#listeners[event] = (this.#listeners[event] ?? []).filter(
      (testListener) => testListener != listener,
    );
  }

  send(payload: string): void {
    this.onSend?.(payload);
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

  listenerCount(event: string): number {
    return this.#listeners[event]?.length ?? 0;
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

test('oversized multiplexed traffic is reported and disconnected', async () => {
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

  webSocket.receive('S\n["request",-1,[0,1]]' + ' '.repeat(16_777_216));

  expect(errors.map(({message}) => message)).toEqual(['tinybase:15:socket']);
  expect(webSocket.closeCalls).toBe(1);

  await synchronizer.destroy();
});

test('oversized multiplexed clients do not affect other clients', async () => {
  const errors: Error[] = [];
  const server = createWsServer(
    new WebSocketServer({port: 8058}),
    undefined,
    (error) => errors.push(error),
  );
  const attacker = new WebSocket('ws://localhost:8058', 'tinybase');
  const otherClient = new WebSocket('ws://localhost:8058', 'tinybase');
  await Promise.all(
    [attacker, otherClient].map(
      (webSocket) =>
        new Promise<void>((resolve) => webSocket.on('open', () => resolve())),
    ),
  );
  const closed = new Promise<void>((resolve) =>
    attacker.on('close', () => resolve()),
  );

  attacker.send('S\n["request",-1,[0,1]]' + ' '.repeat(16_777_216));
  await closed;
  await pause();

  expect(errors.map(({message}) => message)).toEqual(['tinybase:15:socket']);
  expect(otherClient.readyState).toBe(WebSocket.OPEN);
  expect(server.getStats()).toEqual({clients: 0, paths: 0});

  otherClient.close();
  await server.destroy();
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

test('transport failure rejects pending synchronization requests', async () => {
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

  const syncing = synchronizer.startSync();
  await new Promise((resolve) => setTimeout(resolve));
  expect(
    webSocket.sentPayloads.some((payload) =>
      payload.startsWith('M\nfiles\n\n'),
    ),
  ).toBe(true);
  webSocket.disconnect();
  await syncing;
  expect(errors.map(({message}) => message)).toEqual([
    'tinybase:5',
    'tinybase:5',
  ]);

  await synchronizer.destroy();
  expect(webSocket.listenerCount('message')).toBe(0);
  expect(webSocket.listenerCount('open')).toBe(0);
  expect(webSocket.listenerCount('close')).toBe(0);
  expect(webSocket.listenerCount('error')).toBe(0);
  expect(webSocket.closeCalls).toBe(1);
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

test('queued multiplexed responses flush in batches', async () => {
  const webSocket = new MockWebSocket();
  const synchronizer = await createWsSynchronizer(
    createMergeableStore().setCell(
      'pets',
      'fido',
      'description',
      'a'.repeat(100),
    ),
    webSocket as any,
    'files',
    1,
    undefined,
    undefined,
    undefined,
    12,
  );

  webSocket.disconnect();
  webSocket.receive('M\nfiles\nremote\n["queued1",4,{}]');
  webSocket.receive('M\nfiles\nremote\n["queued2",4,{}]');
  const sentBeforeReconnect = webSocket.sentPayloads.length;
  webSocket.reconnect();
  await new Promise((resolve) => setTimeout(resolve));

  const flushed = webSocket.sentPayloads
    .slice(sentBeforeReconnect)
    .filter((payload) => payload.startsWith('M\nfiles\nremote\n'))
    .join('');
  expect(flushed.match(/queued1/g)).toHaveLength(1);
  expect(flushed.match(/queued2/g)).toHaveLength(1);
  expect(flushed.indexOf('queued1')).toBeLessThan(flushed.indexOf('queued2'));

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

test('throwing channel error handlers do not interrupt overflow cleanup', async () => {
  vi.useFakeTimers();
  try {
    const handledErrors: Error[] = [];
    const webSocket = new MockWebSocket();
    const filesSynchronizer = await createWsSynchronizer(
      createMergeableStore(),
      webSocket as any,
      'files',
      1,
      undefined,
      undefined,
      () => {
        throw new Error('handler');
      },
    );
    webSocket.onSend = (payload) => {
      if (payload.includes('-1,[1,"editor"]')) {
        for (let request = 0; request < 1_001; request++) {
          webSocket.receive(
            'M\neditor\nremote\n["request' + request + '",4,{}]',
          );
        }
      }
    };

    await expect(
      createWsSynchronizer(
        createMergeableStore(),
        webSocket as any,
        'editor',
        1,
        undefined,
        undefined,
        (error) => handledErrors.push(error),
      ),
    ).rejects.toThrow('tinybase:15:client');

    expect(handledErrors.map(({message}) => message)).toEqual([
      'tinybase:15:client',
    ]);
    expect(vi.getTimerCount()).toBe(0);
    expect(webSocket.closeCalls).toBe(1);

    await filesSynchronizer.destroy();
    expect(webSocket.listenerCount('message')).toBe(0);
    expect(webSocket.listenerCount('open')).toBe(0);
    expect(webSocket.listenerCount('close')).toBe(0);
    expect(webSocket.listenerCount('error')).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});

test('throwing channel error handlers do not interrupt close cleanup', async () => {
  const handledErrors: Error[] = [];
  const webSocket = new MockWebSocket();
  const filesSynchronizer = await createWsSynchronizer(
    createMergeableStore(),
    webSocket as any,
    'files',
    0.01,
    undefined,
    undefined,
    () => {
      throw new Error('handler');
    },
  );
  const editorSynchronizer = await createWsSynchronizer(
    createMergeableStore(),
    webSocket as any,
    'editor',
    0.01,
    undefined,
    undefined,
    (error) => handledErrors.push(error),
  );
  const subscriptionsBeforeClose = webSocket.sentPayloads.filter((payload) =>
    payload.includes('-1,[1,'),
  ).length;

  expect(() => webSocket.disconnect()).not.toThrow();
  expect(handledErrors.map(({message}) => message)).toEqual(['tinybase:5']);
  webSocket.reconnect();
  await new Promise((resolve) => setTimeout(resolve));
  expect(
    webSocket.sentPayloads.filter((payload) => payload.includes('-1,[1,')),
  ).toHaveLength(subscriptionsBeforeClose + 2);

  await filesSynchronizer.destroy();
  await editorSynchronizer.destroy();
});

test('failed multiplexed control sends release their pending state', async () => {
  vi.useFakeTimers();
  try {
    const sendError = new Error('send');
    const webSocket = new MockWebSocket();
    const filesSynchronizer = await createWsSynchronizer(
      createMergeableStore(),
      webSocket as any,
      'files',
    );
    webSocket.onSend = (payload) => {
      if (payload.includes('-1,[1,"editor"]')) {
        throw sendError;
      }
    };

    await expect(
      createWsSynchronizer(createMergeableStore(), webSocket as any, 'editor'),
    ).rejects.toBe(sendError);
    expect(vi.getTimerCount()).toBe(0);

    await filesSynchronizer.destroy();
    expect(webSocket.listenerCount('message')).toBe(0);
    expect(webSocket.listenerCount('open')).toBe(0);
    expect(webSocket.listenerCount('close')).toBe(0);
    expect(webSocket.listenerCount('error')).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});

test('failed unsubscribe sends still destroy their channel', async () => {
  const sendError = new Error('send');
  let handled = 0;
  const webSocket = new MockWebSocket();
  const synchronizer = await createWsSynchronizer(
    createMergeableStore(),
    webSocket as any,
    'files',
    1,
    undefined,
    undefined,
    () => {
      handled++;
      throw new Error('handler');
    },
  );
  webSocket.onSend = (payload) => {
    if (payload.includes('-1,[2,"files"]')) {
      throw sendError;
    }
  };

  await expect(synchronizer.destroy()).resolves.toBe(synchronizer);
  expect(handled).toBe(1);
  expect(webSocket.closeCalls).toBe(1);
  expect(webSocket.listenerCount('message')).toBe(0);
  expect(webSocket.listenerCount('open')).toBe(0);
  expect(webSocket.listenerCount('close')).toBe(0);
  expect(webSocket.listenerCount('error')).toBe(0);
});

test('queued send failures disconnect without escaping the flush', async () => {
  const sendError = new Error('send');
  const errors: any[] = [];
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

  webSocket.disconnect();
  errors.length = 0;
  const syncing = synchronizer.startSync();
  webSocket.onSend = (payload) => {
    if (payload.startsWith('M\nfiles\n')) {
      throw sendError;
    }
  };
  expect(() => webSocket.reconnect()).not.toThrow();
  await syncing;

  expect(errors).toContain(sendError);
  expect(errors.map((error) => error.message)).toContain('tinybase:5');
  expect(webSocket.closeCalls).toBe(1);
  await synchronizer.destroy();
});

test('throwing listener removers cannot strand multiplexed state', async () => {
  const webSocket = new MockWebSocket();
  const synchronizer = await createWsSynchronizer(
    createMergeableStore(),
    webSocket as any,
    'files',
  );
  webSocket.onRemove = () => {
    throw new Error('remove');
  };

  await expect(synchronizer.destroy()).resolves.toBe(synchronizer);
  webSocket.onRemove = undefined;
  await expect(
    createWsSynchronizer(createMergeableStore(), webSocket as any),
  ).rejects.toThrow('tinybase:5');
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
  expect(legacyWebSocket.listenerCount('message')).toBe(0);
  expect(legacyWebSocket.listenerCount('open')).toBe(0);
  expect(legacyWebSocket.listenerCount('close')).toBe(0);
  expect(legacyWebSocket.listenerCount('error')).toBe(0);

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

test('legacy creation errors reject and remove all listeners', async () => {
  const error = new Error('connection');
  const errors: Error[] = [];
  const webSocket = new MockWebSocket();
  webSocket.readyState = 0;
  const creation = createWsSynchronizer(
    createMergeableStore(),
    webSocket as any,
    1,
    undefined,
    undefined,
    (error) => errors.push(error),
  );
  const rejection = expect(creation).rejects.toThrow('tinybase:5');

  webSocket.error(error);
  await rejection;

  expect(errors).toEqual([error]);
  expect(webSocket.closeCalls).toBe(1);
  expect(webSocket.listenerCount('message')).toBe(0);
  expect(webSocket.listenerCount('open')).toBe(0);
  expect(webSocket.listenerCount('close')).toBe(0);
  expect(webSocket.listenerCount('error')).toBe(0);
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

test('failed unsubscribe cleanup allows resubscription', async () => {
  const cleanupError = new Error('cleanup');
  const handlerError = new Error('handler');
  const errors: Error[] = [];
  let filesAttempts = 0;
  let filesStore = createMergeableStore();
  let markSecondReady = () => {};
  let releaseCleanup = () => {};
  const secondReady = new Promise<void>(
    (resolve) => (markSecondReady = resolve),
  );
  const cleanupGate = new Promise<void>(
    (resolve) => (releaseCleanup = resolve),
  );
  const wsServer = createWsServer(
    new WebSocketServer({port: 8067}),
    ((pathId: string) => {
      if (pathId == 'project/files') {
        const failDestroy = ++filesAttempts == 1;
        const store = (filesStore = createMergeableStore());
        const persister = (createCustomPersister as any)(
          store,
          async () => undefined,
          async () => {},
          () => 0,
          () => {},
          undefined,
          Persists.MergeableStoreOnly,
          {
            destroy: async () => {
              if (failDestroy) {
                await cleanupGate;
                throw cleanupError;
              }
            },
          },
        );
        return [persister, failDestroy ? () => {} : markSecondReady];
      }
    }) as any,
    (error) => {
      errors.push(error);
      throw handlerError;
    },
    0.05,
  );
  const webSocket = new WebSocket('ws://localhost:8067/project', 'tinybase');
  const filesSynchronizer1 = await createWsSynchronizer(
    createMergeableStore(),
    webSocket,
    'files',
  );
  expect(filesAttempts).toBe(1);
  const editorSynchronizer = await createWsSynchronizer(
    createMergeableStore(),
    webSocket,
    'editor',
  );
  await filesSynchronizer1.startSync();

  await filesSynchronizer1.destroy();
  const clientStore = createMergeableStore();
  const filesSynchronizer2Promise = createWsSynchronizer(
    clientStore,
    webSocket,
    'files',
  );
  await pause();
  const attemptsBeforeCleanup = filesAttempts;
  releaseCleanup();
  expect(attemptsBeforeCleanup).toBe(2);
  const filesSynchronizer2 = await filesSynchronizer2Promise;
  await pause();

  expect(errors).toContain(cleanupError);
  expect(wsServer.getPathIds().toSorted()).toEqual([
    'project/editor',
    'project/files',
  ]);

  const secondStart = filesSynchronizer2.startSync();
  await secondReady;
  await secondStart;
  clientStore.setValue('selection', 'fido');
  await pause();

  expect(wsServer.getPathIds().toSorted()).toEqual([
    'project/editor',
    'project/files',
  ]);
  expect(filesStore.getValue('selection')).toBe('fido');

  await filesSynchronizer2.destroy();
  await editorSynchronizer.destroy();
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
