import {arrayForEach, arrayIndexOf, arrayNew} from '../../common/array.ts';
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

const NICE_NUMBERS = [1, 5, 2, 2.5, 4, 3];
const WEIGHTS = [0.25, 0.2, 0.5, 0.05];

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
