import type {
  CheckpointProps,
  CheckpointView as CheckpointViewDecl,
} from '../@types/ui-react/index.js';
import {EMPTY_STRING} from '../common/strings.ts';
import {wrap} from './common.tsx';
import {useCheckpoint} from './hooks.ts';

export const CheckpointView: typeof CheckpointViewDecl = ({
  checkpoints,
  checkpointId,
  debugIds,
}: CheckpointProps): any =>
  wrap(
    useCheckpoint(checkpointId, checkpoints) ?? EMPTY_STRING,
    undefined,
    debugIds,
    checkpointId,
  );
