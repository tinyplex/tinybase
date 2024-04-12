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

/// ClientStats
export type ClientStats = {sends?: number; receives?: number};

/// Client
export type Client = {
  connect: (
    storeId: Id,
    receive: Receive,
  ) => [send: Send, disconnect: () => void];
  getStats: () => ClientStats;
};

/// SyncPersister
export interface SyncPersister extends Persister<true> {
  /// SyncPersister.getClient
  getClient(): Client;
  /// SyncPersister.startSync
  startSync(): Promise<Persister<true>>;
  /// SyncPersister.stopSync
  stopSync(): Persister<true>;
}

/// createSyncPersister
export function createSyncPersister(
  store: MergeableStore,
  client: Client,
  requestTimeoutSeconds?: number,
  onIgnoredError?: (error: any) => void,
): SyncPersister;

/// createLocalClient
export function createLocalClient(): Client;
