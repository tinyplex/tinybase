/// persister-file

import {Id, IdOrNull} from '../common';
import {WebSocket, WebSocketServer} from 'ws';
import {MergeableStore} from '../mergeable-store';
import {OptionalSchemas} from '../store';
import {Persister} from '../persisters';

/// MessageType
export type MessageType = number;

/// Receive
export type Receive = (
  requestId: Id,
  fromClientId: Id,
  messageType: MessageType,
  messageBody: any,
) => void;

/// Send
export type Send = (
  requestId: Id,
  toClientId: IdOrNull,
  messageType: MessageType,
  messageBody: any,
) => void;

/// ClientStats
export type ClientStats = {sends?: number; receives?: number};

/// Client
export type Client = {
  send: Send;
  onReceive: (receive: Receive) => void;
  destroy: () => void;
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
