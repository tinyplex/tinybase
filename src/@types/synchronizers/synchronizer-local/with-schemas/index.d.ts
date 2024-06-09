/// synchronizer-local

import type {MergeableStore} from '../../../mergeable-store/with-schemas/index.d.ts';
import type {OptionalSchemas} from '../../../store/with-schemas/index.d.ts';
import type {Synchronizer} from '../../with-schemas/index.d.ts';

/// LocalSynchronizer
export interface LocalSynchronizer<Schemas extends OptionalSchemas>
  extends Synchronizer<Schemas> {}

/// createLocalSynchronizer
export function createLocalSynchronizer<Schemas extends OptionalSchemas>(
  store: MergeableStore<Schemas>,
  onIgnoredError?: (error: any) => void,
): LocalSynchronizer<Schemas>;
