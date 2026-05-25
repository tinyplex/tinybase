import {
  isFiniteNumber,
  isNull,
  mathMax,
  mathMin,
  mathRound,
} from '../../common/other.ts';
import {useLayoutEffect, useRef, useState} from '../../common/react.ts';
import type {ChartSize, ChartStyle} from './data.ts';
import type {ChartLayout, PlotFrame} from './types.ts';

const DEFAULT_CHART_SIZE: ChartSize = [1000, 1000];
const DEFAULT_CHART_FONT_SIZE = 12;
const DEFAULT_CHART_STYLE: ChartStyle = [0.5, 0.5, 0.5, 1, 3.5, 4, 1, 1];

export const useChartLayout = (): ChartLayout => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [chartLayout, setChartLayout] = useState<
    readonly [ChartSize, ChartStyle]
  >([DEFAULT_CHART_SIZE, getDefaultChartStyle(DEFAULT_CHART_FONT_SIZE)]);

  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (isNull(svg)) {
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

export const getPlotFrame = (
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

  return [plotX, plotY, mathMax(width - plotX - plotRight, 0), plotHeight];
};

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
