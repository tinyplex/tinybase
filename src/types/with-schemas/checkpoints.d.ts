/// checkpoints

import {Id, IdOrNull, Ids} from './common.d';
import {NoSchemas, OptionalSchemas, Store} from './store.d';

/// CheckpointIds
export type CheckpointIds = [Ids, Id | undefined, Ids];

/// CheckpointCallback
export type CheckpointCallback = (checkpointId: Id, label?: string) => void;

/// CheckpointIdsListener
export type CheckpointIdsListener = (checkpoints: Checkpoints) => void;

/// CheckpointListener
export type CheckpointListener = (
  checkpoints: Checkpoints,
  checkpointId: Id,
) => void;

/// CheckpointsListenerStats
export type CheckpointsListenerStats = {
  /// CheckpointsListenerStats.checkpointIds
  checkpointIds?: number;
  /// CheckpointsListenerStats.checkpoint
  checkpoint?: number;
};

/// Checkpoints
export interface Checkpoints<
  in out Schemas extends OptionalSchemas = NoSchemas,
> {
  /// Checkpoints.setSize
  setSize(size: number): Checkpoints<Schemas>;

  /// Checkpoints.addCheckpoint
  addCheckpoint(label?: string): Id;

  /// Checkpoints.setCheckpoint
  setCheckpoint(checkpointId: Id, label: string): Checkpoints<Schemas>;

  /// Checkpoints.getStore
  getStore(): Store<Schemas>;

  /// Checkpoints.getCheckpointIds
  getCheckpointIds(): CheckpointIds;

  /// Checkpoints.forEachCheckpoint
  forEachCheckpoint(checkpointCallback: CheckpointCallback): void;

  /// Checkpoints.hasCheckpoint
  hasCheckpoint(checkpointId: Id): boolean;

  /// Checkpoints.getCheckpoint
  getCheckpoint(checkpointId: Id): string | undefined;

  /// Checkpoints.addCheckpointIdsListener
  addCheckpointIdsListener(listener: CheckpointIdsListener): Id;

  /// Checkpoints.addCheckpointListener
  addCheckpointListener(
    checkpointId: IdOrNull,
    listener: CheckpointListener,
  ): Id;

  /// Checkpoints.delListener
  delListener(listenerId: Id): Checkpoints<Schemas>;

  /// Checkpoints.goBackward
  goBackward(): Checkpoints<Schemas>;

  /// Checkpoints.goForward
  goForward(): Checkpoints<Schemas>;

  /// Checkpoints.goTo
  goTo(checkpointId: Id): Checkpoints<Schemas>;

  /// Checkpoints.clear
  clear(): Checkpoints<Schemas>;

  /// Checkpoints.destroy
  destroy(): void;

  /// Checkpoints.getListenerStats
  getListenerStats(): CheckpointsListenerStats;
}

/// createCheckpoints
export function createCheckpoints<Schemas extends OptionalSchemas>(
  store: Store<Schemas>,
): Checkpoints<Schemas>;
