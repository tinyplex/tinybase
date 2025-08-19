import type {Id} from '../@types/common/index.d.ts';
import type {
  RowProps,
  TableProps,
  ValueProps,
  ValuesProps,
} from '../@types/ui-react/index.d.ts';
import {arrayIsEmpty} from '../common/array.ts';
import {jsonParse, jsonStringWithMap} from '../common/json.ts';
import {isUndefined} from '../common/other.ts';
import {DEFAULT, TABLE, VALUES} from '../common/strings.ts';
import {
  SortedTableInHtmlTable,
  ValuesInHtmlTable,
} from '../ui-react-dom/index.tsx';
import {
  useCell,
  useDelRowCallback,
  useDelValueCallback,
  useSetCellCallback,
  useSetRowCallback,
  useSetValueCallback,
  useStore,
  useTableIds,
  useValueIds,
} from '../ui-react/index.ts';
import {Details} from './Details.tsx';
import {
  SORT_CELL,
  STATE_TABLE,
  getUniqueId,
  sortedIdsMap,
  useEditable,
} from './common.ts';
import type {StoreProp} from './types.ts';

const clonedId = (oldId: Id, exists: (newId: Id) => boolean) => {
  let newId;
  let suffix = 1;
  while (
    exists((newId = oldId + ' (copy' + (suffix > 1 ? ' ' + suffix : '') + ')'))
  ) {
    suffix++;
  }
  return newId;
};

const RowActions = ({tableId, rowId, store}: RowProps) => {
  const handleClone = useSetRowCallback(
    tableId,
    (_, store) => clonedId(rowId, (rowId) => store.hasRow(tableId, rowId)),
    (_, store) => store.getRow(tableId, rowId)!,
  );
  const handleDelete = useDelRowCallback(tableId, rowId, store);
  return (
    <>
      <img onClick={handleClone} title="Clone Row" className="clone" />
      <img onClick={handleDelete} title="Delete Row" className="delete" />
    </>
  );
};

const rowActions = [{label: '', component: RowActions}];

const ValueActions = ({valueId, store}: ValueProps) => {
  const handleClone = useSetValueCallback(
    (_, store) => clonedId(valueId, store.hasValue),
    (_, store) => store.getValue(valueId)!,
  );
  const handleDelete = useDelValueCallback(valueId, store);
  return (
    <>
      <img onClick={handleClone} title="Clone Value" className="clone" />
      <img onClick={handleDelete} title="Delete Value" className="delete" />
    </>
  );
};
const valueActions = [{label: '', component: ValueActions}];

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
  return (
    <Details
      uniqueId={uniqueId}
      summary={TABLE + ': ' + tableId}
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
      />
    </Details>
  );
};

const ValuesView = ({
  store,
  storeId,
  s,
}: ValuesProps & {readonly storeId?: Id} & StoreProp) => {
  const uniqueId = getUniqueId('v', storeId);
  const [editable, handleEditable] = useEditable(uniqueId, s);
  return arrayIsEmpty(useValueIds(store)) ? null : (
    <Details
      uniqueId={uniqueId}
      summary={VALUES}
      editable={editable}
      handleEditable={handleEditable}
      s={s}
    >
      <ValuesInHtmlTable
        store={store}
        editable={editable}
        extraCellsAfter={editable ? valueActions : []}
      />
    </Details>
  );
};

export const StoreView = ({
  storeId,
  s,
}: {readonly storeId?: Id} & StoreProp) => {
  const store = useStore(storeId);
  const tableIds = useTableIds(store);
  return isUndefined(store) ? null : (
    <Details
      uniqueId={getUniqueId('s', storeId)}
      summary={
        (store.isMergeable() ? 'Mergeable' : '') +
        'Store: ' +
        (storeId ?? DEFAULT)
      }
      s={s}
    >
      <ValuesView storeId={storeId} store={store} s={s} />
      {sortedIdsMap(tableIds, (tableId) => (
        <TableView
          store={store}
          storeId={storeId}
          tableId={tableId}
          s={s}
          key={tableId}
        />
      ))}
    </Details>
  );
};
