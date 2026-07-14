import type {Id} from '../../@types/common/index.d.ts';
import type {ResultCellOrUndefined} from '../../@types/queries/index.d.ts';
import type {CellOrUndefined} from '../../@types/store/index.d.ts';
import {
  arrayEvery,
  arrayFilter,
  arrayForEach,
  arrayHas,
  arrayMap,
  arrayPush,
} from '../../common/array.ts';
import {collHas, collSize} from '../../common/coll.ts';
import {mapGet, mapNew, mapSet} from '../../common/map.ts';
import {
  dateNew,
  infinity,
  isEmpty,
  isFalse,
  isFiniteNumber,
  isInteger,
  isNullish,
  isNumber,
  isString,
  isTrue,
  isUndefined,
  mathFloor,
  mathMax,
  mathMin,
  mathRound,
  size,
} from '../../common/other.ts';
import {
  BAR,
  CATEGORY,
  LINE,
  LINEAR,
  MILLISECOND,
  SECOND_UNIT,
  TIME,
} from './strings.ts';
import {
  type Bounds,
  type DataPoint,
  type Domain,
  type DomainState,
  type Kind,
  type ScaledPoint,
  type SeriesSummary,
  type Size,
  type Ticks,
  type TimestampUnit,
  type XScale,
  type XValue,
} from './types.ts';
import {getTickCount, getTicks} from './wilkinson.ts';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}(?:$|T)/;

export const getDataPoints = (
  rowIds: string[],
  getPoint: (rowId: string) => DataPoint | undefined,
) =>
  arrayFilter(
    arrayMap(rowIds, getPoint),
    (point): point is DataPoint => !isUndefined(point),
  );

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
  xScale: XScale = CATEGORY,
  timestampUnit: TimestampUnit = MILLISECOND,
  xTitle?: string,
  yTitle?: string,
): ScaledPoint[] => {
  const continuousX = xScale != CATEGORY;
  const xDomain: Domain = continuousX
    ? [xMin as number, xMax as number]
    : [0, 0];
  const yDomain: Domain = [yMin ?? 0, yMax ?? 0];
  const xCategories = mapNew<XValue, number>();

  arrayForEach(
    isNullish(xValues) || isEmpty(xValues)
      ? arrayMap(points, ([, xValue]) => xValue)
      : xValues,
    (xValue) =>
      collHas(xCategories, xValue)
        ? 0
        : mapSet(xCategories, xValue, collSize(xCategories)),
  );

  return arrayFilter(
    arrayMap(points, ([rowId, xValue, yValue]): ScaledPoint | undefined => {
      const x = getX(
        xValue,
        xScale,
        timestampUnit,
        xDomain,
        xCategories,
        width,
        kind,
      );
      return isUndefined(x)
        ? undefined
        : [
            rowId,
            xValue,
            yValue,
            x,
            height - getScale(yValue, yDomain[0], yDomain[1], height),
            xTitle,
            yTitle,
          ];
    }),
    (point): point is ScaledPoint => !isUndefined(point),
  );
};

const getX = (
  xValue: XValue,
  xScale: XScale,
  timestampUnit: TimestampUnit,
  [xMin, xMax]: Domain,
  xCategories: Map<XValue, number>,
  width: number,
  kind: Kind,
): number | undefined => {
  const continuousValue = getContinuousXValue(xValue, xScale, timestampUnit);
  return xScale != CATEGORY
    ? isUndefined(continuousValue)
      ? undefined
      : getScale(continuousValue, xMin, xMax, width)
    : kind == BAR
      ? (width * ((mapGet(xCategories, xValue) ?? 0) + 0.5)) /
        collSize(xCategories)
      : getScale(
          mapGet(xCategories, xValue) ?? 0,
          0,
          collSize(xCategories) - 1,
          width,
        );
};

export const getScale = (
  value: number,
  min: number,
  max: number,
  size: number,
) =>
  min == max
    ? size / 2
    : mathRound(((size * (value - min)) / (max - min)) * 1000000) / 1000000;

export const getBounds = (kind: Kind, points: DataPoint[]): Bounds => {
  if (isEmpty(points)) {
    return [];
  }
  const [yMin, yMax] = getYDomain(points, kind);

  if (isEmpty(arrayFilter(points, ([, xValue]) => !isNumber(xValue)))) {
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
  tickCount?: number,
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
    getTickCount(tickCount),
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
  tickCount?: number,
): Ticks =>
  kind == LINE && isNumber(xMin) && isNumber(xMax) && xMin != xMax
    ? getTicks(
        xMin,
        xMax,
        getTickCount(tickCount),
        labelSize,
        width,
        isInteger(xMin) && isInteger(xMax),
      )
    : [];

export const getResolvedXScale = (
  xAxisScale: 'auto' | XScale | undefined,
  {continuousX, xValues}: DomainState,
  hasLinearAxisDefinition: boolean,
): XScale =>
  xAxisScale == CATEGORY || xAxisScale == LINEAR || xAxisScale == TIME
    ? xAxisScale
    : continuousX || (isEmpty(xValues) && hasLinearAxisDefinition)
      ? LINEAR
      : !isEmpty(xValues) &&
          arrayEvery(
            xValues,
            (xValue) =>
              isString(xValue) &&
              isFiniteNumber(normalizeTimeValue(xValue, MILLISECOND)),
          )
        ? TIME
        : CATEGORY;

export const getXScaleDomain = (
  [xMin, xMax]: Bounds,
  xValues: XValue[],
  xScale: XScale,
  timestampUnit: TimestampUnit,
): readonly [xMin?: XValue, xMax?: XValue] => {
  const timestamps: number[] = [];
  return xScale == LINEAR
    ? [isNumber(xMin) ? xMin : undefined, isNumber(xMax) ? xMax : undefined]
    : xScale == TIME
      ? (arrayForEach(xValues, (xValue) => {
          const timestamp = normalizeTimeValue(xValue, timestampUnit);
          if (isFiniteNumber(timestamp)) {
            arrayPush(timestamps, timestamp as number);
          }
        }),
        isEmpty(timestamps) ? [] : getDomain(timestamps))
      : [xMin, xMax];
};

export const normalizeTimeValue = (
  value: unknown,
  timestampUnit: TimestampUnit,
): number | undefined => {
  const timestamp = isNumber(value)
    ? timestampUnit == SECOND_UNIT
      ? value * 1000
      : value
    : isString(value) && ISO_DATE.test(value)
      ? getTime(value)
      : value instanceof Date
        ? getTime(value)
        : undefined;
  return isFiniteNumber(timestamp) ? timestamp : undefined;
};

export const getTickBounds = (
  [xMin, xMax, yMin, yMax]: Bounds,
  xTicks: Ticks,
  yTicks: Ticks,
): Bounds => [
  isEmpty(xTicks)
    ? xMin
    : isNumber(xMin)
      ? mathMin(xMin, xTicks[0])
      : xTicks[0],
  isEmpty(xTicks)
    ? xMax
    : isNumber(xMax)
      ? mathMax(xMax, xTicks[size(xTicks) - 1])
      : xTicks[size(xTicks) - 1],
  isEmpty(yTicks) ? yMin : mathMin(yMin ?? infinity, yTicks[0]),
  isEmpty(yTicks) ? yMax : mathMax(yMax ?? -infinity, yTicks[size(yTicks) - 1]),
];

export const getSeriesSummary = (
  kind: Kind,
  points: DataPoint[],
  xCellId?: Id,
  yCellId?: Id,
  yLabel?: string,
): SeriesSummary => {
  const [xMin, xMax, yMin, yMax] = getBounds(kind, points);
  const xValues: XValue[] = [];
  const continuousX =
    kind == LINE &&
    isEmpty(arrayFilter(points, ([, xValue]) => !isNumber(xValue)));

  arrayForEach(points, ([, xValue]) => {
    if (!arrayHas(xValues, xValue)) {
      arrayPush(xValues, xValue);
    }
  });

  return {
    continuousX,
    xCellId,
    xMin,
    xMax,
    yMin,
    yMax,
    yCellId,
    yLabel,
    xValues,
  };
};

export const getDomainState = (summaries: SeriesSummary[]): DomainState => {
  const xValues: XValue[] = [];
  const xMins: number[] = [];
  const xMaxes: number[] = [];
  const yMins: number[] = [];
  const yMaxes: number[] = [];
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
      arrayPush(xMins, summary.xMin);
      arrayPush(xMaxes, summary.xMax);
    } else {
      xMin ??= summary.xMin;
      xMax = summary.xMax ?? xMax;
    }
    if (!isUndefined(summary.yMin)) {
      arrayPush(yMins, summary.yMin);
    }
    if (!isUndefined(summary.yMax)) {
      arrayPush(yMaxes, summary.yMax);
    }
  });

  return {
    bounds: [
      isEmpty(xMins) ? xMin : mathMin(...xMins),
      isEmpty(xMaxes) ? xMax : mathMax(...xMaxes),
      isEmpty(yMins) ? undefined : mathMin(...yMins),
      isEmpty(yMaxes) ? undefined : mathMax(...yMaxes),
    ],
    continuousX: !isEmpty(summaries) && continuousX,
    xValues,
  };
};

export const getYDomain = (
  points: (DataPoint | ScaledPoint)[],
  kind: Kind = BAR,
): Domain =>
  getDomain([
    ...(kind == BAR ? [0] : []),
    ...arrayMap(points, ([, , yValue]) => yValue),
  ]);

const getDomain = (values: number[]): Domain => {
  const min = mathMin(...values);
  return min == infinity ? [0, 0] : [min, mathMax(...values)];
};

const getContinuousXValue = (
  xValue: XValue,
  xScale: XScale,
  timestampUnit: TimestampUnit,
): number | undefined =>
  xScale == LINEAR
    ? isNumber(xValue)
      ? xValue
      : undefined
    : xScale == TIME
      ? normalizeTimeValue(xValue, timestampUnit)
      : undefined;

const getTime = (value: string | Date): number | undefined => {
  const time = +dateNew(value);
  return isFiniteNumber(time) ? mathFloor(time) : undefined;
};

const getXValue = (
  cell: CellOrUndefined | ResultCellOrUndefined,
): XValue | undefined =>
  isNumber(cell)
    ? isFiniteNumber(cell)
      ? cell
      : undefined
    : isString(cell)
      ? cell
      : isTrue(cell) || isFalse(cell)
        ? cell
        : undefined;

const getYValue = (
  cell: CellOrUndefined | ResultCellOrUndefined,
): number | undefined =>
  isNumber(cell) && isFiniteNumber(cell) ? cell : undefined;
