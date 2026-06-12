import type {
  XAxis as XAxisDecl,
  XAxisProps,
} from '../@types/ui-react-dom-charts/index.d.ts';
import {X_AXIS} from './common/context.ts';

export const XAxis = (() => null) as typeof XAxisDecl & {
  [X_AXIS]?: true;
};

XAxis[X_AXIS] = true;

export type {XAxisProps};
