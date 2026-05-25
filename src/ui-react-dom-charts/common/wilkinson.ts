import {arrayIndexOf, arrayPush} from '../../common/array.ts';
import {
  epsilon,
  infinity,
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

const WILKINSON_NICE_NUMBERS = [1, 5, 2, 2.5, 4, 3];
const WILKINSON_WEIGHTS = [0.25, 0.2, 0.5, 0.05];

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

  for (let j = 1; j < infinity; j++) {
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

      for (let tickCount = 2; tickCount < infinity; tickCount++) {
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

        for (
          let exponent = mathCeil(
            mathLog10(range / (tickCount + 1) / j / niceNumber),
          );
          exponent < infinity;
          exponent++
        ) {
          const step = j * niceNumber * mathPow(10, exponent);

          if (
            WILKINSON_WEIGHTS[0] * simplicityMax +
              WILKINSON_WEIGHTS[1] *
                getWilkinsonCoverageMax(min, max, step * (tickCount - 1)) +
              WILKINSON_WEIGHTS[2] * densityMax +
              WILKINSON_WEIGHTS[3] <
            bestScore
          ) {
            break;
          }

          const minStart = mathFloor(max / step) * j - (tickCount - 1) * j;
          const maxStart = mathCeil(min / step) * j;

          for (let start = minStart; start <= maxStart; start++) {
            const tickMin = start * (step / j);
            const tickMax = tickMin + step * (tickCount - 1);
            const density = (tickCount - 1) / (tickMax - tickMin);
            const targetDensity =
              (targetTickCount - 1) /
              (mathMax(tickMax, max) - mathMin(min, tickMin));
            const spacing = axisSize / (tickCount - 1);
            const score =
              WILKINSON_WEIGHTS[0] *
                (1 -
                  arrayIndexOf(WILKINSON_NICE_NUMBERS, niceNumber) /
                    mathMax(size(WILKINSON_NICE_NUMBERS) - 1, 1) -
                  j +
                  (isMultipleOf(tickMin, step) && tickMin <= 0 && tickMax >= 0
                    ? 1
                    : 0)) +
              WILKINSON_WEIGHTS[1] *
                getWilkinsonCoverage(min, max, tickMin, tickMax) +
              WILKINSON_WEIGHTS[2] *
                (2 -
                  mathMax(density / targetDensity, targetDensity / density)) +
              WILKINSON_WEIGHTS[3] *
                (spacing < labelSize * 1.2 ? -infinity : mathMin(spacing, 1));

            if (score > bestScore) {
              bestTicks = getWilkinsonTickValues(tickMin, tickMax, step);
              bestScore = score;
            }
          }
        }
      }
    }
  }

  return bestTicks;
};

const getWilkinsonTickValues = (
  min: number,
  max: number,
  step: number,
): number[] => {
  const ticks: number[] = [];
  for (let tick = min; tick <= max + step / 2; tick += step) {
    arrayPush(ticks, mathRound(tick * 1000000) / 1000000);
  }
  return ticks;
};

const getWilkinsonSimplicityMax = (niceNumber: number, j: number) =>
  1 -
  arrayIndexOf(WILKINSON_NICE_NUMBERS, niceNumber) /
    mathMax(size(WILKINSON_NICE_NUMBERS) - 1, 1) -
  j +
  1;

const getWilkinsonCoverage = (
  min: number,
  max: number,
  tickMin: number,
  tickMax: number,
) =>
  1 -
  (mathPow(max - tickMax, 2) + mathPow(min - tickMin, 2)) /
    (2 * mathPow(0.1 * (max - min), 2));

const getWilkinsonCoverageMax = (min: number, max: number, span: number) =>
  span <= max - min
    ? 1
    : 1 - mathPow((span - (max - min)) / 2, 2) / mathPow(0.1 * (max - min), 2);

const getWilkinsonDensityMax = (tickCount: number, targetTickCount: number) =>
  tickCount >= targetTickCount
    ? 2 - (tickCount - 1) / (targetTickCount - 1)
    : 1;

const isMultipleOf = (value: number, step: number) =>
  mathAbs(value / step - mathRound(value / step)) < epsilon * 100;
