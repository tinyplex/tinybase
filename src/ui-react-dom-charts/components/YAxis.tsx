import {arrayMap} from '../../common/array.ts';
import {isNullish, string} from '../../common/other.ts';
import {getScale} from '../common/data.ts';
import {CURRENT_COLOR} from '../common/strings.ts';
import type {PlotFrame, Ticks} from '../common/types.ts';

export const YAxis = ({
  className,
  tickFormatter,
  yTicks,
  yMin,
  yMax,
  yTitle,
  plotFrame,
  tickSize,
  tickGap,
  axisWidth,
}: {
  readonly className?: string;
  readonly tickFormatter?: (tick: number) => string;
  readonly yTicks: Ticks;
  readonly yMin: number | undefined;
  readonly yMax: number | undefined;
  readonly yTitle: string;
  readonly plotFrame: PlotFrame;
  readonly tickSize: number;
  readonly tickGap: number;
  readonly axisWidth: number;
}) => {
  const [plotX, plotY, , plotHeight] = plotFrame;
  return isNullish(yMin) || isNullish(yMax) ? null : (
    <g className={getAxisClassName('y', className)}>
      <path
        className="line"
        d={`M${plotX},${plotY}v${plotHeight}`}
        fill="none"
        stroke={CURRENT_COLOR}
        strokeOpacity={0.5}
        strokeWidth={1}
      />
      <g className="ticks" dominantBaseline="middle" textAnchor="end">
        {arrayMap(yTicks, (tick) => {
          const y = plotHeight - getScale(tick, yMin, yMax, plotHeight);
          return (
            <text key={tick} x={plotX - tickSize - tickGap} y={plotY + y}>
              {tickFormatter?.(tick) ?? string(tick)}
            </text>
          );
        })}
      </g>
      <text
        className="title"
        dominantBaseline="text-before-edge"
        textAnchor="middle"
        transform={`translate(${plotX - axisWidth} ${
          plotFrame[1] + plotFrame[3] / 2
        }) rotate(-90)`}
      >
        {yTitle}
      </text>
    </g>
  );
};

const getAxisClassName = (baseClassName: string, className?: string) =>
  isNullish(className) ? baseClassName : `${baseClassName} ${className}`;
