import type {
  Bounds,
  Kind,
  PlotFrame,
  ScaledPoint,
  SetTooltipPoint,
} from '../common/types.ts';
import {Bars} from './Bars.tsx';
import {Line} from './Line.tsx';

export const Plot = ({
  kind,
  points,
  plotFrame,
  barGap,
  setTooltipPoint,
  bounds: [, , yMin, yMax],
}: {
  readonly kind: Kind;
  readonly points: ScaledPoint[];
  readonly plotFrame: PlotFrame;
  readonly barGap: number;
  readonly setTooltipPoint: SetTooltipPoint;
  readonly bounds: Bounds;
}) => {
  const sharedProps = {points, setTooltipPoint};
  return (
    <g className="plot">
      {kind == 'line' ? (
        <Line {...sharedProps} plotFrame={plotFrame} />
      ) : (
        <Bars
          {...sharedProps}
          plotFrame={plotFrame}
          barGap={barGap}
          yMin={yMin}
          yMax={yMax}
        />
      )}
    </g>
  );
};
