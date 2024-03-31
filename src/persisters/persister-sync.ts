import {
  ContentDelta,
  MergeableChanges,
  MergeableContent,
  MergeableStore,
} from '../types/mergeable-store';
import {
  SyncPersister,
  createSyncPersister as createSyncPersisterDecl,
} from '../types/persisters/persister-sync';
import {PersisterListener} from '../types/persisters';
import {createCustomPersister} from '../persisters';
import {ifNotUndefined} from '../common/other';
import {objForEach} from '../common/obj';

const getFullDelta = (
  otherStore: MergeableStore,
  store: MergeableStore,
): MergeableChanges => {
  const changes: MergeableChanges = [
    '',
    [
      ['', {}],
      ['', {}],
    ],
  ];

  ifNotUndefined(
    otherStore.getMergeableContentDelta(store.getMergeableContentHashes()),
    (contentDelta: NonNullable<ContentDelta>) => {
      changes[0] = contentDelta[0];

      ifNotUndefined(contentDelta[1][0], () => {
        const tablesDelta = otherStore.getMergeableTablesDelta(
          store.getMergeableTablesHashes(),
        );
        changes[1][0][0] = tablesDelta[0];
        objForEach(tablesDelta[1], (_, tableId) => {
          const tableDelta = otherStore.getMergeableTableDelta(
            tableId,
            store.getMergeableTableHashes(tableId),
          );
          changes[1][0][1][tableId] = [tableDelta[0], {}];
          objForEach(tableDelta[1], (_, rowId) => {
            const rowDelta = otherStore.getMergeableRowDelta(
              tableId,
              rowId,
              store.getMergeableRowHashes(tableId, rowId),
            );
            changes[1][0][1][tableId][1][rowId] = rowDelta;
          });
        });
      });

      ifNotUndefined(contentDelta[1][1], () => {
        const valuesDelta = otherStore.getMergeableValuesDelta(
          store.getMergeableValuesHashes(),
        );
        changes[1][1] = valuesDelta;
      });
    },
  );

  return changes;
};

export const createSyncPersister = ((
  store: MergeableStore,
  otherStore: MergeableStore,
  onIgnoredError?: (error: any) => void,
): SyncPersister => {
  const getPersisted = async (): Promise<MergeableContent> => {
    const persisted = otherStore.getMergeableContent();
    if (persisted[0] === '') {
      return null as any;
    }
    return persisted;
  };

  const setPersisted = async (): Promise<void> => {
    otherStore.applyMergeableChanges(getFullDelta(store, otherStore));
  };

  const addPersisterListener = (listener: PersisterListener) =>
    otherStore.addDidFinishTransactionListener(() =>
      listener(undefined, () => getFullDelta(otherStore, store) as any),
    );

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
