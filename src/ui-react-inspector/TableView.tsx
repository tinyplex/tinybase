import type {Id} from '../@types/common/index.d.ts';
import type {CellProps, TableProps} from '../@types/ui-react/index.d.ts';
import {arrayMap} from '../common/array.ts';
import {jsonParse, jsonStringWithMap} from '../common/json.ts';
import {objNew} from '../common/obj.ts';
import {TABLE} from '../common/strings.ts';
import {
  EditableCellView,
  SortedTableInHtmlTable,
} from '../ui-react-dom/index.tsx';
import {
  CellView,
  useCell,
  useHasCell,
  useSetCellCallback,
  useTableCellIds,
} from '../ui-react/index.ts';
import {Details} from './Details.tsx';
import {CellActions} from './actions/cell.tsx';
import {rowActions, TableActions1, TableActions2} from './actions/tables.tsx';
import {getUniqueId, SORT_CELL, STATE_TABLE, useEditable} from './common.ts';
import type {StoreProp} from './types.ts';

const EditableCellViewWithActions = (props: CellProps) => (
  <>
    <EditableCellView {...props} />
    {useHasCell(props.tableId, props.rowId, props.cellId, props.store) && (
      <CellActions {...props} />
    )}
  </>
);

export const TableView = ({
  tableId,
  store,
  storeId,
  s,
}: TableProps & {readonly storeId?: Id} & StoreProp) => {
  const uniqueId = getUniqueId('t', storeId, tableId);
  const [cellId, descending, offset] = jsonParse(
    (useCell(STATE_TABLE, uniqueId, SORT_CELL, s) as string) ?? '[]',
  );
  const handleChange = useSetCellCallback(
    STATE_TABLE,
    uniqueId,
    SORT_CELL,
    jsonStringWithMap,
    [],
    s,
  );
  const [editable, handleEditable] = useEditable(uniqueId, s);
  const CellComponent = editable ? EditableCellViewWithActions : CellView;
  return (
    <Details
      uniqueId={uniqueId}
      title={TABLE + ': ' + tableId}
      editable={editable}
      handleEditable={handleEditable}
      s={s}
    >
      <SortedTableInHtmlTable
        tableId={tableId}
        store={store}
        cellId={cellId}
        descending={descending}
        offset={offset}
        limit={10}
        paginator={true}
        sortOnClick={true}
        onChange={handleChange}
        editable={editable}
        extraCellsAfter={editable ? rowActions : []}
        customCells={objNew(
          arrayMap(useTableCellIds(tableId, store), (cellId) => [
            cellId,
            {label: cellId, component: CellComponent},
          ]),
        )}
      />
      {editable ? (
        <div className="actions">
          <div>
            <TableActions1 tableId={tableId} store={store} />
          </div>
          <div>
            <TableActions2 tableId={tableId} store={store} />
          </div>
        </div>
      ) : null}
    </Details>
  );
};
