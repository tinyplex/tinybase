/// synchronizer-broadcast-channel

import type {MergeableStore} from '../../../mergeable-store/with-schemas/index.d.ts';
import type {OptionalSchemas} from '../../../store/with-schemas/index.d.ts';
import type {Synchronizer} from '../../with-schemas/index.d.ts';

/// BroadcastChannelSynchronizer
export interface BroadcastChannelSynchronizer<Schemas extends OptionalSchemas>
  extends Synchronizer<Schemas> {
  /// BroadcastChannelSynchronizer.getChannelName
  getChannelName(): string;
}

/// createBroadcastChannelSynchronizer
export function createBroadcastChannelSynchronizer<
  Schemas extends OptionalSchemas,
>(
  store: MergeableStore<Schemas>,
  channelName: string,
  onIgnoredError?: (error: any) => void,
): BroadcastChannelSynchronizer<Schemas>;
