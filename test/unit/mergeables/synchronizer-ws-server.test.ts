/* eslint-disable jest/no-conditional-expect */

import type {Id, MergeableStore} from 'tinybase';
import {WebSocket, WebSocketServer} from 'ws';
import {readFileSync, writeFileSync} from 'fs';
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
  s1.setCell('t1', 'r1', 'c1', 4);

  const s2 = createMergeableStore('s2');
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

  const createPersister = (serverStore: MergeableStore, pathId: Id) =>
    createFilePersister(
      serverStore,
      join(tmpDir, pathId.replaceAll('/', '-') + '.json'),
    );

  test('single client', async () => {
    const serverStore = createMergeableStore('ss');
    const wsServer = createWsServer(
      new WebSocketServer({port: 8049}),
      (pathId) => createPersister(serverStore, pathId),
    );

    const clientStore = createMergeableStore('s1');
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
              r2: [{c2: [2, 'Nn1JUF----05JWdY', 2495711874]}, '', 698565442],
            },
            '',
            970894102,
          ],
        },
        '',
        3701807090,
      ],
      [{}, '', 0],
    ]);

    synchronizer.destroy();
    wsServer.destroy();
  });

  describe('single client to existing path', () => {
    let serverStore: MergeableStore;

    beforeEach(() => {
      serverStore = createMergeableStore('ss');
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

      const clientStore = createMergeableStore('s1');
      const synchronizer = await createWsSynchronizer(
        clientStore,
        new WebSocket('ws://localhost:8049/p1'),
      );
      await synchronizer.startSync();

      await pause();
      expect(serverStore.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {}]);

      synchronizer.destroy();
      wsServer.destroy();
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

      const clientStore = createMergeableStore('s1');
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
        [{p: ['p1', 'Nn1JUF----05JWdY', 328213929]}, '', 1622699135],
      ]);

      synchronizer.destroy();
      wsServer.destroy();
    });
  });

  test('multiple clients, one path', async () => {
    const serverStore = createMergeableStore('ss');
    const wsServer = createWsServer(
      new WebSocketServer({port: 8049}),
      (pathId) => createPersister(serverStore, pathId),
    );

    const clientStore1 = createMergeableStore('s1');
    const synchronizer1 = await createWsSynchronizer(
      clientStore1,
      new WebSocket('ws://localhost:8049/p1'),
    );
    await synchronizer1.startSync();
    clientStore1.setCell('t1', 'r1', 'c1', 1);

    const clientStore2 = createMergeableStore('s2');
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

    synchronizer1.destroy();
    synchronizer2.destroy();
    wsServer.destroy();
  });

  test('multiple clients, multiple paths', async () => {
    const serverStore1 = createMergeableStore('ss1');
    const serverStore2 = createMergeableStore('ss2');
    const wsServer = createWsServer(
      new WebSocketServer({port: 8049}),
      (pathId) =>
        createPersister(pathId == 'p1' ? serverStore1 : serverStore2, pathId),
    );

    const clientStore1 = createMergeableStore('s1');
    const synchronizer1 = await createWsSynchronizer(
      clientStore1,
      new WebSocket('ws://localhost:8049/p1'),
    );
    await synchronizer1.startSync();
    clientStore1.setCell('t1', 'r1', 'c1', 1);

    const clientStore2 = createMergeableStore('s2');
    const synchronizer2 = await createWsSynchronizer(
      clientStore2,
      new WebSocket('ws://localhost:8049/p1'),
    );
    await synchronizer2.startSync();
    clientStore1.setCell('t2', 'r2', 'c2', 2);

    const clientStore3 = createMergeableStore('s3');
    const synchronizer3 = await createWsSynchronizer(
      clientStore3,
      new WebSocket('ws://localhost:8049/p2'),
    );
    await synchronizer3.startSync();
    clientStore3.setCell('t3', 'r3', 'c3', 3);

    const clientStore4 = createMergeableStore('s4');
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

    synchronizer1.destroy();
    synchronizer2.destroy();
    synchronizer3.destroy();
    synchronizer4.destroy();
    wsServer.destroy();
  });

  test('two clients, connecting in turn', async () => {
    const wsServer = createWsServer(
      new WebSocketServer({port: 8049}),
      (pathId) => createPersister(createMergeableStore('ss'), pathId),
    );

    const clientStore1 = createMergeableStore('s1');
    clientStore1.setCell('t1', 'r1', 'c1', 1);
    const synchronizer1 = await createWsSynchronizer(
      clientStore1,
      new WebSocket('ws://localhost:8049/p'),
      1,
    );
    await synchronizer1.startSync();
    await pause();
    synchronizer1.destroy();

    const clientStore2 = createMergeableStore('s2');
    const synchronizer2 = await createWsSynchronizer(
      clientStore2,
      new WebSocket('ws://localhost:8049/p'),
      1,
    );
    await synchronizer2.startSync();
    await pause();
    synchronizer2.destroy();

    expect(clientStore2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {}]);
    wsServer.destroy();
  });
});
