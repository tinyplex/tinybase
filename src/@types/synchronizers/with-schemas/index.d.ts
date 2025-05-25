/// synchronizers
import type {Id, IdOrNull} from '../../common/with-schemas/index.d.ts';
import type {MergeableStore} from '../../mergeables/mergeable-store/with-schemas/index.d.ts';
import type {
  Content,
  OptionalSchemas,
} from '../../store/with-schemas/index.d.ts';

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
  requestId: Id,
  message: Message,
  body: any,
) => void;

/// Receive
export type Receive = (
  fromClientId: Id,
  requestId: Id,
  message: Message,
  body: any,
) => void;

/// SynchronizerStats
export type SynchronizerStats = {
  sends: number;
  receives: number;
};

/// Synchronizer
export interface Synchronizer<Schemas extends OptionalSchemas> {
  /// Synchronizer.startSync
  startSync(initialContent?: Content<Schemas, true>): Promise<this>;
  /// Synchronizer.stopSync
  stopSync(): Promise<this>;
  /// Synchronizer.destroy
  destroy(): Promise<this>;
  /// Synchronizer.getSynchronizerStats
  getSynchronizerStats(): SynchronizerStats;
}

/// createCustomSynchronizer
export function createCustomSynchronizer<Schemas extends OptionalSchemas>(
  store: MergeableStore<Schemas>,
  send: Send,
  registerReceive: (receive: Receive) => void,
  destroy: () => void,
  requestTimeoutSeconds: number,
  onSend?: Send,
  onReceive?: Receive,
  onIgnoredError?: (error: any) => void,
): Synchronizer<Schemas>;
