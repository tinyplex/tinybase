/** @jsx createElement */

import {DEFAULT, TABLE, VALUES} from '../common/strings';
import {
  SORT_CELL,
  STATE_TABLE,
  getUniqueId,
  sortedIdsMap,
  useEditable,
} from './common';
import {SortedTableInHtmlTable, ValuesInHtmlTable} from '../ui-react/dom';
import {TableProps, ValuesProps} from '../types/ui-react';
import {jsonParse, jsonStringWithMap} from '../common/json';
import {
  useCell,
  useSetCellCallback,
  useStore,
  useTableIds,
  useValueIds,
} from '../ui-react';
import {Details} from './Details';
import {Id} from '../types/common';
import {StoreProp} from './types';
import {arrayIsEmpty} from '../common/array';
import {createElement} from '../ui-react/common';
import {isUndefined} from '../common/other';

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
        ('merge' in store ? 'Mergeable' : '') + 'Store: ' + (storeId ?? DEFAULT)
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
