import type {Id} from '../@types/common/index.d.ts';
import type {
  CellProps,
  TableProps,
  TablesProps,
} from '../@types/ui-react/index.d.ts';
import {arrayMap} from '../common/array.ts';
import {
  SORT_CELL,
  STATE_TABLE,
  getUniqueId,
  sortedIdsMap,
} from '../common/inspector/common.ts';
import type {StoreProp} from '../common/inspector/types.ts';
import {jsonParse, jsonStringWithMap} from '../common/json.ts';
import {objNew} from '../common/obj.ts';
import {isEmpty} from '../common/other.ts';
import {TABLE, TABLES} from '../common/strings.ts';
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
  useTableIds,
} from '../ui-react/index.ts';
import {Details} from './Details.tsx';
import {
  CellActions,
  RowActions,
  TableActions1,
  TableActions2,
  TablesActions,
} from './actions/tables.tsx';
import {useEditable} from './editable.ts';

const rowActions = [{label: '', component: RowActions}];

const EditableCellViewWithActions = (props: CellProps) => (
  <>
    <EditableCellView {...props} />
    {useHasCell(props.tableId, props.rowId, props.cellId, props.store) && (
      <CellActions {...props} />
    )}
  </>
);

const TableView = ({
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

export const TablesView = ({
  store,
  storeId,
  s,
}: TablesProps & {readonly storeId?: Id} & StoreProp) => {
  const uniqueId = getUniqueId('ts', storeId);
  const [editable, handleEditable] = useEditable(uniqueId, s);
  const tableIds = useTableIds(store);
  return (
    <Details
      uniqueId={uniqueId}
      title={TABLES}
      editable={editable}
      handleEditable={handleEditable}
      s={s}
    >
      {isEmpty(tableIds) ? (
        <p>No tables.</p>
      ) : (
        sortedIdsMap(tableIds, (tableId) => (
          <TableView
            store={store}
            storeId={storeId}
            tableId={tableId}
            s={s}
            key={tableId}
          />
        ))
      )}
      {editable ? <TablesActions store={store} /> : null}
    </Details>
  );
};
