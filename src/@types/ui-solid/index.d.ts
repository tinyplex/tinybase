/// ui-solid
import type {Accessor, Component, JSXElement} from 'solid-js';
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

export function useCreateStore(create: () => Store): Accessor<Store>;

export function useCreateMergeableStore(
  create: () => MergeableStore,
): Accessor<MergeableStore>;

export function useStoreIds(): Accessor<Ids>;

export function useStore(id?: Id): Accessor<Store | undefined>;

export function useStores(): Accessor<{[storeId: Id]: Store}>;

export function useStoreOrStoreById(
  storeOrStoreId?: StoreOrStoreId,
): Accessor<Store | undefined>;

export function useProvideStore(storeId: Id, store: Store): void;

export function useHasTables(
  storeOrStoreId?: StoreOrStoreId,
): Accessor<boolean>;

export function useTables(storeOrStoreId?: StoreOrStoreId): Accessor<Tables>;

export function useTablesState(
  storeOrStoreId?: StoreOrStoreId,
): [Accessor<Tables>, (tables: Tables) => void];

export function useTableIds(storeOrStoreId?: StoreOrStoreId): Accessor<Ids>;

export function useHasTable(
  tableId: Id,
  storeOrStoreId?: StoreOrStoreId,
): Accessor<boolean>;

export function useTable(
  tableId: Id,
  storeOrStoreId?: StoreOrStoreId,
): Accessor<Table>;

export function useTableState(
  tableId: Id,
  storeOrStoreId?: StoreOrStoreId,
): [Accessor<Table>, (table: Table) => void];

export function useTableCellIds(
  tableId: Id,
  storeOrStoreId?: StoreOrStoreId,
): Accessor<Ids>;

export function useHasTableCell(
  tableId: Id,
  cellId: Id,
  storeOrStoreId?: StoreOrStoreId,
): Accessor<boolean>;

export function useRowCount(
  tableId: Id,
  storeOrStoreId?: StoreOrStoreId,
): Accessor<number>;

export function useRowIds(
  tableId: Id,
  storeOrStoreId?: StoreOrStoreId,
): Accessor<Ids>;

export function useSortedRowIds(
  tableId: Id,
  cellId?: Id,
  descending?: boolean,
  offset?: number,
  limit?: number,
  storeOrStoreId?: StoreOrStoreId,
): Accessor<Ids>;

export function useSortedRowIds(
  args: SortedRowIdsArgs,
  storeOrStoreId?: StoreOrStoreId,
): Accessor<Ids>;

export function useHasRow(
  tableId: Id,
  rowId: Id,
  storeOrStoreId?: StoreOrStoreId,
): Accessor<boolean>;

export function useRow(
  tableId: Id,
  rowId: Id,
  storeOrStoreId?: StoreOrStoreId,
): Accessor<Row>;

export function useRowState(
  tableId: Id,
  rowId: Id,
  storeOrStoreId?: StoreOrStoreId,
): [Accessor<Row>, (row: Row) => void];

export function useCellIds(
  tableId: Id,
  rowId: Id,
  storeOrStoreId?: StoreOrStoreId,
): Accessor<Ids>;

export function useHasCell(
  tableId: Id,
  rowId: Id,
  cellId: Id,
  storeOrStoreId?: StoreOrStoreId,
): Accessor<boolean>;

export function useCell(
  tableId: Id,
  rowId: Id,
  cellId: Id,
  storeOrStoreId?: StoreOrStoreId,
): Accessor<CellOrUndefined>;

export function useCellState(
  tableId: Id,
  rowId: Id,
  cellId: Id,
  storeOrStoreId?: StoreOrStoreId,
): [Accessor<CellOrUndefined>, (cell: Cell) => void];

export function useHasValues(
  storeOrStoreId?: StoreOrStoreId,
): Accessor<boolean>;

export function useValues(storeOrStoreId?: StoreOrStoreId): Accessor<Values>;

export function useValuesState(
  storeOrStoreId?: StoreOrStoreId,
): [Accessor<Values>, (values: Values) => void];

export function useValueIds(storeOrStoreId?: StoreOrStoreId): Accessor<Ids>;

export function useHasValue(
  valueId: Id,
  storeOrStoreId?: StoreOrStoreId,
): Accessor<boolean>;

export function useValue(
  valueId: Id,
  storeOrStoreId?: StoreOrStoreId,
): Accessor<ValueOrUndefined>;

export function useValueState(
  valueId: Id,
  storeOrStoreId?: StoreOrStoreId,
): [value: Accessor<ValueOrUndefined>, setValue: (value: Value) => void];

export function useSetTablesCallback<Parameter>(
  getTables: (parameter: Parameter, store: Store) => Tables,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store, tables: Tables) => void,
): ParameterizedCallback<Parameter>;

export function useSetTableCallback<Parameter>(
  tableId: Id | GetId<Parameter>,
  getTable: (parameter: Parameter, store: Store) => Table,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store, table: Table) => void,
): ParameterizedCallback<Parameter>;

export function useSetRowCallback<Parameter>(
  tableId: Id | GetId<Parameter>,
  rowId: Id | GetId<Parameter>,
  getRow: (parameter: Parameter, store: Store) => Row,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store, row: Row) => void,
): ParameterizedCallback<Parameter>;

export function useAddRowCallback<Parameter>(
  tableId: Id | GetId<Parameter>,
  getRow: (parameter: Parameter, store: Store) => Row,
  storeOrStoreId?: StoreOrStoreId,
  then?: (rowId: Id | undefined, store: Store, row: Row) => void,
  reuseRowIds?: boolean,
): ParameterizedCallback<Parameter>;

export function useSetPartialRowCallback<Parameter>(
  tableId: Id | GetId<Parameter>,
  rowId: Id | GetId<Parameter>,
  getPartialRow: (parameter: Parameter, store: Store) => Row,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store, partialRow: Row) => void,
): ParameterizedCallback<Parameter>;

export function useSetCellCallback<Parameter>(
  tableId: Id | GetId<Parameter>,
  rowId: Id | GetId<Parameter>,
  cellId: Id | GetId<Parameter>,
  getCell: (parameter: Parameter, store: Store) => Cell | MapCell,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store, cell: Cell | MapCell) => void,
): ParameterizedCallback<Parameter>;

export function useSetValuesCallback<Parameter>(
  getValues: (parameter: Parameter, store: Store) => Values,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store, values: Values) => void,
): ParameterizedCallback<Parameter>;

export function useSetPartialValuesCallback<Parameter>(
  getPartialValues: (parameter: Parameter, store: Store) => Values,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store, partialValues: Values) => void,
): ParameterizedCallback<Parameter>;

export function useSetValueCallback<Parameter>(
  valueId: Id | GetId<Parameter>,
  getValue: (parameter: Parameter, store: Store) => Value | MapValue,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store, value: Value | MapValue) => void,
): ParameterizedCallback<Parameter>;

export function useDelTablesCallback(
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store) => void,
): Callback;

export function useDelTableCallback<Parameter>(
  tableId: Id | GetId<Parameter>,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store) => void,
): ParameterizedCallback<Parameter>;

export function useDelRowCallback<Parameter>(
  tableId: Id | GetId<Parameter>,
  rowId: Id | GetId<Parameter>,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store) => void,
): ParameterizedCallback<Parameter>;

export function useDelCellCallback<Parameter>(
  tableId: Id | GetId<Parameter>,
  rowId: Id | GetId<Parameter>,
  cellId: Id | GetId<Parameter>,
  forceDel?: boolean,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store) => void,
): ParameterizedCallback<Parameter>;

export function useDelValuesCallback(
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store) => void,
): Callback;

export function useDelValueCallback<Parameter>(
  valueId: Id | GetId<Parameter>,
  storeOrStoreId?: StoreOrStoreId,
  then?: (store: Store) => void,
): ParameterizedCallback<Parameter>;

export function useHasTablesListener(
  listener: HasTablesListener,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useTablesListener(
  listener: TablesListener,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useTableIdsListener(
  listener: TableIdsListener,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useHasTableListener(
  tableId: IdOrNull,
  listener: HasTableListener,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useTableListener(
  tableId: IdOrNull,
  listener: TableListener,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useTableCellIdsListener(
  tableId: IdOrNull,
  listener: TableCellIdsListener,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useHasTableCellListener(
  tableId: IdOrNull,
  cellId: IdOrNull,
  listener: HasTableCellListener,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useRowCountListener(
  tableId: IdOrNull,
  listener: RowCountListener,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useRowIdsListener(
  tableId: IdOrNull,
  listener: RowIdsListener,
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
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useSortedRowIdsListener(
  args: SortedRowIdsArgs,
  listener: SortedRowIdsListener,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useHasRowListener(
  tableId: IdOrNull,
  rowId: IdOrNull,
  listener: HasRowListener,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useRowListener(
  tableId: IdOrNull,
  rowId: IdOrNull,
  listener: RowListener,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useCellIdsListener(
  tableId: IdOrNull,
  rowId: IdOrNull,
  listener: CellIdsListener,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useHasCellListener(
  tableId: IdOrNull,
  rowId: IdOrNull,
  cellId: IdOrNull,
  listener: HasCellListener,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useCellListener(
  tableId: IdOrNull,
  rowId: IdOrNull,
  cellId: IdOrNull,
  listener: CellListener,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useHasValuesListener(
  listener: HasValuesListener,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useValuesListener(
  listener: ValuesListener,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useValueIdsListener(
  listener: ValueIdsListener,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useHasValueListener(
  valueId: IdOrNull,
  listener: HasValueListener,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useValueListener(
  valueId: IdOrNull,
  listener: ValueListener,
  mutator?: boolean,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useStartTransactionListener(
  listener: TransactionListener,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useWillFinishTransactionListener(
  listener: TransactionListener,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useDidFinishTransactionListener(
  listener: TransactionListener,
  storeOrStoreId?: StoreOrStoreId,
): void;

export function useCreateMetrics(
  store: Store | undefined,
  create: (store: Store) => Metrics,
): Accessor<Metrics | undefined>;

export function useMetricsIds(): Accessor<Ids>;

export function useMetrics(id?: Id): Accessor<Metrics | undefined>;

export function useMetricsOrMetricsById(
  metricsOrMetricsId?: MetricsOrMetricsId,
): Accessor<Metrics | undefined>;

export function useProvideMetrics(metricsId: Id, metrics: Metrics): void;

export function useMetricIds(
  metricsOrMetricsId?: MetricsOrMetricsId,
): Accessor<Ids>;

export function useMetric(
  metricId: Id,
  metricsOrMetricsId?: MetricsOrMetricsId,
): Accessor<number | undefined>;

export function useMetricListener(
  metricId: IdOrNull,
  listener: MetricListener,
  metricsOrMetricsId?: MetricsOrMetricsId,
): void;

export function useCreateIndexes(
  store: Store | undefined,
  create: (store: Store) => Indexes,
): Accessor<Indexes | undefined>;

export function useIndexesIds(): Accessor<Ids>;

export function useIndexes(id?: Id): Accessor<Indexes | undefined>;

export function useIndexesOrIndexesById(
  indexesOrIndexesId?: IndexesOrIndexesId,
): Accessor<Indexes | undefined>;

export function useProvideIndexes(indexesId: Id, indexes: Indexes): void;

export function useIndexIds(
  indexesOrIndexesId?: IndexesOrIndexesId,
): Accessor<Ids>;

export function useSliceIds(
  indexId: Id,
  indexesOrIndexesId?: IndexesOrIndexesId,
): Accessor<Ids>;

export function useSliceRowIds(
  indexId: Id,
  sliceId: Id,
  indexesOrIndexesId?: IndexesOrIndexesId,
): Accessor<Ids>;

export function useSliceIdsListener(
  indexId: IdOrNull,
  listener: SliceIdsListener,
  indexesOrIndexesId?: IndexesOrIndexesId,
): void;

export function useSliceRowIdsListener(
  indexId: IdOrNull,
  sliceId: IdOrNull,
  listener: SliceRowIdsListener,
  indexesOrIndexesId?: IndexesOrIndexesId,
): void;

export function useCreateRelationships(
  store: Store | undefined,
  create: (store: Store) => Relationships,
): Accessor<Relationships | undefined>;

export function useRelationshipsIds(): Accessor<Ids>;

export function useRelationships(id?: Id): Accessor<Relationships | undefined>;

export function useRelationshipsOrRelationshipsById(
  relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId,
): Accessor<Relationships | undefined>;

export function useProvideRelationships(
  relationshipsId: Id,
  relationships: Relationships,
): void;

export function useRelationshipIds(
  relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId,
): Accessor<Ids>;

export function useRemoteRowId(
  relationshipId: Id,
  localRowId: Id,
  relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId,
): Accessor<Id | undefined>;

export function useLocalRowIds(
  relationshipId: Id,
  remoteRowId: Id,
  relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId,
): Accessor<Ids>;

export function useLinkedRowIds(
  relationshipId: Id,
  firstRowId: Id,
  relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId,
): Accessor<Ids>;

export function useRemoteRowIdListener(
  relationshipId: IdOrNull,
  localRowId: IdOrNull,
  listener: RemoteRowIdListener,
  relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId,
): void;

export function useLocalRowIdsListener(
  relationshipId: IdOrNull,
  remoteRowId: IdOrNull,
  listener: LocalRowIdsListener,
  relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId,
): void;

export function useLinkedRowIdsListener(
  relationshipId: Id,
  firstRowId: Id,
  listener: LinkedRowIdsListener,
  relationshipsOrRelationshipsId?: RelationshipsOrRelationshipsId,
): void;

export function useCreateQueries(
  store: Store | undefined,
  create: (store: Store) => Queries,
): Accessor<Queries | undefined>;

export function useQueriesIds(): Accessor<Ids>;

export function useQueries(id?: Id): Accessor<Queries | undefined>;

export function useQueriesOrQueriesById(
  queriesOrQueriesId?: QueriesOrQueriesId,
): Accessor<Queries | undefined>;

export function useProvideQueries(queriesId: Id, queries: Queries): void;

export function useQueryIds(
  queriesOrQueriesId?: QueriesOrQueriesId,
): Accessor<Ids>;

export function useResultTable(
  queryId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): Accessor<Table>;

export function useResultTableCellIds(
  queryId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): Accessor<Ids>;

export function useResultRowCount(
  queryId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): Accessor<number>;

export function useResultRowIds(
  queryId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): Accessor<Ids>;

export function useResultSortedRowIds(
  queryId: Id,
  cellId?: Id,
  descending?: boolean,
  offset?: number,
  limit?: number,
  queriesOrQueriesId?: QueriesOrQueriesId,
): Accessor<Ids>;

export function useResultRow(
  queryId: Id,
  rowId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): Accessor<Row>;

export function useResultCellIds(
  queryId: Id,
  rowId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): Accessor<Ids>;

export function useResultCell(
  queryId: Id,
  rowId: Id,
  cellId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): Accessor<Cell | undefined>;

export function useResultTableListener(
  queryId: IdOrNull,
  listener: ResultTableListener,
  queriesOrQueriesId?: QueriesOrQueriesId,
): void;

export function useResultTableCellIdsListener(
  queryId: IdOrNull,
  listener: ResultTableCellIdsListener,
  queriesOrQueriesId?: QueriesOrQueriesId,
): void;

export function useResultRowCountListener(
  queryId: IdOrNull,
  listener: ResultRowCountListener,
  queriesOrQueriesId?: QueriesOrQueriesId,
): void;

export function useResultRowIdsListener(
  queryId: IdOrNull,
  listener: ResultRowIdsListener,
  queriesOrQueriesId?: QueriesOrQueriesId,
): void;

export function useResultSortedRowIdsListener(
  queryId: Id,
  cellId: Id | undefined,
  descending: boolean,
  offset: number,
  limit: number | undefined,
  listener: ResultSortedRowIdsListener,
  queriesOrQueriesId?: QueriesOrQueriesId,
): void;

export function useResultRowListener(
  queryId: IdOrNull,
  rowId: IdOrNull,
  listener: ResultRowListener,
  queriesOrQueriesId?: QueriesOrQueriesId,
): void;

export function useResultCellIdsListener(
  queryId: IdOrNull,
  rowId: IdOrNull,
  listener: ResultCellIdsListener,
  queriesOrQueriesId?: QueriesOrQueriesId,
): void;

export function useResultCellListener(
  queryId: IdOrNull,
  rowId: IdOrNull,
  cellId: IdOrNull,
  listener: ResultCellListener,
  queriesOrQueriesId?: QueriesOrQueriesId,
): void;

export function useParamValues(
  queryId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): Accessor<ParamValues>;

export function useParamValuesState(
  queryId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): [Accessor<ParamValues>, (paramValues: ParamValues) => void];

export function useParamValue(
  queryId: Id,
  paramId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): Accessor<ParamValue | undefined>;

export function useParamValueState(
  queryId: Id,
  paramId: Id,
  queriesOrQueriesId?: QueriesOrQueriesId,
): [Accessor<ParamValue | undefined>, (paramValue: ParamValue) => void];

export function useParamValuesListener(
  queryId: IdOrNull,
  listener: ParamValuesListener,
  queriesOrQueriesId?: QueriesOrQueriesId,
): void;

export function useParamValueListener(
  queryId: IdOrNull,
  paramId: IdOrNull,
  listener: ParamValueListener,
  queriesOrQueriesId?: QueriesOrQueriesId,
): void;

export function useSetParamValueCallback<Parameter>(
  queryId: Id | GetId<Parameter>,
  paramId: Id | GetId<Parameter>,
  getParamValue: (parameter: Parameter, queries: Queries) => ParamValue,
  queriesOrQueriesId?: QueriesOrQueriesId,
  then?: (queries: Queries, paramValue: ParamValue) => void,
): ParameterizedCallback<Parameter>;

export function useSetParamValuesCallback<Parameter>(
  queryId: Id | GetId<Parameter>,
  getParamValues: (parameter: Parameter, queries: Queries) => ParamValues,
  queriesOrQueriesId?: QueriesOrQueriesId,
  then?: (queries: Queries, paramValues: ParamValues) => void,
): ParameterizedCallback<Parameter>;

export function useCreateCheckpoints(
  store: Store | undefined,
  create: (store: Store) => Checkpoints,
): Accessor<Checkpoints | undefined>;

export function useCheckpointsIds(): Accessor<Ids>;

export function useCheckpoints(id?: Id): Accessor<Checkpoints | undefined>;

export function useCheckpointsOrCheckpointsById(
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): Accessor<Checkpoints | undefined>;

export function useProvideCheckpoints(
  checkpointsId: Id,
  checkpoints: Checkpoints,
): void;

export function useCheckpointIds(
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): Accessor<CheckpointIds>;

export function useCheckpoint(
  checkpointId: Id,
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): Accessor<string | undefined>;

export function useSetCheckpointCallback<Parameter>(
  getCheckpoint?: (parameter: Parameter) => string,
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
  then?: (checkpointId: Id, checkpoints: Checkpoints, label?: string) => void,
): ParameterizedCallback<Parameter>;

export function useGoBackwardCallback(
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): Callback;

export function useGoForwardCallback(
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): Callback;

export function useGoToCallback<Parameter>(
  getCheckpointId: (parameter: Parameter) => Id,
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
  then?: (checkpoints: Checkpoints, checkpointId: Id) => void,
): ParameterizedCallback<Parameter>;

export function useUndoInformation(
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): UndoOrRedoInformation;

export function useRedoInformation(
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): UndoOrRedoInformation;

export function useCheckpointIdsListener(
  listener: CheckpointIdsListener,
  checkpointsOrCheckpointsId?: CheckpointsOrCheckpointsId,
): void;

export function useCheckpointListener(
  checkpointId: IdOrNull,
  listener: CheckpointListener,
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
  then?: (persister: Persister<Persist>) => Promise<any>,
  destroy?: (persister: Persister<Persist>) => void,
): Accessor<PersisterOrUndefined>;

export function usePersisterIds(): Accessor<Ids>;

export function usePersister(id?: Id): Accessor<AnyPersister | undefined>;

export function usePersisterOrPersisterById(
  persisterOrPersisterId?: PersisterOrPersisterId,
): Accessor<AnyPersister | undefined>;

export function useProvidePersister(
  persisterId: Id,
  persister: AnyPersister,
): void;

export function usePersisterStatus(
  persisterOrPersisterId?: PersisterOrPersisterId,
): Accessor<Status>;

export function usePersisterStatusListener(
  listener: StatusListener,
  persisterOrPersisterId?: PersisterOrPersisterId,
): void;

export function useCreateSynchronizer<
  SynchronizerOrUndefined extends Synchronizer | undefined,
>(
  store: MergeableStore | undefined,
  create: (store: MergeableStore) => Promise<SynchronizerOrUndefined>,
  destroy?: (synchronizer: Synchronizer) => void,
): Accessor<SynchronizerOrUndefined>;

export function useSynchronizerIds(): Accessor<Ids>;

export function useSynchronizer(id?: Id): Accessor<Synchronizer | undefined>;

export function useSynchronizerOrSynchronizerById(
  synchronizerOrSynchronizerId?: SynchronizerOrSynchronizerId,
): Accessor<Synchronizer | undefined>;

export function useProvideSynchronizer(
  synchronizerId: Id,
  synchronizer: Synchronizer,
): void;

export function useSynchronizerStatus(
  synchronizerOrSynchronizerId?: SynchronizerOrSynchronizerId,
): Accessor<Status>;

export function useSynchronizerStatusListener(
  listener: StatusListener,
  synchronizerOrSynchronizerId?: SynchronizerOrSynchronizerId,
): void;

export type ExtraProps = {[propName: string]: any};

export type TablesProps = {
  /// ui-solid.TablesProps.store
  readonly store?: StoreOrStoreId;
  /// ui-solid.TablesProps.tableComponent
  readonly tableComponent?: Component<TableProps>;
  /// ui-solid.TablesProps.getTableComponentProps
  readonly getTableComponentProps?: (tableId: Id) => ExtraProps;
  /// ui-solid.TablesProps.separator
  readonly separator?: JSXElement | string;
  /// ui-solid.TablesProps.debugIds
  readonly debugIds?: boolean;
};

export type TableProps = {
  /// ui-solid.TableProps.tableId
  readonly tableId: Id;
  /// ui-solid.TableProps.store
  readonly store?: StoreOrStoreId;
  /// ui-solid.TableProps.rowComponent
  readonly rowComponent?: Component<RowProps>;
  /// ui-solid.TableProps.getRowComponentProps
  readonly getRowComponentProps?: (rowId: Id) => ExtraProps;
  /// ui-solid.TableProps.customCellIds
  readonly customCellIds?: Ids;
  /// ui-solid.TableProps.separator
  readonly separator?: JSXElement | string;
  /// ui-solid.TableProps.debugIds
  readonly debugIds?: boolean;
};

export type SortedTableProps = {
  /// ui-solid.SortedTableProps.tableId
  readonly tableId: Id;
  /// ui-solid.SortedTableProps.cellId
  readonly cellId?: Id;
  /// ui-solid.SortedTableProps.descending
  readonly descending?: boolean;
  /// ui-solid.SortedTableProps.offset
  readonly offset?: number;
  /// ui-solid.SortedTableProps.limit
  readonly limit?: number;
  /// ui-solid.SortedTableProps.store
  readonly store?: StoreOrStoreId;
  /// ui-solid.SortedTableProps.rowComponent
  readonly rowComponent?: Component<RowProps>;
  /// ui-solid.SortedTableProps.getRowComponentProps
  readonly getRowComponentProps?: (rowId: Id) => ExtraProps;
  /// ui-solid.SortedTableProps.customCellIds
  readonly customCellIds?: Ids;
  /// ui-solid.SortedTableProps.separator
  readonly separator?: JSXElement | string;
  /// ui-solid.SortedTableProps.debugIds
  readonly debugIds?: boolean;
};

export type RowProps = {
  /// ui-solid.RowProps.tableId
  readonly tableId: Id;
  /// ui-solid.RowProps.rowId
  readonly rowId: Id;
  /// ui-solid.RowProps.store
  readonly store?: StoreOrStoreId;
  /// ui-solid.RowProps.cellComponent
  readonly cellComponent?: Component<CellProps>;
  /// ui-solid.RowProps.getCellComponentProps
  readonly getCellComponentProps?: (cellId: Id) => ExtraProps;
  /// ui-solid.RowProps.customCellIds
  readonly customCellIds?: Ids;
  /// ui-solid.RowProps.separator
  readonly separator?: JSXElement | string;
  /// ui-solid.RowProps.debugIds
  readonly debugIds?: boolean;
};

export type CellProps = {
  /// ui-solid.CellProps.tableId
  readonly tableId: Id;
  /// ui-solid.CellProps.rowId
  readonly rowId: Id;
  /// ui-solid.CellProps.cellId
  readonly cellId: Id;
  /// ui-solid.CellProps.store
  readonly store?: StoreOrStoreId;
  /// ui-solid.CellProps.debugIds
  readonly debugIds?: boolean;
};

export type ValuesProps = {
  /// ui-solid.ValuesProps.store
  readonly store?: StoreOrStoreId;
  /// ui-solid.ValuesProps.valueComponent
  readonly valueComponent?: Component<ValueProps>;
  /// ui-solid.ValuesProps.getValueComponentProps
  readonly getValueComponentProps?: (valueId: Id) => ExtraProps;
  /// ui-solid.ValuesProps.separator
  readonly separator?: JSXElement | string;
  /// ui-solid.ValuesProps.debugIds
  readonly debugIds?: boolean;
};

export type ValueProps = {
  /// ui-solid.ValueProps.valueId
  readonly valueId: Id;
  /// ui-solid.ValueProps.store
  readonly store?: StoreOrStoreId;
  /// ui-solid.ValueProps.debugIds
  readonly debugIds?: boolean;
};

export type MetricProps = {
  /// ui-solid.MetricProps.metricId
  readonly metricId: Id;
  /// ui-solid.MetricProps.metrics
  readonly metrics?: MetricsOrMetricsId;
  /// ui-solid.MetricProps.debugIds
  readonly debugIds?: boolean;
};

export type IndexProps = {
  /// ui-solid.IndexProps.indexId
  readonly indexId: Id;
  /// ui-solid.IndexProps.indexes
  readonly indexes?: IndexesOrIndexesId;
  /// ui-solid.IndexProps.sliceComponent
  readonly sliceComponent?: Component<SliceProps>;
  /// ui-solid.IndexProps.getSliceComponentProps
  readonly getSliceComponentProps?: (sliceId: Id) => ExtraProps;
  /// ui-solid.IndexProps.separator
  readonly separator?: JSXElement | string;
  /// ui-solid.IndexProps.debugIds
  readonly debugIds?: boolean;
};

export type SliceProps = {
  /// ui-solid.SliceProps.indexId
  readonly indexId: Id;
  /// ui-solid.SliceProps.sliceId
  readonly sliceId: Id;
  /// ui-solid.SliceProps.indexes
  readonly indexes?: IndexesOrIndexesId;
  /// ui-solid.SliceProps.rowComponent
  readonly rowComponent?: Component<RowProps>;
  /// ui-solid.SliceProps.getRowComponentProps
  readonly getRowComponentProps?: (rowId: Id) => ExtraProps;
  /// ui-solid.SliceProps.separator
  readonly separator?: JSXElement | string;
  /// ui-solid.SliceProps.debugIds
  readonly debugIds?: boolean;
};

export type RemoteRowProps = {
  /// ui-solid.RemoteRowProps.relationshipId
  readonly relationshipId: Id;
  /// ui-solid.RemoteRowProps.localRowId
  readonly localRowId: Id;
  /// ui-solid.RemoteRowProps.relationships
  readonly relationships?: RelationshipsOrRelationshipsId;
  /// ui-solid.RemoteRowProps.rowComponent
  readonly rowComponent?: Component<RowProps>;
  /// ui-solid.RemoteRowProps.getRowComponentProps
  readonly getRowComponentProps?: (rowId: Id) => ExtraProps;
  /// ui-solid.RemoteRowProps.debugIds
  readonly debugIds?: boolean;
};

export type LocalRowsProps = {
  /// ui-solid.LocalRowsProps.relationshipId
  readonly relationshipId: Id;
  /// ui-solid.LocalRowsProps.remoteRowId
  readonly remoteRowId: Id;
  /// ui-solid.LocalRowsProps.relationships
  readonly relationships?: RelationshipsOrRelationshipsId;
  /// ui-solid.LocalRowsProps.rowComponent
  readonly rowComponent?: Component<RowProps>;
  /// ui-solid.LocalRowsProps.getRowComponentProps
  readonly getRowComponentProps?: (rowId: Id) => ExtraProps;
  /// ui-solid.LocalRowsProps.separator
  readonly separator?: JSXElement | string;
  /// ui-solid.LocalRowsProps.debugIds
  readonly debugIds?: boolean;
};

export type LinkedRowsProps = {
  /// ui-solid.LinkedRowsProps.relationshipId
  readonly relationshipId: Id;
  /// ui-solid.LinkedRowsProps.firstRowId
  readonly firstRowId: Id;
  /// ui-solid.LinkedRowsProps.relationships
  readonly relationships?: RelationshipsOrRelationshipsId;
  /// ui-solid.LinkedRowsProps.rowComponent
  readonly rowComponent?: Component<RowProps>;
  /// ui-solid.LinkedRowsProps.getRowComponentProps
  readonly getRowComponentProps?: (rowId: Id) => ExtraProps;
  /// ui-solid.LinkedRowsProps.separator
  readonly separator?: JSXElement | string;
  /// ui-solid.LinkedRowsProps.debugIds
  readonly debugIds?: boolean;
};

export type ResultTableProps = {
  /// ui-solid.ResultTableProps.queryId
  readonly queryId: Id;
  /// ui-solid.ResultTableProps.queries
  readonly queries?: QueriesOrQueriesId;
  /// ui-solid.ResultTableProps.resultRowComponent
  readonly resultRowComponent?: Component<ResultRowProps>;
  /// ui-solid.ResultTableProps.getResultRowComponentProps
  readonly getResultRowComponentProps?: (rowId: Id) => ExtraProps;
  /// ui-solid.ResultTableProps.separator
  readonly separator?: JSXElement | string;
  /// ui-solid.ResultTableProps.debugIds
  readonly debugIds?: boolean;
};

export type ResultSortedTableProps = {
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
  readonly queries?: QueriesOrQueriesId;
  /// ui-solid.ResultSortedTableProps.resultRowComponent
  readonly resultRowComponent?: Component<ResultRowProps>;
  /// ui-solid.ResultSortedTableProps.getResultRowComponentProps
  readonly getResultRowComponentProps?: (rowId: Id) => ExtraProps;
  /// ui-solid.ResultSortedTableProps.separator
  readonly separator?: JSXElement | string;
  /// ui-solid.ResultSortedTableProps.debugIds
  readonly debugIds?: boolean;
};

export type ResultRowProps = {
  /// ui-solid.ResultRowProps.queryId
  readonly queryId: Id;
  /// ui-solid.ResultRowProps.rowId
  readonly rowId: Id;
  /// ui-solid.ResultRowProps.queries
  readonly queries?: QueriesOrQueriesId;
  /// ui-solid.ResultRowProps.resultCellComponent
  readonly resultCellComponent?: Component<ResultCellProps>;
  /// ui-solid.ResultRowProps.getResultCellComponentProps
  readonly getResultCellComponentProps?: (cellId: Id) => ExtraProps;
  /// ui-solid.ResultRowProps.separator
  readonly separator?: JSXElement | string;
  /// ui-solid.ResultRowProps.debugIds
  readonly debugIds?: boolean;
};

export type ResultCellProps = {
  /// ui-solid.ResultCellProps.queryId
  readonly queryId: Id;
  /// ui-solid.ResultCellProps.rowId
  readonly rowId: Id;
  /// ui-solid.ResultCellProps.cellId
  readonly cellId: Id;
  /// ui-solid.ResultCellProps.queries
  readonly queries?: QueriesOrQueriesId;
  /// ui-solid.ResultCellProps.debugIds
  readonly debugIds?: boolean;
};

export type CheckpointProps = {
  /// ui-solid.CheckpointProps.checkpointId
  readonly checkpointId: Id;
  /// ui-solid.CheckpointProps.checkpoints
  readonly checkpoints?: CheckpointsOrCheckpointsId;
  /// ui-solid.CheckpointProps.debugIds
  readonly debugIds?: boolean;
};

export type BackwardCheckpointsProps = {
  /// ui-solid.BackwardCheckpointsProps.checkpoints
  readonly checkpoints?: CheckpointsOrCheckpointsId;
  /// ui-solid.BackwardCheckpointsProps.checkpointComponent
  readonly checkpointComponent?: Component<CheckpointProps>;
  /// ui-solid.BackwardCheckpointsProps.getCheckpointComponentProps
  readonly getCheckpointComponentProps?: (checkpointId: Id) => ExtraProps;
  /// ui-solid.BackwardCheckpointsProps.separator
  readonly separator?: JSXElement | string;
  /// ui-solid.BackwardCheckpointsProps.debugIds
  readonly debugIds?: boolean;
};

export type CurrentCheckpointProps = {
  /// ui-solid.CurrentCheckpointProps.checkpoints
  readonly checkpoints?: CheckpointsOrCheckpointsId;
  /// ui-solid.CurrentCheckpointProps.checkpointComponent
  readonly checkpointComponent?: Component<CheckpointProps>;
  /// ui-solid.CurrentCheckpointProps.getCheckpointComponentProps
  readonly getCheckpointComponentProps?: (checkpointId: Id) => ExtraProps;
  /// ui-solid.CurrentCheckpointProps.debugIds
  readonly debugIds?: boolean;
};

export type ForwardCheckpointsProps = {
  /// ui-solid.ForwardCheckpointsProps.checkpoints
  readonly checkpoints?: CheckpointsOrCheckpointsId;
  /// ui-solid.ForwardCheckpointsProps.checkpointComponent
  readonly checkpointComponent?: Component<CheckpointProps>;
  /// ui-solid.ForwardCheckpointsProps.getCheckpointComponentProps
  readonly getCheckpointComponentProps?: (checkpointId: Id) => ExtraProps;
  /// ui-solid.ForwardCheckpointsProps.separator
  readonly separator?: JSXElement | string;
  /// ui-solid.ForwardCheckpointsProps.debugIds
  readonly debugIds?: boolean;
};

export type ProviderProps = {
  /// ui-solid.ProviderProps.store
  readonly store?: Store;
  /// ui-solid.ProviderProps.storesById
  readonly storesById?: {[storeId: Id]: Store};
  /// ui-solid.ProviderProps.metrics
  readonly metrics?: Metrics;
  /// ui-solid.ProviderProps.metricsById
  readonly metricsById?: {[metricsId: Id]: Metrics};
  /// ui-solid.ProviderProps.indexes
  readonly indexes?: Indexes;
  /// ui-solid.ProviderProps.indexesById
  readonly indexesById?: {[indexesId: Id]: Indexes};
  /// ui-solid.ProviderProps.relationships
  readonly relationships?: Relationships;
  /// ui-solid.ProviderProps.relationshipsById
  readonly relationshipsById?: {[relationshipsId: Id]: Relationships};
  /// ui-solid.ProviderProps.queries
  readonly queries?: Queries;
  /// ui-solid.ProviderProps.queriesById
  readonly queriesById?: {[queriesId: Id]: Queries};
  /// ui-solid.ProviderProps.checkpoints
  readonly checkpoints?: Checkpoints;
  /// ui-solid.ProviderProps.checkpointsById
  readonly checkpointsById?: {[checkpointsId: Id]: Checkpoints};
  /// ui-solid.ProviderProps.persister
  readonly persister?: AnyPersister;
  /// ui-solid.ProviderProps.persistersById
  readonly persistersById?: {
    [persisterId: Id]: AnyPersister;
  };
  /// ui-solid.ProviderProps.synchronizer
  readonly synchronizer?: Synchronizer;
  /// ui-solid.ProviderProps.synchronizersById
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
