import type {Id, IdOrNull} from '../@types/common/index.d.ts';
import type {
  CellHashes,
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
import {arrayIsEqual, arrayNew} from '../common/array.ts';
import {getUniqueId} from '../common/codec.ts';
import {collClear, collDel, collHas, collSize} from '../common/coll.ts';
import {
  ERROR_SYNC_MESSAGE,
  ERROR_SYNC_OVERFLOW,
  ERROR_SYNC_RESPONSE,
  errorNew,
  tryCatch,
  tryFinallyAsync,
} from '../common/error.ts';
import {getHash, getRowInTableHash} from '../common/hash.ts';
import {IdMap, mapForEach, mapGet, mapNew, mapSet} from '../common/map.ts';
import {
  IdObj,
  objEnsure,
  objForEach,
  objIsEmpty,
  objMap,
  objNew,
  objSet,
  objSize,
} from '../common/obj.ts';
import {
  ifNotUndefined,
  isNull,
  isUndefined,
  noop,
  promiseNew,
  startTimeout,
  stopTimeout,
} from '../common/other.ts';
import {setAdd, setNew} from '../common/set.ts';
import {getLatestHlc, stampNew, stampNewObj} from '../common/stamps.ts';
import {DOT, EMPTY_STRING} from '../common/strings.ts';
import {createCustomPersister} from '../persisters/index.ts';
import {
  BUCKET_COUNT,
  MAX_PENDING_REQUESTS,
  SERVER_CLIENT_ID,
  getTransactionId,
  isMarked,
  isProtocolMessageValid,
} from './common.ts';

const enum MessageValues {
  Response = 0,
  GetContentHashes = 1,
  ContentHashes = 2,
  ContentDiff = 3,
  GetTableDiff = 4,
  GetRowDiff = 5,
  GetCellDiff = 6,
  GetValueDiff = 7,
  GetBucketDiff = 8,
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
  GetBucketDiff: MessageValues.GetBucketDiff,
};

const MAX_MARKED_CLIENT_IDS = 10_000;

type BucketHashes = {[tableId: Id]: number[]};
type Pull = [hashes: ContentHashes, changes: Promise<MergeableChanges>];

const getBucket = (rowId: Id): number => getHash(rowId) % BUCKET_COUNT;

// Groups a Table's Rows into buckets by their Id, and combines the hashes of
// the Rows in each, so that two peers can find which Rows differ without
// exchanging a hash for every one of them.
const getBucketHashes = (rowHashes: IdObj<number>): number[] => {
  const bucketHashes = arrayNew(BUCKET_COUNT, () => 0);
  objForEach(rowHashes, (rowHash, rowId) => {
    const bucket = getBucket(rowId);
    bucketHashes[bucket] =
      (bucketHashes[bucket] ^ getRowInTableHash(rowId, rowHash)) >>> 0;
  });
  return bucketHashes;
};

export const createCustomSynchronizer = (
  store: MergeableStore,
  send: Send,
  registerReceive: (receive: Receive, fail: (error: Error) => void) => void,
  extraDestroy: () => void,
  requestTimeoutSeconds: number,
  onSend?: Send,
  onReceive?: Receive,
  onIgnoredError?: (error: any) => void,
  // undocumented:
  extra: {[methodName: string]: (...args: any[]) => any} = {},
  preDestroy: () => void = noop,
  receiveChanges?: (
    fromClientId: Id,
    changes: MergeableChanges | MergeableContent,
  ) => MergeableChanges,
  isServer: 0 | 1 = 0,
): Synchronizer => {
  let syncing: 0 | 1 = 0;
  let persisterListener:
    PersisterListener<PersistsEnum.MergeableStoreOnly> | undefined;
  let sends = 0;
  let receives = 0;
  let destroyed = false;

  const pendingRequests: IdMap<
    [
      toClientId: IdOrNull,
      handleResponse: (response: any, fromClientId: Id) => void,
      reject: (error: Error) => void,
      timeout: ReturnType<typeof startTimeout>,
    ]
  > = mapNew();

  // The peers known to understand the newer protocol messages.
  const markedClientIds = setNew<Id>();
  const pulling: IdMap<Pull> = mapNew();

  const rejectPendingRequests = (error: Error) =>
    mapForEach(pendingRequests, (requestId, [, , reject, timeout]) => {
      stopTimeout(timeout);
      collDel(pendingRequests, requestId);
      reject(error);
    });

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
      if (collSize(pendingRequests) >= MAX_PENDING_REQUESTS) {
        reject(errorNew(ERROR_SYNC_OVERFLOW, 'requests'));
        return;
      }
      const requestId = transactionId + DOT + getUniqueId(4);
      const timeout = startTimeout(() => {
        collDel(pendingRequests, requestId);
        reject(
          errorNew(
            ERROR_SYNC_RESPONSE,
            (toClientId ?? EMPTY_STRING) + DOT + requestId + DOT + message,
          ),
        );
      }, requestTimeoutSeconds);
      mapSet(pendingRequests, requestId, [
        toClientId,
        (response: Response, fromClientId: Id) => {
          stopTimeout(timeout);
          collDel(pendingRequests, requestId);
          resolve([response, fromClientId, transactionId]);
        },
        reject,
        timeout,
      ]);
      try {
        sendImpl(toClientId, requestId, message, body);
      } catch (error) {
        stopTimeout(timeout);
        collDel(pendingRequests, requestId);
        reject(error);
      }
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
        objForEach(cellStamps2, ([cell2, cellTime2], cellId) =>
          objSet(rowStamp[0], cellId, stampNew(cell2, cellTime2)),
        );
        rowStamp[1] = getLatestHlc(rowStamp[1], rowTime2);
      });
      tableStamp[1] = getLatestHlc(tableStamp[1], tableTime2);
    });
    tablesStamp[1] = getLatestHlc(tablesStamp[1], tablesTime2);
  };

  const receiveChangesFrom = (
    fromClientId: Id,
    changes: MergeableChanges | MergeableContent,
  ): MergeableChanges =>
    (receiveChanges
      ? receiveChanges(fromClientId, changes)
      : changes) as MergeableChanges;

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
      // Pulling the same hashes from the same peer again would only fetch the
      // same changes, so a pull already under way is shared instead.
      const pull = mapGet(pulling, otherClientId as Id);
      if (pull && arrayIsEqual(pull[0], otherContentHashes)) {
        return await pull[1];
      }
      const newPull: Pull = [
        otherContentHashes,
        pullChanges(otherClientId as Id, otherContentHashes, transactionId),
      ];
      mapSet(pulling, otherClientId as Id, newPull);
      return await tryFinallyAsync(
        () => newPull[1],
        () => {
          if (mapGet(pulling, otherClientId as Id) === newPull) {
            collDel(pulling, otherClientId as Id);
          }
        },
      );
    }, onIgnoredError);

  const pullChanges = async (
    otherClientId: Id,
    [otherTablesHash, otherValuesHash]: ContentHashes,
    transactionId: Id,
  ): Promise<MergeableChanges> => {
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
        const rowHashes = store.getMergeableRowHashes(differentTableHashes);
        const bucketed =
          collHas(markedClientIds, otherClientId) &&
          (isServer || collHas(markedClientIds, SERVER_CLIENT_ID));
        const bucketHashes: BucketHashes = objNew();
        const plainRowHashes: RowHashes = objNew();
        objForEach(rowHashes, (tableRowHashes, tableId) =>
          bucketed && objSize(tableRowHashes) >= BUCKET_COUNT
            ? objSet(bucketHashes, tableId, getBucketHashes(tableRowHashes))
            : objSet(plainRowHashes, tableId, tableRowHashes),
        );
        let differentRowHashes: RowHashes = objNew();
        const missingRows: CellHashes = objNew();

        if (!objIsEmpty(plainRowHashes)) {
          const [newRows, differentPlainRowHashes] = (
            await request<[TablesStamp, RowHashes]>(
              otherClientId,
              MessageValues.GetRowDiff,
              plainRowHashes,
              transactionId,
            )
          )[0];
          mergeTablesStamps(tablesChanges, newRows);
          differentRowHashes = differentPlainRowHashes;
        }

        if (!objIsEmpty(bucketHashes)) {
          objForEach(
            (
              await request<RowHashes>(
                otherClientId,
                MessageValues.GetBucketDiff,
                bucketHashes,
                transactionId,
              )
            )[0],
            (otherRowHashes, tableId) =>
              objForEach(otherRowHashes, (otherRowHash, rowId) =>
                isUndefined(rowHashes[tableId]?.[rowId])
                  ? objEnsure(
                      objEnsure(missingRows, tableId, objNew),
                      rowId,
                      objNew,
                    )
                  : otherRowHash !== rowHashes[tableId][rowId]
                    ? objSet(
                        objEnsure(differentRowHashes, tableId, objNew),
                        rowId,
                        otherRowHash,
                      )
                    : 0,
              ),
          );
        }

        const cellHashes = store.getMergeableCellHashes(differentRowHashes);
        objForEach(missingRows, (rows, tableId) =>
          objForEach(rows, (cells, rowId) =>
            objSet(objEnsure(cellHashes, tableId, objNew), rowId, cells),
          ),
        );
        if (!objIsEmpty(cellHashes)) {
          const newCells = (
            await request<TablesStamp>(
              otherClientId,
              MessageValues.GetCellDiff,
              cellHashes,
              transactionId,
            )
          )[0];
          mergeTablesStamps(tablesChanges, newCells);
        }
      }
    }

    return receiveChangesFrom(otherClientId as Id, [
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
    ]);
  };

  // Returns the hashes of this Store's Rows in each bucket whose hash differs
  // from the other peer's.
  const getMergeableBucketDiff = (otherBucketHashes: BucketHashes) => {
    const differentRowHashes: RowHashes = objNew();
    objForEach(
      store.getMergeableRowHashes(objMap(otherBucketHashes, () => -1)),
      (tableRowHashes, tableId) => {
        const bucketHashes = getBucketHashes(tableRowHashes);
        objForEach(tableRowHashes, (rowHash, rowId) => {
          const bucket = getBucket(rowId);
          if (bucketHashes[bucket] !== otherBucketHashes[tableId][bucket]) {
            objSet(
              objEnsure(differentRowHashes, tableId, objNew),
              rowId,
              rowHash,
            );
          }
        });
      },
    );
    return differentRowHashes;
  };

  const getPersisted = async (): Promise<MergeableContent | undefined> => {
    if (isServer) {
      // A server's Store does not wait to hear from its clients before it
      // starts, since a client could take a whole request timeout to answer,
      // and until then the server would not merge what the others send it.
      getChangesFromOtherStore()
        .then((changes) =>
          changes ? persisterListener?.(undefined, changes) : 0,
        )
        .catch(onIgnoredError);
      return;
    }
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
    destroyed = true;
    rejectPendingRequests(errorNew(ERROR_SYNC_RESPONSE, 'destroyed'));
    preDestroy();
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
      if (destroyed) {
        return;
      }
      if (!isProtocolMessageValid(transactionOrRequestId, message, body)) {
        onIgnoredError?.(errorNew(ERROR_SYNC_MESSAGE));
        return;
      }
      const isAutoLoading = syncing || persister.isAutoLoading();
      if (
        message != MessageValues.Response &&
        isMarked(transactionOrRequestId)
      ) {
        // A peer that is forgotten here marks itself again with its next
        // message, so the set can simply be emptied if it ever grows large.
        if (collSize(markedClientIds) >= MAX_MARKED_CLIENT_IDS) {
          collClear(markedClientIds);
        }
        setAdd(markedClientIds, fromClientId);
      }
      receives++;
      onReceive?.(fromClientId, transactionOrRequestId, message, body);
      if (message == MessageValues.Response) {
        ifNotUndefined(
          mapGet(pendingRequests, transactionOrRequestId),
          ([toClientId, handleResponse]) =>
            isNull(toClientId) || toClientId == fromClientId
              ? handleResponse(body, fromClientId)
              : /*! istanbul ignore next */
                0,
        );
      } else if (
        message == MessageValues.ContentHashes &&
        isAutoLoading &&
        !arrayIsEqual(mapGet(pulling, fromClientId)?.[0] ?? [], body)
      ) {
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
        if (!objIsEmpty(body[0][0]) || !objIsEmpty(body[1][0])) {
          persisterListener?.(
            undefined,
            receiveChangesFrom(fromClientId, body),
          );
        }
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
                    : message == MessageValues.GetBucketDiff
                      ? getMergeableBucketDiff(body)
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
    rejectPendingRequests,
  );

  return persister;
};
