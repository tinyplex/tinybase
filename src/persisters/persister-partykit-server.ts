import {Cell, Row, Tables, TransactionChanges, Values} from '../types/store';
import {Connection, Party, Request, Storage} from 'partykit/server';
import {EMPTY_STRING, T, V, strStartsWith} from '../common/strings';
import {
  PUT,
  SET_CHANGES,
  STORE_PATH,
  StorageKeyType,
  construct,
  deconstruct,
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
import {ifNotUndefined, isUndefined, promiseAll, slice} from '../common/other';
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

const hasStore = async (that: TinyBasePartyKitServer): Promise<1 | undefined> =>
  await that.party.storage.get<1>(
    (that.config.storagePrefix ?? EMPTY_STRING) + HAS_STORE,
  );

const loadStore = async (that: TinyBasePartyKitServer) => {
  const tables: Tables = {};
  const values: Values = {};
  const storagePrefix = that.config.storagePrefix ?? EMPTY_STRING;
  mapForEach(
    await that.party.storage.list<string | number | boolean>(),
    (key, cellOrValue) =>
      ifNotUndefined(deconstruct(storagePrefix, key), ([type, ids]) => {
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
      }),
  );
  return [tables, values];
};

const saveStore = async (
  that: TinyBasePartyKitServer,
  transactionChanges: TransactionChanges,
  initialSave: boolean,
  requestOrConnection: Request | Connection,
) => {
  const storage = that.party.storage;
  const storagePrefix = that.config.storagePrefix ?? EMPTY_STRING;
  const promises: Promise<any>[] = [
    storage.put<1>(storagePrefix + HAS_STORE, 1),
  ];
  const keyPrefixesToDelete: string[] = [];
  that.onWillSaveTransactionChanges(
    transactionChanges,
    initialSave,
    requestOrConnection,
  );
  objMap(transactionChanges[0], (table, tableId) =>
    isUndefined(table)
      ? arrayUnshift(
          keyPrefixesToDelete,
          constructStorageKey(storagePrefix, T, tableId),
        )
      : objMap(table, (row, rowId) =>
          isUndefined(row)
            ? arrayPush(
                keyPrefixesToDelete,
                constructStorageKey(storagePrefix, T, tableId, rowId),
              )
            : objMap(row, (cell, cellId) =>
                promiseToSetOrDelStorage(
                  promises,
                  storage,
                  constructStorageKey(storagePrefix, T, tableId, rowId, cellId),
                  cell,
                ),
              ),
        ),
  );
  objMap(transactionChanges[1], (value, valueId) =>
    promiseToSetOrDelStorage(
      promises,
      storage,
      storagePrefix + V + valueId,
      value,
    ),
  );
  if (!arrayIsEmpty(keyPrefixesToDelete)) {
    mapForEach(await storage.list<string | number | boolean>(), (key) =>
      arrayEvery(
        keyPrefixesToDelete,
        (keyPrefixToDelete) =>
          !strStartsWith(key, keyPrefixToDelete) ||
          ((promiseToSetOrDelStorage(promises, storage, key) as any) && false),
      ),
    );
  }
  await promiseAll(promises);
};

const constructStorageKey = (
  storagePrefix: string,
  type: StorageKeyType,
  ...ids: Ids
) => construct(storagePrefix, type, slice(jsonString(ids), 1, -1));

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
    const storePath = this.config.storePath ?? STORE_PATH;
    if (new URL(request.url).pathname.endsWith(storePath)) {
      const hasExistingStore = await hasStore(this);
      const text = await request.text();
      if (request.method == PUT) {
        if (hasExistingStore) {
          return createResponse(this, 205);
        }
        await saveStore(this, jsonParse(text), true, request);
        return createResponse(this, 201);
      }
      return createResponse(
        this,
        200,
        hasExistingStore ? jsonString(await loadStore(this)) : EMPTY_STRING,
      );
    }
    return createResponse(this, 404);
  }

  async onMessage(message: string, connection: Connection) {
    const messagePrefix = this.config.messagePrefix ?? EMPTY_STRING;
    await ifNotUndefined(
      deconstruct(messagePrefix, message, 1),
      async ([type, payload]) => {
        if (type == SET_CHANGES && (await hasStore(this))) {
          await saveStore(this, payload, false, connection);
          this.party.broadcast(construct(messagePrefix, SET_CHANGES, payload));
        }
      },
    );
  }

  async onWillSaveTransactionChanges(
    _transactionChanges: TransactionChanges,
    _initialSave: boolean,
    _requestOrConnection: Request | Connection,
  ) {}
}
