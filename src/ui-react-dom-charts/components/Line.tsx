import {arrayIsEmpty, arrayJoin, arrayMap} from '../../common/array.ts';
import {size} from '../../common/other.ts';
import type {ChartScaledPoint} from '../common/data.ts';
import type {SetTooltipPoint} from '../common/types.ts';
import {Marks} from './Marks.tsx';

export const Line = ({
  height,
  points,
  setTooltipPoint,
}: {
  readonly height: number;
  readonly points: ChartScaledPoint[];
  readonly setTooltipPoint: SetTooltipPoint;
}) => (
  <>
    <path
      className="area"
      d={getAreaPath(points, height)}
      fill="currentColor"
      fillOpacity={0}
      stroke="none"
    />
    <path
      className="line"
      d={getLinePath(points)}
      fill="none"
      stroke="currentColor"
      strokeOpacity={0.8}
      strokeWidth={2}
    />
    <Marks
      points={points}
      getMark={([, , , x, y]) => (
        <circle
          className="point"
          cx={x}
          cy={y}
          fill="currentColor"
          r={5}
        />
      )}
      setTooltipPoint={setTooltipPoint}
    />
  </>
);

const getLinePath = (points: ChartScaledPoint[]) =>
  arrayJoin(
    arrayMap(
      points,
      ([, , , x, y], index) => `${index == 0 ? 'M' : 'L'}${x},${y}`,
    ),
    ' ',
  );

const getAreaPath = (points: ChartScaledPoint[], height: number) =>
  arrayIsEmpty(points)
    ? ''
    : `${getLinePath(points)} L${points[size(points) - 1][3]},${height} L${
        points[0][3]
      },${height} Z`;
