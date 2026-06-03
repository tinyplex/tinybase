import type {
  BarSeries as BarSeriesDecl,
  ChartSeriesProps,
} from '../@types/ui-react-dom-charts/index.d.ts';
import {useLayoutEffect} from '../common/react.ts';
import {CHART_SERIES, useCartesianChartContext} from './common/context.ts';
import {getScaledPoints, getSeriesSummary} from './common/data.ts';
import {Bars} from './components/Bars.tsx';
import {useSeriesData} from './components/series.ts';

export const BarSeries = ((props: ChartSeriesProps) => {
  const {
    barSeriesCount,
    bounds,
    getBarSeriesIndex,
    layout: [, , [, , barGap]],
    plotFrame,
    plotSize,
    registerBarSeries,
    releaseBarSeries,
    setSeriesSummary,
    setTooltipPoint,
    xValues,
  } = useCartesianChartContext();
  const {xCellId, yCellId} = props;
  const [seriesId, rawPoints] = useSeriesData(props);
  const barSeriesIndex = getBarSeriesIndex(seriesId);
  const [, , yMin, yMax] = bounds;
  const points = getScaledPoints(
    'bar',
    rawPoints,
    bounds,
    plotSize,
    xValues,
    xCellId,
    yCellId,
  );

  useLayoutEffect(() => {
    setSeriesSummary(
      seriesId,
      getSeriesSummary('bar', rawPoints, xCellId, yCellId),
    );
  });

  useLayoutEffect(() => {
    registerBarSeries(seriesId);
    return () => releaseBarSeries(seriesId);
  }, [registerBarSeries, releaseBarSeries, seriesId]);

  return (
    <g className="bar-series">
      <Bars
        barGap={barGap}
        barSeriesCount={barSeriesCount}
        barSeriesIndex={barSeriesIndex}
        plotFrame={plotFrame}
        points={points}
        setTooltipPoint={setTooltipPoint}
        yMax={yMax}
        yMin={yMin}
      />
    </g>
  );
}) as typeof BarSeriesDecl & {[CHART_SERIES]?: true};

BarSeries[CHART_SERIES] = true;
