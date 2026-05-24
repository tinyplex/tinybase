import type {ReactNode, RefObject} from 'react';
import {arrayIsEmpty, arrayJoin, arrayMap} from '../../common/array.ts';
import {isFiniteNumber, mathMax, mathMin, size} from '../../common/other.ts';
import {useLayoutEffect, useRef, useState} from '../../common/react.ts';
import {
  getChartScale,
  getYDomain,
  type ChartBounds,
  type ChartKind,
  type ChartScaledPoint,
  type ChartSize,
  type ChartStyle,
} from './data.ts';

type ChartLayout = readonly [
  svgRef: RefObject<SVGSVGElement | null>,
  chartSize: ChartSize,
  chartStyle: ChartStyle,
];

type PlotFrame = readonly [x: number, y: number, width: number, height: number];

const DEFAULT_CHART_SIZE: ChartSize = [1000, 1000];
const DEFAULT_CHART_FONT_SIZE = 12;
const DEFAULT_CHART_STYLE: ChartStyle = [0.5, 0.5, 1, 2, 4, 1];

export const getChartGroup = (
  className: string | undefined,
  kind: ChartKind,
  points: ChartScaledPoint[],
  [xMin, xMax, yMin, yMax]: ChartBounds,
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
      {getChartYAxis(yMin, yMax, plotFrame, chartStyle)}
      {getChartXAxis(points, plotFrame, chartStyle)}
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
            : getChartBars(points, plotFrame, chartStyle)}
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

const getPlotFrame = (
  [width, height]: ChartSize,
  [, , , xAxisHeight, yAxisWidth, inset]: ChartStyle,
): PlotFrame => [
  inset + yAxisWidth,
  inset,
  mathMax(width - yAxisWidth - 2 * inset, 0),
  mathMax(height - xAxisHeight - 2 * inset, 0),
];

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
  [, , barRatio]: ChartStyle,
) => {
  const baselineY = height - getChartScale(0, ...getYDomain(points), height);
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
        height={Math.abs(baselineY - pointY)}
      />
    );
  });
};

const getChartXAxis = (
  points: ChartScaledPoint[],
  [plotX, plotY, plotWidth, plotHeight]: PlotFrame,
  [tickSize, tickGap]: ChartStyle,
) => (
  <g className="x-axis axis">
    <line
      className="axis-line x-axis-line"
      x1={plotX}
      x2={plotX + plotWidth}
      y1={plotY + plotHeight}
      y2={plotY + plotHeight}
    />
    {getChartMarks(points, ([, xValue, , x]) => (
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
    ))}
  </g>
);

const getChartYAxis = (
  yMin: number | undefined,
  yMax: number | undefined,
  plotFrame: PlotFrame,
  chartStyle: ChartStyle,
) =>
  yMin == null || yMax == null ? null : (
    <g className="y-axis axis">
      {getChartYTick(yMin, plotFrame, chartStyle, plotFrame[3])}
      {yMax == yMin ? null : getChartYTick(yMax, plotFrame, chartStyle, 0)}
      <line
        className="axis-line y-axis-line"
        x1={plotFrame[0]}
        x2={plotFrame[0]}
        y1={plotFrame[1]}
        y2={plotFrame[1] + plotFrame[3]}
      />
    </g>
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
  getMark: (point: ChartScaledPoint) => ReactNode,
) =>
  arrayMap(points, (point) => {
    const [rowId, xValue, yValue] = point;
    return (
      <g
        key={rowId}
        data-row-id={rowId}
        data-x-value={xValue}
        data-y-value={yValue}
      >
        {getMark(point)}
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
  DEFAULT_CHART_STYLE[2],
  fontSize * DEFAULT_CHART_STYLE[3],
  fontSize * DEFAULT_CHART_STYLE[4],
  fontSize * DEFAULT_CHART_STYLE[5],
];

const getChartStyle = (style: CSSStyleDeclaration | undefined): ChartStyle => {
  const fontSize = parseFloat(style?.fontSize ?? '');
  return getDefaultChartStyle(
    isFiniteNumber(fontSize) ? fontSize : DEFAULT_CHART_FONT_SIZE,
  );
};

const getSvgSize = ({width, height}: DOMRectReadOnly): ChartSize => [
  Math.round(width) || DEFAULT_CHART_SIZE[0],
  Math.round(height) || DEFAULT_CHART_SIZE[1],
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
    barWidth1,
    xAxisHeight1,
    yAxisWidth1,
    inset1,
  ]: ChartStyle,
  [
    tickSize2,
    tickGap2,
    barWidth2,
    xAxisHeight2,
    yAxisWidth2,
    inset2,
  ]: ChartStyle,
) =>
  tickSize1 == tickSize2 &&
  tickGap1 == tickGap2 &&
  barWidth1 == barWidth2 &&
  xAxisHeight1 == xAxisHeight2 &&
  yAxisWidth1 == yAxisWidth2 &&
  inset1 == inset2;
