/// synchronizer-broadcast-channel
import type {MergeableStore} from '../../../mergeables/mergeable-store/with-schemas/index.d.ts';
import type {OptionalSchemas} from '../../../store/with-schemas/index.d.ts';
import type {Receive, Send, Synchronizer} from '../../with-schemas/index.d.ts';

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
  onSend?: Send,
  onReceive?: Receive,
  onIgnoredError?: (error: any) => void,
): BroadcastChannelSynchronizer<Schemas>;
