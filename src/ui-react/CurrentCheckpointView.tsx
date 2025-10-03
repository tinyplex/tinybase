import type {CurrentCheckpointView as CurrentCheckpointViewDecl} from '../@types/ui-react/index.d.ts';
import {isUndefined} from '../common/other.ts';
import {getUseCheckpointView} from './common/index.tsx';

export const CurrentCheckpointView: typeof CurrentCheckpointViewDecl =
  getUseCheckpointView((checkpointIds) =>
    isUndefined(checkpointIds[1]) ? [] : [checkpointIds[1]],
  );
