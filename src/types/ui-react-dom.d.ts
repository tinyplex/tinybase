/// ui-react-dom

import {
  CellProps,
  ComponentReturnType,
  RowProps,
  SortedTableProps,
  TableProps,
} from './ui-react';

/// DomProps
export type DomProps = {
  /// DomProps.className
  className?: string;
};

/// DomTableCellView
export function DomTableCellView(
  props: CellProps & DomProps,
): ComponentReturnType;

/// DomTableRowView
export function DomTableRowView(
  props: RowProps & DomProps,
): ComponentReturnType;

/// DomSortedTableView
export function DomSortedTableView(
  props: SortedTableProps & DomProps,
): ComponentReturnType;

/// DomTableView
export function DomTableView(props: TableProps & DomProps): ComponentReturnType;
