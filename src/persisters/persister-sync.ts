import {MergeableContent, MergeableStore} from '../types/mergeable-store';
import {
  SyncPersister,
  createSyncPersister as createSyncPersisterDecl,
} from '../types/persisters/persister-sync';
import {Content} from '../types/store';
import {PersisterListener} from '../types/persisters';
import {createCustomPersister} from '../persisters';

export const createSyncPersister = ((
  store: MergeableStore,
  otherStore: MergeableStore,
  onIgnoredError?: (error: any) => void,
): SyncPersister => {
  const getPersisted = async (): Promise<MergeableContent> => {
    const persisted = otherStore.getMergeableContent();
    if (persisted[0] !== '') {
      return persisted;
    }
    return null as any;
  };

  const setPersisted = async (
    getContent: () => Content | MergeableContent,
  ): Promise<void> => {
    otherStore.setMergeableContent(getContent() as MergeableContent);
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
