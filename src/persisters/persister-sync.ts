import {
  Bus,
  BusStats,
  Receive,
  Send,
  SyncPersister,
  createLocalBus as createLocalBusDecl,
  createSyncPersister as createSyncPersisterDecl,
} from '../types/persisters/persister-sync';
import {
  ContentDelta,
  MergeableChanges,
  MergeableStore,
  RowStamp,
  TableDelta,
  TablesDelta,
  ValuesStamp,
} from '../types/mergeable-store';
import {
  DEBUG,
  ifNotUndefined,
  isUndefined,
  promiseAll,
  promiseNew,
} from '../common/other';
import {Id, IdOrNull} from '../types/common';
import {IdMap, mapGet, mapNew, mapSet} from '../common/map';
import {collDel, collForEach, collSize} from '../common/coll';
import {objMap, objNew} from '../common/obj';
import {EMPTY_STRING} from '../common/strings';
import {PersisterListener} from '../types/persisters';
import {arrayMap} from '../common/array';
import {createCustomPersister} from '../persisters';
import {getHlcFunctions} from '../mergeable-store/hlc';

export const createSyncPersister = ((
  store: MergeableStore,
  bus: Bus,
  requestTimeoutSeconds = 1,
  onIgnoredError?: (error: any) => void,
): SyncPersister => {
  let persisterListener: PersisterListener | undefined;

  const [join] = bus;
  const [getHlc] = getHlcFunctions(store.getId());
  const pendingRequests: IdMap<
    [
      toStoreId: IdOrNull,
      handlePayload: (payload: any, fromStoreId: Id) => void,
    ]
  > = mapNew();

  const receive = (
    requestId: IdOrNull,
    fromStoreId: Id,
    message: string,
    ...parts: any[]
  ) => {
    if (message == EMPTY_STRING) {
      ifNotUndefined(
        mapGet(pendingRequests, requestId),
        ([toStoreId, handlePayload]) =>
          message == EMPTY_STRING &&
          (isUndefined(toStoreId) || toStoreId == fromStoreId)
            ? handlePayload(parts[0], fromStoreId)
            : 0,
      );
    } else if (message == 'contentHashes') {
      persister.isAutoLoading()
        ? getChangesFromOtherStore(fromStoreId, true).then((changes: any) =>
            persisterListener?.(undefined, () => changes),
          )
        : 0;
    } else {
      const responsePayload =
        (message == 'getContentDelta' && persister.isAutoSaving()) ||
        message == 'getContentDelta!'
          ? store.getMergeableContentDelta(parts[0])
          : message == 'getTablesDelta'
            ? store.getMergeableTablesDelta(parts[0])
            : message == 'getTableDelta'
              ? store.getMergeableTableDelta(parts[0], parts[1])
              : message == 'getRowDeltas'
                ? objMap(parts[1], (rowHashes: any, rowId) =>
                    store.getMergeableRowDelta(parts[0], rowId, rowHashes),
                  )
                : message == 'getValuesDelta'
                  ? store.getMergeableValuesDelta(parts[0])
                  : 0;
      responsePayload === 0
        ? 0
        : send(requestId, fromStoreId, EMPTY_STRING, responsePayload);
    }
  };

  const [send] = join(store.getId(), receive);

  const request = async <Payload>(
    toStoreId: IdOrNull,
    message: string,
    ...parts: any[]
  ): Promise<[payload: Payload, fromStoreId: Id]> =>
    promiseNew((resolve, reject) => {
      const requestId = getHlc();
      const timeout = setTimeout(() => {
        collDel(pendingRequests, requestId);
        reject(`No response from ${toStoreId ?? 'anyone'} to '${message}'`);
      }, requestTimeoutSeconds * 1000);
      mapSet(pendingRequests, requestId, [
        toStoreId,
        (payload: any, fromStoreId: Id) => {
          clearTimeout(timeout);
          collDel(pendingRequests, requestId);
          resolve([payload, fromStoreId]);
        },
      ]);
      send(requestId, toStoreId, message, ...parts);
    });

  const getChangesFromOtherStore = async (
    knownOtherStoreId: IdOrNull = null,
    forceOtherToSave = false,
  ): Promise<MergeableChanges> => {
    const changes: MergeableChanges = [
      EMPTY_STRING,
      [[EMPTY_STRING, {}], [EMPTY_STRING, {}], 1],
    ];
    const [contentDelta, otherStoreId] = await request<ContentDelta>(
      knownOtherStoreId,
      'getContentDelta' + (forceOtherToSave ? '!' : ''),
      store.getMergeableContentHashes(),
    );
    if (!isUndefined(contentDelta)) {
      const [time, [tablesHash, valuesHash]] = contentDelta;
      changes[0] = time;
      if (!isUndefined(tablesHash)) {
        const [[time, deltaTableIds]] = await request<TablesDelta>(
          otherStoreId,
          'getTablesDelta',
          store.getMergeableTablesHashes(),
        );
        changes[1][0] = [
          time,
          objNew(
            await promiseAll(
              arrayMap(deltaTableIds, async (tableId) => {
                const [[time, deltaRowIds]] = await request<TableDelta>(
                  otherStoreId,
                  'getTableDelta',
                  tableId,
                  store.getMergeableTableHashes(tableId),
                );
                return [
                  tableId,
                  [
                    time,
                    objMap(
                      (
                        await request<{[rowId: Id]: RowStamp}>(
                          otherStoreId,
                          'getRowDeltas',
                          tableId,
                          objNew(
                            arrayMap(deltaRowIds, (rowId) => [
                              rowId,
                              store.getMergeableRowHashes(tableId, rowId),
                            ]),
                          ),
                        )
                      )[0],
                      (rowStamp) => rowStamp,
                    ),
                  ],
                ];
              }),
            ),
          ),
        ];
      }
      if (!isUndefined(valuesHash)) {
        changes[1][1] = (
          await request<ValuesStamp>(
            otherStoreId,
            'getValuesDelta',
            store.getMergeableValuesHashes(),
          )
        )[0];
      }
    }
    return changes;
  };

  const getPersisted = async (): Promise<any> => {
    const changes = await getChangesFromOtherStore();
    return changes[0] != EMPTY_STRING ? changes : undefined;
  };

  const setPersisted = async (): Promise<void> => {
    send(null, null, 'contentHashes', store.getMergeableContentHashes());
  };

  const addPersisterListener = (listener: PersisterListener) =>
    (persisterListener = listener);

  const delPersisterListener = () => (persisterListener = undefined);

  const persister = createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
    true,
    {
      getBus: () => bus,
      startSync: async () =>
        await (await persister.startAutoLoad()).startAutoSave(),
      stopSync: () => persister.destroy,
    },
  ) as SyncPersister;
  return persister;
}) as typeof createSyncPersisterDecl;

export const createLocalBus = (() => {
  let sends = 0;
  let receives = 0;
  const stores: IdMap<Receive> = mapNew();
  return [
    (storeId: Id, receive: Receive): [Send, () => void] => {
      mapSet(stores, storeId, receive);
      const send = (
        requestId: IdOrNull,
        toStoreId: IdOrNull,
        message: string,
        ...parts: any[]
      ): void => {
        if (DEBUG) {
          sends++;
          receives += isUndefined(toStoreId) ? collSize(stores) - 1 : 1;
        }
        isUndefined(toStoreId)
          ? collForEach(stores, (receive, otherStoreId) =>
              otherStoreId != storeId
                ? receive(requestId, storeId, message, ...parts)
                : 0,
            )
          : mapGet(stores, toStoreId)?.(requestId, storeId, message, ...parts);
      };
      const leave = (): void => {
        collDel(stores, storeId);
      };
      return [send, leave];
    },
    (): BusStats => (DEBUG ? {sends, receives} : {}),
  ];
}) as typeof createLocalBusDecl;
