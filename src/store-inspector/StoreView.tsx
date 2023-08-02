/** @jsx createElement */

import {ExtraProps, TableProps, ValuesProps} from '../types/ui-react';
import {SortedTableInHtmlTable, ValuesInHtmlTable} from '../ui-react/dom';
import {arrayIsEmpty, arrayMap} from '../common/array';
import {getUniqueId, useOpen} from './common';
import {useStore, useTableIds, useValueIds} from '../ui-react';
import {DEFAULT} from '../common/strings';
import {Id} from '../types/common';
import {StoreProp} from './types';
import {createElement} from '../ui-react/common';
import {isUndefined} from '../common/other';

const StoreTableView = ({
  storeId,
  store,
  tableId,
  s,
}: TableProps & ExtraProps) => {
  const [open, setOpen] = useOpen('table', getUniqueId(storeId, tableId), s);
  return (
    <details open={open} onToggle={setOpen}>
      <summary>Table: {tableId}</summary>
      <SortedTableInHtmlTable
        tableId={tableId}
        store={store}
        limit={10}
        paginator={true}
        sortOnClick={true}
      />
    </details>
  );
};

const StoreValuesView = ({storeId, store, s}: ValuesProps & ExtraProps) => {
  const [open, setOpen] = useOpen('values', getUniqueId(storeId), s);
  return arrayIsEmpty(useValueIds(store)) ? null : (
    <details open={open} onToggle={setOpen}>
      <summary>Values</summary>
      <ValuesInHtmlTable store={store} />
    </details>
  );
};

export const StoreView = ({
  storeId,
  s,
}: {readonly storeId?: Id} & StoreProp) => {
  const store = useStore(storeId);
  const [open, setOpen] = useOpen('store', getUniqueId(storeId), s);
  const tableIds = useTableIds(store);

  return isUndefined(store) ? null : (
    <details open={open} onToggle={setOpen}>
      <summary>Store: {storeId ?? DEFAULT}</summary>
      <StoreValuesView storeId={storeId} store={store} s={s} />
      {arrayMap(tableIds, (tableId) => (
        <StoreTableView
          storeId={storeId}
          tableId={tableId}
          store={store}
          s={s}
        />
      ))}
    </details>
  );
};
