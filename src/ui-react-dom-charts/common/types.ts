import type {RefObject} from 'react';

export type Kind = 'bar' | 'line';
export type ScaledPoint = readonly [...DataPoint, x: number, y: number];
export type Bounds = readonly [
  xMin?: XValue,
  xMax?: XValue,
  yMin?: number,
  yMax?: number,
];
export type Style = readonly [
  tickSize: number,
  tickGap: number,
  barGap: number,
  xAxisHeight: number,
  yAxisWidth: number,
  inset: number,
  fontSize: number,
];
export type Size = readonly [width: number, height: number];
export type Ticks = number[];

export type RefAndLayout = readonly [
  svgRef: RefObject<SVGSVGElement | null>,
  size: Size,
  style: Style,
];

export type PlotFrame = readonly [
  x: number,
  y: number,
  width: number,
  height: number,
];

export type SetTooltipPoint = (point: ScaledPoint | undefined) => void;

export type XValue = number | string;
export type DataPoint = readonly [
  rowId: string,
  xValue: XValue,
  yValue: number,
];
