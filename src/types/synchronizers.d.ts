/// synchronizers

import {Id, IdOrNull} from './common';
import {MergeableStore} from './mergeable-store';
import {Persister} from './persisters';

/// MessageType
export type MessageType = number;

/// Receive
export type Receive = (
  fromClientId: Id,
  requestId: IdOrNull,
  messageType: MessageType,
  messageBody: any,
) => void;

/// Send
export type Send = (
  toClientId: IdOrNull,
  requestId: IdOrNull,
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
export interface Synchronizer extends Persister<true> {
  /// Synchronizer.startSync
  startSync(): Promise<Synchronizer>;
  /// Synchronizer.stopSync
  stopSync(): Synchronizer;
  /// Synchronizer.getSynchronizerStats
  getSynchronizerStats(): SynchronizerStats;
}

/// createCustomSynchronizer
export function createCustomSynchronizer(
  store: MergeableStore,
  client: Client,
  requestTimeoutSeconds?: number,
  onIgnoredError?: (error: any) => void,
): Synchronizer;
