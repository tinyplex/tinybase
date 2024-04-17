import {
  Cell,
  CellOrUndefined,
  Changes,
  Content,
  Row,
  Tables,
  Value,
  ValueOrUndefined,
  Values,
} from '../types/store';
import {Connection, Party, Request, Storage} from 'partykit/server';
import {EMPTY_STRING, T, V, strStartsWith} from '../common/strings';
import {Id, Ids} from '../types/common';
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
import {jsonParse, jsonStringWithMap} from '../common/json';
import {objEnsure, objNew, objToArray} from '../common/obj';
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

export const hasStoreInStorage = async (
  storage: Storage,
  storagePrefix = EMPTY_STRING,
): Promise<boolean> => !!(await storage.get<1>(storagePrefix + HAS_STORE));

export const loadStoreFromStorage = async (
  storage: Storage,
  storagePrefix = EMPTY_STRING,
): Promise<Content> => {
  const tables: Tables = {};
  const values: Values = {};
  mapForEach(
    await storage.list<string | number | boolean>(),
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

export const broadcastChanges = async (
  server: TinyBasePartyKitServer,
  changes: Changes,
  without?: string[],
): Promise<void> =>
  server.party.broadcast(
    construct(server.config.messagePrefix!, SET_CHANGES, changes),
    without,
  );

const saveStore = async (
  that: TinyBasePartyKitServer,
  changes: Changes,
  initialSave: boolean,
  requestOrConnection: Request | Connection,
) => {
  const storage = that.party.storage;
  const storagePrefix = that.config.storagePrefix!;

  const keysToSet: {[key: string]: Cell | Value} = {
    [storagePrefix + HAS_STORE]: 1,
  };
  const keysToDel: string[] = [];
  const keyPrefixesToDel: string[] = [];

  await promiseAll(
    objToArray(changes[0], async (table, tableId) =>
      isUndefined(table)
        ? !initialSave &&
          (await that.canDelTable(
            tableId,
            requestOrConnection as Connection,
          )) &&
          arrayUnshift(
            keyPrefixesToDel,
            constructStorageKey(storagePrefix, T, tableId),
          )
        : (await that.canSetTable(tableId, initialSave, requestOrConnection)) &&
          (await promiseAll(
            objToArray(table, async (row, rowId) =>
              isUndefined(row)
                ? !initialSave &&
                  (await that.canDelRow(
                    tableId,
                    rowId,
                    requestOrConnection as Connection,
                  )) &&
                  arrayPush(
                    keyPrefixesToDel,
                    constructStorageKey(storagePrefix, T, tableId, rowId),
                  )
                : (await that.canSetRow(
                    tableId,
                    rowId,
                    initialSave,
                    requestOrConnection,
                  )) &&
                  (await promiseAll(
                    objToArray(row, async (cell, cellId) => {
                      const ids: [Id, Id, Id] = [tableId, rowId, cellId];
                      const key = constructStorageKey(storagePrefix, T, ...ids);
                      isUndefined(cell)
                        ? !initialSave &&
                          (await that.canDelCell(
                            ...ids,
                            requestOrConnection as Connection,
                          )) &&
                          arrayPush(keysToDel, key)
                        : (await that.canSetCell(
                            ...ids,
                            cell,
                            initialSave,
                            requestOrConnection,
                            await storage.get(key),
                          )) && (keysToSet[key] = cell);
                    }),
                  )),
            ),
          )),
    ),
  );

  await promiseAll(
    objToArray(changes[1], async (value, valueId) => {
      const key = storagePrefix + V + valueId;
      isUndefined(value)
        ? !initialSave &&
          (await that.canDelValue(
            valueId,
            requestOrConnection as Connection,
          )) &&
          arrayPush(keysToDel, key)
        : (await that.canSetValue(
            valueId,
            value,
            initialSave,
            requestOrConnection,
            await storage.get(key),
          )) && (keysToSet[key] = value);
    }),
  );

  if (!arrayIsEmpty(keyPrefixesToDel)) {
    mapForEach(await storage.list<string | number | boolean>(), (key) =>
      arrayEvery(
        keyPrefixesToDel,
        (keyPrefixToDelete) =>
          !strStartsWith(key, keyPrefixToDelete) ||
          ((arrayPush(keysToDel, key) as any) && 0),
      ),
    );
  }

  await storage.delete(keysToDel);
  await storage.put(keysToSet);
};

const constructStorageKey = (
  storagePrefix: string,
  type: StorageKeyType,
  ...ids: Ids
) => construct(storagePrefix, type, slice(jsonStringWithMap(ids), 1, -1));

const createResponse = async (
  that: TinyBasePartyKitServer,
  status: number,
  body: string | null = null,
) =>
  new Response(body, {
    status,
    headers: that.config.responseHeaders,
  });

export class TinyBasePartyKitServer implements TinyBasePartyKitServerDecl {
  constructor(readonly party: Party) {
    this.config.storePath ??= STORE_PATH;
    this.config.messagePrefix ??= EMPTY_STRING;
    this.config.storagePrefix ??= EMPTY_STRING;
    this.config.responseHeaders ??= RESPONSE_HEADERS;
  }

  readonly config: TinyBasePartyKitServerConfig = {};

  async onRequest(request: Request): Promise<Response> {
    const {
      party: {storage},
      config: {storePath, storagePrefix},
    } = this;
    if (new URL(request.url).pathname.endsWith(storePath!)) {
      const hasExistingStore = await hasStoreInStorage(storage, storagePrefix);
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
        hasExistingStore
          ? jsonStringWithMap(
              await loadStoreFromStorage(storage, storagePrefix),
            )
          : EMPTY_STRING,
      );
    }
    return createResponse(this, 404);
  }

  async onMessage(message: string, connection: Connection) {
    const {
      config: {messagePrefix, storagePrefix},
    } = this;
    await ifNotUndefined(
      deconstruct(messagePrefix!, message, 1),
      async ([type, payload]) => {
        if (
          type == SET_CHANGES &&
          (await hasStoreInStorage(this.party.storage, storagePrefix))
        ) {
          await saveStore(this, payload, false, connection);
          broadcastChanges(this, payload, [connection.id]);
        }
      },
    );
  }

  async canSetTable(
    _tableId: Id,
    _initialSave: boolean,
    _requestOrConnection: Request | Connection,
  ): Promise<boolean> {
    return true;
  }

  async canDelTable(_tableId: Id, _connection: Connection): Promise<boolean> {
    return true;
  }

  async canSetRow(
    _tableId: Id,
    _rowId: Id,
    _initialSave: boolean,
    _requestOrConnection: Request | Connection,
  ): Promise<boolean> {
    return true;
  }

  async canDelRow(
    _tableId: Id,
    _rowId: Id,
    _connection: Connection,
  ): Promise<boolean> {
    return true;
  }

  async canSetCell(
    _tableId: Id,
    _rowId: Id,
    _cellId: Id,
    _cell: Cell,
    _initialSave: boolean,
    _requestOrConnection: Request | Connection,
    _oldCell: CellOrUndefined,
  ): Promise<boolean> {
    return true;
  }

  async canDelCell(
    _tableId: Id,
    _rowId: Id,
    _cellId: Id,
    _connection: Connection,
  ): Promise<boolean> {
    return true;
  }

  async canSetValue(
    _valueId: Id,
    _value: Value,
    _initialSave: boolean,
    _requestOrConnection: Request | Connection,
    _oldValue: ValueOrUndefined,
  ): Promise<boolean> {
    return true;
  }

  async canDelValue(_valueId: Id, _connection: Connection): Promise<boolean> {
    return true;
  }
}
