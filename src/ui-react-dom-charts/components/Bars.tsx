import {arrayIsEmpty, arrayMap} from '../../common/array.ts';
import {mathAbs, mathMax, mathMin, size} from '../../common/other.ts';
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
  setTooltipPoint,
  yMin = 0,
  yMax = 0,
}: {
  readonly points: ScaledPoint[];
  readonly plotFrame: PlotFrame;
  readonly barGap: number;
  readonly barSeriesCount: number;
  readonly barSeriesIndex: number;
  readonly setTooltipPoint: SetTooltipPoint;
  readonly yMin: number | undefined;
  readonly yMax: number | undefined;
}) => {
  const [plotX, plotY, width, height] = plotFrame;
  const baselineY = height - getScale(0, yMin, yMax, height);
  const pointsSize = size(points);
  const fullBarWidth = arrayIsEmpty(points) ? 0 : width / pointsSize;
  const barCount = mathMax(barSeriesCount, 1);
  const barIndex = mathMax(barSeriesIndex, 0);
  const barGroupWidth = mathMax(fullBarWidth - barGap, 0);
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
