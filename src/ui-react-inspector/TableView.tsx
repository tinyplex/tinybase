import type {Id} from '../@types/common/index.d.ts';
import type {TableProps} from '../@types/ui-react/index.d.ts';
import {jsonParse, jsonStringWithMap} from '../common/json.ts';
import {TABLE} from '../common/strings.ts';
import {SortedTableInHtmlTable} from '../ui-react-dom/index.tsx';
import {useCell, useSetCellCallback} from '../ui-react/index.ts';
import {Details} from './Details.tsx';
import {rowActions} from './actions/row.tsx';
import {SORT_CELL, STATE_TABLE, getUniqueId, useEditable} from './common.ts';
import type {StoreProp} from './types.ts';

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
      />
    </Details>
  );
};
