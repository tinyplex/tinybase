import type {
  ChartSeriesProps,
  LineSeries as LineSeriesDecl,
} from '../@types/ui-react-dom-charts/index.d.ts';
import {useLayoutEffect} from '../common/react.ts';
import {CHART_SERIES, useCartesianChartContext} from './common/context.ts';
import {getScaledPoints, getSeriesSummary} from './common/data.ts';
import {Line} from './components/Line.tsx';
import {useSeriesData} from './components/series.ts';

export const LineSeries = ((props: ChartSeriesProps) => {
  const {
    bounds,
    plotFrame,
    plotSize,
    setSeriesSummary,
    setTooltipPoint,
    xValues,
  } = useCartesianChartContext();
  const {xCellId, yCellId} = props;
  const [seriesId, rawPoints] = useSeriesData(props);
  const points = getScaledPoints(
    'line',
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
      getSeriesSummary('line', rawPoints, xCellId, yCellId),
    );
  });

  return (
    <g className="line-series">
      <Line
        plotFrame={plotFrame}
        points={points}
        setTooltipPoint={setTooltipPoint}
      />
    </g>
  );
}) as typeof LineSeriesDecl & {[CHART_SERIES]?: true};

LineSeries[CHART_SERIES] = true;
