import {
  MergeableChanges,
  MergeableContent,
  MergeableStore,
} from '../types/mergeable-store';
import {
  SyncPersister,
  createSyncPersister as createSyncPersisterDecl,
} from '../types/persisters/persister-sync';
import {Content} from '../types/store';
import {PersisterListener} from '../types/persisters';
import {createCustomPersister} from '../persisters';
import {objForEach} from '../common/obj';

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

  const setPersisted = async (
    getContent: () => Content | MergeableContent,
  ): Promise<void> => {
    otherStore.setMergeableContent(getContent() as MergeableContent);
  };

  const addPersisterListener = (listener: PersisterListener) =>
    otherStore.addDidFinishTransactionListener(() => {
      const contentHashes = store.getMergeableContentHashes();
      const otherContentHashes = otherStore.getMergeableContentHashes();

      if (contentHashes[0] === otherContentHashes[0]) {
        return null as any;
      }

      const changes: MergeableChanges = [
        '',
        [
          ['', {}],
          ['', {}],
        ],
      ];

      if (contentHashes[1][0] !== otherContentHashes[1][0]) {
        const tablesDelta = otherStore.getMergeableTablesDelta(
          store.getMergeableTablesHashes(),
        );
        changes[1][0][0] = '!';
        objForEach(tablesDelta[1], (_, tableId) => {
          const tableDelta = otherStore.getMergeableTableDelta(
            tableId,
            store.getMergeableTableHashes(tableId),
          );
          changes[1][0][1][tableId] = ['!', {}];
          objForEach(tableDelta[1], (_, rowId) => {
            const rowDelta = otherStore.getMergeableRowDelta(
              tableId,
              rowId,
              store.getMergeableRowHashes(tableId, rowId),
            );
            changes[1][0][1][tableId][1][rowId] = rowDelta;
          });
        });
      }

      if (contentHashes[1][1] !== otherContentHashes[1][1]) {
        const valuesDelta = otherStore.getMergeableValuesDelta(
          store.getMergeableValuesHashes(),
        );
        changes[1][1] = valuesDelta;
      }

      listener(undefined, () => changes);
    });

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
