import type {Cell} from '../@types/store/index.d.ts';
import type {
  ChartBindingProps,
  ChartProps,
  ChartQuerySourceProps,
  ChartTableSourceProps,
} from '../@types/ui-react-dom-charts/index.d.ts';
import {arrayMap} from '../common/array.ts';
import {isUndefined} from '../common/other.ts';
import {
  useCell,
  useResultCell,
  useResultSortedRowIds,
  useSortedRowIds,
} from '../ui-react/index.ts';

type ChartSourceProps = ChartTableSourceProps | ChartQuerySourceProps;
type ChartComponentProps = ChartSourceProps & ChartBindingProps & ChartProps;
type ChartKind = 'bar' | 'line';
type ChartXValue = number | string;
type ChartPointProps = {
  readonly rowId: string;
  readonly xCellId: string;
  readonly yCellId: string;
};

export const Chart = (
  props: ChartComponentProps & {readonly kind: ChartKind},
) => {
  const {className, kind, queryId, tableId} = props;
  const {descending, limit, offset, sortCellId, xCellId, yCellId} = props;

  return (
    <svg className={className} data-chart={kind}>
      {isUndefined(tableId) ? (
        isUndefined(queryId) ? null : (
          <ChartQuery
            descending={descending}
            limit={limit}
            offset={offset}
            queries={props.queries}
            queryId={queryId}
            sortCellId={sortCellId}
            xCellId={xCellId}
            yCellId={yCellId}
          />
        )
      ) : (
        <ChartTable
          descending={descending}
          limit={limit}
          offset={offset}
          sortCellId={sortCellId}
          store={props.store}
          tableId={tableId}
          xCellId={xCellId}
          yCellId={yCellId}
        />
      )}
    </svg>
  );
};

const ChartTable = ({
  descending,
  limit,
  offset,
  sortCellId,
  store,
  tableId,
  xCellId,
  yCellId,
}: ChartBindingProps & ChartTableSourceProps) =>
  arrayMap(
    useSortedRowIds(
      tableId,
      sortCellId ?? xCellId,
      descending,
      offset,
      limit,
      store,
    ),
    (rowId) => (
      <ChartTablePoint
        key={rowId}
        store={store}
        tableId={tableId}
        rowId={rowId}
        xCellId={xCellId}
        yCellId={yCellId}
      />
    ),
  );

const ChartQuery = ({
  descending,
  limit,
  offset,
  queries,
  queryId,
  sortCellId,
  xCellId,
  yCellId,
}: ChartBindingProps & ChartQuerySourceProps) =>
  arrayMap(
    useResultSortedRowIds(
      queryId,
      sortCellId ?? xCellId,
      descending,
      offset,
      limit,
      queries,
    ),
    (rowId) => (
      <ChartQueryPoint
        key={rowId}
        queries={queries}
        queryId={queryId}
        rowId={rowId}
        xCellId={xCellId}
        yCellId={yCellId}
      />
    ),
  );

const ChartTablePoint = ({
  rowId,
  store,
  tableId,
  xCellId,
  yCellId,
}: ChartPointProps & ChartTableSourceProps) =>
  getChartPoint(
    rowId,
    useCell(tableId, rowId, xCellId, store),
    useCell(tableId, rowId, yCellId, store),
  );

const ChartQueryPoint = ({
  queries,
  queryId,
  rowId,
  xCellId,
  yCellId,
}: ChartPointProps & ChartQuerySourceProps) =>
  getChartPoint(
    rowId,
    useResultCell(queryId, rowId, xCellId, queries),
    useResultCell(queryId, rowId, yCellId, queries),
  );

const getChartPoint = (
  rowId: string,
  xCell: Cell | undefined,
  yCell: Cell | undefined,
) => {
  const xValue = getChartXValue(xCell);
  const yValue = getChartYValue(yCell);

  return isUndefined(xValue) || isUndefined(yValue) ? null : (
    <g data-row-id={rowId} data-x-value={xValue} data-y-value={yValue} />
  );
};

const getChartXValue = (cell: Cell | undefined): ChartXValue | undefined =>
  typeof cell == 'number'
    ? Number.isFinite(cell)
      ? cell
      : undefined
    : typeof cell == 'string'
      ? cell
      : undefined;

const getChartYValue = (cell: Cell | undefined): number | undefined =>
  typeof cell == 'number' && Number.isFinite(cell) ? cell : undefined;
