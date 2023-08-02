/** @jsx createElement */

import {SortedTableInHtmlTable, ValuesInHtmlTable} from '../ui-react/dom';
import {TableProps, ValuesProps} from '../types/ui-react';
import {arrayIsEmpty, arrayMap} from '../common/array';
import {useStore, useTableIds, useValueIds} from '../ui-react';
import {DEFAULT} from '../common/strings';
import {Details} from './Details';
import {Id} from '../types/common';
import {StoreProp} from './types';
import {createElement} from '../ui-react/common';
import {getUniqueId} from './common';
import {isUndefined} from '../common/other';

const StoreTableView = ({
  tableId,
  store,
  storeId,
  s,
}: TableProps & {readonly storeId?: Id} & StoreProp) => (
  <Details
    uniqueId={getUniqueId('t', storeId, tableId)}
    summary={'Table: ' + tableId}
    s={s}
  >
    <SortedTableInHtmlTable
      tableId={tableId}
      store={store}
      limit={10}
      paginator={true}
      sortOnClick={true}
    />
  </Details>
);

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
