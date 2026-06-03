import type {Id} from '../../@types/common/index.d.ts';
import type {ResultCellOrUndefined} from '../../@types/queries/index.d.ts';
import type {CellOrUndefined} from '../../@types/store/index.d.ts';
import {
  arrayFilter,
  arrayForEach,
  arrayHas,
  arrayIsEmpty,
  arrayMap,
  arrayPush,
} from '../../common/array.ts';
import {collSize} from '../../common/coll.ts';
import {
  infinity,
  isFiniteNumber,
  isInteger,
  isNumber,
  isString,
  isUndefined,
  mathMax,
  mathMin,
  mathRound,
  size,
} from '../../common/other.ts';
import type {
  Bounds,
  DataPoint,
  Domain,
  DomainState,
  Kind,
  ScaledPoint,
  SeriesSummary,
  Size,
  Ticks,
  XValue,
} from './types.ts';
import {getTicks} from './wilkinson.ts';

const TARGET_TICKS = 10;

export const getDataPoints = (
  rowIds: string[],
  getPoint: (rowId: string) => DataPoint | undefined,
) =>
  arrayFilter(
    arrayMap(rowIds, getPoint),
    (point): point is DataPoint => !isUndefined(point),
  ) as DataPoint[];

export const getDataPoint = (
  rowId: string,
  xCell: CellOrUndefined | ResultCellOrUndefined,
  yCell: CellOrUndefined | ResultCellOrUndefined,
): DataPoint | undefined => {
  const xValue = getXValue(xCell);
  const yValue = getYValue(yCell);

  return isUndefined(xValue) || isUndefined(yValue)
    ? undefined
    : [rowId, xValue, yValue];
};

export const getScaledPoints = (
  kind: Kind,
  points: DataPoint[],
  [xMin, xMax, yMin, yMax]: Bounds,
  [width, height]: Size,
  xValues?: XValue[],
  xTitle?: Id,
  yTitle?: Id,
): ScaledPoint[] => {
  const numericX =
    kind == 'line' &&
    arrayIsEmpty(arrayFilter(points, ([, xValue]) => !isNumber(xValue)));
  const xDomain: Domain = numericX ? [xMin as number, xMax as number] : [0, 0];
  const yDomain: Domain = [yMin ?? 0, yMax ?? 0];
  const xCategories = new Map<XValue, number>();

  arrayForEach(
    xValues ?? arrayMap(points, ([, xValue]) => xValue),
    (xValue) => {
      if (!xCategories.has(xValue)) {
        xCategories.set(xValue, collSize(xCategories));
      }
    },
  );

  return arrayMap(points, ([rowId, xValue, yValue]) => [
    rowId,
    xValue,
    yValue,
    getX(xValue, numericX, xDomain, xCategories, width, kind),
    getY(yValue, yDomain, height),
    xTitle,
    yTitle,
  ]);
};

const getX = (
  xValue: XValue,
  numericX: boolean,
  [xMin, xMax]: Domain,
  xCategories: Map<XValue, number>,
  width: number,
  kind: Kind,
) =>
  numericX
    ? getScale(xValue as number, xMin, xMax, width)
    : kind == 'bar'
      ? (width * ((xCategories.get(xValue) ?? 0) + 0.5)) / collSize(xCategories)
      : getScale(
          xCategories.get(xValue) ?? 0,
          0,
          collSize(xCategories) - 1,
          width,
        );

const getY = (yValue: number, [yMin, yMax]: Domain, height: number) =>
  height - getScale(yValue, yMin, yMax, height);

export const getScale = (
  value: number,
  min: number,
  max: number,
  size: number,
) => (min == max ? size / 2 : getRounded((size * (value - min)) / (max - min)));

export const getBounds = (kind: Kind, points: DataPoint[]): Bounds => {
  if (arrayIsEmpty(points)) {
    return [];
  }
  const [yMin, yMax] = getYDomain(points, kind);

  if (arrayIsEmpty(arrayFilter(points, ([, xValue]) => !isNumber(xValue)))) {
    const [xMin, xMax] = getDomain(
      arrayMap(points, ([, xValue]) => xValue as number),
    );
    return [xMin, xMax, yMin, yMax];
  }

  return [points[0]?.[1], points[size(points) - 1]?.[1], yMin, yMax];
};

export const getYTicks = (
  [, , yMin, yMax]: Bounds,
  [, height]: Size,
  labelSize: number,
): Ticks => {
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

export const getXTicks = (
  kind: Kind,
  [xMin, xMax]: Bounds,
  [width]: Size,
  labelSize: number,
): Ticks =>
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

export const getTickBounds = (
  [xMin, xMax, yMin, yMax]: Bounds,
  xTicks: Ticks,
  yTicks: Ticks,
): Bounds => [
  arrayIsEmpty(xTicks) ? xMin : mathMin(xMin as number, xTicks[0]),
  arrayIsEmpty(xTicks)
    ? xMax
    : mathMax(xMax as number, xTicks[size(xTicks) - 1]),
  arrayIsEmpty(yTicks) ? yMin : mathMin(yMin ?? infinity, yTicks[0]),
  arrayIsEmpty(yTicks)
    ? yMax
    : mathMax(yMax ?? -infinity, yTicks[size(yTicks) - 1]),
];

export const getSeriesSummary = (
  kind: Kind,
  points: DataPoint[],
  xCellId?: Id,
  yCellId?: Id,
): SeriesSummary => {
  const [xMin, xMax, yMin, yMax] = getBounds(kind, points);
  const xValues: XValue[] = [];
  const continuousX =
    kind == 'line' &&
    arrayIsEmpty(arrayFilter(points, ([, xValue]) => !isNumber(xValue)));

  arrayForEach(points, ([, xValue]) => {
    if (!arrayHas(xValues, xValue)) {
      arrayPush(xValues, xValue);
    }
  });

  return {continuousX, xCellId, xMin, xMax, yMin, yMax, yCellId, xValues};
};

export const getDomainState = (summaries: SeriesSummary[]): DomainState => {
  const xValues: XValue[] = [];
  const xMins: number[] = [];
  const xMaxs: number[] = [];
  const yMins: number[] = [];
  const yMaxs: number[] = [];
  let continuousX = true;
  let xMin: XValue | undefined;
  let xMax: XValue | undefined;

  arrayForEach(summaries, (summary) => {
    continuousX &&= summary.continuousX;
    arrayForEach(summary.xValues, (xValue) => {
      if (!arrayHas(xValues, xValue)) {
        arrayPush(xValues, xValue);
      }
    });
    if (isNumber(summary.xMin) && isNumber(summary.xMax)) {
      xMins.push(summary.xMin);
      xMaxs.push(summary.xMax);
    } else {
      xMin ??= summary.xMin;
      xMax = summary.xMax ?? xMax;
    }
    if (!isUndefined(summary.yMin)) {
      yMins.push(summary.yMin);
    }
    if (!isUndefined(summary.yMax)) {
      yMaxs.push(summary.yMax);
    }
  });

  return {
    bounds: [
      arrayIsEmpty(xMins) ? xMin : mathMin(...xMins),
      arrayIsEmpty(xMaxs) ? xMax : mathMax(...xMaxs),
      arrayIsEmpty(yMins) ? undefined : mathMin(...yMins),
      arrayIsEmpty(yMaxs) ? undefined : mathMax(...yMaxs),
    ],
    continuousX: !arrayIsEmpty(summaries) && continuousX,
    xValues,
  };
};

export const getYDomain = (
  points: (DataPoint | ScaledPoint)[],
  kind: Kind = 'bar',
): Domain =>
  getDomain([
    ...(kind == 'bar' ? [0] : []),
    ...arrayMap(points, ([, , yValue]) => yValue),
  ]);

const getDomain = (values: number[]): Domain => {
  const min = mathMin(...values);
  return min == infinity ? [0, 0] : [min, mathMax(...values)];
};

const getRounded = (value: number) => mathRound(value * 1000000) / 1000000;

const getXValue = (
  cell: CellOrUndefined | ResultCellOrUndefined,
): XValue | undefined =>
  isNumber(cell)
    ? isFiniteNumber(cell)
      ? cell
      : undefined
    : isString(cell)
      ? cell
      : undefined;

const getYValue = (
  cell: CellOrUndefined | ResultCellOrUndefined,
): number | undefined =>
  isNumber(cell) && isFiniteNumber(cell) ? cell : undefined;
