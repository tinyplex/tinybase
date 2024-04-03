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
import {MergeableStore} from '../types/mergeable-store';
import {PersisterListener} from '../types/persisters';
import {createCustomPersister} from '../persisters';
import {isUndefined} from '../common/other';
import {objForEach} from '../common/obj';

export const createSyncPersister = ((
  store: MergeableStore,
  bus: Bus,
  onIgnoredError?: (error: any) => void,
): SyncPersister => {
  const [join] = bus;

  const send = join(
    store.getId(),
    (
      transactionId: Id,
      fromStoreId: Id,
      message: string,
      payload: any,
      args: Ids = [],
    ) => {
      // console.log(
      //   transactionId,
      //   fromStoreId,
      //   '->',
      //   store.getId(),
      //   'received',
      //   message,
      //   args,
      // );
      // console.log(JSON.stringify(payload));
      // console.log();

      if (message == 'contentHashes') {
        const [_contentHash, [tablesHashes, valuesHashes]] = payload;
        const [_myContentHash, [myTablesHashes, myValuesHashes]] =
          store.getMergeableContentHashes();
        if (tablesHashes != myTablesHashes) {
          send(
            transactionId,
            fromStoreId,
            'getTablesDelta',
            store.getMergeableTablesHashes(),
          );
        }
        if (valuesHashes != myValuesHashes) {
          send(
            transactionId,
            fromStoreId,
            'getValuesDelta',
            store.getMergeableValuesHashes(),
          );
        }
      }

      if (message == 'getContentDelta') {
        send(
          transactionId,
          fromStoreId,
          'contentDelta',
          store.getMergeableContentDelta(payload),
        );
      }
      if (message == 'getTablesDelta') {
        send(
          transactionId,
          fromStoreId,
          'tablesDelta',
          store.getMergeableTablesDelta(payload),
        );
      }
      if (message == 'getTableDelta') {
        const [tableId] = args;
        send(
          transactionId,
          fromStoreId,
          'tableDelta',
          store.getMergeableTableDelta(tableId, payload),
          [tableId],
        );
      }
      if (message == 'getRowDelta') {
        const [tableId, rowId] = args;
        send(
          transactionId,
          fromStoreId,
          'rowDelta',
          store.getMergeableRowDelta(tableId, rowId, payload),
          [tableId, rowId],
        );
      }
      if (message == 'getValuesDelta') {
        send(
          transactionId,
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
              transactionId,
              fromStoreId,
              'getTablesDelta',
              store.getMergeableTablesHashes(),
            );
          }
          if (!isUndefined(valuesHash)) {
            send(
              transactionId,
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
            transactionId,
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
            transactionId,
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

  const getPersisted = async (): Promise<undefined | 1> => {
    send('GP', null, 'getContentDelta', store.getMergeableContentHashes());
    return 1;
  };

  const setPersisted = async (): Promise<void> => {
    send('SP', null, 'contentHashes', store.getMergeableContentHashes());
  };

  const addPersisterListener = (_listener: PersisterListener) => {
    //
  };

  const delPersisterListener = () => {
    //
  };

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
    true,
    ['getBus', bus],
  ) as SyncPersister;
}) as typeof createSyncPersisterDecl;

export const createLocalBus = (() => {
  const stores: IdMap<Receive> = mapNew();
  const join = (storeId: Id, receive: Receive): Send => {
    mapSet(stores, storeId, receive);
    return (
      transactionId: Id,
      toStoreId: IdOrNull,
      message: string,
      payload: any,
      args?: Ids,
    ): void =>
      isUndefined(toStoreId)
        ? collForEach(stores, (receive, otherStoreId) =>
            otherStoreId != storeId
              ? receive(transactionId, storeId, message, payload, args)
              : 0,
          )
        : mapGet(stores, toStoreId)?.(
            transactionId,
            storeId,
            message,
            payload,
            args,
          );
  };
  const leave = (id: Id): void => {
    collDel(stores, id);
  };
  return [join, leave];
}) as typeof createLocalBusDecl;
