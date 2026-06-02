/// ui-react-dom-charts
import type {ReactNode} from 'react';
import type {Id} from '../common/index.d.ts';
import type {
  ComponentReturnType,
  QueriesOrQueriesId,
  StoreOrStoreId,
} from '../ui-react/index.d.ts';

/// ChartProps
export type ChartProps = {
  /// ChartProps.className
  readonly className?: string;
};

/// ChartTableSourceProps
export type ChartTableSourceProps = {
  /// ChartTableSourceProps.tableId
  readonly tableId: Id;
  /// ChartTableSourceProps.store
  readonly store?: StoreOrStoreId;
  /// ChartTableSourceProps.queryId
  readonly queryId?: never;
  /// ChartTableSourceProps.queries
  readonly queries?: never;
};

/// ChartQuerySourceProps
export type ChartQuerySourceProps = {
  /// ChartQuerySourceProps.queryId
  readonly queryId: Id;
  /// ChartQuerySourceProps.queries
  readonly queries?: QueriesOrQueriesId;
  /// ChartQuerySourceProps.tableId
  readonly tableId?: never;
  /// ChartQuerySourceProps.store
  readonly store?: never;
};

/// ChartBindingProps
export type ChartBindingProps = {
  /// ChartBindingProps.xCellId
  readonly xCellId: Id;
  /// ChartBindingProps.yCellId
  readonly yCellId: Id;
  /// ChartBindingProps.sortCellId
  readonly sortCellId?: Id;
  /// ChartBindingProps.descending
  readonly descending?: boolean;
  /// ChartBindingProps.offset
  readonly offset?: number;
  /// ChartBindingProps.limit
  readonly limit?: number;
};

/// ChartSeriesProps
export type ChartSeriesProps = {
  /// ChartSeriesProps.xCellId
  readonly xCellId: Id;
  /// ChartSeriesProps.yCellId
  readonly yCellId: Id;
  /// ChartSeriesProps.sortCellId
  readonly sortCellId?: Id;
  /// ChartSeriesProps.descending
  readonly descending?: boolean;
  /// ChartSeriesProps.offset
  readonly offset?: number;
  /// ChartSeriesProps.limit
  readonly limit?: number;
};

/// CartesianChart
export function CartesianChart(
  props: (ChartTableSourceProps | ChartQuerySourceProps) &
    ChartProps & {readonly children?: ReactNode},
): ComponentReturnType;

/// LineSeries
export function LineSeries(props: ChartSeriesProps): ComponentReturnType;

/// BarSeries
export function BarSeries(props: ChartSeriesProps): ComponentReturnType;

/// LineChart
export function LineChart(
  props: (ChartTableSourceProps | ChartQuerySourceProps) &
    ChartBindingProps &
    ChartProps,
): ComponentReturnType;

/// BarChart
export function BarChart(
  props: (ChartTableSourceProps | ChartQuerySourceProps) &
    ChartBindingProps &
    ChartProps,
): ComponentReturnType;
