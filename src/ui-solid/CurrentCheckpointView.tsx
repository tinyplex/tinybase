/* @jsxImportSource solid-js */
import {isUndefined} from '../common/other.ts';
import {getUseCheckpointView} from './common/index.tsx';

export const CurrentCheckpointView =
  getUseCheckpointView((checkpointIds) =>
    isUndefined(checkpointIds[1]) ? [] : [checkpointIds[1]],
  );