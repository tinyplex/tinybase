import type {ResultCellOrUndefined} from '../../@types/queries/index.d.ts';
import type {CellOrUndefined} from '../../@types/store/index.d.ts';
import {
  arrayFilter,
  arrayForEach,
  arrayIsEmpty,
  arrayMap,
} from '../../common/array.ts';
import {collSize} from '../../common/coll.ts';
import {
  isFiniteNumber,
  isInteger,
  isNumber,
  isString,
  isUndefined,
  infinity,
  mathMax,
  mathMin,
  mathRound,
  size,
} from '../../common/other.ts';
import {getTicks} from './wilkinson.ts';

export type ChartKind = 'bar' | 'line';
export type ChartScaledPoint = readonly [
  ...ChartDataPoint,
  x: number,
  y: number,
];
export type ChartBounds = readonly [
  xMin?: ChartXValue,
  xMax?: ChartXValue,
  yMin?: number,
  yMax?: number,
];
export type ChartStyle = readonly [
  tickSize: number,
  tickGap: number,
  barWidth: number,
  xAxisHeight: number,
  yAxisWidth: number,
  inset: number,
  fontSize: number,
];
export type ChartSize = readonly [width: number, height: number];
export type ChartTicks = number[];

type Domain = readonly [min: number, max: number];
type ChartXValue = number | string;
type ChartDataPoint = readonly [
  rowId: string,
  xValue: ChartXValue,
  yValue: number,
];
const TARGET_TICKS = 10;

export const getChartDataPoints = (
  rowIds: string[],
  getPoint: (rowId: string) => ChartDataPoint | undefined,
) =>
  arrayFilter(
    arrayMap(rowIds, getPoint),
    (point): point is ChartDataPoint => !isUndefined(point),
  ) as ChartDataPoint[];

export const getChartDataPoint = (
  rowId: string,
  xCell: CellOrUndefined | ResultCellOrUndefined,
  yCell: CellOrUndefined | ResultCellOrUndefined,
): ChartDataPoint | undefined => {
  const xValue = getChartXValue(xCell);
  const yValue = getChartYValue(yCell);

  return isUndefined(xValue) || isUndefined(yValue)
    ? undefined
    : [rowId, xValue, yValue];
};

export const getChartScaledPoints = (
  kind: ChartKind,
  points: ChartDataPoint[],
  [xMin, xMax, yMin, yMax]: ChartBounds,
  [width, height]: ChartSize,
): ChartScaledPoint[] => {
  const numericX =
    kind == 'line' &&
    arrayIsEmpty(arrayFilter(points, ([, xValue]) => !isNumber(xValue)));
  const xDomain: Domain = numericX ? [xMin as number, xMax as number] : [0, 0];
  const yDomain: Domain = [yMin ?? 0, yMax ?? 0];
  const xCategories = new Map<ChartXValue, number>();

  arrayForEach(points, ([, xValue]) => {
    if (!xCategories.has(xValue)) {
      xCategories.set(xValue, collSize(xCategories));
    }
  });

  return arrayMap(points, ([rowId, xValue, yValue]) => [
    rowId,
    xValue,
    yValue,
    getChartX(xValue, numericX, xDomain, xCategories, width, kind),
    getChartY(yValue, yDomain, height),
  ]);
};

const getChartX = (
  xValue: ChartXValue,
  numericX: boolean,
  [xMin, xMax]: Domain,
  xCategories: Map<ChartXValue, number>,
  width: number,
  kind: ChartKind,
) =>
  numericX
    ? getChartScale(xValue as number, xMin, xMax, width)
    : kind == 'bar'
      ? (width * ((xCategories.get(xValue) ?? 0) + 0.5)) / collSize(xCategories)
      : getChartScale(
          xCategories.get(xValue) ?? 0,
          0,
          collSize(xCategories) - 1,
          width,
        );

const getChartY = (yValue: number, [yMin, yMax]: Domain, height: number) =>
  height - getChartScale(yValue, yMin, yMax, height);

export const getChartScale = (
  value: number,
  min: number,
  max: number,
  size: number,
) => (min == max ? size / 2 : getRounded((size * (value - min)) / (max - min)));

export const getChartBounds = (
  kind: ChartKind,
  points: ChartDataPoint[],
): ChartBounds => {
  if (arrayIsEmpty(points)) {
    return [];
  }
  const [yMin, yMax] = getYDomain(points, kind);

  if (arrayIsEmpty(arrayFilter(points, ([, xValue]) => !isNumber(xValue)))) {
    const [xMin, xMax] = getChartDomain(
      arrayMap(points, ([, xValue]) => xValue as number),
    );
    return [xMin, xMax, yMin, yMax];
  }

  return [points[0]?.[1], points[size(points) - 1]?.[1], yMin, yMax];
};

export const getChartYTicks = (
  [, , yMin, yMax]: ChartBounds,
  [, height]: ChartSize,
  labelSize: number,
): ChartTicks => {
  if (isUndefined(yMin) || isUndefined(yMax)) {
    return [];
  }
  if (yMin == yMax) {
    return [yMin];
  }

  return getTicks(
    yMin,
    yMax,
    TARGET_TICKS,
    labelSize,
    height,
    isInteger(yMin) && isInteger(yMax),
  );
};

export const getChartXTicks = (
  kind: ChartKind,
  [xMin, xMax]: ChartBounds,
  [width]: ChartSize,
  labelSize: number,
): ChartTicks =>
  kind == 'line' && isNumber(xMin) && isNumber(xMax) && xMin != xMax
    ? getTicks(
        xMin,
        xMax,
        TARGET_TICKS,
        labelSize,
        width,
        isInteger(xMin) && isInteger(xMax),
      )
    : [];

export const getChartTickBounds = (
  [xMin, xMax, yMin, yMax]: ChartBounds,
  xTicks: ChartTicks,
  yTicks: ChartTicks,
): ChartBounds =>
  [
    arrayIsEmpty(xTicks) ? xMin : mathMin(xMin as number, xTicks[0]),
    arrayIsEmpty(xTicks)
      ? xMax
      : mathMax(xMax as number, xTicks[size(xTicks) - 1]),
    arrayIsEmpty(yTicks) ? yMin : mathMin(yMin ?? infinity, yTicks[0]),
    arrayIsEmpty(yTicks)
      ? yMax
      : mathMax(yMax ?? -infinity, yTicks[size(yTicks) - 1]),
  ];

export const getYDomain = (
  points: (ChartDataPoint | ChartScaledPoint)[],
  kind: ChartKind = 'bar',
): Domain =>
  getChartDomain([
    ...(kind == 'bar' ? [0] : []),
    ...arrayMap(points, ([, , yValue]) => yValue),
  ]);

const getChartDomain = (values: number[]): Domain => {
  const min = mathMin(...values);
  return min == infinity ? [0, 0] : [min, mathMax(...values)];
};

const getRounded = (value: number) => mathRound(value * 1000000) / 1000000;

const getChartXValue = (
  cell: CellOrUndefined | ResultCellOrUndefined,
): ChartXValue | undefined =>
  isNumber(cell)
    ? isFiniteNumber(cell)
      ? cell
      : undefined
    : isString(cell)
      ? cell
      : undefined;

const getChartYValue = (
  cell: CellOrUndefined | ResultCellOrUndefined,
): number | undefined =>
  isNumber(cell) && isFiniteNumber(cell) ? cell : undefined;
