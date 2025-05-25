import type {Id, IdOrNull} from '../@types/common/index.d.ts';
import type {
  CellStamp,
  ContentHashes,
  RowHashes,
  RowStamp,
  TableHashes,
  TablesStamp,
  ValuesStamp,
} from '../@types/mergeables/index.d.ts';
import type {
  MergeableChanges,
  MergeableContent,
  MergeableStore,
} from '../@types/mergeables/mergeable-store/index.d.ts';
import type {Content} from '../@types/store/index.d.ts';
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
import {objEnsure, objForEach, objFreeze, objIsEmpty} from '../common/obj.ts';
import {
  errorNew,
  ifNotUndefined,
  isArray,
  isUndefined,
  promiseNew,
  startTimeout,
  tryCatch,
} from '../common/other.ts';
import {IdSet2} from '../common/set.ts';
import {getLatestTime, stampNew, stampNewObj} from '../common/stamps.ts';
import {DOT, EMPTY_STRING} from '../common/strings.ts';

type MergeableListener = (
  content?: MergeableContent,
  changes?: MergeableChanges,
) => void;

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
  let running: 0 | 1 = 0;
  let syncing: 0 | 1 = 0;
  let synchronizerListener: MergeableListener | undefined;
  let sends = 0;
  let receives = 0;
  let status: StatusValues = StatusValues.Idle;
  let action;
  let autoPullHandle: MergeableListener | undefined;
  let autoPushListenerId: Id | undefined;

  const scheduledActions: Action[] = [];

  const pendingRequests: IdMap<
    [
      toClientId: IdOrNull,
      handleResponse: (response: any, fromClientId: Id) => void,
    ]
  > = mapNew();

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

  const addPersisterListener = (listener: MergeableListener) =>
    (synchronizerListener = listener);

  const delPersisterListener = () => (synchronizerListener = undefined);

  const startSync = async (initialContent?: Content) => {
    syncing = 1;
    return await startAutoPersisting(initialContent);
  };

  const stopSync = async () => {
    syncing = 0;
    await stopAutoPersisting();
    return synchronizer;
  };

  const destroy = async () => {
    arrayClear(scheduledActions);
    await synchronizer.stopSync();
    extraDestroy();
    return synchronizer;
  };

  const getStats = () => ({sends, receives});

  const statusListeners: IdSet2 = mapNew();

  const [_getChanges, hasChanges, setDefaultContent] = [
    () => store.getTransactionMergeableChanges(false),
    ([[changedTables], [changedValues]]: MergeableChanges) =>
      !objIsEmpty(changedTables) || !objIsEmpty(changedValues),
    store.setDefaultContent,
  ];

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

  const setContentOrChanges = (
    contentOrChanges: MergeableContent | MergeableChanges | undefined,
  ): void => {
    (contentOrChanges?.[2] === 1
      ? store.applyMergeableChanges
      : store.setMergeableContent)(
      contentOrChanges as MergeableContent & MergeableChanges,
    );
  };

  const pull = async (
    initialContent?: Content | (() => Content),
  ): Promise<Synchronizer> => {
    /*! istanbul ignore else */
    if (status != StatusValues.Pushing) {
      setStatus(StatusValues.Pulling);
      await schedule(async () => {
        await tryCatch(
          async () => {
            const content = await getPersisted();
            if (isArray(content)) {
              setContentOrChanges(content);
            } else if (initialContent) {
              setDefaultContent(initialContent);
            } else {
              errorNew(`Content is not an array: ${content}`);
            }
          },
          () => {
            if (initialContent) {
              setDefaultContent(initialContent);
            }
          },
        );
        setStatus(StatusValues.Idle);
      });
    }
    return synchronizer;
  };

  const startAutoPull = async (
    initialContent?: Content | (() => Content),
  ): Promise<Synchronizer> => {
    stopAutoPull();
    await pull(initialContent);
    await tryCatch(
      async () =>
        (autoPullHandle = await addPersisterListener(
          async (content, changes) => {
            if (changes || content) {
              /*! istanbul ignore else */
              if (status != StatusValues.Pushing) {
                setStatus(StatusValues.Pulling);
                setContentOrChanges(changes ?? content);
                setStatus(StatusValues.Idle);
              }
            } else {
              await pull();
            }
          },
        )),
      onIgnoredError,
    );
    return synchronizer;
  };

  const stopAutoPull = async (): Promise<Synchronizer> => {
    if (autoPullHandle) {
      await tryCatch(() => delPersisterListener(), onIgnoredError);
      autoPullHandle = undefined;
    }
    return synchronizer;
  };

  const isAutoPulling = () => !isUndefined(autoPullHandle);

  const push = async (changes?: MergeableChanges): Promise<Synchronizer> => {
    /*! istanbul ignore else */
    if (status != StatusValues.Pulling) {
      setStatus(StatusValues.Pushing);
      await schedule(async () => {
        await tryCatch(
          () => setPersisted(store.getMergeableContent, changes),
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
    autoPushListenerId = store.addDidFinishTransactionListener(() => {
      const changes = store.getTransactionMergeableChanges(false) as any;
      if (hasChanges(changes)) {
        push(changes);
      }
    });
    return synchronizer;
  };

  const stopAutoPush = async (): Promise<Synchronizer> => {
    if (autoPushListenerId) {
      store.delListener(autoPushListenerId);
      autoPushListenerId = undefined;
    }
    return synchronizer;
  };

  const isAutoPushing = () => !isUndefined(autoPushListenerId);

  const startAutoPersisting = async (
    initialContent?: Content | (() => Content),
    startPushFirst = false,
  ): Promise<Synchronizer> => {
    const [call1, call2] = startPushFirst
      ? [startAutoPush, startAutoPull]
      : [startAutoPull, startAutoPush];
    await call1(initialContent);
    await call2(initialContent);
    return synchronizer;
  };

  const stopAutoPersisting = async (
    stopPushFirst = false,
  ): Promise<Synchronizer> => {
    const [call1, call2] = stopPushFirst
      ? [stopAutoPush, stopAutoPull]
      : [stopAutoPull, stopAutoPush];
    await call1();
    await call2();
    return synchronizer;
  };

  const getStatus = (): Status => status as any;

  const addStatusListener = (listener: StatusListener): Id =>
    addListener(listener, statusListeners);

  const delListener = (listenerId: Id): MergeableStore => {
    delListenerImpl(listenerId);
    return store;
  };

  const schedule = async (...actions: Action[]): Promise<Synchronizer> => {
    arrayPush(scheduledActions, ...actions);
    await run();
    return synchronizer;
  };

  registerReceive(
    (
      fromClientId: Id,
      transactionOrRequestId: IdOrNull,
      message: MessageEnum | any,
      body: any,
    ) => {
      const isPulling = syncing || isAutoPulling();
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
      } else if (message == MessageValues.ContentHashes && isPulling) {
        getChangesFromOtherStore(
          fromClientId,
          body,
          transactionOrRequestId ?? undefined,
        )
          .then((changes: any) => {
            synchronizerListener?.(undefined, changes);
          })
          .catch(onIgnoredError);
      } else if (message == MessageValues.ContentDiff && isPulling) {
        synchronizerListener?.(undefined, body);
      } else {
        ifNotUndefined(
          message == MessageValues.GetContentHashes &&
            (syncing || isAutoPushing())
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

  const synchronizer = objFreeze({
    pull,
    startAutoPull,
    stopAutoPull,

    push,
    startAutoPush,
    stopAutoPush,

    getStatus,
    addStatusListener,
    delListener,

    getStats,

    startSync,
    stopSync,
    destroy,

    ...extra,
  });
  return synchronizer;
};
