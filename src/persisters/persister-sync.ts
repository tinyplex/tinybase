import {MergeableContent, MergeableStore} from '../types/mergeable-store';
import {
  SyncPersister,
  createSyncPersister as createSyncPersisterDecl,
} from '../types/persisters/persister-sync';
import {mapNew, mapSet} from '../common/map';
import {PersisterListener} from '../types/persisters';
import {collForEach} from '../common/coll';
import {createCustomPersister} from '../persisters';
import {isUndefined} from '../common/other';
import {objForEach} from '../common/obj';

const getBusFunctions = (): [
  (
    store: MergeableStore,
    recv: (store: MergeableStore, message: string, payload: any) => void,
  ) => void,
  (fromStore: MergeableStore, message: string, payload: any) => void,
] => {
  const stores: Map<
    MergeableStore,
    (store: MergeableStore, message: string, payload: any) => void
  > = mapNew();
  const addStore = (
    store: MergeableStore,
    recv: (store: MergeableStore, message: string, payload: any) => void,
  ): void => {
    mapSet(stores, store, recv);
  };
  const sendMessage = (
    fromStore: MergeableStore,
    message: string,
    payload: any,
  ): void =>
    collForEach(stores, (recv, store) =>
      store != fromStore ? recv(store, message, payload) : 0,
    );
  return [addStore, sendMessage];
};

export const createSyncPersister = ((
  store: MergeableStore,
  otherStore: MergeableStore,
  onIgnoredError?: (error: any) => void,
): SyncPersister => {
  const [addStore, sendMessage] = getBusFunctions();

  const storeRecv = (store: MergeableStore, message: string, payload: any) => {
    if (message == 'contentHashes') {
      const [_contentHash, [tablesHashes, valuesHashes]] =
        store.getMergeableContentHashes();
      if (payload[1][0] != tablesHashes) {
        sendMessage(store, 'getTablesDelta', store.getMergeableTablesHashes());
      }
      if (payload[1][1] != valuesHashes) {
        sendMessage(store, 'getValuesDelta', store.getMergeableValuesHashes());
      }
    }

    if (message == 'getContentDelta') {
      sendMessage(
        store,
        'contentDelta',
        store.getMergeableContentDelta(payload),
      );
    }
    if (message == 'getTablesDelta') {
      sendMessage(store, 'tablesDelta', store.getMergeableTablesDelta(payload));
    }
    if (message == 'getTableDelta') {
      sendMessage(store, 'tableDelta', [
        payload[0],
        store.getMergeableTableDelta(payload[0], payload[1]),
      ]);
    }
    if (message == 'getRowDelta') {
      sendMessage(store, 'rowDelta', [
        payload[0],
        payload[1],
        store.getMergeableRowDelta(payload[0], payload[1], payload[2]),
      ]);
    }
    if (message == 'getValuesDelta') {
      sendMessage(store, 'valuesDelta', store.getMergeableValuesDelta(payload));
    }

    if (message == 'contentDelta') {
      if (!isUndefined(payload)) {
        const [_time, [tablesHash, valuesHash]] = payload;
        if (!isUndefined(tablesHash)) {
          sendMessage(
            store,
            'getTablesDelta',
            store.getMergeableTablesHashes(),
          );
        }
        if (!isUndefined(valuesHash)) {
          sendMessage(
            store,
            'getValuesDelta',
            store.getMergeableValuesHashes(),
          );
        }
      }
    }

    if (message == 'tablesDelta') {
      objForEach(payload[1], (_, tableId) => {
        sendMessage(store, 'getTableDelta', [
          tableId,
          store.getMergeableTableHashes(tableId),
        ]);
      });
    }
    if (message == 'tableDelta') {
      objForEach(payload[1][1], (_, rowId) => {
        sendMessage(store, 'getRowDelta', [
          payload[0],
          rowId,
          store.getMergeableRowHashes(payload[0], rowId),
        ]);
      });
    }
    if (message == 'rowDelta') {
      const [tableId, rowId, [time, rowChanges]] = payload;
      store.applyMergeableChanges([
        time,
        [
          [time, {[tableId]: [time, {[rowId]: [time, rowChanges]}]}],
          ['', {}],
        ],
      ]);
    }
    if (message == 'valuesDelta') {
      const [time, valuesChanges] = payload;
      store.applyMergeableChanges([
        time,
        [
          ['', {}],
          [time, valuesChanges],
        ],
      ]);
    }
  };

  addStore(store, storeRecv);
  addStore(otherStore, storeRecv);

  const getPersisted = async (): Promise<MergeableContent> => {
    const persisted = otherStore.getMergeableContent();
    if (persisted[0] === '') {
      return null as any;
    }

    sendMessage(store, 'getContentDelta', store.getMergeableContentHashes());

    //    return persisted;
  };

  const setPersisted = async (): Promise<void> => {
    sendMessage(store, 'contentHashes', store.getMergeableContentHashes());
  };

  const addPersisterListener = (listener: PersisterListener) =>
    otherStore.addDidFinishTransactionListener(() => listener());

  const delPersisterListener = otherStore.delListener;

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
    true,
    ['getOtherStore', otherStore],
  ) as SyncPersister;
}) as typeof createSyncPersisterDecl;
