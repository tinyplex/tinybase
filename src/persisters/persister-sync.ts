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
import {Id, IdOrNull, Ids} from '../types/common';
import {IdMap, mapGet, mapNew, mapSet} from '../common/map';
import {collDel, collForEach, collSize} from '../common/coll';
import {EMPTY_STRING} from '../common/strings';
import {PersisterListener} from '../types/persisters';
import {createCustomPersister} from '../persisters';
import {getHlcFunctions} from '../mergeable-store/hlc';
import {objToArray} from '../common/obj';

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
    payload: any,
    args: Ids = [],
  ) => {
    ifNotUndefined(
      mapGet(pendingRequests, requestId),
      ([toStoreId, handlePayload]) =>
        isUndefined(toStoreId) || toStoreId == fromStoreId
          ? handlePayload(payload, fromStoreId)
          : 0,
      () => {
        if (message == 'contentHashes' && persister.isAutoLoading()) {
          getChangesFromOtherStore(fromStoreId, true).then((changes: any) =>
            persisterListener?.(undefined, () => changes),
          );
        }

        if (
          (message == 'getContentDelta' && persister.isAutoSaving()) ||
          message == 'getContentDelta!'
        ) {
          const cd = store.getMergeableContentDelta(payload);
          send(requestId, fromStoreId, 'contentDelta', cd);
        }

        if (message == 'getTablesDelta') {
          send(
            requestId,
            fromStoreId,
            'tablesDelta',
            store.getMergeableTablesDelta(payload),
          );
        }
        if (message == 'getTableDelta') {
          const [tableId] = args;
          send(
            requestId,
            fromStoreId,
            'tableDelta',
            store.getMergeableTableDelta(tableId, payload),
            [tableId],
          );
        }
        if (message == 'getRowDelta') {
          const [tableId, rowId] = args;
          send(
            requestId,
            fromStoreId,
            'rowDelta',
            store.getMergeableRowDelta(tableId, rowId, payload),
            [tableId, rowId],
          );
        }
        if (message == 'getValuesDelta') {
          send(
            requestId,
            fromStoreId,
            'valuesDelta',
            store.getMergeableValuesDelta(payload),
          );
        }
      },
    );
  };

  const [send] = join(store.getId(), receive);

  const request = async <Payload>(
    toStoreId: IdOrNull,
    message: string,
    payload: any,
    args?: Ids,
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
      send(requestId, toStoreId, message, payload, args);
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
        const [[time, tablesChanges]] = await request<TablesDelta>(
          otherStoreId,
          'getTablesDelta',
          store.getMergeableTablesHashes(),
        );
        changes[1][0][0] = time;
        await promiseAll(
          objToArray(tablesChanges, async (_, tableId) => {
            const [[time, tableChanges]] = await request<TableDelta>(
              otherStoreId,
              'getTableDelta',
              store.getMergeableTableHashes(tableId),
              [tableId],
            );
            changes[1][0][1][tableId] = [time, {}];
            await promiseAll(
              objToArray(tableChanges, async (_, rowId) => {
                const [rowStamp] = await request<RowStamp>(
                  otherStoreId,
                  'getRowDelta',
                  store.getMergeableRowHashes(tableId, rowId),
                  [tableId, rowId],
                );
                changes[1][0][1][tableId][1][rowId] = rowStamp;
              }),
            );
          }),
        );
      }
      if (!isUndefined(valuesHash)) {
        const [valuesStamp] = await request<ValuesStamp>(
          otherStoreId,
          'getValuesDelta',
          store.getMergeableValuesHashes(),
        );
        changes[1][1] = valuesStamp;
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
        payload: any,
        args?: Ids,
      ): void => {
        if (DEBUG) {
          sends++;
          receives += isUndefined(toStoreId) ? collSize(stores) - 1 : 1;
        }
        isUndefined(toStoreId)
          ? collForEach(stores, (receive, otherStoreId) =>
              otherStoreId != storeId
                ? receive(requestId, storeId, message, payload, args)
                : 0,
            )
          : mapGet(stores, toStoreId)?.(
              requestId,
              storeId,
              message,
              payload,
              args,
            );
      };
      const leave = (): void => {
        collDel(stores, storeId);
      };
      return [send, leave];
    },
    (): BusStats => (DEBUG ? {sends, receives} : {}),
  ];
}) as typeof createLocalBusDecl;
