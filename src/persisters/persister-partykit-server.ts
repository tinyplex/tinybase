import {
  Cell,
  CellOrUndefined,
  Row,
  Tables,
  TransactionChanges,
  Value,
  ValueOrUndefined,
  Values,
} from '../types/store';
import {Connection, Party, Request} from 'partykit/server';
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
import {jsonParse, jsonString} from '../common/json';
import {objEnsure, objMap, objNew} from '../common/obj';
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
  const prefix = that.config.storagePrefix ?? EMPTY_STRING;

  const keysToSet: {[key: string]: Cell | Value} = {
    [prefix + HAS_STORE]: 1,
  };
  const keysToDel: string[] = [];
  const keyPrefixesToDel: string[] = [];

  await promiseAll(
    objMap(transactionChanges[0], async (table, tableId) =>
      isUndefined(table)
        ? !initialSave &&
          that.canDelTable(tableId, requestOrConnection as Connection) &&
          arrayUnshift(
            keyPrefixesToDel,
            constructStorageKey(prefix, T, tableId),
          )
        : that.canSetTable(tableId, initialSave, requestOrConnection) &&
          (await promiseAll(
            objMap(table, async (row, rowId) =>
              isUndefined(row)
                ? !initialSave &&
                  that.canDelRow(
                    tableId,
                    rowId,
                    requestOrConnection as Connection,
                  ) &&
                  arrayPush(
                    keyPrefixesToDel,
                    constructStorageKey(prefix, T, tableId, rowId),
                  )
                : that.canSetRow(
                    tableId,
                    rowId,
                    initialSave,
                    requestOrConnection,
                  ) &&
                  (await promiseAll(
                    objMap(row, async (cell, cellId) => {
                      const ids: [Id, Id, Id] = [tableId, rowId, cellId];
                      const key = constructStorageKey(prefix, T, ...ids);
                      isUndefined(cell)
                        ? !initialSave &&
                          that.canDelCell(
                            ...ids,
                            requestOrConnection as Connection,
                          ) &&
                          arrayPush(keysToDel, key)
                        : that.canSetCell(
                            ...ids,
                            cell,
                            initialSave,
                            requestOrConnection,
                            await storage.get(key),
                          ) && (keysToSet[key] = cell);
                    }),
                  )),
            ),
          )),
    ),
  );

  await promiseAll(
    objMap(transactionChanges[1], async (value, valueId) => {
      const key = prefix + V + valueId;
      isUndefined(value)
        ? !initialSave &&
          that.canDelValue(valueId, requestOrConnection as Connection) &&
          arrayPush(keysToDel, key)
        : that.canSetValue(
            valueId,
            value,
            initialSave,
            requestOrConnection,
            await storage.get(key),
          ) && (keysToSet[key] = value);
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
) => construct(storagePrefix, type, slice(jsonString(ids), 1, -1));

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

  canSetTable(
    _tableId: Id,
    _initialSave: boolean,
    _requestOrConnection: Request | Connection,
  ): boolean {
    return true;
  }

  canDelTable(_tableId: Id, _connection: Connection): boolean {
    return true;
  }

  canSetRow(
    _tableId: Id,
    _rowId: Id,
    _initialSave: boolean,
    _requestOrConnection: Request | Connection,
  ): boolean {
    return true;
  }

  canDelRow(_tableId: Id, _rowId: Id, _connection: Connection): boolean {
    return true;
  }

  canSetCell(
    _tableId: Id,
    _rowId: Id,
    _cellId: Id,
    _cell: Cell,
    _initialSave: boolean,
    _requestOrConnection: Request | Connection,
    _oldCell: CellOrUndefined,
  ): boolean {
    return true;
  }

  canDelCell(
    _tableId: Id,
    _rowId: Id,
    _cellId: Id,
    _connection: Connection,
  ): boolean {
    return true;
  }

  canSetValue(
    _valueId: Id,
    _value: Value,
    _initialSave: boolean,
    _requestOrConnection: Request | Connection,
    _oldValue: ValueOrUndefined,
  ): boolean {
    return true;
  }

  canDelValue(_valueId: Id, _connection: Connection): boolean {
    return true;
  }
}
