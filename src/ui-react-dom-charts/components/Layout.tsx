import {useState} from '../../common/react.ts';
import {getPlotFrame} from '../common/svg.ts';
import type {
  Bounds,
  Kind,
  RefAndLayout,
  ScaledPoint,
  Ticks,
} from '../common/types.ts';
import {Axes} from './Axes.tsx';
import {Grid} from './Grid.tsx';
import {Plot} from './Plot.tsx';
import {Tooltip} from './Tooltip.tsx';

export const Layout = ({
  className,
  kind,
  titles,
  layout: [svgRef, chartSize, chartStyle],
  ...sharedProps
}: {
  readonly className: string | undefined;
  readonly kind: Kind;
  readonly titles: readonly [xTitle: string, yTitle: string];
  readonly layout: RefAndLayout;
  readonly points: ScaledPoint[];
  readonly bounds: Bounds;
  readonly xTicks: Ticks;
  readonly yTicks: Ticks;
}) => {
  const [width, height] = chartSize;
  const plotFrame = getPlotFrame(chartSize, chartStyle);
  const [, , plotWidth, plotHeight] = plotFrame;
  const [tickSize, tickGap, barGap, xAxisHeight, , inset, fontSize] =
    chartStyle;
  const [tooltipPoint, setTooltipPoint] = useState<ScaledPoint | undefined>();
  const chartProps = {...sharedProps, plotFrame};

  return (
    <svg
      className={className}
      preserveAspectRatio="none"
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
    >
      <Grid {...chartProps} tickSize={tickSize} />
      <Axes
        {...chartProps}
        titles={titles}
        tickSize={tickSize}
        tickGap={tickGap}
        xAxisHeight={xAxisHeight}
        inset={inset}
        fontSize={fontSize}
      />
      <Plot
        {...chartProps}
        kind={kind}
        barGap={barGap}
        setTooltipPoint={setTooltipPoint}
      />
      <Tooltip
        point={tooltipPoint}
        width={plotWidth}
        height={plotHeight}
        plotFrame={plotFrame}
        titles={titles}
      />
    </svg>
  );
};
