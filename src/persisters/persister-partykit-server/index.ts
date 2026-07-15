import type {Connection, Party, Request, Storage} from 'partykit/server';
import type {Id, Ids} from '../../@types/common/index.d.ts';
import type {
  TinyBasePartyKitServerConfig,
  TinyBasePartyKitServer as TinyBasePartyKitServerDecl,
} from '../../@types/persisters/persister-partykit-server/index.d.ts';
import type {
  Cell,
  CellOrUndefined,
  Changes,
  Content,
  Row,
  Table,
  Value,
  ValueOrUndefined,
} from '../../@types/store/index.d.ts';
import {
  arrayEvery,
  arrayMap,
  arrayPush,
  arrayUnshift,
} from '../../common/array.ts';
import {jsonParse, jsonStringWithMap} from '../../common/json.ts';
import {mapForEach} from '../../common/map.ts';
import {
  objEnsure,
  objIsEmpty,
  objNew,
  objSet,
  objToArray,
} from '../../common/obj.ts';
import {
  ifNotUndefined,
  isEmpty,
  isUndefined,
  promiseAll,
  slice,
} from '../../common/other.ts';
import {EMPTY_STRING, T, V, strStartsWith} from '../../common/strings.ts';
import {
  PUT,
  SET_CHANGES,
  STORE_PATH,
  StorageKeyType,
  construct,
  deconstruct,
} from '../common/partykit.ts';

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

type CellChanges = {[cellId: Id]: CellOrUndefined};
type RowChanges = {[rowId: Id]: CellChanges | undefined};

export const hasStoreInStorage = async (
  storage: Storage,
  storagePrefix = EMPTY_STRING,
): Promise<boolean> => !!(await storage.get<1>(storagePrefix + HAS_STORE));

export const loadStoreFromStorage = async (
  storage: Storage,
  storagePrefix = EMPTY_STRING,
): Promise<Content> => {
  const tables = objNew<Table>();
  const values = objNew<Value>();
  mapForEach(
    await storage.list<string | number | boolean>(),
    (key, cellOrValue) =>
      ifNotUndefined(deconstruct(storagePrefix, key), ([type, ids]) => {
        if (type == T) {
          const [tableId, rowId, cellId] = jsonParse('[' + ids + ']');
          objSet(
            objEnsure(
              objEnsure(tables, tableId, objNew<Row>),
              rowId,
              objNew<Cell>,
            ),
            cellId,
            cellOrValue,
          );
        } else if (type == V) {
          objSet(values, ids, cellOrValue);
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
    construct(
      server.config.messagePrefix ?? EMPTY_STRING,
      SET_CHANGES,
      changes,
    ),
    without,
  );

const saveStore = async (
  that: TinyBasePartyKitServer,
  contentOrChanges: Content | Changes,
  initialSave: boolean,
  requestOrConnection: Request | Connection,
): Promise<Changes> => {
  const storage = that.party.storage;
  const storagePrefix = that.config.storagePrefix ?? EMPTY_STRING;

  const acceptedTables = objNew<RowChanges | undefined>();
  const acceptedValues = objNew<ValueOrUndefined>();
  const keysToSet = objNew<Cell | Value>();
  const keysToDel: string[] = [];
  const keyPrefixesToDel: string[] = [];

  const getAcceptedTable = (tableId: Id): RowChanges =>
    objEnsure(
      acceptedTables,
      tableId,
      objNew<CellChanges | undefined>,
    ) as RowChanges;
  const getAcceptedRow = (tableId: Id, rowId: Id): CellChanges =>
    objEnsure(
      getAcceptedTable(tableId),
      rowId,
      objNew<CellOrUndefined>,
    ) as CellChanges;

  await promiseAll(
    objToArray(contentOrChanges[0], async (table, tableId) => {
      if (isUndefined(table)) {
        if (
          !initialSave &&
          (await that.canDelTable(tableId, requestOrConnection as Connection))
        ) {
          arrayUnshift(
            keyPrefixesToDel,
            constructStorageKey(storagePrefix, T, tableId),
          );
          objSet(acceptedTables, tableId, undefined);
        }
      } else if (
        await that.canSetTable(tableId, initialSave, requestOrConnection)
      ) {
        await promiseAll(
          objToArray(table, async (row, rowId) => {
            if (isUndefined(row)) {
              if (
                !initialSave &&
                (await that.canDelRow(
                  tableId,
                  rowId,
                  requestOrConnection as Connection,
                ))
              ) {
                arrayPush(
                  keyPrefixesToDel,
                  constructStorageKey(storagePrefix, T, tableId, rowId),
                );
                objSet(getAcceptedTable(tableId), rowId, undefined);
              }
            } else if (
              await that.canSetRow(
                tableId,
                rowId,
                initialSave,
                requestOrConnection,
              )
            ) {
              await promiseAll(
                objToArray(row, async (cell, cellId) => {
                  const ids: [Id, Id, Id] = [tableId, rowId, cellId];
                  const key = constructStorageKey(storagePrefix, T, ...ids);
                  if (isUndefined(cell)) {
                    if (
                      !initialSave &&
                      (await that.canDelCell(
                        ...ids,
                        requestOrConnection as Connection,
                      ))
                    ) {
                      arrayPush(keysToDel, key);
                      objSet(getAcceptedRow(tableId, rowId), cellId, undefined);
                    }
                  } else if (
                    await that.canSetCell(
                      ...ids,
                      cell,
                      initialSave,
                      requestOrConnection,
                      await storage.get(key),
                    )
                  ) {
                    objSet(keysToSet, key, cell);
                    objSet(getAcceptedRow(tableId, rowId), cellId, cell);
                  }
                }),
              );
            }
          }),
        );
      }
    }),
  );

  await promiseAll(
    objToArray(contentOrChanges[1], async (value, valueId) => {
      const key = storagePrefix + V + valueId;
      if (isUndefined(value)) {
        if (
          !initialSave &&
          (await that.canDelValue(valueId, requestOrConnection as Connection))
        ) {
          arrayPush(keysToDel, key);
          objSet(acceptedValues, valueId, undefined);
        }
      } else if (
        await that.canSetValue(
          valueId,
          value,
          initialSave,
          requestOrConnection,
          await storage.get(key),
        )
      ) {
        objSet(keysToSet, key, value);
        objSet(acceptedValues, valueId, value);
      }
    }),
  );

  if (!isEmpty(keyPrefixesToDel)) {
    mapForEach(await storage.list<string | number | boolean>(), (key) =>
      arrayEvery(
        keyPrefixesToDel,
        (keyPrefixToDelete) =>
          !strStartsWith(key, keyPrefixToDelete) ||
          ((arrayPush(keysToDel, key) as any) && 0),
      ),
    );
  }

  if (
    initialSave &&
    ((objIsEmpty(contentOrChanges[0]) && objIsEmpty(contentOrChanges[1])) ||
      !objIsEmpty(acceptedTables) ||
      !objIsEmpty(acceptedValues))
  ) {
    objSet(keysToSet, storagePrefix + HAS_STORE, 1);
  }

  await storage.delete(keysToDel);
  if (!objIsEmpty(keysToSet)) {
    await storage.put(keysToSet);
  }
  return [acceptedTables, acceptedValues, 1];
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
      config: {storePath = STORE_PATH, storagePrefix},
    } = this;
    if (new URL(request.url).pathname.endsWith(storePath)) {
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
      config: {messagePrefix = EMPTY_STRING, storagePrefix},
    } = this;
    await ifNotUndefined(
      deconstruct(messagePrefix, message, 1),
      async ([type, payload]) => {
        if (
          type == SET_CHANGES &&
          (await hasStoreInStorage(this.party.storage, storagePrefix))
        ) {
          const acceptedChanges = await saveStore(
            this,
            payload,
            false,
            connection,
          );
          if (
            !objIsEmpty(acceptedChanges[0]) ||
            !objIsEmpty(acceptedChanges[1])
          ) {
            await broadcastChanges(this, acceptedChanges, [connection.id]);
          }
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
