import type {Content, Store, Table} from '../../@types/store/index.d.ts';
import {IdObj, objHas, objNew, objToArray} from '../../common/obj.ts';
import type {
  IndexedDbPersister,
  createIndexedDbPersister as createIndexedDbPersisterDecl,
} from '../../@types/persisters/persister-indexed-db/index.d.ts';
import {T, V} from '../../common/strings.ts';
import {
  WINDOW,
  promiseAll,
  promiseNew,
  startInterval,
  stopInterval,
} from '../../common/other.ts';
import {arrayMap, arrayPush} from '../../common/array.ts';
import type {Id} from '../../@types/common/index.d.ts';
import type {PersisterListener} from '../../@types/persisters/index.d.ts';
import {createCustomPersister} from '../index.ts';

const OBJECT_STORE_NAMES = [T, V];
const KEY_PATH = {keyPath: 'k'};

export const objectStoreMatch = async (
  objectStore: IDBObjectStore,
  obj: IdObj<any>,
): Promise<void> => {
  const actions = objToArray(obj, (v, k) =>
    execObjectStore(objectStore, 'put', {k, v}),
  );
  arrayMap(await execObjectStore(objectStore, 'getAllKeys'), (id: Id) =>
    objHas(obj, id)
      ? 0
      : arrayPush(actions, execObjectStore(objectStore, 'delete', id)),
  );
  await promiseAll(actions);
};

const execObjectStore = async (
  objectStore: IDBObjectStore,
  func: 'getAll' | 'getAllKeys' | 'delete' | 'put',
  arg?: any,
): Promise<any> =>
  promiseNew((resolve, reject) => {
    const request = objectStore[func](arg);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(`objectStore.${func} error`);
  });

export const createIndexedDbPersister = ((
  store: Store,
  dbName: string,
  autoLoadIntervalSeconds = 1,
  onIgnoredError?: (error: any) => void,
): IndexedDbPersister => {
  const forObjectStores = async (
    forObjectStore: (objectStore: IDBObjectStore, arg: any) => Promise<any>,
    args: any[] = [],
    create: 0 | 1 = 0,
  ): Promise<[any, any]> =>
    promiseNew((resolve, reject) => {
      const request = (WINDOW ? WINDOW.indexedDB : indexedDB).open(
        dbName,
        create ? 2 : undefined,
      );
      request.onupgradeneeded = () =>
        create &&
        arrayMap(OBJECT_STORE_NAMES, (objectStoreName) => {
          try {
            request.result.createObjectStore(objectStoreName, KEY_PATH);
          } catch {}
        });
      request.onsuccess = async () => {
        try {
          const transaction = request.result.transaction(
            OBJECT_STORE_NAMES,
            'readwrite',
          );
          const result = await promiseAll(
            arrayMap(
              OBJECT_STORE_NAMES,
              async (objectStoreName, index) =>
                await forObjectStore(
                  transaction.objectStore(objectStoreName),
                  args[index],
                ),
            ),
          );
          request.result.close();
          resolve(result as [any, any]);
        } catch (e) {
          request.result.close();
          reject(e);
        }
      };
      request.onerror = () => reject('indexedDB.open error');
    });

  const getPersisted = async (): Promise<Content> =>
    await forObjectStores(async (objectStore) =>
      objNew(
        arrayMap(
          await execObjectStore(objectStore, 'getAll'),
          ({k, v}: {k: Id; v: Table}) => [k, v],
        ),
      ),
    );

  const setPersisted = async (getContent: () => Content): Promise<void> =>
    (await forObjectStores(
      async (objectStore, content) =>
        await objectStoreMatch(objectStore, content),
      getContent(),
      1,
    )) as any;

  const addPersisterListener = (listener: PersisterListener): NodeJS.Timeout =>
    startInterval(listener, autoLoadIntervalSeconds);

  const delPersisterListener = (interval: NodeJS.Timeout): void =>
    stopInterval(interval);

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
    1,
    {getDbName: () => dbName},
  ) as IndexedDbPersister;
}) as typeof createIndexedDbPersisterDecl;
