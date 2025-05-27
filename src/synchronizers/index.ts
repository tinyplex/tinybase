import type {Id, IdOrNull} from '../@types/common/index.d.ts';
import type {
  CellStamp,
  ContentHashes,
  Mergeable,
  MergeableChanges,
  RowHashes,
  RowStamp,
  TableHashes,
  TablesStamp,
  ValuesStamp,
} from '../@types/mergeables/index.d.ts';
import type {
  Message as MessageEnum,
  Receive,
  Send,
  Status,
  StatusListener,
  Synchronizer,
} from '../@types/synchronizers/index.d.ts';
import {arrayClear, arrayPush, arrayShift} from '../common/array.ts';
import {collDel} from '../common/coll.ts';
import {getUniqueId} from '../common/index.ts';
import {getListenerFunctions} from '../common/listeners.ts';
import {IdMap, mapGet, mapNew, mapSet} from '../common/map.ts';
import {
  changesAreNotEmpty,
  getMergeableFunctions,
} from '../common/mergeable.ts';
import {objEnsure, objForEach, objFreeze, objIsEmpty} from '../common/obj.ts';
import {
  ifNotUndefined,
  isUndefined,
  promiseNew,
  startTimeout,
  tryCatch,
} from '../common/other.ts';
import {IdSet2} from '../common/set.ts';
import {getLatestTime, stampNew, stampObjNew} from '../common/stamps.ts';
import {DOT, EMPTY_STRING} from '../common/strings.ts';

type Action = () => Promise<any>;

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

const enum StatusValues {
  Idle = 0,
  Pulling = 1,
  Pushing = 2,
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

const getTransactionId = () => getUniqueId(11);

export const createCustomSynchronizer = (
  mergeable: Mergeable,
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
  let running: 0 | 1 = 0;
  let syncing: 0 | 1 = 0;
  let sends = 0;
  let receives = 0;
  let status: StatusValues = StatusValues.Idle;
  let action;
  let pullListener: ((changes: MergeableChanges) => void) | undefined;
  let delPushListener: (() => void) | undefined;

  const scheduledActions: Action[] = [];
  const statusListeners: IdSet2 = mapNew();
  const pendingRequests: IdMap<
    [
      toMergeableId: IdOrNull,
      handleResponse: (response: any, fromMergeableId: Id) => void,
    ]
  > = mapNew();

  const [
    getMergeableContentHashes,
    getMergeableTableHashes,
    getMergeableTableDiff,
    getMergeableRowHashes,
    getMergeableRowDiff,
    getMergeableCellHashes,
    getMergeableCellDiff,
    getMergeableValueHashes,
    getMergeableValueDiff,
  ] = getMergeableFunctions(mergeable);

  const sendImpl = (
    toMergeableId: IdOrNull,
    requestId: IdOrNull,
    message: MessageEnum | any,
    body: any,
  ) => {
    sends++;
    onSend?.(toMergeableId, requestId, message, body);
    send(toMergeableId, requestId, message, body);
  };

  const request = async <Response>(
    toMergeableId: IdOrNull,
    message: MessageEnum | any,
    body: any,
    transactionId: Id,
  ): Promise<[response: Response, fromMergeableId: Id, transactionId: Id]> =>
    promiseNew((resolve, reject) => {
      const requestId = transactionId + DOT + getUniqueId(4);
      const timeout = startTimeout(() => {
        collDel(pendingRequests, requestId);
        reject(
          `No response from ${toMergeableId ?? 'anyone'} to ${requestId}, ` +
            message,
        );
      }, requestTimeoutSeconds);
      mapSet(pendingRequests, requestId, [
        toMergeableId,
        (response: Response, fromMergeableId: Id) => {
          clearTimeout(timeout);
          collDel(pendingRequests, requestId);
          resolve([response, fromMergeableId, transactionId]);
        },
      ]);
      sendImpl(toMergeableId, requestId, message, body);
    });

  const mergeTablesStamps = (
    tablesStamp: TablesStamp,
    [tableStamps2, tablesTime2]: TablesStamp,
  ) => {
    objForEach(tableStamps2, ([rowStamps2, tableTime2], tableId) => {
      const tableStamp = objEnsure(
        tablesStamp[0],
        tableId,
        stampObjNew<RowStamp>,
      );
      objForEach(rowStamps2, ([cellStamps2, rowTime2], rowId) => {
        const rowStamp = objEnsure(
          tableStamp[0],
          rowId,
          stampObjNew<CellStamp>,
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

  const pullChangesFromOtherMergeable = (
    otherMergeableId: IdOrNull = null,
    otherContentHashes?: ContentHashes,
    transactionId: Id = getTransactionId(),
  ): Promise<MergeableChanges | void> =>
    tryCatch(async () => {
      if (isUndefined(otherContentHashes)) {
        [otherContentHashes, otherMergeableId, transactionId] =
          await request<ContentHashes>(
            null,
            MessageValues.GetContentHashes,
            EMPTY_STRING,
            transactionId,
          );
      }
      const [otherTablesHash, otherValuesHash] = otherContentHashes;
      const [tablesHash, valuesHash] = getMergeableContentHashes();

      let tablesChanges: TablesStamp = stampObjNew();
      if (tablesHash != otherTablesHash) {
        const [newTables, differentTableHashes] = (
          await request<[TablesStamp, TableHashes]>(
            otherMergeableId,
            MessageValues.GetTableDiff,
            getMergeableTableHashes(),
            transactionId,
          )
        )[0];
        tablesChanges = newTables;

        if (!objIsEmpty(differentTableHashes)) {
          const [newRows, differentRowHashes] = (
            await request<[TablesStamp, RowHashes]>(
              otherMergeableId,
              MessageValues.GetRowDiff,
              getMergeableRowHashes(differentTableHashes),
              transactionId,
            )
          )[0];
          mergeTablesStamps(tablesChanges, newRows);

          if (!objIsEmpty(differentRowHashes)) {
            const newCells = (
              await request<TablesStamp>(
                otherMergeableId,
                MessageValues.GetCellDiff,
                getMergeableCellHashes(differentRowHashes),
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
          ? stampObjNew()
          : (
              await request<ValuesStamp>(
                otherMergeableId,
                MessageValues.GetValueDiff,
                getMergeableValueHashes(),
                transactionId,
              )
            )[0],
        1,
      ];
    }, onIgnoredError);

  const startSync = async () => {
    syncing = 1;
    await startAutoPull();
    return await startAutoPush();
  };

  const stopSync = async () => {
    syncing = 0;
    await stopAutoPull();
    return await stopAutoPush();
  };

  const destroy = async () => {
    arrayClear(scheduledActions);
    await synchronizer.stopSync();
    extraDestroy();
    return synchronizer;
  };

  const getStats = () => ({sends, receives});

  const [addListener, callListeners, delListenerImpl] = getListenerFunctions(
    () => synchronizer,
  );

  const setStatus = (newStatus: StatusValues): void => {
    if (newStatus != status) {
      status = newStatus;
      callListeners(statusListeners, undefined, status);
    }
  };

  const run = async (): Promise<void> => {
    /*! istanbul ignore else */
    if (!running) {
      running = 1;
      while (!isUndefined((action = arrayShift(scheduledActions)))) {
        await tryCatch(action, onIgnoredError);
      }
      running = 0;
    }
  };

  const pull = async (): Promise<Synchronizer> => {
    /*! istanbul ignore else */
    if (status != StatusValues.Pushing) {
      setStatus(StatusValues.Pulling);
      await schedule(async () => {
        await tryCatch(async () => {
          const changes = await pullChangesFromOtherMergeable();
          if (changesAreNotEmpty(changes)) {
            mergeable.applyMergeableChanges(changes);
          }
        });
        setStatus(StatusValues.Idle);
      });
    }
    return synchronizer;
  };

  const startAutoPull = async (): Promise<Synchronizer> => {
    stopAutoPull();
    await pull();
    await tryCatch(
      async () =>
        (pullListener = async (changes) => {
          /*! istanbul ignore else */
          if (changesAreNotEmpty(changes) && status != StatusValues.Pushing) {
            setStatus(StatusValues.Pulling);
            mergeable.applyMergeableChanges(changes);
            setStatus(StatusValues.Idle);
          }
        }),
      onIgnoredError,
    );
    return synchronizer;
  };

  const stopAutoPull = async (): Promise<Synchronizer> => {
    pullListener = undefined;
    return synchronizer;
  };

  const isAutoPulling = () => !isUndefined(pullListener);

  const push = async (
    changes?: MergeableChanges<false>,
  ): Promise<Synchronizer> => {
    /*! istanbul ignore else */
    if (status != StatusValues.Pulling) {
      setStatus(StatusValues.Pushing);
      await schedule(async () => {
        await tryCatch(
          () =>
            changes
              ? changesAreNotEmpty(changes)
                ? sendImpl(
                    null,
                    getTransactionId(),
                    MessageValues.ContentDiff,
                    changes,
                  )
                : 0
              : sendImpl(
                  null,
                  getTransactionId(),
                  MessageValues.ContentHashes,
                  getMergeableContentHashes(),
                ),
          onIgnoredError,
        );
        setStatus(StatusValues.Idle);
      });
    }
    return synchronizer;
  };

  const startAutoPush = async (): Promise<Synchronizer> => {
    stopAutoPush();
    await push();
    delPushListener = mergeable.addMergeableChangesListener(push);
    return synchronizer;
  };

  const stopAutoPush = async (): Promise<Synchronizer> => {
    if (delPushListener) {
      delPushListener();
      delPushListener = undefined;
    }
    return synchronizer;
  };

  const isAutoPushing = () => !isUndefined(delPushListener);

  const getStatus = (): Status => status as any;

  const addStatusListener = (listener: StatusListener): Id =>
    addListener(listener, statusListeners);

  const delListener = (listenerId: Id): Mergeable => {
    delListenerImpl(listenerId);
    return mergeable;
  };

  const schedule = async (...actions: Action[]): Promise<Synchronizer> => {
    arrayPush(scheduledActions, ...actions);
    await run();
    return synchronizer;
  };

  registerReceive(
    (
      fromMergeableId: Id,
      transactionOrRequestId: IdOrNull,
      message: MessageEnum | any,
      body: any,
    ) => {
      const isPulling = syncing || isAutoPulling();
      receives++;
      onReceive?.(fromMergeableId, transactionOrRequestId, message, body);
      if (message == MessageValues.Response) {
        ifNotUndefined(
          mapGet(pendingRequests, transactionOrRequestId),
          ([toMergeableId, handleResponse]) =>
            isUndefined(toMergeableId) || toMergeableId == fromMergeableId
              ? handleResponse(body, fromMergeableId)
              : /*! istanbul ignore next */
                0,
        );
      } else if (message == MessageValues.ContentHashes && isPulling) {
        pullChangesFromOtherMergeable(
          fromMergeableId,
          body,
          transactionOrRequestId ?? undefined,
        )
          .then((changes: any) => {
            pullListener?.(changes);
          })
          .catch(onIgnoredError);
      } else if (message == MessageValues.ContentDiff && isPulling) {
        pullListener?.(body);
      } else {
        ifNotUndefined(
          message == MessageValues.GetContentHashes &&
            (syncing || isAutoPushing())
            ? getMergeableContentHashes()
            : message == MessageValues.GetTableDiff
              ? getMergeableTableDiff(body)
              : message == MessageValues.GetRowDiff
                ? getMergeableRowDiff(body)
                : message == MessageValues.GetCellDiff
                  ? getMergeableCellDiff(body)
                  : message == MessageValues.GetValueDiff
                    ? getMergeableValueDiff(body)
                    : undefined,
          (response) => {
            sendImpl(
              fromMergeableId,
              transactionOrRequestId,
              MessageValues.Response,
              response,
            );
          },
        );
      }
    },
  );

  const synchronizer = objFreeze({
    pull,
    startAutoPull,
    stopAutoPull,

    push,
    startAutoPush,
    stopAutoPush,

    startSync,
    stopSync,

    getStatus,
    addStatusListener,
    delListener,

    getStats,
    destroy,

    ...extra,
  });
  return synchronizer;
};
