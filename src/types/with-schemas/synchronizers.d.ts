/// synchronizers

import {Id, IdOrNull} from './common';
import {OptionalSchemas, Tables, Values} from './store';
import {MergeableStore} from './mergeable-store';
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

/// Synchronizer
export interface Synchronizer<Schemas extends OptionalSchemas>
  extends Persister<Schemas, true> {
  /// Synchronizer.startSync
  startSync(
    initialTables?: Tables<Schemas[0], true>,
    initialValues?: Values<Schemas[1], true>,
  ): Promise<this>;
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
  requestTimeoutSeconds?: number,
  onIgnoredError?: (error: any) => void,
): Synchronizer<Schemas>;
