/// persister-file

import {Id, IdOrNull} from '../common';
import {MergeableStore} from '../mergeable-store';
import {OptionalSchemas} from '../store';
import {Persister} from '../persisters';

/// MessageType
export type MessageType = number;

/// Receive
export type Receive = (
  requestId: Id,
  fromStoreId: Id,
  messageType: MessageType,
  ...parts: any[]
) => void;

/// Send
export type Send = (
  requestId: Id,
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
export interface SyncPersister<Schemas extends OptionalSchemas>
  extends Persister<Schemas, true> {
  /// SyncPersister.getClient
  getClient(): Client;
  /// SyncPersister.startSync
  startSync(): Promise<Persister<Schemas, true>>;
  /// SyncPersister.stopSync
  stopSync(): Persister<Schemas, true>;
}

/// createSyncPersister
export function createSyncPersister<Schemas extends OptionalSchemas>(
  store: MergeableStore<Schemas>,
  client: Client,
  requestTimeoutSeconds?: number,
  onIgnoredError?: (error: any) => void,
): SyncPersister<Schemas>;

/// createLocalClient
export function createLocalClient(): Client;
