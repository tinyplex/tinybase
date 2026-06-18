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

/// TableSourceProps
export type TableSourceProps = {
  /// TableSourceProps.tableId
  readonly tableId: Id;
  /// TableSourceProps.store
  readonly store?: StoreOrStoreId;
  /// TableSourceProps.queryId
  readonly queryId?: never;
  /// TableSourceProps.queries
  readonly queries?: never;
};

/// QuerySourceProps
export type QuerySourceProps = {
  /// QuerySourceProps.queryId
  readonly queryId: Id;
  /// QuerySourceProps.queries
  readonly queries?: QueriesOrQueriesId;
  /// QuerySourceProps.tableId
  readonly tableId?: never;
  /// QuerySourceProps.store
  readonly store?: never;
};

/// BindingProps
export type BindingProps = {
  /// BindingProps.xCellId
  readonly xCellId: Id;
  /// BindingProps.yCellId
  readonly yCellId: Id;
  /// BindingProps.sortCellId
  readonly sortCellId?: Id;
  /// BindingProps.descending
  readonly descending?: boolean;
  /// BindingProps.offset
  readonly offset?: number;
  /// BindingProps.limit
  readonly limit?: number;
};

/// SeriesProps
export type SeriesProps = {
  /// SeriesProps.className
  readonly className?: string;
  /// SeriesProps.xCellId
  readonly xCellId: Id;
  /// SeriesProps.yCellId
  readonly yCellId: Id;
  /// SeriesProps.label
  readonly label?: string;
  /// SeriesProps.sortCellId
  readonly sortCellId?: Id;
  /// SeriesProps.descending
  readonly descending?: boolean;
  /// SeriesProps.offset
  readonly offset?: number;
  /// SeriesProps.limit
  readonly limit?: number;
};

/// XAxisScale
export type XAxisScale = 'auto' | 'category' | 'linear' | 'time';

/// TimestampUnit
export type TimestampUnit = 'millisecond' | 'second';

/// TimeValue
export type TimeValue = number | string | Date;

/// BaseXAxisProps
export type BaseXAxisProps = {
  /// XAxisProps.className
  readonly className?: string;
  /// XAxisProps.title
  readonly title?: string;
  /// XAxisProps.tickCount
  readonly tickCount?: number;
};

/// LinearXAxisProps
export type LinearXAxisProps = BaseXAxisProps & {
  /// XAxisProps.scale
  readonly scale?: 'auto' | 'category' | 'linear';
  /// XAxisProps.timestampUnit
  readonly timestampUnit?: never;
  /// XAxisProps.min
  readonly min?: number;
  /// XAxisProps.max
  readonly max?: number;
  /// XAxisProps.ticks
  readonly ticks?: readonly number[];
  /// XAxisProps.tickFormatter
  readonly tickFormatter?: (tick: boolean | number | string) => string;
};

/// TimeXAxisProps
export type TimeXAxisProps = BaseXAxisProps & {
  /// XAxisProps.scale
  readonly scale: 'time';
  /// XAxisProps.timestampUnit
  readonly timestampUnit?: TimestampUnit;
  /// XAxisProps.min
  readonly min?: TimeValue;
  /// XAxisProps.max
  readonly max?: TimeValue;
  /// XAxisProps.ticks
  readonly ticks?: readonly TimeValue[];
  /// XAxisProps.tickFormatter
  readonly tickFormatter?: (tick: Date, timestamp: number) => string;
};

/// XAxisProps
export type XAxisProps = LinearXAxisProps | TimeXAxisProps;

/// YAxisProps
export type YAxisProps = {
  /// YAxisProps.className
  readonly className?: string;
  /// YAxisProps.title
  readonly title?: string;
  /// YAxisProps.min
  readonly min?: number;
  /// YAxisProps.max
  readonly max?: number;
  /// YAxisProps.ticks
  readonly ticks?: readonly number[];
  /// YAxisProps.tickCount
  readonly tickCount?: number;
  /// YAxisProps.tickFormatter
  readonly tickFormatter?: (tick: number) => string;
};

/// CartesianChart
export function CartesianChart(
  props: (TableSourceProps | QuerySourceProps) &
    ChartProps & {readonly children?: ReactNode},
): ComponentReturnType;

/// XAxis
export function XAxis(props: XAxisProps): ComponentReturnType;

/// YAxis
export function YAxis(props: YAxisProps): ComponentReturnType;

/// LineSeries
export function LineSeries(props: SeriesProps): ComponentReturnType;

/// BarSeries
export function BarSeries(props: SeriesProps): ComponentReturnType;

/// LineChart
export function LineChart(
  props: (TableSourceProps | QuerySourceProps) &
    BindingProps &
    ChartProps & {readonly children?: ReactNode},
): ComponentReturnType;

/// BarChart
export function BarChart(
  props: (TableSourceProps | QuerySourceProps) &
    BindingProps &
    ChartProps & {readonly children?: ReactNode},
): ComponentReturnType;
