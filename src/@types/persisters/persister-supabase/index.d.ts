/// persister-supabase
import type {SupabaseClient} from '@supabase/supabase-js';
import type {MergeableStore} from '../../mergeable-store/index.d.ts';
import type {Store} from '../../store/index.d.ts';
import type {DpcJson, Persister, Persists} from '../index.d.ts';

/// SupabasePersister
export interface SupabasePersister extends Persister<Persists.StoreOrMergeableStore> {
  /// SupabasePersister.getSupabase
  getSupabase(): SupabaseClient;
}

/// createSupabasePersister
export function createSupabasePersister(
  store: Store | MergeableStore,
  supabase: SupabaseClient,
  configOrStoreTableName?: DpcJson | string,
  onIgnoredError?: (error: any) => void,
): SupabasePersister;
