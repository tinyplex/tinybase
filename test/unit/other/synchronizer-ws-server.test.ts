/* eslint-disable jest/no-conditional-expect */

import {WebSocket, WebSocketServer} from 'ws';
import {readFileSync, readdirSync} from 'fs';
import type {WsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
import type {WsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
import {createFilePersister} from 'tinybase/persisters/persister-file';
import {createMergeableStore} from 'tinybase';
import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
import {join} from 'path';
import {pause} from '../common/other.ts';
import {resetHlc} from '../common/mergeable.ts';
import tmp from 'tmp';

beforeEach(() => {
  resetHlc();
});

test('Basics', async () => {
  const wsServer = createWsServer(new WebSocketServer({port: 8049}));

  const s1 = createMergeableStore('s1');
  const synchronizer1 = await createWsSynchronizer(
    s1,
    new WebSocket('ws://localhost:8049'),
  );
  await synchronizer1.startSync();
  s1.setCell('pets', 'fido', 'legs', 4);

  const s2 = createMergeableStore('s2');
  const synchronizer2 = await createWsSynchronizer(
    s2,
    new WebSocket('ws://localhost:8049'),
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
    wssServer = new WebSocketServer({port: 8049});
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
        new WebSocket('ws://localhost:8049/p1'),
      )
    ).startSync();
    synchronizer2 = await (
      await createWsSynchronizer(
        createMergeableStore('s2'),
        new WebSocket('ws://localhost:8049/p1'),
      )
    ).startSync();
    synchronizer3 = await (
      await createWsSynchronizer(
        createMergeableStore('s3'),
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
        createMergeableStore('s1'),
        new WebSocket('ws://localhost:8049/p1'),
      )
    ).startSync();
    synchronizer2 = await (
      await createWsSynchronizer(
        createMergeableStore('s2'),
        new WebSocket('ws://localhost:8049/p1'),
      )
    ).startSync();
    synchronizer3 = await (
      await createWsSynchronizer(
        createMergeableStore('s3'),
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

describe('Persistence', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmp.setGracefulCleanup();
    tmpDir = tmp.dirSync().name;
  });

  test('single store', async () => {
    const serverStore = createMergeableStore('ss');
    const wsServer = createWsServer(
      new WebSocketServer({port: 8050}),
      (pathId) => {
        return createFilePersister(
          serverStore,
          join(tmpDir, pathId.replaceAll('/', '-') + '.json'),
        );
      },
    );

    const store1 = createMergeableStore('s1');
    const synchronizer1 = await createWsSynchronizer(
      store1,
      new WebSocket('ws://localhost:8050'),
    );
    await synchronizer1.startSync();
    store1.setCell('pets', 'fido', 'legs', 4);

    await pause();

    expect(readdirSync(tmpDir)).toEqual(['.json']);
    expect(JSON.parse(readFileSync(join(tmpDir, '.json'), 'utf-8'))).toEqual([
      [
        {
          pets: [
            {
              fido: [
                {legs: [4, 'Nn1JUF-----7JQY8', 3062053843]},
                '',
                1065496390,
              ],
            },
            '',
            282451392,
          ],
        },
        '',
        3599542709,
      ],
      [{}, '', 0],
    ]);

    synchronizer1.destroy();
    wsServer.destroy();
  });
});
