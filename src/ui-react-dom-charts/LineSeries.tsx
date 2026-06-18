import type {
  LineSeries as LineSeriesDecl,
  SeriesProps,
} from '../@types/ui-react-dom-charts/index.d.ts';
import {useLayoutEffect} from '../common/react.ts';
import {SERIES, useCartesianChartContext} from './common/context.ts';
import {getScaledPoints, getSeriesSummary} from './common/data.ts';
import {Line} from './components/Line.tsx';
import {getSeriesClassName, useSeriesData} from './components/series.ts';

export const LineSeries = ((props: SeriesProps) => {
  const {
    barSeriesCount,
    bounds,
    plotFrame,
    plotSize,
    setSeriesSummary,
    setTooltipPoint,
    timestampUnit,
    xScale,
    xValues,
  } = useCartesianChartContext();
  const {className, label, xCellId, yCellId} = props;
  const [seriesId, rawPoints] = useSeriesData(props);
  const points = getScaledPoints(
    xScale != 'category' || barSeriesCount == 0 ? 'line' : 'bar',
    rawPoints,
    bounds,
    plotSize,
    xValues,
    xScale,
    timestampUnit,
    xCellId,
    label ?? yCellId,
  );

  useLayoutEffect(() => {
    setSeriesSummary(
      seriesId,
      getSeriesSummary('line', rawPoints, xCellId, yCellId, label),
    );
  });

  return (
    <g className={getSeriesClassName('line-series', className)}>
      <Line
        plotFrame={plotFrame}
        points={points}
        setTooltipPoint={setTooltipPoint}
      />
    </g>
  );
}) as typeof LineSeriesDecl & {[SERIES]?: true};

LineSeries[SERIES] = true;
