import {createMergeableStore} from 'tinybase';
import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
import {createWsServerSimple} from 'tinybase/synchronizers/synchronizer-ws-server-simple';
import {beforeEach, expect, test} from 'vitest';
import {WebSocket, WebSocketServer} from 'ws';
import {getTimeFunctions} from '../common/mergeable.ts';

const [reset, getNow, pause] = getTimeFunctions();

beforeEach(() => {
  reset();
});

test('Basics', async () => {
  const wsServerSimple = createWsServerSimple(
    new WebSocketServer({port: 8054}),
  );

  const s1 = createMergeableStore('s1', getNow);
  const synchronizer1 = await createWsSynchronizer(
    s1,
    new WebSocket('ws://localhost:8054'),
  );
  await synchronizer1.startSync();
  s1.setCell('t1', 'r1', 'c1', 4);

  const s2 = createMergeableStore('s2', getNow);
  const synchronizer2 = await createWsSynchronizer(
    s2,
    new WebSocket('ws://localhost:8054'),
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
  const wssServer = new WebSocketServer({port: 8054});
  const wsServerSimple = createWsServerSimple(wssServer);
  expect(wsServerSimple.getWebSocketServer()).toEqual(wssServer);
  expect(wssServer.listenerCount('error')).toBeGreaterThan(0);
  await wsServerSimple.destroy();
  expect(wssServer.listenerCount('error')).toBe(0);
});

test('Destroy closes clients and removes only owned listeners', async () => {
  const webSocketServer = new WebSocketServer({port: 8054});
  const onError = () => 0;
  let closeListeners: ReturnType<WebSocket['listeners']> = [];
  let serverClient: WebSocket | undefined;
  webSocketServer.on('error', onError);
  webSocketServer.once('connection', (client) => {
    serverClient = client;
    closeListeners = client.listeners('close');
  });
  const server = createWsServerSimple(webSocketServer);
  const client = new WebSocket('ws://localhost:8054');
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
  const server = createWsServerSimple(new WebSocketServer({port: 8054}));
  const attacker = new WebSocket('ws://localhost:8054');
  const otherClient = new WebSocket('ws://localhost:8054');
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

test('Multiple stores', async () => {
  const wsServerSimple = createWsServerSimple(
    new WebSocketServer({port: 8054}),
  );
  const webSocket1 = new WebSocket('ws://localhost:8054', 'tinybase');
  const webSocket2 = new WebSocket('ws://localhost:8054', 'tinybase');
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
