/// persister-file

import {Id, IdOrNull, Ids} from '../common';
import {MergeableStore} from '../mergeable-store';
import {Persister} from '../persisters';

/// Receive
export type Receive = (
  requestId: IdOrNull,
  fromStoreId: Id,
  message: string,
  payload: any,
  args?: Ids,
) => void;

/// Send
export type Send = (
  requestId: IdOrNull,
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
export interface SyncPersister extends Persister<true> {
  /// SyncPersister.getBus
  getBus(): Bus;
}

/// createSyncPersister
export function createSyncPersister(
  store: MergeableStore,
  bus: Bus,
  onIgnoredError?: (error: any) => void,
): SyncPersister;

/// createLocalBus
export function createLocalBus(): Bus;
