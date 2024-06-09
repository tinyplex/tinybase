import type {Callback, Id} from '../../../common/with-schemas/index.d.ts';
import type {
  CellIdFromSchema,
  TableIdFromSchema,
  ValueIdFromSchema,
} from '../../store/with-schemas/index.d.ts';
import type {ComponentType, ReactElement} from 'react';
import type {
  OptionalSchemas,
  Store,
} from '../../../store/with-schemas/index.d.ts';
import type {Checkpoints} from '../../../checkpoints/with-schemas/index.d.ts';
import type {Indexes} from '../../../indexes/with-schemas/index.d.ts';
import type {Metrics} from '../../../metrics/with-schemas/index.d.ts';
import type {Queries} from '../../../queries/with-schemas/index.d.ts';
import type {Relationships} from '../../../relationships/with-schemas/index.d.ts';

type StoreOrStoreId<Schemas extends OptionalSchemas> = Store<Schemas> | Id;

type MetricsOrMetricsId<Schemas extends OptionalSchemas> =
  | Metrics<Schemas>
  | Id;

type IndexesOrIndexesId<Schemas extends OptionalSchemas> =
  | Indexes<Schemas>
  | Id;

type RelationshipsOrRelationshipsId<Schemas extends OptionalSchemas> =
  | Relationships<Schemas>
  | Id;

type QueriesOrQueriesId<Schemas extends OptionalSchemas> =
  | Queries<Schemas>
  | Id;

type CheckpointsOrCheckpointsId<Schemas extends OptionalSchemas> =
  | Checkpoints<Schemas>
  | Id;

type UndoOrRedoInformation = [boolean, Callback, Id | undefined, string];

type GetId<Schemas extends OptionalSchemas, Parameter, Id> = (
  parameter: Parameter,
  store: Store<Schemas>,
) => Id;

type ExtraProps = {[propName: string]: any};

type TablesProps<Schemas extends OptionalSchemas> = {
  /// TablesProps.store
  readonly store?: StoreOrStoreId<Schemas>;
  /// TablesProps.tableComponent
  readonly tableComponent?: ComponentType<TableProps<Schemas>>;
  /// TablesProps.getTableComponentProps
  readonly getTableComponentProps?: (tableId: Id) => ExtraProps;
  /// TablesProps.separator
  readonly separator?: ReactElement | string;
  /// TablesProps.debugIds
  readonly debugIds?: boolean;
};

export type TableProps<
  Schemas extends OptionalSchemas,
  TableIds extends TableIdFromSchema<Schemas[0]> = TableIdFromSchema<
    Schemas[0]
  >,
> = TableIds extends infer TableId
  ? TableId extends TableIdFromSchema<Schemas[0]>
    ? {
        /// TableProps.tableId
        readonly tableId: TableId;
        /// TableProps.store
        readonly store?: StoreOrStoreId<Schemas>;
        /// TableProps.rowComponent
        readonly rowComponent?: ComponentType<RowProps<Schemas, TableId>>;
        /// TableProps.getRowComponentProps
        readonly getRowComponentProps?: (rowId: Id) => ExtraProps;
        /// TableProps.customCellIds
        readonly customCellIds?: CellIdFromSchema<Schemas[0], TableId>[];
        /// TableProps.separator
        readonly separator?: ReactElement | string;
        /// TableProps.debugIds
        readonly debugIds?: boolean;
      }
    : never
  : never;

export type SortedTableProps<
  Schemas extends OptionalSchemas,
  TableIds extends TableIdFromSchema<Schemas[0]> = TableIdFromSchema<
    Schemas[0]
  >,
> = TableIds extends infer TableId
  ? TableId extends TableIdFromSchema<Schemas[0]>
    ? {
        /// SortedTableProps.tableId
        readonly tableId: TableId;
        /// SortedTableProps.cellId
        readonly cellId?: CellIdFromSchema<Schemas[0], TableId>;
        /// SortedTableProps.descending
        readonly descending?: boolean;
        /// SortedTableProps.offset
        readonly offset?: number;
        /// SortedTableProps.limit
        readonly limit?: number;
        /// SortedTableProps.store
        readonly store?: StoreOrStoreId<Schemas>;
        /// SortedTableProps.rowComponent
        readonly rowComponent?: ComponentType<RowProps<Schemas, TableId>>;
        /// SortedTableProps.getRowComponentProps
        readonly getRowComponentProps?: (rowId: Id) => ExtraProps;
        /// SortedTableProps.customCellIds
        readonly customCellIds?: CellIdFromSchema<Schemas[0], TableId>[];
        /// SortedTableProps.separator
        readonly separator?: ReactElement | string;
        /// SortedTableProps.debugIds
        readonly debugIds?: boolean;
      }
    : never
  : never;

export type RowProps<
  Schemas extends OptionalSchemas,
  TableIds extends TableIdFromSchema<Schemas[0]> = TableIdFromSchema<
    Schemas[0]
  >,
> = TableIds extends infer TableId
  ? TableId extends TableIdFromSchema<Schemas[0]>
    ? {
        /// RowProps.tableId
        readonly tableId: TableId;
        /// RowProps.rowId
        readonly rowId: Id;
        /// RowProps.store
        readonly store?: StoreOrStoreId<Schemas>;
        /// RowProps.cellComponent
        readonly cellComponent?: ComponentType<CellProps<Schemas, TableId>>;
        /// RowProps.getCellComponentProps
        readonly getCellComponentProps?: (cellId: Id) => ExtraProps;
        /// RowProps.customCellIds
        readonly customCellIds?: CellIdFromSchema<Schemas[0], TableId>[];
        /// RowProps.separator
        readonly separator?: ReactElement | string;
        /// RowProps.debugIds
        readonly debugIds?: boolean;
      }
    : never
  : never;

export type CellProps<
  Schemas extends OptionalSchemas,
  TableIds extends TableIdFromSchema<Schemas[0]> = TableIdFromSchema<
    Schemas[0]
  >,
> = TableIds extends infer TableId
  ? TableId extends TableIdFromSchema<Schemas[0]>
    ? CellPropsForTableIdAndCellId<
        Schemas,
        TableId,
        CellIdFromSchema<Schemas[0], TableId>
      >
    : never
  : never;

export type CellPropsForTableIdAndCellId<
  Schemas extends OptionalSchemas,
  TableId extends TableIdFromSchema<Schemas[0]>,
  CellId extends CellIdFromSchema<Schemas[0], TableId>,
> = {
  /// CellProps.tableId
  readonly tableId: TableId;
  /// CellProps.rowId
  readonly rowId: Id;
  /// CellProps.cellId
  readonly cellId: CellId;
  /// CellProps.store
  readonly store?: StoreOrStoreId<Schemas>;
  /// CellProps.debugIds
  readonly debugIds?: boolean;
};

export type ValuesProps<Schemas extends OptionalSchemas> = {
  /// ValuesProps.store
  readonly store?: StoreOrStoreId<Schemas>;
  /// ValuesProps.valueComponent
  readonly valueComponent?: ComponentType<ValueProps<Schemas>>;
  /// ValuesProps.getValueComponentProps
  readonly getValueComponentProps?: (valueId: Id) => ExtraProps;
  /// ValuesProps.separator
  readonly separator?: ReactElement | string;
  /// ValuesProps.debugIds
  readonly debugIds?: boolean;
};

export type ValueProps<Schemas extends OptionalSchemas> = {
  /// ValueProps.valueId
  readonly valueId: ValueIdFromSchema<Schemas[1]>;
  /// ValueProps.store
  readonly store?: StoreOrStoreId<Schemas>;
  /// ValueProps.debugIds
  readonly debugIds?: boolean;
};

export type MetricProps<Schemas extends OptionalSchemas> = {
  /// MetricProps.metricId
  readonly metricId: Id;
  /// MetricProps.metrics
  readonly metrics?: MetricsOrMetricsId<Schemas>;
  /// MetricProps.debugIds
  readonly debugIds?: boolean;
};

export type IndexProps<Schemas extends OptionalSchemas> = {
  /// IndexProps.indexId
  readonly indexId: Id;
  /// IndexProps.indexes
  readonly indexes?: IndexesOrIndexesId<Schemas>;
  /// IndexProps.sliceComponent
  readonly sliceComponent?: ComponentType<SliceProps<Schemas>>;
  /// IndexProps.getSliceComponentProps
  readonly getSliceComponentProps?: (sliceId: Id) => ExtraProps;
  /// IndexProps.separator
  readonly separator?: ReactElement | string;
  /// IndexProps.debugIds
  readonly debugIds?: boolean;
};

export type SliceProps<Schemas extends OptionalSchemas> = {
  /// SliceProps.indexId
  readonly indexId: Id;
  /// SliceProps.sliceId
  readonly sliceId: Id;
  /// SliceProps.indexes
  readonly indexes?: IndexesOrIndexesId<Schemas>;
  /// SliceProps.rowComponent
  readonly rowComponent?: ComponentType<RowProps<Schemas>>;
  /// SliceProps.getRowComponentProps
  readonly getRowComponentProps?: (rowId: Id) => ExtraProps;
  /// SliceProps.separator
  readonly separator?: ReactElement | string;
  /// SliceProps.debugIds
  readonly debugIds?: boolean;
};

export type RemoteRowProps<Schemas extends OptionalSchemas> = {
  /// RemoteRowProps.relationshipId
  readonly relationshipId: Id;
  /// RemoteRowProps.localRowId
  readonly localRowId: Id;
  /// RemoteRowProps.relationships
  readonly relationships?: RelationshipsOrRelationshipsId<Schemas>;
  /// RemoteRowProps.rowComponent
  readonly rowComponent?: ComponentType<RowProps<Schemas>>;
  /// RemoteRowProps.getRowComponentProps
  readonly getRowComponentProps?: (rowId: Id) => ExtraProps;
  /// RemoteRowProps.debugIds
  readonly debugIds?: boolean;
};

export type LocalRowsProps<Schemas extends OptionalSchemas> = {
  /// LocalRowsProps.relationshipId
  readonly relationshipId: Id;
  /// LocalRowsProps.remoteRowId
  readonly remoteRowId: Id;
  /// LocalRowsProps.relationships
  readonly relationships?: RelationshipsOrRelationshipsId<Schemas>;
  /// LocalRowsProps.rowComponent
  readonly rowComponent?: ComponentType<RowProps<Schemas>>;
  /// LocalRowsProps.getRowComponentProps
  readonly getRowComponentProps?: (rowId: Id) => ExtraProps;
  /// LocalRowsProps.separator
  readonly separator?: ReactElement | string;
  /// LocalRowsProps.debugIds
  readonly debugIds?: boolean;
};

export type LinkedRowsProps<Schemas extends OptionalSchemas> = {
  /// LinkedRowsProps.relationshipId
  readonly relationshipId: Id;
  /// LinkedRowsProps.firstRowId
  readonly firstRowId: Id;
  /// LinkedRowsProps.relationships
  readonly relationships?: RelationshipsOrRelationshipsId<Schemas>;
  /// LinkedRowsProps.rowComponent
  readonly rowComponent?: ComponentType<RowProps<Schemas>>;
  /// LinkedRowsProps.getRowComponentProps
  readonly getRowComponentProps?: (rowId: Id) => ExtraProps;
  /// LinkedRowsProps.separator
  readonly separator?: ReactElement | string;
  /// LinkedRowsProps.debugIds
  readonly debugIds?: boolean;
};

export type ResultTableProps<Schemas extends OptionalSchemas> = {
  /// ResultTableProps.queryId
  readonly queryId: Id;
  /// ResultTableProps.queries
  readonly queries?: QueriesOrQueriesId<Schemas>;
  /// ResultTableProps.resultRowComponent
  readonly resultRowComponent?: ComponentType<ResultRowProps<Schemas>>;
  /// ResultTableProps.getResultRowComponentProps
  readonly getResultRowComponentProps?: (rowId: Id) => ExtraProps;
  /// ResultTableProps.separator
  readonly separator?: ReactElement | string;
  /// ResultTableProps.debugIds
  readonly debugIds?: boolean;
};

export type ResultSortedTableProps<Schemas extends OptionalSchemas> = {
  /// ResultSortedTableProps.queryId
  readonly queryId: Id;
  /// ResultSortedTableProps.cellId
  readonly cellId?: Id;
  /// ResultSortedTableProps.descending
  readonly descending?: boolean;
  /// ResultSortedTableProps.offset
  readonly offset?: number;
  /// ResultSortedTableProps.limit
  readonly limit?: number;
  /// ResultSortedTableProps.queries
  readonly queries?: QueriesOrQueriesId<Schemas>;
  /// ResultSortedTableProps.resultRowComponent
  readonly resultRowComponent?: ComponentType<ResultRowProps<Schemas>>;
  /// ResultSortedTableProps.getResultRowComponentProps
  readonly getResultRowComponentProps?: (rowId: Id) => ExtraProps;
  /// ResultSortedTableProps.separator
  readonly separator?: ReactElement | string;
  /// ResultSortedTableProps.debugIds
  readonly debugIds?: boolean;
};

export type ResultRowProps<Schemas extends OptionalSchemas> = {
  /// ResultRowProps.queryId
  readonly queryId: Id;
  /// ResultRowProps.rowId
  readonly rowId: Id;
  /// ResultRowProps.queries
  readonly queries?: QueriesOrQueriesId<Schemas>;
  /// ResultRowProps.resultCellComponent
  readonly resultCellComponent?: ComponentType<ResultCellProps<Schemas>>;
  /// ResultRowProps.getResultCellComponentProps
  readonly getResultCellComponentProps?: (cellId: Id) => ExtraProps;
  /// ResultRowProps.separator
  readonly separator?: ReactElement | string;
  /// ResultRowProps.debugIds
  readonly debugIds?: boolean;
};

export type ResultCellProps<Schemas extends OptionalSchemas> = {
  /// ResultCellProps.queryId
  readonly queryId: Id;
  /// ResultCellProps.rowId
  readonly rowId: Id;
  /// ResultCellProps.cellId
  readonly cellId: Id;
  /// ResultCellProps.queries
  readonly queries?: QueriesOrQueriesId<Schemas>;
  /// ResultCellProps.debugIds
  readonly debugIds?: boolean;
};

export type CheckpointProps<Schemas extends OptionalSchemas> = {
  /// CheckpointProps.checkpointId
  readonly checkpointId: Id;
  /// CheckpointProps.checkpoints
  readonly checkpoints?: CheckpointsOrCheckpointsId<Schemas>;
  /// CheckpointProps.debugIds
  readonly debugIds?: boolean;
};

export type BackwardCheckpointsProps<Schemas extends OptionalSchemas> = {
  /// BackwardCheckpointsProps.checkpoints
  readonly checkpoints?: CheckpointsOrCheckpointsId<Schemas>;
  /// BackwardCheckpointsProps.checkpointComponent
  readonly checkpointComponent?: ComponentType<CheckpointProps<Schemas>>;
  /// BackwardCheckpointsProps.getCheckpointComponentProps
  readonly getCheckpointComponentProps?: (checkpointId: Id) => ExtraProps;
  /// BackwardCheckpointsProps.separator
  readonly separator?: ReactElement | string;
  /// BackwardCheckpointsProps.debugIds
  readonly debugIds?: boolean;
};

export type CurrentCheckpointProps<Schemas extends OptionalSchemas> = {
  /// CurrentCheckpointProps.checkpoints
  readonly checkpoints?: CheckpointsOrCheckpointsId<Schemas>;
  /// CurrentCheckpointProps.checkpointComponent
  readonly checkpointComponent?: ComponentType<CheckpointProps<Schemas>>;
  /// CurrentCheckpointProps.getCheckpointComponentProps
  readonly getCheckpointComponentProps?: (checkpointId: Id) => ExtraProps;
  /// CurrentCheckpointProps.debugIds
  readonly debugIds?: boolean;
};

export type ForwardCheckpointsProps<Schemas extends OptionalSchemas> = {
  /// ForwardCheckpointsProps.checkpoints
  readonly checkpoints?: CheckpointsOrCheckpointsId<Schemas>;
  /// ForwardCheckpointsProps.checkpointComponent
  readonly checkpointComponent?: ComponentType<CheckpointProps<Schemas>>;
  /// ForwardCheckpointsProps.getCheckpointComponentProps
  readonly getCheckpointComponentProps?: (checkpointId: Id) => ExtraProps;
  /// ForwardCheckpointsProps.separator
  readonly separator?: ReactElement | string;
  /// ForwardCheckpointsProps.debugIds
  readonly debugIds?: boolean;
};

export type ProviderProps<Schemas extends OptionalSchemas> = {
  /// ProviderProps.store
  readonly store?: Store<Schemas>;
  /// ProviderProps.storesById
  readonly storesById?: {[storeId: Id]: Store<Schemas>};
  /// ProviderProps.metrics
  readonly metrics?: Metrics<Schemas>;
  /// ProviderProps.metricsById
  readonly metricsById?: {[metricsId: Id]: Metrics<Schemas>};
  /// ProviderProps.indexes
  readonly indexes?: Indexes<Schemas>;
  /// ProviderProps.indexesById
  readonly indexesById?: {[indexesId: Id]: Indexes<Schemas>};
  /// ProviderProps.relationships
  readonly relationships?: Relationships<Schemas>;
  /// ProviderProps.relationshipsById
  readonly relationshipsById?: {[relationshipsId: Id]: Relationships<Schemas>};
  /// ProviderProps.queries
  readonly queries?: Queries<Schemas>;
  /// ProviderProps.queriesById
  readonly queriesById?: {[queriesId: Id]: Queries<Schemas>};
  /// ProviderProps.checkpoints
  readonly checkpoints?: Checkpoints<Schemas>;
  /// ProviderProps.checkpointsById
  readonly checkpointsById?: {[checkpointsId: Id]: Checkpoints<Schemas>};
};

export type ComponentReturnType = ReactElement<any, any> | null;
