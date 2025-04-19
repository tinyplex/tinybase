import type {ReactElement, ReactNode} from 'react';
import type {CheckpointIds} from '../@types/checkpoints/index.d.ts';
import type {Id, Ids} from '../@types/common/index.d.ts';
import type {
  BackwardCheckpointsProps,
  BackwardCheckpointsView as BackwardCheckpointsViewDecl,
  CellProps,
  CellView as CellViewDecl,
  CheckpointProps,
  CheckpointView as CheckpointViewDecl,
  CurrentCheckpointProps,
  CurrentCheckpointView as CurrentCheckpointViewDecl,
  ForwardCheckpointsProps,
  ForwardCheckpointsView as ForwardCheckpointsViewDecl,
  IndexProps,
  IndexView as IndexViewDecl,
  LinkedRowsProps,
  LinkedRowsView as LinkedRowsViewDecl,
  LocalRowsProps,
  LocalRowsView as LocalRowsViewDecl,
  MetricProps,
  MetricView as MetricViewDecl,
  Provider as ProviderDecl,
  ProviderProps,
  RelationshipsOrRelationshipsId,
  RemoteRowProps,
  RemoteRowView as RemoteRowViewDecl,
  ResultCellProps,
  ResultCellView as ResultCellViewDecl,
  ResultRowProps,
  ResultRowView as ResultRowViewDecl,
  ResultSortedTableProps,
  ResultSortedTableView as ResultSortedTableViewDecl,
  ResultTableProps,
  ResultTableView as ResultTableViewDecl,
  RowProps,
  RowView as RowViewDecl,
  SliceProps,
  SliceView as SliceViewDecl,
  SortedTableProps,
  SortedTableView as SortedTableViewDecl,
  StoreOrStoreId,
  TableProps,
  TableView as TableViewDecl,
  TablesProps,
  TablesView as TablesViewDecl,
  ValueProps,
  ValueView as ValueViewDecl,
  ValuesProps,
  ValuesView as ValuesViewDecl,
} from '../@types/ui-react/index.d.ts';
import {arrayMap, arrayNew, arrayWith} from '../common/array.ts';
import {objDel, objGet, objHas} from '../common/obj.ts';
import {isArray, isUndefined} from '../common/other.ts';
import {
  getIndexStoreTableId,
  getProps,
  getRelationshipsStoreTableIds,
  useCallback,
  useContext,
  useMemo,
  useState,
} from '../common/react.ts';
import {EMPTY_STRING} from '../common/strings.ts';
import {
  Context,
  ContextValue,
  ThingsByOffset,
  useCheckpointsOrCheckpointsById,
  useIndexesOrIndexesById,
  useRelationshipsOrRelationshipsById,
} from './context.ts';
import {
  useCell,
  useCellIds,
  useCheckpoint,
  useCheckpointIds,
  useLinkedRowIds,
  useLocalRowIds,
  useMetric,
  useRemoteRowId,
  useResultCell,
  useResultCellIds,
  useResultRowIds,
  useResultSortedRowIds,
  useRowIds,
  useSliceIds,
  useSliceRowIds,
  useSortedRowIds,
  useTableIds,
  useValue,
  useValueIds,
} from './hooks.ts';

enum Offsets {
  Store = 0,
  Metrics = 1,
  Indexes = 2,
  Relationships = 3,
  Queries = 4,
  Checkpoints = 5,
  Persister = 6,
  Synchronizer = 7,
}

type ThingsById<ThingsByOffset> = {
  [Offset in keyof ThingsByOffset]: {[id: Id]: ThingsByOffset[Offset]};
};
type ExtraThingsById = ThingsById<ThingsByOffset>;

const mergeParentThings = <Offset extends Offsets>(
  offset: Offset,
  parentValue: ContextValue,
  defaultThing: ThingsByOffset[Offset] | undefined,
  thingsById: ThingsById<ThingsByOffset>[Offset] | undefined,
  extraThingsById: ExtraThingsById,
): [ThingsByOffset[Offset] | undefined, ThingsById<ThingsByOffset>[Offset]] => [
  defaultThing ??
    (parentValue[offset * 2] as ThingsByOffset[Offset] | undefined),
  {
    ...parentValue[offset * 2 + 1],
    ...thingsById,
    ...extraThingsById[offset],
  },
];

const tableView = (
  {
    tableId,
    store,
    rowComponent: Row = RowView,
    getRowComponentProps,
    customCellIds,
    separator,
    debugIds,
  }: TableProps,
  rowIds: Ids,
): any =>
  wrap(
    arrayMap(rowIds, (rowId) => (
      <Row
        key={rowId}
        {...getProps(getRowComponentProps, rowId)}
        tableId={tableId}
        rowId={rowId}
        customCellIds={customCellIds}
        store={store}
        debugIds={debugIds}
      />
    )),
    separator,
    debugIds,
    tableId,
  );

const resultTableView = (
  {
    queryId,
    queries,
    resultRowComponent: ResultRow = ResultRowView,
    getResultRowComponentProps,
    separator,
    debugIds,
  }: ResultTableProps,
  rowIds: Ids,
): any =>
  wrap(
    arrayMap(rowIds, (rowId) => (
      <ResultRow
        key={rowId}
        {...getProps(getResultRowComponentProps, rowId)}
        queryId={queryId}
        rowId={rowId}
        queries={queries}
        debugIds={debugIds}
      />
    )),
    separator,
    debugIds,
    queryId,
  );

const useComponentPerRow = (
  {
    relationshipId,
    relationships,
    rowComponent: Row = RowView,
    getRowComponentProps,
    separator,
    debugIds,
  }: (RemoteRowProps | LocalRowsProps | LinkedRowsProps) & {
    separator?: ReactElement | string;
  },
  getRowIdsHook: (
    relationshipId: Id,
    rowId: Id,
    relationships: RelationshipsOrRelationshipsId | undefined,
  ) => Ids,
  rowId: Id,
) => {
  const [resolvedRelationships, store, localTableId] =
    getRelationshipsStoreTableIds(
      useRelationshipsOrRelationshipsById(relationships),
      relationshipId,
    );
  const rowIds = getRowIdsHook(relationshipId, rowId, resolvedRelationships);
  return wrap(
    arrayMap(rowIds, (rowId) => (
      <Row
        key={rowId}
        {...getProps(getRowComponentProps, rowId)}
        tableId={localTableId as Id}
        rowId={rowId}
        store={store}
        debugIds={debugIds}
      />
    )),
    separator,
    debugIds,
    rowId,
  );
};

const getUseCheckpointView =
  (getCheckpoints: (checkpointIds: CheckpointIds) => Ids) =>
  ({
    checkpoints,
    checkpointComponent: Checkpoint = CheckpointView,
    getCheckpointComponentProps,
    separator,
    debugIds,
  }: (
    | BackwardCheckpointsProps
    | CurrentCheckpointProps
    | ForwardCheckpointsProps
  ) & {
    separator?: ReactElement | string;
  }): any => {
    const resolvedCheckpoints = useCheckpointsOrCheckpointsById(checkpoints);
    return wrap(
      arrayMap(
        getCheckpoints(useCheckpointIds(resolvedCheckpoints)),
        (checkpointId: Id) => (
          <Checkpoint
            key={checkpointId}
            {...getProps(getCheckpointComponentProps, checkpointId as Id)}
            checkpoints={resolvedCheckpoints}
            checkpointId={checkpointId}
            debugIds={debugIds}
          />
        ),
      ),
      separator,
    );
  };

export const Provider: typeof ProviderDecl = ({
  store,
  storesById,
  metrics,
  metricsById,
  indexes,
  indexesById,
  relationships,
  relationshipsById,
  queries,
  queriesById,
  checkpoints,
  checkpointsById,
  persister,
  persistersById,
  synchronizer,
  synchronizersById,
  children,
}: ProviderProps & {readonly children: ReactNode}): any => {
  const parentValue = useContext(Context);
  const [extraThingsById, setExtraThingsById] = useState<ExtraThingsById>(
    () => arrayNew(8, () => ({})) as ExtraThingsById,
  );
  const addExtraThingById = useCallback(
    <Offset extends Offsets>(
      thingOffset: Offset,
      id: Id,
      thing: ThingsByOffset[Offset],
    ) =>
      setExtraThingsById((extraThingsById) =>
        objGet(extraThingsById[thingOffset] as any, id) == thing
          ? extraThingsById
          : (arrayWith(extraThingsById, thingOffset, {
              ...extraThingsById[thingOffset],
              [id]: thing,
            } as any) as ExtraThingsById),
      ),
    [],
  );

  const delExtraThingById = useCallback(
    (thingOffset: Offsets, id: Id) =>
      setExtraThingsById((extraThingsById) =>
        !objHas(extraThingsById[thingOffset], id)
          ? extraThingsById
          : (arrayWith(
              extraThingsById,
              thingOffset,
              objDel(extraThingsById[thingOffset] as any, id),
            ) as ExtraThingsById),
      ),
    [],
  );

  return (
    <Context.Provider
      value={useMemo(
        () => [
          ...mergeParentThings(
            Offsets.Store,
            parentValue,
            store,
            storesById,
            extraThingsById,
          ),
          ...mergeParentThings(
            Offsets.Metrics,
            parentValue,
            metrics,
            metricsById,
            extraThingsById,
          ),
          ...mergeParentThings(
            Offsets.Indexes,
            parentValue,
            indexes,
            indexesById,
            extraThingsById,
          ),
          ...mergeParentThings(
            Offsets.Relationships,
            parentValue,
            relationships,
            relationshipsById,
            extraThingsById,
          ),
          ...mergeParentThings(
            Offsets.Queries,
            parentValue,
            queries,
            queriesById,
            extraThingsById,
          ),
          ...mergeParentThings(
            Offsets.Checkpoints,
            parentValue,
            checkpoints,
            checkpointsById,
            extraThingsById,
          ),
          ...mergeParentThings(
            Offsets.Persister,
            parentValue,
            persister,
            persistersById,
            extraThingsById,
          ),
          ...mergeParentThings(
            Offsets.Synchronizer,
            parentValue,
            synchronizer,
            synchronizersById,
            extraThingsById,
          ),
          addExtraThingById,
          delExtraThingById,
        ],
        [
          extraThingsById,
          store,
          storesById,
          metrics,
          metricsById,
          indexes,
          indexesById,
          relationships,
          relationshipsById,
          queries,
          queriesById,
          checkpoints,
          checkpointsById,
          persister,
          persistersById,
          synchronizer,
          synchronizersById,
          parentValue,
          addExtraThingById,
          delExtraThingById,
        ],
      )}
    >
      {children}
    </Context.Provider>
  );
};

const wrap = (
  children: any,
  separator?: any,
  encloseWithId?: boolean,
  id?: Id,
) => {
  const separated =
    isUndefined(separator) || !isArray(children)
      ? children
      : arrayMap(children, (child, c) => (c > 0 ? [separator, child] : child));
  return encloseWithId ? [id, ':{', separated, '}'] : separated;
};

const useCustomOrDefaultCellIds = (
  customCellIds: Ids | undefined,
  tableId: Id,
  rowId: Id,
  store?: StoreOrStoreId,
): Ids => {
  const defaultCellIds = useCellIds(tableId, rowId, store);
  return customCellIds ?? defaultCellIds;
};

export const CellView: typeof CellViewDecl = ({
  tableId,
  rowId,
  cellId,
  store,
  debugIds,
}: CellProps): any =>
  wrap(
    EMPTY_STRING + (useCell(tableId, rowId, cellId, store) ?? EMPTY_STRING),
    undefined,
    debugIds,
    cellId,
  );

export const RowView: typeof RowViewDecl = ({
  tableId,
  rowId,
  store,
  cellComponent: Cell = CellView,
  getCellComponentProps,
  customCellIds,
  separator,
  debugIds,
}: RowProps): any =>
  wrap(
    arrayMap(
      useCustomOrDefaultCellIds(customCellIds, tableId, rowId, store),
      (cellId) => (
        <Cell
          key={cellId}
          {...getProps(getCellComponentProps, cellId)}
          tableId={tableId}
          rowId={rowId}
          cellId={cellId}
          store={store}
          debugIds={debugIds}
        />
      ),
    ),
    separator,
    debugIds,
    rowId,
  );

export const TableView: typeof TableViewDecl = (props: TableProps): any =>
  tableView(props, useRowIds(props.tableId, props.store));

export const SortedTableView: typeof SortedTableViewDecl = ({
  cellId,
  descending,
  offset,
  limit,
  ...props
}: SortedTableProps): any =>
  tableView(
    props,
    useSortedRowIds(
      props.tableId,
      cellId,
      descending,
      offset,
      limit,
      props.store,
    ),
  );

export const TablesView: typeof TablesViewDecl = ({
  store,
  tableComponent: Table = TableView,
  getTableComponentProps,
  separator,
  debugIds,
}: TablesProps): any =>
  wrap(
    arrayMap(useTableIds(store), (tableId) => (
      <Table
        key={tableId}
        {...getProps(getTableComponentProps, tableId)}
        tableId={tableId}
        store={store}
        debugIds={debugIds}
      />
    )),
    separator,
  );

export const ValueView: typeof ValueViewDecl = ({
  valueId,
  store,
  debugIds,
}: ValueProps): any =>
  wrap(
    EMPTY_STRING + (useValue(valueId, store) ?? EMPTY_STRING),
    undefined,
    debugIds,
    valueId,
  );

export const ValuesView: typeof ValuesViewDecl = ({
  store,
  valueComponent: Value = ValueView,
  getValueComponentProps,
  separator,
  debugIds,
}: ValuesProps): any =>
  wrap(
    arrayMap(useValueIds(store), (valueId) => (
      <Value
        key={valueId}
        {...getProps(getValueComponentProps, valueId)}
        valueId={valueId}
        store={store}
        debugIds={debugIds}
      />
    )),
    separator,
  );

export const MetricView: typeof MetricViewDecl = ({
  metricId,
  metrics,
  debugIds,
}: MetricProps): any =>
  wrap(
    useMetric(metricId, metrics) ?? EMPTY_STRING,
    undefined,
    debugIds,
    metricId,
  );

export const SliceView: typeof SliceViewDecl = ({
  indexId,
  sliceId,
  indexes,
  rowComponent: Row = RowView,
  getRowComponentProps,
  separator,
  debugIds,
}: SliceProps): any => {
  const [resolvedIndexes, store, tableId] = getIndexStoreTableId(
    useIndexesOrIndexesById(indexes),
    indexId,
  );
  const rowIds = useSliceRowIds(indexId, sliceId, resolvedIndexes);
  return wrap(
    arrayMap(rowIds, (rowId) => (
      <Row
        key={rowId}
        {...getProps(getRowComponentProps, rowId)}
        tableId={tableId as Id}
        rowId={rowId}
        store={store}
        debugIds={debugIds}
      />
    )),
    separator,
    debugIds,
    sliceId,
  );
};

export const IndexView: typeof IndexViewDecl = ({
  indexId,
  indexes,
  sliceComponent: Slice = SliceView,
  getSliceComponentProps,
  separator,
  debugIds,
}: IndexProps): any =>
  wrap(
    arrayMap(useSliceIds(indexId, indexes), (sliceId) => (
      <Slice
        key={sliceId}
        {...getProps(getSliceComponentProps, sliceId)}
        indexId={indexId}
        sliceId={sliceId}
        indexes={indexes}
        debugIds={debugIds}
      />
    )),
    separator,
    debugIds,
    indexId,
  );

export const RemoteRowView: typeof RemoteRowViewDecl = ({
  relationshipId,
  localRowId,
  relationships,
  rowComponent: Row = RowView,
  getRowComponentProps,
  debugIds,
}: RemoteRowProps): any => {
  const [resolvedRelationships, store, , remoteTableId] =
    getRelationshipsStoreTableIds(
      useRelationshipsOrRelationshipsById(relationships),
      relationshipId,
    );
  const rowId = useRemoteRowId(
    relationshipId,
    localRowId,
    resolvedRelationships,
  );
  return wrap(
    isUndefined(remoteTableId) || isUndefined(rowId) ? null : (
      <Row
        key={rowId}
        {...getProps(getRowComponentProps, rowId as Id)}
        tableId={remoteTableId}
        rowId={rowId}
        store={store}
        debugIds={debugIds}
      />
    ),
    undefined,
    debugIds,
    localRowId,
  );
};

export const LocalRowsView: typeof LocalRowsViewDecl = (
  props: LocalRowsProps,
): any => useComponentPerRow(props, useLocalRowIds, props.remoteRowId);

export const LinkedRowsView: typeof LinkedRowsViewDecl = (
  props: LinkedRowsProps,
): any => useComponentPerRow(props, useLinkedRowIds, props.firstRowId);

export const ResultCellView: typeof ResultCellViewDecl = ({
  queryId,
  rowId,
  cellId,
  queries,
  debugIds,
}: ResultCellProps): any =>
  wrap(
    EMPTY_STRING +
      (useResultCell(queryId, rowId, cellId, queries) ?? EMPTY_STRING),
    undefined,
    debugIds,
    cellId,
  );

export const ResultRowView: typeof ResultRowViewDecl = ({
  queryId,
  rowId,
  queries,
  resultCellComponent: ResultCell = ResultCellView,
  getResultCellComponentProps,
  separator,
  debugIds,
}: ResultRowProps): any =>
  wrap(
    arrayMap(useResultCellIds(queryId, rowId, queries), (cellId) => (
      <ResultCell
        key={cellId}
        {...getProps(getResultCellComponentProps, cellId)}
        queryId={queryId}
        rowId={rowId}
        cellId={cellId}
        queries={queries}
        debugIds={debugIds}
      />
    )),
    separator,
    debugIds,
    rowId,
  );

export const ResultTableView: typeof ResultTableViewDecl = (
  props: ResultTableProps,
): any => resultTableView(props, useResultRowIds(props.queryId, props.queries));

export const ResultSortedTableView: typeof ResultSortedTableViewDecl = ({
  cellId,
  descending,
  offset,
  limit,
  ...props
}: ResultSortedTableProps): any =>
  resultTableView(
    props,
    useResultSortedRowIds(
      props.queryId,
      cellId,
      descending,
      offset,
      limit,
      props.queries,
    ),
  );

export const CheckpointView: typeof CheckpointViewDecl = ({
  checkpoints,
  checkpointId,
  debugIds,
}: CheckpointProps): any =>
  wrap(
    useCheckpoint(checkpointId, checkpoints) ?? EMPTY_STRING,
    undefined,
    debugIds,
    checkpointId,
  );

export const BackwardCheckpointsView: typeof BackwardCheckpointsViewDecl =
  getUseCheckpointView((checkpointIds) => checkpointIds[0]);

export const CurrentCheckpointView: typeof CurrentCheckpointViewDecl =
  getUseCheckpointView((checkpointIds) =>
    isUndefined(checkpointIds[1]) ? [] : [checkpointIds[1]],
  );

export const ForwardCheckpointsView: typeof ForwardCheckpointsViewDecl =
  getUseCheckpointView((checkpointIds) => checkpointIds[2]);
