/// synchronizers

import {Id, IdOrNull} from './common';
import {MergeableStore} from './mergeable-store';
import {OptionalSchemas} from './store';
import {Persister} from './persisters';

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
  sends?: number;
  receives?: number;
};

/// Client
export interface Client {
  send: Send;
  onReceive: (receive: Receive) => void;
  destroy: () => void;
  getStats: () => SynchronizerStats;
}

/// Synchronizer
export interface Synchronizer<Schemas extends OptionalSchemas>
  extends Persister<Schemas, true> {
  /// Synchronizer.startSync
  startSync(): Promise<Synchronizer<Schemas>>;
  /// Synchronizer.stopSync
  stopSync(): Synchronizer<Schemas>;
  /// Synchronizer.getSynchronizerStats
  getSynchronizerStats(): SynchronizerStats;
}

/// createCustomSynchronizer
export function createCustomSynchronizer<Schemas extends OptionalSchemas>(
  store: MergeableStore<Schemas>,
  client: Client,
  requestTimeoutSeconds?: number,
  onIgnoredError?: (error: any) => void,
): Synchronizer<Schemas>;