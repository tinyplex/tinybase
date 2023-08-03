/** @jsx createElement */

import {SortedTableInHtmlTable, ValuesInHtmlTable} from '../ui-react/dom';
import {TableProps, ValuesProps} from '../types/ui-react';
import {arrayIsEmpty, arrayMap} from '../common/array';
import {useCell, useStore, useTableIds, useValueIds} from '../ui-react';
import {DEFAULT} from '../common/strings';
import {Details} from './Details';
import {Id} from '../types/common';
import {StoreProp} from './types';
import {createElement} from '../ui-react/common';
import {getUniqueId} from './common';
import {isUndefined} from '../common/other';
import {setOrDelCell} from '../common/cell';
import {useCallback} from 'react';

const StoreTableView = ({
  tableId,
  store,
  storeId,
  s,
}: TableProps & {readonly storeId?: Id} & StoreProp) => {
  const uniqueId = getUniqueId('t', storeId, tableId);
  const cellId = useCell('state', uniqueId, 'cellId', s) as Id | undefined;
  const descending = useCell('state', uniqueId, 'descending', s) as boolean;
  const offset = useCell('state', uniqueId, 'offset', s) as number;
  const handleChange = useCallback(
    (cellId: Id | undefined, descending: boolean, offset: number) => {
      setOrDelCell(s, 'state', uniqueId, 'cellId', cellId);
      s.setCell('state', uniqueId, 'descending', descending);
      s.setCell('state', uniqueId, 'offset', offset);
    },
    [s, uniqueId],
  );
  return (
    <Details uniqueId={uniqueId} summary={'Table: ' + tableId} s={s}>
      <SortedTableInHtmlTable
        tableId={tableId}
        store={store}
        cellId={cellId}
        descending={descending}
        limit={10}
        offset={offset}
        paginator={true}
        sortOnClick={true}
        onChange={handleChange}
      />
    </Details>
  );
};

const StoreValuesView = ({
  store,
  storeId,
  s,
}: ValuesProps & {readonly storeId?: Id} & StoreProp) =>
  arrayIsEmpty(useValueIds(store)) ? null : (
    <Details uniqueId={getUniqueId('v', storeId)} summary="Values" s={s}>
      <ValuesInHtmlTable store={store} />
    </Details>
  );

export const StoreView = ({
  storeId,
  s,
}: {readonly storeId?: Id} & StoreProp) => {
  const store = useStore(storeId);
  const tableIds = useTableIds(store);
  return isUndefined(store) ? null : (
    <Details
      uniqueId={getUniqueId('s', storeId)}
      summary={'Store: ' + (storeId ?? DEFAULT)}
      s={s}
    >
      <StoreValuesView storeId={storeId} store={store} s={s} />
      {arrayMap(tableIds, (tableId) => (
        <StoreTableView
          storeId={storeId}
          tableId={tableId}
          store={store}
          s={s}
        />
      ))}
    </Details>
  );
};
