/// synchronizers

import {Id, IdOrNull} from './common';
import {Content} from './store';
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

/// Synchronizer
export interface Synchronizer extends Persister<true> {
  /// Synchronizer.startSync
  startSync(initialContent?: Content): Promise<this>;
  /// Synchronizer.stopSync
  stopSync(): this;
  /// Synchronizer.getSynchronizerStats
  getSynchronizerStats(): SynchronizerStats;
}

/// createCustomSynchronizer
export function createCustomSynchronizer(
  store: MergeableStore,
  send: Send,
  onReceive: (receive: Receive) => void,
  destroy: () => void,
  requestTimeoutSeconds: number,
  onIgnoredError?: (error: any) => void,
): Synchronizer;
