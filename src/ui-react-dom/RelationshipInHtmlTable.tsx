import type {Id, Store} from '../@types/index.js';
import type {
  HtmlTableProps,
  RelationshipInHtmlTableProps,
} from '../@types/ui-react-dom/index.js';
import type {RowProps} from '../@types/ui-react/index.d.ts';
import {arrayMap} from '../common/array.ts';
import {objToArray} from '../common/obj.ts';
import {isUndefined} from '../common/other.ts';
import {getProps, getRelationshipsStoreTableIds} from '../common/react.ts';
import {DOT, strSplit} from '../common/strings.ts';
import {
  useRelationshipsOrRelationshipsById,
  useRemoteRowId,
  useRowIds,
  useTableCellIds,
} from '../ui-react/hooks.ts';
import {CellView} from '../ui-react/index.ts';
import {EditableCellView} from './EditableCellView.tsx';
import {
  extraHeaders,
  extraRowCells,
  RelationshipInHtmlRowParams,
  useCells,
  useParams,
} from './common.tsx';

const useDottedCellIds = (tableId: Id | undefined, store: Store | undefined) =>
  arrayMap(
    useTableCellIds(tableId as Id, store),
    (cellId) => tableId + DOT + cellId,
  );

export const RelationshipInHtmlRow = ({
  localRowId,
  params: [
    idColumn,
    cells,
    localTableId,
    remoteTableId,
    relationshipId,
    relationships,
    store,
    extraCellsBefore,
    extraCellsAfter,
  ],
}: {
  readonly localRowId: Id;
  readonly params: RelationshipInHtmlRowParams;
}) => {
  const remoteRowId = useRemoteRowId(
    relationshipId,
    localRowId,
    relationships,
  ) as Id;
  const rowProps: RowProps = {
    tableId: localTableId ?? '',
    rowId: localRowId,
    store,
  };
  return (
    <tr>
      {extraRowCells(extraCellsBefore, rowProps)}
      {idColumn === false ? null : (
        <>
          <th>{localRowId}</th>
          <th>{remoteRowId}</th>
        </>
      )}
      {objToArray(
        cells,
        ({component: CellView, getComponentProps}, compoundCellId) => {
          const [tableId, cellId] = strSplit(compoundCellId, DOT, 2);
          const rowId =
            tableId === localTableId
              ? localRowId
              : tableId === remoteTableId
                ? remoteRowId
                : null;
          return isUndefined(rowId) ? null : (
            <td key={compoundCellId}>
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
      {extraRowCells(extraCellsAfter, rowProps, 1)}
    </tr>
  );
};

export const RelationshipInHtmlTable = ({
  relationshipId,
  relationships,
  editable,
  customCells,
  extraCellsBefore,
  extraCellsAfter,
  className,
  headerRow,
  idColumn = true,
}: RelationshipInHtmlTableProps & HtmlTableProps): any => {
  const [resolvedRelationships, store, localTableId, remoteTableId] =
    getRelationshipsStoreTableIds(
      useRelationshipsOrRelationshipsById(relationships),
      relationshipId,
    );
  const cells = useCells(
    [
      ...useDottedCellIds(localTableId, store),
      ...useDottedCellIds(remoteTableId, store),
    ],
    customCells,
    editable ? EditableCellView : CellView,
  );
  const params = useParams(
    idColumn,
    cells,
    localTableId,
    remoteTableId,
    relationshipId,
    resolvedRelationships,
    store,
    extraCellsBefore,
    extraCellsAfter,
  );
  return (
    <table className={className}>
      {headerRow === false ? null : (
        <thead>
          <tr>
            {extraHeaders(extraCellsBefore)}
            {idColumn === false ? null : (
              <>
                <th>{localTableId}.Id</th>
                <th>{remoteTableId}.Id</th>
              </>
            )}
            {objToArray(cells, ({label}, cellId) => (
              <th key={cellId}>{label}</th>
            ))}
            {extraHeaders(extraCellsAfter, 1)}
          </tr>
        </thead>
      )}
      <tbody>
        {arrayMap(useRowIds(localTableId as Id, store), (localRowId) => (
          <RelationshipInHtmlRow
            key={localRowId}
            localRowId={localRowId}
            params={params}
          />
        ))}
      </tbody>
    </table>
  );
};
