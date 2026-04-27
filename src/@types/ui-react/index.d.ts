/// ui-react
import type {ComponentType, ReactElement} from 'react';
import type {
  CheckpointIds,
  CheckpointIdsListener,
  CheckpointListener,
  Checkpoints,
} from '../checkpoints/index.d.ts';
import type {
  Callback,
  Id,
  IdOrNull,
  Ids,
  ParameterizedCallback,
} from '../common/index.d.ts';
import type {
  Indexes,
  SliceIdsListener,
  SliceRowIdsListener,
} from '../indexes/index.d.ts';
import type {MergeableStore} from '../mergeable-store/index.d.ts';
import type {MetricListener, Metrics} from '../metrics/index.d.ts';
import type {
  AnyPersister,
  PersistedStore,
  Persister,
  Persists,
  Status,
  StatusListener,
} from '../persisters/index.d.ts';
import type {
  ParamValue,
  ParamValueListener,
  ParamValues,
  ParamValuesListener,
  Queries,
  ResultCellIdsListener,
  ResultCellListener,
  ResultRowCountListener,
  ResultRowIdsListener,
  ResultRowListener,
  ResultSortedRowIdsListener,
  ResultTableCellIdsListener,
  ResultTableListener,
} from '../queries/index.d.ts';
import type {
  LinkedRowIdsListener,
  LocalRowIdsListener,
  Relationships,
  RemoteRowIdListener,
} from '../relationships/index.d.ts';
import type {
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
  SortedRowIdsArgs,
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
} from '../store/index.d.ts';
import type {Synchronizer} from '../synchronizers/index.d.ts';

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

/// PersisterOrPersisterId
export type PersisterOrPersisterId = AnyPersister | Id;

/// SynchronizerOrSynchronizerId
export type SynchronizerOrSynchronizerId = Synchronizer | Id;

/// UndoOrRedoInformation
export type UndoOrRedoInformation = [boolean, Callback, Id | undefined, string];

/// GetId
export type GetId<Parameter> = (parameter: Parameter, store: Store) => Id;

/// useCreateStore
export function useCreateStore(
  create: () => Store,
  createDeps?: React.DependencyList,
): Store;

/// useCreateMergeableStore
export function useCreateMergeableStore(
  create: () => MergeableStore,
  createDeps?: React.DependencyList,
): MergeableStore;

/// useStoreIds
export function useStoreIds(): Ids;

/// useStore
export function useStore(id?: Id): Store | undefined;

/// useStores
export function useStores(): {[storeId: Id]: Store};

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

/// useTablesState
export function useTablesState(
  storeOrStoreId?: StoreOrStoreId,
): [Tables, (tables: Tables) => void];

/// useTableIds
export function useTableIds(storeOrStoreId?: StoreOrStoreId): Ids;

/// useHasTable
export function useHasTable(
  tableId: Id,
  storeOrStoreId?: StoreOrStoreId,
): boolean;

/// useTable
export function useTable(tableId: Id, storeOrStoreId?: StoreOrStoreId): Table;

/// useTableState
export function useTableState(
  tableId: Id,
  storeOrStoreId?: StoreOrStoreId,
): [Table, (table: Table) => void];

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

/// useSortedRowIds.2
export function useSortedRowIds(
  args: SortedRowIdsArgs,
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

/// useRowState
export function useRowState(
  tableId: Id,
  rowId: Id,
  storeOrStoreId?: StoreOrStoreId,
): [Row, (row: Row) => void];

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

/// useCellState
export function useCellState(
  tableId: Id,
  rowId: Id,
  cellId: Id,
  storeOrStoreId?: StoreOrStoreId,
): [CellOrUndefined, (cell: Cell) => void];

/// useHasValues
export function useHasValues(storeOrStoreId?: StoreOrStoreId): boolean;

/// useValues
export function useValues(storeOrStoreId?: StoreOrStoreId): Values;

/// useValuesState
export function useValuesState(
  storeOrStoreId?: StoreOrStoreId,
): [Values, (values: Values) => void];

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

/// useValueState
export function useValueState(
  valueId: Id,
  storeOrStoreId?: StoreOrStoreId,
): [value: ValueOrUndefined, setValue: (value: Value) => void];

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
export function useDelTableCallback<Parameter>(
  tableId: Id | GetId<Parameter>,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store) => void,
  thenDeps?: React.DependencyList,
): ParameterizedCallback<Parameter>;

/// useDelRowCallback
export function useDelRowCallback<Parameter>(
  tableId: Id | GetId<Parameter>,
  rowId: Id | GetId<Parameter>,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store) => void,
  thenDeps?: React.DependencyList,
): ParameterizedCallback<Parameter>;

/// useDelCellCallback
export function useDelCellCallback<Parameter>(
  tableId: Id | GetId<Parameter>,
  rowId: Id | GetId<Parameter>,
  cellId: Id | GetId<Parameter>,
  forceDel?: boolean,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store) => void,
  thenDeps?: React.DependencyList,
): ParameterizedCallback<Parameter>;

/// useDelValuesCallback
export function useDelValuesCallback(
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store) => void,
  thenDeps?: React.DependencyList,
): Callback;

/// useDelValueCallback
export function useDelValueCallback<Parameter>(
  valueId: Id | GetId<Parameter>,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store) => void,
  thenDeps?: React.DependencyList,
): ParameterizedCallback<Parameter>;

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

/// useSortedRowIdsListener.2
export function useSortedRowIdsListener(
  args: SortedRowIdsArgs,
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
  store: Store | undefined,
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

/// useProvideMetrics
export function useProvideMetrics(metricsId: Id, metrics: Metrics): void;

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
  store: Store | undefined,
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

/// useProvideIndexes
export function useProvideIndexes(indexesId: Id, indexes: Indexes): void;

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
  store: Store | undefined,
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

/// useProvideRelationships
export function useProvideRelationships(
  relationshipsId: Id,
  relationships: Relationships,
): void;

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
  store: Store | undefined,
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

/// useProvideQueries
export function useProvideQueries(queriesId: Id, queries: Queries): void;

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

/// useParamValues
export function useParamValues(
  queryId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): ParamValues;

/// useParamValuesState
export function useParamValuesState(
  queryId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): [ParamValues, (paramValues: ParamValues) => void];

/// useParamValue
export function useParamValue(
  queryId: Id,
  paramId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): ParamValue | undefined;

/// useParamValueState
export function useParamValueState(
  queryId: Id,
  paramId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): [ParamValue | undefined, (paramValue: ParamValue) => void];

/// useParamValuesListener
export function useParamValuesListener(
  queryId: IdOrNull,
  listener: ParamValuesListener,
  listenerDeps?: React.DependencyList,
  queriesOrQueriesId?: QueriesOrQueriesId,
): void;

/// useParamValueListener
export function useParamValueListener(
  queryId: IdOrNull,
  paramId: IdOrNull,
  listener: ParamValueListener,
  listenerDeps?: React.DependencyList,
  queriesOrQueriesId?: QueriesOrQueriesId,
): void;

/// useSetParamValueCallback
export function useSetParamValueCallback<Parameter>(
  queryId: Id | GetId<Parameter>,
  paramId: Id | GetId<Parameter>,
  getParamValue: (parameter: Parameter, queries: Queries) => ParamValue,
  getParamValueDeps?: React.DependencyList,
  queriesOrQueriesId?: QueriesOrQueriesId,
  then?: (queries: Queries, paramValue: ParamValue) => void,
  thenDeps?: React.DependencyList,
): ParameterizedCallback<Parameter>;

/// useSetParamValuesCallback
export function useSetParamValuesCallback<Parameter>(
  queryId: Id | GetId<Parameter>,
  getParamValues: (parameter: Parameter, queries: Queries) => ParamValues,
  getParamValuesDeps?: React.DependencyList,
  queriesOrQueriesId?: QueriesOrQueriesId,
  then?: (queries: Queries, paramValues: ParamValues) => void,
  thenDeps?: React.DependencyList,
): ParameterizedCallback<Parameter>;

/// useCreateCheckpoints
export function useCreateCheckpoints(
  store: Store | undefined,
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

/// useProvideCheckpoints
export function useProvideCheckpoints(
  checkpointsId: Id,
  checkpoints: Checkpoints,
): void;

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
  Persist extends Persists,
  PersisterOrUndefined extends Persister<Persist> | undefined,
>(
  store: PersistedStore<Persist> | undefined,
  create: (
    store: PersistedStore<Persist>,
  ) => PersisterOrUndefined | Promise<PersisterOrUndefined>,
  createDeps?: React.DependencyList,
  then?: (persister: Persister<Persist>) => Promise<any>,
  thenDeps?: React.DependencyList,
  destroy?: (persister: Persister<Persist>) => void,
  destroyDeps?: React.DependencyList,
): PersisterOrUndefined;

/// usePersisterIds
export function usePersisterIds(): Ids;

/// usePersister
export function usePersister(id?: Id): AnyPersister | undefined;

/// usePersisterOrPersisterById
export function usePersisterOrPersisterById(
  persisterOrPersisterId?: PersisterOrPersisterId,
): AnyPersister | undefined;

/// useProvidePersister
export function useProvidePersister(
  persisterId: Id,
  persister: AnyPersister,
): void;

/// usePersisterStatus
export function usePersisterStatus(
  persisterOrPersisterId?: PersisterOrPersisterId,
): Status;

/// usePersisterStatusListener
export function usePersisterStatusListener(
  listener: StatusListener,
  listenerDeps?: React.DependencyList,
  persisterOrPersisterId?: PersisterOrPersisterId,
): void;

/// useCreateSynchronizer
export function useCreateSynchronizer<
  SynchronizerOrUndefined extends Synchronizer | undefined,
>(
  store: MergeableStore | undefined,
  create: (store: MergeableStore) => Promise<SynchronizerOrUndefined>,
  createDeps?: React.DependencyList,
  destroy?: (synchronizer: Synchronizer) => void,
  destroyDeps?: React.DependencyList,
): SynchronizerOrUndefined;

/// useSynchronizerIds
export function useSynchronizerIds(): Ids;

/// useSynchronizer
export function useSynchronizer(id?: Id): Synchronizer | undefined;

/// useSynchronizerOrSynchronizerById
export function useSynchronizerOrSynchronizerById(
  synchronizerOrSynchronizerId?: SynchronizerOrSynchronizerId,
): Synchronizer | undefined;

/// useProvideSynchronizer
export function useProvideSynchronizer(
  synchronizerId: Id,
  synchronizer: Synchronizer,
): void;

/// useSynchronizerStatus
export function useSynchronizerStatus(
  synchronizerOrSynchronizerId?: SynchronizerOrSynchronizerId,
): Status;

/// useSynchronizerStatusListener
export function useSynchronizerStatusListener(
  listener: StatusListener,
  listenerDeps?: React.DependencyList,
  synchronizerOrSynchronizerId?: SynchronizerOrSynchronizerId,
): void;

/// ExtraProps
export type ExtraProps = {[propName: string]: any};

/// TablesProps
export type TablesProps = {
  /// ui-react.TablesProps.store
  readonly store?: StoreOrStoreId;
  /// ui-react.TablesProps.tableComponent
  readonly tableComponent?: ComponentType<TableProps>;
  /// ui-react.TablesProps.getTableComponentProps
  readonly getTableComponentProps?: (tableId: Id) => ExtraProps;
  /// ui-react.TablesProps.separator
  readonly separator?: ReactElement | string;
  /// ui-react.TablesProps.debugIds
  readonly debugIds?: boolean;
};

/// TableProps
export type TableProps = {
  /// ui-react.TableProps.tableId
  readonly tableId: Id;
  /// ui-react.TableProps.store
  readonly store?: StoreOrStoreId;
  /// ui-react.TableProps.rowComponent
  readonly rowComponent?: ComponentType<RowProps>;
  /// ui-react.TableProps.getRowComponentProps
  readonly getRowComponentProps?: (rowId: Id) => ExtraProps;
  /// ui-react.TableProps.customCellIds
  readonly customCellIds?: Ids;
  /// ui-react.TableProps.separator
  readonly separator?: ReactElement | string;
  /// ui-react.TableProps.debugIds
  readonly debugIds?: boolean;
};

/// SortedTableProps
export type SortedTableProps = {
  /// ui-react.SortedTableProps.tableId
  readonly tableId: Id;
  /// ui-react.SortedTableProps.cellId
  readonly cellId?: Id;
  /// ui-react.SortedTableProps.descending
  readonly descending?: boolean;
  /// ui-react.SortedTableProps.offset
  readonly offset?: number;
  /// ui-react.SortedTableProps.limit
  readonly limit?: number;
  /// ui-react.SortedTableProps.store
  readonly store?: StoreOrStoreId;
  /// ui-react.SortedTableProps.rowComponent
  readonly rowComponent?: ComponentType<RowProps>;
  /// ui-react.SortedTableProps.getRowComponentProps
  readonly getRowComponentProps?: (rowId: Id) => ExtraProps;
  /// ui-react.SortedTableProps.customCellIds
  readonly customCellIds?: Ids;
  /// ui-react.SortedTableProps.separator
  readonly separator?: ReactElement | string;
  /// ui-react.SortedTableProps.debugIds
  readonly debugIds?: boolean;
};

/// RowProps
export type RowProps = {
  /// ui-react.RowProps.tableId
  readonly tableId: Id;
  /// ui-react.RowProps.rowId
  readonly rowId: Id;
  /// ui-react.RowProps.store
  readonly store?: StoreOrStoreId;
  /// ui-react.RowProps.cellComponent
  readonly cellComponent?: ComponentType<CellProps>;
  /// ui-react.RowProps.getCellComponentProps
  readonly getCellComponentProps?: (cellId: Id) => ExtraProps;
  /// ui-react.RowProps.customCellIds
  readonly customCellIds?: Ids;
  /// ui-react.RowProps.separator
  readonly separator?: ReactElement | string;
  /// ui-react.RowProps.debugIds
  readonly debugIds?: boolean;
};

/// CellProps
export type CellProps = {
  /// ui-react.CellProps.tableId
  readonly tableId: Id;
  /// ui-react.CellProps.rowId
  readonly rowId: Id;
  /// ui-react.CellProps.cellId
  readonly cellId: Id;
  /// ui-react.CellProps.store
  readonly store?: StoreOrStoreId;
  /// ui-react.CellProps.debugIds
  readonly debugIds?: boolean;
};

/// ValuesProps
export type ValuesProps = {
  /// ui-react.ValuesProps.store
  readonly store?: StoreOrStoreId;
  /// ui-react.ValuesProps.valueComponent
  readonly valueComponent?: ComponentType<ValueProps>;
  /// ui-react.ValuesProps.getValueComponentProps
  readonly getValueComponentProps?: (valueId: Id) => ExtraProps;
  /// ui-react.ValuesProps.separator
  readonly separator?: ReactElement | string;
  /// ui-react.ValuesProps.debugIds
  readonly debugIds?: boolean;
};

/// ValueProps
export type ValueProps = {
  /// ui-react.ValueProps.valueId
  readonly valueId: Id;
  /// ui-react.ValueProps.store
  readonly store?: StoreOrStoreId;
  /// ui-react.ValueProps.debugIds
  readonly debugIds?: boolean;
};

/// MetricProps
export type MetricProps = {
  /// ui-react.MetricProps.metricId
  readonly metricId: Id;
  /// ui-react.MetricProps.metrics
  readonly metrics?: MetricsOrMetricsId;
  /// ui-react.MetricProps.debugIds
  readonly debugIds?: boolean;
};

/// IndexProps
export type IndexProps = {
  /// ui-react.IndexProps.indexId
  readonly indexId: Id;
  /// ui-react.IndexProps.indexes
  readonly indexes?: IndexesOrIndexesId;
  /// ui-react.IndexProps.sliceComponent
  readonly sliceComponent?: ComponentType<SliceProps>;
  /// ui-react.IndexProps.getSliceComponentProps
  readonly getSliceComponentProps?: (sliceId: Id) => ExtraProps;
  /// ui-react.IndexProps.separator
  readonly separator?: ReactElement | string;
  /// ui-react.IndexProps.debugIds
  readonly debugIds?: boolean;
};

/// SliceProps
export type SliceProps = {
  /// ui-react.SliceProps.indexId
  readonly indexId: Id;
  /// ui-react.SliceProps.sliceId
  readonly sliceId: Id;
  /// ui-react.SliceProps.indexes
  readonly indexes?: IndexesOrIndexesId;
  /// ui-react.SliceProps.rowComponent
  readonly rowComponent?: ComponentType<RowProps>;
  /// ui-react.SliceProps.getRowComponentProps
  readonly getRowComponentProps?: (rowId: Id) => ExtraProps;
  /// ui-react.SliceProps.separator
  readonly separator?: ReactElement | string;
  /// ui-react.SliceProps.debugIds
  readonly debugIds?: boolean;
};

/// RemoteRowProps
export type RemoteRowProps = {
  /// ui-react.RemoteRowProps.relationshipId
  readonly relationshipId: Id;
  /// ui-react.RemoteRowProps.localRowId
  readonly localRowId: Id;
  /// ui-react.RemoteRowProps.relationships
  readonly relationships?: RelationshipsOrRelationshipsId;
  /// ui-react.RemoteRowProps.rowComponent
  readonly rowComponent?: ComponentType<RowProps>;
  /// ui-react.RemoteRowProps.getRowComponentProps
  readonly getRowComponentProps?: (rowId: Id) => ExtraProps;
  /// ui-react.RemoteRowProps.debugIds
  readonly debugIds?: boolean;
};

/// LocalRowsProps
export type LocalRowsProps = {
  /// ui-react.LocalRowsProps.relationshipId
  readonly relationshipId: Id;
  /// ui-react.LocalRowsProps.remoteRowId
  readonly remoteRowId: Id;
  /// ui-react.LocalRowsProps.relationships
  readonly relationships?: RelationshipsOrRelationshipsId;
  /// ui-react.LocalRowsProps.rowComponent
  readonly rowComponent?: ComponentType<RowProps>;
  /// ui-react.LocalRowsProps.getRowComponentProps
  readonly getRowComponentProps?: (rowId: Id) => ExtraProps;
  /// ui-react.LocalRowsProps.separator
  readonly separator?: ReactElement | string;
  /// ui-react.LocalRowsProps.debugIds
  readonly debugIds?: boolean;
};

/// LinkedRowsProps
export type LinkedRowsProps = {
  /// ui-react.LinkedRowsProps.relationshipId
  readonly relationshipId: Id;
  /// ui-react.LinkedRowsProps.firstRowId
  readonly firstRowId: Id;
  /// ui-react.LinkedRowsProps.relationships
  readonly relationships?: RelationshipsOrRelationshipsId;
  /// ui-react.LinkedRowsProps.rowComponent
  readonly rowComponent?: ComponentType<RowProps>;
  /// ui-react.LinkedRowsProps.getRowComponentProps
  readonly getRowComponentProps?: (rowId: Id) => ExtraProps;
  /// ui-react.LinkedRowsProps.separator
  readonly separator?: ReactElement | string;
  /// ui-react.LinkedRowsProps.debugIds
  readonly debugIds?: boolean;
};

/// ResultTableProps
export type ResultTableProps = {
  /// ui-react.ResultTableProps.queryId
  readonly queryId: Id;
  /// ui-react.ResultTableProps.queries
  readonly queries?: QueriesOrQueriesId;
  /// ui-react.ResultTableProps.resultRowComponent
  readonly resultRowComponent?: ComponentType<ResultRowProps>;
  /// ui-react.ResultTableProps.getResultRowComponentProps
  readonly getResultRowComponentProps?: (rowId: Id) => ExtraProps;
  /// ui-react.ResultTableProps.separator
  readonly separator?: ReactElement | string;
  /// ui-react.ResultTableProps.debugIds
  readonly debugIds?: boolean;
};

/// ResultSortedTableProps
export type ResultSortedTableProps = {
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
  readonly queries?: QueriesOrQueriesId;
  /// ui-react.ResultSortedTableProps.resultRowComponent
  readonly resultRowComponent?: ComponentType<ResultRowProps>;
  /// ui-react.ResultSortedTableProps.getResultRowComponentProps
  readonly getResultRowComponentProps?: (rowId: Id) => ExtraProps;
  /// ui-react.ResultSortedTableProps.separator
  readonly separator?: ReactElement | string;
  /// ui-react.ResultSortedTableProps.debugIds
  readonly debugIds?: boolean;
};

/// ResultRowProps
export type ResultRowProps = {
  /// ui-react.ResultRowProps.queryId
  readonly queryId: Id;
  /// ui-react.ResultRowProps.rowId
  readonly rowId: Id;
  /// ui-react.ResultRowProps.queries
  readonly queries?: QueriesOrQueriesId;
  /// ui-react.ResultRowProps.resultCellComponent
  readonly resultCellComponent?: ComponentType<ResultCellProps>;
  /// ui-react.ResultRowProps.getResultCellComponentProps
  readonly getResultCellComponentProps?: (cellId: Id) => ExtraProps;
  /// ui-react.ResultRowProps.separator
  readonly separator?: ReactElement | string;
  /// ui-react.ResultRowProps.debugIds
  readonly debugIds?: boolean;
};

/// ResultCellProps
export type ResultCellProps = {
  /// ui-react.ResultCellProps.queryId
  readonly queryId: Id;
  /// ui-react.ResultCellProps.rowId
  readonly rowId: Id;
  /// ui-react.ResultCellProps.cellId
  readonly cellId: Id;
  /// ui-react.ResultCellProps.queries
  readonly queries?: QueriesOrQueriesId;
  /// ui-react.ResultCellProps.debugIds
  readonly debugIds?: boolean;
};

/// CheckpointProps
export type CheckpointProps = {
  /// ui-react.CheckpointProps.checkpointId
  readonly checkpointId: Id;
  /// ui-react.CheckpointProps.checkpoints
  readonly checkpoints?: CheckpointsOrCheckpointsId;
  /// ui-react.CheckpointProps.debugIds
  readonly debugIds?: boolean;
};

/// BackwardCheckpointsProps
export type BackwardCheckpointsProps = {
  /// ui-react.BackwardCheckpointsProps.checkpoints
  readonly checkpoints?: CheckpointsOrCheckpointsId;
  /// ui-react.BackwardCheckpointsProps.checkpointComponent
  readonly checkpointComponent?: ComponentType<CheckpointProps>;
  /// ui-react.BackwardCheckpointsProps.getCheckpointComponentProps
  readonly getCheckpointComponentProps?: (checkpointId: Id) => ExtraProps;
  /// ui-react.BackwardCheckpointsProps.separator
  readonly separator?: ReactElement | string;
  /// ui-react.BackwardCheckpointsProps.debugIds
  readonly debugIds?: boolean;
};

/// CurrentCheckpointProps
export type CurrentCheckpointProps = {
  /// ui-react.CurrentCheckpointProps.checkpoints
  readonly checkpoints?: CheckpointsOrCheckpointsId;
  /// ui-react.CurrentCheckpointProps.checkpointComponent
  readonly checkpointComponent?: ComponentType<CheckpointProps>;
  /// ui-react.CurrentCheckpointProps.getCheckpointComponentProps
  readonly getCheckpointComponentProps?: (checkpointId: Id) => ExtraProps;
  /// ui-react.CurrentCheckpointProps.debugIds
  readonly debugIds?: boolean;
};

/// ForwardCheckpointsProps
export type ForwardCheckpointsProps = {
  /// ui-react.ForwardCheckpointsProps.checkpoints
  readonly checkpoints?: CheckpointsOrCheckpointsId;
  /// ui-react.ForwardCheckpointsProps.checkpointComponent
  readonly checkpointComponent?: ComponentType<CheckpointProps>;
  /// ui-react.ForwardCheckpointsProps.getCheckpointComponentProps
  readonly getCheckpointComponentProps?: (checkpointId: Id) => ExtraProps;
  /// ui-react.ForwardCheckpointsProps.separator
  readonly separator?: ReactElement | string;
  /// ui-react.ForwardCheckpointsProps.debugIds
  readonly debugIds?: boolean;
};

/// ProviderProps
export type ProviderProps = {
  /// ui-react.ProviderProps.store
  readonly store?: Store;
  /// ui-react.ProviderProps.storesById
  readonly storesById?: {[storeId: Id]: Store};
  /// ui-react.ProviderProps.metrics
  readonly metrics?: Metrics;
  /// ui-react.ProviderProps.metricsById
  readonly metricsById?: {[metricsId: Id]: Metrics};
  /// ui-react.ProviderProps.indexes
  readonly indexes?: Indexes;
  /// ui-react.ProviderProps.indexesById
  readonly indexesById?: {[indexesId: Id]: Indexes};
  /// ui-react.ProviderProps.relationships
  readonly relationships?: Relationships;
  /// ui-react.ProviderProps.relationshipsById
  readonly relationshipsById?: {[relationshipsId: Id]: Relationships};
  /// ui-react.ProviderProps.queries
  readonly queries?: Queries;
  /// ui-react.ProviderProps.queriesById
  readonly queriesById?: {[queriesId: Id]: Queries};
  /// ui-react.ProviderProps.checkpoints
  readonly checkpoints?: Checkpoints;
  /// ui-react.ProviderProps.checkpointsById
  readonly checkpointsById?: {[checkpointsId: Id]: Checkpoints};
  /// ui-react.ProviderProps.persister
  readonly persister?: AnyPersister;
  /// ui-react.ProviderProps.persistersById
  readonly persistersById?: {
    [persisterId: Id]: AnyPersister;
  };
  /// ui-react.ProviderProps.synchronizer
  readonly synchronizer?: Synchronizer;
  /// ui-react.ProviderProps.synchronizersById
  readonly synchronizersById?: {[synchronizerId: Id]: Synchronizer};
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
