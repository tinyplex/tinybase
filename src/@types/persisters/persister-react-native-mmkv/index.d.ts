/// persister-react-native-mmkv
import {type MMKV} from 'react-native-mmkv';
import type {MergeableStore} from '../../mergeable-store/index.d.ts';
import type {Store} from '../../store/index.d.ts';
import type {Persister, Persists} from '../index.d.ts';

/// ReactNativeMmkvPersister
export interface ReactNativeMmkvPersister
  extends Persister<Persists.StoreOrMergeableStore> {
  /// ReactNativeMmkvPersister.getStorageName
  getStorageName(): string;
}

/// createReactNativeMmkvPersister
export function createReactNativeMmkvPersister(
  store: Store | MergeableStore,
  storage: MMKV,
  storageName?: string,
  onIgnoredError?: (error: any) => void,
): ReactNativeMmkvPersister;
