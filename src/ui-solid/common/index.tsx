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
import type {MaybeAccessor} from '../../common/solid.ts';
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
} from '../primitives.ts';
import {ResultRowView} from '../ResultRowView.tsx';
import {RowView} from '../RowView.tsx';
import {renderView, wrap} from './wrap.tsx';

export type ThingsById<ThingsByOffset> = {
  [Offset in keyof ThingsByOffset]: {[id: Id]: ThingsByOffset[Offset]};
};
export type ExtraThingsById = ThingsById<ThingsByOffset>;

export const tableView = (
  props: TableProps,
  rowIds: MaybeAccessor<Ids>,
): JSXElement =>
  renderView(() => {
    const Row = props.rowComponent ?? RowView;
    return wrap(
      arrayMap(getValue(rowIds), (rowId) => (
        <Row
          {...getProps(props.getRowComponentProps, rowId)}
          tableId={props.tableId}
          rowId={rowId}
          customCellIds={props.customCellIds}
          store={props.store}
          debugIds={props.debugIds}
        />
      )),
      props.separator,
      props.debugIds,
      props.tableId,
    );
  });

export const resultTableView = (
  props: ResultTableProps,
  rowIds: MaybeAccessor<Ids>,
): JSXElement =>
  renderView(() => {
    const ResultRow = props.resultRowComponent ?? ResultRowView;
    return wrap(
      arrayMap(getValue(rowIds), (rowId) => (
        <ResultRow
          {...getProps(props.getResultRowComponentProps, rowId)}
          queryId={props.queryId}
          rowId={rowId}
          queries={props.queries}
          debugIds={props.debugIds}
        />
      )),
      props.separator,
      props.debugIds,
      props.queryId,
    );
  });

export const useComponentPerRow = (
  props: (RemoteRowProps | LocalRowsProps | LinkedRowsProps) & {
    separator?: JSXElement | string;
  },
  getRowIdsHook: (
    relationshipId: Id | (() => Id),
    rowId: Id | (() => Id),
    relationships: MaybeAccessor<RelationshipsOrRelationshipsId | undefined>,
  ) => () => Ids,
  rowId: Id | (() => Id),
) => {
  const resolvedRelationships = useRelationshipsOrRelationshipsById(
    () => props.relationships,
  );
  const rowIds = getRowIdsHook(
    () => props.relationshipId,
    rowId,
    resolvedRelationships,
  );
  return renderView(() => {
    const Row = props.rowComponent ?? RowView;
    const [_relationship, store, localTableId] = getRelationshipsStoreTableIds(
      getValue(resolvedRelationships),
      props.relationshipId,
    );
    return wrap(
      arrayMap(getValue(rowIds) as Ids, (localRowId) => (
        <Row
          {...getProps(props.getRowComponentProps, localRowId)}
          tableId={localTableId as Id}
          rowId={localRowId}
          store={store}
          debugIds={props.debugIds}
        />
      )),
      props.separator,
      props.debugIds,
      getValue(rowId),
    );
  });
};

export const getUseCheckpointView =
  (getCheckpoints: (checkpointIds: CheckpointIds) => Ids) =>
  (
    props: (
      | BackwardCheckpointsProps
      | CurrentCheckpointProps
      | ForwardCheckpointsProps
    ) & {
      separator?: JSXElement | string;
    },
  ): JSXElement => {
    const resolvedCheckpoints = useCheckpointsOrCheckpointsById(
      () => props.checkpoints,
    );
    const checkpointIds = useCheckpointIds(resolvedCheckpoints);
    return renderView(() => {
      const Checkpoint = props.checkpointComponent ?? CheckpointView;
      return wrap(
        arrayMap(
          getCheckpoints(getValue(checkpointIds) as CheckpointIds),
          (checkpointId: Id) => (
            <Checkpoint
              {...getProps(
                props.getCheckpointComponentProps,
                checkpointId as Id,
              )}
              checkpoints={getValue(resolvedCheckpoints)}
              checkpointId={checkpointId}
              debugIds={props.debugIds}
            />
          ),
        ),
        props.separator,
      );
    });
  };
