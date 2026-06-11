import type {
  YAxis as YAxisDecl,
  YAxisProps,
} from '../@types/ui-react-dom-charts/index.d.ts';
import {CHART_Y_AXIS} from './common/context.ts';

export const YAxis = (() => null) as typeof YAxisDecl & {
  [CHART_Y_AXIS]?: true;
};

YAxis[CHART_Y_AXIS] = true;

export type {YAxisProps};
