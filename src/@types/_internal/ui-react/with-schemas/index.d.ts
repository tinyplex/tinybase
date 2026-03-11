import type {ComponentType, ReactElement} from 'react';
import type {Checkpoints} from '../../../checkpoints/with-schemas/index.d.ts';
import type {Callback, Id} from '../../../common/with-schemas/index.d.ts';
import type {Indexes} from '../../../indexes/with-schemas/index.d.ts';
import type {Metrics} from '../../../metrics/with-schemas/index.d.ts';
import type {
  Persister,
  Persists,
} from '../../../persisters/with-schemas/index.d.ts';
import type {Queries} from '../../../queries/with-schemas/index.d.ts';
import type {Relationships} from '../../../relationships/with-schemas/index.d.ts';
import type {
  OptionalSchemas,
  Store,
} from '../../../store/with-schemas/index.d.ts';
import type {Synchronizer} from '../../../synchronizers/with-schemas/index.d.ts';
import type {
  CellIdFromSchema,
  TableIdFromSchema,
  ValueIdFromSchema,
} from '../../store/with-schemas/index.d.ts';
import type {
  CheckpointsOrCheckpointsId,
  IndexesOrIndexesId,
  MetricsOrMetricsId,
  QueriesOrQueriesId,
  RelationshipsOrRelationshipsId,
  StoreOrStoreId,
} from '../../ui/with-schemas/index.d.ts';

type UndoOrRedoInformation = [boolean, Callback, Id | undefined, string];

type GetId<Schemas extends OptionalSchemas, Parameter, Id> = (
  parameter: Parameter,
  store: Store<Schemas>,
) => Id;

type ExtraProps = {[propName: string]: any};

export type TablesProps<Schemas extends OptionalSchemas> = {
  /// ui-react.TablesProps.store
  readonly store?: StoreOrStoreId<Schemas>;
  /// ui-react.TablesProps.tableComponent
  readonly tableComponent?: ComponentType<TableProps<Schemas>>;
  /// ui-react.TablesProps.getTableComponentProps
  readonly getTableComponentProps?: (tableId: Id) => ExtraProps;
  /// ui-react.TablesProps.separator
  readonly separator?: ReactElement | string;
  /// ui-react.TablesProps.debugIds
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
        /// ui-react.TableProps.tableId
        readonly tableId: TableId;
        /// ui-react.TableProps.store
        readonly store?: StoreOrStoreId<Schemas>;
        /// ui-react.TableProps.rowComponent
        readonly rowComponent?: ComponentType<RowProps<Schemas, TableId>>;
        /// ui-react.TableProps.getRowComponentProps
        readonly getRowComponentProps?: (rowId: Id) => ExtraProps;
        /// ui-react.TableProps.customCellIds
        readonly customCellIds?: CellIdFromSchema<Schemas[0], TableId>[];
        /// ui-react.TableProps.separator
        readonly separator?: ReactElement | string;
        /// ui-react.TableProps.debugIds
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
        /// ui-react.SortedTableProps.tableId
        readonly tableId: TableId;
        /// ui-react.SortedTableProps.cellId
        readonly cellId?: CellIdFromSchema<Schemas[0], TableId>;
        /// ui-react.SortedTableProps.descending
        readonly descending?: boolean;
        /// ui-react.SortedTableProps.offset
        readonly offset?: number;
        /// ui-react.SortedTableProps.limit
        readonly limit?: number;
        /// ui-react.SortedTableProps.store
        readonly store?: StoreOrStoreId<Schemas>;
        /// ui-react.SortedTableProps.rowComponent
        readonly rowComponent?: ComponentType<RowProps<Schemas, TableId>>;
        /// ui-react.SortedTableProps.getRowComponentProps
        readonly getRowComponentProps?: (rowId: Id) => ExtraProps;
        /// ui-react.SortedTableProps.customCellIds
        readonly customCellIds?: CellIdFromSchema<Schemas[0], TableId>[];
        /// ui-react.SortedTableProps.separator
        readonly separator?: ReactElement | string;
        /// ui-react.SortedTableProps.debugIds
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
        /// ui-react.RowProps.tableId
        readonly tableId: TableId;
        /// ui-react.RowProps.rowId
        readonly rowId: Id;
        /// ui-react.RowProps.store
        readonly store?: StoreOrStoreId<Schemas>;
        /// ui-react.RowProps.cellComponent
        readonly cellComponent?: ComponentType<CellProps<Schemas, TableId>>;
        /// ui-react.RowProps.getCellComponentProps
        readonly getCellComponentProps?: (cellId: Id) => ExtraProps;
        /// ui-react.RowProps.customCellIds
        readonly customCellIds?: CellIdFromSchema<Schemas[0], TableId>[];
        /// ui-react.RowProps.separator
        readonly separator?: ReactElement | string;
        /// ui-react.RowProps.debugIds
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
  /// ui-react.CellProps.tableId
  readonly tableId: TableId;
  /// ui-react.CellProps.rowId
  readonly rowId: Id;
  /// ui-react.CellProps.cellId
  readonly cellId: CellId;
  /// ui-react.CellProps.store
  readonly store?: StoreOrStoreId<Schemas>;
  /// ui-react.CellProps.debugIds
  readonly debugIds?: boolean;
};

export type ValuesProps<Schemas extends OptionalSchemas> = {
  /// ui-react.ValuesProps.store
  readonly store?: StoreOrStoreId<Schemas>;
  /// ui-react.ValuesProps.valueComponent
  readonly valueComponent?: ComponentType<ValueProps<Schemas>>;
  /// ui-react.ValuesProps.getValueComponentProps
  readonly getValueComponentProps?: (valueId: Id) => ExtraProps;
  /// ui-react.ValuesProps.separator
  readonly separator?: ReactElement | string;
  /// ui-react.ValuesProps.debugIds
  readonly debugIds?: boolean;
};

export type ValueProps<Schemas extends OptionalSchemas> = {
  /// ui-react.ValueProps.valueId
  readonly valueId: ValueIdFromSchema<Schemas[1]>;
  /// ui-react.ValueProps.store
  readonly store?: StoreOrStoreId<Schemas>;
  /// ui-react.ValueProps.debugIds
  readonly debugIds?: boolean;
};

export type MetricProps<Schemas extends OptionalSchemas> = {
  /// ui-react.MetricProps.metricId
  readonly metricId: Id;
  /// ui-react.MetricProps.metrics
  readonly metrics?: MetricsOrMetricsId<Schemas>;
  /// ui-react.MetricProps.debugIds
  readonly debugIds?: boolean;
};

export type IndexProps<Schemas extends OptionalSchemas> = {
  /// ui-react.IndexProps.indexId
  readonly indexId: Id;
  /// ui-react.IndexProps.indexes
  readonly indexes?: IndexesOrIndexesId<Schemas>;
  /// ui-react.IndexProps.sliceComponent
  readonly sliceComponent?: ComponentType<SliceProps<Schemas>>;
  /// ui-react.IndexProps.getSliceComponentProps
  readonly getSliceComponentProps?: (sliceId: Id) => ExtraProps;
  /// ui-react.IndexProps.separator
  readonly separator?: ReactElement | string;
  /// ui-react.IndexProps.debugIds
  readonly debugIds?: boolean;
};

export type SliceProps<Schemas extends OptionalSchemas> = {
  /// ui-react.SliceProps.indexId
  readonly indexId: Id;
  /// ui-react.SliceProps.sliceId
  readonly sliceId: Id;
  /// ui-react.SliceProps.indexes
  readonly indexes?: IndexesOrIndexesId<Schemas>;
  /// ui-react.SliceProps.rowComponent
  readonly rowComponent?: ComponentType<RowProps<Schemas>>;
  /// ui-react.SliceProps.getRowComponentProps
  readonly getRowComponentProps?: (rowId: Id) => ExtraProps;
  /// ui-react.SliceProps.separator
  readonly separator?: ReactElement | string;
  /// ui-react.SliceProps.debugIds
  readonly debugIds?: boolean;
};

export type RemoteRowProps<Schemas extends OptionalSchemas> = {
  /// ui-react.RemoteRowProps.relationshipId
  readonly relationshipId: Id;
  /// ui-react.RemoteRowProps.localRowId
  readonly localRowId: Id;
  /// ui-react.RemoteRowProps.relationships
  readonly relationships?: RelationshipsOrRelationshipsId<Schemas>;
  /// ui-react.RemoteRowProps.rowComponent
  readonly rowComponent?: ComponentType<RowProps<Schemas>>;
  /// ui-react.RemoteRowProps.getRowComponentProps
  readonly getRowComponentProps?: (rowId: Id) => ExtraProps;
  /// ui-react.RemoteRowProps.debugIds
  readonly debugIds?: boolean;
};

export type LocalRowsProps<Schemas extends OptionalSchemas> = {
  /// ui-react.LocalRowsProps.relationshipId
  readonly relationshipId: Id;
  /// ui-react.LocalRowsProps.remoteRowId
  readonly remoteRowId: Id;
  /// ui-react.LocalRowsProps.relationships
  readonly relationships?: RelationshipsOrRelationshipsId<Schemas>;
  /// ui-react.LocalRowsProps.rowComponent
  readonly rowComponent?: ComponentType<RowProps<Schemas>>;
  /// ui-react.LocalRowsProps.getRowComponentProps
  readonly getRowComponentProps?: (rowId: Id) => ExtraProps;
  /// ui-react.LocalRowsProps.separator
  readonly separator?: ReactElement | string;
  /// ui-react.LocalRowsProps.debugIds
  readonly debugIds?: boolean;
};

export type LinkedRowsProps<Schemas extends OptionalSchemas> = {
  /// ui-react.LinkedRowsProps.relationshipId
  readonly relationshipId: Id;
  /// ui-react.LinkedRowsProps.firstRowId
  readonly firstRowId: Id;
  /// ui-react.LinkedRowsProps.relationships
  readonly relationships?: RelationshipsOrRelationshipsId<Schemas>;
  /// ui-react.LinkedRowsProps.rowComponent
  readonly rowComponent?: ComponentType<RowProps<Schemas>>;
  /// ui-react.LinkedRowsProps.getRowComponentProps
  readonly getRowComponentProps?: (rowId: Id) => ExtraProps;
  /// ui-react.LinkedRowsProps.separator
  readonly separator?: ReactElement | string;
  /// ui-react.LinkedRowsProps.debugIds
  readonly debugIds?: boolean;
};

export type ResultTableProps<Schemas extends OptionalSchemas> = {
  /// ui-react.ResultTableProps.queryId
  readonly queryId: Id;
  /// ui-react.ResultTableProps.queries
  readonly queries?: QueriesOrQueriesId<Schemas>;
  /// ui-react.ResultTableProps.resultRowComponent
  readonly resultRowComponent?: ComponentType<ResultRowProps<Schemas>>;
  /// ui-react.ResultTableProps.getResultRowComponentProps
  readonly getResultRowComponentProps?: (rowId: Id) => ExtraProps;
  /// ui-react.ResultTableProps.separator
  readonly separator?: ReactElement | string;
  /// ui-react.ResultTableProps.debugIds
  readonly debugIds?: boolean;
};

export type ResultSortedTableProps<Schemas extends OptionalSchemas> = {
  /// ui-react.ResultSortedTableProps.queryId
  readonly queryId: Id;
  /// ui-react.ResultSortedTableProps.cellId
  readonly cellId?: Id;
  /// ui-react.ResultSortedTableProps.descending
  readonly descending?: boolean;
  /// ui-react.ResultSortedTableProps.offset
  readonly offset?: number;
  /// ui-react.ResultSortedTableProps.limit
  readonly limit?: number;
  /// ui-react.ResultSortedTableProps.queries
  readonly queries?: QueriesOrQueriesId<Schemas>;
  /// ui-react.ResultSortedTableProps.resultRowComponent
  readonly resultRowComponent?: ComponentType<ResultRowProps<Schemas>>;
  /// ui-react.ResultSortedTableProps.getResultRowComponentProps
  readonly getResultRowComponentProps?: (rowId: Id) => ExtraProps;
  /// ui-react.ResultSortedTableProps.separator
  readonly separator?: ReactElement | string;
  /// ui-react.ResultSortedTableProps.debugIds
  readonly debugIds?: boolean;
};

export type ResultRowProps<Schemas extends OptionalSchemas> = {
  /// ui-react.ResultRowProps.queryId
  readonly queryId: Id;
  /// ui-react.ResultRowProps.rowId
  readonly rowId: Id;
  /// ui-react.ResultRowProps.queries
  readonly queries?: QueriesOrQueriesId<Schemas>;
  /// ui-react.ResultRowProps.resultCellComponent
  readonly resultCellComponent?: ComponentType<ResultCellProps<Schemas>>;
  /// ui-react.ResultRowProps.getResultCellComponentProps
  readonly getResultCellComponentProps?: (cellId: Id) => ExtraProps;
  /// ui-react.ResultRowProps.separator
  readonly separator?: ReactElement | string;
  /// ui-react.ResultRowProps.debugIds
  readonly debugIds?: boolean;
};

export type ResultCellProps<Schemas extends OptionalSchemas> = {
  /// ui-react.ResultCellProps.queryId
  readonly queryId: Id;
  /// ui-react.ResultCellProps.rowId
  readonly rowId: Id;
  /// ui-react.ResultCellProps.cellId
  readonly cellId: Id;
  /// ui-react.ResultCellProps.queries
  readonly queries?: QueriesOrQueriesId<Schemas>;
  /// ui-react.ResultCellProps.debugIds
  readonly debugIds?: boolean;
};

export type CheckpointProps<Schemas extends OptionalSchemas> = {
  /// ui-react.CheckpointProps.checkpointId
  readonly checkpointId: Id;
  /// ui-react.CheckpointProps.checkpoints
  readonly checkpoints?: CheckpointsOrCheckpointsId<Schemas>;
  /// ui-react.CheckpointProps.debugIds
  readonly debugIds?: boolean;
};

export type BackwardCheckpointsProps<Schemas extends OptionalSchemas> = {
  /// ui-react.BackwardCheckpointsProps.checkpoints
  readonly checkpoints?: CheckpointsOrCheckpointsId<Schemas>;
  /// ui-react.BackwardCheckpointsProps.checkpointComponent
  readonly checkpointComponent?: ComponentType<CheckpointProps<Schemas>>;
  /// ui-react.BackwardCheckpointsProps.getCheckpointComponentProps
  readonly getCheckpointComponentProps?: (checkpointId: Id) => ExtraProps;
  /// ui-react.BackwardCheckpointsProps.separator
  readonly separator?: ReactElement | string;
  /// ui-react.BackwardCheckpointsProps.debugIds
  readonly debugIds?: boolean;
};

export type CurrentCheckpointProps<Schemas extends OptionalSchemas> = {
  /// ui-react.CurrentCheckpointProps.checkpoints
  readonly checkpoints?: CheckpointsOrCheckpointsId<Schemas>;
  /// ui-react.CurrentCheckpointProps.checkpointComponent
  readonly checkpointComponent?: ComponentType<CheckpointProps<Schemas>>;
  /// ui-react.CurrentCheckpointProps.getCheckpointComponentProps
  readonly getCheckpointComponentProps?: (checkpointId: Id) => ExtraProps;
  /// ui-react.CurrentCheckpointProps.debugIds
  readonly debugIds?: boolean;
};

export type ForwardCheckpointsProps<Schemas extends OptionalSchemas> = {
  /// ui-react.ForwardCheckpointsProps.checkpoints
  readonly checkpoints?: CheckpointsOrCheckpointsId<Schemas>;
  /// ui-react.ForwardCheckpointsProps.checkpointComponent
  readonly checkpointComponent?: ComponentType<CheckpointProps<Schemas>>;
  /// ui-react.ForwardCheckpointsProps.getCheckpointComponentProps
  readonly getCheckpointComponentProps?: (checkpointId: Id) => ExtraProps;
  /// ui-react.ForwardCheckpointsProps.separator
  readonly separator?: ReactElement | string;
  /// ui-react.ForwardCheckpointsProps.debugIds
  readonly debugIds?: boolean;
};

export type ProviderProps<Schemas extends OptionalSchemas> = {
  /// ui-react.ProviderProps.store
  readonly store?: Store<Schemas>;
  /// ui-react.ProviderProps.storesById
  readonly storesById?: {[storeId: Id]: Store<Schemas>};
  /// ui-react.ProviderProps.metrics
  readonly metrics?: Metrics<Schemas>;
  /// ui-react.ProviderProps.metricsById
  readonly metricsById?: {[metricsId: Id]: Metrics<Schemas>};
  /// ui-react.ProviderProps.indexes
  readonly indexes?: Indexes<Schemas>;
  /// ui-react.ProviderProps.indexesById
  readonly indexesById?: {[indexesId: Id]: Indexes<Schemas>};
  /// ui-react.ProviderProps.relationships
  readonly relationships?: Relationships<Schemas>;
  /// ui-react.ProviderProps.relationshipsById
  readonly relationshipsById?: {[relationshipsId: Id]: Relationships<Schemas>};
  /// ui-react.ProviderProps.queries
  readonly queries?: Queries<Schemas>;
  /// ui-react.ProviderProps.queriesById
  readonly queriesById?: {[queriesId: Id]: Queries<Schemas>};
  /// ui-react.ProviderProps.checkpoints
  readonly checkpoints?: Checkpoints<Schemas>;
  /// ui-react.ProviderProps.checkpointsById
  readonly checkpointsById?: {[checkpointsId: Id]: Checkpoints<Schemas>};
  /// ui-react.ProviderProps.persister
  readonly persister?: Persister<Schemas, Persists.StoreOrMergeableStore>;
  /// ui-react.ProviderProps.persistersById
  readonly persistersById?: {
    [persisterId: Id]: Persister<Schemas, Persists.StoreOrMergeableStore>;
  };
  /// ui-react.ProviderProps.synchronizer
  readonly synchronizer?: Synchronizer<Schemas>;
  /// ui-react.ProviderProps.synchronizersById
  readonly synchronizersById?: {[synchronizerId: Id]: Synchronizer<Schemas>};
};

export type ComponentReturnType = ReactElement<any, any> | null;
