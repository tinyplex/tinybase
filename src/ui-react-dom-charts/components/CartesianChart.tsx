import type {ReactNode} from 'react';
import type {
  ChartProps,
  ChartQuerySourceProps,
  ChartTableSourceProps,
  XAxisProps,
  YAxisProps,
} from '../../@types/ui-react-dom-charts/index.d.ts';
import {
  arrayFilter,
  arrayForEach,
  arrayHas,
  arrayIndexOf,
  arrayIsEmpty,
  arrayIsEqual,
  arrayPush,
  arraySort,
} from '../../common/array.ts';
import {objValues} from '../../common/obj.ts';
import {
  isFiniteNumber,
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
  isChartSeriesComponent,
  isChartXAxisComponent,
  isChartYAxisComponent,
  SourceType,
} from '../common/context.ts';
import {
  getDomainState,
  getScaledPoints,
  getTickBounds,
  getXTicks,
  getYTicks,
} from '../common/data.ts';
import {
  getLabelSize,
  getPlotFrame,
  getPlotSize,
  useLayout,
} from '../common/svg.ts';
import type {
  Bounds,
  DomainState,
  ScaledPoint,
  SeriesSummary,
  Ticks,
  XValue,
} from '../common/types.ts';
import {Axes} from './Axes.tsx';
import {Grid} from './Grid.tsx';
import {Tooltip} from './Tooltip.tsx';

type SummaryById = {[seriesId: string]: SeriesSummary};
type ElementWithChildren = {readonly props: {readonly children?: ReactNode}};
type ElementWithProps<Props> = {
  readonly props: Props & {readonly children?: ReactNode};
};
type ChartContent = readonly [
  children: ReactNode[],
  xAxis?: XAxisProps,
  yAxis?: YAxisProps,
];
type CartesianChartProps = (ChartTableSourceProps | ChartQuerySourceProps) &
  ChartProps & {
    readonly children?: ReactNode;
    readonly initialSummary?: SeriesSummary;
  };

const EMPTY_DOMAIN_STATE: DomainState = {
  bounds: [],
  continuousX: false,
  xValues: [],
};

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
  const sourceType =
    tableId == null
      ? queryId == null
        ? SourceType.None
        : SourceType.Query
      : SourceType.Table;
  const initialSummaries: SummaryById =
    initialSummary == null ? {} : {0: initialSummary};
  const initialDomainState =
    initialSummary == null
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
  const [chartChildren, xAxis, yAxis] = getChartContent(children);
  const xValues = domainState.xValues;
  const numericX =
    domainState.continuousX ||
    (arrayIsEmpty(xValues) && hasNumericXAxisDefinition(xAxis));
  const dataBounds = getAxisBounds(domainState.bounds, numericX, xAxis, yAxis);
  const axisKind = numericX || arrayIsEmpty(barSeriesIds) ? 'line' : 'bar';
  const xTicks =
    numericX && xAxis?.ticks != null
      ? getAxisTicks(xAxis.ticks)
      : getXTicks(axisKind, dataBounds, plotSize, labelSize, xAxis?.tickCount);
  const yTicks =
    yAxis?.ticks == null
      ? getYTicks(dataBounds, plotSize, labelSize, yAxis?.tickCount)
      : getAxisTicks(yAxis.ticks);
  const tickBounds = getTickBounds(dataBounds, xTicks, yTicks);
  const axisPoints = getScaledPoints(
    axisKind,
    xValues.map((xValue, index) => [`${index}`, xValue, 0]),
    tickBounds,
    plotSize,
    xValues,
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
    const nextBounds: Bounds = [
      getMin(currentBounds[0], summary.xMin),
      getMax(currentBounds[1], summary.xMax),
      getNumberMin(currentBounds[2], summary.yMin),
      getNumberMax(currentBounds[3], summary.yMax),
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
      if (summary == null) {
        if (currentSummary == null) {
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
        currentSummary == null
          ? addsXValues(summary.xValues, domainStateRef.current.xValues) ||
            summary.continuousX != domainStateRef.current.continuousX
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
      xTicks,
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
      tickBounds,
      xTicks,
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
          xAxis={xAxis}
          xAxisHeight={xAxisHeight}
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

const addsXValues = (xValues: XValue[], currentXValues: XValue[]) => {
  let adds = false;
  arrayForEach(xValues, (xValue) => {
    if (!arrayHas(currentXValues, xValue)) {
      adds = true;
    }
  });
  return adds;
};

const getMin = (value1: XValue | undefined, value2: XValue | undefined) =>
  isNumber(value1) && isNumber(value2)
    ? mathMin(value1, value2)
    : (value1 ?? value2);

const getMax = (value1: XValue | undefined, value2: XValue | undefined) =>
  isNumber(value1) && isNumber(value2)
    ? mathMax(value1, value2)
    : (value1 ?? value2);

const getNumberMin = (
  value1: number | undefined,
  value2: number | undefined,
) =>
  value1 == null || value2 == null
    ? (value1 ?? value2)
    : mathMin(value1, value2);

const getNumberMax = (
  value1: number | undefined,
  value2: number | undefined,
) =>
  value1 == null || value2 == null
    ? (value1 ?? value2)
    : mathMax(value1, value2);

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
    if (title != null && !arrayHas(titles, title)) {
      arrayPush(titles, title);
    }
  });
  return arrayIsEmpty(titles) ? '' : titles.join(' & ');
};

const getAxisBounds = (
  [xMin, xMax, yMin, yMax]: Bounds,
  numericX: boolean,
  xAxis?: XAxisProps,
  yAxis?: YAxisProps,
): Bounds => [
  numericX ? getAxisBound(xAxis?.min, xMin) : xMin,
  numericX ? getAxisBound(xAxis?.max, xMax) : xMax,
  getNumberAxisBound(yAxis?.min, yMin),
  getNumberAxisBound(yAxis?.max, yMax),
];

const getAxisBound = (
  value: number | undefined,
  bound: XValue | undefined,
): XValue | undefined => (isFiniteNumber(value) ? (value as number) : bound);

const getNumberAxisBound = (
  value: number | undefined,
  bound: number | undefined,
): number | undefined => (isFiniteNumber(value) ? value : bound);

const getAxisTicks = (ticks: readonly number[]): Ticks =>
  arraySort(arrayFilter([...ticks], isFiniteNumber), (tick1, tick2) => {
    return tick1 - tick2;
  });

const hasNumericXAxisDefinition = (xAxis?: XAxisProps): boolean =>
  isFiniteNumber(xAxis?.min) ||
  isFiniteNumber(xAxis?.max) ||
  xAxis?.ticks != null;

const getChartContent = (children: ReactNode): ChartContent => {
  const chartChildren: ReactNode[] = [];
  let xAxis: XAxisProps | undefined;
  let yAxis: YAxisProps | undefined;
  Children.forEach(children, (child) => {
    if (isValidElement(child)) {
      if (child.type === Fragment) {
        const [childChildren, childXAxis, childYAxis] = getChartContent(
          (child as ElementWithChildren).props.children,
        );
        arrayForEach(childChildren, (chartChild) =>
          arrayPush(chartChildren, chartChild),
        );
        xAxis ??= childXAxis;
        yAxis ??= childYAxis;
      } else if (isChartSeriesComponent(child.type)) {
        arrayPush(chartChildren, child);
      } else if (xAxis == null && isChartXAxisComponent(child.type)) {
        xAxis = (child as ElementWithProps<XAxisProps>).props;
      } else if (yAxis == null && isChartYAxisComponent(child.type)) {
        yAxis = (child as ElementWithProps<YAxisProps>).props;
      }
    }
  });
  return [chartChildren, xAxis, yAxis];
};
