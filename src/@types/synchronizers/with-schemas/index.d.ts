/// synchronizers

import type {
  Content,
  OptionalSchemas,
} from '../../store/with-schemas/index.d.ts';
import type {Id, IdOrNull} from '../../common/with-schemas/index.d.ts';
import type {
  Persister,
  Persists,
} from '../../persisters/with-schemas/index.d.ts';
import type {MergeableStore} from '../../mergeable-store/with-schemas/index.d.ts';

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

/// Receive
export type Receive = (
  fromClientId: Id,
  requestId: Id,
  message: Message,
  body: any,
) => void;

/// Send
export type Send = (
  toClientId: IdOrNull,
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
export interface Synchronizer<Schemas extends OptionalSchemas>
  extends Persister<Schemas, Persists.MergeableStoreOnly> {
  /// Synchronizer.startSync
  startSync(initialContent?: Content<Schemas, true>): Promise<this>;
  /// Synchronizer.stopSync
  stopSync(): this;
  /// Synchronizer.getSynchronizerStats
  getSynchronizerStats(): SynchronizerStats;
}

/// createCustomSynchronizer
export function createCustomSynchronizer<Schemas extends OptionalSchemas>(
  store: MergeableStore<Schemas>,
  send: Send,
  onReceive: (receive: Receive) => void,
  destroy: () => void,
  requestTimeoutSeconds: number,
  onIgnoredError?: (error: any) => void,
): Synchronizer<Schemas>;
