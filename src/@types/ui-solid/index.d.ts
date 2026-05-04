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

/// ui-solid.MaybeAccessor
export type MaybeAccessor<Thing> = Thing | Accessor<Thing>;

/// ui-solid.StoreOrStoreId
export type StoreOrStoreId = Store | Id;

/// ui-solid.MetricsOrMetricsId
export type MetricsOrMetricsId = Metrics | Id;

/// ui-solid.IndexesOrIndexesId
export type IndexesOrIndexesId = Indexes | Id;

/// ui-solid.RelationshipsOrRelationshipsId
export type RelationshipsOrRelationshipsId = Relationships | Id;

/// ui-solid.QueriesOrQueriesId
export type QueriesOrQueriesId = Queries | Id;

/// ui-solid.CheckpointsOrCheckpointsId
export type CheckpointsOrCheckpointsId = Checkpoints | Id;

/// ui-solid.PersisterOrPersisterId
export type PersisterOrPersisterId = AnyPersister | Id;

/// ui-solid.SynchronizerOrSynchronizerId
export type SynchronizerOrSynchronizerId = Synchronizer | Id;

/// ui-solid.UndoOrRedoInformation
export type UndoOrRedoInformation = [boolean, Callback, Id | undefined, string];

export type GetId<Parameter> = (parameter: Parameter, store: Store) => Id;

/// ui-solid.useCreateStore
export function useCreateStore(create: () => Store): Accessor<Store>;

/// ui-solid.useCreateMergeableStore
export function useCreateMergeableStore(
  create: () => MergeableStore,
): Accessor<MergeableStore>;

/// ui-solid.useStoreIds
export function useStoreIds(): Accessor<Ids>;

/// ui-solid.useStore
export function useStore(
  id?: MaybeAccessor<Id | undefined>,
): Accessor<Store | undefined>;

/// ui-solid.useStores
export function useStores(): Accessor<{[storeId: Id]: Store}>;

/// ui-solid.useStoreOrStoreById
export function useStoreOrStoreById(
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): Accessor<Store | undefined>;

/// ui-solid.useProvideStore
export function useProvideStore(storeId: Id, store: Store): void;

/// ui-solid.useHasTables
export function useHasTables(
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): Accessor<boolean>;

/// ui-solid.useTables
export function useTables(
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): Accessor<Tables>;

/// ui-solid.useTablesState
export function useTablesState(
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): [Accessor<Tables>, (tables: Tables) => void];

/// ui-solid.useTableIds
export function useTableIds(
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): Accessor<Ids>;

/// ui-solid.useHasTable
export function useHasTable(
  tableId: MaybeAccessor<Id>,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): Accessor<boolean>;

/// ui-solid.useTable
export function useTable(
  tableId: MaybeAccessor<Id>,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): Accessor<Table>;

/// ui-solid.useTableState
export function useTableState(
  tableId: MaybeAccessor<Id>,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): [Accessor<Table>, (table: Table) => void];

/// ui-solid.useTableCellIds
export function useTableCellIds(
  tableId: MaybeAccessor<Id>,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): Accessor<Ids>;

/// ui-solid.useHasTableCell
export function useHasTableCell(
  tableId: MaybeAccessor<Id>,
  cellId: MaybeAccessor<Id>,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): Accessor<boolean>;

/// ui-solid.useRowCount
export function useRowCount(
  tableId: MaybeAccessor<Id>,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): Accessor<number>;

/// ui-solid.useRowIds
export function useRowIds(
  tableId: MaybeAccessor<Id>,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): Accessor<Ids>;

/// ui-solid.useSortedRowIds
export function useSortedRowIds(
  tableId: MaybeAccessor<Id>,
  cellId?: MaybeAccessor<Id | undefined>,
  descending?: MaybeAccessor<boolean | undefined>,
  offset?: MaybeAccessor<number | undefined>,
  limit?: MaybeAccessor<number | undefined>,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): Accessor<Ids>;

/// ui-solid.useSortedRowIds.2
export function useSortedRowIds(
  args: SortedRowIdsArgs,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): Accessor<Ids>;

/// ui-solid.useHasRow
export function useHasRow(
  tableId: MaybeAccessor<Id>,
  rowId: MaybeAccessor<Id>,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): Accessor<boolean>;

/// ui-solid.useRow
export function useRow(
  tableId: MaybeAccessor<Id>,
  rowId: MaybeAccessor<Id>,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): Accessor<Row>;

/// ui-solid.useRowState
export function useRowState(
  tableId: MaybeAccessor<Id>,
  rowId: MaybeAccessor<Id>,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): [Accessor<Row>, (row: Row) => void];

/// ui-solid.useCellIds
export function useCellIds(
  tableId: MaybeAccessor<Id>,
  rowId: MaybeAccessor<Id>,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): Accessor<Ids>;

/// ui-solid.useHasCell
export function useHasCell(
  tableId: MaybeAccessor<Id>,
  rowId: MaybeAccessor<Id>,
  cellId: MaybeAccessor<Id>,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): Accessor<boolean>;

/// ui-solid.useCell
export function useCell(
  tableId: MaybeAccessor<Id>,
  rowId: MaybeAccessor<Id>,
  cellId: MaybeAccessor<Id>,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): Accessor<CellOrUndefined>;

/// ui-solid.useCellState
export function useCellState(
  tableId: MaybeAccessor<Id>,
  rowId: MaybeAccessor<Id>,
  cellId: MaybeAccessor<Id>,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): [Accessor<CellOrUndefined>, (cell: Cell) => void];

/// ui-solid.useHasValues
export function useHasValues(
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): Accessor<boolean>;

/// ui-solid.useValues
export function useValues(
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): Accessor<Values>;

/// ui-solid.useValuesState
export function useValuesState(
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): [Accessor<Values>, (values: Values) => void];

/// ui-solid.useValueIds
export function useValueIds(
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): Accessor<Ids>;

/// ui-solid.useHasValue
export function useHasValue(
  valueId: MaybeAccessor<Id>,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): Accessor<boolean>;

/// ui-solid.useValue
export function useValue(
  valueId: MaybeAccessor<Id>,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): Accessor<ValueOrUndefined>;

/// ui-solid.useValueState
export function useValueState(
  valueId: MaybeAccessor<Id>,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): [value: Accessor<ValueOrUndefined>, setValue: (value: Value) => void];

/// ui-solid.useSetTablesCallback
export function useSetTablesCallback<Parameter>(
  getTables: (parameter: Parameter, store: Store) => Tables,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
  then?: (store: Store, tables: Tables) => void,
): ParameterizedCallback<Parameter>;

/// ui-solid.useSetTableCallback
export function useSetTableCallback<Parameter>(
  tableId: MaybeAccessor<Id> | GetId<Parameter>,
  getTable: (parameter: Parameter, store: Store) => Table,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
  then?: (store: Store, table: Table) => void,
): ParameterizedCallback<Parameter>;

/// ui-solid.useSetRowCallback
export function useSetRowCallback<Parameter>(
  tableId: MaybeAccessor<Id> | GetId<Parameter>,
  rowId: MaybeAccessor<Id> | GetId<Parameter>,
  getRow: (parameter: Parameter, store: Store) => Row,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
  then?: (store: Store, row: Row) => void,
): ParameterizedCallback<Parameter>;

/// ui-solid.useAddRowCallback
export function useAddRowCallback<Parameter>(
  tableId: MaybeAccessor<Id> | GetId<Parameter>,
  getRow: (parameter: Parameter, store: Store) => Row,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
  then?: (rowId: Id | undefined, store: Store, row: Row) => void,
  reuseRowIds?: boolean,
): ParameterizedCallback<Parameter>;

/// ui-solid.useSetPartialRowCallback
export function useSetPartialRowCallback<Parameter>(
  tableId: MaybeAccessor<Id> | GetId<Parameter>,
  rowId: MaybeAccessor<Id> | GetId<Parameter>,
  getPartialRow: (parameter: Parameter, store: Store) => Row,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
  then?: (store: Store, partialRow: Row) => void,
): ParameterizedCallback<Parameter>;

/// ui-solid.useSetCellCallback
export function useSetCellCallback<Parameter>(
  tableId: MaybeAccessor<Id> | GetId<Parameter>,
  rowId: MaybeAccessor<Id> | GetId<Parameter>,
  cellId: MaybeAccessor<Id> | GetId<Parameter>,
  getCell: (parameter: Parameter, store: Store) => Cell | MapCell,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
  then?: (store: Store, cell: Cell | MapCell) => void,
): ParameterizedCallback<Parameter>;

/// ui-solid.useSetValuesCallback
export function useSetValuesCallback<Parameter>(
  getValues: (parameter: Parameter, store: Store) => Values,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
  then?: (store: Store, values: Values) => void,
): ParameterizedCallback<Parameter>;

/// ui-solid.useSetPartialValuesCallback
export function useSetPartialValuesCallback<Parameter>(
  getPartialValues: (parameter: Parameter, store: Store) => Values,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
  then?: (store: Store, partialValues: Values) => void,
): ParameterizedCallback<Parameter>;

/// ui-solid.useSetValueCallback
export function useSetValueCallback<Parameter>(
  valueId: MaybeAccessor<Id> | GetId<Parameter>,
  getValue: (parameter: Parameter, store: Store) => Value | MapValue,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
  then?: (store: Store, value: Value | MapValue) => void,
): ParameterizedCallback<Parameter>;

/// ui-solid.useDelTablesCallback
export function useDelTablesCallback(
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
  then?: (store: Store) => void,
): Callback;

/// ui-solid.useDelTableCallback
export function useDelTableCallback<Parameter>(
  tableId: MaybeAccessor<Id> | GetId<Parameter>,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
  then?: (store: Store) => void,
): ParameterizedCallback<Parameter>;

/// ui-solid.useDelRowCallback
export function useDelRowCallback<Parameter>(
  tableId: MaybeAccessor<Id> | GetId<Parameter>,
  rowId: MaybeAccessor<Id> | GetId<Parameter>,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
  then?: (store: Store) => void,
): ParameterizedCallback<Parameter>;

/// ui-solid.useDelCellCallback
export function useDelCellCallback<Parameter>(
  tableId: MaybeAccessor<Id> | GetId<Parameter>,
  rowId: MaybeAccessor<Id> | GetId<Parameter>,
  cellId: MaybeAccessor<Id> | GetId<Parameter>,
  forceDel?: MaybeAccessor<boolean | undefined>,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
  then?: (store: Store) => void,
): ParameterizedCallback<Parameter>;

/// ui-solid.useDelValuesCallback
export function useDelValuesCallback(
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
  then?: (store: Store) => void,
): Callback;

/// ui-solid.useDelValueCallback
export function useDelValueCallback<Parameter>(
  valueId: MaybeAccessor<Id> | GetId<Parameter>,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
  then?: (store: Store) => void,
): ParameterizedCallback<Parameter>;

/// ui-solid.useHasTablesListener
export function useHasTablesListener(
  listener: HasTablesListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void;

/// ui-solid.useTablesListener
export function useTablesListener(
  listener: TablesListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void;

/// ui-solid.useTableIdsListener
export function useTableIdsListener(
  listener: TableIdsListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void;

/// ui-solid.useHasTableListener
export function useHasTableListener(
  tableId: MaybeAccessor<IdOrNull>,
  listener: HasTableListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void;

/// ui-solid.useTableListener
export function useTableListener(
  tableId: MaybeAccessor<IdOrNull>,
  listener: TableListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void;

/// ui-solid.useTableCellIdsListener
export function useTableCellIdsListener(
  tableId: MaybeAccessor<IdOrNull>,
  listener: TableCellIdsListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void;

/// ui-solid.useHasTableCellListener
export function useHasTableCellListener(
  tableId: MaybeAccessor<IdOrNull>,
  cellId: MaybeAccessor<IdOrNull>,
  listener: HasTableCellListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void;

/// ui-solid.useRowCountListener
export function useRowCountListener(
  tableId: MaybeAccessor<IdOrNull>,
  listener: RowCountListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void;

/// ui-solid.useRowIdsListener
export function useRowIdsListener(
  tableId: MaybeAccessor<IdOrNull>,
  listener: RowIdsListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void;

/// ui-solid.useSortedRowIdsListener
export function useSortedRowIdsListener(
  tableId: MaybeAccessor<Id>,
  cellId: MaybeAccessor<Id | undefined>,
  descending: MaybeAccessor<boolean>,
  offset: MaybeAccessor<number>,
  limit: MaybeAccessor<number | undefined>,
  listener: SortedRowIdsListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void;

/// ui-solid.useSortedRowIdsListener.2
export function useSortedRowIdsListener(
  args: SortedRowIdsArgs,
  listener: SortedRowIdsListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void;

/// ui-solid.useHasRowListener
export function useHasRowListener(
  tableId: MaybeAccessor<IdOrNull>,
  rowId: MaybeAccessor<IdOrNull>,
  listener: HasRowListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void;

/// ui-solid.useRowListener
export function useRowListener(
  tableId: MaybeAccessor<IdOrNull>,
  rowId: MaybeAccessor<IdOrNull>,
  listener: RowListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void;

/// ui-solid.useCellIdsListener
export function useCellIdsListener(
  tableId: MaybeAccessor<IdOrNull>,
  rowId: MaybeAccessor<IdOrNull>,
  listener: CellIdsListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void;

/// ui-solid.useHasCellListener
export function useHasCellListener(
  tableId: MaybeAccessor<IdOrNull>,
  rowId: MaybeAccessor<IdOrNull>,
  cellId: MaybeAccessor<IdOrNull>,
  listener: HasCellListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void;

/// ui-solid.useCellListener
export function useCellListener(
  tableId: MaybeAccessor<IdOrNull>,
  rowId: MaybeAccessor<IdOrNull>,
  cellId: MaybeAccessor<IdOrNull>,
  listener: CellListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void;

/// ui-solid.useHasValuesListener
export function useHasValuesListener(
  listener: HasValuesListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void;

/// ui-solid.useValuesListener
export function useValuesListener(
  listener: ValuesListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void;

/// ui-solid.useValueIdsListener
export function useValueIdsListener(
  listener: ValueIdsListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void;

/// ui-solid.useHasValueListener
export function useHasValueListener(
  valueId: MaybeAccessor<IdOrNull>,
  listener: HasValueListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void;

/// ui-solid.useValueListener
export function useValueListener(
  valueId: MaybeAccessor<IdOrNull>,
  listener: ValueListener,
  mutator?: boolean,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void;

/// ui-solid.useStartTransactionListener
export function useStartTransactionListener(
  listener: TransactionListener,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void;

/// ui-solid.useWillFinishTransactionListener
export function useWillFinishTransactionListener(
  listener: TransactionListener,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void;

/// ui-solid.useDidFinishTransactionListener
export function useDidFinishTransactionListener(
  listener: TransactionListener,
  storeOrStoreId?: MaybeAccessor<StoreOrStoreId | undefined>,
): void;

/// ui-solid.useCreateMetrics
export function useCreateMetrics(
  store: MaybeAccessor<Store | undefined>,
  create: (store: Store) => Metrics,
): Accessor<Metrics | undefined>;

/// ui-solid.useMetricsIds
export function useMetricsIds(): Accessor<Ids>;

/// ui-solid.useMetrics
export function useMetrics(
  id?: MaybeAccessor<Id | undefined>,
): Accessor<Metrics | undefined>;

/// ui-solid.useMetricsOrMetricsById
export function useMetricsOrMetricsById(
  metricsOrMetricsId?: MaybeAccessor<MetricsOrMetricsId | undefined>,
): Accessor<Metrics | undefined>;

export function useProvideMetrics(metricsId: Id, metrics: Metrics): void;

/// ui-solid.useMetricIds
export function useMetricIds(
  metricsOrMetricsId?: MaybeAccessor<MetricsOrMetricsId | undefined>,
): Accessor<Ids>;

/// ui-solid.useMetric
export function useMetric(
  metricId: MaybeAccessor<Id>,
  metricsOrMetricsId?: MaybeAccessor<MetricsOrMetricsId | undefined>,
): Accessor<number | undefined>;

/// ui-solid.useMetricListener
export function useMetricListener(
  metricId: MaybeAccessor<IdOrNull>,
  listener: MetricListener,
  metricsOrMetricsId?: MaybeAccessor<MetricsOrMetricsId | undefined>,
): void;

/// ui-solid.useCreateIndexes
export function useCreateIndexes(
  store: MaybeAccessor<Store | undefined>,
  create: (store: Store) => Indexes,
): Accessor<Indexes | undefined>;

/// ui-solid.useIndexesIds
export function useIndexesIds(): Accessor<Ids>;

/// ui-solid.useIndexes
export function useIndexes(
  id?: MaybeAccessor<Id | undefined>,
): Accessor<Indexes | undefined>;

/// ui-solid.useIndexesOrIndexesById
export function useIndexesOrIndexesById(
  indexesOrIndexesId?: MaybeAccessor<IndexesOrIndexesId | undefined>,
): Accessor<Indexes | undefined>;

export function useProvideIndexes(indexesId: Id, indexes: Indexes): void;

/// ui-solid.useIndexIds
export function useIndexIds(
  indexesOrIndexesId?: MaybeAccessor<IndexesOrIndexesId | undefined>,
): Accessor<Ids>;

/// ui-solid.useSliceIds
export function useSliceIds(
  indexId: MaybeAccessor<Id>,
  indexesOrIndexesId?: MaybeAccessor<IndexesOrIndexesId | undefined>,
): Accessor<Ids>;

/// ui-solid.useSliceRowIds
export function useSliceRowIds(
  indexId: MaybeAccessor<Id>,
  sliceId: MaybeAccessor<Id>,
  indexesOrIndexesId?: MaybeAccessor<IndexesOrIndexesId | undefined>,
): Accessor<Ids>;

/// ui-solid.useSliceIdsListener
export function useSliceIdsListener(
  indexId: MaybeAccessor<IdOrNull>,
  listener: SliceIdsListener,
  indexesOrIndexesId?: MaybeAccessor<IndexesOrIndexesId | undefined>,
): void;

/// ui-solid.useSliceRowIdsListener
export function useSliceRowIdsListener(
  indexId: MaybeAccessor<IdOrNull>,
  sliceId: MaybeAccessor<IdOrNull>,
  listener: SliceRowIdsListener,
  indexesOrIndexesId?: MaybeAccessor<IndexesOrIndexesId | undefined>,
): void;

/// ui-solid.useCreateRelationships
export function useCreateRelationships(
  store: MaybeAccessor<Store | undefined>,
  create: (store: Store) => Relationships,
): Accessor<Relationships | undefined>;

/// ui-solid.useRelationshipsIds
export function useRelationshipsIds(): Accessor<Ids>;

/// ui-solid.useRelationships
export function useRelationships(
  id?: MaybeAccessor<Id | undefined>,
): Accessor<Relationships | undefined>;

/// ui-solid.useRelationshipsOrRelationshipsById
export function useRelationshipsOrRelationshipsById(
  relationshipsOrRelationshipsId?: MaybeAccessor<
    RelationshipsOrRelationshipsId | undefined
  >,
): Accessor<Relationships | undefined>;

export function useProvideRelationships(
  relationshipsId: Id,
  relationships: Relationships,
): void;

/// ui-solid.useRelationshipIds
export function useRelationshipIds(
  relationshipsOrRelationshipsId?: MaybeAccessor<
    RelationshipsOrRelationshipsId | undefined
  >,
): Accessor<Ids>;

/// ui-solid.useRemoteRowId
export function useRemoteRowId(
  relationshipId: MaybeAccessor<Id>,
  localRowId: MaybeAccessor<Id>,
  relationshipsOrRelationshipsId?: MaybeAccessor<
    RelationshipsOrRelationshipsId | undefined
  >,
): Accessor<Id | undefined>;

/// ui-solid.useLocalRowIds
export function useLocalRowIds(
  relationshipId: MaybeAccessor<Id>,
  remoteRowId: MaybeAccessor<Id>,
  relationshipsOrRelationshipsId?: MaybeAccessor<
    RelationshipsOrRelationshipsId | undefined
  >,
): Accessor<Ids>;

/// ui-solid.useLinkedRowIds
export function useLinkedRowIds(
  relationshipId: MaybeAccessor<Id>,
  firstRowId: MaybeAccessor<Id>,
  relationshipsOrRelationshipsId?: MaybeAccessor<
    RelationshipsOrRelationshipsId | undefined
  >,
): Accessor<Ids>;

/// ui-solid.useRemoteRowIdListener
export function useRemoteRowIdListener(
  relationshipId: MaybeAccessor<IdOrNull>,
  localRowId: MaybeAccessor<IdOrNull>,
  listener: RemoteRowIdListener,
  relationshipsOrRelationshipsId?: MaybeAccessor<
    RelationshipsOrRelationshipsId | undefined
  >,
): void;

/// ui-solid.useLocalRowIdsListener
export function useLocalRowIdsListener(
  relationshipId: MaybeAccessor<IdOrNull>,
  remoteRowId: MaybeAccessor<IdOrNull>,
  listener: LocalRowIdsListener,
  relationshipsOrRelationshipsId?: MaybeAccessor<
    RelationshipsOrRelationshipsId | undefined
  >,
): void;

/// ui-solid.useLinkedRowIdsListener
export function useLinkedRowIdsListener(
  relationshipId: MaybeAccessor<Id>,
  firstRowId: MaybeAccessor<Id>,
  listener: LinkedRowIdsListener,
  relationshipsOrRelationshipsId?: MaybeAccessor<
    RelationshipsOrRelationshipsId | undefined
  >,
): void;

/// ui-solid.useCreateQueries
export function useCreateQueries(
  store: MaybeAccessor<Store | undefined>,
  create: (store: Store) => Queries,
): Accessor<Queries | undefined>;

/// ui-solid.useQueriesIds
export function useQueriesIds(): Accessor<Ids>;

/// ui-solid.useQueries
export function useQueries(
  id?: MaybeAccessor<Id | undefined>,
): Accessor<Queries | undefined>;

/// ui-solid.useQueriesOrQueriesById
export function useQueriesOrQueriesById(
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): Accessor<Queries | undefined>;

export function useProvideQueries(queriesId: Id, queries: Queries): void;

/// ui-solid.useQueryIds
export function useQueryIds(
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): Accessor<Ids>;

/// ui-solid.useResultTable
export function useResultTable(
  queryId: MaybeAccessor<Id>,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): Accessor<Table>;

/// ui-solid.useResultTableCellIds
export function useResultTableCellIds(
  queryId: MaybeAccessor<Id>,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): Accessor<Ids>;

/// ui-solid.useResultRowCount
export function useResultRowCount(
  queryId: MaybeAccessor<Id>,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): Accessor<number>;

/// ui-solid.useResultRowIds
export function useResultRowIds(
  queryId: MaybeAccessor<Id>,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): Accessor<Ids>;

/// ui-solid.useResultSortedRowIds
export function useResultSortedRowIds(
  queryId: MaybeAccessor<Id>,
  cellId?: MaybeAccessor<Id | undefined>,
  descending?: MaybeAccessor<boolean | undefined>,
  offset?: MaybeAccessor<number | undefined>,
  limit?: MaybeAccessor<number | undefined>,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): Accessor<Ids>;

/// ui-solid.useResultRow
export function useResultRow(
  queryId: MaybeAccessor<Id>,
  rowId: MaybeAccessor<Id>,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): Accessor<Row>;

/// ui-solid.useResultCellIds
export function useResultCellIds(
  queryId: MaybeAccessor<Id>,
  rowId: MaybeAccessor<Id>,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): Accessor<Ids>;

/// ui-solid.useResultCell
export function useResultCell(
  queryId: MaybeAccessor<Id>,
  rowId: MaybeAccessor<Id>,
  cellId: MaybeAccessor<Id>,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): Accessor<Cell | undefined>;

/// ui-solid.useResultTableListener
export function useResultTableListener(
  queryId: MaybeAccessor<IdOrNull>,
  listener: ResultTableListener,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): void;

/// ui-solid.useResultTableCellIdsListener
export function useResultTableCellIdsListener(
  queryId: MaybeAccessor<IdOrNull>,
  listener: ResultTableCellIdsListener,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): void;

/// ui-solid.useResultRowCountListener
export function useResultRowCountListener(
  queryId: MaybeAccessor<IdOrNull>,
  listener: ResultRowCountListener,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): void;

/// ui-solid.useResultRowIdsListener
export function useResultRowIdsListener(
  queryId: MaybeAccessor<IdOrNull>,
  listener: ResultRowIdsListener,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): void;

/// ui-solid.useResultSortedRowIdsListener
export function useResultSortedRowIdsListener(
  queryId: MaybeAccessor<Id>,
  cellId: MaybeAccessor<Id | undefined>,
  descending: MaybeAccessor<boolean>,
  offset: MaybeAccessor<number>,
  limit: MaybeAccessor<number | undefined>,
  listener: ResultSortedRowIdsListener,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): void;

/// ui-solid.useResultRowListener
export function useResultRowListener(
  queryId: MaybeAccessor<IdOrNull>,
  rowId: MaybeAccessor<IdOrNull>,
  listener: ResultRowListener,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): void;

/// ui-solid.useResultCellIdsListener
export function useResultCellIdsListener(
  queryId: MaybeAccessor<IdOrNull>,
  rowId: MaybeAccessor<IdOrNull>,
  listener: ResultCellIdsListener,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): void;

/// ui-solid.useResultCellListener
export function useResultCellListener(
  queryId: MaybeAccessor<IdOrNull>,
  rowId: MaybeAccessor<IdOrNull>,
  cellId: MaybeAccessor<IdOrNull>,
  listener: ResultCellListener,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): void;

/// ui-solid.useParamValues
export function useParamValues(
  queryId: MaybeAccessor<Id>,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): Accessor<ParamValues>;

/// ui-solid.useParamValuesState
export function useParamValuesState(
  queryId: MaybeAccessor<Id>,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): [Accessor<ParamValues>, (paramValues: ParamValues) => void];

/// ui-solid.useParamValue
export function useParamValue(
  queryId: MaybeAccessor<Id>,
  paramId: MaybeAccessor<Id>,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): Accessor<ParamValue | undefined>;

/// ui-solid.useParamValueState
export function useParamValueState(
  queryId: MaybeAccessor<Id>,
  paramId: MaybeAccessor<Id>,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): [Accessor<ParamValue | undefined>, (paramValue: ParamValue) => void];

/// ui-solid.useParamValuesListener
export function useParamValuesListener(
  queryId: MaybeAccessor<IdOrNull>,
  listener: ParamValuesListener,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): void;

/// ui-solid.useParamValueListener
export function useParamValueListener(
  queryId: MaybeAccessor<IdOrNull>,
  paramId: MaybeAccessor<IdOrNull>,
  listener: ParamValueListener,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
): void;

/// ui-solid.useSetParamValueCallback
export function useSetParamValueCallback<Parameter>(
  queryId: MaybeAccessor<Id> | GetId<Parameter>,
  paramId: MaybeAccessor<Id> | GetId<Parameter>,
  getParamValue: (parameter: Parameter, queries: Queries) => ParamValue,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
  then?: (queries: Queries, paramValue: ParamValue) => void,
): ParameterizedCallback<Parameter>;

/// ui-solid.useSetParamValuesCallback
export function useSetParamValuesCallback<Parameter>(
  queryId: MaybeAccessor<Id> | GetId<Parameter>,
  getParamValues: (parameter: Parameter, queries: Queries) => ParamValues,
  queriesOrQueriesId?: MaybeAccessor<QueriesOrQueriesId | undefined>,
  then?: (queries: Queries, paramValues: ParamValues) => void,
): ParameterizedCallback<Parameter>;

/// ui-solid.useCreateCheckpoints
export function useCreateCheckpoints(
  store: MaybeAccessor<Store | undefined>,
  create: (store: Store) => Checkpoints,
): Accessor<Checkpoints | undefined>;

/// ui-solid.useCheckpointsIds
export function useCheckpointsIds(): Accessor<Ids>;

/// ui-solid.useCheckpoints
export function useCheckpoints(
  id?: MaybeAccessor<Id | undefined>,
): Accessor<Checkpoints | undefined>;

/// ui-solid.useCheckpointsOrCheckpointsById
export function useCheckpointsOrCheckpointsById(
  checkpointsOrCheckpointsId?: MaybeAccessor<
    CheckpointsOrCheckpointsId | undefined
  >,
): Accessor<Checkpoints | undefined>;

export function useProvideCheckpoints(
  checkpointsId: Id,
  checkpoints: Checkpoints,
): void;

/// ui-solid.useCheckpointIds
export function useCheckpointIds(
  checkpointsOrCheckpointsId?: MaybeAccessor<
    CheckpointsOrCheckpointsId | undefined
  >,
): Accessor<CheckpointIds>;

/// ui-solid.useCheckpoint
export function useCheckpoint(
  checkpointId: MaybeAccessor<Id>,
  checkpointsOrCheckpointsId?: MaybeAccessor<
    CheckpointsOrCheckpointsId | undefined
  >,
): Accessor<string | undefined>;

/// ui-solid.useSetCheckpointCallback
export function useSetCheckpointCallback<Parameter>(
  getCheckpoint?: (parameter: Parameter) => string,
  checkpointsOrCheckpointsId?: MaybeAccessor<
    CheckpointsOrCheckpointsId | undefined
  >,
  then?: (
    checkpointId: MaybeAccessor<Id>,
    checkpoints: Checkpoints,
    label?: string,
  ) => void,
): ParameterizedCallback<Parameter>;

/// ui-solid.useGoBackwardCallback
export function useGoBackwardCallback(
  checkpointsOrCheckpointsId?: MaybeAccessor<
    CheckpointsOrCheckpointsId | undefined
  >,
): Callback;

/// ui-solid.useGoForwardCallback
export function useGoForwardCallback(
  checkpointsOrCheckpointsId?: MaybeAccessor<
    CheckpointsOrCheckpointsId | undefined
  >,
): Callback;

/// ui-solid.useGoToCallback
export function useGoToCallback<Parameter>(
  getCheckpointId: (parameter: Parameter) => Id,
  checkpointsOrCheckpointsId?: MaybeAccessor<
    CheckpointsOrCheckpointsId | undefined
  >,
  then?: (checkpoints: Checkpoints, checkpointId: Id) => void,
): ParameterizedCallback<Parameter>;

/// ui-solid.useUndoInformation
export function useUndoInformation(
  checkpointsOrCheckpointsId?: MaybeAccessor<
    CheckpointsOrCheckpointsId | undefined
  >,
): UndoOrRedoInformation;

/// ui-solid.useRedoInformation
export function useRedoInformation(
  checkpointsOrCheckpointsId?: MaybeAccessor<
    CheckpointsOrCheckpointsId | undefined
  >,
): UndoOrRedoInformation;

/// ui-solid.useCheckpointIdsListener
export function useCheckpointIdsListener(
  listener: CheckpointIdsListener,
  checkpointsOrCheckpointsId?: MaybeAccessor<
    CheckpointsOrCheckpointsId | undefined
  >,
): void;

/// ui-solid.useCheckpointListener
export function useCheckpointListener(
  checkpointId: MaybeAccessor<IdOrNull>,
  listener: CheckpointListener,
  checkpointsOrCheckpointsId?: MaybeAccessor<
    CheckpointsOrCheckpointsId | undefined
  >,
): void;

/// ui-solid.useCreatePersister
export function useCreatePersister<
  Persist extends Persists,
  PersisterOrUndefined extends Persister<Persist> | undefined,
>(
  store: MaybeAccessor<PersistedStore<Persist> | undefined>,
  create: (
    store: PersistedStore<Persist>,
  ) => PersisterOrUndefined | Promise<PersisterOrUndefined>,
  then?: (persister: Persister<Persist>) => Promise<any>,
  destroy?: (persister: Persister<Persist>) => void,
): Accessor<PersisterOrUndefined | undefined>;

/// ui-solid.usePersisterIds
export function usePersisterIds(): Accessor<Ids>;

/// ui-solid.usePersister
export function usePersister(
  id?: MaybeAccessor<Id | undefined>,
): Accessor<AnyPersister | undefined>;

/// ui-solid.usePersisterOrPersisterById
export function usePersisterOrPersisterById(
  persisterOrPersisterId?: MaybeAccessor<PersisterOrPersisterId | undefined>,
): Accessor<AnyPersister | undefined>;

export function useProvidePersister(
  persisterId: Id,
  persister: AnyPersister,
): void;

/// ui-solid.usePersisterStatus
export function usePersisterStatus(
  persisterOrPersisterId?: MaybeAccessor<PersisterOrPersisterId | undefined>,
): Accessor<Status>;

/// ui-solid.usePersisterStatusListener
export function usePersisterStatusListener(
  listener: StatusListener,
  persisterOrPersisterId?: MaybeAccessor<PersisterOrPersisterId | undefined>,
): void;

/// ui-solid.useCreateSynchronizer
export function useCreateSynchronizer<
  SynchronizerOrUndefined extends Synchronizer | undefined,
>(
  store: MaybeAccessor<MergeableStore | undefined>,
  create: (store: MergeableStore) => Promise<SynchronizerOrUndefined>,
  destroy?: (synchronizer: Synchronizer) => void,
): Accessor<SynchronizerOrUndefined | undefined>;

/// ui-solid.useSynchronizerIds
export function useSynchronizerIds(): Accessor<Ids>;

/// ui-solid.useSynchronizer
export function useSynchronizer(
  id?: MaybeAccessor<Id | undefined>,
): Accessor<Synchronizer | undefined>;

/// ui-solid.useSynchronizerOrSynchronizerById
export function useSynchronizerOrSynchronizerById(
  synchronizerOrSynchronizerId?: MaybeAccessor<
    SynchronizerOrSynchronizerId | undefined
  >,
): Accessor<Synchronizer | undefined>;

export function useProvideSynchronizer(
  synchronizerId: Id,
  synchronizer: Synchronizer,
): void;

/// ui-solid.useSynchronizerStatus
export function useSynchronizerStatus(
  synchronizerOrSynchronizerId?: MaybeAccessor<
    SynchronizerOrSynchronizerId | undefined
  >,
): Accessor<Status>;

/// ui-solid.useSynchronizerStatusListener
export function useSynchronizerStatusListener(
  listener: StatusListener,
  synchronizerOrSynchronizerId?: MaybeAccessor<
    SynchronizerOrSynchronizerId | undefined
  >,
): void;

/// ui-solid.ExtraProps
export type ExtraProps = {[propName: string]: any};

/// ui-solid.TablesProps
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

/// ui-solid.TableProps
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

/// ui-solid.SortedTableProps
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

/// ui-solid.RowProps
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

/// ui-solid.CellProps
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

/// ui-solid.ValuesProps
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

/// ui-solid.ValueProps
export type ValueProps = {
  /// ui-solid.ValueProps.valueId
  readonly valueId: Id;
  /// ui-solid.ValueProps.store
  readonly store?: StoreOrStoreId;
  /// ui-solid.ValueProps.debugIds
  readonly debugIds?: boolean;
};

/// ui-solid.MetricProps
export type MetricProps = {
  /// ui-solid.MetricProps.metricId
  readonly metricId: Id;
  /// ui-solid.MetricProps.metrics
  readonly metrics?: MetricsOrMetricsId;
  /// ui-solid.MetricProps.debugIds
  readonly debugIds?: boolean;
};

/// ui-solid.IndexProps
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

/// ui-solid.SliceProps
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

/// ui-solid.RemoteRowProps
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

/// ui-solid.LocalRowsProps
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

/// ui-solid.LinkedRowsProps
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

/// ui-solid.ResultTableProps
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

/// ui-solid.ResultSortedTableProps
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

/// ui-solid.ResultRowProps
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

/// ui-solid.ResultCellProps
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

/// ui-solid.CheckpointProps
export type CheckpointProps = {
  /// ui-solid.CheckpointProps.checkpointId
  readonly checkpointId: Id;
  /// ui-solid.CheckpointProps.checkpoints
  readonly checkpoints?: CheckpointsOrCheckpointsId;
  /// ui-solid.CheckpointProps.debugIds
  readonly debugIds?: boolean;
};

/// ui-solid.BackwardCheckpointsProps
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

/// ui-solid.CurrentCheckpointProps
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

/// ui-solid.ForwardCheckpointsProps
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

/// ui-solid.ProviderProps
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

/// ui-solid.ComponentReturnType
export type ComponentReturnType = JSXElement;

/// ui-solid.Provider
export function Provider(
  props: ProviderProps & {children: JSXElement},
): ComponentReturnType;

/// ui-solid.CellView
export function CellView(props: CellProps): ComponentReturnType;

/// ui-solid.RowView
export function RowView(props: RowProps): ComponentReturnType;

/// ui-solid.SortedTableView
export function SortedTableView(props: SortedTableProps): ComponentReturnType;

/// ui-solid.TableView
export function TableView(props: TableProps): ComponentReturnType;

/// ui-solid.TablesView
export function TablesView(props: TablesProps): ComponentReturnType;

/// ui-solid.ValueView
export function ValueView(props: ValueProps): ComponentReturnType;

/// ui-solid.ValuesView
export function ValuesView(props: ValuesProps): ComponentReturnType;

/// ui-solid.MetricView
export function MetricView(props: MetricProps): ComponentReturnType;

/// ui-solid.SliceView
export function SliceView(props: SliceProps): ComponentReturnType;

/// ui-solid.IndexView
export function IndexView(props: IndexProps): ComponentReturnType;

/// ui-solid.RemoteRowView
export function RemoteRowView(props: RemoteRowProps): ComponentReturnType;

/// ui-solid.LocalRowsView
export function LocalRowsView(props: LocalRowsProps): ComponentReturnType;

/// ui-solid.LinkedRowsView
export function LinkedRowsView(props: LinkedRowsProps): ComponentReturnType;

/// ui-solid.ResultCellView
export function ResultCellView(props: ResultCellProps): ComponentReturnType;

/// ui-solid.ResultRowView
export function ResultRowView(props: ResultRowProps): ComponentReturnType;

/// ui-solid.ResultSortedTableView
export function ResultSortedTableView(
  props: ResultSortedTableProps,
): ComponentReturnType;

/// ui-solid.ResultTableView
export function ResultTableView(props: ResultTableProps): ComponentReturnType;

/// ui-solid.CheckpointView
export function CheckpointView(props: CheckpointProps): ComponentReturnType;

/// ui-solid.BackwardCheckpointsView
export function BackwardCheckpointsView(
  props: BackwardCheckpointsProps,
): ComponentReturnType;

/// ui-solid.CurrentCheckpointView
export function CurrentCheckpointView(
  props: CurrentCheckpointProps,
): ComponentReturnType;

/// ui-solid.ForwardCheckpointsView
export function ForwardCheckpointsView(
  props: ForwardCheckpointsProps,
): ComponentReturnType;
