/// persister-file

import {Id, IdOrNull, Ids} from '../common';
import {MergeableStore} from '../mergeable-store';
import {OptionalSchemas} from '../store';
import {Persister} from '../persisters';

/// Receive
export type Receive = (
  transactionId: Id,
  fromStoreId: Id,
  message: string,
  payload: any,
  args?: Ids,
) => void;

/// Send
export type Send = (
  transactionId: Id,
  toStoreId: IdOrNull,
  message: string,
  payload: any,
  args?: Ids,
) => void;

/// Bus
export type Bus = [
  join: (storeId: Id, receive: Receive) => [send: Send, leave: () => void],
];

/// SyncPersister
export interface SyncPersister<Schemas extends OptionalSchemas>
  extends Persister<Schemas, true> {
  /// SyncPersister.getBus
  getBus(): Bus;
}

/// createSyncPersister
export function createSyncPersister<Schemas extends OptionalSchemas>(
  store: MergeableStore<Schemas>,
  bus: Bus,
  onIgnoredError?: (error: any) => void,
): SyncPersister<Schemas>;

/// createLocalBus
export function createLocalBus(): Bus;
