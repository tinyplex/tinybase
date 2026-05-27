import {arrayIsEmpty} from '../../common/array.ts';
import {mathAbs, mathMax, mathMin, size} from '../../common/other.ts';
import {getScale} from '../common/data.ts';
import {
  CURRENT_COLOR,
  type PlotFrame,
  type ScaledPoint,
  type SetTooltipPoint,
} from '../common/types.ts';
import {Marks} from './Marks.tsx';

export const Bars = ({
  points,
  plotFrame,
  barGap,
  setTooltipPoint,
  yMin = 0,
  yMax = 0,
}: {
  readonly points: ScaledPoint[];
  readonly plotFrame: PlotFrame;
  readonly barGap: number;
  readonly setTooltipPoint: SetTooltipPoint;
  readonly yMin: number | undefined;
  readonly yMax: number | undefined;
}) => {
  const [plotX, plotY, width, height] = plotFrame;
  const baselineY = height - getScale(0, yMin, yMax, height);
  const pointsSize = size(points);
  const fullBarWidth = arrayIsEmpty(points) ? 0 : width / pointsSize;
  const barWidth = arrayIsEmpty(points) ? 0 : mathMax(fullBarWidth - barGap, 0);

  return (
    <Marks
      points={points}
      getMark={([, , , x, pointY]) => {
        const y = mathMin(pointY, baselineY);
        return (
          <rect
            className="bar"
            fill={CURRENT_COLOR}
            x={plotX + x - barWidth / 2}
            y={plotY + y}
            width={barWidth}
            height={mathAbs(baselineY - pointY)}
          />
        );
      }}
      setTooltipPoint={setTooltipPoint}
    />
  );
};
