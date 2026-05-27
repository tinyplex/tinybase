import {
  arrayFilter,
  arrayIsEmpty,
  arrayJoin,
  arrayMap,
} from '../../common/array.ts';
import {isNullish, isNumber} from '../../common/other.ts';
import {getScale} from '../common/data.ts';
import {
  CURRENT_COLOR,
  type Bounds,
  type PlotFrame,
  type ScaledPoint,
  type Ticks,
} from '../common/types.ts';

export const Grid = ({
  points,
  xTicks,
  yTicks,
  bounds: [xMin, xMax, yMin, yMax],
  plotFrame,
  tickSize,
}: {
  readonly points: ScaledPoint[];
  readonly xTicks: Ticks;
  readonly yTicks: Ticks;
  readonly bounds: Bounds;
  readonly plotFrame: PlotFrame;
  readonly tickSize: number;
}) => {
  const [plotX, plotY, width, height] = plotFrame;
  return (
    <g
      className="grid"
      stroke={CURRENT_COLOR}
      strokeOpacity={0.75}
      strokeWidth={0.5}
    >
      {isNullish(yMin) || isNullish(yMax) ? null : (
        <path
          className="y"
          d={arrayJoin(
            arrayMap(
              arrayFilter(
                yTicks,
                (tick) => getScale(tick, yMin, yMax, height) != 0,
              ),
              (tick) =>
                `M${plotX - tickSize},${
                  plotY + height - getScale(tick, yMin, yMax, height)
                }h${width + tickSize}`,
            ),
            ' ',
          )}
        />
      )}
      {arrayIsEmpty(xTicks) || !isNumber(xMin) || !isNumber(xMax) ? (
        <path
          className="x"
          d={arrayJoin(
            arrayMap(
              arrayFilter(points, ([, , , x]) => x != 0),
              ([, , , x]) => `M${plotX + x},${plotY}v${height + tickSize}`,
            ),
            ' ',
          )}
        />
      ) : (
        <path
          className="x"
          d={arrayJoin(
            arrayMap(
              arrayFilter(
                xTicks,
                (tick) => getScale(tick, xMin, xMax, width) != 0,
              ),
              (tick) =>
                `M${
                  plotX + getScale(tick, xMin, xMax, width)
                },${plotY}v${height + tickSize}`,
            ),
            ' ',
          )}
        />
      )}
    </g>
  );
};
