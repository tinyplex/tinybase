import {arrayIsEmpty, arrayJoin, arrayMap} from '../../common/array.ts';
import {isNullish, isNumber} from '../../common/other.ts';
import {
  getChartScale,
  type ChartScaledPoint,
  type ChartTicks,
} from '../common/data.ts';
import type {PlotFrame} from '../common/types.ts';

export const Grid = ({
  points,
  xTicks,
  xMin,
  xMax,
  yTicks,
  yMin,
  yMax,
  plotFrame,
  tickSize,
}: {
  readonly points: ChartScaledPoint[];
  readonly xTicks: ChartTicks;
  readonly xMin: number | string | undefined;
  readonly xMax: number | string | undefined;
  readonly yTicks: ChartTicks;
  readonly yMin: number | undefined;
  readonly yMax: number | undefined;
  readonly plotFrame: PlotFrame;
  readonly tickSize: number;
}) => {
  const [, , width, height] = plotFrame;
  return (
    <g className="grid">
      {isNullish(yMin) || isNullish(yMax) ? null : (
        <path
          className="y-grid-line"
          d={arrayJoin(
            arrayMap(
              yTicks,
              (tick) =>
                `M${-tickSize},${
                  height - getChartScale(tick, yMin, yMax, height)
                }h${width + tickSize}`,
            ),
            ' ',
          )}
        />
      )}
      {arrayIsEmpty(xTicks) || !isNumber(xMin) || !isNumber(xMax) ? (
        <path
          className="x-grid-line"
          d={arrayJoin(
            arrayMap(points, ([, , , x]) => `M${x},0v${height + tickSize}`),
            ' ',
          )}
        />
      ) : (
        <path
          className="x-grid-line"
          d={arrayJoin(
            arrayMap(
              xTicks,
              (tick) =>
                `M${getChartScale(tick, xMin, xMax, width)},0v${
                  height + tickSize
                }`,
            ),
            ' ',
          )}
        />
      )}
    </g>
  );
};
