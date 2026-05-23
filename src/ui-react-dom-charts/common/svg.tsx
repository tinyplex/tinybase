import type {ReactNode} from 'react';
import {arrayIsEmpty, arrayJoin, arrayMap} from '../../common/array.ts';
import {mathMin, size} from '../../common/other.ts';
import {useLayoutEffect, useRef, useState} from '../../common/react.ts';
import {
  getChartScale,
  getYDomain,
  type ChartBounds,
  type ChartKind,
  type ChartScaledPoint,
  type ChartSize,
} from './data.ts';

export const ChartSvg = ({
  children,
  className,
  kind,
}: {
  readonly children: (chartSize: ChartSize) => ReactNode;
  readonly className?: string;
  readonly kind: ChartKind;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const chartSize = useChartSize(svgRef);
  const [width, height] = chartSize;

  return (
    <svg
      className={className}
      data-chart={kind}
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
    >
      {children(chartSize)}
    </svg>
  );
};

export const getChartGroup = (
  kind: ChartKind,
  points: ChartScaledPoint[],
  [xMin, xMax, yMin, yMax]: ChartBounds,
  chartSize: ChartSize,
) => (
  <g
    className={kind}
    data-x-max={xMax}
    data-x-min={xMin}
    data-y-max={yMax}
    data-y-min={yMin}
  >
    {kind == 'line' ? getChartLine(points) : getChartBars(points, chartSize)}
  </g>
);

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
  [width, height]: ChartSize,
) => {
  const baselineY = height - getChartScale(0, ...getYDomain(points), height);
  const pointsSize = size(points);
  const barWidth = arrayIsEmpty(points) ? 0 : (0.8 * width) / pointsSize;

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

const useChartSize = (svgRef: {
  readonly current: SVGSVGElement | null;
}): ChartSize => {
  const [chartSize, setChartSize] = useState<ChartSize>([1000, 1000]);

  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (svg == null) {
      return;
    }

    const updateSize = () => {
      const width = Math.round(svg.clientWidth);
      const height = Math.round(svg.clientHeight);
      if (width > 0 && height > 0) {
        setChartSize((currentSize) =>
          currentSize[0] == width && currentSize[1] == height
            ? currentSize
            : [width, height],
        );
      }
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(svg);

    return () => observer.disconnect();
  }, [svgRef]);

  return chartSize;
};
