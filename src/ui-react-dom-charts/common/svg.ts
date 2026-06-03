import {arrayIsEqual, arrayMap} from '../../common/array.ts';
import {
  isFiniteNumber,
  isNull,
  mathMax,
  mathMin,
  mathRound,
} from '../../common/other.ts';
import {useLayoutEffect, useRef, useState} from '../../common/react.ts';
import type {PlotFrame, RefAndLayout, Size, Style} from './types.ts';

const DEFAULT_SIZE: Size = [1000, 1000];
const DEFAULT_FONT_SIZE = 12;
const DEFAULT_STYLE: Style = [0.5, 0.5, 0.25, 3.5, 4, 1, 1];

export const useLayout = (): RefAndLayout => {
  const svgRef = useRef<SVGSVGElement>(null);
  const chartLayoutRef = useRef<readonly [Size, Style]>([
    DEFAULT_SIZE,
    getDefaultStyle(DEFAULT_FONT_SIZE),
  ]);
  const [chartLayout, setChartLayout] = useState<readonly [Size, Style]>([
    DEFAULT_SIZE,
    getDefaultStyle(DEFAULT_FONT_SIZE),
  ]);

  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (isNull(svg)) {
      return;
    }

    const updateLayout = ({contentRect}: ResizeObserverEntry) => {
      const style = svg.ownerDocument.defaultView?.getComputedStyle(svg);
      const nextLayout = [getSvgSize(contentRect), getStyle(style)] as const;
      if (!isLayoutEqual(chartLayoutRef.current, nextLayout)) {
        chartLayoutRef.current = nextLayout;
        setChartLayout(nextLayout);
      }
    };

    const observer = new ResizeObserver(([entry]) => updateLayout(entry));
    observer.observe(svg);

    return () => observer.disconnect();
  }, []);

  return [svgRef, ...chartLayout];
};

export const getPlotSize = ([, chartSize, chartStyle]: RefAndLayout) => {
  const [, , width, height] = getPlotFrame(chartSize, chartStyle);
  return [width, height] as const;
};

export const getLabelSize = ([, , chartStyle]: RefAndLayout) => chartStyle[6];

export const getPlotFrame = (
  [width, height]: Size,
  [, , , xAxisHeight, yAxisWidth, inset, fontSize]: Style,
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

const getDefaultStyle = (fontSize: number): Style =>
  arrayMap(DEFAULT_STYLE, (value) => value * fontSize) as unknown as Style;

const getStyle = (style: CSSStyleDeclaration | undefined): Style => {
  const fontSize = parseFloat(style?.fontSize ?? '');
  return getDefaultStyle(
    isFiniteNumber(fontSize) ? fontSize : DEFAULT_FONT_SIZE,
  );
};

const getSvgSize = ({width, height}: DOMRectReadOnly): Size => [
  mathRound(width) || DEFAULT_SIZE[0],
  mathRound(height) || DEFAULT_SIZE[1],
];

const isLayoutEqual = (
  [chartSize1, chartStyle1]: readonly [Size, Style],
  [chartSize2, chartStyle2]: readonly [Size, Style],
) =>
  arrayIsEqual(chartSize1, chartSize2) &&
  arrayIsEqual(chartStyle1, chartStyle2);
