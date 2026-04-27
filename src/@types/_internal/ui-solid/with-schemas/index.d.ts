import type {Component, JSXElement} from 'solid-js';
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

export type UndoOrRedoInformation = [boolean, Callback, Id | undefined, string];

export type GetId<Schemas extends OptionalSchemas, Parameter, Id> = (
  parameter: Parameter,
  store: Store<Schemas>,
) => Id;

export type ExtraProps = {[propName: string]: any};

export type TablesProps<Schemas extends OptionalSchemas> = {
  /// ui-solid.TablesProps.store
  readonly store?: StoreOrStoreId<Schemas>;
  /// ui-solid.TablesProps.tableComponent
  readonly tableComponent?: Component<TableProps<Schemas>>;
  /// ui-solid.TablesProps.getTableComponentProps
  readonly getTableComponentProps?: (tableId: Id) => ExtraProps;
  /// ui-solid.TablesProps.separator
  readonly separator?: JSXElement | string;
  /// ui-solid.TablesProps.debugIds
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
        /// ui-solid.TableProps.tableId
        readonly tableId: TableId;
        /// ui-solid.TableProps.store
        readonly store?: StoreOrStoreId<Schemas>;
        /// ui-solid.TableProps.rowComponent
        readonly rowComponent?: Component<RowProps<Schemas, TableId>>;
        /// ui-solid.TableProps.getRowComponentProps
        readonly getRowComponentProps?: (rowId: Id) => ExtraProps;
        /// ui-solid.TableProps.customCellIds
        readonly customCellIds?: CellIdFromSchema<Schemas[0], TableId>[];
        /// ui-solid.TableProps.separator
        readonly separator?: JSXElement | string;
        /// ui-solid.TableProps.debugIds
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
        /// ui-solid.SortedTableProps.tableId
        readonly tableId: TableId;
        /// ui-solid.SortedTableProps.cellId
        readonly cellId?: CellIdFromSchema<Schemas[0], TableId>;
        /// ui-solid.SortedTableProps.descending
        readonly descending?: boolean;
        /// ui-solid.SortedTableProps.offset
        readonly offset?: number;
        /// ui-solid.SortedTableProps.limit
        readonly limit?: number;
        /// ui-solid.SortedTableProps.store
        readonly store?: StoreOrStoreId<Schemas>;
        /// ui-solid.SortedTableProps.rowComponent
        readonly rowComponent?: Component<RowProps<Schemas, TableId>>;
        /// ui-solid.SortedTableProps.getRowComponentProps
        readonly getRowComponentProps?: (rowId: Id) => ExtraProps;
        /// ui-solid.SortedTableProps.customCellIds
        readonly customCellIds?: CellIdFromSchema<Schemas[0], TableId>[];
        /// ui-solid.SortedTableProps.separator
        readonly separator?: JSXElement | string;
        /// ui-solid.SortedTableProps.debugIds
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
        /// ui-solid.RowProps.tableId
        readonly tableId: TableId;
        /// ui-solid.RowProps.rowId
        readonly rowId: Id;
        /// ui-solid.RowProps.store
        readonly store?: StoreOrStoreId<Schemas>;
        /// ui-solid.RowProps.cellComponent
        readonly cellComponent?: Component<CellProps<Schemas, TableId>>;
        /// ui-solid.RowProps.getCellComponentProps
        readonly getCellComponentProps?: (cellId: Id) => ExtraProps;
        /// ui-solid.RowProps.customCellIds
        readonly customCellIds?: CellIdFromSchema<Schemas[0], TableId>[];
        /// ui-solid.RowProps.separator
        readonly separator?: JSXElement | string;
        /// ui-solid.RowProps.debugIds
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
  /// ui-solid.CellProps.tableId
  readonly tableId: TableId;
  /// ui-solid.CellProps.rowId
  readonly rowId: Id;
  /// ui-solid.CellProps.cellId
  readonly cellId: CellId;
  /// ui-solid.CellProps.store
  readonly store?: StoreOrStoreId<Schemas>;
  /// ui-solid.CellProps.debugIds
  readonly debugIds?: boolean;
};

export type ValuesProps<Schemas extends OptionalSchemas> = {
  /// ui-solid.ValuesProps.store
  readonly store?: StoreOrStoreId<Schemas>;
  /// ui-solid.ValuesProps.valueComponent
  readonly valueComponent?: Component<ValueProps<Schemas>>;
  /// ui-solid.ValuesProps.getValueComponentProps
  readonly getValueComponentProps?: (valueId: Id) => ExtraProps;
  /// ui-solid.ValuesProps.separator
  readonly separator?: JSXElement | string;
  /// ui-solid.ValuesProps.debugIds
  readonly debugIds?: boolean;
};

export type ValueProps<Schemas extends OptionalSchemas> = {
  /// ui-solid.ValueProps.valueId
  readonly valueId: ValueIdFromSchema<Schemas[1]>;
  /// ui-solid.ValueProps.store
  readonly store?: StoreOrStoreId<Schemas>;
  /// ui-solid.ValueProps.debugIds
  readonly debugIds?: boolean;
};

export type MetricProps<Schemas extends OptionalSchemas> = {
  /// ui-solid.MetricProps.metricId
  readonly metricId: Id;
  /// ui-solid.MetricProps.metrics
  readonly metrics?: MetricsOrMetricsId<Schemas>;
  /// ui-solid.MetricProps.debugIds
  readonly debugIds?: boolean;
};

export type IndexProps<Schemas extends OptionalSchemas> = {
  /// ui-solid.IndexProps.indexId
  readonly indexId: Id;
  /// ui-solid.IndexProps.indexes
  readonly indexes?: IndexesOrIndexesId<Schemas>;
  /// ui-solid.IndexProps.sliceComponent
  readonly sliceComponent?: Component<SliceProps<Schemas>>;
  /// ui-solid.IndexProps.getSliceComponentProps
  readonly getSliceComponentProps?: (sliceId: Id) => ExtraProps;
  /// ui-solid.IndexProps.separator
  readonly separator?: JSXElement | string;
  /// ui-solid.IndexProps.debugIds
  readonly debugIds?: boolean;
};

export type SliceProps<Schemas extends OptionalSchemas> = {
  /// ui-solid.SliceProps.indexId
  readonly indexId: Id;
  /// ui-solid.SliceProps.sliceId
  readonly sliceId: Id;
  /// ui-solid.SliceProps.indexes
  readonly indexes?: IndexesOrIndexesId<Schemas>;
  /// ui-solid.SliceProps.rowComponent
  readonly rowComponent?: Component<RowProps<Schemas>>;
  /// ui-solid.SliceProps.getRowComponentProps
  readonly getRowComponentProps?: (rowId: Id) => ExtraProps;
  /// ui-solid.SliceProps.separator
  readonly separator?: JSXElement | string;
  /// ui-solid.SliceProps.debugIds
  readonly debugIds?: boolean;
};

export type RemoteRowProps<Schemas extends OptionalSchemas> = {
  /// ui-solid.RemoteRowProps.relationshipId
  readonly relationshipId: Id;
  /// ui-solid.RemoteRowProps.localRowId
  readonly localRowId: Id;
  /// ui-solid.RemoteRowProps.relationships
  readonly relationships?: RelationshipsOrRelationshipsId<Schemas>;
  /// ui-solid.RemoteRowProps.rowComponent
  readonly rowComponent?: Component<RowProps<Schemas>>;
  /// ui-solid.RemoteRowProps.getRowComponentProps
  readonly getRowComponentProps?: (rowId: Id) => ExtraProps;
  /// ui-solid.RemoteRowProps.debugIds
  readonly debugIds?: boolean;
};

export type LocalRowsProps<Schemas extends OptionalSchemas> = {
  /// ui-solid.LocalRowsProps.relationshipId
  readonly relationshipId: Id;
  /// ui-solid.LocalRowsProps.remoteRowId
  readonly remoteRowId: Id;
  /// ui-solid.LocalRowsProps.relationships
  readonly relationships?: RelationshipsOrRelationshipsId<Schemas>;
  /// ui-solid.LocalRowsProps.rowComponent
  readonly rowComponent?: Component<RowProps<Schemas>>;
  /// ui-solid.LocalRowsProps.getRowComponentProps
  readonly getRowComponentProps?: (rowId: Id) => ExtraProps;
  /// ui-solid.LocalRowsProps.separator
  readonly separator?: JSXElement | string;
  /// ui-solid.LocalRowsProps.debugIds
  readonly debugIds?: boolean;
};

export type LinkedRowsProps<Schemas extends OptionalSchemas> = {
  /// ui-solid.LinkedRowsProps.relationshipId
  readonly relationshipId: Id;
  /// ui-solid.LinkedRowsProps.firstRowId
  readonly firstRowId: Id;
  /// ui-solid.LinkedRowsProps.relationships
  readonly relationships?: RelationshipsOrRelationshipsId<Schemas>;
  /// ui-solid.LinkedRowsProps.rowComponent
  readonly rowComponent?: Component<RowProps<Schemas>>;
  /// ui-solid.LinkedRowsProps.getRowComponentProps
  readonly getRowComponentProps?: (rowId: Id) => ExtraProps;
  /// ui-solid.LinkedRowsProps.separator
  readonly separator?: JSXElement | string;
  /// ui-solid.LinkedRowsProps.debugIds
  readonly debugIds?: boolean;
};

export type ResultTableProps<Schemas extends OptionalSchemas> = {
  /// ui-solid.ResultTableProps.queryId
  readonly queryId: Id;
  /// ui-solid.ResultTableProps.queries
  readonly queries?: QueriesOrQueriesId<Schemas>;
  /// ui-solid.ResultTableProps.resultRowComponent
  readonly resultRowComponent?: Component<ResultRowProps<Schemas>>;
  /// ui-solid.ResultTableProps.getResultRowComponentProps
  readonly getResultRowComponentProps?: (rowId: Id) => ExtraProps;
  /// ui-solid.ResultTableProps.separator
  readonly separator?: JSXElement | string;
  /// ui-solid.ResultTableProps.debugIds
  readonly debugIds?: boolean;
};

export type ResultSortedTableProps<Schemas extends OptionalSchemas> = {
  /// ui-solid.ResultSortedTableProps.queryId
  readonly queryId: Id;
  /// ui-solid.ResultSortedTableProps.cellId
  readonly cellId?: Id;
  /// ui-solid.ResultSortedTableProps.descending
  readonly descending?: boolean;
  /// ui-solid.ResultSortedTableProps.offset
  readonly offset?: number;
  /// ui-solid.ResultSortedTableProps.limit
  readonly limit?: number;
  /// ui-solid.ResultSortedTableProps.queries
  readonly queries?: QueriesOrQueriesId<Schemas>;
  /// ui-solid.ResultSortedTableProps.resultRowComponent
  readonly resultRowComponent?: Component<ResultRowProps<Schemas>>;
  /// ui-solid.ResultSortedTableProps.getResultRowComponentProps
  readonly getResultRowComponentProps?: (rowId: Id) => ExtraProps;
  /// ui-solid.ResultSortedTableProps.separator
  readonly separator?: JSXElement | string;
  /// ui-solid.ResultSortedTableProps.debugIds
  readonly debugIds?: boolean;
};

export type ResultRowProps<Schemas extends OptionalSchemas> = {
  /// ui-solid.ResultRowProps.queryId
  readonly queryId: Id;
  /// ui-solid.ResultRowProps.rowId
  readonly rowId: Id;
  /// ui-solid.ResultRowProps.queries
  readonly queries?: QueriesOrQueriesId<Schemas>;
  /// ui-solid.ResultRowProps.resultCellComponent
  readonly resultCellComponent?: Component<ResultCellProps<Schemas>>;
  /// ui-solid.ResultRowProps.getResultCellComponentProps
  readonly getResultCellComponentProps?: (cellId: Id) => ExtraProps;
  /// ui-solid.ResultRowProps.separator
  readonly separator?: JSXElement | string;
  /// ui-solid.ResultRowProps.debugIds
  readonly debugIds?: boolean;
};

export type ResultCellProps<Schemas extends OptionalSchemas> = {
  /// ui-solid.ResultCellProps.queryId
  readonly queryId: Id;
  /// ui-solid.ResultCellProps.rowId
  readonly rowId: Id;
  /// ui-solid.ResultCellProps.cellId
  readonly cellId: Id;
  /// ui-solid.ResultCellProps.queries
  readonly queries?: QueriesOrQueriesId<Schemas>;
  /// ui-solid.ResultCellProps.debugIds
  readonly debugIds?: boolean;
};

export type CheckpointProps<Schemas extends OptionalSchemas> = {
  /// ui-solid.CheckpointProps.checkpointId
  readonly checkpointId: Id;
  /// ui-solid.CheckpointProps.checkpoints
  readonly checkpoints?: CheckpointsOrCheckpointsId<Schemas>;
  /// ui-solid.CheckpointProps.debugIds
  readonly debugIds?: boolean;
};

export type BackwardCheckpointsProps<Schemas extends OptionalSchemas> = {
  /// ui-solid.BackwardCheckpointsProps.checkpoints
  readonly checkpoints?: CheckpointsOrCheckpointsId<Schemas>;
  /// ui-solid.BackwardCheckpointsProps.checkpointComponent
  readonly checkpointComponent?: Component<CheckpointProps<Schemas>>;
  /// ui-solid.BackwardCheckpointsProps.getCheckpointComponentProps
  readonly getCheckpointComponentProps?: (checkpointId: Id) => ExtraProps;
  /// ui-solid.BackwardCheckpointsProps.separator
  readonly separator?: JSXElement | string;
  /// ui-solid.BackwardCheckpointsProps.debugIds
  readonly debugIds?: boolean;
};

export type CurrentCheckpointProps<Schemas extends OptionalSchemas> = {
  /// ui-solid.CurrentCheckpointProps.checkpoints
  readonly checkpoints?: CheckpointsOrCheckpointsId<Schemas>;
  /// ui-solid.CurrentCheckpointProps.checkpointComponent
  readonly checkpointComponent?: Component<CheckpointProps<Schemas>>;
  /// ui-solid.CurrentCheckpointProps.getCheckpointComponentProps
  readonly getCheckpointComponentProps?: (checkpointId: Id) => ExtraProps;
  /// ui-solid.CurrentCheckpointProps.debugIds
  readonly debugIds?: boolean;
};

export type ForwardCheckpointsProps<Schemas extends OptionalSchemas> = {
  /// ui-solid.ForwardCheckpointsProps.checkpoints
  readonly checkpoints?: CheckpointsOrCheckpointsId<Schemas>;
  /// ui-solid.ForwardCheckpointsProps.checkpointComponent
  readonly checkpointComponent?: Component<CheckpointProps<Schemas>>;
  /// ui-solid.ForwardCheckpointsProps.getCheckpointComponentProps
  readonly getCheckpointComponentProps?: (checkpointId: Id) => ExtraProps;
  /// ui-solid.ForwardCheckpointsProps.separator
  readonly separator?: JSXElement | string;
  /// ui-solid.ForwardCheckpointsProps.debugIds
  readonly debugIds?: boolean;
};

export type ProviderProps<Schemas extends OptionalSchemas> = {
  /// ui-solid.ProviderProps.store
  readonly store?: Store<Schemas>;
  /// ui-solid.ProviderProps.storesById
  readonly storesById?: {[storeId: Id]: Store<Schemas>};
  /// ui-solid.ProviderProps.metrics
  readonly metrics?: Metrics<Schemas>;
  /// ui-solid.ProviderProps.metricsById
  readonly metricsById?: {[metricsId: Id]: Metrics<Schemas>};
  /// ui-solid.ProviderProps.indexes
  readonly indexes?: Indexes<Schemas>;
  /// ui-solid.ProviderProps.indexesById
  readonly indexesById?: {[indexesId: Id]: Indexes<Schemas>};
  /// ui-solid.ProviderProps.relationships
  readonly relationships?: Relationships<Schemas>;
  /// ui-solid.ProviderProps.relationshipsById
  readonly relationshipsById?: {[relationshipsId: Id]: Relationships<Schemas>};
  /// ui-solid.ProviderProps.queries
  readonly queries?: Queries<Schemas>;
  /// ui-solid.ProviderProps.queriesById
  readonly queriesById?: {[queriesId: Id]: Queries<Schemas>};
  /// ui-solid.ProviderProps.checkpoints
  readonly checkpoints?: Checkpoints<Schemas>;
  /// ui-solid.ProviderProps.checkpointsById
  readonly checkpointsById?: {[checkpointsId: Id]: Checkpoints<Schemas>};
  /// ui-solid.ProviderProps.persister
  readonly persister?: Persister<Schemas, Persists.StoreOrMergeableStore>;
  /// ui-solid.ProviderProps.persistersById
  readonly persistersById?: {
    [persisterId: Id]: Persister<Schemas, Persists.StoreOrMergeableStore>;
  };
  /// ui-solid.ProviderProps.synchronizer
  readonly synchronizer?: Synchronizer<Schemas>;
  /// ui-solid.ProviderProps.synchronizersById
  readonly synchronizersById?: {[synchronizerId: Id]: Synchronizer<Schemas>};
};

export type ComponentReturnType = JSXElement;
