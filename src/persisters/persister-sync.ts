import {Id, Ids} from '../types/common';
import {IdMap, mapNew, mapSet} from '../common/map';
import {
  SyncPersister,
  createSyncPersister as createSyncPersisterDecl,
} from '../types/persisters/persister-sync';
import {collDel, collForEach} from '../common/coll';
import {MergeableStore} from '../types/mergeable-store';
import {PersisterListener} from '../types/persisters';
import {createCustomPersister} from '../persisters';
import {isUndefined} from '../common/other';
import {objForEach} from '../common/obj';

type ReceiveMessage = (
  transactionId: Id,
  fromStoreId: Id,
  message: string,
  payload: any,
  args?: Ids,
) => void;

type SendMessage = (
  transactionId: Id,
  message: string,
  payload: any,
  args?: Ids,
) => void;

const getBusFunctions = (): [
  join: (storeId: Id, receive: ReceiveMessage) => SendMessage,
  leave: (storeId: Id) => void,
] => {
  const stores: IdMap<ReceiveMessage> = mapNew();
  const join = (storeId: Id, receive: ReceiveMessage): SendMessage => {
    mapSet(stores, storeId, receive);
    return (
      transactionId: Id,
      message: string,
      payload: any,
      args?: Ids,
    ): void =>
      collForEach(stores, (receive, otherStoreId) =>
        otherStoreId != storeId
          ? receive(transactionId, storeId, message, payload, args)
          : 0,
      );
  };
  const leave = (id: Id): void => {
    collDel(stores, id);
  };
  return [join, leave];
};

export const createSyncPersister = ((
  store: MergeableStore,
  otherStore: MergeableStore,
  onIgnoredError?: (error: any) => void,
): SyncPersister => {
  const [join] = getBusFunctions();

  const storeSend = join(
    store.getId(),
    (
      transactionId: Id,
      fromStoreId: Id,
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
          storeSend(
            transactionId,
            'getTablesDelta',
            store.getMergeableTablesHashes(),
          );
        }
        if (valuesHashes != myValuesHashes) {
          storeSend(
            transactionId,
            'getValuesDelta',
            store.getMergeableValuesHashes(),
          );
        }
      }

      if (message == 'getContentDelta') {
        storeSend(
          transactionId,
          'contentDelta',
          store.getMergeableContentDelta(payload),
        );
      }
      if (message == 'getTablesDelta') {
        storeSend(
          transactionId,
          'tablesDelta',
          store.getMergeableTablesDelta(payload),
        );
      }
      if (message == 'getTableDelta') {
        const [tableId] = args;
        storeSend(
          transactionId,
          'tableDelta',
          store.getMergeableTableDelta(tableId, payload),
          [tableId],
        );
      }
      if (message == 'getRowDelta') {
        const [tableId, rowId] = args;
        storeSend(
          transactionId,
          'rowDelta',
          store.getMergeableRowDelta(tableId, rowId, payload),
          [tableId, rowId],
        );
      }
      if (message == 'getValuesDelta') {
        storeSend(
          transactionId,
          'valuesDelta',
          store.getMergeableValuesDelta(payload),
        );
      }

      if (message == 'contentDelta') {
        if (!isUndefined(payload)) {
          const [_time, [tablesHash, valuesHash]] = payload;
          if (!isUndefined(tablesHash)) {
            storeSend(
              transactionId,
              'getTablesDelta',
              store.getMergeableTablesHashes(),
            );
          }
          if (!isUndefined(valuesHash)) {
            storeSend(
              transactionId,
              'getValuesDelta',
              store.getMergeableValuesHashes(),
            );
          }
        }
      }
      if (message == 'tablesDelta') {
        const [_time, tablesChanges] = payload;
        objForEach(tablesChanges, (_, tableId) => {
          storeSend(
            transactionId,
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
          storeSend(
            transactionId,
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

  const otherStoreSend = join(
    otherStore.getId(),
    (
      transactionId: Id,
      fromStoreId: Id,
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
          otherStore.getMergeableContentHashes();
        if (tablesHashes != myTablesHashes) {
          otherStoreSend(
            transactionId,
            'getTablesDelta',
            otherStore.getMergeableTablesHashes(),
          );
        }
        if (valuesHashes != myValuesHashes) {
          otherStoreSend(
            transactionId,
            'getValuesDelta',
            otherStore.getMergeableValuesHashes(),
          );
        }
      }

      if (message == 'getContentDelta') {
        otherStoreSend(
          transactionId,
          'contentDelta',
          otherStore.getMergeableContentDelta(payload),
        );
      }
      if (message == 'getTablesDelta') {
        otherStoreSend(
          transactionId,
          'tablesDelta',
          otherStore.getMergeableTablesDelta(payload),
        );
      }
      if (message == 'getTableDelta') {
        const [tableId] = args;
        otherStoreSend(
          transactionId,
          'tableDelta',
          otherStore.getMergeableTableDelta(tableId, payload),
          [tableId],
        );
      }
      if (message == 'getRowDelta') {
        const [tableId, rowId] = args;
        otherStoreSend(
          transactionId,
          'rowDelta',
          otherStore.getMergeableRowDelta(tableId, rowId, payload),
          [tableId, rowId],
        );
      }
      if (message == 'getValuesDelta') {
        otherStoreSend(
          transactionId,
          'valuesDelta',
          otherStore.getMergeableValuesDelta(payload),
        );
      }

      if (message == 'contentDelta') {
        if (!isUndefined(payload)) {
          const [_time, [tablesHash, valuesHash]] = payload;
          if (!isUndefined(tablesHash)) {
            otherStoreSend(
              transactionId,
              'getTablesDelta',
              otherStore.getMergeableTablesHashes(),
            );
          }
          if (!isUndefined(valuesHash)) {
            otherStoreSend(
              transactionId,
              'getValuesDelta',
              otherStore.getMergeableValuesHashes(),
            );
          }
        }
      }
      if (message == 'tablesDelta') {
        const [_time, tablesChanges] = payload;
        objForEach(tablesChanges, (_, tableId) => {
          otherStoreSend(
            transactionId,
            'getTableDelta',
            otherStore.getMergeableTableHashes(tableId),
            [tableId],
          );
        });
      }
      if (message == 'tableDelta') {
        const [tableId] = args;
        const [_time, tableChanges] = payload;
        objForEach(tableChanges, (_, rowId) => {
          otherStoreSend(
            transactionId,
            'getRowDelta',
            otherStore.getMergeableRowHashes(tableId, rowId),
            [tableId, rowId],
          );
        });
      }
      if (message == 'rowDelta') {
        const [tableId, rowId] = args;
        const [time, rowChanges] = payload;
        otherStore.applyMergeableChanges([
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
        otherStore.applyMergeableChanges([
          time,
          [['', {}], [time, valuesChanges], 1],
        ]);
      }
    },
  );

  const getPersisted = async (): Promise<undefined | 1> => {
    if (otherStore.getMergeableContent()[0] === '') {
      return undefined;
    }

    storeSend('GP', 'getContentDelta', store.getMergeableContentHashes());

    return 1;
  };

  const setPersisted = async (): Promise<void> => {
    storeSend('SP', 'contentHashes', store.getMergeableContentHashes());
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
