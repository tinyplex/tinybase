/// synchronizer-broadcast-channel
import type {MergeableStore} from '../../mergeable-store/index.d.ts';
import type {Receive, Send, Synchronizer} from '../index.d.ts';

/// BroadcastChannelSynchronizer
export interface BroadcastChannelSynchronizer extends Synchronizer {
  /// BroadcastChannelSynchronizer.getChannelName
  getChannelName(): string;
}

/// createBroadcastChannelSynchronizer
export function createBroadcastChannelSynchronizer(
  store: MergeableStore,
  channelName: string,
  onSend?: Send,
  onReceive?: Receive,
  onIgnoredError?: (error: any) => void,
): BroadcastChannelSynchronizer;
