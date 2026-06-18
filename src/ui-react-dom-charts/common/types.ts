import type {RefObject} from 'react';
import type {Id} from '../../@types/common/index.d.ts';
import {
  BAR,
  CATEGORY,
  LINE,
  LINEAR,
  MILLISECOND,
  SECOND_UNIT,
  TIME,
} from './strings.ts';

export type Kind = typeof BAR | typeof LINE;
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
export type XScale = typeof CATEGORY | typeof LINEAR | typeof TIME;
export type TimestampUnit = typeof MILLISECOND | typeof SECOND_UNIT;
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
