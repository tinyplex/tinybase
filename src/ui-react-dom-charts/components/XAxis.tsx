import {arrayIsEmpty, arrayMap} from '../../common/array.ts';
import {isNumber} from '../../common/other.ts';
import {
  getChartScale,
  type ChartScaledPoint,
  type ChartTicks,
} from '../common/data.ts';
import type {PlotFrame} from '../common/types.ts';

export const XAxis = ({
  points,
  xTicks,
  xMin,
  xMax,
  xLabel,
  plotFrame,
  tickSize,
  tickGap,
  axisLabelGap,
  fontSize,
}: {
  readonly points: ChartScaledPoint[];
  readonly xTicks: ChartTicks;
  readonly xMin: number | string | undefined;
  readonly xMax: number | string | undefined;
  readonly xLabel: string;
  readonly plotFrame: PlotFrame;
  readonly tickSize: number;
  readonly tickGap: number;
  readonly axisLabelGap: number;
  readonly fontSize: number;
}) => {
  const [plotX, plotY, plotWidth, plotHeight] = plotFrame;
  return (
    <g className="x-axis">
      {arrayIsEmpty(xTicks) || !isNumber(xMin) || !isNumber(xMax)
        ? arrayMap(points, ([rowId, xValue, , x]) => (
            <text
              className="tick-label"
              dominantBaseline="hanging"
              fill="currentColor"
              fillOpacity={0.75}
              key={rowId}
              textAnchor="middle"
              x={plotX + x}
              y={plotY + plotHeight + tickSize + tickGap}
            >
              {xValue}
            </text>
          ))
        : arrayMap(xTicks, (tick) => {
            const x = getChartScale(tick, xMin, xMax, plotWidth);
            return (
              <text
                className="tick-label"
                dominantBaseline="hanging"
                fill="currentColor"
                fillOpacity={0.75}
                key={tick}
                textAnchor="middle"
                x={plotX + x}
                y={plotY + plotHeight + tickSize + tickGap}
              >
                {tick}
              </text>
            );
          })}
      <text
        className="x-axis-label"
        dominantBaseline="hanging"
        fill="currentColor"
        fillOpacity={0.85}
        textAnchor="middle"
        x={plotX + plotWidth / 2}
        y={plotY + plotHeight + tickSize + tickGap + fontSize + axisLabelGap}
      >
        {xLabel}
      </text>
    </g>
  );
};
