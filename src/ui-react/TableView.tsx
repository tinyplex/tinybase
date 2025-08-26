import type {
  TableProps,
  TableView as TableViewDecl,
} from '../@types/ui-react/index.js';
import {tableView} from './common.tsx';
import {useRowIds} from './hooks.ts';

export const TableView: typeof TableViewDecl = (props: TableProps): any =>
  tableView(props, useRowIds(props.tableId, props.store));
