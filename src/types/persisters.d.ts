/// persisters

import {ChangedCells, ChangedValues, Store, Tables, Values} from './store.d';

/// PersisterStats
export type PersisterStats = {
  /// PersisterStats.loads
  loads?: number;
  /// PersisterStats.saves
  saves?: number;
};

/// PersisterListener
export type PersisterListener = (content?: [Tables, Values]) => void;

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

/// createCustomPersister
export function createCustomPersister<ListeningHandle>(
  store: Store,
  getPersisted: () => Promise<[Tables, Values] | undefined>,
  setPersisted: (
    getContent: () => [Tables, Values],
    changedCells?: ChangedCells,
    changedValues?: ChangedValues,
  ) => Promise<void>,
  addPersisterListener: (listener: PersisterListener) => ListeningHandle,
  delPersisterListener: (listeningHandle: ListeningHandle) => void,
): Persister;
