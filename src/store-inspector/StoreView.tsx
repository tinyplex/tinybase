/** @jsx createElement */

import {TablesView, useCell, useSetCellCallback} from '../ui-react';
import {CURRENT_TARGET} from '../common/strings';
import {Id} from '../types/common';
import {SortedTableInHtmlTable} from '../ui-react/dom';
import {Store} from '../types/store';
import {StoreProp} from './types';
import {TableProps} from '../types/ui-react';
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
  s: inspectorStore,
}: {readonly storeId: Id; readonly store: Store} & StoreProp) => {
  const open = !!useCell('stores', storeId, 'open', inspectorStore);
  const handleToggle = useSetCellCallback(
    'stores',
    storeId,
    'open',
    (event: React.SyntheticEvent<HTMLDetailsElement>) =>
      event[CURRENT_TARGET].open,
    [],
    inspectorStore,
  );
  return (
    <details open={open} onToggle={handleToggle}>
      <summary>Store: {storeId}</summary>
      <TablesView store={store} tableComponent={TableView} />
    </details>
  );
};
