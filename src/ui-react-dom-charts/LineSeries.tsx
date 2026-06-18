import type {
  LineSeries as LineSeriesDecl,
  SeriesProps,
} from '../@types/ui-react-dom-charts/index.d.ts';
import {useLayoutEffect} from '../common/react.ts';
import {useCartesianChartContext} from './common/context.ts';
import {getScaledPoints, getSeriesSummary} from './common/data.ts';
import {BAR, CATEGORY, LINE, SERIES} from './common/strings.ts';
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
    xScale != CATEGORY || !barSeriesCount ? LINE : BAR,
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
      getSeriesSummary(LINE, rawPoints, xCellId, yCellId, label),
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
