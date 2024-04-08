/// persister-file

import {Id, IdOrNull, Ids} from '../common';
import {MergeableStore} from '../mergeable-store';
import {OptionalSchemas} from '../store';
import {Persister} from '../persisters';

/// Receive
export type Receive = (
  requestId: Id,
  fromStoreId: Id,
  message: string,
  payload: any,
  args?: Ids,
) => void;

/// Send
export type Send = (
  requestId: Id,
  toStoreId: IdOrNull,
  message: string,
  payload: any,
  args?: Ids,
) => void;

/// BusStats
export type BusStats = {sends?: number; receives?: number};

/// Bus
export type Bus = [
  join: (storeId: Id, receive: Receive) => [send: Send, leave: () => void],
  getStats: () => BusStats,
];

/// SyncPersister
export interface SyncPersister<Schemas extends OptionalSchemas>
  extends Persister<Schemas, true> {
  /// SyncPersister.getBus
  getBus(): Bus;
  /// SyncPersister.startSync
  startSync(): Promise<Persister<Schemas, true>>;
  /// SyncPersister.stopSync
  stopSync(): Persister<Schemas, true>;
}

/// createSyncPersister
export function createSyncPersister<Schemas extends OptionalSchemas>(
  store: MergeableStore<Schemas>,
  bus: Bus,
  requestTimeoutSeconds?: number,
  onIgnoredError?: (error: any) => void,
): SyncPersister<Schemas>;

/// createLocalBus
export function createLocalBus(): Bus;
