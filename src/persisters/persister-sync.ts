import {MergeableContent, MergeableStore} from '../types/mergeable-store';
import {
  SyncPersister,
  createSyncPersister as createSyncPersisterDecl,
} from '../types/persisters/persister-sync';
import {Content} from '../types/store';
import {createCustomPersister} from '../persisters';

export const createSyncPersister = ((
  store: MergeableStore,
  otherStore: MergeableStore,
  onIgnoredError?: (error: any) => void,
): SyncPersister => {
  const getPersisted = async (): Promise<Content | MergeableContent> =>
    otherStore.getContent();

  const setPersisted = async (
    getContent: () => Content | MergeableContent,
  ): Promise<void> => {
    otherStore.setMergeableContent(getContent() as MergeableContent);
  };

  const addPersisterListener = () => 0;

  const delPersisterListener = (): void => {};

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
