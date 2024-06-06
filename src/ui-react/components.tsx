/** @jsx createElement */

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
} from '../@types/ui-react';
import {
  Context,
  useCheckpointsOrCheckpointsById,
  useIndexesOrIndexesById,
  useRelationshipsOrRelationshipsById,
} from './context';
import type {Id, Ids} from '../@types/common';
import React, {ReactElement} from 'react';
import {
  createElement,
  getIndexStoreTableId,
  getProps,
  getRelationshipsStoreTableIds,
} from '../common/react';
import {isArray, isUndefined} from '../common/other';
import {objDel, objGet} from '../common/obj';
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
} from './hooks';
import type {CheckpointIds} from '../@types/checkpoints';
import {EMPTY_STRING} from '../common/strings';
import type {Store} from '../@types/store';
import {arrayMap} from '../common/array';

const {useCallback, useContext, useMemo, useState} = React;

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
        {...getProps(getRowComponentProps, rowId)}
        key={rowId}
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
        {...getProps(getResultRowComponentProps, rowId)}
        key={rowId}
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
        {...getProps(getRowComponentProps, rowId)}
        key={rowId}
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
            {...getProps(getCheckpointComponentProps, checkpointId as Id)}
            key={checkpointId}
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
  children,
}: ProviderProps & {readonly children: React.ReactNode}): any => {
  const parentValue = useContext(Context);

  const [extraStoresById, setExtraStoresById] = useState<{[id: Id]: Store}>({});
  const addExtraStore = useCallback(
    (id: Id, store: Store) =>
      setExtraStoresById((extraStoresById) =>
        objGet(extraStoresById, id) == store
          ? extraStoresById
          : {...extraStoresById, [id]: store},
      ),
    [],
  );
  const delExtraStore = useCallback(
    (id: Id) =>
      setExtraStoresById((extraStoresById) => ({
        ...objDel(extraStoresById, id),
      })),
    [],
  );

  return (
    <Context.Provider
      value={useMemo(
        () => [
          store ?? parentValue[0],
          {...parentValue[1], ...storesById, ...extraStoresById},
          metrics ?? parentValue[2],
          {...parentValue[3], ...metricsById},
          indexes ?? parentValue[4],
          {...parentValue[5], ...indexesById},
          relationships ?? parentValue[6],
          {...parentValue[7], ...relationshipsById},
          queries ?? parentValue[8],
          {...parentValue[9], ...queriesById},
          checkpoints ?? parentValue[10],
          {...parentValue[11], ...checkpointsById},
          addExtraStore,
          delExtraStore,
        ],
        [
          store,
          storesById,
          extraStoresById,
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
          parentValue,
          addExtraStore,
          delExtraStore,
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
          {...getProps(getCellComponentProps, cellId)}
          key={cellId}
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
        {...getProps(getTableComponentProps, tableId)}
        key={tableId}
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
        {...getProps(getValueComponentProps, valueId)}
        key={valueId}
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
        {...getProps(getRowComponentProps, rowId)}
        key={rowId}
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
        {...getProps(getSliceComponentProps, sliceId)}
        key={sliceId}
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
        {...getProps(getRowComponentProps, rowId as Id)}
        key={rowId}
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
        {...getProps(getResultCellComponentProps, cellId)}
        key={cellId}
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
