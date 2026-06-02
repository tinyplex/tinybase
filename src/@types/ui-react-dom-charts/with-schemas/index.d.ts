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
export type ChartBindingProps<CellId extends Id = Id> = {
  /// ChartBindingProps.xCellId
  readonly xCellId: CellId;
  /// ChartBindingProps.yCellId
  readonly yCellId: CellId;
  /// ChartBindingProps.sortCellId
  readonly sortCellId?: CellId;
  /// ChartBindingProps.descending
  readonly descending?: boolean;
  /// ChartBindingProps.offset
  readonly offset?: number;
  /// ChartBindingProps.limit
  readonly limit?: number;
};

/// ChartSeriesProps
export type ChartSeriesProps<CellId extends Id = Id> = {
  /// ChartSeriesProps.xCellId
  readonly xCellId: CellId;
  /// ChartSeriesProps.yCellId
  readonly yCellId: CellId;
  /// ChartSeriesProps.sortCellId
  readonly sortCellId?: CellId;
  /// ChartSeriesProps.descending
  readonly descending?: boolean;
  /// ChartSeriesProps.offset
  readonly offset?: number;
  /// ChartSeriesProps.limit
  readonly limit?: number;
};

type ChartTableBindingProps<
  Schemas extends OptionalSchemas,
  TableIds extends TableIdFromSchema<Schemas[0]> = TableIdFromSchema<
    Schemas[0]
  >,
> = TableIds extends infer TableId
  ? TableId extends TableIdFromSchema<Schemas[0]>
    ? ChartTableSourceProps<Schemas, TableId> &
        ChartBindingProps<CellIdFromSchema<Schemas[0], TableId>>
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

  /// LineSeries
  LineSeries: (props: ChartSeriesProps) => ComponentReturnType;

  /// BarSeries
  BarSeries: (props: ChartSeriesProps) => ComponentReturnType;

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
