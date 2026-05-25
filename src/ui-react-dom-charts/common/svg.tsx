import type {ReactNode, RefObject} from 'react';
import {arrayIsEmpty, arrayJoin, arrayMap} from '../../common/array.ts';
import {
  isFiniteNumber,
  isNumber,
  mathAbs,
  mathMax,
  mathMin,
  mathRound,
  size,
} from '../../common/other.ts';
import {useLayoutEffect, useRef, useState} from '../../common/react.ts';
import {
  getChartScale,
  type ChartBounds,
  type ChartKind,
  type ChartScaledPoint,
  type ChartSize,
  type ChartStyle,
  type ChartTicks,
} from './data.ts';

type ChartLayout = readonly [
  svgRef: RefObject<SVGSVGElement | null>,
  chartSize: ChartSize,
  chartStyle: ChartStyle,
];

type PlotFrame = readonly [x: number, y: number, width: number, height: number];

const DEFAULT_CHART_SIZE: ChartSize = [1000, 1000];
const DEFAULT_CHART_FONT_SIZE = 12;
const DEFAULT_CHART_STYLE: ChartStyle = [0.5, 0.5, 0.5, 1, 3.5, 4, 1, 1];

export const getChartGroup = (
  className: string | undefined,
  kind: ChartKind,
  points: ChartScaledPoint[],
  [xMin, xMax, yMin, yMax]: ChartBounds,
  xLabel: string,
  yLabel: string,
  xTicks: ChartTicks,
  yTicks: ChartTicks,
  [svgRef, chartSize, chartStyle]: ChartLayout,
) => {
  const [width, height] = chartSize;
  const plotFrame = getPlotFrame(chartSize, chartStyle);

  return (
    <svg
      className={className}
      data-chart={kind}
      preserveAspectRatio="none"
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
    >
      {getChartYAxis(yTicks, yMin, yMax, yLabel, plotFrame, chartStyle)}
      {getChartXAxis(points, xTicks, xMin, xMax, xLabel, plotFrame, chartStyle)}
      <g
        className="plot"
        transform={`translate(${plotFrame[0]} ${plotFrame[1]})`}
      >
        <g
          className={kind}
          data-x-max={xMax}
          data-x-min={xMin}
          data-y-max={yMax}
          data-y-min={yMin}
        >
          {kind == 'line'
            ? getChartLine(points)
            : getChartBars(points, plotFrame, chartStyle, yMin, yMax)}
        </g>
      </g>
    </svg>
  );
};

export const useChartLayout = (): ChartLayout => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [chartLayout, setChartLayout] = useState<
    readonly [ChartSize, ChartStyle]
  >([DEFAULT_CHART_SIZE, getDefaultChartStyle(DEFAULT_CHART_FONT_SIZE)]);

  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (svg == null) {
      return;
    }

    const updateLayout = ({contentRect}: ResizeObserverEntry) => {
      const style = svg.ownerDocument.defaultView?.getComputedStyle(svg);
      const nextLayout = [
        getSvgSize(contentRect),
        getChartStyle(style),
      ] as const;
      setChartLayout((chartLayout) =>
        isChartLayoutEqual(chartLayout, nextLayout) ? chartLayout : nextLayout,
      );
    };

    const observer = new ResizeObserver(([entry]) => updateLayout(entry));
    observer.observe(svg);

    return () => observer.disconnect();
  }, []);

  return [svgRef, ...chartLayout];
};

export const getChartPlotSize = ([, chartSize, chartStyle]: ChartLayout) => {
  const [, , width, height] = getPlotFrame(chartSize, chartStyle);
  return [width, height] as const;
};

export const getChartLabelSize = ([, , chartStyle]: ChartLayout) =>
  chartStyle[7];

const getPlotFrame = (
  [width, height]: ChartSize,
  [, , , , xAxisHeight, yAxisWidth, inset, fontSize]: ChartStyle,
): PlotFrame => {
  const plotX = inset + mathMax(mathMin(yAxisWidth, width / 2 - 2 * inset), 0);
  const plotY = inset + fontSize / 2;
  const plotRight = inset + fontSize / 2;
  const plotHeight = mathMax(
    height -
      plotY -
      mathMax(mathMin(xAxisHeight, height / 2 - plotY - inset), 0) -
      inset,
    0,
  );

  return [
    plotX,
    plotY,
    mathMax(width - plotX - plotRight, 0),
    plotHeight,
  ];
};

const getChartLine = (points: ChartScaledPoint[]) => (
  <>
    <path className="line" d={getChartLinePath(points)} />
    {getChartMarks(points, ([, , , x, y]) => (
      <circle className="point" cx={x} cy={y} r={5} />
    ))}
  </>
);

const getChartBars = (
  points: ChartScaledPoint[],
  [, , width, height]: PlotFrame,
  [, , , barRatio]: ChartStyle,
  yMin = 0,
  yMax = 0,
) => {
  const baselineY = height - getChartScale(0, yMin, yMax, height);
  const pointsSize = size(points);
  const barWidth = arrayIsEmpty(points) ? 0 : (barRatio * width) / pointsSize;

  return getChartMarks(points, ([, , , x, pointY]) => {
    const y = mathMin(pointY, baselineY);
    return (
      <rect
        className="bar"
        x={x - barWidth / 2}
        y={y}
        width={barWidth}
        height={mathAbs(baselineY - pointY)}
      />
    );
  });
};

const getChartXAxis = (
  points: ChartScaledPoint[],
  xTicks: ChartTicks,
  xMin: number | string | undefined,
  xMax: number | string | undefined,
  xLabel: string,
  [plotX, plotY, plotWidth, plotHeight]: PlotFrame,
  [tickSize, tickGap, axisLabelGap, , , , , fontSize]: ChartStyle,
) => (
  <g className="x-axis axis">
    <line
      className="axis-line x-axis-line"
      x1={plotX}
      x2={plotX + plotWidth}
      y1={plotY + plotHeight}
      y2={plotY + plotHeight}
    />
    {arrayIsEmpty(xTicks) || !isNumber(xMin) || !isNumber(xMax)
      ? getChartMarks(points, ([, xValue, , x]) => (
          <g className="tick x-tick" data-value={xValue}>
            <line
              className="tick-line"
              x1={plotX + x}
              x2={plotX + x}
              y1={plotY + plotHeight}
              y2={plotY + plotHeight + tickSize}
            />
            <text
              className="tick-label"
              dominantBaseline="hanging"
              textAnchor="middle"
              x={plotX + x}
              y={plotY + plotHeight + tickSize + tickGap}
            >
              {xValue}
            </text>
          </g>
        ))
      : arrayMap(xTicks, (tick) => {
          const x = getChartScale(tick, xMin, xMax, plotWidth);
          return (
            <g className="tick x-tick" data-value={tick} key={tick}>
              <line
                className="tick-line"
                x1={plotX + x}
                x2={plotX + x}
                y1={plotY + plotHeight}
                y2={plotY + plotHeight + tickSize}
              />
              <text
                className="tick-label"
                dominantBaseline="hanging"
                textAnchor="middle"
                x={plotX + x}
                y={plotY + plotHeight + tickSize + tickGap}
              >
                {tick}
              </text>
            </g>
          );
        })}
    <text
      className="axis-label x-axis-label"
      dominantBaseline="hanging"
      textAnchor="middle"
      x={plotX + plotWidth / 2}
      y={
        plotY +
        plotHeight +
        tickSize +
        tickGap +
        fontSize +
        axisLabelGap
      }
    >
      {xLabel}
    </text>
  </g>
);

const getChartYAxis = (
  yTicks: ChartTicks,
  yMin: number | undefined,
  yMax: number | undefined,
  yLabel: string,
  plotFrame: PlotFrame,
  chartStyle: ChartStyle,
) =>
  yMin == null || yMax == null ? null : (
    <g className="y-axis axis">
      {arrayMap(yTicks, (tick) =>
        getChartYTick(
          tick,
          plotFrame,
          chartStyle,
          plotFrame[3] - getChartScale(tick, yMin, yMax, plotFrame[3]),
        ),
      )}
      <line
        className="axis-line y-axis-line"
        x1={plotFrame[0]}
        x2={plotFrame[0]}
        y1={plotFrame[1]}
        y2={plotFrame[1] + plotFrame[3]}
      />
      {getChartYAxisLabel(yLabel, plotFrame, chartStyle)}
    </g>
  );

const getChartYAxisLabel = (
  value: string,
  [, plotY, , plotHeight]: PlotFrame,
  [, , , , , , inset]: ChartStyle,
) => (
  <text
    className="axis-label y-axis-label"
    dominantBaseline="text-before-edge"
    textAnchor="middle"
    transform={`translate(${inset} ${plotY + plotHeight / 2}) rotate(-90)`}
  >
    {value}
  </text>
);

const getChartYTick = (
  value: number,
  [plotX, plotY]: PlotFrame,
  [tickSize, tickGap]: ChartStyle,
  y: number,
) => (
  <g className="tick y-tick" data-value={value} key={value}>
    <line
      className="tick-line"
      x1={plotX - tickSize}
      x2={plotX}
      y1={plotY + y}
      y2={plotY + y}
    />
    <text
      className="tick-label"
      dominantBaseline="middle"
      textAnchor="end"
      x={plotX - tickSize - tickGap}
      y={plotY + y}
    >
      {value}
    </text>
  </g>
);

const getChartMarks = (
  points: ChartScaledPoint[],
  getMark: (point: ChartScaledPoint, index: number) => ReactNode,
) =>
  arrayMap(points, (point, index) => {
    const [rowId, xValue, yValue] = point;
    return (
      <g
        key={rowId}
        data-row-id={rowId}
        data-x-value={xValue}
        data-y-value={yValue}
      >
        {getMark(point, index)}
      </g>
    );
  });

const getChartLinePath = (points: ChartScaledPoint[]) =>
  arrayJoin(
    arrayMap(
      points,
      ([, , , x, y], index) => `${index == 0 ? 'M' : 'L'}${x},${y}`,
    ),
    ' ',
  );

const getDefaultChartStyle = (fontSize: number): ChartStyle => [
  fontSize * DEFAULT_CHART_STYLE[0],
  fontSize * DEFAULT_CHART_STYLE[1],
  fontSize * DEFAULT_CHART_STYLE[2],
  DEFAULT_CHART_STYLE[3],
  fontSize * DEFAULT_CHART_STYLE[4],
  fontSize * DEFAULT_CHART_STYLE[5],
  fontSize * DEFAULT_CHART_STYLE[6],
  fontSize * DEFAULT_CHART_STYLE[7],
];

const getChartStyle = (style: CSSStyleDeclaration | undefined): ChartStyle => {
  const fontSize = parseFloat(style?.fontSize ?? '');
  return getDefaultChartStyle(
    isFiniteNumber(fontSize) ? fontSize : DEFAULT_CHART_FONT_SIZE,
  );
};

const getSvgSize = ({width, height}: DOMRectReadOnly): ChartSize => [
  mathRound(width) || DEFAULT_CHART_SIZE[0],
  mathRound(height) || DEFAULT_CHART_SIZE[1],
];

const isChartLayoutEqual = (
  [chartSize1, chartStyle1]: readonly [ChartSize, ChartStyle],
  [chartSize2, chartStyle2]: readonly [ChartSize, ChartStyle],
) =>
  isChartSizeEqual(chartSize1, chartSize2) &&
  isChartStyleEqual(chartStyle1, chartStyle2);

const isChartSizeEqual = (
  [width1, height1]: ChartSize,
  [width2, height2]: ChartSize,
) => width1 == width2 && height1 == height2;

const isChartStyleEqual = (
  [
    tickSize1,
    tickGap1,
    axisLabelGap1,
    barWidth1,
    xAxisHeight1,
    yAxisWidth1,
    inset1,
    fontSize1,
  ]: ChartStyle,
  [
    tickSize2,
    tickGap2,
    axisLabelGap2,
    barWidth2,
    xAxisHeight2,
    yAxisWidth2,
    inset2,
    fontSize2,
  ]: ChartStyle,
) =>
  tickSize1 == tickSize2 &&
  tickGap1 == tickGap2 &&
  axisLabelGap1 == axisLabelGap2 &&
  barWidth1 == barWidth2 &&
  xAxisHeight1 == xAxisHeight2 &&
  yAxisWidth1 == yAxisWidth2 &&
  inset1 == inset2 &&
  fontSize1 == fontSize2;
