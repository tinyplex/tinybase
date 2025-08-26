import type {ForwardCheckpointsView as ForwardCheckpointsViewDecl} from '../@types/ui-react/index.js';
import {getUseCheckpointView} from './common.tsx';

export const ForwardCheckpointsView: typeof ForwardCheckpointsViewDecl =
  getUseCheckpointView((checkpointIds) => checkpointIds[2]);
