import type {RefObject} from 'react';
import type {Id} from '../../@types/common/index.d.ts';

export const CURRENT_COLOR = 'currentColor';

export type Kind = 'bar' | 'line';
export type ScaledPoint = readonly [
  ...DataPoint,
  x: number,
  y: number,
  xTitle?: string,
  yTitle?: string,
];
export type Bounds = readonly [
  xMin?: XValue,
  xMax?: XValue,
  yMin?: number,
  yMax?: number,
];
export type Domain = readonly [min: number, max: number];
export type SeriesSummary = {
  readonly continuousX: boolean;
  readonly xCellId?: Id;
  readonly xMin?: XValue;
  readonly xMax?: XValue;
  readonly yMin?: number;
  readonly yMax?: number;
  readonly yCellId?: Id;
  readonly yLabel?: string;
  readonly xValues: XValue[];
};
export type DomainState = {
  readonly bounds: Bounds;
  readonly continuousX: boolean;
  readonly xValues: XValue[];
};
export type XScale = 'category' | 'linear' | 'time';
export type TimestampUnit = 'millisecond' | 'second';
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

export type XValue = boolean | number | string;
export type DataPoint = readonly [
  rowId: string,
  xValue: XValue,
  yValue: number,
];
