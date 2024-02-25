/* eslint-disable jest/no-conditional-expect */

import 'fake-indexeddb/auto';
import crypto from 'crypto';
import {DbSchema, ElectricClient} from 'electric-sql/client/model';
import fs from 'fs';
import {deleteDB, openDB} from 'idb';
import fetchMock from 'jest-fetch-mock';
import {Database} from 'sqlite3';
import {
  Changes,
  Content,
  createCustomPersister,
  createStore,
  Id,
  MergeableContent,
  Persister,
  Store,
  Tables,
  Values,
} from 'tinybase/debug';
import {createAutomergePersister} from 'tinybase/debug/persisters/persister-automerge';
import {createIndexedDbPersister} from 'tinybase/debug/persisters/persister-indexed-db';
import {createRemotePersister} from 'tinybase/debug/persisters/persister-remote';
import {createYjsPersister} from 'tinybase/debug/persisters/persister-yjs';
import tmp from 'tmp';
import {Doc as YDoc, Map as YMap} from 'yjs';
import {DocHandle, Repo} from '@automerge/automerge-repo';
import {AbstractPowerSyncDatabase} from '@journeyapps/powersync-sdk-common';
import {DB} from '@vlcn.io/crsqlite-wasm';
import {mockFetchWasm, pause} from '../common/other';
import {GetLocationMethod, nextLoop, Persistable} from './common';
import {mockFile, mockLocalStorage, mockSessionStorage} from './mocks';
import {SqliteWasmDb, VARIANTS} from './sqlite';

const GET_HOST = 'http://get.com';
const SET_HOST = 'http://set.com';

const electricSchema = new DbSchema({}, []);
type Electric = ElectricClient<typeof electricSchema>;

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
  | ((getContent?: () => Content) => void)
  | ((getContent?: () => Content, getChanges?: () => Changes) => void)
  | undefined;
let customPersisterChanges: Changes = [{}, {}];

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
      async () => {
        try {
          return JSON.parse(customPersister);
        } catch {}
      },
      async (getContent, getChanges) => {
        customPersister = getContent();
        customPersisterChanges = getChanges?.() ?? [{}, {}];
      },
      (listener) => {
        customPersisterListener = listener;
      },
      () => (customPersisterListener = undefined),
      undefined,
      supportsMergeableStore,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      ['getFoo', 'foo'],
    );
  },
  get: async (): Promise<Content | void> => customPersister,
  set: async (
    location: string,
    content: Content | MergeableContent,
  ): Promise<void> => await write(location, JSON.stringify(content)),
  write,
  del: async (): Promise<void> => {
    customPersister = '';
  },
  getChanges: () => customPersisterChanges,
  testMissing: true,
});

const mockNoContentListener: Persistable<string> = getMockedCustom(
  async (_location: string, rawContent: any): Promise<void> => {
    customPersister = rawContent;
    customPersisterListener?.();
  },
);

const mockContentListener: Persistable<string> = getMockedCustom(
  async (_location: string, rawContent: any): Promise<void> => {
    customPersister = rawContent;
    let content: Content;
    try {
      content = JSON.parse(rawContent);
    } catch (e) {
      content = [] as any;
    }
    customPersisterListener?.(() => content);
  },
);

const mockChangesListener: Persistable<string> = getMockedCustom(
  async (_location: string, rawContent: any): Promise<void> => {
    customPersister = rawContent;
    let content: Content;
    try {
      content = JSON.parse(rawContent);
    } catch (e) {
      content = [] as any;
    }
    customPersisterListener?.(
      () => content, // content
      () => content, // changes
    );
  },
);

const mockMergeableNoContentListener: Persistable<string> = getMockedCustom(
  async (_location: string, rawContent: any): Promise<void> => {
    customPersister = rawContent;
    customPersisterListener?.();
  },
  true,
);

const mockMergeableContentListener: Persistable<string> = getMockedCustom(
  async (_location: string, rawContent: any): Promise<void> => {
    customPersister = rawContent;
    let content: Content;
    try {
      content = JSON.parse(rawContent);
    } catch (e) {
      content = [] as any;
    }
    customPersisterListener?.(() => content);
  },
  true,
);

const mockMergeableChangesListener: Persistable<string> = getMockedCustom(
  async (_location: string, rawContent: any): Promise<void> => {
    customPersister = rawContent;
    let content: Content;
    try {
      content = JSON.parse(rawContent);
    } catch (e) {
      content = [] as any;
    }
    customPersisterListener?.(
      () => content, // content
      () => content, // changes
    );
  },
  true,
);

const mockRemote: Persistable = {
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

const mockIndexedDb = {
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
  getPersister: (store: Store, location: Location) => Persister,
  cmd: (
    location: Location,
    sql: string,
    args?: any[],
  ) => Promise<{[id: string]: any}[]>,
  close: (location: Location) => Promise<void>,
  autoLoadPause: number | undefined,
): Persistable<Location> => {
  const mockSqlite = {
    beforeEach: mockFetchWasm,
    getLocation,
    getLocationMethod,
    getPersister,
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

const mockElectricSql = getMockedSqlite<Electric>(...VARIANTS.electricSql);

const mockPowerSync = getMockedSqlite<AbstractPowerSyncDatabase>(
  ...VARIANTS.powerSync,
);

const mockSqlite3 = getMockedSqlite<Database>(...VARIANTS.sqlite3);

const mockSqliteWasm = getMockedSqlite<SqliteWasmDb>(...VARIANTS.sqliteWasm);

const mockCrSqliteWasm = getMockedSqlite<DB>(...VARIANTS.crSqliteWasm);

const mockYjs: Persistable<YDoc> = {
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

const mockAutomerge: Persistable<DocHandle<any>> = {
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

describe.each([
  ['mockChangesListener', mockChangesListener],
  ['mockNoContentListener', mockNoContentListener],
  ['mockContentListener', mockContentListener],
  ['mockMergeableNoContentListener', mockMergeableNoContentListener],
  ['mockMergeableContentListener', mockMergeableContentListener],
  ['mockMergeableChangesListener', mockMergeableChangesListener],
  ['file', mockFile],
  ['localStorage', mockLocalStorage],
  ['sessionStorage', mockSessionStorage],
  ['remote', mockRemote],
  ['indexedDb', mockIndexedDb],
  ['electricSql', mockElectricSql],
  ['powerSync', mockPowerSync],
  ['sqlite3', mockSqlite3],
  ['sqliteWasm', mockSqliteWasm],
  ['crSqliteWasm', mockCrSqliteWasm],
  ['yjs', mockYjs],
  ['automerge', mockAutomerge],
])('Persists to/from %s', (name: string, persistable: Persistable<any>) => {
  let location: string;
  let getLocationMethod: GetLocationMethod<any> | undefined;
  let store: Store;
  let persister: Persister;

  beforeEach(async () => {
    if (persistable.beforeEach != null) {
      persistable.beforeEach();
    }
    store = createStore();
    location = await persistable.getLocation();
    getLocationMethod = persistable.getLocationMethod;
    persister = persistable.getPersister(store, location);
  });

  afterEach(() => {
    persister.destroy();
    if (persistable.afterEach != null) {
      persistable.afterEach(location);
    }
  });

  // ---

  test('gets store', () => {
    expect(persister.getStore()).toEqual(store);
  });

  test('gets second parameter', () => {
    if (getLocationMethod) {
      expect((persister as any)[getLocationMethod[0]]()).toEqual(
        getLocationMethod[1](location),
      );
    }
  });

  test('saves', async () => {
    store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
    await persister.save();
    expect(await persistable.get(location)).toEqual([
      {t1: {r1: {c1: 1}}},
      {v1: 1},
    ]);
    expect(persister.getStats()).toEqual({loads: 0, saves: 1});
  });

  test('autoSaves', async () => {
    store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
    await persister.startAutoSave();
    expect(await persistable.get(location)).toEqual([
      {t1: {r1: {c1: 1}}},
      {v1: 1},
    ]);
    expect(persister.getStats()).toEqual({loads: 0, saves: 1});
    store.setTables({t1: {r1: {c1: 2}}});
    await pause();
    expect(await persistable.get(location)).toEqual([
      {t1: {r1: {c1: 2}}},
      {v1: 1},
    ]);
    store.setTables({t1: {r1: {c1: 2}}});
    await pause();
    expect(await persistable.get(location)).toEqual([
      {t1: {r1: {c1: 2}}},
      {v1: 1},
    ]);
    if (persistable.getChanges) {
      expect(persistable.getChanges()).toEqual([{t1: {r1: {c1: 2}}}, {}]);
    }
    store.setValues({v1: 2});
    await pause();
    expect(await persistable.get(location)).toEqual([
      {t1: {r1: {c1: 2}}},
      {v1: 2},
    ]);
    if (persistable.getChanges) {
      expect(persistable.getChanges()).toEqual([{}, {v1: 2}]);
    }
    expect(persister.getStats()).toEqual({loads: 0, saves: 3});
  });

  test('autoSaves without race', async () => {
    if (name == 'file') {
      store.setTables({t1: {r1: {c1: 1}}});
      await persister.startAutoSave();
      expect(await persistable.get(location)).toEqual([
        {t1: {r1: {c1: 1}}},
        {},
      ]);
      expect(persister.getStats()).toEqual({loads: 0, saves: 1});
      store.setTables({t1: {r1: {c1: 2}}});
      store.setTables({t1: {r1: {c1: 3}}});
      await pause();
      expect(await persistable.get(location)).toEqual([
        {t1: {r1: {c1: 3}}},
        {},
      ]);
      expect(persister.getStats()).toEqual({loads: 0, saves: 3});
    }
  });

  test('loads', async () => {
    await persistable.set(location, [{t1: {r1: {c1: 1}}}, {v1: 1}]);
    await persister.load();
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    expect(store.getValues()).toEqual({v1: 1});
    expect(persister.getStats()).toEqual({loads: 1, saves: 0});
  });

  test('loads backwards compatible', async () => {
    await persistable.set(location, [{t1: {r1: {c1: 1}}}] as any);
    await persister.load();
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    expect(persister.getStats()).toEqual({loads: 1, saves: 0});
  });

  test('does not load from empty', async () => {
    store.setTables({t1: {r1: {c1: 1}}});
    await persister.load();
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    expect(persister.getStats()).toEqual({loads: 1, saves: 0});
  });

  test('loads default when empty', async () => {
    store.setTables({t1: {r1: {c1: 1}}});
    await persister.load({t1: {r1: {c1: 2}}}, {v1: 1});
    expect(store.getTables()).toEqual({t1: {r1: {c1: 2}}});
    expect(store.getValues()).toEqual({v1: 1});
    expect(persister.getStats()).toEqual({loads: 1, saves: 0});
  });

  test('does not load from corrupt', async () => {
    store.setTables({t1: {r1: {c1: 1}}});
    persistable.write(location, '{');
    await persister.load();
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    expect(persister.getStats()).toEqual({loads: 1, saves: 0});
  });

  test('autoLoads', async () => {
    await persistable.set(location, [{t1: {r1: {c1: 1}}}, {}]);
    await persister.startAutoLoad();
    await nextLoop();
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    expect(persister.getStats()).toEqual({loads: 1, saves: 0});
    await persistable.set(location, [{t1: {r1: {c1: 2}}}, {}]);
    await pause(persistable.autoLoadPause);
    expect(store.getTables()).toEqual({t1: {r1: {c1: 2}}});
    expect(persister.getStats()).toEqual({loads: 2, saves: 0});
    await persistable.set(location, [{t1: {r1: {c1: 3}}}, {}]);
    await pause(persistable.autoLoadPause);
    expect(store.getTables()).toEqual({t1: {r1: {c1: 3}}});
    expect(persister.getStats()).toEqual({loads: 3, saves: 0});
    persister.stopAutoLoad();
    await persistable.set(location, [{t1: {r1: {c1: 4}}}, {}]);
    await pause(persistable.autoLoadPause);
    expect(store.getTables()).toEqual({t1: {r1: {c1: 3}}});
    expect(persister.getStats()).toEqual({loads: 3, saves: 0});
  });

  test('autoSave & autoLoad: no load when saving', async () => {
    if (name == 'file') {
      await persister.startAutoLoad({t1: {r1: {c1: 1}}});
      await persister.startAutoSave();
      await nextLoop();
      expect(persister.getStats()).toEqual({loads: 1, saves: 1});
      store.setTables({t1: {r1: {c1: 2}}});
      await nextLoop();
      expect(persister.getStats()).toEqual({loads: 1, saves: 2});
    }
  });

  test('autoSave & autoLoad: no save when loading', async () => {
    if (name == 'file') {
      await persister.startAutoLoad({t1: {r1: {c1: 1}}});
      await persister.startAutoSave();
      await nextLoop();
      expect(persister.getStats()).toEqual({loads: 1, saves: 1});
      await persistable.set(location, [{t1: {r1: {c1: 2}}}, {}]);
      await nextLoop();
      expect(persister.getStats()).toEqual({loads: 2, saves: 1});
    }
  });

  test('does not delete when autoLoaded is deleted', async () => {
    await persistable.set(location, [{t1: {r1: {c1: 1}}}, {}]);
    await persister.startAutoLoad({});
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    await persistable.del(location);
    await pause(persistable.autoLoadPause);
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
  });

  test('does not delete when autoLoaded is corrupted', async () => {
    await persistable.set(location, [{t1: {r1: {c1: 1}}}, {}]);
    await persister.startAutoLoad({});
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    persistable.write(location, '{');
    await pause(persistable.autoLoadPause);
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
  });

  test('does not load from non-existent', async () => {
    if (persistable.testMissing) {
      store.setTables({t1: {r1: {c1: 1}}});
      await persistable.getPersister(store, '_').load();
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    }
  });

  test('does not load from possibly invalid', async () => {
    if (name == 'file') {
      store.setTables({t1: {r1: {c1: 1}}});
      await persistable.getPersister(store, '.').load();
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    }
  });

  test('does not error on save to possibly invalid', async () => {
    if (name == 'file') {
      store.setTables({t1: {r1: {c1: 1}}});
      await persistable.getPersister(store, '.').save();
      expect(store.getTables()).toEqual({t1: {r1: {c1: 1}}});
    }
  });
});
