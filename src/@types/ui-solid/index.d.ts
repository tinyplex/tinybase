import type {Component, JSXElement} from 'solid-js';
import type {DependencyList} from '../common/solid.ts';
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

export type StoreOrStoreId = Store | Id;

export type MetricsOrMetricsId = Metrics | Id;

export type IndexesOrIndexesId = Indexes | Id;

export type RelationshipsOrRelationshipsId = Relationships | Id;

export type QueriesOrQueriesId = Queries | Id;

export type CheckpointsOrCheckpointsId = Checkpoints | Id;

export type PersisterOrPersisterId = AnyPersister | Id;

export type SynchronizerOrSynchronizerId = Synchronizer | Id;

export type UndoOrRedoInformation = [boolean, Callback, Id | undefined, string];

export type GetId<Parameter> = (parameter: Parameter, store: Store) => Id;

export function useCreateStore(
  create: () => Store,
  createDeps?: DependencyList,
): Store;

export function useCreateMergeableStore(
  create: () => MergeableStore,
  createDeps?: DependencyList,
): MergeableStore;

export function useStoreIds(): Ids;

export function useStore(id?: Id): Store | undefined;

export function useStores(): {[storeId: Id]: Store};

export function useStoreOrStoreById(
  storeOrStoreId?: StoreOrStoreId,
): Store | undefined;

export function useProvideStore(storeId: Id, store: Store): void;

export function useHasTables(storeOrStoreId?: StoreOrStoreId): boolean;

export function useTables(storeOrStoreId?: StoreOrStoreId): Tables;

export function useTablesState(
  storeOrStoreId?: StoreOrStoreId,
): [Tables, (tables: Tables) => void];

export function useTableIds(storeOrStoreId?: StoreOrStoreId): Ids;

export function useHasTable(
  tableId: Id,
  storeOrStoreId?: StoreOrStoreId,
): boolean;

export function useTable(tableId: Id, storeOrStoreId?: StoreOrStoreId): Table;

export function useTableState(
  tableId: Id,
  storeOrStoreId?: StoreOrStoreId,
): [Table, (table: Table) => void];

export function useTableCellIds(
  tableId: Id,
  storeOrStoreId?: StoreOrStoreId,
): Ids;

export function useHasTableCell(
  tableId: Id,
  cellId: Id,
  storeOrStoreId?: StoreOrStoreId,
): boolean;

export function useRowCount(
  tableId: Id,
  storeOrStoreId?: StoreOrStoreId,
): number;

export function useRowIds(tableId: Id, storeOrStoreId?: StoreOrStoreId): Ids;

export function useSortedRowIds(
  tableId: Id,
  cellId?: Id,
  descending?: boolean,
  offset?: number,
  limit?: number,
  storeOrStoreId?: StoreOrStoreId,
): Ids;

export function useSortedRowIds(
  args: SortedRowIdsArgs,
  storeOrStoreId?: StoreOrStoreId,
): Ids;

export function useHasRow(
  tableId: Id,
  rowId: Id,
  storeOrStoreId?: StoreOrStoreId,
): boolean;

export function useRow(
  tableId: Id,
  rowId: Id,
  storeOrStoreId?: StoreOrStoreId,
): Row;

export function useRowState(
  tableId: Id,
  rowId: Id,
  storeOrStoreId?: StoreOrStoreId,
): [Row, (row: Row) => void];

export function useCellIds(
  tableId: Id,
  rowId: Id,
  storeOrStoreId?: StoreOrStoreId,
): Ids;

export function useHasCell(
  tableId: Id,
  rowId: Id,
  cellId: Id,
  storeOrStoreId?: StoreOrStoreId,
): boolean;

export function useCell(
  tableId: Id,
  rowId: Id,
  cellId: Id,
  storeOrStoreId?: StoreOrStoreId,
): CellOrUndefined;

export function useCellState(
  tableId: Id,
  rowId: Id,
  cellId: Id,
  storeOrStoreId?: StoreOrStoreId,
): [CellOrUndefined, (cell: Cell) => void];

export function useHasValues(storeOrStoreId?: StoreOrStoreId): boolean;

export function useValues(storeOrStoreId?: StoreOrStoreId): Values;

export function useValuesState(
  storeOrStoreId?: StoreOrStoreId,
): [Values, (values: Values) => void];

export function useValueIds(storeOrStoreId?: StoreOrStoreId): Ids;

export function useHasValue(
  valueId: Id,
  storeOrStoreId?: StoreOrStoreId,
): boolean;

export function useValue(
  valueId: Id,
  storeOrStoreId?: StoreOrStoreId,
): ValueOrUndefined;

export function useValueState(
  valueId: Id,
  storeOrStoreId?: StoreOrStoreId,
): [value: ValueOrUndefined, setValue: (value: Value) => void];

export function useSetTablesCallback<Parameter>(
  getTables: (parameter: Parameter, store: Store) => Tables,
  getTablesDeps?: DependencyList,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store, tables: Tables) => void,
  thenDeps?: DependencyList,
): ParameterizedCallback<Parameter>;

export function useSetTableCallback<Parameter>(
  tableId: Id | GetId<Parameter>,
  getTable: (parameter: Parameter, store: Store) => Table,
  getTableDeps?: DependencyList,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store, table: Table) => void,
  thenDeps?: DependencyList,
): ParameterizedCallback<Parameter>;

export function useSetRowCallback<Parameter>(
  tableId: Id | GetId<Parameter>,
  rowId: Id | GetId<Parameter>,
  getRow: (parameter: Parameter, store: Store) => Row,
  getRowDeps?: DependencyList,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store, row: Row) => void,
  thenDeps?: DependencyList,
): ParameterizedCallback<Parameter>;

export function useAddRowCallback<Parameter>(
  tableId: Id | GetId<Parameter>,
  getRow: (parameter: Parameter, store: Store) => Row,
  getRowDeps?: DependencyList,
  storeOrStoreId?: StoreOrStoreId,
  then?: (rowId: Id | undefined, store: Store, row: Row) => void,
  thenDeps?: DependencyList,
  reuseRowIds?: boolean,
): ParameterizedCallback<Parameter>;

export function useSetPartialRowCallback<Parameter>(
  tableId: Id | GetId<Parameter>,
  rowId: Id | GetId<Parameter>,
  getPartialRow: (parameter: Parameter, store: Store) => Row,
  getPartialRowDeps?: DependencyList,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store, partialRow: Row) => void,
  thenDeps?: DependencyList,
): ParameterizedCallback<Parameter>;

export function useSetCellCallback<Parameter>(
  tableId: Id | GetId<Parameter>,
  rowId: Id | GetId<Parameter>,
  cellId: Id | GetId<Parameter>,
  getCell: (parameter: Parameter, store: Store) => Cell | MapCell,
  getCellDeps?: DependencyList,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store, cell: Cell | MapCell) => void,
  thenDeps?: DependencyList,
): ParameterizedCallback<Parameter>;

export function useSetValuesCallback<Parameter>(
  getValues: (parameter: Parameter, store: Store) => Values,
  getValuesDeps?: DependencyList,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store, values: Values) => void,
  thenDeps?: DependencyList,
): ParameterizedCallback<Parameter>;

export function useSetPartialValuesCallback<Parameter>(
  getPartialValues: (parameter: Parameter, store: Store) => Values,
  getPartialValuesDeps?: DependencyList,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store, partialValues: Values) => void,
  thenDeps?: DependencyList,
): ParameterizedCallback<Parameter>;

export function useSetValueCallback<Parameter>(
  valueId: Id | GetId<Parameter>,
  getValue: (parameter: Parameter, store: Store) => Value | MapValue,
  getValueDeps?: DependencyList,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store, value: Value | MapValue) => void,
  thenDeps?: DependencyList,
): ParameterizedCallback<Parameter>;

export function useDelTablesCallback(
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store) => void,
  thenDeps?: DependencyList,
): Callback;

export function useDelTableCallback<Parameter>(
  tableId: Id | GetId<Parameter>,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store) => void,
  thenDeps?: DependencyList,
): ParameterizedCallback<Parameter>;

export function useDelRowCallback<Parameter>(
  tableId: Id | GetId<Parameter>,
  rowId: Id | GetId<Parameter>,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store) => void,
  thenDeps?: DependencyList,
): ParameterizedCallback<Parameter>;

export function useDelCellCallback<Parameter>(
  tableId: Id | GetId<Parameter>,
  rowId: Id | GetId<Parameter>,
  cellId: Id | GetId<Parameter>,
  forceDel?: boolean,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store) => void,
  thenDeps?: DependencyList,
): ParameterizedCallback<Parameter>;

export function useDelValuesCallback(
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store) => void,
  thenDeps?: DependencyList,
): Callback;

export function useDelValueCallback<Parameter>(
  valueId: Id | GetId<Parameter>,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store) => void,
  thenDeps?: DependencyList,
): ParameterizedCallback<Parameter>;

export function useHasTablesListener(
  listener: HasTablesListener,
  listenerDeps?: DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useTablesListener(
  listener: TablesListener,
  listenerDeps?: DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useTableIdsListener(
  listener: TableIdsListener,
  listenerDeps?: DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useHasTableListener(
  tableId: IdOrNull,
  listener: HasTableListener,
  listenerDeps?: DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useTableListener(
  tableId: IdOrNull,
  listener: TableListener,
  listenerDeps?: DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useTableCellIdsListener(
  tableId: IdOrNull,
  listener: TableCellIdsListener,
  listenerDeps?: DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useHasTableCellListener(
  tableId: IdOrNull,
  cellId: IdOrNull,
  listener: HasTableCellListener,
  listenerDeps?: DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useRowCountListener(
  tableId: IdOrNull,
  listener: RowCountListener,
  listenerDeps?: DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useRowIdsListener(
  tableId: IdOrNull,
  listener: RowIdsListener,
  listenerDeps?: DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useSortedRowIdsListener(
  tableId: Id,
  cellId: Id | undefined,
  descending: boolean,
  offset: number,
  limit: number | undefined,
  listener: SortedRowIdsListener,
  listenerDeps?: DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useSortedRowIdsListener(
  args: SortedRowIdsArgs,
  listener: SortedRowIdsListener,
  listenerDeps?: DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useHasRowListener(
  tableId: IdOrNull,
  rowId: IdOrNull,
  listener: HasRowListener,
  listenerDeps?: DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useRowListener(
  tableId: IdOrNull,
  rowId: IdOrNull,
  listener: RowListener,
  listenerDeps?: DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useCellIdsListener(
  tableId: IdOrNull,
  rowId: IdOrNull,
  listener: CellIdsListener,
  listenerDeps?: DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useHasCellListener(
  tableId: IdOrNull,
  rowId: IdOrNull,
  cellId: IdOrNull,
  listener: HasCellListener,
  listenerDeps?: DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useCellListener(
  tableId: IdOrNull,
  rowId: IdOrNull,
  cellId: IdOrNull,
  listener: CellListener,
  listenerDeps?: DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useHasValuesListener(
  listener: HasValuesListener,
  listenerDeps?: DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useValuesListener(
  listener: ValuesListener,
  listenerDeps?: DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useValueIdsListener(
  listener: ValueIdsListener,
  listenerDeps?: DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useHasValueListener(
  valueId: IdOrNull,
  listener: HasValueListener,
  listenerDeps?: DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useValueListener(
  valueId: IdOrNull,
  listener: ValueListener,
  listenerDeps?: DependencyList,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useStartTransactionListener(
  listener: TransactionListener,
  listenerDeps?: DependencyList,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useWillFinishTransactionListener(
  listener: TransactionListener,
  listenerDeps?: DependencyList,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useDidFinishTransactionListener(
  listener: TransactionListener,
  listenerDeps?: DependencyList,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useCreateMetrics(
  store: Store | undefined,
  create: (store: Store) => Metrics,
  createDeps?: DependencyList,
): Metrics | undefined;

export function useMetricsIds(): Ids;

export function useMetrics(id?: Id): Metrics | undefined;

export function useMetricsOrMetricsById(
  metricsOrMetricsId?: MetricsOrMetricsId,
): Metrics | undefined;

export function useProvideMetrics(metricsId: Id, metrics: Metrics): void;

export function useMetricIds(metricsOrMetricsId?: MetricsOrMetricsId): Ids;

export function useMetric(
  metricId: Id,
  metricsOrMetricsId?: MetricsOrMetricsId,
): number | undefined;

export function useMetricListener(
  metricId: IdOrNull,
  listener: MetricListener,
  listenerDeps?: DependencyList,
  metricsOrMetricsId?: MetricsOrMetricsId,
): void;

export function useCreateIndexes(
  store: Store | undefined,
  create: (store: Store) => Indexes,
  createDeps?: DependencyList,
): Indexes | undefined;

export function useIndexesIds(): Ids;

export function useIndexes(id?: Id): Indexes | undefined;

export function useIndexesOrIndexesById(
  indexesOrIndexesId?: IndexesOrIndexesId,
): Indexes | undefined;

export function useProvideIndexes(indexesId: Id, indexes: Indexes): void;

export function useIndexIds(indexesOrIndexesId?: IndexesOrIndexesId): Ids;

export function useSliceIds(
  indexId: Id,
  indexesOrIndexesId?: IndexesOrIndexesId,
): Ids;

export function useSliceRowIds(
  indexId: Id,
  sliceId: Id,
  indexesOrIndexesId?: IndexesOrIndexesId,
): Ids;

export function useSliceIdsListener(
  indexId: IdOrNull,
  listener: SliceIdsListener,
  listenerDeps?: DependencyList,
  indexesOrIndexesId?: IndexesOrIndexesId,
): void;

export function useSliceRowIdsListener(
  indexId: IdOrNull,
  sliceId: IdOrNull,
  listener: SliceRowIdsListener,
  listenerDeps?: DependencyList,
  indexesOrIndexesId?: IndexesOrIndexesId,
): void;

export function useCreateRelationships(
  store: Store | undefined,
  create: (store: Store) => Relationships,
  createDeps?: DependencyList,
): Relationships | undefined;

export function useRelationshipsIds(): Ids;

export function useRelationships(id?: Id): Relationships | undefined;

export function useRelationshipsOrRelationshipsById(
  relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId,
): Relationships | undefined;

export function useProvideRelationships(
  relationshipsId: Id,
  relationships: Relationships,
): void;

export function useRelationshipIds(
  relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId,
): Ids;

export function useRemoteRowId(
  relationshipId: Id,
  localRowId: Id,
  relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId,
): Id | undefined;

export function useLocalRowIds(
  relationshipId: Id,
  remoteRowId: Id,
  relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId,
): Ids;

export function useLinkedRowIds(
  relationshipId: Id,
  firstRowId: Id,
  relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId,
): Ids;

export function useRemoteRowIdListener(
  relationshipId: IdOrNull,
  localRowId: IdOrNull,
  listener: RemoteRowIdListener,
  listenerDeps?: DependencyList,
  relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId,
): void;

export function useLocalRowIdsListener(
  relationshipId: IdOrNull,
  remoteRowId: IdOrNull,
  listener: LocalRowIdsListener,
  listenerDeps?: DependencyList,
  relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId,
): void;

export function useLinkedRowIdsListener(
  relationshipId: Id,
  firstRowId: Id,
  listener: LinkedRowIdsListener,
  listenerDeps?: DependencyList,
  relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId,
): void;

export function useCreateQueries(
  store: Store | undefined,
  create: (store: Store) => Queries,
  createDeps?: DependencyList,
): Queries | undefined;

export function useQueriesIds(): Ids;

export function useQueries(id?: Id): Queries | undefined;

export function useQueriesOrQueriesById(
  queriesOrQueriesId?: QueriesOrQueriesId,
): Queries | undefined;

export function useProvideQueries(queriesId: Id, queries: Queries): void;

export function useQueryIds(queriesOrQueriesId?: QueriesOrQueriesId): Ids;

export function useResultTable(
  queryId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): Table;

export function useResultTableCellIds(
  queryId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): Ids;

export function useResultRowCount(
  queryId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): number;

export function useResultRowIds(
  queryId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): Ids;

export function useResultSortedRowIds(
  queryId: Id,
  cellId?: Id,
  descending?: boolean,
  offset?: number,
  limit?: number,
  queriesOrQueriesId?: QueriesOrQueriesId,
): Ids;

export function useResultRow(
  queryId: Id,
  rowId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): Row;

export function useResultCellIds(
  queryId: Id,
  rowId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): Ids;

export function useResultCell(
  queryId: Id,
  rowId: Id,
  cellId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): Cell | undefined;

export function useResultTableListener(
  queryId: IdOrNull,
  listener: ResultTableListener,
  listenerDeps?: DependencyList,
  queriesOrQueriesId?: QueriesOrQueriesId,
): void;

export function useResultTableCellIdsListener(
  queryId: IdOrNull,
  listener: ResultTableCellIdsListener,
  listenerDeps?: DependencyList,
  queriesOrQueriesId?: QueriesOrQueriesId,
): void;

export function useResultRowCountListener(
  queryId: IdOrNull,
  listener: ResultRowCountListener,
  listenerDeps?: DependencyList,
  queriesOrQueriesId?: QueriesOrQueriesId,
): void;

export function useResultRowIdsListener(
  queryId: IdOrNull,
  listener: ResultRowIdsListener,
  listenerDeps?: DependencyList,
  queriesOrQueriesId?: QueriesOrQueriesId,
): void;

export function useResultSortedRowIdsListener(
  queryId: Id,
  cellId: Id | undefined,
  descending: boolean,
  offset: number,
  limit: number | undefined,
  listener: ResultSortedRowIdsListener,
  listenerDeps?: DependencyList,
  queriesOrQueriesId?: QueriesOrQueriesId,
): void;

export function useResultRowListener(
  queryId: IdOrNull,
  rowId: IdOrNull,
  listener: ResultRowListener,
  listenerDeps?: DependencyList,
  queriesOrQueriesId?: QueriesOrQueriesId,
): void;

export function useResultCellIdsListener(
  queryId: IdOrNull,
  rowId: IdOrNull,
  listener: ResultCellIdsListener,
  listenerDeps?: DependencyList,
  queriesOrQueriesId?: QueriesOrQueriesId,
): void;

export function useResultCellListener(
  queryId: IdOrNull,
  rowId: IdOrNull,
  cellId: IdOrNull,
  listener: ResultCellListener,
  listenerDeps?: DependencyList,
  queriesOrQueriesId?: QueriesOrQueriesId,
): void;

export function useParamValues(
  queryId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): ParamValues;

export function useParamValuesState(
  queryId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): [ParamValues, (paramValues: ParamValues) => void];

export function useParamValue(
  queryId: Id,
  paramId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): ParamValue | undefined;

export function useParamValueState(
  queryId: Id,
  paramId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): [ParamValue | undefined, (paramValue: ParamValue) => void];

export function useParamValuesListener(
  queryId: IdOrNull,
  listener: ParamValuesListener,
  listenerDeps?: DependencyList,
  queriesOrQueriesId?: QueriesOrQueriesId,
): void;

export function useParamValueListener(
  queryId: IdOrNull,
  paramId: IdOrNull,
  listener: ParamValueListener,
  listenerDeps?: DependencyList,
  queriesOrQueriesId?: QueriesOrQueriesId,
): void;

export function useSetParamValueCallback<Parameter>(
  queryId: Id | GetId<Parameter>,
  paramId: Id | GetId<Parameter>,
  getParamValue: (parameter: Parameter, queries: Queries) => ParamValue,
  getParamValueDeps?: DependencyList,
  queriesOrQueriesId?: QueriesOrQueriesId,
  then?: (queries: Queries, paramValue: ParamValue) => void,
  thenDeps?: DependencyList,
): ParameterizedCallback<Parameter>;

export function useSetParamValuesCallback<Parameter>(
  queryId: Id | GetId<Parameter>,
  getParamValues: (parameter: Parameter, queries: Queries) => ParamValues,
  getParamValuesDeps?: DependencyList,
  queriesOrQueriesId?: QueriesOrQueriesId,
  then?: (queries: Queries, paramValues: ParamValues) => void,
  thenDeps?: DependencyList,
): ParameterizedCallback<Parameter>;

export function useCreateCheckpoints(
  store: Store | undefined,
  create: (store: Store) => Checkpoints,
  createDeps?: DependencyList,
): Checkpoints | undefined;

export function useCheckpointsIds(): Ids;

export function useCheckpoints(id?: Id): Checkpoints | undefined;

export function useCheckpointsOrCheckpointsById(
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): Checkpoints | undefined;

export function useProvideCheckpoints(
  checkpointsId: Id,
  checkpoints: Checkpoints,
): void;

export function useCheckpointIds(
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): CheckpointIds;

export function useCheckpoint(
  checkpointId: Id,
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): string | undefined;

export function useSetCheckpointCallback<Parameter>(
  getCheckpoint?: (parameter: Parameter) => string,
  getCheckpointDeps?: DependencyList,
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
  then?: (checkpointId: Id, checkpoints: Checkpoints, label?: string) => void,
  thenDeps?: DependencyList,
): ParameterizedCallback<Parameter>;

export function useGoBackwardCallback(
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): Callback;

export function useGoForwardCallback(
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): Callback;

export function useGoToCallback<Parameter>(
  getCheckpointId: (parameter: Parameter) => Id,
  getCheckpointIdDeps?: DependencyList,
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
  then?: (checkpoints: Checkpoints, checkpointId: Id) => void,
  thenDeps?: DependencyList,
): ParameterizedCallback<Parameter>;

export function useUndoInformation(
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): UndoOrRedoInformation;

export function useRedoInformation(
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): UndoOrRedoInformation;

export function useCheckpointIdsListener(
  listener: CheckpointIdsListener,
  listenerDeps?: DependencyList,
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): void;

export function useCheckpointListener(
  checkpointId: IdOrNull,
  listener: CheckpointListener,
  listenerDeps?: DependencyList,
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): void;

export function useCreatePersister<
  Persist extends Persists,
  PersisterOrUndefined extends Persister<Persist> | undefined,
>(
  store: PersistedStore<Persist> | undefined,
  create: (
    store: PersistedStore<Persist>,
  ) => PersisterOrUndefined | Promise<PersisterOrUndefined>,
  createDeps?: DependencyList,
  then?: (persister: Persister<Persist>) => Promise<any>,
  thenDeps?: DependencyList,
  destroy?: (persister: Persister<Persist>) => void,
  destroyDeps?: DependencyList,
): PersisterOrUndefined;

export function usePersisterIds(): Ids;

export function usePersister(id?: Id): AnyPersister | undefined;

export function usePersisterOrPersisterById(
  persisterOrPersisterId?: PersisterOrPersisterId,
): AnyPersister | undefined;

export function useProvidePersister(
  persisterId: Id,
  persister: AnyPersister,
): void;

export function usePersisterStatus(
  persisterOrPersisterId?: PersisterOrPersisterId,
): Status;

export function usePersisterStatusListener(
  listener: StatusListener,
  listenerDeps?: DependencyList,
  persisterOrPersisterId?: PersisterOrPersisterId,
): void;

export function useCreateSynchronizer<
  SynchronizerOrUndefined extends Synchronizer | undefined,
>(
  store: MergeableStore | undefined,
  create: (store: MergeableStore) => Promise<SynchronizerOrUndefined>,
  createDeps?: DependencyList,
  destroy?: (synchronizer: Synchronizer) => void,
  destroyDeps?: DependencyList,
): SynchronizerOrUndefined;

export function useSynchronizerIds(): Ids;

export function useSynchronizer(id?: Id): Synchronizer | undefined;

export function useSynchronizerOrSynchronizerById(
  synchronizerOrSynchronizerId?: SynchronizerOrSynchronizerId,
): Synchronizer | undefined;

export function useProvideSynchronizer(
  synchronizerId: Id,
  synchronizer: Synchronizer,
): void;

export function useSynchronizerStatus(
  synchronizerOrSynchronizerId?: SynchronizerOrSynchronizerId,
): Status;

export function useSynchronizerStatusListener(
  listener: StatusListener,
  listenerDeps?: DependencyList,
  synchronizerOrSynchronizerId?: SynchronizerOrSynchronizerId,
): void;

export type ExtraProps = {[propName: string]: any};

export type TablesProps = {
  /// TablesProps.store
  readonly store?: StoreOrStoreId;
  /// TablesProps.tableComponent
  readonly tableComponent?: Component<TableProps>;
  /// TablesProps.getTableComponentProps
  readonly getTableComponentProps?: (tableId: Id) => ExtraProps;
  /// TablesProps.separator
  readonly separator?: JSXElement | string;
  /// TablesProps.debugIds
  readonly debugIds?: boolean;
};

export type TableProps = {
  /// TableProps.tableId
  readonly tableId: Id;
  /// TableProps.store
  readonly store?: StoreOrStoreId;
  /// TableProps.rowComponent
  readonly rowComponent?: Component<RowProps>;
  /// TableProps.getRowComponentProps
  readonly getRowComponentProps?: (rowId: Id) => ExtraProps;
  /// TableProps.customCellIds
  readonly customCellIds?: Ids;
  /// TableProps.separator
  readonly separator?: JSXElement | string;
  /// TableProps.debugIds
  readonly debugIds?: boolean;
};

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
  readonly rowComponent?: Component<RowProps>;
  /// SortedTableProps.getRowComponentProps
  readonly getRowComponentProps?: (rowId: Id) => ExtraProps;
  /// SortedTableProps.customCellIds
  readonly customCellIds?: Ids;
  /// SortedTableProps.separator
  readonly separator?: JSXElement | string;
  /// SortedTableProps.debugIds
  readonly debugIds?: boolean;
};

export type RowProps = {
  /// RowProps.tableId
  readonly tableId: Id;
  /// RowProps.rowId
  readonly rowId: Id;
  /// RowProps.store
  readonly store?: StoreOrStoreId;
  /// RowProps.cellComponent
  readonly cellComponent?: Component<CellProps>;
  /// RowProps.getCellComponentProps
  readonly getCellComponentProps?: (cellId: Id) => ExtraProps;
  /// RowProps.customCellIds
  readonly customCellIds?: Ids;
  /// RowProps.separator
  readonly separator?: JSXElement | string;
  /// RowProps.debugIds
  readonly debugIds?: boolean;
};

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

export type ValuesProps = {
  /// ValuesProps.store
  readonly store?: StoreOrStoreId;
  /// ValuesProps.valueComponent
  readonly valueComponent?: Component<ValueProps>;
  /// ValuesProps.getValueComponentProps
  readonly getValueComponentProps?: (valueId: Id) => ExtraProps;
  /// ValuesProps.separator
  readonly separator?: JSXElement | string;
  /// ValuesProps.debugIds
  readonly debugIds?: boolean;
};

export type ValueProps = {
  /// ValueProps.valueId
  readonly valueId: Id;
  /// ValueProps.store
  readonly store?: StoreOrStoreId;
  /// ValueProps.debugIds
  readonly debugIds?: boolean;
};

export type MetricProps = {
  /// MetricProps.metricId
  readonly metricId: Id;
  /// MetricProps.metrics
  readonly metrics?: MetricsOrMetricsId;
  /// MetricProps.debugIds
  readonly debugIds?: boolean;
};

export type IndexProps = {
  /// IndexProps.indexId
  readonly indexId: Id;
  /// IndexProps.indexes
  readonly indexes?: IndexesOrIndexesId;
  /// IndexProps.sliceComponent
  readonly sliceComponent?: Component<SliceProps>;
  /// IndexProps.getSliceComponentProps
  readonly getSliceComponentProps?: (sliceId: Id) => ExtraProps;
  /// IndexProps.separator
  readonly separator?: JSXElement | string;
  /// IndexProps.debugIds
  readonly debugIds?: boolean;
};

export type SliceProps = {
  /// SliceProps.indexId
  readonly indexId: Id;
  /// SliceProps.sliceId
  readonly sliceId: Id;
  /// SliceProps.indexes
  readonly indexes?: IndexesOrIndexesId;
  /// SliceProps.rowComponent
  readonly rowComponent?: Component<RowProps>;
  /// SliceProps.getRowComponentProps
  readonly getRowComponentProps?: (rowId: Id) => ExtraProps;
  /// SliceProps.separator
  readonly separator?: JSXElement | string;
  /// SliceProps.debugIds
  readonly debugIds?: boolean;
};

export type RemoteRowProps = {
  /// RemoteRowProps.relationshipId
  readonly relationshipId: Id;
  /// RemoteRowProps.localRowId
  readonly localRowId: Id;
  /// RemoteRowProps.relationships
  readonly relationships?: RelationshipsOrRelationshipsId;
  /// RemoteRowProps.rowComponent
  readonly rowComponent?: Component<RowProps>;
  /// RemoteRowProps.getRowComponentProps
  readonly getRowComponentProps?: (rowId: Id) => ExtraProps;
  /// RemoteRowProps.debugIds
  readonly debugIds?: boolean;
};

export type LocalRowsProps = {
  /// LocalRowsProps.relationshipId
  readonly relationshipId: Id;
  /// LocalRowsProps.remoteRowId
  readonly remoteRowId: Id;
  /// LocalRowsProps.relationships
  readonly relationships?: RelationshipsOrRelationshipsId;
  /// LocalRowsProps.rowComponent
  readonly rowComponent?: Component<RowProps>;
  /// LocalRowsProps.getRowComponentProps
  readonly getRowComponentProps?: (rowId: Id) => ExtraProps;
  /// LocalRowsProps.separator
  readonly separator?: JSXElement | string;
  /// LocalRowsProps.debugIds
  readonly debugIds?: boolean;
};

export type LinkedRowsProps = {
  /// LinkedRowsProps.relationshipId
  readonly relationshipId: Id;
  /// LinkedRowsProps.firstRowId
  readonly firstRowId: Id;
  /// LinkedRowsProps.relationships
  readonly relationships?: RelationshipsOrRelationshipsId;
  /// LinkedRowsProps.rowComponent
  readonly rowComponent?: Component<RowProps>;
  /// LinkedRowsProps.getRowComponentProps
  readonly getRowComponentProps?: (rowId: Id) => ExtraProps;
  /// LinkedRowsProps.separator
  readonly separator?: JSXElement | string;
  /// LinkedRowsProps.debugIds
  readonly debugIds?: boolean;
};

export type ResultTableProps = {
  /// ResultTableProps.queryId
  readonly queryId: Id;
  /// ResultTableProps.queries
  readonly queries?: QueriesOrQueriesId;
  /// ResultTableProps.resultRowComponent
  readonly resultRowComponent?: Component<ResultRowProps>;
  /// ResultTableProps.getResultRowComponentProps
  readonly getResultRowComponentProps?: (rowId: Id) => ExtraProps;
  /// ResultTableProps.separator
  readonly separator?: JSXElement | string;
  /// ResultTableProps.debugIds
  readonly debugIds?: boolean;
};

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
  readonly resultRowComponent?: Component<ResultRowProps>;
  /// ResultSortedTableProps.getResultRowComponentProps
  readonly getResultRowComponentProps?: (rowId: Id) => ExtraProps;
  /// ResultSortedTableProps.separator
  readonly separator?: JSXElement | string;
  /// ResultSortedTableProps.debugIds
  readonly debugIds?: boolean;
};

export type ResultRowProps = {
  /// ResultRowProps.queryId
  readonly queryId: Id;
  /// ResultRowProps.rowId
  readonly rowId: Id;
  /// ResultRowProps.queries
  readonly queries?: QueriesOrQueriesId;
  /// ResultRowProps.resultCellComponent
  readonly resultCellComponent?: Component<ResultCellProps>;
  /// ResultRowProps.getResultCellComponentProps
  readonly getResultCellComponentProps?: (cellId: Id) => ExtraProps;
  /// ResultRowProps.separator
  readonly separator?: JSXElement | string;
  /// ResultRowProps.debugIds
  readonly debugIds?: boolean;
};

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

export type CheckpointProps = {
  /// CheckpointProps.checkpointId
  readonly checkpointId: Id;
  /// CheckpointProps.checkpoints
  readonly checkpoints?: CheckpointsOrCheckpointsId;
  /// CheckpointProps.debugIds
  readonly debugIds?: boolean;
};

export type BackwardCheckpointsProps = {
  /// BackwardCheckpointsProps.checkpoints
  readonly checkpoints?: CheckpointsOrCheckpointsId;
  /// BackwardCheckpointsProps.checkpointComponent
  readonly checkpointComponent?: Component<CheckpointProps>;
  /// BackwardCheckpointsProps.getCheckpointComponentProps
  readonly getCheckpointComponentProps?: (checkpointId: Id) => ExtraProps;
  /// BackwardCheckpointsProps.separator
  readonly separator?: JSXElement | string;
  /// BackwardCheckpointsProps.debugIds
  readonly debugIds?: boolean;
};

export type CurrentCheckpointProps = {
  /// CurrentCheckpointProps.checkpoints
  readonly checkpoints?: CheckpointsOrCheckpointsId;
  /// CurrentCheckpointProps.checkpointComponent
  readonly checkpointComponent?: Component<CheckpointProps>;
  /// CurrentCheckpointProps.getCheckpointComponentProps
  readonly getCheckpointComponentProps?: (checkpointId: Id) => ExtraProps;
  /// CurrentCheckpointProps.debugIds
  readonly debugIds?: boolean;
};

export type ForwardCheckpointsProps = {
  /// ForwardCheckpointsProps.checkpoints
  readonly checkpoints?: CheckpointsOrCheckpointsId;
  /// ForwardCheckpointsProps.checkpointComponent
  readonly checkpointComponent?: Component<CheckpointProps>;
  /// ForwardCheckpointsProps.getCheckpointComponentProps
  readonly getCheckpointComponentProps?: (checkpointId: Id) => ExtraProps;
  /// ForwardCheckpointsProps.separator
  readonly separator?: JSXElement | string;
  /// ForwardCheckpointsProps.debugIds
  readonly debugIds?: boolean;
};

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
  /// ProviderProps.persister
  readonly persister?: AnyPersister;
  /// ProviderProps.persistersById
  readonly persistersById?: {
    [persisterId: Id]: AnyPersister;
  };
  /// ProviderProps.synchronizer
  readonly synchronizer?: Synchronizer;
  /// ProviderProps.synchronizersById
  readonly synchronizersById?: {[synchronizerId: Id]: Synchronizer};
};

export type ComponentReturnType = JSXElement;

export function Provider(
  props: ProviderProps & {children: JSXElement},
): ComponentReturnType;

export function CellView(props: CellProps): ComponentReturnType;

export function RowView(props: RowProps): ComponentReturnType;

export function SortedTableView(props: SortedTableProps): ComponentReturnType;

export function TableView(props: TableProps): ComponentReturnType;

export function TablesView(props: TablesProps): ComponentReturnType;

export function ValueView(props: ValueProps): ComponentReturnType;

export function ValuesView(props: ValuesProps): ComponentReturnType;

export function MetricView(props: MetricProps): ComponentReturnType;

export function SliceView(props: SliceProps): ComponentReturnType;

export function IndexView(props: IndexProps): ComponentReturnType;

export function RemoteRowView(props: RemoteRowProps): ComponentReturnType;

export function LocalRowsView(props: LocalRowsProps): ComponentReturnType;

export function LinkedRowsView(props: LinkedRowsProps): ComponentReturnType;

export function ResultCellView(props: ResultCellProps): ComponentReturnType;

export function ResultRowView(props: ResultRowProps): ComponentReturnType;

export function ResultSortedTableView(
  props: ResultSortedTableProps,
): ComponentReturnType;

export function ResultTableView(props: ResultTableProps): ComponentReturnType;

export function CheckpointView(props: CheckpointProps): ComponentReturnType;

export function BackwardCheckpointsView(
  props: BackwardCheckpointsProps,
): ComponentReturnType;

export function CurrentCheckpointView(
  props: CurrentCheckpointProps,
): ComponentReturnType;

export function ForwardCheckpointsView(
  props: ForwardCheckpointsProps,
): ComponentReturnType;
