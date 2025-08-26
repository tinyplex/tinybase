import type {ReactElement} from 'react';
import type {CheckpointIds} from '../@types/checkpoints/index.js';
import type {Id, Ids} from '../@types/common/index.js';
import type {
  BackwardCheckpointsProps,
  CurrentCheckpointProps,
  ForwardCheckpointsProps,
  LinkedRowsProps,
  LocalRowsProps,
  RelationshipsOrRelationshipsId,
  RemoteRowProps,
  ResultTableProps,
  StoreOrStoreId,
  TableProps,
} from '../@types/ui-react/index.js';
import {arrayMap} from '../common/array.ts';
import {isArray, isUndefined} from '../common/other.ts';
import {getProps, getRelationshipsStoreTableIds} from '../common/react.ts';
import {CheckpointView} from './CheckpointView.tsx';
import {ContextValue, ThingsByOffset} from './context.ts';
import {
  useCellIds,
  useCheckpointIds,
  useCheckpointsOrCheckpointsById,
  useRelationshipsOrRelationshipsById,
} from './hooks.ts';
import {ResultRowView} from './ResultRowView.tsx';
import {RowView} from './RowView.tsx';

export enum Offsets {
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
export type ExtraThingsById = ThingsById<ThingsByOffset>;

export const mergeParentThings = <Offset extends Offsets>(
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

export const useComponentPerRow = (
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

export const wrap = (
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

export const useCustomOrDefaultCellIds = (
  customCellIds: Ids | undefined,
  tableId: Id,
  rowId: Id,
  store?: StoreOrStoreId,
): Ids => {
  const defaultCellIds = useCellIds(tableId, rowId, store);
  return customCellIds ?? defaultCellIds;
};
