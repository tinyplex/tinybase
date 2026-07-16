import {once} from 'events';
import {readFileSync, writeFileSync} from 'fs';
import {join} from 'path';
import type {Id, MergeableStore} from 'tinybase';
import {createMergeableStore} from 'tinybase';
import {createFilePersister} from 'tinybase/persisters/persister-file';
import {Message} from 'tinybase/synchronizers';
import * as WsClient from 'tinybase/synchronizers/synchronizer-ws-client';
import type {WsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
import tmp from 'tmp';
import {afterEach, beforeEach, describe, expect, test} from 'vitest';
import {WebSocket, WebSocketServer} from 'ws';
import {getTimeFunctions} from '../common/mergeable.ts';

const [reset, getNow, pause] = getTimeFunctions();
const {createWsSynchronizer} = WsClient;

class MockWebSocket {
  OPEN = 1;
  readyState = this.OPEN;
  sentPayloads: string[] = [];
  closeCalls = 0;
  closeCode: number | undefined;
  closeReason: string | undefined;
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
  }

  receive(payload: string): void {
    (this.#listeners.message ?? []).forEach((listener) =>
      listener({data: payload}),
    );
  }

  close(code?: number, reason?: string): void {
    this.closeCalls++;
    this.closeCode = code;
    this.closeReason = reason;
    this.readyState = 3;
  }
}

const getFragments = (payloads: string[]): string[] =>
  payloads.map(
    (payload) => payload.match(/^[^\n]*\n.+\n\d+\n\d+\n([\s\S]*)$/)?.[1] ?? '',
  );

const getFragmentGroup = (
  payloads: string[],
  contains: string,
): string[] | undefined => {
  const groups = new Map<string, string[]>();
  payloads.forEach((payload) => {
    const [, messageId] = payload.match(/^[^\n]*\n(.+)\n\d+\n\d+\n/) ?? [];
    if (messageId) {
      (groups.get(messageId) ?? groups.set(messageId, []).get(messageId))?.push(
        payload,
      );
    }
  });
  return [...groups.values()].find(
    (group) =>
      group.length > 1 && getFragments(group).join('').includes(contains),
  );
};

const getPayloadFromClient = (clientId: string, payload: string) =>
  clientId + payload.slice(payload.indexOf('\n'));

const getPromiseResolvers = <Value = void>() => {
  let resolve: (value: Value) => void;
  let reject: (error: any) => void;
  const promise = new Promise<Value>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return [promise, resolve!, reject!] as const;
};

const openWebSocket = async (pathId: Id, port: number): Promise<WebSocket> => {
  const webSocket = new WebSocket('ws://localhost:' + port + '/' + pathId);
  await once(webSocket, 'open');
  return webSocket;
};

const closeWebSocket = async (webSocket: WebSocket) => {
  if (webSocket.readyState != WebSocket.CLOSED) {
    const closed = once(webSocket, 'close');
    webSocket.close();
    await closed;
  }
};

const createTestPersister = (
  startAutoLoad: () => Promise<void> = async () => {},
  destroy: () => Promise<void> = async () => {},
) => {
  const store = createMergeableStore();
  return {
    destroy,
    getStore: () => store,
    startAutoLoad,
    startAutoSave: async () => {},
  } as any;
};

beforeEach(() => {
  reset();
});

test('malformed websocket traffic is reported and disconnected', async () => {
  for (const payload of [
    'peer\n{',
    'peer\n[null,2,[0,0],"extra"]',
    'peer\n[null,2,{}]',
    'peer\n[null,3,[[{},"invalid"],[{},"invalid"],1]]',
    'peer\n[null,4,null]',
    'peer\n[null,99,null]',
    'peer\n0123456789ABCDEF\n0\n1000001\nx',
  ]) {
    const errors: Error[] = [];
    const received: any[] = [];
    const webSocket = new MockWebSocket();
    const synchronizer = await createWsSynchronizer(
      createMergeableStore(),
      webSocket as any,
      1,
      undefined,
      (...args) => received.push(args),
      (error) => errors.push(error),
    );

    expect(() => webSocket.receive(payload)).not.toThrow();
    expect(received).toEqual([]);
    expect(errors.map(({message}) => message)).toEqual(['tinybase:14']);
    expect(webSocket.closeCalls).toBe(1);
    expect(webSocket.closeCode).toBe(1007);
    expect(webSocket.closeReason).toBe('tinybase:14');

    await synchronizer.destroy();
  }
});

test('malformed websocket traffic is not relayed', async () => {
  const errors: Error[] = [];
  const server = createWsServer(
    new WebSocketServer({port: 8049}),
    undefined,
    (error) => errors.push(error),
  );
  const attacker = new WebSocket('ws://localhost:8049');
  const otherClient = new WebSocket('ws://localhost:8049');
  const received: any[] = [];
  otherClient.on('message', (message) => received.push(message));
  await Promise.all(
    [attacker, otherClient].map(
      (webSocket) =>
        new Promise<void>((resolve) => webSocket.on('open', () => resolve())),
    ),
  );
  const closed = new Promise<void>((resolve) =>
    attacker.on('close', () => resolve()),
  );

  attacker.send('\n0123456789ABCDEF\n0\n1\n{');
  await closed;
  await pause();

  expect(errors.map(({message}) => message)).toEqual(['tinybase:14']);
  expect(received).toEqual([]);
  expect(otherClient.readyState).toBe(WebSocket.OPEN);
  expect(server.getStats()).toEqual({clients: 1, paths: 1});

  otherClient.close();
  await server.destroy();
});

test('Basics', async () => {
  const wsServer = createWsServer(new WebSocketServer({port: 8049}));

  const s1 = createMergeableStore('s1', getNow);
  const synchronizer1 = await createWsSynchronizer(
    s1,
    new WebSocket('ws://localhost:8049'),
  );
  await synchronizer1.startSync();
  s1.setCell('t1', 'r1', 'c1', 4);

  const s2 = createMergeableStore('s2', getNow);
  const synchronizer2 = await createWsSynchronizer(
    s2,
    new WebSocket('ws://localhost:8049'),
  );
  await synchronizer2.startSync();
  s2.setCell('t1', 'r2', 'price', 5);

  await pause();

  expect(s1.getTables()).toEqual({
    t1: {r2: {price: 5}, r1: {c1: 4}},
  });
  expect(s2.getTables()).toEqual({
    t1: {r2: {price: 5}, r1: {c1: 4}},
  });

  await synchronizer1.destroy();
  await synchronizer2.destroy();
  await wsServer.destroy();
});

test('fragmented websocket payloads can arrive out of order', async () => {
  const received: any[] = [];
  const sourceStore = createMergeableStore('s1', getNow);
  const targetStore = createMergeableStore('s2', getNow);
  const sourceSocket = new MockWebSocket();
  const targetSocket = new MockWebSocket();
  const synchronizer1 = await createWsSynchronizer(
    sourceStore,
    sourceSocket as any,
    1,
    undefined,
    undefined,
    undefined,
    12,
  );
  const synchronizer2 = await createWsSynchronizer(
    targetStore,
    targetSocket as any,
    1,
    undefined,
    (...args) => received.push(args),
    undefined,
    12,
  );

  try {
    await synchronizer1.startSync();
    await synchronizer2.startSync();
    sourceStore.setCell('t1', 'r1', 'c1', 'abcdefghijklmnopqrstuvwxyz');
    await pause();

    const fragmentGroup =
      getFragmentGroup(
        sourceSocket.sentPayloads,
        'abcdefghijklmnopqrstuvwxyz',
      ) ?? [];
    expect(fragmentGroup.length).toBeGreaterThan(1);
    fragmentGroup
      .toReversed()
      .forEach((payload) =>
        targetSocket.receive(getPayloadFromClient('s1', payload)),
      );

    expect(
      received.some(
        ([fromClientId, , message, body]) =>
          fromClientId == 's1' &&
          message == Message.ContentDiff &&
          JSON.stringify(body).includes('abcdefghijklmnopqrstuvwxyz'),
      ),
    ).toBe(true);
  } finally {
    await synchronizer1.destroy();
    await synchronizer2.destroy();
  }
});

test('incomplete fragmented websocket buffers expire', async () => {
  const received: any[] = [];
  const sourceStore = createMergeableStore('s1', getNow);
  const targetStore = createMergeableStore('s2', getNow);
  const sourceSocket = new MockWebSocket();
  const targetSocket = new MockWebSocket();
  const synchronizer1 = await createWsSynchronizer(
    sourceStore,
    sourceSocket as any,
    1,
    undefined,
    undefined,
    undefined,
    12,
  );
  const synchronizer2 = await createWsSynchronizer(
    targetStore,
    targetSocket as any,
    0.01,
    undefined,
    (...args) => received.push(args),
    undefined,
    12,
  );

  try {
    await synchronizer1.startSync();
    sourceStore.setCell('t1', 'r1', 'c1', 'abcdefghijklmnopqrstuvwxyz');
    await pause();

    const fragmentGroup =
      getFragmentGroup(
        sourceSocket.sentPayloads,
        'abcdefghijklmnopqrstuvwxyz',
      ) ?? [];
    expect(fragmentGroup.length).toBeGreaterThan(1);
    const receivePayload = (payload: string) =>
      targetSocket.receive(getPayloadFromClient('s1', payload));
    const receiveFirstFragment = () => receivePayload(fragmentGroup[0]);
    const receiveRestOfFragments = () =>
      fragmentGroup.slice(1).forEach(receivePayload);
    const hasReceivedContentDiff = () =>
      received.some(
        ([fromClientId, , message, body]) =>
          fromClientId == 's1' &&
          message == Message.ContentDiff &&
          JSON.stringify(body).includes('abcdefghijklmnopqrstuvwxyz'),
      );

    receiveFirstFragment();
    await pause(20);
    expect(hasReceivedContentDiff()).toBe(false);

    receiveRestOfFragments();
    await pause(20);
    expect(hasReceivedContentDiff()).toBe(false);

    receiveFirstFragment();
    await pause(20);
    expect(hasReceivedContentDiff()).toBe(false);

    receiveRestOfFragments();
    await pause(20);
    expect(hasReceivedContentDiff()).toBe(false);
  } finally {
    await synchronizer1.destroy();
    await synchronizer2.destroy();
  }
});

test('fragmented websocket payloads', async () => {
  const sentPayloads: string[] = [];
  const wsServer = createWsServer(new WebSocketServer({port: 8049}));
  let synchronizer1: WsClient.WsSynchronizer<WebSocket> | undefined;
  let synchronizer2: WsClient.WsSynchronizer<WebSocket> | undefined;
  const s1 = createMergeableStore('s1', getNow);
  const s2 = createMergeableStore('s2', getNow);
  s1.setCell('t1', 'r1', 'c1', 'abcdefghijklmnopqrstuvwxyz');

  const webSocket1 = new WebSocket('ws://localhost:8049');
  const send1 = webSocket1.send.bind(webSocket1);
  webSocket1.send = ((payload: string) => {
    sentPayloads.push(payload);
    return send1(payload);
  }) as any;

  try {
    synchronizer1 = await createWsSynchronizer(
      s1,
      webSocket1,
      1,
      undefined,
      undefined,
      undefined,
      20,
    );
    await synchronizer1.startSync();

    synchronizer2 = await createWsSynchronizer(
      s2,
      new WebSocket('ws://localhost:8049'),
      1,
      undefined,
      undefined,
      undefined,
      20,
    );
    await synchronizer2.startSync();
    await pause();

    expect(sentPayloads.some((payload) => payload.split('\n').length > 2)).toBe(
      true,
    );
    expect(s2.getTables()).toEqual({
      t1: {r1: {c1: 'abcdefghijklmnopqrstuvwxyz'}},
    });
  } finally {
    await synchronizer1?.destroy();
    await synchronizer2?.destroy();
    await wsServer.destroy();
  }
});

test('fragmented websocket payloads preserve Unicode', async () => {
  const fragmentSize = 5;
  // This four-code-unit pattern walks the emoji before, across, and after each
  // five-code-unit boundary.
  const unicodeValue = 'a😀b'.repeat(8);
  const sentPayloads: string[] = [];
  const wsServer = createWsServer(new WebSocketServer({port: 8049}));
  let synchronizer1: WsClient.WsSynchronizer<WebSocket> | undefined;
  let synchronizer2: WsClient.WsSynchronizer<WebSocket> | undefined;
  const s1 = createMergeableStore('s1', getNow);
  const s2 = createMergeableStore('s2', getNow);
  s1.setCell('t1', 'r1', 'c1', unicodeValue);

  const webSocket1 = new WebSocket('ws://localhost:8049');
  const send1 = webSocket1.send.bind(webSocket1);
  webSocket1.send = ((payload: string) => {
    sentPayloads.push(payload);
    return send1(payload);
  }) as any;

  try {
    synchronizer1 = await createWsSynchronizer(
      s1,
      webSocket1,
      1,
      undefined,
      undefined,
      undefined,
      fragmentSize,
    );
    await synchronizer1.startSync();

    synchronizer2 = await createWsSynchronizer(
      s2,
      new WebSocket('ws://localhost:8049'),
      1,
      undefined,
      undefined,
      undefined,
      fragmentSize,
    );
    await synchronizer2.startSync();
    await pause();

    const fragmentGroup = getFragmentGroup(sentPayloads, unicodeValue) ?? [];
    expect(fragmentGroup.length).toBeGreaterThan(1);
    expect(
      getFragments(fragmentGroup).every(
        (fragment) => new TextEncoder().encode(fragment).length <= fragmentSize,
      ),
    ).toBe(true);
    expect(s2.getCell('t1', 'r1', 'c1')).toBe(unicodeValue);
  } finally {
    await synchronizer1?.destroy();
    await synchronizer2?.destroy();
    await wsServer.destroy();
  }
});

describe('Multiple connections', () => {
  let wssServer: WebSocketServer;
  let wsServer: WsServer;
  let synchronizer1: WsClient.WsSynchronizer<WebSocket>;
  let synchronizer2: WsClient.WsSynchronizer<WebSocket>;
  let synchronizer3: WsClient.WsSynchronizer<WebSocket>;

  beforeEach(async () => {
    wssServer = new WebSocketServer({port: 8049});
    wsServer = createWsServer(wssServer);
  });

  afterEach(async () => {
    await synchronizer1.destroy();
    await synchronizer2.destroy();
    await synchronizer3.destroy();
    await wsServer.destroy();
  });

  test('Accessors', async () => {
    synchronizer1 = await (
      await createWsSynchronizer(
        createMergeableStore('s1', getNow),
        new WebSocket('ws://localhost:8049/p1'),
      )
    ).startSync();
    synchronizer2 = await (
      await createWsSynchronizer(
        createMergeableStore('s2', getNow),
        new WebSocket('ws://localhost:8049/p1'),
      )
    ).startSync();
    synchronizer3 = await (
      await createWsSynchronizer(
        createMergeableStore('s3', getNow),
        new WebSocket('ws://localhost:8049/p2'),
      )
    ).startSync();
    expect(wsServer.getWebSocketServer()).toEqual(wssServer);
    expect(wsServer.getPathIds()).toEqual(['p1', 'p2']);
    expect(wsServer.getClientIds('p1').length).toEqual(2);
    expect(wsServer.getClientIds('p2').length).toEqual(1);
    expect(wsServer.getClientIds('p3')).toEqual([]);
    expect(wsServer.getStats()).toEqual({clients: 3, paths: 2});
  });

  test('Listeners', async () => {
    const pathIdsLog: {[pathId: string]: -1 | 1}[] = [];
    wsServer.addPathIdsListener((server, pathId, addedOrRemoved) => {
      expect(server).toEqual(wsServer);
      pathIdsLog.push({[pathId]: addedOrRemoved});
    });

    const allClientIdsLog: {[pathId: string]: {[clientId: string]: -1 | 1}}[] =
      [];
    wsServer.addClientIdsListener(
      null,
      (server, pathId, clientId, addedOrRemoved) => {
        expect(server).toEqual(wsServer);
        allClientIdsLog.push({[pathId]: {[clientId]: addedOrRemoved}});
      },
    );

    const clientIdsLog1: {[pathId: string]: {[clientId: string]: -1 | 1}}[] =
      [];
    wsServer.addClientIdsListener(
      'p1',
      (server, pathId, clientId, addedOrRemoved) => {
        expect(server).toEqual(wsServer);
        clientIdsLog1.push({[pathId]: {[clientId]: addedOrRemoved}});
      },
    );

    const clientIdsLog2: {[pathId: string]: {[clientId: string]: -1 | 1}}[] =
      [];
    const listenerId = wsServer.addClientIdsListener(
      'p2',
      (server, pathId, clientId, addedOrRemoved) => {
        expect(server).toEqual(wsServer);
        clientIdsLog2.push({[pathId]: {[clientId]: addedOrRemoved}});
      },
    );

    synchronizer1 = await (
      await createWsSynchronizer(
        createMergeableStore('s1', getNow),
        new WebSocket('ws://localhost:8049/p1'),
      )
    ).startSync();
    synchronizer2 = await (
      await createWsSynchronizer(
        createMergeableStore('s2', getNow),
        new WebSocket('ws://localhost:8049/p1'),
      )
    ).startSync();
    synchronizer3 = await (
      await createWsSynchronizer(
        createMergeableStore('s3', getNow),
        new WebSocket('ws://localhost:8049/p2'),
      )
    ).startSync();

    const [c1, c2] = wsServer.getClientIds('p1');
    const [c3] = wsServer.getClientIds('p2');

    wsServer.delListener(listenerId);

    synchronizer1.getWebSocket().close();
    await pause();
    synchronizer2.getWebSocket().close();
    await pause();
    synchronizer3.getWebSocket().close();
    await pause();

    expect(pathIdsLog).toEqual([{p1: 1}, {p2: 1}, {p1: -1}, {p2: -1}]);
    expect(allClientIdsLog).toEqual([
      {p1: {[c1]: 1}},
      {p1: {[c2]: 1}},
      {p2: {[c3]: 1}},
      {p1: {[c1]: -1}},
      {p1: {[c2]: -1}},
      {p2: {[c3]: -1}},
    ]);
    expect(clientIdsLog1).toEqual([
      {p1: {[c1]: 1}},
      {p1: {[c2]: 1}},
      {p1: {[c1]: -1}},
      {p1: {[c2]: -1}},
    ]);
    expect(clientIdsLog2).toEqual([{p2: {[c3]: 1}}]);
  });
});

describe('Lifecycle', () => {
  test('failed setup can be retried', async () => {
    const port = 8059;
    const setupError = new Error('setup');
    const errors: Error[] = [];
    let attempts = 0;
    const wsServer = createWsServer(
      new WebSocketServer({port}),
      (() => {
        attempts++;
        if (attempts == 1) {
          throw setupError;
        }
        return createTestPersister();
      }) as any,
      (error) => errors.push(error),
      0.01,
    );

    const webSocket1 = await openWebSocket('path', port);
    await pause();
    expect(errors).toEqual([setupError]);
    expect(wsServer.getStats()).toEqual({clients: 0, paths: 0});
    await closeWebSocket(webSocket1);

    const webSocket2 = await openWebSocket('path', port);
    await pause();
    expect(attempts).toBe(2);
    expect(wsServer.getStats()).toEqual({clients: 1, paths: 1});

    await closeWebSocket(webSocket2);
    await wsServer.destroy();
  });

  test('closed pending client does not replace a new generation', async () => {
    const port = 8060;
    const [firstSetup, resolveFirstSetup] = getPromiseResolvers<any>();
    let attempts = 0;
    const wsServer = createWsServer(
      new WebSocketServer({port}),
      (() => (++attempts == 1 ? firstSetup : createTestPersister())) as any,
      undefined,
      0.01,
    );

    const webSocket1 = await openWebSocket('path', port);
    expect(wsServer.getStats()).toEqual({clients: 1, paths: 1});
    await closeWebSocket(webSocket1);
    await pause();
    expect(wsServer.getStats()).toEqual({clients: 0, paths: 1});

    const webSocket2 = await openWebSocket('path', port);
    await pause();
    expect(attempts).toBe(2);
    expect(wsServer.getStats()).toEqual({clients: 1, paths: 1});

    resolveFirstSetup(createTestPersister());
    await pause();
    expect(wsServer.getStats()).toEqual({clients: 1, paths: 1});

    await closeWebSocket(webSocket2);
    await wsServer.destroy();
  });

  test('pending cleanup does not delete a replacement path', async () => {
    const port = 8061;
    const [firstDestroy, resolveFirstDestroy] = getPromiseResolvers();
    let firstDestroyStarted = false;
    let attempts = 0;
    const wsServer = createWsServer(
      new WebSocketServer({port}),
      (() =>
        ++attempts == 1
          ? createTestPersister(undefined, async () => {
              firstDestroyStarted = true;
              await firstDestroy;
            })
          : createTestPersister()) as any,
      undefined,
      0.01,
    );

    const webSocket1 = await openWebSocket('path', port);
    await pause();
    await closeWebSocket(webSocket1);
    await pause();
    expect(firstDestroyStarted).toBe(true);

    const webSocket2 = await openWebSocket('path', port);
    await pause();
    expect(attempts).toBe(2);
    expect(wsServer.getStats()).toEqual({clients: 1, paths: 1});

    resolveFirstDestroy();
    await pause();
    expect(wsServer.getStats()).toEqual({clients: 1, paths: 1});

    await closeWebSocket(webSocket2);
    await wsServer.destroy();
  });

  test('failed cleanup still deletes path state', async () => {
    const port = 8062;
    const cleanupError = new Error('cleanup');
    const errors: Error[] = [];
    let attempts = 0;
    const wsServer = createWsServer(
      new WebSocketServer({port}),
      (() =>
        ++attempts == 1
          ? createTestPersister(undefined, async () => {
              throw cleanupError;
            })
          : createTestPersister()) as any,
      (error) => errors.push(error),
      0.01,
    );

    const webSocket1 = await openWebSocket('path', port);
    await pause();
    await closeWebSocket(webSocket1);
    await pause();
    expect(errors).toContain(cleanupError);
    expect(wsServer.getStats()).toEqual({clients: 0, paths: 0});

    const webSocket2 = await openWebSocket('path', port);
    await pause();
    expect(attempts).toBe(2);
    expect(wsServer.getStats()).toEqual({clients: 1, paths: 1});

    await closeWebSocket(webSocket2);
    await wsServer.destroy();
  });

  test('destroy waits for server and client closure', async () => {
    const port = 8063;
    const webSocketServer = new WebSocketServer({port});
    const wsServer = createWsServer(webSocketServer);
    let closed = 0;
    webSocketServer.on('connection', (client) =>
      client.on('close', () => closed++),
    );
    const webSocket1 = await openWebSocket('path1', port);
    const webSocket2 = await openWebSocket('path2', port);
    await pause();

    await wsServer.destroy();
    expect(closed).toBe(2);
    expect(webSocketServer.clients.size).toBe(0);
    expect(webSocketServer.address()).toBeNull();
    expect(wsServer.getStats()).toEqual({clients: 0, paths: 0});
    await closeWebSocket(webSocket1);
    await closeWebSocket(webSocket2);
    await wsServer.destroy();
  });
});

describe('Persistence', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmp.setGracefulCleanup();
    tmpDir = tmp.dirSync().name;
  });

  const createPersister = (serverStore: MergeableStore, pathId: Id) =>
    createFilePersister(
      serverStore,
      join(tmpDir, pathId.replaceAll('/', '-') + '.json'),
    );

  test('single client', async () => {
    const serverStore = createMergeableStore('ss', getNow);
    const wsServer = createWsServer(
      new WebSocketServer({port: 8049}),
      (pathId) => createPersister(serverStore, pathId),
    );

    const clientStore = createMergeableStore('s1', getNow);
    const synchronizer = await createWsSynchronizer(
      clientStore,
      new WebSocket('ws://localhost:8049/p1'),
    );
    await synchronizer.startSync();
    clientStore.setCell('t1', 'r1', 'c1', 1);

    await pause();
    expect(serverStore.getTables()).toEqual({t1: {r1: {c1: 1}}});
    expect(JSON.parse(readFileSync(join(tmpDir, 'p1.json'), 'utf-8'))).toEqual([
      [
        {
          t1: [
            {
              r1: [{c1: [1, 'Nn1JUF-----7JQY8', 1003668370]}, '', 550994372],
            },
            '',
            1072852846,
          ],
        },
        '',
        1771939739,
      ],
      [{}, '', 0],
    ]);

    serverStore.setCell('t1', 'r2', 'c2', 2);
    await pause();
    expect(clientStore.getTables()).toEqual({
      t1: {r1: {c1: 1}, r2: {c2: 2}},
    });
    expect(JSON.parse(readFileSync(join(tmpDir, 'p1.json'), 'utf-8'))).toEqual([
      [
        {
          t1: [
            {
              r1: [{c1: [1, 'Nn1JUF-----7JQY8', 1003668370]}, '', 550994372],
              r2: [{c2: [2, 'Nn1JUFm----5JWdY', 1501220271]}, '', 574407067],
            },
            '',
            2000894385,
          ],
        },
        '',
        644548619,
      ],
      [{}, '', 0],
    ]);

    await synchronizer.destroy();
    await wsServer.destroy();
  });

  test('fragmented server payloads', async () => {
    const sentPayloads: string[] = [];
    const webSocketServer = new WebSocketServer({port: 8049});
    webSocketServer.on('connection', (client) => {
      const send = client.send.bind(client);
      client.send = ((payload: string) => {
        sentPayloads.push(payload);
        return send(payload);
      }) as any;
    });
    const serverStore = createMergeableStore('ss', getNow);
    const wsServer = createWsServer(
      webSocketServer,
      (pathId) => createPersister(serverStore, pathId),
      undefined,
      undefined,
      20,
    );

    const clientStore = createMergeableStore('s1', getNow);
    const synchronizer = await createWsSynchronizer(
      clientStore,
      new WebSocket('ws://localhost:8049/p1'),
      1,
      undefined,
      undefined,
      undefined,
      20,
    );

    try {
      await synchronizer.startSync();
      serverStore.setCell('t1', 'r1', 'c1', 'abcdefghijklmnopqrstuvwxyz');
      await pause();

      expect(
        sentPayloads.some((payload) => payload.split('\n').length > 2),
      ).toBe(true);
      expect(clientStore.getTables()).toEqual({
        t1: {r1: {c1: 'abcdefghijklmnopqrstuvwxyz'}},
      });
    } finally {
      await synchronizer.destroy();
      await wsServer.destroy();
    }
  });

  test('only sends missing data to first persisted client', async () => {
    const persistedStore = createMergeableStore('seed', getNow);
    persistedStore.setCell('t1', 'r1', 'c1', 'existing');
    const clientContent = persistedStore.getMergeableContent();
    persistedStore.setCell('t1', 'r2', 'c1', 'missing');
    writeFileSync(
      join(tmpDir, 'p1.json'),
      JSON.stringify(persistedStore.getMergeableContent()),
      'utf-8',
    );

    const sentPayloads: string[] = [];
    const webSocketServer = new WebSocketServer({port: 8049});
    webSocketServer.on('connection', (client) => {
      const send = client.send.bind(client);
      client.send = ((payload: string) => {
        sentPayloads.push(payload);
        return send(payload);
      }) as any;
    });

    const wsServer = createWsServer(webSocketServer, (pathId) =>
      createPersister(createMergeableStore('ss', getNow), pathId),
    );
    const clientStore = createMergeableStore('s1', getNow);
    clientStore.setMergeableContent(clientContent);
    const synchronizer = await createWsSynchronizer(
      clientStore,
      new WebSocket('ws://localhost:8049/p1'),
    );

    try {
      await synchronizer.startSync();
      await pause();

      expect(clientStore.getTables()).toEqual({
        t1: {r1: {c1: 'existing'}, r2: {c1: 'missing'}},
      });
      expect(sentPayloads.some((payload) => payload.includes('missing'))).toBe(
        true,
      );
      expect(sentPayloads.some((payload) => payload.includes('existing'))).toBe(
        false,
      );
    } finally {
      await synchronizer.destroy();
      await wsServer.destroy();
    }
  });

  test('incomplete fragmented server buffers expire', async () => {
    const sourceStore = createMergeableStore('s1', getNow);
    const sourceSocket = new MockWebSocket();
    const sourceSynchronizer = await createWsSynchronizer(
      sourceStore,
      sourceSocket as any,
      1,
      undefined,
      undefined,
      undefined,
      12,
    );
    const serverStore = createMergeableStore('ss', getNow);
    const wsServer = createWsServer(
      new WebSocketServer({port: 8049}),
      (pathId) => createPersister(serverStore, pathId),
      undefined,
      0.01,
    );
    const webSocket = new WebSocket('ws://localhost:8049/p1');
    await new Promise<void>((resolve) => webSocket.on('open', () => resolve()));
    await pause();

    try {
      await sourceSynchronizer.startSync();
      sourceStore.setCell('t1', 'r1', 'c1', 'abcdefghijklmnopqrstuvwxyz');
      await pause();

      const fragmentGroup =
        getFragmentGroup(
          sourceSocket.sentPayloads,
          'abcdefghijklmnopqrstuvwxyz',
        ) ?? [];
      expect(fragmentGroup.length).toBeGreaterThan(1);
      const sendFirstFragment = () => webSocket.send(fragmentGroup[0]);
      const sendRestOfFragments = () =>
        fragmentGroup.slice(1).forEach((payload) => webSocket.send(payload));

      sendFirstFragment();
      await pause(20);
      sendRestOfFragments();
      await pause(20);
      sendFirstFragment();
      await pause(20);

      expect(serverStore.getTables()).toEqual({});
    } finally {
      webSocket.close();
      await sourceSynchronizer.destroy();
      await wsServer.destroy();
    }
  });

  describe('single client to existing path', () => {
    let serverStore: MergeableStore;

    beforeEach(() => {
      serverStore = createMergeableStore('ss', getNow);
      writeFileSync(
        join(tmpDir, 'p1.json'),
        JSON.stringify([
          [
            {
              t1: [
                {
                  r1: [
                    {c1: [1, 'Nn1JUF-----7JQY8', 1003668370]},
                    '',
                    550994372,
                  ],
                },
                '',
                1072852846,
              ],
            },
            '',
            1771939739,
          ],
          [{}, '', 0],
        ]),
        'utf-8',
      );
    });

    test('alters data prematurely', async () => {
      const wsServer = createWsServer(
        new WebSocketServer({port: 8049}),
        (pathId) => {
          serverStore.setValue('p', pathId);
          return createPersister(serverStore, pathId);
        },
      );

      const clientStore = createMergeableStore('s1', getNow);
      const synchronizer = await createWsSynchronizer(
        clientStore,
        new WebSocket('ws://localhost:8049/p1'),
      );
      await synchronizer.startSync();

      await pause();
      expect(serverStore.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {}]);

      await synchronizer.destroy();
      await wsServer.destroy();
    });

    test('alters data after path first persisted', async () => {
      const wsServer = createWsServer(
        new WebSocketServer({port: 8049}),
        (pathId) => {
          serverStore.setValue('p', pathId);
          return [
            createPersister(serverStore, pathId),
            (store) => store.setValue('p', pathId),
          ];
        },
      );

      const clientStore = createMergeableStore('s1', getNow);
      const synchronizer = await createWsSynchronizer(
        clientStore,
        new WebSocket('ws://localhost:8049/p1'),
      );
      await synchronizer.startSync();

      await pause();
      expect(serverStore.getContent()).toEqual([
        {t1: {r1: {c1: 1}}},
        {p: 'p1'},
      ]);
      expect(
        JSON.parse(readFileSync(join(tmpDir, 'p1.json'), 'utf-8')),
      ).toEqual([
        [
          {
            t1: [
              {r1: [{c1: [1, 'Nn1JUF-----7JQY8', 1003668370]}, '', 550994372]},
              '',
              1072852846,
            ],
          },
          '',
          1771939739,
        ],
        [{p: ['p1', 'Nn1JUFm----5JWdY', 592098772]}, '', 891798799],
      ]);

      await synchronizer.destroy();
      await wsServer.destroy();
    });
  });

  test('multiple clients, one path', async () => {
    const serverStore = createMergeableStore('ss', getNow);
    const wsServer = createWsServer(
      new WebSocketServer({port: 8049}),
      (pathId) => createPersister(serverStore, pathId),
    );

    const clientStore1 = createMergeableStore('s1', getNow);
    const synchronizer1 = await createWsSynchronizer(
      clientStore1,
      new WebSocket('ws://localhost:8049/p1'),
    );
    await synchronizer1.startSync();
    clientStore1.setCell('t1', 'r1', 'c1', 1);

    const clientStore2 = createMergeableStore('s2', getNow);
    const synchronizer2 = await createWsSynchronizer(
      clientStore2,
      new WebSocket('ws://localhost:8049/p1'),
    );
    await synchronizer2.startSync();
    clientStore1.setCell('t1', 'r2', 'c2', 2);

    await pause();
    expect(serverStore.getTables()).toEqual({
      t1: {r1: {c1: 1}, r2: {c2: 2}},
    });

    serverStore.setCell('t1', 'r3', 'c3', 3);
    await pause();
    expect(clientStore1.getTables()).toEqual({
      t1: {r1: {c1: 1}, r2: {c2: 2}, r3: {c3: 3}},
    });
    expect(clientStore2.getTables()).toEqual({
      t1: {r1: {c1: 1}, r2: {c2: 2}, r3: {c3: 3}},
    });

    await synchronizer1.destroy();
    await synchronizer2.destroy();
    await wsServer.destroy();
  });

  test('multiple clients, multiple paths', async () => {
    const serverStore1 = createMergeableStore('ss1', getNow);
    const serverStore2 = createMergeableStore('ss2', getNow);
    const wsServer = createWsServer(
      new WebSocketServer({port: 8049}),
      (pathId) =>
        createPersister(pathId == 'p1' ? serverStore1 : serverStore2, pathId),
    );

    const clientStore1 = createMergeableStore('s1', getNow);
    const synchronizer1 = await createWsSynchronizer(
      clientStore1,
      new WebSocket('ws://localhost:8049/p1'),
    );
    await synchronizer1.startSync();
    clientStore1.setCell('t1', 'r1', 'c1', 1);

    const clientStore2 = createMergeableStore('s2', getNow);
    const synchronizer2 = await createWsSynchronizer(
      clientStore2,
      new WebSocket('ws://localhost:8049/p1'),
    );
    await synchronizer2.startSync();
    clientStore1.setCell('t2', 'r2', 'c2', 2);

    const clientStore3 = createMergeableStore('s3', getNow);
    const synchronizer3 = await createWsSynchronizer(
      clientStore3,
      new WebSocket('ws://localhost:8049/p2'),
    );
    await synchronizer3.startSync();
    clientStore3.setCell('t3', 'r3', 'c3', 3);

    const clientStore4 = createMergeableStore('s4', getNow);
    const synchronizer4 = await createWsSynchronizer(
      clientStore4,
      new WebSocket('ws://localhost:8049/p2'),
    );
    await synchronizer4.startSync();
    clientStore4.setCell('t4', 'r4', 'c4', 4);
    await pause();

    expect(serverStore1.getTables()).toEqual({
      t1: {r1: {c1: 1}},
      t2: {r2: {c2: 2}},
    });

    expect(serverStore2.getTables()).toEqual({
      t3: {r3: {c3: 3}},
      t4: {r4: {c4: 4}},
    });

    serverStore1.setCell('t1', 'r1', 'c5', 5);
    serverStore2.setCell('t3', 'r3', 'c5', 5);

    await pause();
    expect(clientStore1.getTables()).toEqual({
      t1: {r1: {c1: 1, c5: 5}},
      t2: {r2: {c2: 2}},
    });
    expect(clientStore2.getTables()).toEqual({
      t1: {r1: {c1: 1, c5: 5}},
      t2: {r2: {c2: 2}},
    });
    expect(clientStore3.getTables()).toEqual({
      t3: {r3: {c3: 3, c5: 5}},
      t4: {r4: {c4: 4}},
    });
    expect(clientStore4.getTables()).toEqual({
      t3: {r3: {c3: 3, c5: 5}},
      t4: {r4: {c4: 4}},
    });

    await synchronizer1.destroy();
    await synchronizer2.destroy();
    await synchronizer3.destroy();
    await synchronizer4.destroy();
    await wsServer.destroy();
  });

  test('store ids do not select paths', async () => {
    const pathIds: Id[] = [];
    const serverStores: {[pathId: string]: MergeableStore} = {};
    const wsServer = createWsServer(
      new WebSocketServer({port: 8049}),
      (pathId) => {
        pathIds.push(pathId);
        const serverStore = createMergeableStore('ss' + pathId, getNow);
        serverStores[pathId] = serverStore;
        return createPersister(serverStore, pathId || 'root');
      },
    );

    const clientStore1 = createMergeableStore('store1', getNow);
    const synchronizer1 = await createWsSynchronizer(
      clientStore1,
      new WebSocket('ws://localhost:8049'),
    );
    await synchronizer1.startSync();
    clientStore1.setCell('t1', 'r1', 'c1', 1);

    const clientStore2 = createMergeableStore('store2', getNow);
    const synchronizer2 = await createWsSynchronizer(
      clientStore2,
      new WebSocket('ws://localhost:8049'),
    );
    await synchronizer2.startSync();
    clientStore2.setCell('t1', 'r2', 'c2', 2);

    const clientStore3 = createMergeableStore('store3', getNow);
    const synchronizer3 = await createWsSynchronizer(
      clientStore3,
      new WebSocket('ws://localhost:8049/store3'),
    );
    await synchronizer3.startSync();
    clientStore3.setCell('t1', 'r3', 'c3', 3);

    await pause();

    expect(pathIds).toEqual(['', 'store3']);
    expect(serverStores[''].getTables()).toEqual({
      t1: {r1: {c1: 1}, r2: {c2: 2}},
    });
    expect(serverStores.store3.getTables()).toEqual({t1: {r3: {c3: 3}}});
    expect(clientStore1.getTables()).toEqual({
      t1: {r1: {c1: 1}, r2: {c2: 2}},
    });
    expect(clientStore2.getTables()).toEqual({
      t1: {r1: {c1: 1}, r2: {c2: 2}},
    });
    expect(clientStore3.getTables()).toEqual({t1: {r3: {c3: 3}}});

    await synchronizer1.destroy();
    await synchronizer2.destroy();
    await synchronizer3.destroy();
    await wsServer.destroy();
  });

  test('two clients, connecting in turn', async () => {
    const wsServer = createWsServer(
      new WebSocketServer({port: 8049}),
      (pathId) => createPersister(createMergeableStore('ss', getNow), pathId),
    );

    const clientStore1 = createMergeableStore('s1', getNow);
    clientStore1.setCell('t1', 'r1', 'c1', 1);
    const synchronizer1 = await createWsSynchronizer(
      clientStore1,
      new WebSocket('ws://localhost:8049/p'),
      1,
    );
    await synchronizer1.startSync();
    await pause();
    await synchronizer1.destroy();

    const clientStore2 = createMergeableStore('s2', getNow);
    const synchronizer2 = await createWsSynchronizer(
      clientStore2,
      new WebSocket('ws://localhost:8049/p'),
      1,
    );
    await synchronizer2.startSync();
    await pause();
    await synchronizer2.destroy();

    expect(clientStore2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {}]);
    await wsServer.destroy();
  });
});
