import type {BackwardCheckpointsView as BackwardCheckpointsViewDecl} from '../@types/ui-react/index.d.ts';
import {getUseCheckpointView} from './common/index.tsx';

export const BackwardCheckpointsView: typeof BackwardCheckpointsViewDecl =
  getUseCheckpointView((checkpointIds) => checkpointIds[0]);
