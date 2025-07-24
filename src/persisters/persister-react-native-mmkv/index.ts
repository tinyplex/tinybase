import {MMKV} from 'react-native-mmkv';
import type {Listener} from 'react-native-mmkv/lib/typescript/src/Types.d.ts';
import type {MergeableStore} from '../../@types/mergeable-store/index.js';
import type {
  PersistedContent,
  Persister,
  PersisterListener,
  Persists as PersistsType,
} from '../../@types/persisters/index.d.ts';
import type {Store} from '../../@types/store/index.js';
import {createCustomPersister} from '../common/create.ts';

const STORAGE = 'storage';

export const createReactNativeMMKVPersister = (
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

    await Promise.resolve();
  };

  const addPersisterListener = (
    listener: PersisterListener<PersistsType.StoreOrMergeableStore>,
  ): Listener => {
    const mmkvListener = storage.addOnValueChangedListener((key) => {
      if (key === storageName) {
        const value = storage.getString(storageName);

        if (value) {
          listener(JSON.parse(value));
        }
      }
    });

    return mmkvListener;
  };

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
