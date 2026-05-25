import {arrayIsEmpty} from '../../common/array.ts';
import {mathAbs, mathMin, size} from '../../common/other.ts';
import {getChartScale, type ChartScaledPoint} from '../common/data.ts';
import type {PlotFrame, SetTooltipPoint} from '../common/types.ts';
import {Marks} from './Marks.tsx';

export const Bars = ({
  points,
  plotFrame,
  barRatio,
  setTooltipPoint,
  yMin = 0,
  yMax = 0,
}: {
  readonly points: ChartScaledPoint[];
  readonly plotFrame: PlotFrame;
  readonly barRatio: number;
  readonly setTooltipPoint: SetTooltipPoint;
  readonly yMin: number | undefined;
  readonly yMax: number | undefined;
}) => {
  const [, , width, height] = plotFrame;
  const baselineY = height - getChartScale(0, yMin, yMax, height);
  const pointsSize = size(points);
  const barWidth = arrayIsEmpty(points) ? 0 : (barRatio * width) / pointsSize;

  return (
    <Marks
      points={points}
      getMark={([, , , x, pointY]) => {
        const y = mathMin(pointY, baselineY);
        return (
          <rect
            className="bar"
            x={x - barWidth / 2}
            y={y}
            width={barWidth}
            height={mathAbs(baselineY - pointY)}
          />
        );
      }}
      setTooltipPoint={setTooltipPoint}
    />
  );
};
