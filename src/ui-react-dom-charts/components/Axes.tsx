import {
  CURRENT_COLOR,
  type Bounds,
  type PlotFrame,
  type ScaledPoint,
  type Ticks,
} from '../common/types.ts';
import {XAxis} from './XAxis.tsx';
import {YAxis} from './YAxis.tsx';

export const Axes = ({
  points,
  xTicks,
  yTicks,
  bounds: [xMin, xMax, yMin, yMax],
  titles: [xTitle, yTitle],
  xAxisHeight,
  yAxisWidth,
  fontSize,
  ...sharedProps
}: {
  readonly points: ScaledPoint[];
  readonly xTicks: Ticks;
  readonly yTicks: Ticks;
  readonly bounds: Bounds;
  readonly titles: readonly [xTitle: string, yTitle: string];
  readonly plotFrame: PlotFrame;
  readonly tickSize: number;
  readonly tickGap: number;
  readonly xAxisHeight: number;
  readonly yAxisWidth: number;
  readonly fontSize: number;
}) => {
  return (
    <g className="axes" fill={CURRENT_COLOR} fillOpacity={0.75}>
      <YAxis
        {...sharedProps}
        yTicks={yTicks}
        yMin={yMin}
        yMax={yMax}
        yTitle={yTitle}
        axisWidth={yAxisWidth}
      />
      <XAxis
        {...sharedProps}
        points={points}
        xTicks={xTicks}
        xMin={xMin}
        xMax={xMax}
        xTitle={xTitle}
        axisHeight={xAxisHeight}
        fontSize={fontSize}
      />
    </g>
  );
};
