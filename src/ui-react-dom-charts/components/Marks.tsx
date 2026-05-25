import type {ReactNode} from 'react';
import {arrayMap} from '../../common/array.ts';
import type {ChartScaledPoint} from '../common/data.ts';
import type {SetTooltipPoint} from '../common/types.ts';

export const Marks = ({
  getMark,
  points,
  setTooltipPoint,
}: {
  readonly getMark: (point: ChartScaledPoint, index: number) => ReactNode;
  readonly points: ChartScaledPoint[];
  readonly setTooltipPoint: SetTooltipPoint;
}) =>
  arrayMap(points, (point, index) => {
    const [rowId, xValue, yValue] = point;
    return (
      <g
        key={rowId}
        onPointerEnter={() => setTooltipPoint(point)}
        onPointerLeave={() => setTooltipPoint(undefined)}
        data-row-id={rowId}
        data-x-value={xValue}
        data-y-value={yValue}
      >
        {getMark(point, index)}
      </g>
    );
  });
