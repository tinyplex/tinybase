import {arrayJoin, arrayMap} from '../../common/array.ts';
import type {ChartScaledPoint} from '../common/data.ts';
import type {SetTooltipPoint} from '../common/types.ts';
import {Marks} from './Marks.tsx';

export const Line = ({
  points,
  setTooltipPoint,
}: {
  readonly points: ChartScaledPoint[];
  readonly setTooltipPoint: SetTooltipPoint;
}) => (
  <>
    <path className="line" d={getLinePath(points)} />
    <Marks
      points={points}
      getMark={([, , , x, y]) => (
        <circle className="point" cx={x} cy={y} r={5} />
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
