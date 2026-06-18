import type {
  BarSeries as BarSeriesDecl,
  SeriesProps,
} from '../@types/ui-react-dom-charts/index.d.ts';
import {arrayMap} from '../common/array.ts';
import {useLayoutEffect} from '../common/react.ts';
import {SERIES, useCartesianChartContext} from './common/context.ts';
import {getScaledPoints, getSeriesSummary} from './common/data.ts';
import {BAR, CATEGORY, CURRENT_COLOR, LINE} from './common/strings.ts';
import {Bars, getContinuousBarWidth} from './components/Bars.tsx';
import {getSeriesClassName, useSeriesData} from './components/series.ts';

export const BarSeries = ((props: SeriesProps) => {
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
    timestampUnit,
    xScale,
    xValues,
  } = useCartesianChartContext();
  const {className, label, xCellId, yCellId} = props;
  const [seriesId, rawPoints] = useSeriesData(props);
  const barSeriesIndex = getBarSeriesIndex(seriesId);
  const [, , yMin, yMax] = bounds;
  const axisPoints =
    xScale == CATEGORY
      ? undefined
      : getScaledPoints(
          LINE,
          arrayMap(xValues, (xValue, index) => [`${index}`, xValue, 0]),
          bounds,
          plotSize,
          xValues,
          xScale,
          timestampUnit,
        );
  const points = getScaledPoints(
    BAR,
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
      getSeriesSummary(BAR, rawPoints, xCellId, yCellId, label),
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
        fullBarWidth={
          axisPoints == null
            ? undefined
            : getContinuousBarWidth(axisPoints, plotSize[0])
        }
        plotFrame={plotFrame}
        points={points}
        setTooltipPoint={setTooltipPoint}
        yMax={yMax}
        yMin={yMin}
      />
    </g>
  );
}) as typeof BarSeriesDecl & {[SERIES]?: true};

BarSeries[SERIES] = true;
