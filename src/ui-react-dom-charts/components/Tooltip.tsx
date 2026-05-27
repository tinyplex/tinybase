import {isNullish, mathMax, mathMin} from '../../common/other.ts';
import {
  CURRENT_COLOR,
  type PlotFrame,
  type ScaledPoint,
} from '../common/types.ts';

const TOOLTIP_WIDTH = 160;
const TOOLTIP_HEIGHT = 60;
const TOOLTIP_GAP = 12;
const TOOLTIP_PADDING = 12;

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

  const [, xValue, yValue, x, y] = point;
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
        fill={CURRENT_COLOR}
      >
        <rect
          fillOpacity={0.25}
          width={TOOLTIP_WIDTH}
          height={TOOLTIP_HEIGHT}
          rx={4}
        />
        <text x={TOOLTIP_PADDING} y={22}>
          {xTitle}: {xValue}
        </text>
        <text x={TOOLTIP_PADDING} y={46}>
          {yTitle}: {yValue}
        </text>
      </g>
    </>
  );
};
