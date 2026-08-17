/// persister-supabase
import type {SupabaseClient} from '@supabase/supabase-js';
import type {MergeableStore} from '../../../mergeable-store/with-schemas/index.d.ts';
import type {
  OptionalSchemas,
  Store,
} from '../../../store/with-schemas/index.d.ts';
import type {DpcJson, Persister, Persists} from '../../with-schemas/index.d.ts';

/// SupabasePersister
export interface SupabasePersister<
  Schemas extends OptionalSchemas,
> extends Persister<Schemas, Persists.StoreOrMergeableStore> {
  /// SupabasePersister.getSupabase
  getSupabase(): SupabaseClient;
}

/// createSupabasePersister
export function createSupabasePersister<Schemas extends OptionalSchemas>(
  store: Store<Schemas> | MergeableStore<Schemas>,
  supabase: SupabaseClient,
  configOrStoreTableName?: DpcJson | string,
  onIgnoredError?: (error: any) => void,
): SupabasePersister<Schemas>;
