/* @jsxImportSource solid-js */
import type {
  TablesProps,
} from '../@types/ui-solid/index.d.ts';
import type {Id} from '../@types/index.d.ts';
import {arrayMap} from '../common/array.ts';
import {getProps, getValue} from '../common/solid.ts';
import {wrap} from './common/wrap.tsx';
import {useTableIds} from './hooks.ts';
import {TableView} from './TableView.tsx';

export const TablesView = ({
  store,
  tableComponent: Table = TableView,
  getTableComponentProps,
  separator,
  debugIds,
}: TablesProps): any => {
  const tableIds = useTableIds(store) as any;
  return () =>
    wrap(
      arrayMap(getValue(tableIds) as Id[], (tableId: Id) => (
        <Table
          {...getProps(getTableComponentProps, tableId)}
          tableId={tableId}
          store={store}
          debugIds={debugIds}
        />
      )),
      separator,
    );
};
