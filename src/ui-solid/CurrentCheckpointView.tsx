/* @jsxImportSource solid-js */
import {isNullish} from '../common/other.ts';
import {getUseCheckpointView} from './common/index.tsx';

export const CurrentCheckpointView = getUseCheckpointView((checkpointIds) =>
  isNullish(checkpointIds[1]) ? [] : [checkpointIds[1]],
);
