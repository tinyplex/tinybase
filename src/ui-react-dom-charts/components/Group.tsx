import {useState} from '../../common/react.ts';
import type {
  ChartBounds,
  ChartKind,
  ChartScaledPoint,
  ChartTicks,
} from '../common/data.ts';
import {getPlotFrame} from '../common/svg.ts';
import type {ChartLayout} from '../common/types.ts';
import {Axes} from './Axes.tsx';
import {Bars} from './Bars.tsx';
import {Grid} from './Grid.tsx';
import {Line} from './Line.tsx';
import {Tooltip} from './Tooltip.tsx';
import {XAxis} from './XAxis.tsx';
import {YAxis} from './YAxis.tsx';

export const Group = ({
  className,
  kind,
  points,
  bounds: [xMin, xMax, yMin, yMax],
  xLabel,
  yLabel,
  xTicks,
  yTicks,
  chartLayout: [svgRef, chartSize, chartStyle],
}: {
  readonly className: string | undefined;
  readonly kind: ChartKind;
  readonly points: ChartScaledPoint[];
  readonly bounds: ChartBounds;
  readonly xLabel: string;
  readonly yLabel: string;
  readonly xTicks: ChartTicks;
  readonly yTicks: ChartTicks;
  readonly chartLayout: ChartLayout;
}) => {
  const [width, height] = chartSize;
  const plotFrame = getPlotFrame(chartSize, chartStyle);
  const [, , plotWidth, plotHeight] = plotFrame;
  const [tickSize, tickGap, axisLabelGap, barRatio, , , inset, fontSize] =
    chartStyle;
  const [tooltipPoint, setTooltipPoint] = useState<
    ChartScaledPoint | undefined
  >();

  return (
    <svg
      className={className}
      data-chart={kind}
      preserveAspectRatio="none"
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
    >
      <YAxis
        yTicks={yTicks}
        yMin={yMin}
        yMax={yMax}
        yLabel={yLabel}
        plotFrame={plotFrame}
        tickSize={tickSize}
        tickGap={tickGap}
        inset={inset}
      />
      <XAxis
        points={points}
        xTicks={xTicks}
        xMin={xMin}
        xMax={xMax}
        xLabel={xLabel}
        plotFrame={plotFrame}
        tickSize={tickSize}
        tickGap={tickGap}
        axisLabelGap={axisLabelGap}
        fontSize={fontSize}
      />
      <g
        className="plot"
        transform={`translate(${plotFrame[0]} ${plotFrame[1]})`}
      >
        <Grid
          points={points}
          xTicks={xTicks}
          xMin={xMin}
          xMax={xMax}
          yTicks={yTicks}
          yMin={yMin}
          yMax={yMax}
          plotFrame={plotFrame}
          tickSize={tickSize}
        />
        <Axes plotFrame={plotFrame} />
        <g
          className={kind}
          data-x-max={xMax}
          data-x-min={xMin}
          data-y-max={yMax}
          data-y-min={yMin}
        >
          {kind == 'line' ? (
            <Line points={points} setTooltipPoint={setTooltipPoint} />
          ) : (
            <Bars
              points={points}
              plotFrame={plotFrame}
              barRatio={barRatio}
              setTooltipPoint={setTooltipPoint}
              yMin={yMin}
              yMax={yMax}
            />
          )}
        </g>
        <Tooltip
          point={tooltipPoint}
          width={plotWidth}
          height={plotHeight}
          xLabel={xLabel}
          yLabel={yLabel}
        />
      </g>
    </svg>
  );
};
