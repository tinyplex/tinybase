/// persister-react-native-mmkv
import {type MMKV} from 'react-native-mmkv';
import type {MergeableStore} from '../../mergeable-store/index.d.ts';
import type {Store} from '../../store/index.d.ts';
import type {Persister, Persists} from '../index.d.ts';

/// ReactNativeMMKVPersister
export interface ReactNativeMMKVPersister
  extends Persister<Persists.StoreOrMergeableStore> {
  /// ReactNativeMMKVPersister.getStorageName
  getStorageName(): string;
}

/// createReactNativeMMKVPersister
export function createReactNativeMMKVPersister(
  store: Store | MergeableStore,
  storage: MMKV,
  storageName?: string,
  onIgnoredError?: (error: any) => void,
): ReactNativeMMKVPersister;
