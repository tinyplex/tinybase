import type {Bounds, PlotFrame, ScaledPoint, Ticks} from '../common/types.ts';
import {XAxis} from './XAxis.tsx';
import {YAxis} from './YAxis.tsx';

export const Axes = ({
  points,
  xTicks,
  yTicks,
  bounds: [xMin, xMax, yMin, yMax],
  titles: [xTitle, yTitle],
  xAxisHeight,
  inset,
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
  readonly inset: number;
  readonly fontSize: number;
}) => {
  return (
    <g className="axes" fill="currentColor" fillOpacity={0.75}>
      <YAxis
        {...sharedProps}
        yTicks={yTicks}
        yMin={yMin}
        yMax={yMax}
        yTitle={yTitle}
        inset={inset}
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
