import type {MMKV} from 'react-native-mmkv';
import type {MergeableStore} from '../../@types/mergeable-store/index.d.ts';
import type {
  PersistedContent,
  Persister,
  PersisterListener,
  Persists as PersistsType,
} from '../../@types/persisters/index.d.ts';
import type {Store} from '../../@types/store/index.d.ts';
import {tryCatch, tryReturn} from '../../common/error.ts';
import {
  jsonParseWithUndefined,
  jsonStringWithUndefined,
} from '../../common/json.ts';
import {isUndefined} from '../../common/other.ts';
import {STORAGE} from '../../common/strings.ts';
import {createCustomPersister} from '../common/create.ts';

interface Listener {
  remove: () => void;
}

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
    const value = isUndefined(data) ? undefined : jsonParseWithUndefined(data);

    return value;
  };

  const setPersisted = async (
    getContent: () => PersistedContent<PersistsType.StoreOrMergeableStore>,
  ): Promise<void> => {
    const content = getContent();

    if (!isUndefined(content)) {
      storage.set(storageName, jsonStringWithUndefined(content));
    }
  };

  const addPersisterListener = (
    listener: PersisterListener<PersistsType.StoreOrMergeableStore>,
  ): Listener =>
    storage.addOnValueChangedListener((key) => {
      if (key === storageName) {
        void tryCatch(
          async () => {
            const value = storage.getString(storageName);
            if (!isUndefined(value)) {
              await listener(jsonParseWithUndefined(value));
            }
          },
          (error) => tryReturn(() => onIgnoredError?.(error)),
        );
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
