/* @jsxImportSource solid-js */
import {getUseCheckpointView} from './common/index.tsx';

export const BackwardCheckpointsView =
  getUseCheckpointView((checkpointIds) => checkpointIds[0]);