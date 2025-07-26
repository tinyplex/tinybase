/// persister-react-native-mmkv
import type {MMKV} from 'react-native-mmkv';
import type {MergeableStore} from '../../../mergeable-store/with-schemas/index.d.ts';
import type {
  OptionalSchemas,
  Store,
} from '../../../store/with-schemas/index.d.ts';
import type {Persister, Persists} from '../../with-schemas/index.d.ts';

/// ReactNativeMmkvPersister
export interface ReactNativeMmkvPersister<Schemas extends OptionalSchemas>
  extends Persister<Schemas, Persists.StoreOrMergeableStore> {
  /// ReactNativeMmkvPersister.getStorageName
  getStorageName(): string;
}

/// createReactNativeMmkvPersister
export function createReactNativeMmkvPersister<Schemas extends OptionalSchemas>(
  store: Store<Schemas> | MergeableStore<Schemas>,
  storage: MMKV,
  storageName?: string,
  onIgnoredError?: (error: any) => void,
): ReactNativeMmkvPersister<Schemas>;
