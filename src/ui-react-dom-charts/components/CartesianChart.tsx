import type {ReactNode} from 'react';
import type {
  ChartProps,
  QuerySourceProps,
  TableSourceProps,
  TimeValue,
  XAxisProps,
  YAxisProps,
} from '../../@types/ui-react-dom-charts/index.d.ts';
import {
  arrayEvery,
  arrayFilter,
  arrayForEach,
  arrayHas,
  arrayIndexOf,
  arrayIsEqual,
  arrayJoin,
  arrayMap,
  arrayPush,
  arraySort,
} from '../../common/array.ts';
import {objValues} from '../../common/obj.ts';
import {
  isEmpty,
  isFiniteNumber,
  isNullish,
  isNumber,
  mathMax,
  mathMin,
  size,
} from '../../common/other.ts';
import {getPoolFunctions} from '../../common/pool.ts';
import {
  Children,
  Fragment,
  isValidElement,
  useCallback,
  useMemo,
  useRef,
  useState,
} from '../../common/react.ts';
import {
  useQueriesOrQueriesById,
  useStoreOrStoreById,
} from '../../ui-react/index.ts';
import {
  CartesianChartContext,
  isSeriesComponent,
  isXAxisComponent,
  isYAxisComponent,
  SourceType,
} from '../common/context.ts';
import {
  getDomainState,
  getResolvedXScale,
  getScaledPoints,
  getTickBounds,
  getXScaleDomain,
  getXTicks,
  getYTicks,
  normalizeTimeValue,
} from '../common/data.ts';
import {
  BAR,
  CATEGORY,
  LINE,
  LINEAR,
  MILLISECOND,
  SECOND_UNIT,
  TIME,
} from '../common/strings.ts';
import {
  getLabelSize,
  getPlotFrame,
  getPlotSize,
  useLayout,
} from '../common/svg.ts';
import {
  type Bounds,
  type DomainState,
  type ScaledPoint,
  type SeriesSummary,
  type Ticks,
  type TimestampUnit,
  type XScale,
  type XValue,
} from '../common/types.ts';
import {getTickCount, getTimeTicks} from '../common/wilkinson.ts';
import {Axes} from './Axes.tsx';
import {Grid} from './Grid.tsx';
import {Tooltip} from './Tooltip.tsx';

type SummaryById = {[seriesId: string]: SeriesSummary};
type ElementWithChildren = {readonly props: {readonly children?: ReactNode}};
type ElementWithProps<Props> = {
  readonly props: Props & {readonly children?: ReactNode};
};
type ParsedChildren = readonly [
  children: ReactNode[],
  xAxis?: XAxisProps,
  yAxis?: YAxisProps,
];
type CartesianChartProps = (TableSourceProps | QuerySourceProps) &
  ChartProps & {
    readonly children?: ReactNode;
    readonly initialSummary?: SeriesSummary;
  };

const EMPTY_DOMAIN_STATE: DomainState = {
  bounds: [],
  continuousX: false,
  xValues: [],
};
const TITLE_SEPARATOR = ' & ';

export const CartesianChart = ({
  children,
  className,
  initialSummary,
  queries,
  queryId,
  store,
  tableId,
}: CartesianChartProps) => {
  const layout = useLayout();
  const [svgRef, chartSize, chartStyle] = layout;
  const [tickSize, tickGap, , xAxisHeight, yAxisWidth, , fontSize] = chartStyle;
  const plotFrame = getPlotFrame(chartSize, chartStyle);
  const plotSize = getPlotSize(layout);
  const labelSize = getLabelSize(layout);
  const storeObject = useStoreOrStoreById(store);
  const queriesObject = useQueriesOrQueriesById(queries);
  const sourceType = isNullish(tableId)
    ? isNullish(queryId)
      ? SourceType.None
      : SourceType.Query
    : SourceType.Table;
  const initialSummaries: SummaryById = isNullish(initialSummary)
    ? {}
    : {0: initialSummary};
  const initialDomainState = isNullish(initialSummary)
    ? EMPTY_DOMAIN_STATE
    : getDomainState(objValues(initialSummaries));
  const initialXTitle = getTitle(initialSummaries, 'xCellId');
  const initialYTitle = getTitle(initialSummaries, 'yCellId');
  const summariesRef = useRef<SummaryById>(initialSummaries);
  const boundsRef = useRef<Bounds>(initialDomainState.bounds);
  const domainStateRef = useRef<DomainState>(initialDomainState);
  const xTitleRef = useRef(initialXTitle);
  const yTitleRef = useRef(initialYTitle);
  const pool = useRef(getPoolFunctions());
  const [domainState, setDomainState] =
    useState<DomainState>(initialDomainState);
  const [xTitle, setXTitle] = useState(initialXTitle);
  const [yTitle, setYTitle] = useState(initialYTitle);
  const barSeriesIdsRef = useRef<string[]>([]);
  const [barSeriesIds, setBarSeriesIds] = useState<string[]>([]);
  const [tooltipPoint, setTooltipPoint] = useState<ScaledPoint | undefined>();
  const [chartChildren, xAxis, yAxis] = getParsedChildren(children);
  const xValues = domainState.xValues;
  const timestampUnit: TimestampUnit =
    xAxis?.scale == TIME && xAxis.timestampUnit == SECOND_UNIT
      ? SECOND_UNIT
      : MILLISECOND;
  const xScale = getResolvedXScale(
    xAxis?.scale,
    domainState,
    isFiniteNumber(xAxis?.min) ||
      isFiniteNumber(xAxis?.max) ||
      !isNullish(xAxis?.ticks),
  );
  const continuousX = xScale != CATEGORY;
  const dataBounds = getAxisBounds(
    domainState.bounds,
    xValues,
    xScale,
    timestampUnit,
    xAxis,
    yAxis,
  );
  const [dataXMin, dataXMax] = dataBounds;
  const axisKind = continuousX || isEmpty(barSeriesIds) ? LINE : BAR;
  const xTicks =
    continuousX && !isNullish(xAxis?.ticks)
      ? getAxisTicks(xAxis.ticks, xScale, timestampUnit)
      : xScale == TIME &&
          isNumber(dataXMin) &&
          isNumber(dataXMax) &&
          dataXMin != dataXMax
        ? getTimeTicks(
            dataXMin,
            dataXMax,
            getTickCount(xAxis?.tickCount),
            labelSize,
            plotSize[0],
          )
        : getXTicks(
            axisKind,
            dataBounds,
            plotSize,
            labelSize,
            xAxis?.tickCount,
          );
  const yTicks = isNullish(yAxis?.ticks)
    ? getYTicks(dataBounds, plotSize, labelSize, yAxis?.tickCount)
    : getAxisTicks(yAxis.ticks);
  const tickBounds = getTickBounds(dataBounds, xTicks, yTicks);
  const axisPoints = getScaledPoints(
    axisKind,
    arrayMap(xValues, (xValue, index) => [`${index}`, xValue, 0]),
    tickBounds,
    plotSize,
    xValues,
    xScale,
    timestampUnit,
  );

  const setNextDomainState = useCallback((summaryById: SummaryById) => {
    const nextDomainState = getDomainState(objValues(summaryById));
    const nextBounds = nextDomainState.bounds;
    if (
      !boundsAreEqual(boundsRef.current, nextBounds) ||
      !arrayIsEqual(domainStateRef.current.xValues, nextDomainState.xValues)
    ) {
      boundsRef.current = nextBounds;
      domainStateRef.current = nextDomainState;
      setDomainState(nextDomainState);
    }
  }, []);

  const setNextTitles = useCallback((summaryById: SummaryById) => {
    const nextXTitle = getTitle(summaryById, 'xCellId');
    const nextYTitle = getTitle(summaryById, 'yCellId');
    if (xTitleRef.current != nextXTitle) {
      xTitleRef.current = nextXTitle;
      setXTitle(nextXTitle);
    }
    if (yTitleRef.current != nextYTitle) {
      yTitleRef.current = nextYTitle;
      setYTitle(nextYTitle);
    }
  }, []);

  const setIncrementalDomainState = useCallback((summary: SeriesSummary) => {
    const currentBounds = boundsRef.current;
    const [currentXMin, currentXMax, currentYMin, currentYMax] = currentBounds;
    const {xMin, xMax, yMin, yMax} = summary;
    const nextBounds: Bounds = [
      isNumber(currentXMin) && isNumber(xMin)
        ? mathMin(currentXMin, xMin)
        : (currentXMin ?? xMin),
      isNumber(currentXMax) && isNumber(xMax)
        ? mathMax(currentXMax, xMax)
        : (currentXMax ?? xMax),
      isNullish(currentYMin) || isNullish(yMin)
        ? (currentYMin ?? yMin)
        : mathMin(currentYMin, yMin),
      isNullish(currentYMax) || isNullish(yMax)
        ? (currentYMax ?? yMax)
        : mathMax(currentYMax, yMax),
    ];

    if (!boundsAreEqual(currentBounds, nextBounds)) {
      boundsRef.current = nextBounds;
      domainStateRef.current = {
        bounds: nextBounds,
        continuousX: domainStateRef.current.continuousX,
        xValues: domainStateRef.current.xValues,
      };
      setDomainState(domainStateRef.current);
    }
  }, []);

  const setSeriesSummary = useCallback(
    (seriesId: string, summary: SeriesSummary | undefined) => {
      const currentSummaries = summariesRef.current;
      const currentSummary = currentSummaries[seriesId];
      if (isNullish(summary)) {
        if (isNullish(currentSummary)) {
          return;
        }
        delete currentSummaries[seriesId];
        setNextTitles(currentSummaries);
        setNextDomainState(currentSummaries);
        return;
      }
      currentSummaries[seriesId] = summary;
      setNextTitles(currentSummaries);
      if (
        isNullish(currentSummary)
          ? !arrayEvery(summary.xValues, (xValue) =>
              arrayHas(domainStateRef.current.xValues, xValue),
            ) || summary.continuousX != domainStateRef.current.continuousX
          : ownsBound(currentSummary, boundsRef.current) ||
            currentSummary.continuousX != summary.continuousX ||
            !arrayIsEqual(currentSummary.xValues, summary.xValues)
      ) {
        setNextDomainState(currentSummaries);
        return;
      }
      setIncrementalDomainState(summary);
    },
    [setIncrementalDomainState, setNextDomainState, setNextTitles],
  );

  const [getId, releaseId] = pool.current;
  const getSeriesId = useCallback(() => getId(1), [getId]);
  const releaseSeriesId = useCallback(
    (seriesId: string) => {
      setSeriesSummary(seriesId, undefined);
      releaseId(seriesId);
    },
    [releaseId, setSeriesSummary],
  );
  const registerBarSeries = useCallback((seriesId: string) => {
    if (!arrayHas(barSeriesIdsRef.current, seriesId)) {
      const barSeriesIds = [...barSeriesIdsRef.current];
      arrayPush(barSeriesIds, seriesId);
      barSeriesIdsRef.current = barSeriesIds;
      setBarSeriesIds(barSeriesIds);
    }
  }, []);
  const releaseBarSeries = useCallback((seriesId: string) => {
    if (arrayHas(barSeriesIdsRef.current, seriesId)) {
      const barSeriesIds = arrayFilter(
        barSeriesIdsRef.current,
        (barSeriesId) => barSeriesId != seriesId,
      );
      barSeriesIdsRef.current = barSeriesIds;
      setBarSeriesIds(barSeriesIds);
    }
  }, []);
  const getBarSeriesIndex = useCallback(
    (seriesId: string) => arrayIndexOf(barSeriesIdsRef.current, seriesId),
    [],
  );

  const context = useMemo(
    () => ({
      bounds: tickBounds,
      barSeriesCount: size(barSeriesIds),
      domainState,
      getBarSeriesIndex,
      getSeriesId,
      layout,
      plotFrame,
      plotSize,
      queries: queriesObject,
      queriesOrQueriesId: queries,
      queryId,
      registerBarSeries,
      releaseBarSeries,
      releaseSeriesId,
      setSeriesSummary,
      setTooltipPoint,
      sourceType,
      store: storeObject,
      storeOrStoreId: store,
      tableId,
      timestampUnit,
      xTicks,
      xScale,
      xValues,
      yTicks,
    }),
    [
      barSeriesIds,
      domainState,
      getBarSeriesIndex,
      getSeriesId,
      layout,
      plotFrame,
      plotSize,
      queries,
      queriesObject,
      queryId,
      registerBarSeries,
      releaseBarSeries,
      releaseSeriesId,
      setSeriesSummary,
      sourceType,
      store,
      storeObject,
      tableId,
      timestampUnit,
      tickBounds,
      xTicks,
      xScale,
      xValues,
      yTicks,
    ],
  );

  return (
    <CartesianChartContext.Provider value={context}>
      <svg
        className={className}
        preserveAspectRatio="none"
        ref={svgRef}
        viewBox={`0 0 ${chartSize[0]} ${chartSize[1]}`}
      >
        <Grid
          bounds={tickBounds}
          points={axisPoints}
          plotFrame={plotFrame}
          tickSize={tickSize}
          xTicks={xTicks}
          yTicks={yTicks}
        />
        <Axes
          bounds={tickBounds}
          fontSize={fontSize}
          points={axisPoints}
          plotFrame={plotFrame}
          tickGap={tickGap}
          tickSize={tickSize}
          titles={[xAxis?.title ?? xTitle, yAxis?.title ?? yTitle]}
          timestampUnit={timestampUnit}
          xAxis={xAxis}
          xAxisHeight={xAxisHeight}
          xScale={xScale}
          xTicks={xTicks}
          yAxis={yAxis}
          yAxisWidth={yAxisWidth}
          yTicks={yTicks}
        />
        <g className="plot">{chartChildren}</g>
        <Tooltip
          height={plotSize[1]}
          point={tooltipPoint}
          plotFrame={plotFrame}
          titles={[xAxis?.title ?? xTitle, yAxis?.title ?? yTitle]}
          width={plotSize[0]}
        />
      </svg>
    </CartesianChartContext.Provider>
  );
};

const boundsAreEqual = (bounds1: Bounds, bounds2: Bounds) =>
  bounds1[0] === bounds2[0] &&
  bounds1[1] === bounds2[1] &&
  bounds1[2] === bounds2[2] &&
  bounds1[3] === bounds2[3];

const ownsBound = (
  {xMin, xMax, yMin, yMax}: SeriesSummary,
  [boundXMin, boundXMax, boundYMin, boundYMax]: Bounds,
) =>
  xMin === boundXMin ||
  xMax === boundXMax ||
  yMin === boundYMin ||
  yMax === boundYMax;

const getTitle = (
  summaryById: SummaryById,
  cellIdType: 'xCellId' | 'yCellId',
): string => {
  const titles: string[] = [];
  arrayForEach(objValues(summaryById), (summary) => {
    const title =
      cellIdType == 'yCellId'
        ? (summary.yLabel ?? summary.yCellId)
        : summary.xCellId;
    if (!isNullish(title) && !arrayHas(titles, title)) {
      arrayPush(titles, title);
    }
  });
  return isEmpty(titles) ? '' : arrayJoin(titles, TITLE_SEPARATOR);
};

const getAxisBounds = (
  [xMin, xMax, yMin, yMax]: Bounds,
  xValues: XValue[],
  xScale: XScale,
  timestampUnit: TimestampUnit,
  xAxis?: XAxisProps,
  yAxis?: YAxisProps,
): Bounds => {
  const [xDomainMin, xDomainMax] = getXScaleDomain(
    [xMin, xMax],
    xValues,
    xScale,
    timestampUnit,
  );
  return [
    xScale == CATEGORY
      ? xDomainMin
      : getAxisBound(xAxis?.min, xDomainMin, xScale, timestampUnit),
    xScale == CATEGORY
      ? xDomainMax
      : getAxisBound(xAxis?.max, xDomainMax, xScale, timestampUnit),
    getNumberAxisBound(yAxis?.min, yMin),
    getNumberAxisBound(yAxis?.max, yMax),
  ];
};

const getAxisBound = (
  value: TimeValue | undefined,
  bound: XValue | undefined,
  xScale: XScale,
  timestampUnit: TimestampUnit,
): XValue | undefined => {
  const axisBound =
    xScale == TIME ? normalizeTimeValue(value, timestampUnit) : value;
  return isFiniteNumber(axisBound) ? (axisBound as number) : bound;
};

const getNumberAxisBound = (
  value: number | undefined,
  bound: number | undefined,
): number | undefined => (isFiniteNumber(value) ? value : bound);

const getAxisTicks = (
  ticks: readonly TimeValue[],
  xScale: XScale = LINEAR,
  timestampUnit: TimestampUnit = MILLISECOND,
): Ticks =>
  arraySort(
    arrayFilter(
      arrayMap([...ticks], (tick) =>
        xScale == TIME ? normalizeTimeValue(tick, timestampUnit) : tick,
      ),
      (tick): tick is number => isFiniteNumber(tick),
    ),
    (tick1, tick2) => {
      return tick1 - tick2;
    },
  );

const getParsedChildren = (children: ReactNode): ParsedChildren => {
  const chartChildren: ReactNode[] = [];
  let xAxis: XAxisProps | undefined;
  let yAxis: YAxisProps | undefined;
  Children.forEach(children, (child) => {
    if (isValidElement(child)) {
      if (child.type === Fragment) {
        const [childChildren, childXAxis, childYAxis] = getParsedChildren(
          (child as ElementWithChildren).props.children,
        );
        arrayForEach(childChildren, (chartChild) =>
          arrayPush(chartChildren, chartChild),
        );
        xAxis ??= childXAxis;
        yAxis ??= childYAxis;
      } else if (isSeriesComponent(child.type)) {
        arrayPush(chartChildren, child);
      } else if (isNullish(xAxis) && isXAxisComponent(child.type)) {
        xAxis = (child as ElementWithProps<XAxisProps>).props;
      } else if (isNullish(yAxis) && isYAxisComponent(child.type)) {
        yAxis = (child as ElementWithProps<YAxisProps>).props;
      }
    }
  });
  return [chartChildren, xAxis, yAxis];
};
