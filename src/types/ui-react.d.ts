/// ui-react

import {Callback, Id, IdOrNull, Ids, ParameterizedCallback} from './common.d';
import {
  Cell,
  CellIdsListener,
  CellListener,
  CellOrUndefined,
  HasCellListener,
  HasRowListener,
  HasTableCellListener,
  HasTableListener,
  HasTablesListener,
  HasValueListener,
  HasValuesListener,
  MapCell,
  MapValue,
  Row,
  RowCountListener,
  RowIdsListener,
  RowListener,
  SortedRowIdsListener,
  Store,
  Table,
  TableCellIdsListener,
  TableIdsListener,
  TableListener,
  Tables,
  TablesListener,
  TransactionListener,
  Value,
  ValueIdsListener,
  ValueListener,
  ValueOrUndefined,
  Values,
  ValuesListener,
} from './store.d';
import {
  CheckpointIds,
  CheckpointIdsListener,
  CheckpointListener,
  Checkpoints,
} from './checkpoints.d';
import {ComponentType, ReactElement} from 'react';
import {Indexes, SliceIdsListener, SliceRowIdsListener} from './indexes.d';
import {
  LinkedRowIdsListener,
  LocalRowIdsListener,
  Relationships,
  RemoteRowIdListener,
} from './relationships.d';
import {MetricListener, Metrics} from './metrics.d';
import {
  Queries,
  ResultCellIdsListener,
  ResultCellListener,
  ResultRowCountListener,
  ResultRowIdsListener,
  ResultRowListener,
  ResultSortedRowIdsListener,
  ResultTableCellIdsListener,
  ResultTableListener,
} from './queries.d';
import {Persister} from './persisters.d';

/// StoreOrStoreId
export type StoreOrStoreId = Store | Id;

/// MetricsOrMetricsId
export type MetricsOrMetricsId = Metrics | Id;

/// IndexesOrIndexesId
export type IndexesOrIndexesId = Indexes | Id;

/// RelationshipsOrRelationshipsId
export type RelationshipsOrRelationshipsId = Relationships | Id;

/// QueriesOrQueriesId
export type QueriesOrQueriesId = Queries | Id;

/// CheckpointsOrCheckpointsId
export type CheckpointsOrCheckpointsId = Checkpoints | Id;

/// UndoOrRedoInformation
export type UndoOrRedoInformation = [boolean, Callback, Id | undefined, string];

/// GetId
export type GetId<Parameter> = (parameter: Parameter, store: Store) => Id;

/// useCreateStore
export function useCreateStore(
  create: () => Store,
  createDeps?: React.DependencyList,
): Store;

/// useStoreIds
export function useStoreIds(): Ids;

/// useStore
export function useStore(id?: Id): Store | undefined;

/// useStoreOrStoreById
export function useStoreOrStoreById(
  storeOrStoreId?: StoreOrStoreId,
): Store | undefined;

/// useProvideStore
export function useProvideStore(storeId: Id, store: Store): void;

/// useHasTables
export function useHasTables(storeOrStoreId?: StoreOrStoreId): boolean;

/// useTables
export function useTables(storeOrStoreId?: StoreOrStoreId): Tables;

/// useTableIds
export function useTableIds(storeOrStoreId?: StoreOrStoreId): Ids;

/// useHasTable
export function useHasTable(
  tableId: Id,
  storeOrStoreId?: StoreOrStoreId,
): boolean;

/// useTable
export function useTable(tableId: Id, storeOrStoreId?: StoreOrStoreId): Table;

/// useTableCellIds
export function useTableCellIds(
  tableId: Id,
  storeOrStoreId?: StoreOrStoreId,
): Ids;

/// useHasTableCell
export function useHasTableCell(
  tableId: Id,
  cellId: Id,
  storeOrStoreId?: StoreOrStoreId,
): boolean;

/// useRowCount
export function useRowCount(
  tableId: Id,
  storeOrStoreId?: StoreOrStoreId,
): number;

/// useRowIds
export function useRowIds(tableId: Id, storeOrStoreId?: StoreOrStoreId): Ids;

/// useSortedRowIds
export function useSortedRowIds(
  tableId: Id,
  cellId?: Id,
  descending?: boolean,
  offset?: number,
  limit?: number,
  storeOrStoreId?: StoreOrStoreId,
): Ids;

/// useHasRow
export function useHasRow(
  tableId: Id,
  rowId: Id,
  storeOrStoreId?: StoreOrStoreId,
): boolean;

/// useRow
export function useRow(
  tableId: Id,
  rowId: Id,
  storeOrStoreId?: StoreOrStoreId,
): Row;

/// useCellIds
export function useCellIds(
  tableId: Id,
  rowId: Id,
  storeOrStoreId?: StoreOrStoreId,
): Ids;

/// useHasCell
export function useHasCell(
  tableId: Id,
  rowId: Id,
  cellId: Id,
  storeOrStoreId?: StoreOrStoreId,
): boolean;

/// useCell
export function useCell(
  tableId: Id,
  rowId: Id,
  cellId: Id,
  storeOrStoreId?: StoreOrStoreId,
): CellOrUndefined;

/// useHasValues
export function useHasValues(storeOrStoreId?: StoreOrStoreId): boolean;

/// useValues
export function useValues(storeOrStoreId?: StoreOrStoreId): Values;

/// useValueIds
export function useValueIds(storeOrStoreId?: StoreOrStoreId): Ids;

/// useHasValue
export function useHasValue(
  valueId: Id,
  storeOrStoreId?: StoreOrStoreId,
): boolean;

/// useValue
export function useValue(
  valueId: Id,
  storeOrStoreId?: StoreOrStoreId,
): ValueOrUndefined;

/// useSetTablesCallback
export function useSetTablesCallback<Parameter>(
  getTables: (parameter: Parameter, store: Store) => Tables,
  getTablesDeps?: React.DependencyList,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store, tables: Tables) => void,
  thenDeps?: React.DependencyList,
): ParameterizedCallback<Parameter>;

/// useSetTableCallback
export function useSetTableCallback<Parameter>(
  tableId: Id | GetId<Parameter>,
  getTable: (parameter: Parameter, store: Store) => Table,
  getTableDeps?: React.DependencyList,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store, table: Table) => void,
  thenDeps?: React.DependencyList,
): ParameterizedCallback<Parameter>;

/// useSetRowCallback
export function useSetRowCallback<Parameter>(
  tableId: Id | GetId<Parameter>,
  rowId: Id | GetId<Parameter>,
  getRow: (parameter: Parameter, store: Store) => Row,
  getRowDeps?: React.DependencyList,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store, row: Row) => void,
  thenDeps?: React.DependencyList,
): ParameterizedCallback<Parameter>;

/// useAddRowCallback
export function useAddRowCallback<Parameter>(
  tableId: Id | GetId<Parameter>,
  getRow: (parameter: Parameter, store: Store) => Row,
  getRowDeps?: React.DependencyList,
  storeOrStoreId?: StoreOrStoreId,
  then?: (rowId: Id | undefined, store: Store, row: Row) => void,
  thenDeps?: React.DependencyList,
  reuseRowIds?: boolean,
): ParameterizedCallback<Parameter>;

/// useSetPartialRowCallback
export function useSetPartialRowCallback<Parameter>(
  tableId: Id | GetId<Parameter>,
  rowId: Id | GetId<Parameter>,
  getPartialRow: (parameter: Parameter, store: Store) => Row,
  getPartialRowDeps?: React.DependencyList,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store, partialRow: Row) => void,
  thenDeps?: React.DependencyList,
): ParameterizedCallback<Parameter>;

/// useSetCellCallback
export function useSetCellCallback<Parameter>(
  tableId: Id | GetId<Parameter>,
  rowId: Id | GetId<Parameter>,
  cellId: Id | GetId<Parameter>,
  getCell: (parameter: Parameter, store: Store) => Cell | MapCell,
  getCellDeps?: React.DependencyList,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store, cell: Cell | MapCell) => void,
  thenDeps?: React.DependencyList,
): ParameterizedCallback<Parameter>;

/// useSetValuesCallback
export function useSetValuesCallback<Parameter>(
  getValues: (parameter: Parameter, store: Store) => Values,
  getValuesDeps?: React.DependencyList,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store, values: Values) => void,
  thenDeps?: React.DependencyList,
): ParameterizedCallback<Parameter>;

/// useSetPartialValuesCallback
export function useSetPartialValuesCallback<Parameter>(
  getPartialValues: (parameter: Parameter, store: Store) => Values,
  getPartialValuesDeps?: React.DependencyList,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store, partialValues: Values) => void,
  thenDeps?: React.DependencyList,
): ParameterizedCallback<Parameter>;

/// useSetValueCallback
export function useSetValueCallback<Parameter>(
  valueId: Id | GetId<Parameter>,
  getValue: (parameter: Parameter, store: Store) => Value | MapValue,
  getValueDeps?: React.DependencyList,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store, value: Value | MapValue) => void,
  thenDeps?: React.DependencyList,
): ParameterizedCallback<Parameter>;

/// useDelTablesCallback
export function useDelTablesCallback(
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store) => void,
  thenDeps?: React.DependencyList,
): Callback;

/// useDelTableCallback
export function useDelTableCallback(
  tableId: Id,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store) => void,
  thenDeps?: React.DependencyList,
): Callback;

/// useDelRowCallback
export function useDelRowCallback(
  tableId: Id,
  rowId: Id,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store) => void,
  thenDeps?: React.DependencyList,
): Callback;

/// useDelCellCallback
export function useDelCellCallback(
  tableId: Id,
  rowId: Id,
  cellId: Id,
  forceDel?: boolean,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store) => void,
  thenDeps?: React.DependencyList,
): Callback;

/// useDelValuesCallback
export function useDelValuesCallback(
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store) => void,
  thenDeps?: React.DependencyList,
): Callback;

/// useDelValueCallback
export function useDelValueCallback(
  valueId: Id,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store) => void,
  thenDeps?: React.DependencyList,
): Callback;

/// useHasTablesListener
export function useHasTablesListener(
  listener: HasTablesListener,
  listenerDeps?: React.DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

/// useTablesListener
export function useTablesListener(
  listener: TablesListener,
  listenerDeps?: React.DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

/// useTableIdsListener
export function useTableIdsListener(
  listener: TableIdsListener,
  listenerDeps?: React.DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

/// useHasTableListener
export function useHasTableListener(
  tableId: IdOrNull,
  listener: HasTableListener,
  listenerDeps?: React.DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

/// useTableListener
export function useTableListener(
  tableId: IdOrNull,
  listener: TableListener,
  listenerDeps?: React.DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

/// useTableCellIdsListener
export function useTableCellIdsListener(
  tableId: IdOrNull,
  listener: TableCellIdsListener,
  listenerDeps?: React.DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

/// useHasTableCellListener
export function useHasTableCellListener(
  tableId: IdOrNull,
  cellId: IdOrNull,
  listener: HasTableCellListener,
  listenerDeps?: React.DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

/// useRowCountListener
export function useRowCountListener(
  tableId: IdOrNull,
  listener: RowCountListener,
  listenerDeps?: React.DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

/// useRowIdsListener
export function useRowIdsListener(
  tableId: IdOrNull,
  listener: RowIdsListener,
  listenerDeps?: React.DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

/// useSortedRowIdsListener
export function useSortedRowIdsListener(
  tableId: Id,
  cellId: Id | undefined,
  descending: boolean,
  offset: number,
  limit: number | undefined,
  listener: SortedRowIdsListener,
  listenerDeps?: React.DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

/// useHasRowListener
export function useHasRowListener(
  tableId: IdOrNull,
  rowId: IdOrNull,
  listener: HasRowListener,
  listenerDeps?: React.DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

/// useRowListener
export function useRowListener(
  tableId: IdOrNull,
  rowId: IdOrNull,
  listener: RowListener,
  listenerDeps?: React.DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

/// useCellIdsListener
export function useCellIdsListener(
  tableId: IdOrNull,
  rowId: IdOrNull,
  listener: CellIdsListener,
  listenerDeps?: React.DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

/// useHasCellListener
export function useHasCellListener(
  tableId: IdOrNull,
  rowId: IdOrNull,
  cellId: IdOrNull,
  listener: HasCellListener,
  listenerDeps?: React.DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

/// useCellListener
export function useCellListener(
  tableId: IdOrNull,
  rowId: IdOrNull,
  cellId: IdOrNull,
  listener: CellListener,
  listenerDeps?: React.DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

/// useHasValuesListener
export function useHasValuesListener(
  listener: HasValuesListener,
  listenerDeps?: React.DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

/// useValuesListener
export function useValuesListener(
  listener: ValuesListener,
  listenerDeps?: React.DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

/// useValueIdsListener
export function useValueIdsListener(
  listener: ValueIdsListener,
  listenerDeps?: React.DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

/// useHasValueListener
export function useHasValueListener(
  valueId: IdOrNull,
  listener: HasValueListener,
  listenerDeps?: React.DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

/// useValueListener
export function useValueListener(
  valueId: IdOrNull,
  listener: ValueListener,
  listenerDeps?: React.DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

/// useStartTransactionListener
export function useStartTransactionListener(
  listener: TransactionListener,
  listenerDeps?: React.DependencyList,
  storeOrStoreId?: StoreOrStoreId,
): void;

/// useWillFinishTransactionListener
export function useWillFinishTransactionListener(
  listener: TransactionListener,
  listenerDeps?: React.DependencyList,
  storeOrStoreId?: StoreOrStoreId,
): void;

/// useDidFinishTransactionListener
export function useDidFinishTransactionListener(
  listener: TransactionListener,
  listenerDeps?: React.DependencyList,
  storeOrStoreId?: StoreOrStoreId,
): void;

/// useCreateMetrics
export function useCreateMetrics(
  store: Store,
  create: (store: Store) => Metrics,
  createDeps?: React.DependencyList,
): Metrics | undefined;

/// useMetricsIds
export function useMetricsIds(): Ids;

/// useMetrics
export function useMetrics(id?: Id): Metrics | undefined;

/// useMetricsOrMetricsById
export function useMetricsOrMetricsById(
  metricsOrMetricsId?: MetricsOrMetricsId,
): Metrics | undefined;

/// useMetricIds
export function useMetricIds(metricsOrMetricsId?: MetricsOrMetricsId): Ids;

/// useMetric
export function useMetric(
  metricId: Id,
  metricsOrMetricsId?: MetricsOrMetricsId,
): number | undefined;

/// useMetricListener
export function useMetricListener(
  metricId: IdOrNull,
  listener: MetricListener,
  listenerDeps?: React.DependencyList,
  metricsOrMetricsId?: MetricsOrMetricsId,
): void;

/// useCreateIndexes
export function useCreateIndexes(
  store: Store,
  create: (store: Store) => Indexes,
  createDeps?: React.DependencyList,
): Indexes | undefined;

/// useIndexesIds
export function useIndexesIds(): Ids;

/// useIndexes
export function useIndexes(id?: Id): Indexes | undefined;

/// useIndexesOrIndexesById
export function useIndexesOrIndexesById(
  indexesOrIndexesId?: IndexesOrIndexesId,
): Indexes | undefined;

/// useIndexIds
export function useIndexIds(indexesOrIndexesId?: IndexesOrIndexesId): Ids;

/// useSliceIds
export function useSliceIds(
  indexId: Id,
  indexesOrIndexesId?: IndexesOrIndexesId,
): Ids;

/// useSliceRowIds
export function useSliceRowIds(
  indexId: Id,
  sliceId: Id,
  indexesOrIndexesId?: IndexesOrIndexesId,
): Ids;

/// useSliceIdsListener
export function useSliceIdsListener(
  indexId: IdOrNull,
  listener: SliceIdsListener,
  listenerDeps?: React.DependencyList,
  indexesOrIndexesId?: IndexesOrIndexesId,
): void;

/// useSliceRowIdsListener
export function useSliceRowIdsListener(
  indexId: IdOrNull,
  sliceId: IdOrNull,
  listener: SliceRowIdsListener,
  listenerDeps?: React.DependencyList,
  indexesOrIndexesId?: IndexesOrIndexesId,
): void;

/// useCreateRelationships
export function useCreateRelationships(
  store: Store,
  create: (store: Store) => Relationships,
  createDeps?: React.DependencyList,
): Relationships | undefined;

/// useRelationshipsIds
export function useRelationshipsIds(): Ids;

/// useRelationships
export function useRelationships(id?: Id): Relationships | undefined;

/// useRelationshipsOrRelationshipsById
export function useRelationshipsOrRelationshipsById(
  relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId,
): Relationships | undefined;

/// useRelationshipIds
export function useRelationshipIds(
  relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId,
): Ids;

/// useRemoteRowId
export function useRemoteRowId(
  relationshipId: Id,
  localRowId: Id,
  relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId,
): Id | undefined;

/// useLocalRowIds
export function useLocalRowIds(
  relationshipId: Id,
  remoteRowId: Id,
  relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId,
): Ids;

/// useLinkedRowIds
export function useLinkedRowIds(
  relationshipId: Id,
  firstRowId: Id,
  relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId,
): Ids;

/// useRemoteRowIdListener
export function useRemoteRowIdListener(
  relationshipId: IdOrNull,
  localRowId: IdOrNull,
  listener: RemoteRowIdListener,
  listenerDeps?: React.DependencyList,
  relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId,
): void;

/// useLocalRowIdsListener
export function useLocalRowIdsListener(
  relationshipId: IdOrNull,
  remoteRowId: IdOrNull,
  listener: LocalRowIdsListener,
  listenerDeps?: React.DependencyList,
  relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId,
): void;

/// useLinkedRowIdsListener
export function useLinkedRowIdsListener(
  relationshipId: Id,
  firstRowId: Id,
  listener: LinkedRowIdsListener,
  listenerDeps?: React.DependencyList,
  relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId,
): void;

/// useCreateQueries
export function useCreateQueries(
  store: Store,
  create: (store: Store) => Queries,
  createDeps?: React.DependencyList,
): Queries | undefined;

/// useQueriesIds
export function useQueriesIds(): Ids;

/// useQueries
export function useQueries(id?: Id): Queries | undefined;

/// useQueriesOrQueriesById
export function useQueriesOrQueriesById(
  queriesOrQueriesId?: QueriesOrQueriesId,
): Queries | undefined;

/// useQueryIds
export function useQueryIds(queriesOrQueriesId?: QueriesOrQueriesId): Ids;

/// useResultTable
export function useResultTable(
  queryId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): Table;

/// useResultTableCellIds
export function useResultTableCellIds(
  queryId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): Ids;

/// useResultRowCount
export function useResultRowCount(
  queryId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): number;

/// useResultRowIds
export function useResultRowIds(
  queryId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): Ids;

/// useResultSortedRowIds
export function useResultSortedRowIds(
  queryId: Id,
  cellId?: Id,
  descending?: boolean,
  offset?: number,
  limit?: number,
  queriesOrQueriesId?: QueriesOrQueriesId,
): Ids;

/// useResultRow
export function useResultRow(
  queryId: Id,
  rowId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): Row;

/// useResultCellIds
export function useResultCellIds(
  queryId: Id,
  rowId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): Ids;

/// useResultCell
export function useResultCell(
  queryId: Id,
  rowId: Id,
  cellId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): Cell | undefined;

/// useResultTableListener
export function useResultTableListener(
  queryId: IdOrNull,
  listener: ResultTableListener,
  listenerDeps?: React.DependencyList,
  queriesOrQueriesId?: QueriesOrQueriesId,
): void;

/// useResultTableCellIdsListener
export function useResultTableCellIdsListener(
  queryId: IdOrNull,
  listener: ResultTableCellIdsListener,
  listenerDeps?: React.DependencyList,
  queriesOrQueriesId?: QueriesOrQueriesId,
): void;

/// useResultRowCountListener
export function useResultRowCountListener(
  queryId: IdOrNull,
  listener: ResultRowCountListener,
  listenerDeps?: React.DependencyList,
  queriesOrQueriesId?: QueriesOrQueriesId,
): void;

/// useResultRowIdsListener
export function useResultRowIdsListener(
  queryId: IdOrNull,
  listener: ResultRowIdsListener,
  listenerDeps?: React.DependencyList,
  queriesOrQueriesId?: QueriesOrQueriesId,
): void;

/// useResultSortedRowIdsListener
export function useResultSortedRowIdsListener(
  queryId: Id,
  cellId: Id | undefined,
  descending: boolean,
  offset: number,
  limit: number | undefined,
  listener: ResultSortedRowIdsListener,
  listenerDeps?: React.DependencyList,
  queriesOrQueriesId?: QueriesOrQueriesId,
): void;

/// useResultRowListener
export function useResultRowListener(
  queryId: IdOrNull,
  rowId: IdOrNull,
  listener: ResultRowListener,
  listenerDeps?: React.DependencyList,
  queriesOrQueriesId?: QueriesOrQueriesId,
): void;

/// useResultCellIdsListener
export function useResultCellIdsListener(
  queryId: IdOrNull,
  rowId: IdOrNull,
  listener: ResultCellIdsListener,
  listenerDeps?: React.DependencyList,
  queriesOrQueriesId?: QueriesOrQueriesId,
): void;

/// useResultCellListener
export function useResultCellListener(
  queryId: IdOrNull,
  rowId: IdOrNull,
  cellId: IdOrNull,
  listener: ResultCellListener,
  listenerDeps?: React.DependencyList,
  queriesOrQueriesId?: QueriesOrQueriesId,
): void;

/// useCreateCheckpoints
export function useCreateCheckpoints(
  store: Store,
  create: (store: Store) => Checkpoints,
  createDeps?: React.DependencyList,
): Checkpoints | undefined;

/// useCheckpointsIds
export function useCheckpointsIds(): Ids;

/// useCheckpoints
export function useCheckpoints(id?: Id): Checkpoints | undefined;

/// useCheckpointsOrCheckpointsById
export function useCheckpointsOrCheckpointsById(
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): Checkpoints | undefined;

/// useCheckpointIds
export function useCheckpointIds(
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): CheckpointIds;

/// useCheckpoint
export function useCheckpoint(
  checkpointId: Id,
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): string | undefined;

/// useSetCheckpointCallback
export function useSetCheckpointCallback<Parameter>(
  getCheckpoint?: (parameter: Parameter) => string,
  getCheckpointDeps?: React.DependencyList,
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
  then?: (checkpointId: Id, checkpoints: Checkpoints, label?: string) => void,
  thenDeps?: React.DependencyList,
): ParameterizedCallback<Parameter>;

/// useGoBackwardCallback
export function useGoBackwardCallback(
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): Callback;

/// useGoForwardCallback
export function useGoForwardCallback(
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): Callback;

/// useGoToCallback
export function useGoToCallback<Parameter>(
  getCheckpointId: (parameter: Parameter) => Id,
  getCheckpointIdDeps?: React.DependencyList,
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
  then?: (checkpoints: Checkpoints, checkpointId: Id) => void,
  thenDeps?: React.DependencyList,
): ParameterizedCallback<Parameter>;

/// useUndoInformation
export function useUndoInformation(
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): UndoOrRedoInformation;

/// useRedoInformation
export function useRedoInformation(
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): UndoOrRedoInformation;

/// useCheckpointIdsListener
export function useCheckpointIdsListener(
  listener: CheckpointIdsListener,
  listenerDeps?: React.DependencyList,
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): void;

/// useCheckpointListener
export function useCheckpointListener(
  checkpointId: IdOrNull,
  listener: CheckpointListener,
  listenerDeps?: React.DependencyList,
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): void;

/// useCreatePersister
export function useCreatePersister<
  PersisterOrUndefined extends Persister | undefined,
>(
  store: Store,
  create: (store: Store) => PersisterOrUndefined,
  createDeps?: React.DependencyList,
  then?: (persister: PersisterOrUndefined) => Promise<void>,
  thenDeps?: React.DependencyList,
  destroy?: (persister: PersisterOrUndefined) => void,
  destroyDeps?: React.DependencyList,
): PersisterOrUndefined;

/// ExtraProps
export type ExtraProps = {[propName: string]: any};

/// TablesProps
export type TablesProps = {
  /// TablesProps.store
  readonly store?: StoreOrStoreId;
  /// TablesProps.tableComponent
  readonly tableComponent?: ComponentType<TableProps>;
  /// TablesProps.getTableComponentProps
  readonly getTableComponentProps?: (tableId: Id) => ExtraProps;
  /// TablesProps.separator
  readonly separator?: ReactElement | string;
  /// TablesProps.debugIds
  readonly debugIds?: boolean;
};

/// TableProps
export type TableProps = {
  /// TableProps.tableId
  readonly tableId: Id;
  /// TableProps.store
  readonly store?: StoreOrStoreId;
  /// TableProps.rowComponent
  readonly rowComponent?: ComponentType<RowProps>;
  /// TableProps.getRowComponentProps
  readonly getRowComponentProps?: (rowId: Id) => ExtraProps;
  /// TableProps.customCellIds
  readonly customCellIds?: Ids;
  /// TableProps.separator
  readonly separator?: ReactElement | string;
  /// TableProps.debugIds
  readonly debugIds?: boolean;
};

/// SortedTableProps
export type SortedTableProps = {
  /// SortedTableProps.tableId
  readonly tableId: Id;
  /// SortedTableProps.cellId
  readonly cellId?: Id;
  /// SortedTableProps.descending
  readonly descending?: boolean;
  /// SortedTableProps.offset
  readonly offset?: number;
  /// SortedTableProps.limit
  readonly limit?: number;
  /// SortedTableProps.store
  readonly store?: StoreOrStoreId;
  /// SortedTableProps.rowComponent
  readonly rowComponent?: ComponentType<RowProps>;
  /// SortedTableProps.getRowComponentProps
  readonly getRowComponentProps?: (rowId: Id) => ExtraProps;
  /// SortedTableProps.customCellIds
  readonly customCellIds?: Ids;
  /// SortedTableProps.separator
  readonly separator?: ReactElement | string;
  /// SortedTableProps.debugIds
  readonly debugIds?: boolean;
};

/// RowProps
export type RowProps = {
  /// RowProps.tableId
  readonly tableId: Id;
  /// RowProps.rowId
  readonly rowId: Id;
  /// RowProps.store
  readonly store?: StoreOrStoreId;
  /// RowProps.cellComponent
  readonly cellComponent?: ComponentType<CellProps>;
  /// RowProps.getCellComponentProps
  readonly getCellComponentProps?: (cellId: Id) => ExtraProps;
  /// RowProps.customCellIds
  readonly customCellIds?: Ids;
  /// RowProps.separator
  readonly separator?: ReactElement | string;
  /// RowProps.debugIds
  readonly debugIds?: boolean;
};

/// CellProps
export type CellProps = {
  /// CellProps.tableId
  readonly tableId: Id;
  /// CellProps.rowId
  readonly rowId: Id;
  /// CellProps.cellId
  readonly cellId: Id;
  /// CellProps.store
  readonly store?: StoreOrStoreId;
  /// CellProps.debugIds
  readonly debugIds?: boolean;
};

/// ValuesProps
export type ValuesProps = {
  /// ValuesProps.store
  readonly store?: StoreOrStoreId;
  /// ValuesProps.valueComponent
  readonly valueComponent?: ComponentType<ValueProps>;
  /// ValuesProps.getValueComponentProps
  readonly getValueComponentProps?: (valueId: Id) => ExtraProps;
  /// ValuesProps.separator
  readonly separator?: ReactElement | string;
  /// ValuesProps.debugIds
  readonly debugIds?: boolean;
};

/// ValueProps
export type ValueProps = {
  /// ValueProps.valueId
  readonly valueId: Id;
  /// ValueProps.store
  readonly store?: StoreOrStoreId;
  /// ValueProps.debugIds
  readonly debugIds?: boolean;
};

/// MetricProps
export type MetricProps = {
  /// MetricProps.metricId
  readonly metricId: Id;
  /// MetricProps.metrics
  readonly metrics?: MetricsOrMetricsId;
  /// MetricProps.debugIds
  readonly debugIds?: boolean;
};

/// IndexProps
export type IndexProps = {
  /// IndexProps.indexId
  readonly indexId: Id;
  /// IndexProps.indexes
  readonly indexes?: IndexesOrIndexesId;
  /// IndexProps.sliceComponent
  readonly sliceComponent?: ComponentType<SliceProps>;
  /// IndexProps.getSliceComponentProps
  readonly getSliceComponentProps?: (sliceId: Id) => ExtraProps;
  /// IndexProps.separator
  readonly separator?: ReactElement | string;
  /// IndexProps.debugIds
  readonly debugIds?: boolean;
};

/// SliceProps
export type SliceProps = {
  /// SliceProps.indexId
  readonly indexId: Id;
  /// SliceProps.sliceId
  readonly sliceId: Id;
  /// SliceProps.indexes
  readonly indexes?: IndexesOrIndexesId;
  /// SliceProps.rowComponent
  readonly rowComponent?: ComponentType<RowProps>;
  /// SliceProps.getRowComponentProps
  readonly getRowComponentProps?: (rowId: Id) => ExtraProps;
  /// SliceProps.separator
  readonly separator?: ReactElement | string;
  /// SliceProps.debugIds
  readonly debugIds?: boolean;
};

/// RemoteRowProps
export type RemoteRowProps = {
  /// RemoteRowProps.relationshipId
  readonly relationshipId: Id;
  /// RemoteRowProps.localRowId
  readonly localRowId: Id;
  /// RemoteRowProps.relationships
  readonly relationships?: RelationshipsOrRelationshipsId;
  /// RemoteRowProps.rowComponent
  readonly rowComponent?: ComponentType<RowProps>;
  /// RemoteRowProps.getRowComponentProps
  readonly getRowComponentProps?: (rowId: Id) => ExtraProps;
  /// RemoteRowProps.debugIds
  readonly debugIds?: boolean;
};

/// LocalRowsProps
export type LocalRowsProps = {
  /// LocalRowsProps.relationshipId
  readonly relationshipId: Id;
  /// LocalRowsProps.remoteRowId
  readonly remoteRowId: Id;
  /// LocalRowsProps.relationships
  readonly relationships?: RelationshipsOrRelationshipsId;
  /// LocalRowsProps.rowComponent
  readonly rowComponent?: ComponentType<RowProps>;
  /// LocalRowsProps.getRowComponentProps
  readonly getRowComponentProps?: (rowId: Id) => ExtraProps;
  /// LocalRowsProps.separator
  readonly separator?: ReactElement | string;
  /// LocalRowsProps.debugIds
  readonly debugIds?: boolean;
};

/// LinkedRowsProps
export type LinkedRowsProps = {
  /// LinkedRowsProps.relationshipId
  readonly relationshipId: Id;
  /// LinkedRowsProps.firstRowId
  readonly firstRowId: Id;
  /// LinkedRowsProps.relationships
  readonly relationships?: RelationshipsOrRelationshipsId;
  /// LinkedRowsProps.rowComponent
  readonly rowComponent?: ComponentType<RowProps>;
  /// LinkedRowsProps.getRowComponentProps
  readonly getRowComponentProps?: (rowId: Id) => ExtraProps;
  /// LinkedRowsProps.separator
  readonly separator?: ReactElement | string;
  /// LinkedRowsProps.debugIds
  readonly debugIds?: boolean;
};

/// ResultTableProps
export type ResultTableProps = {
  /// ResultTableProps.queryId
  readonly queryId: Id;
  /// ResultTableProps.queries
  readonly queries?: QueriesOrQueriesId;
  /// ResultTableProps.resultRowComponent
  readonly resultRowComponent?: ComponentType<ResultRowProps>;
  /// ResultTableProps.getResultRowComponentProps
  readonly getResultRowComponentProps?: (rowId: Id) => ExtraProps;
  /// ResultTableProps.separator
  readonly separator?: ReactElement | string;
  /// ResultTableProps.debugIds
  readonly debugIds?: boolean;
};

/// ResultSortedTableProps
export type ResultSortedTableProps = {
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
  readonly queries?: QueriesOrQueriesId;
  /// ResultSortedTableProps.resultRowComponent
  readonly resultRowComponent?: ComponentType<ResultRowProps>;
  /// ResultSortedTableProps.getResultRowComponentProps
  readonly getResultRowComponentProps?: (rowId: Id) => ExtraProps;
  /// ResultSortedTableProps.separator
  readonly separator?: ReactElement | string;
  /// ResultSortedTableProps.debugIds
  readonly debugIds?: boolean;
};

/// ResultRowProps
export type ResultRowProps = {
  /// ResultRowProps.queryId
  readonly queryId: Id;
  /// ResultRowProps.rowId
  readonly rowId: Id;
  /// ResultRowProps.queries
  readonly queries?: QueriesOrQueriesId;
  /// ResultRowProps.resultCellComponent
  readonly resultCellComponent?: ComponentType<ResultCellProps>;
  /// ResultRowProps.getResultCellComponentProps
  readonly getResultCellComponentProps?: (cellId: Id) => ExtraProps;
  /// ResultRowProps.separator
  readonly separator?: ReactElement | string;
  /// ResultRowProps.debugIds
  readonly debugIds?: boolean;
};

/// ResultCellProps
export type ResultCellProps = {
  /// ResultCellProps.queryId
  readonly queryId: Id;
  /// ResultCellProps.rowId
  readonly rowId: Id;
  /// ResultCellProps.cellId
  readonly cellId: Id;
  /// ResultCellProps.queries
  readonly queries?: QueriesOrQueriesId;
  /// ResultCellProps.debugIds
  readonly debugIds?: boolean;
};

/// CheckpointProps
export type CheckpointProps = {
  /// CheckpointProps.checkpointId
  readonly checkpointId: Id;
  /// CheckpointProps.checkpoints
  readonly checkpoints?: CheckpointsOrCheckpointsId;
  /// CheckpointProps.debugIds
  readonly debugIds?: boolean;
};

/// BackwardCheckpointsProps
export type BackwardCheckpointsProps = {
  /// BackwardCheckpointsProps.checkpoints
  readonly checkpoints?: CheckpointsOrCheckpointsId;
  /// BackwardCheckpointsProps.checkpointComponent
  readonly checkpointComponent?: ComponentType<CheckpointProps>;
  /// BackwardCheckpointsProps.getCheckpointComponentProps
  readonly getCheckpointComponentProps?: (checkpointId: Id) => ExtraProps;
  /// BackwardCheckpointsProps.separator
  readonly separator?: ReactElement | string;
  /// BackwardCheckpointsProps.debugIds
  readonly debugIds?: boolean;
};

/// CurrentCheckpointProps
export type CurrentCheckpointProps = {
  /// CurrentCheckpointProps.checkpoints
  readonly checkpoints?: CheckpointsOrCheckpointsId;
  /// CurrentCheckpointProps.checkpointComponent
  readonly checkpointComponent?: ComponentType<CheckpointProps>;
  /// CurrentCheckpointProps.getCheckpointComponentProps
  readonly getCheckpointComponentProps?: (checkpointId: Id) => ExtraProps;
  /// CurrentCheckpointProps.debugIds
  readonly debugIds?: boolean;
};

/// ForwardCheckpointsProps
export type ForwardCheckpointsProps = {
  /// ForwardCheckpointsProps.checkpoints
  readonly checkpoints?: CheckpointsOrCheckpointsId;
  /// ForwardCheckpointsProps.checkpointComponent
  readonly checkpointComponent?: ComponentType<CheckpointProps>;
  /// ForwardCheckpointsProps.getCheckpointComponentProps
  readonly getCheckpointComponentProps?: (checkpointId: Id) => ExtraProps;
  /// ForwardCheckpointsProps.separator
  readonly separator?: ReactElement | string;
  /// ForwardCheckpointsProps.debugIds
  readonly debugIds?: boolean;
};

/// ProviderProps
export type ProviderProps = {
  /// ProviderProps.store
  readonly store?: Store;
  /// ProviderProps.storesById
  readonly storesById?: {[storeId: Id]: Store};
  /// ProviderProps.metrics
  readonly metrics?: Metrics;
  /// ProviderProps.metricsById
  readonly metricsById?: {[metricsId: Id]: Metrics};
  /// ProviderProps.indexes
  readonly indexes?: Indexes;
  /// ProviderProps.indexesById
  readonly indexesById?: {[indexesId: Id]: Indexes};
  /// ProviderProps.relationships
  readonly relationships?: Relationships;
  /// ProviderProps.relationshipsById
  readonly relationshipsById?: {[relationshipsId: Id]: Relationships};
  /// ProviderProps.queries
  readonly queries?: Queries;
  /// ProviderProps.queriesById
  readonly queriesById?: {[queriesId: Id]: Queries};
  /// ProviderProps.checkpoints
  readonly checkpoints?: Checkpoints;
  /// ProviderProps.checkpointsById
  readonly checkpointsById?: {[checkpointsId: Id]: Checkpoints};
};

/// ComponentReturnType
export type ComponentReturnType = ReactElement<any, any> | null;

/// Provider
export function Provider(
  props: ProviderProps & {children: React.ReactNode},
): ComponentReturnType;

/// CellView
export function CellView(props: CellProps): ComponentReturnType;

/// RowView
export function RowView(props: RowProps): ComponentReturnType;

/// SortedTableView
export function SortedTableView(props: SortedTableProps): ComponentReturnType;

/// TableView
export function TableView(props: TableProps): ComponentReturnType;

/// TablesView
export function TablesView(props: TablesProps): ComponentReturnType;

/// ValueView
export function ValueView(props: ValueProps): ComponentReturnType;

/// ValuesView
export function ValuesView(props: ValuesProps): ComponentReturnType;

/// MetricView
export function MetricView(props: MetricProps): ComponentReturnType;

/// SliceView
export function SliceView(props: SliceProps): ComponentReturnType;

/// IndexView
export function IndexView(props: IndexProps): ComponentReturnType;

/// RemoteRowView
export function RemoteRowView(props: RemoteRowProps): ComponentReturnType;

/// LocalRowsView
export function LocalRowsView(props: LocalRowsProps): ComponentReturnType;

/// LinkedRowsView
export function LinkedRowsView(props: LinkedRowsProps): ComponentReturnType;

/// ResultCellView
export function ResultCellView(props: ResultCellProps): ComponentReturnType;

/// ResultRowView
export function ResultRowView(props: ResultRowProps): ComponentReturnType;

/// ResultSortedTableView
export function ResultSortedTableView(
  props: ResultSortedTableProps,
): ComponentReturnType;

/// ResultTableView
export function ResultTableView(props: ResultTableProps): ComponentReturnType;

/// CheckpointView
export function CheckpointView(props: CheckpointProps): ComponentReturnType;

/// BackwardCheckpointsView
export function BackwardCheckpointsView(
  props: BackwardCheckpointsProps,
): ComponentReturnType;

/// CurrentCheckpointView
export function CurrentCheckpointView(
  props: CurrentCheckpointProps,
): ComponentReturnType;

/// ForwardCheckpointsView
export function ForwardCheckpointsView(
  props: ForwardCheckpointsProps,
): ComponentReturnType;
