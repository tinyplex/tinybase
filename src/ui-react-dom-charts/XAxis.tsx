import type {
  XAxis as XAxisDecl,
  XAxisProps,
} from '../@types/ui-react-dom-charts/index.d.ts';
import {CHART_X_AXIS} from './common/context.ts';

export const XAxis = (() => null) as typeof XAxisDecl & {
  [CHART_X_AXIS]?: true;
};

XAxis[CHART_X_AXIS] = true;

export type {XAxisProps};
