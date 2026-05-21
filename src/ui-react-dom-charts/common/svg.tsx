import type {ReactNode} from 'react';
import {arrayIsEmpty, arrayJoin, arrayMap} from '../../common/array.ts';
import {mathMin, size} from '../../common/other.ts';
import {
  getChartScale,
  getYDomain,
  type ChartBounds,
  type ChartKind,
  type ChartScaledPoint,
} from './data.ts';

export const getChartGroup = (
  kind: ChartKind,
  points: ChartScaledPoint[],
  [xMin, xMax, yMin, yMax]: ChartBounds,
) => (
  <g
    className={kind}
    data-x-max={xMax}
    data-x-min={xMin}
    data-y-max={yMax}
    data-y-min={yMin}
  >
    {kind == 'line' ? getChartLine(points) : getChartBars(points)}
  </g>
);

const getChartLine = (points: ChartScaledPoint[]) => (
  <>
    <path className="line" d={getChartLinePath(points)} />
    {getChartMarks(points, ([, , , x, y]) => (
      <circle className="point" cx={x} cy={y} r={0.01} />
    ))}
  </>
);

const getChartBars = (points: ChartScaledPoint[]) => {
  const baselineY = 1 - getChartScale(0, ...getYDomain(points));
  const pointsSize = size(points);
  const width = arrayIsEmpty(points) ? 0 : 0.8 / pointsSize;

  return getChartMarks(points, ([, , , x, pointY]) => {
    const y = mathMin(pointY, baselineY);
    return (
      <rect
        className="bar"
        x={x - width / 2}
        y={y}
        width={width}
        height={Math.abs(baselineY - pointY)}
      />
    );
  });
};

const getChartMarks = (
  points: ChartScaledPoint[],
  getMark: (point: ChartScaledPoint) => ReactNode,
) =>
  arrayMap(points, (point) => {
    const [rowId, xValue, yValue] = point;
    return (
      <g
        key={rowId}
        data-row-id={rowId}
        data-x-value={xValue}
        data-y-value={yValue}
      >
        {getMark(point)}
      </g>
    );
  });

const getChartLinePath = (points: ChartScaledPoint[]) =>
  arrayJoin(
    arrayMap(
      points,
      ([, , , x, y], index) => `${index == 0 ? 'M' : 'L'}${x},${y}`,
    ),
    ' ',
  );
