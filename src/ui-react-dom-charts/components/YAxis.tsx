import {arrayMap} from '../../common/array.ts';
import {isNullish} from '../../common/other.ts';
import {getScale} from '../common/data.ts';
import type {PlotFrame, Ticks} from '../common/types.ts';

export const YAxis = ({
  yTicks,
  yMin,
  yMax,
  yTitle,
  plotFrame,
  tickSize,
  tickGap,
  inset,
}: {
  readonly yTicks: Ticks;
  readonly yMin: number | undefined;
  readonly yMax: number | undefined;
  readonly yTitle: string;
  readonly plotFrame: PlotFrame;
  readonly tickSize: number;
  readonly tickGap: number;
  readonly inset: number;
}) => {
  const [plotX, plotY, , plotHeight] = plotFrame;
  return isNullish(yMin) || isNullish(yMax) ? null : (
    <g className="y">
      <path
        className="line"
        d={`M${plotX},${plotY}v${plotHeight}`}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.5}
        strokeWidth={1}
      />
      <g className="ticks" dominantBaseline="middle" textAnchor="end">
        {arrayMap(yTicks, (tick) => {
          const y = plotHeight - getScale(tick, yMin, yMax, plotHeight);
          return (
            <text key={tick} x={plotX - tickSize - tickGap} y={plotY + y}>
              {tick}
            </text>
          );
        })}
      </g>
      <text
        className="title"
        dominantBaseline="text-before-edge"
        textAnchor="middle"
        transform={`translate(${inset} ${
          plotFrame[1] + plotFrame[3] / 2
        }) rotate(-90)`}
      >
        {yTitle}
      </text>
    </g>
  );
};
