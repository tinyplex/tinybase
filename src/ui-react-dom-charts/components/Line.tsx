import {arrayIsEmpty, arrayJoin, arrayMap} from '../../common/array.ts';
import {size} from '../../common/other.ts';
import {CURRENT_COLOR} from '../common/strings.ts';
import {
  type PlotFrame,
  type ScaledPoint,
  type SetTooltipPoint,
} from '../common/types.ts';

export const Line = ({
  plotFrame,
  points,
  setTooltipPoint,
}: {
  readonly plotFrame: PlotFrame;
  readonly points: ScaledPoint[];
  readonly setTooltipPoint: SetTooltipPoint;
}) => {
  const [plotX, plotY, , height] = plotFrame;
  return (
    <>
      <path
        className="area"
        d={getAreaPath(points, plotX, plotY, height)}
        fill={CURRENT_COLOR}
        fillOpacity={0.25}
        stroke="none"
      />
      <path
        className="line"
        d={getLinePath(points, plotX, plotY)}
        fill="none"
        stroke={CURRENT_COLOR}
        strokeOpacity={0.75}
        strokeWidth={2}
      />
      <g className="points" fill={CURRENT_COLOR}>
        {arrayMap(points, (point) => {
          const [rowId, , , x, y] = point;
          return (
            <circle
              key={rowId}
              cx={plotX + x}
              cy={plotY + y}
              onPointerEnter={() => setTooltipPoint(point)}
              onPointerLeave={() => setTooltipPoint(undefined)}
              r={5}
            />
          );
        })}
      </g>
    </>
  );
};

const getLinePath = (points: ScaledPoint[], plotX: number, plotY: number) =>
  arrayJoin(
    arrayMap(
      points,
      ([, , , x, y], index) =>
        `${index == 0 ? 'M' : 'L'}${plotX + x},${plotY + y}`,
    ),
    ' ',
  );

const getAreaPath = (
  points: ScaledPoint[],
  plotX: number,
  plotY: number,
  height: number,
) =>
  arrayIsEmpty(points)
    ? ''
    : `${getLinePath(points, plotX, plotY)} L${
        plotX + points[size(points) - 1][3]
      },${plotY + height} L${plotX + points[0][3]},${plotY + height} Z`;
