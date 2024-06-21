/// synchronizers

import type {
  Content,
  OptionalSchemas,
} from '../../store/with-schemas/index.d.ts';
import type {Id, IdOrNull} from '../../common/with-schemas/index.d.ts';
import type {
  Persistables,
  Persister,
} from '../../persisters/with-schemas/index.d.ts';
import type {MergeableStore} from '../../mergeable-store/with-schemas/index.d.ts';

/// MessageType
export type MessageType = number;

/// Receive
export type Receive = (
  fromClientId: Id,
  requestId: Id,
  messageType: MessageType,
  messageBody: any,
) => void;

/// Send
export type Send = (
  toClientId: IdOrNull,
  requestId: Id,
  messageType: MessageType,
  messageBody: any,
) => void;

/// SynchronizerStats
export type SynchronizerStats = {
  sends: number;
  receives: number;
};

/// Synchronizer
export interface Synchronizer<Schemas extends OptionalSchemas>
  extends Persister<Schemas, Persistables.MergeableStoreOnly> {
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
