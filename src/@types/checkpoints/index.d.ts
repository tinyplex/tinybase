/// checkpoints

import type {Id, IdOrNull, Ids} from '../common';
import type {Store} from '../store';

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
export interface Checkpoints {
  //
  /// Checkpoints.setSize
  setSize(size: number): Checkpoints;

  /// Checkpoints.addCheckpoint
  addCheckpoint(label?: string): Id;

  /// Checkpoints.setCheckpoint
  setCheckpoint(checkpointId: Id, label: string): Checkpoints;

  /// Checkpoints.getStore
  getStore(): Store;

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
  delListener(listenerId: Id): Checkpoints;

  /// Checkpoints.goBackward
  goBackward(): Checkpoints;

  /// Checkpoints.goForward
  goForward(): Checkpoints;

  /// Checkpoints.goTo
  goTo(checkpointId: Id): Checkpoints;

  /// Checkpoints.clear
  clear(): Checkpoints;

  /// Checkpoints.clearForward
  clearForward(): Checkpoints;

  /// Checkpoints.destroy
  destroy(): void;

  /// Checkpoints.getListenerStats
  getListenerStats(): CheckpointsListenerStats;
  //
}

/// createCheckpoints
export function createCheckpoints(store: Store): Checkpoints;
