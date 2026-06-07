import type {
  BarSeries as BarSeriesDecl,
  ChartSeriesProps,
} from '../@types/ui-react-dom-charts/index.d.ts';
import {useLayoutEffect} from '../common/react.ts';
import {CHART_SERIES, useCartesianChartContext} from './common/context.ts';
import {getScaledPoints, getSeriesSummary} from './common/data.ts';
import {CURRENT_COLOR} from './common/types.ts';
import {Bars} from './components/Bars.tsx';
import {getSeriesClassName, useSeriesData} from './components/series.ts';

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
  const {className, label, xCellId, yCellId} = props;
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
    label ?? yCellId,
  );

  useLayoutEffect(() => {
    setSeriesSummary(
      seriesId,
      getSeriesSummary('bar', rawPoints, xCellId, yCellId, label),
    );
  });

  useLayoutEffect(() => {
    registerBarSeries(seriesId);
    return () => releaseBarSeries(seriesId);
  }, [registerBarSeries, releaseBarSeries, seriesId]);

  return (
    <g
      className={getSeriesClassName('bar-series', className)}
      fill={CURRENT_COLOR}
    >
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
