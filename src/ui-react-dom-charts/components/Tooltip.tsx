import {isNullish, mathMax, mathMin} from '../../common/other.ts';
import type {ChartScaledPoint} from '../common/data.ts';

const TOOLTIP_WIDTH = 160;
const TOOLTIP_HEIGHT = 60;
const TOOLTIP_GAP = 12;
const TOOLTIP_PADDING = 12;

export const Tooltip = ({
  point,
  width,
  height,
  xLabel,
  yLabel,
}: {
  readonly point: ChartScaledPoint | undefined;
  readonly width: number;
  readonly height: number;
  readonly xLabel: string;
  readonly yLabel: string;
}) => {
  if (isNullish(point)) {
    return null;
  }

  const [, xValue, yValue, x, y] = point;
  const tooltipX =
    x + TOOLTIP_GAP + TOOLTIP_WIDTH > width
      ? x - TOOLTIP_GAP - TOOLTIP_WIDTH
      : x + TOOLTIP_GAP;
  const tooltipY = mathMax(
    mathMin(y - TOOLTIP_GAP - TOOLTIP_HEIGHT, height - TOOLTIP_HEIGHT),
    0,
  );

  return (
    <>
      <path
        className="x-tooltip-line"
        d={`M${x},0v${height}`}
        pointerEvents="none"
        stroke="currentColor"
        strokeOpacity={0.3}
        strokeWidth={1}
      />
      <path
        className="y-tooltip-line"
        d={`M0,${y}h${width}`}
        pointerEvents="none"
        stroke="currentColor"
        strokeOpacity={0.3}
        strokeWidth={1}
      />
      <g className="tooltip" transform={`translate(${tooltipX} ${tooltipY})`}>
        <rect
          fill="currentColor"
          fillOpacity={0.12}
          width={TOOLTIP_WIDTH}
          height={TOOLTIP_HEIGHT}
          rx={4}
        />
        <text fill="currentColor" x={TOOLTIP_PADDING} y={22}>
          {xLabel}: {xValue}
        </text>
        <text fill="currentColor" x={TOOLTIP_PADDING} y={46}>
          {yLabel}: {yValue}
        </text>
      </g>
    </>
  );
};
