import type {
  TableProps,
  TableView as TableViewDecl,
} from '../@types/ui-react/index.d.ts';
import {tableView} from './common/index.tsx';
import {useRowIds} from './hooks.ts';

export const TableView: typeof TableViewDecl = (props: TableProps): any =>
  tableView(props, useRowIds(props.tableId, props.store));
