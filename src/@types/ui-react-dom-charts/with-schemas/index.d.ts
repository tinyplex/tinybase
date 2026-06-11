/// ui-react-dom-charts
import type {ReactNode} from 'react';
import type {
  CellIdFromSchema,
  TableIdFromSchema,
} from '../../_internal/store/with-schemas/index.d.ts';
import type {ComponentReturnType} from '../../_internal/ui-react/with-schemas/index.d.ts';
import type {
  QueriesOrQueriesId,
  StoreOrStoreId,
} from '../../_internal/ui/with-schemas/index.d.ts';
import type {Id} from '../../common/with-schemas/index.d.ts';
import type {OptionalSchemas} from '../../store/with-schemas/index.d.ts';

/// ChartProps
export type ChartProps = {
  /// ChartProps.className
  readonly className?: string;
};

/// ChartTableSourceProps
export type ChartTableSourceProps<
  Schemas extends OptionalSchemas,
  TableIds extends TableIdFromSchema<Schemas[0]> = TableIdFromSchema<
    Schemas[0]
  >,
> = TableIds extends infer TableId
  ? TableId extends TableIdFromSchema<Schemas[0]>
    ? {
        /// ChartTableSourceProps.tableId
        readonly tableId: TableId;
        /// ChartTableSourceProps.store
        readonly store?: StoreOrStoreId<Schemas>;
        /// ChartTableSourceProps.queryId
        readonly queryId?: never;
        /// ChartTableSourceProps.queries
        readonly queries?: never;
      }
    : never
  : never;

/// ChartQuerySourceProps
export type ChartQuerySourceProps<Schemas extends OptionalSchemas> = {
  /// ChartQuerySourceProps.queryId
  readonly queryId: Id;
  /// ChartQuerySourceProps.queries
  readonly queries?: QueriesOrQueriesId<Schemas>;
  /// ChartQuerySourceProps.tableId
  readonly tableId?: never;
  /// ChartQuerySourceProps.store
  readonly store?: never;
};

/// ChartBindingProps
export type ChartBindingProps<
  XCellId extends Id = Id,
  YCellId extends Id = Id,
  SortCellId extends Id = XCellId,
> = {
  /// ChartBindingProps.xCellId
  readonly xCellId: XCellId;
  /// ChartBindingProps.yCellId
  readonly yCellId: YCellId;
  /// ChartBindingProps.sortCellId
  readonly sortCellId?: SortCellId;
  /// ChartBindingProps.descending
  readonly descending?: boolean;
  /// ChartBindingProps.offset
  readonly offset?: number;
  /// ChartBindingProps.limit
  readonly limit?: number;
};

/// SeriesProps
export type SeriesProps<CellId extends Id = Id> = {
  /// SeriesProps.className
  readonly className?: string;
  /// SeriesProps.xCellId
  readonly xCellId: CellId;
  /// SeriesProps.yCellId
  readonly yCellId: CellId;
  /// SeriesProps.label
  readonly label?: string;
  /// SeriesProps.sortCellId
  readonly sortCellId?: CellId;
  /// SeriesProps.descending
  readonly descending?: boolean;
  /// SeriesProps.offset
  readonly offset?: number;
  /// SeriesProps.limit
  readonly limit?: number;
};

/// XAxisProps
export type XAxisProps = {
  /// XAxisProps.className
  readonly className?: string;
  /// XAxisProps.title
  readonly title?: string;
  /// XAxisProps.min
  readonly min?: number;
  /// XAxisProps.max
  readonly max?: number;
  /// XAxisProps.ticks
  readonly ticks?: readonly number[];
  /// XAxisProps.tickCount
  readonly tickCount?: number;
  /// XAxisProps.tickFormatter
  readonly tickFormatter?: (tick: boolean | number | string) => string;
};

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

type NumericCellIdFromSchema<
  Schemas extends OptionalSchemas,
  TableId extends TableIdFromSchema<Schemas[0]>,
> = {
  [CellId in CellIdFromSchema<
    Schemas[0],
    TableId
  >]: Schemas[0][TableId][CellId] extends {type: 'any' | 'number'}
    ? CellId
    : never;
}[CellIdFromSchema<Schemas[0], TableId>];

type ChartTableBindingProps<
  Schemas extends OptionalSchemas,
  TableIds extends TableIdFromSchema<Schemas[0]> = TableIdFromSchema<
    Schemas[0]
  >,
> = TableIds extends infer TableId
  ? TableId extends TableIdFromSchema<Schemas[0]>
    ? ChartTableSourceProps<Schemas, TableId> &
        ChartBindingProps<
          CellIdFromSchema<Schemas[0], TableId>,
          NumericCellIdFromSchema<Schemas, TableId>,
          CellIdFromSchema<Schemas[0], TableId>
        >
    : never
  : never;

/// WithSchemas
export type WithSchemas<Schemas extends OptionalSchemas> = {
  /// CartesianChart
  CartesianChart: {
    (
      props: ChartTableSourceProps<Schemas> &
        ChartProps & {readonly children?: ReactNode},
    ): ComponentReturnType;
    (
      props: ChartQuerySourceProps<Schemas> &
        ChartProps & {readonly children?: ReactNode},
    ): ComponentReturnType;
  };

  /// XAxis
  XAxis: (props: XAxisProps) => ComponentReturnType;

  /// YAxis
  YAxis: (props: YAxisProps) => ComponentReturnType;

  /// LineSeries
  LineSeries: (props: SeriesProps) => ComponentReturnType;

  /// BarSeries
  BarSeries: (props: SeriesProps) => ComponentReturnType;

  /// LineChart
  LineChart: (
    props:
      | (ChartTableBindingProps<Schemas> & ChartProps)
      | (ChartQuerySourceProps<Schemas> & ChartBindingProps & ChartProps),
  ) => ComponentReturnType;

  /// BarChart
  BarChart: (
    props:
      | (ChartTableBindingProps<Schemas> & ChartProps)
      | (ChartQuerySourceProps<Schemas> & ChartBindingProps & ChartProps),
  ) => ComponentReturnType;
};
