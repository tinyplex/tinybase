import {
  ContentHashes,
  MergeableChanges,
  MergeableStore,
  RowIdsDiff,
  TableIdsDiff,
  TablesStamp,
  ValuesStamp,
} from './types/mergeable-store';
import {DEBUG, ifNotUndefined, isUndefined, promiseNew} from './common/other';
import {Id, IdOrNull} from './types/common';
import {IdMap, mapGet, mapNew, mapSet} from './common/map';
import {MessageType, Receive, Send, Synchronizer} from './types/synchronizers';
import {Tables, Values} from './types/store';
import {EMPTY_STRING} from './common/strings';
import {PersisterListener} from './types/persisters';
import {collDel} from './common/coll';
import {createCustomPersister} from './persisters';
import {getHlcFunctions} from './mergeable-store/hlc';

const RESPONSE = 0;
const CONTENT_HASHES = 1;
const GET_CONTENT_HASHES = 2;
const GET_TABLE_IDS_DIFF = 3;
const GET_ROW_IDS_DIFF = 4;
const GET_TABLES_CHANGES = 5;
const GET_VALUES_CHANGES = 6;

export const createCustomSynchronizer = (
  store: MergeableStore,
  send: Send,
  onReceive: (receive: Receive) => void,
  destroyImpl: () => void,
  requestTimeoutSeconds: number,
  onIgnoredError?: (error: any) => void,
  // undocumented:
  extra: {[methodName: string]: (...args: any[]) => any} = {},
): Synchronizer => {
  let persisterListener: PersisterListener | undefined;
  let sends = 0;
  let receives = 0;

  const [getHlc] = getHlcFunctions(store.getId());
  const pendingRequests: IdMap<
    [
      toClientId: IdOrNull,
      handleResponse: (response: any, fromClientId: Id) => void,
    ]
  > = mapNew();

  onReceive(
    (
      fromClientId: Id,
      requestId: IdOrNull,
      messageType: MessageType,
      messageBody: any,
    ) => {
      if (DEBUG) {
        receives++;
      }

      if (messageType == RESPONSE) {
        ifNotUndefined(
          mapGet(pendingRequests, requestId),
          ([toClientId, handleResponse]) =>
            isUndefined(toClientId) || toClientId == fromClientId
              ? handleResponse(messageBody, fromClientId)
              : /*! istanbul ignore next */
                0,
        );
      } else if (messageType == CONTENT_HASHES && persister.isAutoLoading()) {
        getChangesFromOtherStore(fromClientId, messageBody).then(
          (changes: any) => persisterListener?.(undefined, () => changes),
        );
      } else {
        ifNotUndefined(
          messageType == GET_CONTENT_HASHES && persister.isAutoSaving()
            ? store.getMergeableContentHashes()
            : messageType == GET_TABLE_IDS_DIFF
              ? store.getMergeableTableIdsDiff(messageBody)
              : messageType == GET_ROW_IDS_DIFF
                ? store.getMergeableRowIdsDiff(messageBody)
                : messageType == GET_TABLES_CHANGES
                  ? store.getMergeableTablesChanges(messageBody)
                  : messageType == GET_VALUES_CHANGES
                    ? store.getMergeableValuesChanges(messageBody)
                    : undefined,
          (response) => {
            if (DEBUG) {
              sends++;
            }
            send(fromClientId, requestId, RESPONSE, response);
          },
        );
      }
    },
  );

  const request = async <Response>(
    toClientId: IdOrNull,
    messageType: MessageType,
    messageBody: any = EMPTY_STRING,
  ): Promise<[response: Response, fromClientId: Id]> =>
    promiseNew((resolve, reject) => {
      const requestId = getHlc();
      const timeout = setTimeout(() => {
        collDel(pendingRequests, requestId);
        reject(
          `No response from ${toClientId ?? 'anyone'} to '${messageType}'`,
        );
      }, requestTimeoutSeconds * 1000);
      mapSet(pendingRequests, requestId, [
        toClientId,
        (response: Response, fromClientId: Id) => {
          clearTimeout(timeout);
          collDel(pendingRequests, requestId);
          resolve([response, fromClientId]);
        },
      ]);
      if (DEBUG) {
        sends++;
      }
      send(toClientId, requestId, messageType, messageBody);
    });

  const getChangesFromOtherStore = async (
    otherClientId: IdOrNull = null,
    otherContentHashes?: ContentHashes,
  ): Promise<MergeableChanges> => {
    if (isUndefined(otherContentHashes)) {
      [otherContentHashes, otherClientId] = await request<ContentHashes>(
        otherClientId,
        GET_CONTENT_HASHES,
      );
    }
    const [otherContentTime, [otherTablesHash, otherValuesHash]] =
      otherContentHashes;
    const [, [tablesHash, valuesHash]] = store.getMergeableContentHashes();

    const changes: MergeableChanges = [
      EMPTY_STRING,
      [[EMPTY_STRING, {}], [EMPTY_STRING, {}], 1],
    ];

    if (tablesHash != otherTablesHash) {
      changes[0] = otherContentTime;
      changes[1][0] = (
        await request<TablesStamp>(
          otherClientId,
          GET_TABLES_CHANGES,
          store.getMergeableCellHashes(
            (
              await request<RowIdsDiff>(
                otherClientId,
                GET_ROW_IDS_DIFF,
                store.getMergeableRowHashes(
                  (
                    await request<TableIdsDiff>(
                      otherClientId,
                      GET_TABLE_IDS_DIFF,
                      store.getMergeableTableHashes(),
                    )
                  )[0],
                ),
              )
            )[0],
          ),
        )
      )[0];
    }

    if (valuesHash != otherValuesHash) {
      changes[0] = otherContentTime;
      changes[1][1] = (
        await request<ValuesStamp>(
          otherClientId,
          GET_VALUES_CHANGES,
          store.getMergeableValuesHashes(),
        )
      )[0];
    }

    return changes;
  };

  const getPersisted = async (): Promise<any> => {
    const changes = await getChangesFromOtherStore();
    return changes[0] != EMPTY_STRING ? changes : undefined;
  };

  const setPersisted = async (): Promise<void> => {
    if (DEBUG) {
      sends++;
    }
    send(null, null, CONTENT_HASHES, store.getMergeableContentHashes());
  };

  const addPersisterListener = (listener: PersisterListener) =>
    (persisterListener = listener);

  const delPersisterListener = () => (persisterListener = undefined);

  const startSync = async (initialTables?: Tables, initialValues?: Values) =>
    await (
      await persister.startAutoLoad(initialTables, initialValues)
    ).startAutoSave();

  const stopSync = () => persister.stopAutoLoad().stopAutoSave();

  const destroy = () => {
    destroyImpl();
    return persister.stopSync();
  };

  const getSynchronizerStats = () => (DEBUG ? {sends, receives} : {});

  const persister = createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
    true,
    {startSync, stopSync, destroy, getSynchronizerStats, ...extra},
  ) as Synchronizer;
  return persister;
};
