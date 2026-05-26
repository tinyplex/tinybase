import type {ReactNode} from 'react';
import {arrayMap} from '../../common/array.ts';
import type {ScaledPoint, SetTooltipPoint} from '../common/types.ts';

export const Marks = ({
  getMark,
  points,
  setTooltipPoint,
}: {
  readonly getMark: (point: ScaledPoint, index: number) => ReactNode;
  readonly points: ScaledPoint[];
  readonly setTooltipPoint: SetTooltipPoint;
}) =>
  arrayMap(points, (point, index) => {
    const [rowId] = point;
    return (
      <g
        key={rowId}
        onPointerEnter={() => setTooltipPoint(point)}
        onPointerLeave={() => setTooltipPoint(undefined)}
      >
        {getMark(point, index)}
      </g>
    );
  });
