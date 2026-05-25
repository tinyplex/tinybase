import {arrayMap} from '../../common/array.ts';
import {isNullish} from '../../common/other.ts';
import {getChartScale, type ChartTicks} from '../common/data.ts';
import type {PlotFrame} from '../common/types.ts';

export const YAxis = ({
  yTicks,
  yMin,
  yMax,
  yLabel,
  plotFrame,
  tickSize,
  tickGap,
  inset,
}: {
  readonly yTicks: ChartTicks;
  readonly yMin: number | undefined;
  readonly yMax: number | undefined;
  readonly yLabel: string;
  readonly plotFrame: PlotFrame;
  readonly tickSize: number;
  readonly tickGap: number;
  readonly inset: number;
}) =>
  isNullish(yMin) || isNullish(yMax) ? null : (
    <g className="y-axis">
      {arrayMap(yTicks, (tick) => {
        const [plotX, plotY, , plotHeight] = plotFrame;
        const y = plotHeight - getChartScale(tick, yMin, yMax, plotHeight);
        return (
          <text
            className="tick-label"
            dominantBaseline="middle"
            key={tick}
            textAnchor="end"
            x={plotX - tickSize - tickGap}
            y={plotY + y}
          >
            {tick}
          </text>
        );
      })}
      <text
        className="y-axis-label"
        dominantBaseline="text-before-edge"
        textAnchor="middle"
        transform={`translate(${inset} ${
          plotFrame[1] + plotFrame[3] / 2
        }) rotate(-90)`}
      >
        {yLabel}
      </text>
    </g>
  );
