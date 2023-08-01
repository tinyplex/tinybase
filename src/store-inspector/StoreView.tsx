/** @jsx createElement */

import {Id} from '../types/common';
import {SortedTableInHtmlTable} from '../ui-react/dom';
import {Store} from '../types/store';
import {StoreProp} from './types';
import {TableProps} from '../types/ui-react';
import {TablesView} from '../ui-react';
import {createElement} from '../ui-react/common';

export const TableView = (props: TableProps) => (
  <details>
    <summary>Table: {props.tableId}</summary>
    <SortedTableInHtmlTable
      {...props}
      limit={10}
      paginator={true}
      sortOnClick={true}
    />
  </details>
);

export const StoreView = ({
  storeId,
  store,
  s: _,
}: {readonly storeId: Id; readonly store: Store} & StoreProp) => {
  return (
    <details>
      <summary>Store: {storeId}</summary>
      <TablesView store={store} tableComponent={TableView} />
    </details>
  );
};
