import type {Id} from '../../@types/common/index.d.ts';
import type {PersisterListener} from '../../@types/persisters/index.d.ts';
import type {
  IndexedDbPersister,
  createIndexedDbPersister as createIndexedDbPersisterDecl,
} from '../../@types/persisters/persister-indexed-db/index.d.ts';
import type {Content, Store, Table} from '../../@types/store/index.d.ts';
import {arrayMap, arrayPush} from '../../common/array.ts';
import {
  ERROR_INDEXED_DB_OPEN,
  ERROR_INDEXED_DB_STORE,
  errorNew,
  tryCatch,
} from '../../common/error.ts';
import {jsonStringWithUndefined} from '../../common/json.ts';
import {IdObj, objHas, objNew, objToArray} from '../../common/obj.ts';
import {
  WINDOW,
  promiseAll,
  promiseNew,
  startInterval,
  stopInterval,
} from '../../common/other.ts';
import {T, V} from '../../common/strings.ts';
import {createCustomPersister} from '../common/create.ts';

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
    request.onerror = () => reject(errorNew(ERROR_INDEXED_DB_STORE, func));
  });

export const createIndexedDbPersister = ((
  store: Store,
  dbName: string,
  autoLoadIntervalSeconds = 1,
  onIgnoredError?: (error: any) => void,
): IndexedDbPersister => {
  const forObjectStores = async (
    forObjectStore: (objectStore: IDBObjectStore, arg: any) => Promise<any>,
    params: any[] = [],
    create: 0 | 1 = 0,
    mode: IDBTransactionMode = 'readonly',
  ): Promise<[any, any]> =>
    promiseNew((resolve, reject) => {
      const request = (WINDOW ? WINDOW.indexedDB : indexedDB).open(
        dbName,
        create ? 2 : undefined,
      );
      let blocked = 0;
      request.onupgradeneeded = () =>
        create &&
        arrayMap(OBJECT_STORE_NAMES, (objectStoreName) =>
          tryCatch(() =>
            request.result.createObjectStore(objectStoreName, KEY_PATH),
          ),
        );
      request.onblocked = () => {
        blocked = 1;
        reject(errorNew(ERROR_INDEXED_DB_OPEN));
      };
      request.onsuccess = () =>
        blocked
          ? request.result.close()
          : tryCatch(
              async () => {
                request.result.onversionchange = () => request.result.close();
                const transaction = request.result.transaction(
                  OBJECT_STORE_NAMES,
                  mode,
                );
                const transactionComplete = promiseNew<void>(
                  (resolve, reject) => {
                    transaction.oncomplete = () => resolve();
                    transaction.onerror = transaction.onabort = () =>
                      reject(errorNew(ERROR_INDEXED_DB_STORE));
                  },
                );
                const [result] = await promiseAll([
                  promiseAll(
                    arrayMap(OBJECT_STORE_NAMES, (objectStoreName, index) =>
                      forObjectStore(
                        transaction.objectStore(objectStoreName),
                        params[index],
                      ),
                    ),
                  ),
                  transactionComplete,
                ]);
                request.result.close();
                resolve(result as [any, any]);
              },
              (error) => {
                request.result.close();
                reject(error);
              },
            );
      request.onerror = () => reject(errorNew(ERROR_INDEXED_DB_OPEN));
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

  const setPersisted = (getContent: () => Content): Promise<void> =>
    forObjectStores(
      (objectStore, content) => objectStoreMatch(objectStore, content),
      getContent(),
      1,
      'readwrite',
    ) as any;

  const addPersisterListener = (
    listener: PersisterListener,
  ): Promise<number | NodeJS.Timeout> => {
    let listening = false;
    return getPersisted().then((content) => {
      let lastContent = jsonStringWithUndefined(content);
      return startInterval(async () => {
        if (!listening) {
          listening = true;
          try {
            await tryCatch(async () => {
              const content = await getPersisted();
              const nextContent = jsonStringWithUndefined(content);
              if (nextContent != lastContent) {
                lastContent = nextContent;
                await listener(content);
              }
            });
          } finally {
            listening = false;
          }
        }
      }, autoLoadIntervalSeconds);
    });
  };

  const delPersisterListener = (interval: number | NodeJS.Timeout): void =>
    stopInterval(interval);

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
    1, // StoreOnly,
    {getDbName: () => dbName},
  ) as IndexedDbPersister;
}) as typeof createIndexedDbPersisterDecl;
