import {Cell, Row, Tables, TransactionChanges, Values} from '../types/store';
import {Connection, Party, Request, Storage} from 'partykit/server';
import {EMPTY_STRING, T, V} from '../common/strings';
import {
  PUT,
  SET_CHANGES,
  STORE_PATH,
  StorageKeyType,
  constructMessage,
  deconstructMessage,
} from './partykit/common';
import {
  TinyBasePartyKitServerConfig,
  TinyBasePartyKitServer as TinyBasePartyKitServerDecl,
} from '../types/persisters/persister-partykit-server';
import {
  arrayEvery,
  arrayIsEmpty,
  arrayMap,
  arrayPush,
  arrayUnshift,
} from '../common/array';
import {isUndefined, promiseAll, size, slice} from '../common/other';
import {jsonParse, jsonString} from '../common/json';
import {objEnsure, objMap, objNew} from '../common/obj';
import {Ids} from '../types/common';
import {mapForEach} from '../common/map';

/**
 * DurableStorage:
 *   prefix_hasStore: 1
 *   prefix_t"t1","r1","c1": 'c'
 *   prefix_vv1: 'v'
 */

const HAS_STORE = 'hasStore';
const RESPONSE_HEADERS = objNew(
  arrayMap(['Origin', 'Methods', 'Headers'], (suffix) => [
    'Access-Control-Allow-' + suffix,
    '*',
  ]),
);

const hasStoreInStorage = async (
  that: TinyBasePartyKitServer,
): Promise<1 | undefined> =>
  await that.party.storage.get<1>(
    (that.config.storagePrefix ?? EMPTY_STRING) + HAS_STORE,
  );

const loadStoreFromStorage = async (storage: Storage, prefix: string) => {
  const tables: Tables = {};
  const values: Values = {};
  mapForEach(
    await storage.list<string | number | boolean>(),
    (key, cellOrValue) => {
      if (key.startsWith(prefix)) {
        key = slice(key, size(prefix));
        const [type, ids] = deconstructMessage(key);
        if (type == T) {
          const [tableId, rowId, cellId] = jsonParse('[' + ids + ']');
          objEnsure(
            objEnsure(tables, tableId, objNew<Row>),
            rowId,
            objNew<Cell>,
          )[cellId] = cellOrValue;
        } else if (type == V) {
          values[ids] = cellOrValue;
        }
      }
    },
  );
  return [tables, values];
};

const saveStoreToStorage = async (
  storage: Storage,
  prefix: string,
  transactionChanges: TransactionChanges,
) => {
  const promises: Promise<any>[] = [storage.put<1>(prefix + HAS_STORE, 1)];
  const keyPrefixesToDelete: string[] = [];
  objMap(transactionChanges[0], (table, tableId) =>
    isUndefined(table)
      ? arrayUnshift(
          keyPrefixesToDelete,
          prefix + getStoreStorageKey(T, tableId),
        )
      : objMap(table, (row, rowId) =>
          isUndefined(row)
            ? arrayPush(
                keyPrefixesToDelete,
                prefix + getStoreStorageKey(T, tableId, rowId),
              )
            : objMap(row, (cell, cellId) =>
                promiseToSetOrDelStorage(
                  promises,
                  storage,
                  prefix + getStoreStorageKey(T, tableId, rowId, cellId),
                  cell,
                ),
              ),
        ),
  );
  objMap(transactionChanges[1], (value, valueId) =>
    promiseToSetOrDelStorage(promises, storage, prefix + V + valueId, value),
  );
  if (!arrayIsEmpty(keyPrefixesToDelete)) {
    mapForEach(await storage.list<string | number | boolean>(), (key) =>
      arrayEvery(
        keyPrefixesToDelete,
        (keyPrefixToDelete) =>
          !key.startsWith(keyPrefixToDelete) ||
          ((promiseToSetOrDelStorage(promises, storage, key) as any) && false),
      ),
    );
  }
  await promiseAll(promises);
};

const getStoreStorageKey = (type: StorageKeyType, ...ids: Ids) =>
  type + slice(jsonString(ids), 1, -1);

const promiseToSetOrDelStorage = (
  promises: Promise<any>[],
  storage: Storage,
  key: string,
  value?: string | number | boolean | null,
) =>
  arrayPush(
    promises,
    isUndefined(value)
      ? storage.delete(key)
      : storage.put<string | number | boolean>(key, value),
  );

const createResponse = async (
  that: TinyBasePartyKitServer,
  status: number,
  body: string | null = null,
) =>
  new Response(body, {
    status,
    headers: that.config.responseHeaders ?? RESPONSE_HEADERS,
  });

export class TinyBasePartyKitServer implements TinyBasePartyKitServerDecl {
  constructor(readonly party: Party) {}

  readonly config: TinyBasePartyKitServerConfig = {};

  async onRequest(request: Request): Promise<Response> {
    const storage = this.party.storage;
    const prefix = this.config.storagePrefix ?? EMPTY_STRING;
    const storePath = this.config.storePath ?? STORE_PATH;

    if (new URL(request.url).pathname.endsWith(storePath)) {
      const hasStore = await hasStoreInStorage(this);
      const text = await request.text();
      if (request.method == PUT) {
        if (hasStore) {
          return createResponse(this, 205);
        }
        await saveStoreToStorage(storage, prefix, jsonParse(text));
        return createResponse(this, 201);
      }
      return createResponse(
        this,
        200,
        hasStore
          ? jsonString(await loadStoreFromStorage(storage, prefix))
          : EMPTY_STRING,
      );
    }
    return createResponse(this, 404);
  }

  async onMessage(message: string, client: Connection) {
    const storage = this.party.storage;
    const prefix = this.config.storagePrefix ?? EMPTY_STRING;
    const [type, payload] = deconstructMessage(message, 1);

    if (type == SET_CHANGES && (await hasStoreInStorage(this))) {
      await saveStoreToStorage(storage, prefix, payload);
      this.party.broadcast(constructMessage(SET_CHANGES, payload), [client.id]);
    }
  }
}
