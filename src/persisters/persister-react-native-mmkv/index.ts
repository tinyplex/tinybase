import type {MMKV} from 'react-native-mmkv';
import type {MergeableStore} from '../../@types/mergeable-store/index.d.ts';
import type {
  PersistedContent,
  Persister,
  PersisterListener,
  Persists as PersistsType,
} from '../../@types/persisters/index.d.ts';
import type {Store} from '../../@types/store/index.d.ts';
import {createCustomPersister} from '../common/create.ts';

interface Listener {
  remove: () => void;
}

const STORAGE = 'storage';

export const createReactNativeMmkvPersister = (
  store: Store | MergeableStore,
  storage: MMKV,
  storageName: string = STORAGE,
  onIgnoredError?: (error: any) => void,
): Persister<PersistsType.StoreOrMergeableStore> => {
  const getPersisted = async (): Promise<
    PersistedContent<PersistsType.StoreOrMergeableStore>
  > => {
    const data = storage.getString(storageName);
    const value = data === undefined ? undefined : JSON.parse(data);

    return Promise.resolve(value);
  };

  const setPersisted = async (
    getContent: () => PersistedContent<PersistsType.StoreOrMergeableStore>,
  ): Promise<void> => {
    const content = getContent();

    if (content !== undefined) {
      storage.set(storageName, JSON.stringify(content));
    }
  };

  const addPersisterListener = (
    listener: PersisterListener<PersistsType.StoreOrMergeableStore>,
  ): Listener =>
    storage.addOnValueChangedListener((key) => {
      if (key === storageName) {
        const value = storage.getString(storageName);

        if (value) {
          listener(JSON.parse(value));
        }
      }
    });

  const delPersisterListener = (storageListener: Listener): void => {
    storageListener.remove();
  };

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
    3, // StoreOrMergeableStore
    {getStorageName: () => storageName},
  );
};
