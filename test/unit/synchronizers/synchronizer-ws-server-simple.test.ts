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
  await wsServerSimple.destroy();
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
