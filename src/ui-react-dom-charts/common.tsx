import type {ReactNode} from 'react';
import type {ResultCellOrUndefined} from '../@types/queries/index.d.ts';
import type {CellOrUndefined} from '../@types/store/index.d.ts';
import type {
  ChartBindingProps,
  ChartProps,
  ChartQuerySourceProps,
  ChartTableSourceProps,
} from '../@types/ui-react-dom-charts/index.d.ts';
import {
  arrayFilter,
  arrayForEach,
  arrayIsEmpty,
  arrayJoin,
  arrayMap,
} from '../common/array.ts';
import {collSize} from '../common/coll.ts';
import {
  isFiniteNumber,
  isNumber,
  isString,
  isUndefined,
  mathMax,
  mathMin,
  size,
} from '../common/other.ts';
import {useCallback, useMemo, useState} from '../common/react.ts';
import {
  useCellListener,
  useQueriesOrQueriesById,
  useResultCellListener,
  useResultSortedRowIds,
  useSortedRowIds,
  useStoreOrStoreById,
} from '../ui-react/index.ts';

type ChartSourceProps = ChartTableSourceProps | ChartQuerySourceProps;
type ChartComponentProps = ChartSourceProps & ChartBindingProps & ChartProps;
type ChartKind = 'bar' | 'line';
type ChartCell = CellOrUndefined | ResultCellOrUndefined;
type ChartXValue = number | string;
type ChartPoint = readonly [
  rowId: string,
  xValue: ChartXValue,
  yValue: number,
  ...rest: unknown[],
];
type ChartDataPoint = readonly [
  rowId: string,
  xValue: ChartXValue,
  yValue: number,
];
type ChartScaledPoint = readonly [
  rowId: string,
  xValue: ChartXValue,
  yValue: number,
  x: number,
  y: number,
];
type ChartBounds = readonly [
  xMin?: ChartXValue,
  xMax?: ChartXValue,
  yMin?: number,
  yMax?: number,
];
type Domain = readonly [min: number, max: number];
type ChartCellGetter = (rowId: string) => ChartCell;
type ChartChangeHandler = () => void;
type TableChartProps = Omit<ChartTableSourceProps, 'store'> &
  ChartBindingProps & {
    readonly kind: ChartKind;
    readonly storeOrStoreId: ChartTableSourceProps['store'];
  };
type QueryChartProps = Omit<ChartQuerySourceProps, 'queries'> &
  ChartBindingProps & {
    readonly kind: ChartKind;
    readonly queriesOrQueriesId: ChartQuerySourceProps['queries'];
  };
type SourceChartProps = {
  readonly getListeners: (handleChange: ChartChangeHandler) => ReactNode;
  readonly getXCell: ChartCellGetter;
  readonly getYCell: ChartCellGetter;
  readonly kind: ChartKind;
  readonly rowIds: string[];
};

export const Chart = ({
  className,
  store,
  tableId,
  queries,
  queryId,
  ...props
}: ChartComponentProps & {readonly kind: ChartKind}) => (
  <svg className={className} data-chart={props.kind} viewBox="0 0 1 1">
    {isUndefined(tableId) ? (
      isUndefined(queryId) ? null : (
        <QueryChart {...props} queriesOrQueriesId={queries} queryId={queryId} />
      )
    ) : (
      <TableChart {...props} storeOrStoreId={store} tableId={tableId} />
    )}
  </svg>
);

const TableChart = ({
  descending,
  kind,
  limit,
  offset,
  sortCellId,
  storeOrStoreId,
  tableId,
  xCellId,
  yCellId,
}: TableChartProps) => {
  const store = useStoreOrStoreById(storeOrStoreId);
  const rowIds = useSortedRowIds(
    tableId,
    sortCellId ?? xCellId,
    descending,
    offset,
    limit,
    storeOrStoreId,
  );
  const getXCell = useCallback<ChartCellGetter>(
    (rowId) => store?.getCell(tableId, rowId, xCellId),
    [store, tableId, xCellId],
  );
  const getYCell = useCallback<ChartCellGetter>(
    (rowId) => store?.getCell(tableId, rowId, yCellId),
    [store, tableId, yCellId],
  );
  return (
    <SourceChart
      getListeners={(handleChange) => (
        <TableChartListeners
          handleChange={handleChange}
          store={storeOrStoreId}
          tableId={tableId}
          xCellId={xCellId}
          yCellId={yCellId}
        />
      )}
      getXCell={getXCell}
      getYCell={getYCell}
      kind={kind}
      rowIds={rowIds}
    />
  );
};

const QueryChart = ({
  descending,
  kind,
  limit,
  offset,
  queriesOrQueriesId,
  queryId,
  sortCellId,
  xCellId,
  yCellId,
}: QueryChartProps) => {
  const queries = useQueriesOrQueriesById(queriesOrQueriesId);
  const rowIds = useResultSortedRowIds(
    queryId,
    sortCellId ?? xCellId,
    descending,
    offset,
    limit,
    queriesOrQueriesId,
  );
  const getXCell = useCallback<ChartCellGetter>(
    (rowId) => queries?.getResultCell(queryId, rowId, xCellId),
    [queries, queryId, xCellId],
  );
  const getYCell = useCallback<ChartCellGetter>(
    (rowId) => queries?.getResultCell(queryId, rowId, yCellId),
    [queries, queryId, yCellId],
  );
  return (
    <SourceChart
      getListeners={(handleChange) => (
        <QueryChartListeners
          handleChange={handleChange}
          queries={queriesOrQueriesId}
          queryId={queryId}
          xCellId={xCellId}
          yCellId={yCellId}
        />
      )}
      getXCell={getXCell}
      getYCell={getYCell}
      kind={kind}
      rowIds={rowIds}
    />
  );
};

const SourceChart = ({
  getListeners,
  getXCell,
  getYCell,
  kind,
  rowIds,
}: SourceChartProps) => {
  const [handleChange, points, bounds] = useChartData(
    kind,
    rowIds,
    getXCell,
    getYCell,
  );

  return (
    <>
      {getListeners(handleChange)}
      {getChartGeometry(kind, points, bounds)}
    </>
  );
};

const TableChartListeners = ({
  handleChange,
  store,
  tableId,
  xCellId,
  yCellId,
}: ChartTableSourceProps &
  Pick<ChartBindingProps, 'xCellId' | 'yCellId'> & {
    readonly handleChange: ChartChangeHandler;
  }) => {
  useCellListener(
    tableId,
    null,
    xCellId,
    handleChange,
    [handleChange],
    false,
    store,
  );
  useCellListener(
    tableId,
    null,
    yCellId,
    handleChange,
    [handleChange],
    false,
    store,
  );

  return null;
};

const QueryChartListeners = ({
  handleChange,
  queries,
  queryId,
  xCellId,
  yCellId,
}: ChartQuerySourceProps &
  Pick<ChartBindingProps, 'xCellId' | 'yCellId'> & {
    readonly handleChange: ChartChangeHandler;
  }) => {
  useResultCellListener(
    queryId,
    null,
    xCellId,
    handleChange,
    [handleChange],
    queries,
  );
  useResultCellListener(
    queryId,
    null,
    yCellId,
    handleChange,
    [handleChange],
    queries,
  );

  return null;
};

const useChartData = (
  kind: ChartKind,
  rowIds: string[],
  getXCell: ChartCellGetter,
  getYCell: ChartCellGetter,
) => {
  const [, rerender] = useState<[]>();
  const handleChange = useCallback(() => rerender([]), [rerender]);
  const points = getChartDataPoints(rowIds, (rowId) =>
    getChartDataPoint(rowId, getXCell(rowId), getYCell(rowId)),
  );
  const bounds = useMemo(() => getChartBounds(kind, points), [kind, points]);

  return [
    handleChange,
    useMemo(
      () => getChartScaledPoints(kind, points, bounds),
      [bounds, kind, points],
    ),
    bounds,
  ] as const;
};

const getChartDataPoints = (
  rowIds: string[],
  getPoint: (rowId: string) => ChartDataPoint | undefined,
) =>
  arrayFilter(
    arrayMap(rowIds, getPoint),
    (point): point is ChartDataPoint => !isUndefined(point),
  ) as ChartDataPoint[];

const getChartDataPoint = (
  rowId: string,
  xCell: ChartCell,
  yCell: ChartCell,
): ChartDataPoint | undefined => {
  const xValue = getChartXValue(xCell);
  const yValue = getChartYValue(yCell);

  return isUndefined(xValue) || isUndefined(yValue)
    ? undefined
    : [rowId, xValue, yValue];
};

const getChartGeometry = (
  kind: ChartKind,
  points: ChartScaledPoint[],
  [xMin, xMax, yMin, yMax]: ChartBounds,
) => (
  <g
    className={kind}
    data-x-max={xMax}
    data-x-min={xMin}
    data-y-max={yMax}
    data-y-min={yMin}
  >
    {kind == 'line' ? getChartLine(points) : getChartBars(points)}
  </g>
);

const getChartLine = (points: ChartScaledPoint[]) => (
  <>
    <path className="line" d={getChartLinePath(points)} />
    {getChartMarks(points, ([, , , x, y]) => (
      <circle className="point" cx={x} cy={y} r={0.01} />
    ))}
  </>
);

const getChartBars = (points: ChartScaledPoint[]) => {
  const baselineY = 1 - getChartScale(0, ...getYDomain(points));
  const pointsSize = size(points);
  const width = arrayIsEmpty(points) ? 0 : 0.8 / pointsSize;

  return getChartMarks(points, ([, , , x, pointY]) => {
    const y = mathMin(pointY, baselineY);
    return (
      <rect
        className="bar"
        x={x - width / 2}
        y={y}
        width={width}
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

const getChartScaledPoints = (
  kind: ChartKind,
  points: ChartDataPoint[],
  [xMin, xMax, yMin, yMax]: ChartBounds,
): ChartScaledPoint[] => {
  const numericX = arrayIsEmpty(
    arrayFilter(points, ([, xValue]) => !isNumber(xValue)),
  );
  const xDomain: Domain = numericX ? [xMin as number, xMax as number] : [0, 0];
  const yDomain: Domain = [yMin ?? 0, yMax ?? 0];
  const xCategories = new Map<ChartXValue, number>();

  arrayForEach(points, ([, xValue]) => {
    if (!xCategories.has(xValue)) {
      xCategories.set(xValue, collSize(xCategories));
    }
  });

  return arrayMap(points, ([rowId, xValue, yValue]) => [
    rowId,
    xValue,
    yValue,
    getChartX(xValue, numericX, xDomain, xCategories),
    getChartY(yValue, yDomain),
  ]);
};

const getChartX = (
  xValue: ChartXValue,
  numericX: boolean,
  [xMin, xMax]: Domain,
  xCategories: Map<ChartXValue, number>,
) =>
  numericX
    ? getChartScale(xValue as number, xMin, xMax)
    : getChartScale(xCategories.get(xValue) ?? 0, 0, collSize(xCategories) - 1);

const getChartY = (yValue: number, [yMin, yMax]: Domain) =>
  1 - getChartScale(yValue, yMin, yMax);

const getChartScale = (value: number, min: number, max: number) =>
  min == max ? 0.5 : getRounded((value - min) / (max - min));

const getChartBounds = (
  kind: ChartKind,
  points: ChartDataPoint[],
): ChartBounds => {
  if (arrayIsEmpty(points)) {
    return [];
  }
  const [yMin, yMax] = getYDomain(points, kind);

  if (arrayIsEmpty(arrayFilter(points, ([, xValue]) => !isNumber(xValue)))) {
    const [xMin, xMax] = getChartDomain(
      arrayMap(points, ([, xValue]) => xValue as number),
    );
    return [xMin, xMax, yMin, yMax];
  }

  return [points[0]?.[1], points[size(points) - 1]?.[1], yMin, yMax];
};

const getYDomain = (points: ChartPoint[], kind: ChartKind = 'bar'): Domain =>
  getChartDomain([
    ...(kind == 'bar' ? [0] : []),
    ...arrayMap(points, ([, , yValue]) => yValue),
  ]);

const getChartDomain = (values: number[]): Domain => {
  const min = mathMin(...values);
  return min == Infinity ? [0, 0] : [min, mathMax(...values)];
};

const getRounded = (value: number) => Math.round(value * 1000000) / 1000000;

const getChartXValue = (cell: ChartCell): ChartXValue | undefined =>
  isNumber(cell)
    ? isFiniteNumber(cell)
      ? cell
      : undefined
    : isString(cell)
      ? cell
      : undefined;

const getChartYValue = (cell: ChartCell): number | undefined =>
  isNumber(cell) && isFiniteNumber(cell) ? cell : undefined;
