import {IdObj, objHas, objMap, objNew} from '../common/obj';
import {Persister, PersisterListener} from '../types/persisters';
import {Store, Table, Tables, Values} from '../types/store';
import {T, V} from '../common/strings';
import {arrayMap, arrayPush} from '../common/array';
import {
  promiseAll,
  promiseNew,
  startInterval,
  stopInterval,
} from '../common/other';
import {Id} from '../types/common';
import {createCustomPersister} from '../persisters';
import {createIndexedDbPersister as createIndexedDbPersisterDecl} from '../types/persisters/persister-indexed-db';

const WINDOW = globalThis.window;
const OBJECT_STORE_NAMES = [T, V];
const KEY_PATH = {keyPath: 'k'};

export const objectStoreMatch = async (
  objectStore: IDBObjectStore,
  obj: IdObj<any>,
): Promise<void> => {
  const actions = objMap(obj, (v, k) =>
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
): Persister => {
  const forObjectStores = async (
    forObjectStore: (objectStore: IDBObjectStore, arg: any) => Promise<any>,
    args: any[] = [],
    create: 0 | 1 = 0,
  ): Promise<[any, any]> =>
    promiseNew((resolve, reject) => {
      const request = WINDOW.indexedDB.open(dbName, create ? 2 : undefined);
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
          reject(e);
        }
      };
      request.onerror = () => reject('indexedDB.open error');
    });

  const getPersisted = async (): Promise<[Tables, Values]> =>
    await forObjectStores(async (objectStore) =>
      objNew(
        arrayMap(
          await execObjectStore(objectStore, 'getAll'),
          ({k, v}: {k: Id; v: Table}) => [k, v],
        ),
      ),
    );

  const setPersisted = async (
    getContent: () => [Tables, Values],
  ): Promise<void> =>
    (await forObjectStores(
      async (objectStore, content) =>
        await objectStoreMatch(objectStore, content),
      getContent(),
      1,
    )) as any;

  const addPersisterListener = (listener: PersisterListener): NodeJS.Timeout =>
    startInterval(listener, autoLoadIntervalSeconds * 1000);

  const delPersisterListener = (interval: NodeJS.Timeout): void =>
    stopInterval(interval);

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
    ['getDbName', dbName],
  );
}) as typeof createIndexedDbPersisterDecl;
