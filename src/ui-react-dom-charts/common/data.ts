import type {Id} from '../../@types/common/index.d.ts';
import type {ResultCellOrUndefined} from '../../@types/queries/index.d.ts';
import type {CellOrUndefined} from '../../@types/store/index.d.ts';
import {
  arrayEvery,
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
  isFalse,
  isFiniteNumber,
  isInteger,
  isNumber,
  isString,
  isTrue,
  isUndefined,
  mathAbs,
  mathFloor,
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
  TimestampUnit,
  XScale,
  XValue,
} from './types.ts';
import {getTicks} from './wilkinson.ts';

const TARGET_TICKS = 10;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}(?:$|T)/;
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;
const TIME_TICK_WEIGHTS = [0.25, 0.2, 0.5, 0.05];
const TIME_INTERVALS: TimeInterval[] = [
  ['second', 1],
  ['second', 5],
  ['second', 10],
  ['second', 15],
  ['second', 30],
  ['minute', 1],
  ['minute', 5],
  ['minute', 10],
  ['minute', 15],
  ['minute', 30],
  ['hour', 1],
  ['hour', 3],
  ['hour', 6],
  ['hour', 12],
  ['day', 1],
  ['day', 2],
  ['week', 1],
  ['month', 1],
  ['month', 2],
  ['quarter', 1],
  ['month', 6],
  ['year', 1],
  ['year', 2],
  ['year', 5],
  ['year', 10],
  ['year', 25],
  ['year', 50],
  ['year', 100],
];

type TimeUnit =
  | 'second'
  | 'minute'
  | 'hour'
  | 'day'
  | 'week'
  | 'month'
  | 'quarter'
  | 'year';
type TimeInterval = readonly [unit: TimeUnit, step: number];

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
  xScale: XScale = 'category',
  timestampUnit: TimestampUnit = 'millisecond',
  xTitle?: string,
  yTitle?: string,
): ScaledPoint[] => {
  const continuousX = xScale != 'category';
  const xDomain: Domain = continuousX
    ? [xMin as number, xMax as number]
    : [0, 0];
  const yDomain: Domain = [yMin ?? 0, yMax ?? 0];
  const xCategories = new Map<XValue, number>();

  arrayForEach(
    xValues == null || arrayIsEmpty(xValues)
      ? arrayMap(points, ([, xValue]) => xValue)
      : xValues,
    (xValue) => {
      if (!xCategories.has(xValue)) {
        xCategories.set(xValue, collSize(xCategories));
      }
    },
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
            getY(yValue, yDomain, height),
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
  return xScale != 'category'
    ? isUndefined(continuousValue)
      ? undefined
      : getScale(continuousValue, xMin, xMax, width)
    : kind == 'bar'
      ? (width * ((xCategories.get(xValue) ?? 0) + 0.5)) / collSize(xCategories)
      : getScale(
          xCategories.get(xValue) ?? 0,
          0,
          collSize(xCategories) - 1,
          width,
        );
};

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
  kind == 'line' && isNumber(xMin) && isNumber(xMax) && xMin != xMax
    ? getTicks(
        xMin,
        xMax,
        getTickCount(tickCount),
        labelSize,
        width,
        isInteger(xMin) && isInteger(xMax),
      )
    : [];

export const getTimeTicks = (
  [xMin, xMax]: Bounds,
  [width]: Size,
  labelSize: number,
  tickCount?: number,
): Ticks => {
  if (!isNumber(xMin) || !isNumber(xMax) || xMin == xMax) {
    return [];
  }

  const min = mathMin(xMin, xMax);
  const max = mathMax(xMin, xMax);
  const targetTickCount = getTickCount(tickCount);
  let bestTicks: Ticks = [min, max];
  let bestScore = -infinity;

  arrayForEach(TIME_INTERVALS, (interval, index) => {
    const ticks = getTimeIntervalTicks(min, max, interval);
    const score = getTimeTickScore(
      ticks,
      index,
      min,
      max,
      targetTickCount,
      labelSize,
      width,
    );
    if (score > bestScore) {
      bestTicks = ticks;
      bestScore = score;
    }
  });

  return bestTicks;
};

export const getTimeTickLabel = (timestamp: number, ticks: Ticks): string => {
  const date = new Date(timestamp);
  const year = `${date.getUTCFullYear()}`;
  const month = getPadded(date.getUTCMonth() + 1);
  const day = getPadded(date.getUTCDate());
  const hour = getPadded(date.getUTCHours());
  const minute = getPadded(date.getUTCMinutes());
  const second = getPadded(date.getUTCSeconds());
  const dateLabel = `${year}-${month}-${day}`;
  const minDiff = getTimeTickLabelDiff(date, getTimeTickMinDiff(ticks));

  return minDiff < MINUTE
    ? `${dateLabel} ${hour}:${minute}:${second}`
    : minDiff < DAY
      ? `${dateLabel} ${hour}:${minute}`
      : minDiff < MONTH
        ? dateLabel
        : minDiff < YEAR
          ? `${year}-${month}`
          : year;
};

export const getResolvedXScale = (
  xAxisScale: 'auto' | XScale | undefined,
  {continuousX, xValues}: DomainState,
  hasLinearAxisDefinition: boolean,
): XScale =>
  xAxisScale == 'category' || xAxisScale == 'linear' || xAxisScale == 'time'
    ? xAxisScale
    : continuousX || (arrayIsEmpty(xValues) && hasLinearAxisDefinition)
      ? 'linear'
      : hasTimeStringXValues(xValues)
        ? 'time'
        : 'category';

export const getXScaleDomain = (
  [xMin, xMax]: Bounds,
  xValues: XValue[],
  xScale: XScale,
  timestampUnit: TimestampUnit,
): readonly [xMin?: XValue, xMax?: XValue] => {
  if (xScale == 'linear') {
    return [
      isNumber(xMin) ? xMin : undefined,
      isNumber(xMax) ? xMax : undefined,
    ];
  }
  if (xScale == 'time') {
    const timestamps: number[] = [];
    arrayForEach(xValues, (xValue) => {
      const timestamp = normalizeTimeValue(xValue, timestampUnit);
      if (isFiniteNumber(timestamp)) {
        arrayPush(timestamps, timestamp as number);
      }
    });
    return arrayIsEmpty(timestamps) ? [] : getDomain(timestamps);
  }
  return [xMin, xMax];
};

export const normalizeTimeValue = (
  value: unknown,
  timestampUnit: TimestampUnit,
): number | undefined => {
  const timestamp = isNumber(value)
    ? timestampUnit == 'second'
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
  arrayIsEmpty(xTicks) ? xMin : getMinTickBound(xMin, xTicks[0]),
  arrayIsEmpty(xTicks) ? xMax : getMaxTickBound(xMax, xTicks[size(xTicks) - 1]),
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
  yLabel?: string,
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
      xMins.push(summary.xMin);
      xMaxes.push(summary.xMax);
    } else {
      xMin ??= summary.xMin;
      xMax = summary.xMax ?? xMax;
    }
    if (!isUndefined(summary.yMin)) {
      yMins.push(summary.yMin);
    }
    if (!isUndefined(summary.yMax)) {
      yMaxes.push(summary.yMax);
    }
  });

  return {
    bounds: [
      arrayIsEmpty(xMins) ? xMin : mathMin(...xMins),
      arrayIsEmpty(xMaxes) ? xMax : mathMax(...xMaxes),
      arrayIsEmpty(yMins) ? undefined : mathMin(...yMins),
      arrayIsEmpty(yMaxes) ? undefined : mathMax(...yMaxes),
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

const getContinuousXValue = (
  xValue: XValue,
  xScale: XScale,
  timestampUnit: TimestampUnit,
): number | undefined =>
  xScale == 'linear'
    ? isNumber(xValue)
      ? xValue
      : undefined
    : xScale == 'time'
      ? normalizeTimeValue(xValue, timestampUnit)
      : undefined;

const hasTimeStringXValues = (xValues: XValue[]): boolean =>
  !arrayIsEmpty(xValues) &&
  arrayEvery(
    xValues,
    (xValue) =>
      isString(xValue) &&
      isFiniteNumber(normalizeTimeValue(xValue, 'millisecond')),
  );

const getTime = (value: string | Date): number | undefined => {
  const time = +new Date(value);
  return isFiniteNumber(time) ? mathFloor(time) : undefined;
};

const getTimeIntervalTicks = (
  min: number,
  max: number,
  interval: TimeInterval,
): Ticks => {
  const ticks: Ticks = [];
  for (
    let tick = floorTime(min, interval), count = 0;
    tick <= max && count < 1000;
    tick = addTime(tick, interval), count++
  ) {
    arrayPush(ticks, tick);
  }

  const lastTick = ticks[size(ticks) - 1];
  if (isUndefined(lastTick) || lastTick < max) {
    arrayPush(ticks, addTime(lastTick ?? floorTime(min, interval), interval));
  }
  return ticks;
};

const getTimeTickScore = (
  ticks: Ticks,
  intervalIndex: number,
  min: number,
  max: number,
  targetTickCount: number,
  labelSize: number,
  width: number,
): number => {
  const tickCount = size(ticks);
  if (tickCount < 2) {
    return -infinity;
  }

  const tickMin = ticks[0];
  const tickMax = ticks[tickCount - 1];
  const range = max - min;
  const target = mathMax(targetTickCount, 2);
  const spacing = width / (tickCount - 1);
  const simplicity = 1 - intervalIndex / mathMax(size(TIME_INTERVALS) - 1, 1);
  const coverage =
    1 - (mathAbs(min - tickMin) + mathAbs(tickMax - max)) / range;
  const density = 2 - mathMax(tickCount / target, target / tickCount);
  const legibility =
    spacing < labelSize * 1.2 ? -infinity : mathMin(spacing / labelSize, 1);

  return (
    TIME_TICK_WEIGHTS[0] * simplicity +
    TIME_TICK_WEIGHTS[1] * coverage +
    TIME_TICK_WEIGHTS[2] * density +
    TIME_TICK_WEIGHTS[3] * legibility
  );
};

const floorTime = (timestamp: number, [unit, step]: TimeInterval): number => {
  if (unit == 'year') {
    const date = new Date(timestamp);
    return Date.UTC(mathFloor(date.getUTCFullYear() / step) * step, 0, 1);
  }
  if (unit == 'quarter' || unit == 'month') {
    const date = new Date(timestamp);
    const monthStep = unit == 'quarter' ? step * 3 : step;
    const monthIndex = date.getUTCFullYear() * 12 + date.getUTCMonth();
    const flooredMonthIndex = mathFloor(monthIndex / monthStep) * monthStep;
    return Date.UTC(
      mathFloor(flooredMonthIndex / 12),
      flooredMonthIndex % 12,
      1,
    );
  }
  if (unit == 'week') {
    const date = new Date(timestamp);
    const dayStart = Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
    );
    return dayStart - ((date.getUTCDay() + 6) % 7) * DAY;
  }
  const interval = getFixedInterval(unit, step);
  return mathFloor(timestamp / interval) * interval;
};

const addTime = (timestamp: number, [unit, step]: TimeInterval): number => {
  const date = new Date(timestamp);
  return unit == 'year'
    ? Date.UTC(date.getUTCFullYear() + step, 0, 1)
    : unit == 'quarter'
      ? Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + step * 3, 1)
      : unit == 'month'
        ? Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + step, 1)
        : timestamp + getFixedInterval(unit, step);
};

const getFixedInterval = (unit: TimeUnit, step: number): number =>
  unit == 'week'
    ? step * 7 * DAY
    : unit == 'day'
      ? step * DAY
      : unit == 'hour'
        ? step * HOUR
        : unit == 'minute'
          ? step * MINUTE
          : step * SECOND;

const getTimeTickMinDiff = (ticks: Ticks): number => {
  let minDiff = infinity;
  arrayForEach(ticks, (tick, index) => {
    if (index > 0) {
      minDiff = mathMin(minDiff, tick - ticks[index - 1]);
    }
  });
  return minDiff;
};

const getTimeTickLabelDiff = (date: Date, minDiff: number): number =>
  minDiff == infinity
    ? date.getUTCHours() == 0 &&
      date.getUTCMinutes() == 0 &&
      date.getUTCSeconds() == 0
      ? DAY
      : date.getUTCSeconds() == 0
        ? HOUR
        : SECOND
    : minDiff;

const getPadded = (value: number): string =>
  value < 10 ? `0${value}` : `${value}`;

const getMinTickBound = (bound: XValue | undefined, tick: number) =>
  isNumber(bound) ? mathMin(bound, tick) : tick;

const getMaxTickBound = (bound: XValue | undefined, tick: number) =>
  isNumber(bound) ? mathMax(bound, tick) : tick;

const getTickCount = (tickCount = TARGET_TICKS) =>
  isFiniteNumber(tickCount) ? mathMax(mathRound(tickCount), 1) : TARGET_TICKS;

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
      : isTrue(cell) || isFalse(cell)
        ? cell
        : undefined;

const getYValue = (
  cell: CellOrUndefined | ResultCellOrUndefined,
): number | undefined =>
  isNumber(cell) && isFiniteNumber(cell) ? cell : undefined;
