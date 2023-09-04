import {IdObj, objHas, objMap, objNew} from '../common/obj';
import {Persister, PersisterListener} from '../types/persisters';
import {Store, Table, Tables, Value, Values} from '../types/store';
import {T, V} from '../common/strings';
import {arrayMap, arrayPush} from '../common/array';
import {promiseAll, promiseNew} from '../common/other';
import {Id} from '../types/common';
import {createCustomPersister} from '../persisters';
import {createIndexedDbPersister as createIndexedDbPersisterDecl} from '../types/persisters/persister-indexed-db';

const WINDOW = globalThis.window;
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
  argument?: any,
): Promise<any> =>
  promiseNew((then) => {
    const request = objectStore[func](argument);
    request.onsuccess = () => then(request.result);
    request.onerror = () => {
      throw 'Error executing against objectStore';
    };
  });

const tried = (actions: () => void, reject: (reason: string) => void) => () => {
  try {
    actions();
  } catch (e) {
    reject(e as string);
  }
};

export const createIndexedDbPersister = ((
  store: Store,
  dbName: string,
  onIgnoredError?: (error: any) => void,
): Persister => {
  const getObjectStores = async (
    create: 0 | 1 = 0,
  ): Promise<[IDBObjectStore, IDBObjectStore]> =>
    promiseNew((then, reject) => {
      const request = WINDOW.indexedDB.open(dbName, 1);
      request.onupgradeneeded = tried(
        () =>
          create &&
          request.result.createObjectStore(T, KEY_PATH) &&
          request.result.createObjectStore(V, KEY_PATH),
        reject,
      );
      request.onsuccess = tried(() => {
        const transaction = request.result.transaction([T, V], 'readwrite');
        then([transaction.objectStore(T), transaction.objectStore(V)]);
      }, reject);
      request.onerror = () => reject('Error opening indexedDB');
    });

  const getPersisted = async (): Promise<[Tables, Values]> => {
    const [tablesObjectStore, valuesObjectStore] = await getObjectStores();
    return [
      objNew(
        arrayMap(
          await execObjectStore(tablesObjectStore, 'getAll'),
          ({k, v}: {k: Id; v: Table}) => [k, v],
        ),
      ),
      objNew(
        arrayMap(
          await execObjectStore(valuesObjectStore, 'getAll'),
          ({k, v}: {k: Id; v: Value}) => [k, v],
        ),
      ),
    ];
  };

  const setPersisted = async (
    getContent: () => [Tables, Values],
  ): Promise<void> => {
    const [tables, values] = getContent();
    const [tablesObjectStore, valuesObjectStore] = await getObjectStores(1);
    await objectStoreMatch(tablesObjectStore, tables);
    await objectStoreMatch(valuesObjectStore, values);
  };

  const addPersisterListener = (listener: PersisterListener): string => {
    listener;
    return '';
  };

  const delPersisterListener = (listener: string): void => {
    listener;
  };

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
  );
}) as typeof createIndexedDbPersisterDecl;
