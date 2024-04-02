import {Id, Ids} from '../types/common';
import {
  SyncPersister,
  createSyncPersister as createSyncPersisterDecl,
} from '../types/persisters/persister-sync';
import {mapNew, mapSet} from '../common/map';
import {MergeableStore} from '../types/mergeable-store';
import {PersisterListener} from '../types/persisters';
import {collForEach} from '../common/coll';
import {createCustomPersister} from '../persisters';
import {isUndefined} from '../common/other';
import {objForEach} from '../common/obj';

type ReceiveMessage = (
  transactionId: Id,
  store: MergeableStore,
  message: string,
  payload: any,
  args?: Ids,
) => void;

type SendMessage = (
  transactionId: Id,
  fromStore: MergeableStore,
  message: string,
  payload: any,
  args?: Ids,
) => void;

const getBusFunctions = (): [
  addStore: (store: MergeableStore, receiveMessage: ReceiveMessage) => void,
  sendMessage: SendMessage,
] => {
  const stores: Map<MergeableStore, ReceiveMessage> = mapNew();
  const addStore = (
    store: MergeableStore,
    receiveMessage: ReceiveMessage,
  ): void => {
    mapSet(stores, store, receiveMessage);
  };
  const sendMessage = (
    transactionId: Id,
    fromStore: MergeableStore,
    message: string,
    payload: any,
    args?: Ids,
  ): void =>
    collForEach(stores, (receiveMessage, store) =>
      store != fromStore
        ? receiveMessage(transactionId, store, message, payload, args)
        : 0,
    );
  return [addStore, sendMessage];
};

export const createSyncPersister = ((
  store: MergeableStore,
  otherStore: MergeableStore,
  onIgnoredError?: (error: any) => void,
): SyncPersister => {
  const [addStore, sendMessage] = getBusFunctions();

  const receiveMessage: ReceiveMessage = (
    transactionId: Id,
    store: MergeableStore,
    message: string,
    payload: any,
    args: Ids = [],
  ) => {
    // console.log(transactionId, store.getId(), 'received', message, args);
    // console.log(JSON.stringify(payload));
    // console.log();

    if (message == 'contentHashes') {
      const [_contentHash, [tablesHashes, valuesHashes]] = payload;
      const [_myContentHash, [myTablesHashes, myValuesHashes]] =
        store.getMergeableContentHashes();
      if (tablesHashes != myTablesHashes) {
        sendMessage(
          transactionId,
          store,
          'getTablesDelta',
          store.getMergeableTablesHashes(),
        );
      }
      if (valuesHashes != myValuesHashes) {
        sendMessage(
          transactionId,
          store,
          'getValuesDelta',
          store.getMergeableValuesHashes(),
        );
      }
    }

    if (message == 'getContentDelta') {
      sendMessage(
        transactionId,
        store,
        'contentDelta',
        store.getMergeableContentDelta(payload),
      );
    }
    if (message == 'getTablesDelta') {
      sendMessage(
        transactionId,
        store,
        'tablesDelta',
        store.getMergeableTablesDelta(payload),
      );
    }
    if (message == 'getTableDelta') {
      const [tableId] = args;
      sendMessage(
        transactionId,
        store,
        'tableDelta',
        store.getMergeableTableDelta(tableId, payload),
        [tableId],
      );
    }
    if (message == 'getRowDelta') {
      const [tableId, rowId] = args;
      sendMessage(
        transactionId,
        store,
        'rowDelta',
        store.getMergeableRowDelta(tableId, rowId, payload),
        [tableId, rowId],
      );
    }
    if (message == 'getValuesDelta') {
      sendMessage(
        transactionId,
        store,
        'valuesDelta',
        store.getMergeableValuesDelta(payload),
      );
    }

    if (message == 'contentDelta') {
      if (!isUndefined(payload)) {
        const [_time, [tablesHash, valuesHash]] = payload;
        if (!isUndefined(tablesHash)) {
          sendMessage(
            transactionId,
            store,
            'getTablesDelta',
            store.getMergeableTablesHashes(),
          );
        }
        if (!isUndefined(valuesHash)) {
          sendMessage(
            transactionId,
            store,
            'getValuesDelta',
            store.getMergeableValuesHashes(),
          );
        }
      }
    }
    if (message == 'tablesDelta') {
      const [_time, tablesChanges] = payload;
      objForEach(tablesChanges, (_, tableId) => {
        sendMessage(
          transactionId,
          store,
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
        sendMessage(
          transactionId,
          store,
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

  addStore(store, receiveMessage);
  addStore(otherStore, receiveMessage);

  const getPersisted = async (): Promise<undefined | 1> => {
    if (otherStore.getMergeableContent()[0] === '') {
      return undefined;
    }

    sendMessage(
      'GP',
      store,
      'getContentDelta',
      store.getMergeableContentHashes(),
    );

    return 1;
  };

  const setPersisted = async (): Promise<void> => {
    sendMessage(
      'SP',
      store,
      'contentHashes',
      store.getMergeableContentHashes(),
    );
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
