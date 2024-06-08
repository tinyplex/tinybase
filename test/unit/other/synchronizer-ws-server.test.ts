/* eslint-disable jest/no-conditional-expect */

import {WebSocket, WebSocketServer} from 'ws';
import type {WsServer} from 'tinybase/debug/synchronizers/synchronizer-ws-server';
import type {WsSynchronizer} from 'tinybase/debug/synchronizers/synchronizer-ws-client';
import {createMergeableStore} from 'tinybase/debug';
import {createWsServer} from 'tinybase/debug/synchronizers/synchronizer-ws-server';
import {createWsSynchronizer} from 'tinybase/debug/synchronizers/synchronizer-ws-client';
import {pause} from '../common/other';

test('Basics', async () => {
  const wsServer = createWsServer(new WebSocketServer({port: 8046}));

  const s1 = createMergeableStore('s1');
  const synchronizer1 = await createWsSynchronizer(
    s1,
    new WebSocket('ws://localhost:8046'),
  );
  await synchronizer1.startSync();
  s1.setCell('pets', 'fido', 'legs', 4);

  const s2 = createMergeableStore('s2');
  const synchronizer2 = await createWsSynchronizer(
    s2,
    new WebSocket('ws://localhost:8046'),
  );
  await synchronizer2.startSync();
  s2.setCell('pets', 'felix', 'price', 5);

  await pause();

  expect(s1.getTables()).toEqual({
    pets: {felix: {price: 5}, fido: {legs: 4}},
  });
  expect(s2.getTables()).toEqual({
    pets: {felix: {price: 5}, fido: {legs: 4}},
  });

  synchronizer1.destroy();
  synchronizer2.destroy();
  wsServer.destroy();
});

describe('Multiple connections', () => {
  let wssServer: WebSocketServer;
  let wsServer: WsServer;
  let synchronizer1: WsSynchronizer<WebSocket>;
  let synchronizer2: WsSynchronizer<WebSocket>;
  let synchronizer3: WsSynchronizer<WebSocket>;

  beforeEach(async () => {
    wssServer = new WebSocketServer({port: 8046});
    wsServer = createWsServer(wssServer);
  });

  afterEach(() => {
    synchronizer1.destroy();
    synchronizer2.destroy();
    synchronizer3.destroy();
    wsServer.destroy();
  });

  test('Accessors', async () => {
    synchronizer1 = await (
      await createWsSynchronizer(
        createMergeableStore('s1'),
        new WebSocket('ws://localhost:8046/p1'),
      )
    ).startSync();
    synchronizer2 = await (
      await createWsSynchronizer(
        createMergeableStore('s2'),
        new WebSocket('ws://localhost:8046/p1'),
      )
    ).startSync();
    synchronizer3 = await (
      await createWsSynchronizer(
        createMergeableStore('s3'),
        new WebSocket('ws://localhost:8046/p2'),
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
    wsServer.addPathIdsListener((server, getIdChanges) => {
      expect(server).toEqual(wsServer);
      pathIdsLog.push(getIdChanges());
    });

    const allClientIdsLog: {[pathId: string]: {[clientId: string]: -1 | 1}}[] =
      [];
    wsServer.addClientIdsListener(null, (server, pathId, getIdChanges) => {
      expect(server).toEqual(wsServer);
      allClientIdsLog.push({[pathId]: getIdChanges()});
    });

    const clientIdsLog1: {[pathId: string]: {[clientId: string]: -1 | 1}}[] =
      [];
    wsServer.addClientIdsListener('p1', (server, pathId, getIdChanges) => {
      expect(server).toEqual(wsServer);
      clientIdsLog1.push({[pathId]: getIdChanges()});
    });

    const clientIdsLog2: {[pathId: string]: {[clientId: string]: -1 | 1}}[] =
      [];
    const listenerId = wsServer.addClientIdsListener(
      'p2',
      (server, pathId, getIdChanges) => {
        expect(server).toEqual(wsServer);
        clientIdsLog2.push({[pathId]: getIdChanges()});
      },
    );

    synchronizer1 = await (
      await createWsSynchronizer(
        createMergeableStore('s1'),
        new WebSocket('ws://localhost:8046/p1'),
      )
    ).startSync();
    synchronizer2 = await (
      await createWsSynchronizer(
        createMergeableStore('s2'),
        new WebSocket('ws://localhost:8046/p1'),
      )
    ).startSync();
    synchronizer3 = await (
      await createWsSynchronizer(
        createMergeableStore('s3'),
        new WebSocket('ws://localhost:8046/p2'),
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
