/* @jsxImportSource solid-js */
/* eslint-disable solid/reactivity */
import type {JSXElement} from 'solid-js';
import {createMemo} from 'solid-js';
import type {Id, Store} from '../@types/index.d.ts';
import type {
  HtmlTableProps,
  RelationshipInHtmlTableProps,
} from '../@types/ui-solid-dom/index.d.ts';
import type {RowProps} from '../@types/ui-solid/index.d.ts';
import {arrayMap} from '../common/array.ts';
import {objToArray} from '../common/obj.ts';
import {isFalse, isUndefined} from '../common/other.ts';
import type {MaybeAccessor} from '../common/solid.ts';
import {
  getProps,
  getRelationshipsStoreTableIds,
  getValue,
} from '../common/solid.ts';
import {DOT, strSplit} from '../common/strings.ts';
import {CellView} from '../ui-solid/index.ts';
import {
  useRelationshipsOrRelationshipsById,
  useRemoteRowId,
  useRowIds,
  useTableCellIds,
} from '../ui-solid/primitives.ts';
import {EditableCellView} from './EditableCellView.tsx';
import {getParams, useCells} from './common/hooks.tsx';
import {
  extraHeaders,
  extraRowCells,
  RelationshipInHtmlRowParams,
} from './common/index.tsx';

const useDottedCellIds = (
  tableId: MaybeAccessor<Id | undefined>,
  store: MaybeAccessor<Store | undefined>,
) => {
  const cellIds = useTableCellIds(
    () => getValue(tableId) as Id,
    () => getValue(store),
  );
  const dottedCellIds = createMemo(() =>
    arrayMap(cellIds(), (cellId) => getValue(tableId) + DOT + cellId),
  );
  return dottedCellIds;
};

const RelationshipInHtmlRow = (props: {
  readonly localRowId: Id;
  readonly params: RelationshipInHtmlRowParams;
}) => {
  const [
    idColumn,
    cells,
    localTableId,
    remoteTableId,
    relationshipId,
    relationships,
    store,
    extraCellsBefore,
    extraCellsAfter,
  ] = props.params;
  const remoteRowId = useRemoteRowId(
    () => relationshipId,
    () => props.localRowId,
    () => relationships,
  );
  const rowProps: RowProps = {
    tableId: localTableId ?? '',
    rowId: props.localRowId,
    store,
  };
  return (
    <tr>
      {extraRowCells(extraCellsBefore, rowProps)}
      {isFalse(idColumn) ? null : (
        <>
          <th title={props.localRowId}>{props.localRowId}</th>
          <th title={remoteRowId()}>{remoteRowId()}</th>
        </>
      )}
      {objToArray(
        getValue(cells),
        ({component: CellView, getComponentProps}, compoundCellId) => {
          const [tableId, cellId] = strSplit(compoundCellId, DOT, 2);
          const rowId =
            tableId === localTableId
              ? props.localRowId
              : tableId === remoteTableId
                ? remoteRowId()
                : undefined;
          return isUndefined(rowId) ? null : (
            <td>
              <CellView
                {...getProps(getComponentProps, rowId, cellId)}
                store={store}
                tableId={tableId}
                rowId={rowId}
                cellId={cellId}
              />
            </td>
          );
        },
      )}
      {extraRowCells(extraCellsAfter, rowProps)}
    </tr>
  );
};

export const RelationshipInHtmlTable = (
  props: RelationshipInHtmlTableProps & HtmlTableProps,
): JSXElement => {
  const resolvedRelationships = useRelationshipsOrRelationshipsById(
    () => props.relationships,
  );
  const details = createMemo(() =>
    getRelationshipsStoreTableIds(
      resolvedRelationships(),
      props.relationshipId,
    ),
  );
  const localCellIds = useDottedCellIds(
    () => details()[2],
    () => details()[1],
  );
  const remoteCellIds = useDottedCellIds(
    () => details()[3],
    () => details()[1],
  );
  const cellIds = createMemo(() => [...localCellIds(), ...remoteCellIds()]);
  const cells = useCells(
    cellIds,
    () => props.customCells,
    () => (props.editable ? EditableCellView : CellView),
  );
  const rowIds = useRowIds(
    () => details()[2] as Id,
    () => details()[1],
  );
  const content = () => {
    const [relationships, store, localTableId, remoteTableId] = details();
    const params = getParams(
      props.idColumn ?? true,
      cells,
      localTableId,
      remoteTableId,
      props.relationshipId,
      relationships,
      store,
      props.extraCellsBefore,
      props.extraCellsAfter,
    );
    return (
      <table class={props.className}>
        {isFalse(props.headerRow) ? null : (
          <thead>
            <tr>
              {extraHeaders(props.extraCellsBefore)}
              {isFalse(props.idColumn) ? null : (
                <>
                  <th>{localTableId}.Id</th>
                  <th>{remoteTableId}.Id</th>
                </>
              )}
              {objToArray(cells(), (cell) => (
                <th>{cell.label}</th>
              ))}
              {extraHeaders(props.extraCellsAfter)}
            </tr>
          </thead>
        )}
        <tbody>
          {arrayMap(rowIds(), (localRowId) =>
            RelationshipInHtmlRow({localRowId, params}),
          )}
        </tbody>
      </table>
    );
  };
  return <>{content()}</>;
};
