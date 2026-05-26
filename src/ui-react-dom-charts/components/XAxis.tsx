import {arrayIsEmpty, arrayMap} from '../../common/array.ts';
import {isNumber, mathMax} from '../../common/other.ts';
import {getScale} from '../common/data.ts';
import type {PlotFrame, ScaledPoint, Ticks} from '../common/types.ts';

export const XAxis = ({
  points,
  xTicks,
  xMin,
  xMax,
  xTitle,
  plotFrame,
  tickSize,
  tickGap,
  axisHeight,
  fontSize,
}: {
  readonly points: ScaledPoint[];
  readonly xTicks: Ticks;
  readonly xMin: number | string | undefined;
  readonly xMax: number | string | undefined;
  readonly xTitle: string;
  readonly plotFrame: PlotFrame;
  readonly tickSize: number;
  readonly tickGap: number;
  readonly axisHeight: number;
  readonly fontSize: number;
}) => {
  const [plotX, plotY, plotWidth, plotHeight] = plotFrame;
  const titleGap = mathMax(axisHeight - tickSize - tickGap - 2 * fontSize, 0);
  return (
    <g className="x" dominantBaseline="hanging" textAnchor="middle">
      <path
        className="line"
        d={`M${plotX},${plotY + plotHeight}h${plotWidth}`}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.5}
        strokeWidth={1}
      />
      <g className="ticks">
        {arrayIsEmpty(xTicks) || !isNumber(xMin) || !isNumber(xMax)
          ? arrayMap(points, ([rowId, xValue, , x]) => (
              <text
                key={rowId}
                x={plotX + x}
                y={plotY + plotHeight + tickSize + tickGap}
              >
                {xValue}
              </text>
            ))
          : arrayMap(xTicks, (tick) => {
              const x = getScale(tick, xMin, xMax, plotWidth);
              return (
                <text
                  key={tick}
                  x={plotX + x}
                  y={plotY + plotHeight + tickSize + tickGap}
                >
                  {tick}
                </text>
              );
            })}
      </g>
      <text
        className="title"
        x={plotX + plotWidth / 2}
        y={plotY + plotHeight + tickSize + tickGap + fontSize + titleGap}
      >
        {xTitle}
      </text>
    </g>
  );
};
