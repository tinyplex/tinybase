import type {RefObject} from 'react';
import type {ChartScaledPoint, ChartSize, ChartStyle} from './data.ts';

export type ChartLayout = readonly [
  svgRef: RefObject<SVGSVGElement | null>,
  chartSize: ChartSize,
  chartStyle: ChartStyle,
];

export type PlotFrame = readonly [
  x: number,
  y: number,
  width: number,
  height: number,
];

export type SetTooltipPoint = (
  point: ChartScaledPoint | undefined,
) => void;
