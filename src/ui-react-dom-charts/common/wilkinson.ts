import {
  arrayForEach,
  arrayIndexOf,
  arrayNew,
  arrayPush,
} from '../../common/array.ts';
import {
  dateGetUTCDate,
  dateGetUTCDay,
  dateGetUTCFullYear,
  dateGetUTCHours,
  dateGetUTCMinutes,
  dateGetUTCMonth,
  dateGetUTCSeconds,
  dateNew,
  dateUtc,
  epsilon,
  infinity,
  isFiniteNumber,
  isZero,
  mathAbs,
  mathCeil,
  mathFloor,
  mathLog10,
  mathMax,
  mathMin,
  mathPow,
  mathRound,
  size,
} from '../../common/other.ts';
import {EMPTY_STRING} from '../../common/strings.ts';
import {SECOND_UNIT} from './strings.ts';

const TARGET_TICKS = 10;
const NICE_NUMBERS = [1, 5, 2, 2.5, 4, 3];
const WEIGHTS = [0.25, 0.2, 0.5, 0.05];
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;
const MINUTE_UNIT = 'minute';
const HOUR_UNIT = 'hour';
const DAY_UNIT = 'day';
const WEEK_UNIT = 'week';
const MONTH_UNIT = 'month';
const QUARTER_UNIT = 'quarter';
const YEAR_UNIT = 'year';
const TIME_INTERVALS: TimeInterval[] = [
  [SECOND_UNIT, 1],
  [SECOND_UNIT, 5],
  [SECOND_UNIT, 10],
  [SECOND_UNIT, 15],
  [SECOND_UNIT, 30],
  [MINUTE_UNIT, 1],
  [MINUTE_UNIT, 5],
  [MINUTE_UNIT, 10],
  [MINUTE_UNIT, 15],
  [MINUTE_UNIT, 30],
  [HOUR_UNIT, 1],
  [HOUR_UNIT, 3],
  [HOUR_UNIT, 6],
  [HOUR_UNIT, 12],
  [DAY_UNIT, 1],
  [DAY_UNIT, 2],
  [WEEK_UNIT, 1],
  [MONTH_UNIT, 1],
  [MONTH_UNIT, 2],
  [QUARTER_UNIT, 1],
  [MONTH_UNIT, 6],
  [YEAR_UNIT, 1],
  [YEAR_UNIT, 2],
  [YEAR_UNIT, 5],
  [YEAR_UNIT, 10],
  [YEAR_UNIT, 25],
  [YEAR_UNIT, 50],
  [YEAR_UNIT, 100],
];

type TimeUnit =
  | typeof SECOND_UNIT
  | typeof MINUTE_UNIT
  | typeof HOUR_UNIT
  | typeof DAY_UNIT
  | typeof WEEK_UNIT
  | typeof MONTH_UNIT
  | typeof QUARTER_UNIT
  | typeof YEAR_UNIT;
type TimeInterval = readonly [unit: TimeUnit, step: number];

export const getTickCount = (tickCount = TARGET_TICKS) =>
  isFiniteNumber(tickCount) ? mathMax(mathRound(tickCount), 1) : TARGET_TICKS;

export const getTicks = (
  min: number,
  max: number,
  targetTickCount: number,
  labelSize: number,
  axisSize: number,
  integerTicks: boolean,
): number[] => {
  let bestTicks = [min, max];
  let bestScore = -2;
  const range = max - min;

  for (let j = 1; j < infinity; j++) {
    for (const niceNumber of NICE_NUMBERS) {
      const simplicityMax =
        1 -
        arrayIndexOf(NICE_NUMBERS, niceNumber) /
          mathMax(size(NICE_NUMBERS) - 1, 1) -
        j +
        1;
      if (
        WEIGHTS[0] * simplicityMax + WEIGHTS[1] + WEIGHTS[2] + WEIGHTS[3] <
        bestScore
      ) {
        return bestTicks;
      }

      for (let tickCount = 2; tickCount < infinity; tickCount++) {
        const densityMax =
          tickCount >= targetTickCount
            ? 2 - (tickCount - 1) / (targetTickCount - 1)
            : 1;
        if (
          WEIGHTS[0] * simplicityMax +
            WEIGHTS[1] +
            WEIGHTS[2] * densityMax +
            WEIGHTS[3] <
          bestScore
        ) {
          break;
        }

        for (
          let exponent = mathCeil(
            mathLog10(range / (tickCount + 1) / j / niceNumber),
          );
          exponent < infinity;
          exponent++
        ) {
          const step = j * niceNumber * mathPow(10, exponent);

          if (
            WEIGHTS[0] * simplicityMax +
              WEIGHTS[1] *
                (step * (tickCount - 1) <= max - min
                  ? 1
                  : 1 -
                    mathPow((step * (tickCount - 1) - (max - min)) / 2, 2) /
                      mathPow(0.1 * (max - min), 2)) +
              WEIGHTS[2] * densityMax +
              WEIGHTS[3] <
            bestScore
          ) {
            break;
          }

          const minStart = mathFloor(max / step) * j - (tickCount - 1) * j;
          const maxStart = mathCeil(min / step) * j;

          if (minStart <= maxStart) {
            arrayForEach(
              arrayNew(maxStart - minStart + 1, (index) => minStart + index),
              (start) => {
                const tickMin = start * (step / j);
                const tickMax = tickMin + step * (tickCount - 1);
                const density = (tickCount - 1) / (tickMax - tickMin);
                const targetDensity =
                  (targetTickCount - 1) /
                  (mathMax(tickMax, max) - mathMin(min, tickMin));
                const spacing = axisSize / (tickCount - 1);
                const score =
                  WEIGHTS[0] *
                    (1 -
                      arrayIndexOf(NICE_NUMBERS, niceNumber) /
                        mathMax(size(NICE_NUMBERS) - 1, 1) -
                      j +
                      (mathAbs(tickMin / step - mathRound(tickMin / step)) <
                        epsilon * 100 &&
                      tickMin <= 0 &&
                      tickMax >= 0
                        ? 1
                        : 0)) +
                  WEIGHTS[1] *
                    (1 -
                      (mathPow(max - tickMax, 2) + mathPow(min - tickMin, 2)) /
                        (2 * mathPow(0.1 * (max - min), 2))) +
                  WEIGHTS[2] *
                    (2 -
                      mathMax(
                        density / targetDensity,
                        targetDensity / density,
                      )) +
                  WEIGHTS[3] *
                    (spacing < labelSize * 1.2
                      ? -infinity
                      : mathMin(spacing, 1)) +
                  (integerTicks &&
                  (mathAbs(step - mathRound(step)) > epsilon * 100 ||
                    mathAbs(tickMin - mathRound(tickMin)) > epsilon * 100)
                    ? -1
                    : 0);

                if (score > bestScore) {
                  bestTicks = arrayNew(
                    mathFloor((tickMax - tickMin) / step + 0.5) + 1,
                    (index) =>
                      mathRound((tickMin + index * step) * 1000000) / 1000000,
                  );
                  bestScore = score;
                }
              },
            );
          }
        }
      }
    }
  }

  return bestTicks;
};

export const getTimeTicks = (
  minTimestamp: number,
  maxTimestamp: number,
  targetTickCount: number,
  labelSize: number,
  axisSize: number,
): number[] => {
  const min = mathMin(minTimestamp, maxTimestamp);
  const max = mathMax(minTimestamp, maxTimestamp);
  let bestTicks: number[] = [min, max];
  let bestScore = -infinity;

  arrayForEach(TIME_INTERVALS, (interval, index) => {
    const ticks: number[] = [];
    for (
      let tick = floorTime(min, interval), count = 0;
      tick <= max && count < 1000;
      tick = addTime(tick, interval), count++
    ) {
      arrayPush(ticks, tick);
    }
    const lastTick = ticks[size(ticks) - 1];
    if (!isFiniteNumber(lastTick) || lastTick < max) {
      arrayPush(ticks, addTime(lastTick ?? floorTime(min, interval), interval));
    }
    const tickCount = size(ticks);
    const tickMin = ticks[0];
    const tickMax = ticks[tickCount - 1];
    const range = max - min;
    const target = mathMax(targetTickCount, 2);
    const spacing = axisSize / (tickCount - 1);
    const score =
      tickCount < 2
        ? -infinity
        : WEIGHTS[0] * (1 - index / mathMax(size(TIME_INTERVALS) - 1, 1)) +
          WEIGHTS[1] *
            (1 - (mathAbs(min - tickMin) + mathAbs(tickMax - max)) / range) +
          WEIGHTS[2] * (2 - mathMax(tickCount / target, target / tickCount)) +
          WEIGHTS[3] *
            (spacing < labelSize * 1.2
              ? -infinity
              : mathMin(spacing / labelSize, 1));

    if (score > bestScore) {
      bestTicks = ticks;
      bestScore = score;
    }
  });

  return bestTicks;
};

export const getTimeTickLabel = (
  timestamp: number,
  ticks: number[],
): string => {
  const date = dateNew(timestamp);
  const year = dateGetUTCFullYear(date) + EMPTY_STRING;
  const month = getPadded(dateGetUTCMonth(date) + 1);
  const day = getPadded(dateGetUTCDate(date));
  const hour = getPadded(dateGetUTCHours(date));
  const minute = getPadded(dateGetUTCMinutes(date));
  const second = getPadded(dateGetUTCSeconds(date));
  const dateLabel = `${year}-${month}-${day}`;
  let minDiff = infinity;
  arrayForEach(ticks, (tick, index) => {
    if (index > 0) {
      minDiff = mathMin(minDiff, tick - ticks[index - 1]);
    }
  });
  minDiff =
    minDiff == infinity
      ? isZero(dateGetUTCHours(date)) &&
        isZero(dateGetUTCMinutes(date)) &&
        isZero(dateGetUTCSeconds(date))
        ? DAY
        : isZero(dateGetUTCSeconds(date))
          ? HOUR
          : SECOND
      : minDiff;

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

const floorTime = (timestamp: number, [unit, step]: TimeInterval): number => {
  const date = dateNew(timestamp);
  const year = dateGetUTCFullYear(date);
  const month = dateGetUTCMonth(date);
  const monthStep = unit == QUARTER_UNIT ? step * 3 : step;
  const monthIndex = year * 12 + month;
  const flooredMonthIndex = mathFloor(monthIndex / monthStep) * monthStep;
  const fixedInterval = getFixedInterval(unit, step);
  return unit == YEAR_UNIT
    ? dateUtc(mathFloor(year / step) * step, 0, 1)
    : unit == QUARTER_UNIT || unit == MONTH_UNIT
      ? dateUtc(mathFloor(flooredMonthIndex / 12), flooredMonthIndex % 12, 1)
      : unit == WEEK_UNIT
        ? dateUtc(year, month, dateGetUTCDate(date)) -
          ((dateGetUTCDay(date) + 6) % 7) * DAY
        : mathFloor(timestamp / fixedInterval) * fixedInterval;
};

const addTime = (timestamp: number, [unit, step]: TimeInterval): number => {
  const date = dateNew(timestamp);
  return unit == YEAR_UNIT
    ? dateUtc(dateGetUTCFullYear(date) + step, 0, 1)
    : unit == QUARTER_UNIT
      ? dateUtc(dateGetUTCFullYear(date), dateGetUTCMonth(date) + step * 3, 1)
      : unit == MONTH_UNIT
        ? dateUtc(dateGetUTCFullYear(date), dateGetUTCMonth(date) + step, 1)
        : timestamp + getFixedInterval(unit, step);
};

const getFixedInterval = (unit: TimeUnit, step: number): number =>
  unit == WEEK_UNIT
    ? step * 7 * DAY
    : unit == DAY_UNIT
      ? step * DAY
      : unit == HOUR_UNIT
        ? step * HOUR
        : unit == MINUTE_UNIT
          ? step * MINUTE
          : step * SECOND;

const getPadded = (value: number): string =>
  value < 10 ? `0${value}` : value + EMPTY_STRING;
