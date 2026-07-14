import {arrayMap} from '../../common/array.ts';
import {
  dateNew,
  isEmpty,
  isNullish,
  isNumber,
  mathMax,
  string,
} from '../../common/other.ts';
import {getScale, normalizeTimeValue} from '../common/data.ts';
import {CURRENT_COLOR, MILLISECOND, TIME} from '../common/strings.ts';
import {
  type PlotFrame,
  type ScaledPoint,
  type Ticks,
  type TimestampUnit,
  type XScale,
  type XValue,
} from '../common/types.ts';
import {getTimeTickLabel} from '../common/wilkinson.ts';

type TickFormatter = (tick: any, timestamp: any) => string;

export const XAxis = ({
  className,
  points,
  tickFormatter,
  xTicks,
  xMin,
  xMax,
  xTitle,
  plotFrame,
  tickSize,
  tickGap,
  axisHeight,
  fontSize,
  timestampUnit,
  xScale,
}: {
  readonly className?: string;
  readonly points: ScaledPoint[];
  readonly tickFormatter?: TickFormatter;
  readonly xTicks: Ticks;
  readonly xMin: boolean | number | string | undefined;
  readonly xMax: boolean | number | string | undefined;
  readonly xTitle: string;
  readonly plotFrame: PlotFrame;
  readonly tickSize: number;
  readonly tickGap: number;
  readonly axisHeight: number;
  readonly fontSize: number;
  readonly timestampUnit: TimestampUnit;
  readonly xScale: XScale;
}) => {
  const [plotX, plotY, plotWidth, plotHeight] = plotFrame;
  const titleGap = mathMax(axisHeight - tickSize - tickGap - 2 * fontSize, 0);
  return (
    <g
      className={isNullish(className) ? 'x' : `x ${className}`}
      dominantBaseline="hanging"
      textAnchor="middle"
    >
      <path
        className="line"
        d={`M${plotX},${plotY + plotHeight}h${plotWidth}`}
        fill="none"
        stroke={CURRENT_COLOR}
        strokeOpacity={0.5}
        strokeWidth={1}
      />
      <g className="ticks">
        {isEmpty(xTicks) || !isNumber(xMin) || !isNumber(xMax)
          ? arrayMap(points, ([rowId, xValue, , x]) => (
              <text
                key={rowId}
                x={plotX + x}
                y={plotY + plotHeight + tickSize + tickGap}
              >
                {getTickLabel(xValue, tickFormatter, xScale, timestampUnit)}
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
                  {getTickLabel(
                    tick,
                    tickFormatter,
                    xScale,
                    MILLISECOND,
                    xTicks,
                  )}
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

const getTickLabel = (
  tick: XValue | Date,
  tickFormatter: TickFormatter | undefined,
  xScale: XScale,
  timestampUnit: TimestampUnit,
  ticks: Ticks = [],
) => {
  const timestamp =
    xScale == TIME ? normalizeTimeValue(tick, timestampUnit) : undefined;
  return isNumber(timestamp)
    ? (tickFormatter?.(dateNew(timestamp), timestamp) ??
        getTimeTickLabel(timestamp, ticks))
    : (tickFormatter?.(tick, undefined) ?? string(tick));
};
