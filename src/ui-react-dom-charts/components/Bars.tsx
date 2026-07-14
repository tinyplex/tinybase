import {arrayForEach, arrayMap, arraySort} from '../../common/array.ts';
import {
  infinity,
  isEmpty,
  mathAbs,
  mathMax,
  mathMin,
  size,
} from '../../common/other.ts';
import {getScale} from '../common/data.ts';
import {
  type PlotFrame,
  type ScaledPoint,
  type SetTooltipPoint,
} from '../common/types.ts';

export const Bars = ({
  points,
  plotFrame,
  barGap,
  barSeriesCount,
  barSeriesIndex,
  fullBarWidth,
  setTooltipPoint,
  yMin = 0,
  yMax = 0,
}: {
  readonly points: ScaledPoint[];
  readonly plotFrame: PlotFrame;
  readonly barGap: number;
  readonly barSeriesCount: number;
  readonly barSeriesIndex: number;
  readonly fullBarWidth?: number;
  readonly setTooltipPoint: SetTooltipPoint;
  readonly yMin: number | undefined;
  readonly yMax: number | undefined;
}) => {
  const [plotX, plotY, width, height] = plotFrame;
  const baselineY = height - getScale(0, yMin, yMax, height);
  const pointsSize = size(points);
  const resolvedFullBarWidth =
    fullBarWidth ?? (isEmpty(points) ? 0 : width / pointsSize);
  const barCount = mathMax(barSeriesCount, 1);
  const barIndex = mathMax(barSeriesIndex, 0);
  const barGroupWidth = mathMax(resolvedFullBarWidth - barGap, 0);
  const barWidth = mathMax(
    (barGroupWidth - barGap * (barCount - 1)) / barCount,
    0,
  );

  return arrayMap(points, (point) => {
    const [rowId, , , x, pointY] = point;
    const y = mathMin(pointY, baselineY);
    return (
      <rect
        className="bar"
        height={mathAbs(baselineY - pointY)}
        key={rowId}
        onPointerEnter={() => setTooltipPoint(point)}
        onPointerLeave={() => setTooltipPoint(undefined)}
        width={barWidth}
        x={plotX + x - barGroupWidth / 2 + (barWidth + barGap) * barIndex}
        y={plotY + y}
      />
    );
  });
};

export const getContinuousBarWidth = (
  points: ScaledPoint[],
  fallbackWidth: number,
): number => {
  const xs = arraySort(
    arrayMap(points, ([, , , x]) => x),
    (x1, x2) => x1 - x2,
  );
  let barWidth = infinity;

  arrayForEach(xs, (x, index) => {
    if (index > 0 && x > xs[index - 1]) {
      barWidth = mathMin(barWidth, x - xs[index - 1]);
    }
  });

  return barWidth == infinity ? fallbackWidth : barWidth;
};
