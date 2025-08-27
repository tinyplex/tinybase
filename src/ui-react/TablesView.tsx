import type {
  TablesProps,
  TablesView as TablesViewDecl,
} from '../@types/ui-react/index.js';
import {arrayMap} from '../common/array.ts';
import {getProps} from '../common/react.ts';
import {wrap} from './common/wrap.tsx';
import {useTableIds} from './hooks.ts';
import {TableView} from './TableView.tsx';

export const TablesView: typeof TablesViewDecl = ({
  store,
  tableComponent: Table = TableView,
  getTableComponentProps,
  separator,
  debugIds,
}: TablesProps): any =>
  wrap(
    arrayMap(useTableIds(store), (tableId) => (
      <Table
        key={tableId}
        {...getProps(getTableComponentProps, tableId)}
        tableId={tableId}
        store={store}
        debugIds={debugIds}
      />
    )),
    separator,
  );
