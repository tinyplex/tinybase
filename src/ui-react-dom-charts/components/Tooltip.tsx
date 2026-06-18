import {isNullish, mathMax, mathMin, string} from '../../common/other.ts';
import {CURRENT_COLOR} from '../common/strings.ts';
import type {PlotFrame, ScaledPoint} from '../common/types.ts';

const TOOLTIP_WIDTH = 160;
const TOOLTIP_HEIGHT = 60;
const TOOLTIP_GAP = 12;
const TOOLTIP_PADDING = 12;
const TOOLTIP_BACKGROUND = '#111827';
const TOOLTIP_TEXT = '#fff';

export const Tooltip = ({
  point,
  width,
  height,
  plotFrame,
  titles: [xTitle, yTitle],
}: {
  readonly point: ScaledPoint | undefined;
  readonly width: number;
  readonly height: number;
  readonly plotFrame: PlotFrame;
  readonly titles: readonly [xTitle: string, yTitle: string];
}) => {
  if (isNullish(point)) {
    return null;
  }

  const [, xValue, yValue, x, y, pointXTitle, pointYTitle] = point;
  const [plotX, plotY] = plotFrame;
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
        className="tooltip-lines"
        pointerEvents="none"
        stroke={CURRENT_COLOR}
        strokeOpacity={0.25}
        strokeWidth={1}
        d={`M${plotX + x},${plotY}v${height}M${plotX},${plotY + y}h${width}`}
      />
      <g
        className="tooltip"
        transform={`translate(${plotX + tooltipX} ${plotY + tooltipY})`}
        fontFamily="sans-serif"
        fontWeight={600}
        pointerEvents="none"
      >
        <rect
          fill={TOOLTIP_BACKGROUND}
          fillOpacity={0.9}
          width={TOOLTIP_WIDTH}
          height={TOOLTIP_HEIGHT}
          rx={6}
        />
        <text fill={TOOLTIP_TEXT} x={TOOLTIP_PADDING} y={22}>
          {pointXTitle ?? xTitle}: {string(xValue)}
        </text>
        <text fill={TOOLTIP_TEXT} x={TOOLTIP_PADDING} y={46}>
          {pointYTitle ?? yTitle}: {yValue}
        </text>
      </g>
    </>
  );
};
