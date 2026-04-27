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

export const TablesView = (props: TablesProps): any => {
  const tableIds = useTableIds((() => props.store) as any) as any;
  return () => {
    const Table = props.tableComponent ?? TableView;
    return wrap(
      arrayMap(getValue(tableIds) as Id[], (tableId: Id) => (
        <Table
          {...getProps(props.getTableComponentProps, tableId)}
          tableId={tableId}
          store={props.store}
          debugIds={props.debugIds}
        />
      )),
      props.separator,
    );
  };
};
