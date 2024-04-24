import {
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
} from './types/mergeable-store';
import {DEBUG, ifNotUndefined, isUndefined, promiseNew} from './common/other';
import {Id, IdOrNull} from './types/common';
import {IdMap, mapGet, mapNew, mapSet} from './common/map';
import {MessageType, Receive, Send, Synchronizer} from './types/synchronizers';
import {getLatestTime, newStamp, stampNewObj} from './mergeable-store/stamps';
import {objEnsure, objForEach, objIsEmpty} from './common/obj';
import {Content} from './types/store';
import {EMPTY_STRING} from './common/strings';
import {PersisterListener} from './types/persisters';
import {collDel} from './common/coll';
import {createCustomPersister} from './persisters';
import {getHlcFunctions} from './mergeable-store/hlc';

const RESPONSE = 0;
const GET_CONTENT_HASHES = 1;
const CONTENT_HASHES = 2;
const CONTENT_DIFF = 3;
const GET_TABLE_DIFF = 4;
const GET_ROW_DIFF = 5;
const GET_CELL_DIFF = 6;
const GET_VALUE_DIFF = 7;

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
          (changes: any) => {
            persisterListener?.(undefined, () => changes);
          },
        );
      } else if (messageType == CONTENT_DIFF && persister.isAutoLoading()) {
        persisterListener?.(undefined, () => messageBody);
      } else {
        ifNotUndefined(
          messageType == GET_CONTENT_HASHES && persister.isAutoSaving()
            ? store.getMergeableContentHashes()
            : messageType == GET_TABLE_DIFF
              ? store.getMergeableTableDiff(messageBody)
              : messageType == GET_ROW_DIFF
                ? store.getMergeableRowDiff(messageBody)
                : messageType == GET_CELL_DIFF
                  ? store.getMergeableCellDiff(messageBody)
                  : messageType == GET_VALUE_DIFF
                    ? store.getMergeableValueDiff(messageBody)
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
            (rowStamp[0][cellId] = newStamp(cell2, cellTime2)),
        );
        rowStamp[1] = getLatestTime(rowStamp[1], rowTime2);
      });
      tableStamp[1] = getLatestTime(tableStamp[1], tableTime2);
    });
    tablesStamp[1] = getLatestTime(tablesStamp[1], tablesTime2);
  };

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
    const [otherTablesHash, otherValuesHash] = otherContentHashes;
    const [tablesHash, valuesHash] = store.getMergeableContentHashes();

    let tablesChanges: TablesStamp = stampNewObj();
    if (tablesHash != otherTablesHash) {
      const [newTables, differentTableHashes] = (
        await request<[TablesStamp, TableHashes]>(
          otherClientId,
          GET_TABLE_DIFF,
          store.getMergeableTableHashes(),
        )
      )[0];
      tablesChanges = newTables;

      if (!objIsEmpty(differentTableHashes)) {
        const [newRows, differentRowHashes] = (
          await request<[TablesStamp, RowHashes]>(
            otherClientId,
            GET_ROW_DIFF,
            store.getMergeableRowHashes(differentTableHashes),
          )
        )[0];
        mergeTablesStamps(tablesChanges, newRows);

        if (!objIsEmpty(differentRowHashes)) {
          const newCells = (
            await request<TablesStamp>(
              otherClientId,
              GET_CELL_DIFF,
              store.getMergeableCellHashes(differentRowHashes),
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
              GET_VALUE_DIFF,
              store.getMergeableValuesHashes(),
            )
          )[0],
      1,
    ];
  };

  const getPersisted = async (): Promise<MergeableChanges | undefined> => {
    const changes = await getChangesFromOtherStore();
    return !objIsEmpty(changes[0][0]) || !objIsEmpty(changes[1][0])
      ? changes
      : undefined;
  };

  const setPersisted = async (
    _getContent: () => MergeableContent,
    changes?: MergeableChanges,
  ): Promise<void> => {
    if (DEBUG) {
      sends++;
    }
    if (changes) {
      send(null, null, CONTENT_DIFF, changes);
    } else {
      send(null, null, CONTENT_HASHES, store.getMergeableContentHashes());
    }
  };

  const addPersisterListener = (listener: PersisterListener) =>
    (persisterListener = listener);

  const delPersisterListener = () => (persisterListener = undefined);

  const startSync = async (initialContent?: Content) =>
    await (await persister.startAutoLoad(initialContent)).startAutoSave();

  const stopSync = () => persister.stopAutoLoad().stopAutoSave();

  const destroy = () => {
    destroyImpl();
    return persister.stopSync();
  };

  const getSynchronizerStats = () => (DEBUG ? {sends, receives} : {});

  const persister = createCustomPersister(
    store,
    getPersisted as any,
    setPersisted as any,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
    true,
    {startSync, stopSync, destroy, getSynchronizerStats, ...extra},
  ) as Synchronizer;
  return persister;
};
