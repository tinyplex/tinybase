/// persister-react-native-mmkv
import {MMKV} from 'react-native-mmkv';
import type {MergeableStore} from '../../../mergeable-store/with-schemas/index.d.ts';
import type {
  OptionalSchemas,
  Store,
} from '../../../store/with-schemas/index.d.ts';
import type {Persister, Persists} from '../../with-schemas/index.d.ts';

/// ReactNativeMMKVPersister
export interface ReactNativeMMKVPersister<Schemas extends OptionalSchemas>
  extends Persister<Schemas, Persists.StoreOrMergeableStore> {
  /// ReactNativeMMKVPersister.getStorageName
  getStorageName(): string;
}

/// createReactNativeMMKVPersister
export function createReactNativeMMKVPersister<Schemas extends OptionalSchemas>(
  store: Store<Schemas> | MergeableStore<Schemas>,
  storage: MMKV,
  storageName?: string,
  onIgnoredError?: (error: any) => void,
): ReactNativeMMKVPersister<Schemas>;
