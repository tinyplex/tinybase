import type {
  CheckpointProps,
  CheckpointView as CheckpointViewDecl,
} from '../@types/ui-react/index.d.ts';
import {EMPTY_STRING} from '../common/strings.ts';
import {Wrap} from './common/Wrap.tsx';
import {useCheckpoint} from './hooks.ts';

export const CheckpointView: typeof CheckpointViewDecl = ({
  checkpoints,
  checkpointId,
  debugIds,
}: CheckpointProps): any => (
  <Wrap debugIds={debugIds} id={checkpointId}>
    {useCheckpoint(checkpointId, checkpoints) ?? EMPTY_STRING}
  </Wrap>
);
