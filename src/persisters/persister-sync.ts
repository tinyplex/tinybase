import {
  Bus,
  Receive,
  Send,
  SyncPersister,
  createLocalBus as createLocalBusDecl,
  createSyncPersister as createSyncPersisterDecl,
} from '../types/persisters/persister-sync';
import {Id, IdOrNull, Ids} from '../types/common';
import {IdMap, mapGet, mapNew, mapSet} from '../common/map';
import {collDel, collForEach} from '../common/coll';
import {ifNotUndefined, isUndefined, promiseNew} from '../common/other';
import {MergeableStore} from '../types/mergeable-store';
import {createCustomPersister} from '../persisters';
import {getHlcFunctions} from '../mergeable-store/hlc';
import {objForEach} from '../common/obj';

export const createSyncPersister = ((
  store: MergeableStore,
  bus: Bus,
  requestTimeoutSeconds = 1,
  onIgnoredError?: (error: any) => void,
): SyncPersister => {
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
    // console.log(
    //   requestId,
    //   fromStoreId,
    //   '->',
    //   store.getId(),
    //   'received',
    //   message,
    //   args,
    //   JSON.stringify(payload),
    //   persister.isAutoLoading(),
    //   persister.isAutoSaving(),
    //   '\n',
    // );

    ifNotUndefined(
      mapGet(pendingRequests, requestId),
      ([toStoreId, handlePayload]) =>
        isUndefined(toStoreId) || toStoreId == fromStoreId
          ? handlePayload(payload, fromStoreId)
          : 0,
      () => {
        if (message == 'contentHashes' && persister.isAutoLoading()) {
          const [_contentHash, [tablesHashes, valuesHashes]] = payload;
          const [_myContentHash, [myTablesHashes, myValuesHashes]] =
            store.getMergeableContentHashes();
          if (tablesHashes != myTablesHashes) {
            send(
              requestId,
              fromStoreId,
              'getTablesDelta',
              store.getMergeableTablesHashes(),
            );
          }
          if (valuesHashes != myValuesHashes) {
            send(
              requestId,
              fromStoreId,
              'getValuesDelta',
              store.getMergeableValuesHashes(),
            );
          }
        }

        if (message == 'getContentDelta' && persister.isAutoSaving()) {
          send(
            requestId,
            fromStoreId,
            'contentDelta',
            store.getMergeableContentDelta(payload),
          );
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

        if (message == 'contentDelta') {
          if (!isUndefined(payload)) {
            const [_time, [tablesHash, valuesHash]] = payload;
            if (!isUndefined(tablesHash)) {
              send(
                requestId,
                fromStoreId,
                'getTablesDelta',
                store.getMergeableTablesHashes(),
              );
            }
            if (!isUndefined(valuesHash)) {
              send(
                requestId,
                fromStoreId,
                'getValuesDelta',
                store.getMergeableValuesHashes(),
              );
            }
          }
        }
        if (message == 'tablesDelta') {
          const [_time, tablesChanges] = payload;
          objForEach(tablesChanges, (_, tableId) => {
            send(
              requestId,
              fromStoreId,
              'getTableDelta',
              store.getMergeableTableHashes(tableId),
              [tableId],
            );
          });
        }
        if (message == 'tableDelta') {
          const [tableId] = args;
          const [_time, tableChanges] = payload;
          objForEach(tableChanges, (_, rowId) => {
            send(
              requestId,
              fromStoreId,
              'getRowDelta',
              store.getMergeableRowHashes(tableId, rowId),
              [tableId, rowId],
            );
          });
        }
        if (message == 'rowDelta') {
          const [tableId, rowId] = args;
          const [time, rowChanges] = payload;
          store.applyMergeableChanges([
            time,
            [
              [time, {[tableId]: [time, {[rowId]: [time, rowChanges]}]}],
              ['', {}],
              1,
            ],
          ]);
        }
        if (message == 'valuesDelta') {
          const [time, valuesChanges] = payload;
          store.applyMergeableChanges([
            time,
            [['', {}], [time, valuesChanges], 1],
          ]);
        }
      },
    );
  };

  const [send] = join(store.getId(), receive);

  const request = async (
    toStoreId: IdOrNull,
    message: string,
    payload: any,
    args?: Ids,
  ): Promise<[payload: any, fromStoreId: Id]> =>
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

  const getPersisted = async (): Promise<undefined | 1> => {
    const [contentDelta, otherStoreId] = await request(
      null,
      'getContentDelta',
      store.getMergeableContentHashes(),
    );
    return 1;
  };

  const setPersisted = async (): Promise<void> => {
    send(null, null, 'contentHashes', store.getMergeableContentHashes());
  };

  const addPersisterListener = () => 0;

  const delPersisterListener = () => 0;

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
        await (await persister.startAutoSave()).startAutoLoad(),
      stopSync: () => persister.destroy,
    },
  ) as SyncPersister;
  return persister;
}) as typeof createSyncPersisterDecl;

export const createLocalBus = (() => {
  const stores: IdMap<Receive> = mapNew();
  const join = (storeId: Id, receive: Receive): [Send, () => void] => {
    mapSet(stores, storeId, receive);
    const send = (
      requestId: IdOrNull,
      toStoreId: IdOrNull,
      message: string,
      payload: any,
      args?: Ids,
    ): void =>
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
    const leave = (): void => {
      collDel(stores, storeId);
    };
    return [send, leave];
  };
  return [join];
}) as typeof createLocalBusDecl;
