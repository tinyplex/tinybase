/// persisters

import {Store, Tables, Values} from './store.d';
import {Callback} from './common.d';

/// PersisterStats
export type PersisterStats = {
  /// PersisterStats.loads
  loads?: number;
  /// PersisterStats.saves
  saves?: number;
};

/// Persister
export interface Persister {
  //
  /// Persister.load
  load(initialTables?: Tables, initialValues?: Values): Promise<Persister>;

  /// Persister.startAutoLoad
  startAutoLoad(
    initialTables?: Tables,
    initialValues?: Values,
  ): Promise<Persister>;

  /// Persister.stopAutoLoad
  stopAutoLoad(): Persister;

  /// Persister.save
  save(): Promise<Persister>;

  /// Persister.startAutoSave
  startAutoSave(): Promise<Persister>;

  /// Persister.stopAutoSave
  stopAutoSave(): Persister;

  /// Persister.getStore
  getStore(): Store;

  /// Persister.destroy
  destroy(): Persister;

  /// Persister.getStats
  getStats(): PersisterStats;
  //
}

/// createSessionPersister
export function createSessionPersister(
  store: Store,
  storageName: string,
): Persister;

/// createLocalPersister
export function createLocalPersister(
  store: Store,
  storageName: string,
): Persister;

/// createRemotePersister
export function createRemotePersister(
  store: Store,
  loadUrl: string,
  saveUrl: string,
  autoLoadIntervalSeconds: number,
): Persister;

/// createFilePersister
export function createFilePersister(store: Store, filePath: string): Persister;

/// createCustomPersister
export function createCustomPersister<ListeningHandle>(
  store: Store,
  getPersisted: () => Promise<string | null | undefined>,
  setPersisted: (getContent: () => [Tables, Values]) => Promise<void>,
  startListeningToPersisted: (didChange: Callback) => ListeningHandle,
  stopListeningToPersisted: (listeningHandle: ListeningHandle) => void,
): Persister;
