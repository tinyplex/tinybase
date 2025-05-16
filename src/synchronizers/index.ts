import type {Id, IdOrNull} from '../@types/common/index.d.ts';
import type {
  CellStamp,
  ContentHashes,
  MergeableChanges,
  MergeableContent,
  MergeableStore,
  RowHashes,
  RowStamp,
  TableHashes,
  TablesStamp,
  ValuesStamp,
} from '../@types/mergeable-store/index.d.ts';
import type {
  PersisterListener,
  Persists as PersistsEnum,
} from '../@types/persisters/index.d.ts';
import type {Content} from '../@types/store/index.d.ts';
import type {
  Message as MessageEnum,
  Receive,
  Send,
  Synchronizer,
} from '../@types/synchronizers/index.d.ts';
import {collDel} from '../common/coll.ts';
import {getUniqueId} from '../common/index.ts';
import {IdMap, mapGet, mapNew, mapSet} from '../common/map.ts';
import {objEnsure, objForEach, objIsEmpty} from '../common/obj.ts';
import {
  ifNotUndefined,
  isUndefined,
  promiseNew,
  startTimeout,
  tryCatch,
} from '../common/other.ts';
import {getLatestTime, stampNew, stampNewObj} from '../common/stamps.ts';
import {DOT, EMPTY_STRING} from '../common/strings.ts';
import {createCustomPersister} from '../persisters/index.ts';

const enum MessageValues {
  Response = 0,
  GetContentHashes = 1,
  ContentHashes = 2,
  ContentDiff = 3,
  GetTableDiff = 4,
  GetRowDiff = 5,
  GetCellDiff = 6,
  GetValueDiff = 7,
}

export const Message = {
  Response: MessageValues.Response,
  GetContentHashes: MessageValues.GetContentHashes,
  ContentHashes: MessageValues.ContentHashes,
  ContentDiff: MessageValues.ContentDiff,
  GetTableDiff: MessageValues.GetTableDiff,
  GetRowDiff: MessageValues.GetRowDiff,
  GetCellDiff: MessageValues.GetCellDiff,
  GetValueDiff: MessageValues.GetValueDiff,
};

export const createCustomSynchronizer = (
  store: MergeableStore,
  send: Send,
  registerReceive: (receive: Receive) => void,
  extraDestroy: () => void,
  requestTimeoutSeconds: number,
  onSend?: Send,
  onReceive?: Receive,
  onIgnoredError?: (error: any) => void,
  // undocumented:
  extra: {[methodName: string]: (...args: any[]) => any} = {},
): Synchronizer => {
  let syncing: 0 | 1 = 0;
  let persisterListener:
    | PersisterListener<PersistsEnum.MergeableStoreOnly>
    | undefined;
  let sends = 0;
  let receives = 0;

  const pendingRequests: IdMap<
    [
      toClientId: IdOrNull,
      handleResponse: (response: any, fromClientId: Id) => void,
    ]
  > = mapNew();

  const getTransactionId = () => getUniqueId(11);

  const sendImpl = (
    toClientId: IdOrNull,
    requestId: IdOrNull,
    message: MessageEnum | any,
    body: any,
  ) => {
    sends++;
    onSend?.(toClientId, requestId, message, body);
    send(toClientId, requestId, message, body);
  };

  const request = async <Response>(
    toClientId: IdOrNull,
    message: MessageEnum | any,
    body: any,
    transactionId: Id,
  ): Promise<[response: Response, fromClientId: Id, transactionId: Id]> =>
    promiseNew((resolve, reject) => {
      const requestId = transactionId + DOT + getUniqueId(4);
      const timeout = startTimeout(() => {
        collDel(pendingRequests, requestId);
        reject(
          `No response from ${toClientId ?? 'anyone'} to ${requestId}, ` +
            message,
        );
      }, requestTimeoutSeconds);
      mapSet(pendingRequests, requestId, [
        toClientId,
        (response: Response, fromClientId: Id) => {
          clearTimeout(timeout);
          collDel(pendingRequests, requestId);
          resolve([response, fromClientId, transactionId]);
        },
      ]);
      sendImpl(toClientId, requestId, message, body);
    });

  const mergeTablesStamps = (
    tablesStamp: TablesStamp,
    [tableStamps2, tablesTime2]: TablesStamp,
  ) => {
    objForEach(tableStamps2, ([rowStamps2, tableTime2], tableId) => {
      const tableStamp = objEnsure(
        tablesStamp[0],
        tableId,
        stampNewObj<RowStamp>,
      );
      objForEach(rowStamps2, ([cellStamps2, rowTime2], rowId) => {
        const rowStamp = objEnsure(
          tableStamp[0],
          rowId,
          stampNewObj<CellStamp>,
        );
        objForEach(
          cellStamps2,
          ([cell2, cellTime2], cellId) =>
            (rowStamp[0][cellId] = stampNew(cell2, cellTime2)),
        );
        rowStamp[1] = getLatestTime(rowStamp[1], rowTime2);
      });
      tableStamp[1] = getLatestTime(tableStamp[1], tableTime2);
    });
    tablesStamp[1] = getLatestTime(tablesStamp[1], tablesTime2);
  };

  const getChangesFromOtherStore = (
    otherClientId: IdOrNull = null,
    otherContentHashes?: ContentHashes,
    transactionId: Id = getTransactionId(),
  ): Promise<MergeableChanges | void> =>
    tryCatch(async () => {
      if (isUndefined(otherContentHashes)) {
        [otherContentHashes, otherClientId, transactionId] =
          await request<ContentHashes>(
            null,
            MessageValues.GetContentHashes,
            EMPTY_STRING,
            transactionId,
          );
      }
      const [otherTablesHash, otherValuesHash] = otherContentHashes;
      const [tablesHash, valuesHash] = store.getMergeableContentHashes();

      let tablesChanges: TablesStamp = stampNewObj();
      if (tablesHash != otherTablesHash) {
        const [newTables, differentTableHashes] = (
          await request<[TablesStamp, TableHashes]>(
            otherClientId,
            MessageValues.GetTableDiff,
            store.getMergeableTableHashes(),
            transactionId,
          )
        )[0];
        tablesChanges = newTables;

        if (!objIsEmpty(differentTableHashes)) {
          const [newRows, differentRowHashes] = (
            await request<[TablesStamp, RowHashes]>(
              otherClientId,
              MessageValues.GetRowDiff,
              store.getMergeableRowHashes(differentTableHashes),
              transactionId,
            )
          )[0];
          mergeTablesStamps(tablesChanges, newRows);

          if (!objIsEmpty(differentRowHashes)) {
            const newCells = (
              await request<TablesStamp>(
                otherClientId,
                MessageValues.GetCellDiff,
                store.getMergeableCellHashes(differentRowHashes),
                transactionId,
              )
            )[0];
            mergeTablesStamps(tablesChanges, newCells);
          }
        }
      }

      return [
        tablesChanges,
        valuesHash == otherValuesHash
          ? stampNewObj()
          : (
              await request<ValuesStamp>(
                otherClientId,
                MessageValues.GetValueDiff,
                store.getMergeableValueHashes(),
                transactionId,
              )
            )[0],
        1,
      ];
    }, onIgnoredError);

  const getPersisted = async (): Promise<MergeableContent | undefined> => {
    const changes = (await getChangesFromOtherStore()) as any;
    return changes && (!objIsEmpty(changes[0][0]) || !objIsEmpty(changes[1][0]))
      ? changes
      : undefined;
  };

  const setPersisted = async (
    _getContent: () => MergeableContent,
    changes?: MergeableChanges<false>,
  ): Promise<void> =>
    changes
      ? sendImpl(null, getTransactionId(), MessageValues.ContentDiff, changes)
      : sendImpl(
          null,
          getTransactionId(),
          MessageValues.ContentHashes,
          store.getMergeableContentHashes(),
        );

  const addPersisterListener = (
    listener: PersisterListener<PersistsEnum.MergeableStoreOnly>,
  ) => (persisterListener = listener);

  const delPersisterListener = () => (persisterListener = undefined);

  const startSync = async (initialContent?: Content) => {
    syncing = 1;
    return await persister.startAutoPersisting(initialContent);
  };

  const stopSync = async () => {
    syncing = 0;
    await persister.stopAutoPersisting();
    return persister;
  };

  const destroy = async () => {
    await persister.stopSync();
    extraDestroy();
    return persister;
  };

  const getSynchronizerStats = () => ({sends, receives});

  const persister = createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
    2, // MergeableStoreOnly
    {startSync, stopSync, destroy, getSynchronizerStats, ...extra},
    1,
  ) as Synchronizer;

  registerReceive(
    (
      fromClientId: Id,
      transactionOrRequestId: IdOrNull,
      message: MessageEnum | any,
      body: any,
    ) => {
      const isAutoLoading = syncing || persister.isAutoLoading();
      receives++;
      onReceive?.(fromClientId, transactionOrRequestId, message, body);
      if (message == MessageValues.Response) {
        ifNotUndefined(
          mapGet(pendingRequests, transactionOrRequestId),
          ([toClientId, handleResponse]) =>
            isUndefined(toClientId) || toClientId == fromClientId
              ? handleResponse(body, fromClientId)
              : /*! istanbul ignore next */
                0,
        );
      } else if (message == MessageValues.ContentHashes && isAutoLoading) {
        getChangesFromOtherStore(
          fromClientId,
          body,
          transactionOrRequestId ?? undefined,
        )
          .then((changes: any) => {
            persisterListener?.(undefined, changes);
          })
          .catch(onIgnoredError);
      } else if (message == MessageValues.ContentDiff && isAutoLoading) {
        persisterListener?.(undefined, body);
      } else {
        ifNotUndefined(
          message == MessageValues.GetContentHashes &&
            (syncing || persister.isAutoSaving())
            ? store.getMergeableContentHashes()
            : message == MessageValues.GetTableDiff
              ? store.getMergeableTableDiff(body)
              : message == MessageValues.GetRowDiff
                ? store.getMergeableRowDiff(body)
                : message == MessageValues.GetCellDiff
                  ? store.getMergeableCellDiff(body)
                  : message == MessageValues.GetValueDiff
                    ? store.getMergeableValueDiff(body)
                    : undefined,
          (response) => {
            sendImpl(
              fromClientId,
              transactionOrRequestId,
              MessageValues.Response,
              response,
            );
          },
        );
      }
    },
  );

  return persister;
};
