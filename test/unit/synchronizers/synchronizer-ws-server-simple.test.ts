import {EventEmitter} from 'events';
import {createMergeableStore} from 'tinybase';
import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
import {createWsServerSimple} from 'tinybase/synchronizers/synchronizer-ws-server-simple';
import {beforeEach, expect, test, vi} from 'vitest';
import {WebSocket, WebSocketServer} from 'ws';
import {getTimeFunctions} from '../common/mergeable.ts';
import {
  createTestWebSocketServer,
  getTestWebSocketUrl,
} from '../common/websocket.ts';

const [reset, getNow, pause] = getTimeFunctions();

class MockWebSocket extends EventEmitter {
  OPEN = 1;
  CLOSED = 3;
  bufferedAmount = 0;
  closeCalls = 0;
  closeCode: number | undefined;
  closeReason: string | undefined;
  protocol = '';
  readyState = this.OPEN;
  sentPayloads: string[] = [];

  close(code?: number, reason?: string): void {
    this.closeCalls++;
    this.closeCode = code;
    this.closeReason = reason;
    this.readyState = this.CLOSED;
    this.emit('close');
  }

  send(payload: string): void {
    this.sentPayloads.push(payload);
  }
}

beforeEach(() => {
  reset();
});

test('Basics', async () => {
  const [webSocketServer, port] = await createTestWebSocketServer();
  const wsServerSimple = createWsServerSimple(webSocketServer);

  const s1 = createMergeableStore('s1', getNow);
  const synchronizer1 = await createWsSynchronizer(
    s1,
    new WebSocket(getTestWebSocketUrl(port)),
  );
  await synchronizer1.startSync();
  s1.setCell('t1', 'r1', 'c1', 4);

  const s2 = createMergeableStore('s2', getNow);
  const synchronizer2 = await createWsSynchronizer(
    s2,
    new WebSocket(getTestWebSocketUrl(port)),
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
  await wsServerSimple.destroy();
});

test('Accessors', async () => {
  const [wssServer] = await createTestWebSocketServer();
  const wsServerSimple = createWsServerSimple(wssServer);
  expect(wsServerSimple.getWebSocketServer()).toEqual(wssServer);
  expect(wssServer.listenerCount('error')).toBeGreaterThan(0);
  await wsServerSimple.destroy();
  expect(wssServer.listenerCount('error')).toBe(0);
});

test('Destroy closes clients and removes only owned listeners', async () => {
  const [webSocketServer, port] = await createTestWebSocketServer();
  const onError = () => 0;
  let closeListeners: ReturnType<WebSocket['listeners']> = [];
  let serverClient: WebSocket | undefined;
  webSocketServer.on('error', onError);
  webSocketServer.once('connection', (client) => {
    serverClient = client;
    closeListeners = client.listeners('close');
  });
  const server = createWsServerSimple(webSocketServer);
  const client = new WebSocket(getTestWebSocketUrl(port));
  await new Promise<void>((resolve) => client.on('open', () => resolve()));
  const clientClosed = new Promise<void>((resolve) =>
    client.on('close', () => resolve()),
  );
  const serverClosed = new Promise<void>((resolve) =>
    webSocketServer.on('close', () => resolve()),
  );

  const destroying = server.destroy();
  expect(server.destroy()).toBe(destroying);
  expect(webSocketServer.listenerCount('connection')).toBe(0);
  await destroying;
  await Promise.all([clientClosed, serverClosed]);

  expect(client.readyState).toBe(WebSocket.CLOSED);
  expect(serverClient?.listenerCount('message')).toBe(0);
  expect(serverClient?.listeners('close')).toEqual(closeListeners);
  expect(serverClient?.listenerCount('error')).toBe(0);
  expect(webSocketServer.listeners('error')).toEqual([onError]);
  webSocketServer.off('error', onError);
});

test('Destroy clears listeners if server closure rejects', async () => {
  const webSocketServer = new WebSocketServer({noServer: true});
  await new Promise<void>((resolve) => webSocketServer.close(() => resolve()));
  const server = createWsServerSimple(webSocketServer);

  const destroying = server.destroy();
  await expect(destroying).rejects.toThrow('The server is not running');
  expect(server.destroy()).toBe(destroying);
  expect(webSocketServer.listenerCount('connection')).toBe(0);
  expect(webSocketServer.listenerCount('error')).toBe(0);
});

test('Malformed traffic is disconnected before relay', async () => {
  const [webSocketServer, port] = await createTestWebSocketServer();
  const server = createWsServerSimple(webSocketServer);
  const attacker = new WebSocket(getTestWebSocketUrl(port));
  const otherClient = new WebSocket(getTestWebSocketUrl(port));
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

  attacker.send('\n{');
  await closed;
  await pause();

  expect(received).toEqual([]);
  expect(otherClient.readyState).toBe(WebSocket.OPEN);

  otherClient.close();
  await server.destroy();
});

test('Outbound traffic is bounded for every client mode', async () => {
  const webSocketServer = new EventEmitter() as any;
  webSocketServer.close = (callback: () => void) => callback();
  const server = createWsServerSimple(webSocketServer);
  const connect = (
    client: MockWebSocket,
    clientId: string,
    pathId: string,
    protocol = '',
  ) => {
    client.protocol = protocol;
    webSocketServer.emit('connection', client, {
      headers: {'sec-websocket-key': clientId},
      url: '/' + pathId,
    });
  };
  const send = (client: MockWebSocket, payload = '\n[null,1,""]') =>
    client.emit('message', payload);

  const largeSender = new MockWebSocket();
  const largeRecipient = new MockWebSocket();
  connect(largeSender, 'x'.repeat(16_777_216), 'large');
  connect(largeRecipient, 'recipient', 'large');
  send(largeSender);

  expect(largeRecipient.sentPayloads).toEqual([]);
  expect(largeRecipient.closeCode).toBe(1013);
  expect(largeRecipient.closeReason).toBe('tinybase:15:socket');

  const pressuredSender = new MockWebSocket();
  const pressuredRecipient = new MockWebSocket();
  pressuredRecipient.bufferedAmount = 16_777_216;
  connect(pressuredSender, 'sender', 'pressured');
  connect(pressuredRecipient, 'recipient', 'pressured');
  send(pressuredSender);

  expect(pressuredRecipient.sentPayloads).toEqual([]);
  expect(pressuredRecipient.closeCode).toBe(1013);
  expect(pressuredRecipient.closeReason).toBe('tinybase:15:socket');

  const closedSender = new MockWebSocket();
  const closedRecipient = new MockWebSocket();
  connect(closedSender, 'sender', 'closed');
  connect(closedRecipient, 'recipient', 'closed');
  closedRecipient.bufferedAmount = 16_777_216;
  closedRecipient.readyState = closedRecipient.CLOSED;
  send(closedSender);

  expect(closedRecipient.sentPayloads).toEqual([]);
  expect(closedRecipient.closeCalls).toBe(0);

  const multipleClient = new MockWebSocket();
  multipleClient.bufferedAmount = 16_777_216;
  connect(multipleClient, 'multiple', 'multiple', 'tinybase');
  send(multipleClient, 'S\n["request",-1,[0,1]]');

  expect(multipleClient.sentPayloads).toEqual([]);
  expect(multipleClient.closeCode).toBe(1013);
  expect(multipleClient.closeReason).toBe('tinybase:15:socket');

  await server.destroy();
});

test('Multiplexed channel resources are bounded', async () => {
  const webSocketServer = new EventEmitter() as any;
  webSocketServer.close = (callback: () => void) => callback();
  const server = createWsServerSimple(webSocketServer);
  const connect = (client: MockWebSocket, clientId: string) => {
    client.protocol = 'tinybase';
    webSocketServer.emit('connection', client, {
      headers: {'sec-websocket-key': clientId},
      url: '/base',
    });
  };
  const sendControl = (
    client: MockWebSocket,
    requestId: string | null,
    control: number,
    body: any,
  ) =>
    client.emit(
      'message',
      'S\n' + JSON.stringify([requestId, -1, [control, body]]),
    );
  const hello = (client: MockWebSocket) => sendControl(client, 'hello', 0, 1);
  const sendFragment = (
    client: MockWebSocket,
    channelId: string,
    messageId: string,
    fragment: string,
  ) =>
    client.emit(
      'message',
      `M\n${channelId}\nremote\n${messageId}\n0\n2\n${fragment}`,
    );

  const capacityClient = new MockWebSocket();
  connect(capacityClient, 'capacity');
  hello(capacityClient);
  sendControl(capacityClient, 'duplicate1', 1, 'channel0');
  sendControl(capacityClient, 'duplicate2', 1, 'channel0');
  for (let channel = 1; channel < 100; channel++) {
    sendControl(capacityClient, 'request' + channel, 1, 'channel' + channel);
  }
  sendControl(capacityClient, null, 2, 'channel0');
  sendControl(capacityClient, 'replacement', 1, 'channel100');

  expect(capacityClient.closeCalls).toBe(0);

  sendControl(capacityClient, 'overflow', 1, 'channel101');

  expect(capacityClient.closeCode).toBe(1013);
  expect(capacityClient.closeReason).toBe('tinybase:15:channels');

  const sizeClient = new MockWebSocket();
  connect(sizeClient, 'size');
  hello(sizeClient);
  sendControl(sizeClient, 'maximum', 1, 'é'.repeat(512));

  expect(sizeClient.closeCalls).toBe(0);

  sendControl(sizeClient, 'oversized', 1, 'é'.repeat(512) + 'a');

  expect(sizeClient.closeCode).toBe(1013);
  expect(sizeClient.closeReason).toBe('tinybase:15:channels');

  const unsubscribeClient = new MockWebSocket();
  connect(unsubscribeClient, 'unsubscribe');
  hello(unsubscribeClient);
  sendControl(unsubscribeClient, null, 2, 'é'.repeat(512) + 'a');

  expect(unsubscribeClient.closeCode).toBe(1013);
  expect(unsubscribeClient.closeReason).toBe('tinybase:15:channels');

  const oversizedInvalidClient = new MockWebSocket();
  connect(oversizedInvalidClient, 'oversizedInvalid');
  hello(oversizedInvalidClient);
  sendControl(oversizedInvalidClient, 'oversizedInvalid', 1, 'a/'.repeat(513));

  expect(oversizedInvalidClient.closeCode).toBe(1013);
  expect(oversizedInvalidClient.closeReason).toBe('tinybase:15:channels');

  const oversizedDataClient = new MockWebSocket();
  connect(oversizedDataClient, 'oversizedData');
  hello(oversizedDataClient);
  oversizedDataClient.emit(
    'message',
    `M\n${'é'.repeat(513)}\nremote\n[null,1,""]`,
  );

  expect(oversizedDataClient.closeCode).toBe(1013);
  expect(oversizedDataClient.closeReason).toBe('tinybase:15:channels');

  const invalidClient = new MockWebSocket();
  const invalidPeer = new MockWebSocket();
  connect(invalidClient, 'invalid');
  connect(invalidPeer, 'invalidPeer');
  hello(invalidClient);
  hello(invalidPeer);
  sendControl(invalidClient, 'invalidSubscribe', 1, 'files');
  sendControl(invalidPeer, 'peerSubscribe', 1, 'files');
  const peerPayloads = invalidPeer.sentPayloads.length;
  sendControl(invalidClient, 'invalid', 1, 'pets?cats');
  invalidClient.emit('message', 'M\nfiles\n\n[null,1,""]');

  expect(invalidClient.closeCode).toBe(1007);
  expect(invalidClient.closeReason).toBe('tinybase:14');
  expect(invalidPeer.sentPayloads).toHaveLength(peerPayloads);

  const fragmentCountClient = new MockWebSocket();
  connect(fragmentCountClient, 'fragmentCount');
  hello(fragmentCountClient);
  for (let channel = 0; channel < 100; channel++) {
    const channelId = 'channel' + channel;
    sendControl(fragmentCountClient, 'subscribe' + channel, 1, channelId);
    sendFragment(
      fragmentCountClient,
      channelId,
      ('message' + channel).padEnd(16, '_'),
      '[',
    );
  }

  expect(fragmentCountClient.closeCalls).toBe(0);

  sendFragment(fragmentCountClient, 'channel0', 'overflow________', '[');

  expect(fragmentCountClient.closeCode).toBe(1013);
  expect(fragmentCountClient.closeReason).toBe('tinybase:15:fragments');

  const fragmentSizeClient = new MockWebSocket();
  connect(fragmentSizeClient, 'fragmentSize');
  hello(fragmentSizeClient);
  sendControl(fragmentSizeClient, 'subscribe1', 1, 'channel1');
  sendControl(fragmentSizeClient, 'subscribe2', 1, 'channel2');
  sendFragment(
    fragmentSizeClient,
    'channel1',
    'message1________',
    'x'.repeat(8_388_580),
  );

  expect(fragmentSizeClient.closeCalls).toBe(0);

  sendFragment(
    fragmentSizeClient,
    'channel2',
    'message2________',
    'x'.repeat(8_388_580),
  );

  expect(fragmentSizeClient.closeCode).toBe(1013);
  expect(fragmentSizeClient.closeReason).toBe('tinybase:15:fragments');

  await pause();
  await server.destroy();
});

test('Multiplexed fragment quotas recover', async () => {
  vi.useFakeTimers();
  try {
    const webSocketServer = new EventEmitter() as any;
    webSocketServer.close = (callback: () => void) => callback();
    const server = createWsServerSimple(webSocketServer);
    const client = new MockWebSocket();
    client.protocol = 'tinybase';
    webSocketServer.emit('connection', client, {
      headers: {'sec-websocket-key': 'client'},
      url: '/base',
    });
    const sendControl = (
      requestId: string | null,
      control: number,
      body: any,
    ) =>
      client.emit(
        'message',
        'S\n' + JSON.stringify([requestId, -1, [control, body]]),
      );
    const sendFragment = (messageId: string, index = 0, fragment = '[') =>
      client.emit(
        'message',
        `M\nfiles\nremote\n${messageId}\n${index}\n2\n${fragment}`,
      );
    const sendPending = (prefix: string) => {
      for (let index = 0; index < 100; index++) {
        sendFragment(prefix + index.toString().padStart(9, '0'));
      }
    };

    sendControl('hello', 0, 1);
    sendControl('subscribe', 1, 'files');
    sendFragment('complete________', 0, '[null,');
    sendFragment('complete________', 1, '1,""]');
    sendPending('pending');

    expect(client.closeCalls).toBe(0);
    expect(vi.getTimerCount()).toBe(100);

    sendControl(null, 2, 'files');

    expect(vi.getTimerCount()).toBe(0);

    sendControl('resubscribe', 1, 'files');
    sendPending('pending');
    await vi.advanceTimersByTimeAsync(1_001);
    sendPending('second_');

    expect(client.closeCalls).toBe(0);

    sendControl(null, 2, 'files');

    expect(vi.getTimerCount()).toBe(0);

    await server.destroy();
  } finally {
    vi.useRealTimers();
  }
});

test('Multiple stores', async () => {
  const [webSocketServer, port] = await createTestWebSocketServer();
  const wsServerSimple = createWsServerSimple(webSocketServer);
  const webSocket1 = new WebSocket(getTestWebSocketUrl(port), 'tinybase');
  const webSocket2 = new WebSocket(getTestWebSocketUrl(port), 'tinybase');
  const filesStore1 = createMergeableStore('files1', getNow);
  const filesStore2 = createMergeableStore('files2', getNow);
  const editorStore1 = createMergeableStore('editor1', getNow);
  const editorStore2 = createMergeableStore('editor2', getNow);
  const synchronizers = await Promise.all([
    createWsSynchronizer(filesStore1, webSocket1, 'files'),
    createWsSynchronizer(editorStore1, webSocket1, 'editor'),
    createWsSynchronizer(filesStore2, webSocket2, 'files'),
    createWsSynchronizer(editorStore2, webSocket2, 'editor'),
  ]);

  await Promise.all(
    synchronizers.map((synchronizer) => synchronizer.startSync()),
  );
  filesStore1.setCell('files', 'f1', 'name', 'pets.json');
  editorStore2.setValue('selection', 'fido');
  await pause();

  expect(filesStore2.getTables()).toEqual({
    files: {f1: {name: 'pets.json'}},
  });
  expect(editorStore1.getValues()).toEqual({selection: 'fido'});
  expect(filesStore1.getValues()).toEqual({});
  expect(editorStore2.getTables()).toEqual({});

  await Promise.all(
    synchronizers.map((synchronizer) => synchronizer.destroy()),
  );
  await wsServerSimple.destroy();
});
