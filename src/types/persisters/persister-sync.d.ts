/// persister-file

import {Id, IdOrNull} from '../common';
import {MergeableStore} from '../mergeable-store';
import {Persister} from '../persisters';

/// MessageType
export type MessageType = number;

/// Receive
export type Receive = (
  requestId: IdOrNull,
  fromStoreId: Id,
  messageType: MessageType,
  ...parts: any[]
) => void;

/// Send
export type Send = (
  requestId: IdOrNull,
  toStoreId: IdOrNull,
  messageType: MessageType,
  ...parts: any[]
) => void;

/// BusStats
export type BusStats = {sends?: number; receives?: number};

/// Bus
export type Bus = [
  join: (storeId: Id, receive: Receive) => [send: Send, leave: () => void],
  getStats: () => BusStats,
];

/// SyncPersister
export interface SyncPersister extends Persister<true> {
  /// SyncPersister.getBus
  getBus(): Bus;
  /// SyncPersister.startSync
  startSync(): Promise<Persister<true>>;
  /// SyncPersister.stopSync
  stopSync(): Persister<true>;
}

/// createSyncPersister
export function createSyncPersister(
  store: MergeableStore,
  bus: Bus,
  requestTimeoutSeconds?: number,
  onIgnoredError?: (error: any) => void,
): SyncPersister;

/// createLocalBus
export function createLocalBus(): Bus;
