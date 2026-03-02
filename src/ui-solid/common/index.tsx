/* @jsxImportSource solid-js */
import type {JSXElement} from 'solid-js';
import type {CheckpointIds} from '../../@types/checkpoints/index.d.ts';
import type {Id, Ids} from '../../@types/common/index.d.ts';
import type {
  BackwardCheckpointsProps,
  CurrentCheckpointProps,
  ForwardCheckpointsProps,
  LinkedRowsProps,
  LocalRowsProps,
  RelationshipsOrRelationshipsId,
  RemoteRowProps,
  ResultTableProps,
  TableProps,
} from '../../@types/ui-solid/index.d.ts';
import {arrayMap} from '../../common/array.ts';
import {
  getProps,
  getRelationshipsStoreTableIds,
  getValue,
} from '../../common/solid.ts';
import {CheckpointView} from '../CheckpointView.tsx';
import {ThingsByOffset} from '../context.ts';
import {
  useCheckpointIds,
  useCheckpointsOrCheckpointsById,
  useRelationshipsOrRelationshipsById,
} from '../hooks.ts';
import {ResultRowView} from '../ResultRowView.tsx';
import {RowView} from '../RowView.tsx';
import {wrap} from './wrap.tsx';

export type ThingsById<ThingsByOffset> = {
  [Offset in keyof ThingsByOffset]: {[id: Id]: ThingsByOffset[Offset]};
};
export type ExtraThingsById = ThingsById<ThingsByOffset>;

export const tableView = (
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
  () =>
    wrap(
      arrayMap(getValue(rowIds as any) as Ids, (rowId) => (
        <Row
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

export const resultTableView = (
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
  () =>
    wrap(
      arrayMap(getValue(rowIds as any) as Ids, (rowId) => (
        <ResultRow
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

export const useComponentPerRow = (
  {
    relationshipId,
    relationships,
    rowComponent: Row = RowView,
    getRowComponentProps,
    separator,
    debugIds,
  }: (RemoteRowProps | LocalRowsProps | LinkedRowsProps) & {
    separator?: JSXElement | string;
  },
  getRowIdsHook: (
    relationshipId: Id,
    rowId: Id,
    relationships: RelationshipsOrRelationshipsId | undefined,
  ) => Ids,
  rowId: Id,
) => {
  const resolvedRelationships =
    useRelationshipsOrRelationshipsById(relationships);
  const rowIds = getRowIdsHook(
    relationshipId,
    rowId,
    resolvedRelationships as any,
  ) as any;
  return () => {
    const [_relationship, store, localTableId] = getRelationshipsStoreTableIds(
      getValue(resolvedRelationships as any),
      relationshipId,
    );
    return wrap(
      arrayMap(getValue(rowIds) as Ids, (localRowId) => (
        <Row
          {...getProps(getRowComponentProps, localRowId)}
          tableId={localTableId as Id}
          rowId={localRowId}
          store={store}
          debugIds={debugIds}
        />
      )),
      separator,
      debugIds,
      rowId,
    );
  };
};

export const getUseCheckpointView =
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
    separator?: JSXElement | string;
  }): any => {
    const resolvedCheckpoints = useCheckpointsOrCheckpointsById(checkpoints);
    const checkpointIds = useCheckpointIds(resolvedCheckpoints) as any;
    return () =>
      wrap(
        arrayMap(
          getCheckpoints(getValue(checkpointIds) as CheckpointIds),
          (checkpointId: Id) => (
            <Checkpoint
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
