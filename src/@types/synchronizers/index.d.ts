/// synchronizers
import type {Id, IdOrNull} from '../common/index.d.ts';
import type {MergeableStore} from '../mergeables/mergeable-store/index.d.ts';
import type {Content} from '../store/index.d.ts';

/// Message
export const enum Message {
  /// Message.Response
  Response = 0,
  /// Message.GetContentHashes
  GetContentHashes = 1,
  /// Message.ContentHashes
  ContentHashes = 2,
  /// Message.ContentDiff
  ContentDiff = 3,
  /// Message.GetTableDiff
  GetTableDiff = 4,
  /// Message.GetRowDiff
  GetRowDiff = 5,
  /// Message.GetCellDiff
  GetCellDiff = 6,
  /// Message.GetValueDiff
  GetValueDiff = 7,
}

/// Send
export type Send = (
  toClientId: IdOrNull,
  requestId: IdOrNull,
  message: Message,
  body: any,
) => void;

/// Receive
export type Receive = (
  fromClientId: Id,
  requestId: IdOrNull,
  message: Message,
  body: any,
) => void;

/// SynchronizerStats
export type SynchronizerStats = {
  /// SynchronizerStats.sends
  sends: number;
  /// SynchronizerStats.receives
  receives: number;
};

/// Synchronizer
export interface Synchronizer {
  /// Synchronizer.startSync
  startSync(initialContent?: Content): Promise<this>;
  /// Synchronizer.stopSync
  stopSync(): Promise<this>;
  /// Synchronizer.destroy
  destroy(): Promise<this>;
  /// Synchronizer.getStats
  getStats(): SynchronizerStats;
}

/// createCustomSynchronizer
export function createCustomSynchronizer(
  store: MergeableStore,
  send: Send,
  registerReceive: (receive: Receive) => void,
  destroy: () => void,
  requestTimeoutSeconds: number,
  onSend?: Send,
  onReceive?: Receive,
  onIgnoredError?: (error: any) => void,
): Synchronizer;
