/// synchronizer-local

import type {MergeableStore} from '../../../mergeable-store/with-schemas';
import type {OptionalSchemas} from '../../../store/with-schemas';
import type {Synchronizer} from '../../with-schemas';

/// LocalSynchronizer
export interface LocalSynchronizer<Schemas extends OptionalSchemas>
  extends Synchronizer<Schemas> {}

/// createLocalSynchronizer
export function createLocalSynchronizer<Schemas extends OptionalSchemas>(
  store: MergeableStore<Schemas>,
  onIgnoredError?: (error: any) => void,
): LocalSynchronizer<Schemas>;
