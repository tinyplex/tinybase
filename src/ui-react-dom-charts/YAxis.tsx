import type {
  YAxis as YAxisDecl,
  YAxisProps,
} from '../@types/ui-react-dom-charts/index.d.ts';
import {Y_AXIS} from './common/strings.ts';

export const YAxis = (() => null) as typeof YAxisDecl & {
  [Y_AXIS]?: true;
};

YAxis[Y_AXIS] = true;

export type {YAxisProps};
