/** @jsx createElement */

import {DEFAULT, TABLE, VALUES} from '../common/strings.ts';
import {
  SORT_CELL,
  STATE_TABLE,
  getUniqueId,
  sortedIdsMap,
  useEditable,
} from './common.ts';
import {
  SortedTableInHtmlTable,
  ValuesInHtmlTable,
} from '../ui-react-dom/index.tsx';
import type {TableProps, ValuesProps} from '../@types/ui-react/index.d.ts';
import {jsonParse, jsonStringWithMap} from '../common/json.ts';
import {
  useCell,
  useSetCellCallback,
  useStore,
  useTableIds,
  useValueIds,
} from '../ui-react/index.ts';
import {Details} from './Details.tsx';
import type {Id} from '../@types/common/index.d.ts';
import type {StoreProp} from './types.ts';
import {arrayIsEmpty} from '../common/array.ts';
import {createElement} from '../common/react.ts';
import {isUndefined} from '../common/other.ts';

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
      <ValuesInHtmlTable store={store} editable={editable} />
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
