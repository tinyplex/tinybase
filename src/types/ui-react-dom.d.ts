/// ui-react-dom

import {
  CellProps,
  ComponentReturnType,
  RowProps,
  SortedTableProps,
  TableProps,
} from './ui-react';

/// DomTableCellView
export function DomTableCellView(props: CellProps): ComponentReturnType;

/// DomTableRowView
export function DomTableRowView(props: RowProps): ComponentReturnType;

/// DomSortedTableView
export function DomSortedTableView(
  props: SortedTableProps,
): ComponentReturnType;

/// DomTableView
export function DomTableView(props: TableProps): ComponentReturnType;
