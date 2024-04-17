import {
  Changes,
  Content,
  DatabasePersisterConfig,
  Id,
  MergeableChanges,
  MergeableContent,
  MergeableStore,
  Persister,
  Receive,
  Store,
  Synchronizer,
  Tables,
  Values,
  createCustomPersister,
  createCustomSynchronizer,
  createMergeableStore,
} from 'tinybase/debug';
import {DbSchema, ElectricClient} from 'electric-sql/client/model';
import {DocHandle, Repo} from '@automerge/automerge-repo';
import {GetLocationMethod, Persistable} from './common';
import {
  LocalSynchronizer,
  createLocalSynchronizer,
} from 'tinybase/debug/synchronizers/synchronizer-local';
import {SqliteWasmDb, VARIANTS} from './sqlite';
import {Doc as YDoc, Map as YMap} from 'yjs';
import {
  createLocalPersister,
  createSessionPersister,
} from 'tinybase/debug/persisters/persister-browser';
import {deleteDB, openDB} from 'idb';
import {AbstractPowerSyncDatabase} from '@journeyapps/powersync-sdk-common';
import {DB} from '@vlcn.io/crsqlite-wasm';
import {Database} from 'sqlite3';
import {createAutomergePersister} from 'tinybase/debug/persisters/persister-automerge';
import {createFilePersister} from 'tinybase/debug/persisters/persister-file';
import {createIndexedDbPersister} from 'tinybase/debug/persisters/persister-indexed-db';
import {createRemotePersister} from 'tinybase/debug/persisters/persister-remote';
import {createYjsPersister} from 'tinybase/debug/persisters/persister-yjs';
import crypto from 'crypto';
import fetchMock from 'jest-fetch-mock';
import fs from 'fs';
import {mockFetchWasm} from '../common/other';
import tmp from 'tmp';

const UNDEFINED_MARKER = '\uFFFC';

const GET_HOST = 'http://get.com';
const SET_HOST = 'http://set.com';

const electricSchema = new DbSchema({}, []);
type Electric = ElectricClient<typeof electricSchema>;

const jsonStringWithUndefined = (obj: unknown): string =>
  JSON.stringify(obj, (_key, value) =>
    value === undefined ? UNDEFINED_MARKER : value,
  );

const jsonParseWithUndefined = (str: string): any =>
  JSON.parse(str, (_key, value) =>
    value === UNDEFINED_MARKER ? undefined : value,
  );

const yMapMatch = (
  yMapOrParent: YMap<any>,
  idInParent: Id | undefined,
  obj: {[id: Id]: any},
  set: (yMap: YMap<any>, id: Id, rawContent: any) => 1 | void,
): 1 | void => {
  const yMap =
    idInParent == undefined
      ? yMapOrParent
      : yMapOrParent.get(idInParent) ??
        yMapOrParent.set(idInParent, new YMap());
  let changed: 1 | undefined;
  Object.entries(obj).forEach(([id, value]) => {
    if (set(yMap, id, value)) {
      changed = 1;
    }
  });
  yMap.forEach((_: any, id: Id) => {
    if (obj[id] == null) {
      yMap.delete(id);
      changed = 1;
    }
  });
  if (idInParent != undefined && !yMap.size) {
    yMapOrParent.delete(idInParent);
  }
  return changed;
};

const objEnsure = <Value>(
  obj: {[id: Id]: Value},
  id: Id,
  getDefaultValue: () => Value,
): Value => {
  if (obj[id] == undefined) {
    obj[id] = getDefaultValue();
  }
  return obj[id] as Value;
};

const docObjMatch = (
  docObjOrParent: {[id: Id]: any},
  idInParent: Id | undefined,
  obj: {[id: Id]: any},
  set: (docObj: {[id: Id]: any}, id: Id, rawContent: any) => 1 | void,
): 1 | void => {
  const docObj =
    idInParent == undefined
      ? docObjOrParent
      : objEnsure(docObjOrParent, idInParent, () => ({}));
  let changed: 1 | undefined;
  Object.entries(obj).forEach(([id, value]) => {
    if (set(docObj, id, value)) {
      changed = 1;
    }
  });
  Object.keys(docObj).forEach((id: Id) => {
    if (obj[id] == undefined) {
      delete docObj[id];
      changed = 1;
    }
  });
  if (idInParent != undefined && Object.keys(docObj).length == 0) {
    delete docObjOrParent[idInParent];
  }
  return changed;
};

let customPersister: any;
let customPersisterListener:
  | ((getContent?: () => Content | MergeableContent) => void)
  | ((
      getContent?: () => Content | MergeableContent,
      getChanges?: () => Changes | MergeableChanges,
    ) => void)
  | undefined;
let customPersisterChanges: Changes | MergeableChanges = [{}, {}, 1];

const getMockedCustom = (
  write: (location: string, rawContent: any) => Promise<void>,
  supportsMergeableStore = false,
): Persistable => ({
  autoLoadPause: 100,
  getLocation: async (): Promise<string> => '',
  getLocationMethod: ['getFoo', () => 'foo'],
  getPersister: (store: Store) => {
    customPersister = '';
    return createCustomPersister(
      store,
      async () => jsonParseWithUndefined(customPersister),
      async (getContent, getChanges) => {
        customPersister = jsonStringWithUndefined(getContent());
        customPersisterChanges = getChanges?.() ?? [{}, {}, 1];
      },
      (listener) => {
        customPersisterListener = listener;
        return 1;
      },
      () => (customPersisterListener = undefined),
      undefined,
      supportsMergeableStore,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      {getFoo: () => 'foo'},
    );
  },
  get: async (): Promise<Content | void> =>
    jsonParseWithUndefined(customPersister),
  set: async (
    location: string,
    content: Content | MergeableContent,
  ): Promise<void> => await write(location, jsonStringWithUndefined(content)),
  write,
  del: async (): Promise<void> => {
    customPersister = '';
  },
  getChanges: () => customPersisterChanges,
  testMissing: true,
});

export const mockNoContentListener: Persistable<string> = getMockedCustom(
  async (_location: string, rawContent: any): Promise<void> => {
    customPersister = rawContent;
    customPersisterListener?.();
  },
);

export const mockContentListener: Persistable<string> = getMockedCustom(
  async (_location: string, rawContent: any): Promise<void> => {
    customPersister = rawContent;
    let content: Content;
    try {
      content = jsonParseWithUndefined(rawContent);
    } catch (e) {
      content = [] as any;
    }
    customPersisterListener?.(() => content);
  },
);

export const mockChangesListener: Persistable<string> = getMockedCustom(
  async (_location: string, rawContent: any): Promise<void> => {
    customPersister = rawContent;
    let content: Content;
    try {
      content = jsonParseWithUndefined(rawContent);
    } catch (e) {
      content = [] as any;
    }
    customPersisterListener?.(
      undefined,
      () => [...content, 1], // changes
    );
  },
);

export const mockMergeableNoContentListener: Persistable<string> =
  getMockedCustom(async (_location: string, rawContent: any): Promise<void> => {
    customPersister = rawContent;
    customPersisterListener?.();
  }, true);

export const mockMergeableContentListener: Persistable<string> =
  getMockedCustom(async (_location: string, rawContent: any): Promise<void> => {
    customPersister = rawContent;
    let content: MergeableContent;
    try {
      content = jsonParseWithUndefined(rawContent);
    } catch (e) {
      content = [] as any;
    }
    customPersisterListener?.(() => content);
  }, true);

export const mockMergeableChangesListener: Persistable<string> =
  getMockedCustom(async (_location: string, rawContent: any): Promise<void> => {
    customPersister = rawContent;
    let content: MergeableContent;
    try {
      content = jsonParseWithUndefined(rawContent);
    } catch (e) {
      content = [] as any;
    }
    customPersisterListener?.(
      undefined,
      () => [...content, 1] as any, // changes
    );
  }, true);

export const mockFile: Persistable = {
  autoLoadPause: 200,
  getLocation: async (): Promise<string> => {
    tmp.setGracefulCleanup();
    return tmp.fileSync().name;
  },
  getLocationMethod: ['getFilePath', (location) => location],
  getPersister: createFilePersister,
  get: async (location: string): Promise<Content | MergeableContent | void> => {
    try {
      return JSON.parse(fs.readFileSync(location, 'utf-8'));
    } catch {}
  },
  set: async (
    location: string,
    content: Content | MergeableContent,
  ): Promise<void> => await mockFile.write(location, JSON.stringify(content)),
  write: async (location: string, rawContent: any): Promise<void> =>
    fs.writeFileSync(location, rawContent, 'utf-8'),
  del: async (location: string): Promise<void> => fs.unlinkSync(location),
  testMissing: true,
};

export const mockLocalSynchronizer: Persistable<
  [LocalSynchronizer, MergeableStore]
> = {
  autoLoadPause: 1,
  getLocation: async (): Promise<[LocalSynchronizer, MergeableStore]> => {
    const store2 = createMergeableStore('s2');
    const synchronizer2 = createLocalSynchronizer(store2);
    await synchronizer2.startSync();
    return [synchronizer2, store2];
  },
  getPersister: (store: Store) =>
    createLocalSynchronizer(store as MergeableStore),
  get: async (
    location: [LocalSynchronizer, MergeableStore],
  ): Promise<Content | MergeableContent | void> =>
    location[1].getMergeableContent(),
  set: async (
    location: [LocalSynchronizer, MergeableStore],
    content: Content | MergeableContent,
  ): Promise<void> => await mockLocalSynchronizer.write(location, content),
  write: async (
    location: [LocalSynchronizer, MergeableStore],
    rawContent: any,
  ): Promise<void> => {
    location[1].setMergeableContent(rawContent);
  },
  del: async (location: [LocalSynchronizer, MergeableStore]): Promise<void> => {
    location[1].setMergeableContent([
      ['', {}, 0],
      ['', {}, 0],
    ]);
  },
  testMissing: false,
  afterEach: (location: [LocalSynchronizer, MergeableStore]) => {
    location[0].destroy();
  },
};

const createCustomLocalSynchronizer = (
  store: MergeableStore,
  clients: Map<string, Receive>,
): Synchronizer => {
  const clientId = 'client' + clients.size;
  return createCustomSynchronizer(
    store,
    (toClientId, requestId, messageType, messageBody): void => {
      if (toClientId == null) {
        clients.forEach((receive, otherClientId) =>
          otherClientId != clientId
            ? receive(clientId, requestId, messageType, messageBody)
            : 0,
        );
      } else {
        clients.get(toClientId)?.(
          clientId,
          requestId,
          messageType,
          messageBody,
        );
      }
    },
    (receive: Receive): void => {
      clients.set(clientId, receive);
    },
    (): void => {
      clients.delete(clientId);
    },
    0.001,
  );
};

export const mockCustomSynchronizer: Persistable<
  [Map<string, Receive>, Synchronizer, MergeableStore]
> = {
  autoLoadPause: 1,
  getLocation: async (): Promise<
    [Map<string, Receive>, Synchronizer, MergeableStore]
  > => {
    const clients = new Map();
    const store2 = createMergeableStore('s2');
    const synchronizer2 = createCustomLocalSynchronizer(store2, clients);
    await synchronizer2.startSync();
    return [clients, synchronizer2, store2];
  },
  getPersister: (
    store: Store,
    location: [Map<string, Receive>, Synchronizer, MergeableStore],
  ) => createCustomLocalSynchronizer(store as MergeableStore, location[0]),
  get: async (
    location: [Map<string, Receive>, Synchronizer, MergeableStore],
  ): Promise<Content | MergeableContent | void> =>
    location[2].getMergeableContent(),
  set: async (
    location: [Map<string, Receive>, Synchronizer, MergeableStore],
    content: Content | MergeableContent,
  ): Promise<void> => await mockCustomSynchronizer.write(location, content),
  write: async (
    location: [Map<string, Receive>, Synchronizer, MergeableStore],
    rawContent: any,
  ): Promise<void> => {
    location[2].setMergeableContent(rawContent);
  },
  del: async (
    location: [Map<string, Receive>, Synchronizer, MergeableStore],
  ): Promise<void> => {
    location[2].setMergeableContent([
      ['', {}, 0],
      ['', {}, 0],
    ]);
  },
  testMissing: false,
  afterEach: (
    location: [Map<string, Receive>, Synchronizer, MergeableStore],
  ) => {
    location[1].destroy();
  },
};

const getMockedStorage = (
  storage: Storage,
  getPersister: (store: Store, location: string) => Persister,
): Persistable => {
  const mockStorage = {
    getLocation: async (): Promise<string> => 'test' + Math.random(),
    getLocationMethod: [
      'getStorageName',
      (location) => location,
    ] as GetLocationMethod<string>,
    getPersister,
    get: async (location: string): Promise<Content | void> => {
      try {
        return JSON.parse(storage.getItem(location) ?? '');
      } catch {}
    },
    set: async (
      location: string,
      content: Content | MergeableContent,
    ): Promise<void> =>
      await mockStorage.write(location, JSON.stringify(content)),
    write: async (location: string, rawContent: any): Promise<void> => {
      storage.setItem(location, rawContent);
      window.dispatchEvent(
        new StorageEvent('storage', {
          storageArea: storage,
          key: location,
          newValue: rawContent,
        }),
      );
      window.dispatchEvent(
        new StorageEvent('storage', {
          storageArea: storage,
          key: location + 'another',
        }),
      );
    },
    del: async (location: string): Promise<void> =>
      storage.removeItem(location),
    testMissing: true,
  };
  return mockStorage;
};

export const mockLocalStorage = getMockedStorage(
  window.localStorage,
  createLocalPersister,
);

export const mockSessionStorage = getMockedStorage(
  window.sessionStorage,
  createSessionPersister,
);

export const mockRemote: Persistable = {
  beforeEach: (): void => {
    fetchMock.enableMocks();
    fetchMock.resetMocks();
    fetchMock.doMock(async (req) => {
      if (req.url.startsWith(GET_HOST)) {
        const rawBody = await mockRemote.get(req.url.substr(GET_HOST.length));
        if (rawBody != null) {
          const body = JSON.stringify(rawBody);
          return {
            headers: {
              ETag: crypto.createHash('md5').update(body).digest('hex'),
            },
            body: req.method == 'GET' ? body : '',
          };
        }
      }
      if (req.url.startsWith(SET_HOST) && req.method == 'POST') {
        const body = await req.text();
        await mockRemote.write(req.url.substr(SET_HOST.length), body);
      }
      return '';
    });
  },
  autoLoadPause: 500,
  getLocationMethod: [
    'getUrls',
    (location) => [GET_HOST + location, SET_HOST + location],
  ],
  getLocation: async (): Promise<string> => {
    tmp.setGracefulCleanup();
    return tmp.fileSync().name;
  },
  getPersister: (store, location) =>
    createRemotePersister(store, GET_HOST + location, SET_HOST + location, 0.1),
  get: async (location: string): Promise<Content | void> => {
    try {
      return JSON.parse(fs.readFileSync(location, 'utf-8'));
    } catch {}
  },
  set: async (
    location: string,
    content: Content | MergeableContent,
  ): Promise<void> => await mockRemote.write(location, JSON.stringify(content)),
  write: async (location: string, rawContent: any): Promise<void> =>
    fs.writeFileSync(location, rawContent, 'utf-8'),
  del: async (location: string): Promise<void> => fs.unlinkSync(location),
  testMissing: true,
};

export const mockIndexedDb = {
  autoLoadPause: 110,
  getLocation: async (): Promise<string> => 'test' + Math.random(),
  getLocationMethod: [
    'getDbName',
    (location: string) => location,
  ] as GetLocationMethod<string>,
  getPersister: (store: Store, dbName: string) =>
    createIndexedDbPersister(store, dbName, 0.1),
  get: async (dbName: string): Promise<Content | void> => {
    try {
      const db = await openDB(dbName, 2, {
        upgrade: (db) => {
          db.createObjectStore('t', {keyPath: 'k'});
          db.createObjectStore('v', {keyPath: 'k'});
        },
      });
      const result = [
        Object.fromEntries((await db.getAll('t')).map(({k, v}) => [k, v])),
        Object.fromEntries((await db.getAll('v')).map(({k, v}) => [k, v])),
      ];
      db.close();
      return result as any;
    } catch {}
  },
  set: async (dbName: string, rawContent: any): Promise<void> =>
    await mockIndexedDb.write(dbName, rawContent),
  write: async (dbName: string, rawContent: any): Promise<void> => {
    if (typeof rawContent != 'string') {
      const db = await openDB(dbName, 1, {
        upgrade: (db) => {
          db.createObjectStore('t', {keyPath: 'k'});
          db.createObjectStore('v', {keyPath: 'k'});
        },
      });
      await db.clear('t');
      await db.clear('v');
      const [tables, values] = rawContent;
      for (const [k, v] of Object.entries(tables)) {
        await db.put('t', {v, k});
      }
      if (values) {
        for (const [k, v] of Object.entries(values)) {
          await db.put('v', {v, k});
        }
      }
      db.close();
    } else {
      const db = await openDB(dbName, 1, {
        upgrade: (db) => db.createObjectStore('broken'),
      });
      db.close();
    }
  },
  del: async (dbName: string): Promise<void> => await deleteDB(dbName),
  testMissing: true,
};

const getMockedSqlite = <Location>(
  getLocation: () => Promise<Location>,
  getLocationMethod: GetLocationMethod<Location>,
  getPersister: (
    store: Store,
    location: Location,
    storeTableOrConfig: DatabasePersisterConfig,
  ) => Persister,
  cmd: (
    location: Location,
    sql: string,
    args?: any[],
  ) => Promise<{[id: string]: any}[]>,
  close: (location: Location) => Promise<void>,
  autoLoadPause = 10,
  autoLoadIntervalSeconds = 0.1,
): Persistable<Location> => {
  const mockSqlite = {
    beforeEach: mockFetchWasm,
    getLocation,
    getLocationMethod,
    getPersister: (store: Store, location: Location) =>
      getPersister(store, location, {mode: 'json', autoLoadIntervalSeconds}),
    get: async (location: Location): Promise<Content | void> =>
      JSON.parse(
        (
          await cmd(location, 'SELECT store FROM tinybase WHERE _id = ?', ['_'])
        )[0]['store'],
      ),
    set: async (location: Location, rawContent: any): Promise<void> =>
      await mockSqlite.write(location, JSON.stringify(rawContent)),
    write: async (location: Location, rawContent: any): Promise<void> => {
      await cmd(
        location,
        'CREATE TABLE IF NOT EXISTS tinybase ' +
          '(_id PRIMARY KEY ON CONFLICT REPLACE, store);',
      );
      await cmd(location, 'INSERT INTO tinybase (_id, store) VALUES (?, ?)', [
        '_',
        rawContent,
      ]);
    },
    del: async (location: Location) => {
      try {
        await close(location);
      } catch {}
    },
    afterEach: (location: Location) => mockSqlite.del(location),
    testMissing: true,
    autoLoadPause,
  };
  return mockSqlite;
};

export const mockElectricSql = getMockedSqlite<Electric>(
  ...VARIANTS.electricSql,
);

export const mockPowerSync = getMockedSqlite<AbstractPowerSyncDatabase>(
  ...VARIANTS.powerSync,
);

export const mockSqlite3 = getMockedSqlite<Database>(...VARIANTS.sqlite3);

export const mockSqliteWasm = getMockedSqlite<SqliteWasmDb>(
  ...VARIANTS.sqliteWasm,
);

export const mockCrSqliteWasm = getMockedSqlite<DB>(...VARIANTS.crSqliteWasm);

export const mockYjs: Persistable<YDoc> = {
  autoLoadPause: 100,
  getLocation: async () => new YDoc(),
  getLocationMethod: ['getYDoc', (location) => location],
  getPersister: createYjsPersister,
  get: async (yDoc: YDoc): Promise<Content | void> => {
    const yContent = yDoc.getMap('tinybase') as YMap<any>;
    if (yContent.size) {
      return [yContent.get('t').toJSON(), yContent.get('v').toJSON()] as [
        Tables,
        Values,
      ];
    }
  },
  set: async (yDoc: YDoc, rawContent: any): Promise<void> =>
    await mockYjs.write(yDoc, rawContent),
  write: async (yDoc: YDoc, rawContent: any): Promise<void> => {
    yDoc.transact(() => {
      if (typeof rawContent != 'string') {
        const yContent = yDoc.getMap('tinybase');
        if (!yContent.size) {
          yContent.set('t', new YMap());
          yContent.set('v', new YMap());
        }
        const tablesMap = yContent.get('t');
        const valuesMap = yContent.get('v');
        const [tables, values] = rawContent;

        yMapMatch(
          tablesMap as YMap<any>,
          undefined,
          tables,
          (tablesMap, tableId, table) =>
            yMapMatch(tablesMap, tableId, table, (tableMap, rowId, row) =>
              yMapMatch(tableMap, rowId, row, (rowMap, cellId, cell) => {
                if (rowMap.get(cellId) !== cell) {
                  rowMap.set(cellId, cell);
                  return 1;
                }
              }),
            ),
        );
        if (values) {
          yMapMatch(
            valuesMap as YMap<any>,
            undefined,
            values,
            (valuesMap, valueId, value) => {
              if (valuesMap.get(valueId) !== value) {
                valuesMap.set(valueId, value);
              }
            },
          );
        }
      } else {
        yDoc.getArray('broken');
      }
    });
  },
  del: async (location: YDoc): Promise<void> => location.destroy(),
  testMissing: false,
};

export const mockAutomerge: Persistable<DocHandle<any>> = {
  autoLoadPause: 100,
  getLocation: async () => new Repo({network: []}).create(),
  getLocationMethod: ['getDocHandle', (location) => location],
  getPersister: createAutomergePersister,
  get: async (docHandle: DocHandle<any>): Promise<Content | void> => {
    const docContent = (await docHandle.doc())['tinybase'];
    if (Object.keys(docContent).length > 0) {
      return [docContent['t'], docContent['v']] as Content;
    }
  },
  set: async (docHandle: DocHandle<any>, rawContent: any): Promise<void> =>
    await mockAutomerge.write(docHandle, rawContent),
  write: async (docHandle: DocHandle<any>, rawContent: any): Promise<void> => {
    docHandle.change((doc: any) => {
      if (typeof rawContent != 'string') {
        const docContent = doc['tinybase'];
        if (Object.keys(docContent).length == 0) {
          docContent['t'] = {};
          docContent['v'] = {};
        }
        const docTables = docContent['t'];
        const docValues = docContent['v'];
        const [tables, values] = rawContent;

        docObjMatch(docTables, undefined, tables, (_, tableId, table) =>
          docObjMatch(docTables, tableId, table, (docTable, rowId, row) =>
            docObjMatch(docTable, rowId, row, (docRow, cellId, cell) => {
              if (docRow[cellId] !== cell) {
                docRow[cellId] = cell;
                return 1;
              }
            }),
          ),
        );
        if (values) {
          docObjMatch(docValues, undefined, values, (_, valueId, value) => {
            if (docValues[valueId] !== value) {
              docValues[valueId] = value;
            }
          });
        }
      } else {
        doc = 'broken';
      }
    });
  },
  del: async (docHandle: DocHandle<any>): Promise<void> => docHandle.delete(),
  testMissing: false,
};
