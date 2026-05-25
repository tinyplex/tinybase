import {mathMax, mathMin, size} from '../../common/other.ts';

type WilkinsonTicks = readonly [ticks: number[], score: number];

const WILKINSON_NICE_NUMBERS = [1, 5, 2, 2.5, 4, 3];
const WILKINSON_WEIGHTS = [0.25, 0.2, 0.5, 0.05];
const EPSILON = Number.EPSILON * 100;

export const getWilkinsonTicks = (
  min: number,
  max: number,
  targetTickCount: number,
  labelSize: number,
  axisSize: number,
): number[] => {
  let bestTicks = [min, max];
  let bestScore = -2;
  const range = max - min;

  for (let j = 1; j < Infinity; j++) {
    for (const niceNumber of WILKINSON_NICE_NUMBERS) {
      const simplicityMax = getWilkinsonSimplicityMax(niceNumber, j);
      if (
        WILKINSON_WEIGHTS[0] * simplicityMax +
          WILKINSON_WEIGHTS[1] +
          WILKINSON_WEIGHTS[2] +
          WILKINSON_WEIGHTS[3] <
        bestScore
      ) {
        return bestTicks;
      }

      for (let tickCount = 2; tickCount < Infinity; tickCount++) {
        const densityMax = getWilkinsonDensityMax(tickCount, targetTickCount);
        if (
          WILKINSON_WEIGHTS[0] * simplicityMax +
            WILKINSON_WEIGHTS[1] +
            WILKINSON_WEIGHTS[2] * densityMax +
            WILKINSON_WEIGHTS[3] <
          bestScore
        ) {
          break;
        }

        const delta = range / (tickCount + 1) / j / niceNumber;
        for (
          let exponent = Math.ceil(Math.log10(delta));
          exponent < Infinity;
          exponent++
        ) {
          const step = j * niceNumber * Math.pow(10, exponent);
          const coverageMax = getWilkinsonCoverageMax(
            min,
            max,
            step * (tickCount - 1),
          );

          if (
            WILKINSON_WEIGHTS[0] * simplicityMax +
              WILKINSON_WEIGHTS[1] * coverageMax +
              WILKINSON_WEIGHTS[2] * densityMax +
              WILKINSON_WEIGHTS[3] <
            bestScore
          ) {
            break;
          }

          const minStart = Math.floor(max / step) * j - (tickCount - 1) * j;
          const maxStart = Math.ceil(min / step) * j;

          if (minStart <= maxStart) {
            [bestTicks, bestScore] = getBestWilkinsonTicks(
              min,
              max,
              targetTickCount,
              niceNumber,
              j,
              tickCount,
              labelSize,
              axisSize,
              step,
              minStart,
              maxStart,
              bestTicks,
              bestScore,
            );
          }
        }
      }
    }
  }

  return bestTicks;
};

const getBestWilkinsonTicks = (
  min: number,
  max: number,
  targetTickCount: number,
  niceNumber: number,
  j: number,
  tickCount: number,
  labelSize: number,
  axisSize: number,
  step: number,
  minStart: number,
  maxStart: number,
  bestTicks: number[],
  bestScore: number,
): WilkinsonTicks => {
  for (let start = minStart; start <= maxStart; start++) {
    const tickMin = start * (step / j);
    const tickMax = tickMin + step * (tickCount - 1);
    const score =
      WILKINSON_WEIGHTS[0] *
        getWilkinsonSimplicity(niceNumber, j, tickMin, tickMax, step) +
      WILKINSON_WEIGHTS[1] * getWilkinsonCoverage(min, max, tickMin, tickMax) +
      WILKINSON_WEIGHTS[2] *
        getWilkinsonDensity(
          tickCount,
          targetTickCount,
          min,
          max,
          tickMin,
          tickMax,
        ) +
      WILKINSON_WEIGHTS[3] *
        getWilkinsonLegibility(tickCount, labelSize, axisSize);

    if (score > bestScore) {
      bestTicks = getWilkinsonTickValues(tickMin, tickMax, step);
      bestScore = score;
    }
  }

  return [bestTicks, bestScore];
};

const getWilkinsonTickValues = (
  min: number,
  max: number,
  step: number,
): number[] => {
  const ticks = [];
  for (let tick = min; tick <= max + step / 2; tick += step) {
    ticks.push(getRounded(tick));
  }
  return ticks;
};

const getWilkinsonSimplicity = (
  niceNumber: number,
  j: number,
  tickMin: number,
  tickMax: number,
  step: number,
) => {
  const niceIndex = WILKINSON_NICE_NUMBERS.indexOf(niceNumber);
  const isZeroIncluded =
    isMultipleOf(tickMin, step) && tickMin <= 0 && tickMax >= 0;

  return (
    1 -
    niceIndex / mathMax(size(WILKINSON_NICE_NUMBERS) - 1, 1) -
    j +
    (isZeroIncluded ? 1 : 0)
  );
};

const getWilkinsonSimplicityMax = (niceNumber: number, j: number) =>
  1 -
  WILKINSON_NICE_NUMBERS.indexOf(niceNumber) /
    mathMax(size(WILKINSON_NICE_NUMBERS) - 1, 1) -
  j +
  1;

const getWilkinsonCoverage = (
  min: number,
  max: number,
  tickMin: number,
  tickMax: number,
) => {
  const range = max - min;
  return (
    1 -
    (Math.pow(max - tickMax, 2) + Math.pow(min - tickMin, 2)) /
      (2 * Math.pow(0.1 * range, 2))
  );
};

const getWilkinsonCoverageMax = (min: number, max: number, span: number) => {
  const range = max - min;
  if (span <= range) {
    return 1;
  }

  const half = (span - range) / 2;
  return 1 - (half * half) / Math.pow(0.1 * range, 2);
};

const getWilkinsonDensity = (
  tickCount: number,
  targetTickCount: number,
  min: number,
  max: number,
  tickMin: number,
  tickMax: number,
) => {
  const density = (tickCount - 1) / (tickMax - tickMin);
  const targetDensity =
    (targetTickCount - 1) / (mathMax(tickMax, max) - mathMin(min, tickMin));

  return 2 - mathMax(density / targetDensity, targetDensity / density);
};

const getWilkinsonDensityMax = (tickCount: number, targetTickCount: number) =>
  tickCount >= targetTickCount
    ? 2 - (tickCount - 1) / (targetTickCount - 1)
    : 1;

const getWilkinsonLegibility = (
  tickCount: number,
  labelSize: number,
  axisSize: number,
) => {
  const spacing = axisSize / (tickCount - 1);
  const requiredSpacing = labelSize * 1.2;

  return spacing < requiredSpacing ? -Infinity : mathMin(spacing, 1);
};

const isMultipleOf = (value: number, step: number) =>
  Math.abs(value / step - Math.round(value / step)) < EPSILON;

const getRounded = (value: number) => Math.round(value * 1000000) / 1000000;
