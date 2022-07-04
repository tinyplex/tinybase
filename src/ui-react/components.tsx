/** @jsx createElement */

import {
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
  RowProps,
  RowView as RowViewDecl,
  SliceProps,
  SliceView as SliceViewDecl,
  TableProps,
  TableView as TableViewDecl,
  TablesProps,
  TablesView as TablesViewDecl,
} from '../ui-react.d';
import {
  Context,
  useCheckpointsOrCheckpointsId,
  useIndexesOrIndexesId,
  useRelationshipsOrRelationshipsId,
} from './common';
import {Id, Ids} from '../common.d';
import React, {ReactElement, useContext} from 'react';
import {
  useCell,
  useCellIds,
  useCheckpoint,
  useCheckpointIds,
  useLinkedRowIds,
  useLocalRowIds,
  useMetric,
  useRemoteRowId,
  useRowIds,
  useSliceIds,
  useSliceRowIds,
  useTableIds,
} from './hooks';
import {CheckpointIds} from '../checkpoints.d';
import {EMPTY_STRING} from '../common/strings';
import {IdObj} from '../common/obj';
import {Relationships} from '../relationships.d';
import {Store} from '../store.d';
import {arrayMap} from '../common/array';
import {isUndefined} from '../common/other';

const {createElement, useMemo} = React;

const useRelationshipsStoreTableId = (
  relationships: RelationshipsOrRelationshipsId,
): [Relationships | undefined, Store | undefined] => {
  const resolvedRelationships =
    useRelationshipsOrRelationshipsId(relationships);
  return [resolvedRelationships, resolvedRelationships?.getStore()];
};

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
  const [resolvedRelationships, store] = useRelationshipsStoreTableId(
    relationships as RelationshipsOrRelationshipsId,
  );
  const tableId = resolvedRelationships?.getLocalTableId(relationshipId);
  const rowIds = getRowIdsHook(relationshipId, rowId, resolvedRelationships);
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
    const resolvedCheckpoints = useCheckpointsOrCheckpointsId(checkpoints);
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

const getProps = <Props extends IdObj<any>>(
  getProps: ((id: Id) => Props) | undefined,
  id: Id,
): Props => (isUndefined(getProps) ? ({} as Props) : getProps(id));

export const Provider: typeof ProviderDecl = ({
  store,
  storesById,
  metrics,
  metricsById,
  indexes,
  indexesById,
  relationships,
  relationshipsById,
  checkpoints,
  checkpointsById,
  children,
}: ProviderProps & {children: React.ReactNode}): any => {
  const thingsOrThingsId = useContext(Context);
  return (
    <Context.Provider
      value={useMemo(
        () => [
          store ?? thingsOrThingsId[0],
          {...thingsOrThingsId[1], ...storesById},
          metrics ?? thingsOrThingsId[2],
          {...thingsOrThingsId[3], ...metricsById},
          indexes ?? thingsOrThingsId[4],
          {...thingsOrThingsId[5], ...indexesById},
          relationships ?? thingsOrThingsId[6],
          {...thingsOrThingsId[7], ...relationshipsById},
          checkpoints ?? thingsOrThingsId[8],
          {...thingsOrThingsId[9], ...checkpointsById},
        ],
        [
          store,
          storesById,
          metrics,
          metricsById,
          indexes,
          indexesById,
          relationships,
          relationshipsById,
          checkpoints,
          checkpointsById,
          thingsOrThingsId,
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
  const separatedChildren =
    isUndefined(separator) || !Array.isArray(children)
      ? children
      : arrayMap(children, (child, c) => (c > 0 ? [separator, child] : child));
  return encloseWithId ? [id, ':{', separatedChildren, '}'] : separatedChildren;
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
  trackReorder,
  cellComponent: Cell = CellView,
  getCellComponentProps,
  separator,
  debugIds,
}: RowProps): any =>
  wrap(
    arrayMap(useCellIds(tableId, rowId, store, trackReorder), (cellId) => (
      <Cell
        {...getProps(getCellComponentProps, cellId)}
        key={cellId}
        tableId={tableId}
        rowId={rowId}
        cellId={cellId}
        store={store}
        debugIds={debugIds}
      />
    )),
    separator,
    debugIds,
    rowId,
  );

export const TableView: typeof TableViewDecl = ({
  tableId,
  store,
  trackReorder,
  rowComponent: Row = RowView,
  getRowComponentProps,
  separator,
  debugIds,
}: TableProps): any =>
  wrap(
    arrayMap(useRowIds(tableId, store, trackReorder), (rowId) => (
      <Row
        {...getProps(getRowComponentProps, rowId)}
        key={rowId}
        tableId={tableId}
        rowId={rowId}
        store={store}
        debugIds={debugIds}
      />
    )),
    separator,
    debugIds,
    tableId,
  );

export const TablesView: typeof TablesViewDecl = ({
  store,
  trackReorder,
  tableComponent: Table = TableView,
  getTableComponentProps,
  separator,
  debugIds,
}: TablesProps): any =>
  wrap(
    arrayMap(useTableIds(store, trackReorder), (tableId) => (
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
  const resolvedIndexes = useIndexesOrIndexesId(indexes);
  const store = resolvedIndexes?.getStore();
  const tableId = resolvedIndexes?.getTableId(indexId);
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
  const [resolvedRelationships, store] = useRelationshipsStoreTableId(
    relationships as RelationshipsOrRelationshipsId,
  );
  const tableId = resolvedRelationships?.getRemoteTableId(relationshipId);
  const rowId = useRemoteRowId(
    relationshipId,
    localRowId,
    resolvedRelationships,
  );
  return wrap(
    isUndefined(tableId) || isUndefined(rowId) ? null : (
      <Row
        {...getProps(getRowComponentProps, rowId as Id)}
        key={rowId}
        tableId={tableId}
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
