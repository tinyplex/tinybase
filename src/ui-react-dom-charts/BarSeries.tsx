import type {
  BarSeries as BarSeriesDecl,
  ChartSeriesProps,
} from '../@types/ui-react-dom-charts/index.d.ts';
import {useLayoutEffect} from '../common/react.ts';
import {CHART_SERIES, useCartesianChartContext} from './common/context.ts';
import {Bars} from './components/Bars.tsx';
import {useSeries} from './components/series.ts';

export const BarSeries = ((props: ChartSeriesProps) => {
  const {
    barSeriesCount,
    bounds: [, , yMin, yMax],
    getBarSeriesIndex,
    layout: [, , [, , barGap]],
    plotFrame,
    registerBarSeries,
    releaseBarSeries,
    setTooltipPoint,
  } = useCartesianChartContext();
  const [seriesId, points] = useSeries('bar', props);
  const barSeriesIndex = getBarSeriesIndex(seriesId);

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
