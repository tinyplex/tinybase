/// ui-react-dom

import {
  CellProps,
  ComponentReturnType,
  RowProps,
  SortedTableProps,
  TableProps,
} from './internal/ui-react';
import {OptionalSchemas} from '../store';

/// DomProps
export type DomProps = {
  /// DomProps.className
  className?: string;
};

export type WithSchemas<Schemas extends OptionalSchemas> = {
  TableView: (props: TableProps<Schemas> & DomProps) => ComponentReturnType;

  /// DomTableCellView
  DomTableCellView: (
    props: CellProps<Schemas> & DomProps,
  ) => ComponentReturnType;

  /// DomTableRowView
  DomTableRowView: (props: RowProps<Schemas> & DomProps) => ComponentReturnType;

  /// DomSortedTableView
  DomSortedTableView: (
    props: SortedTableProps<Schemas> & DomProps,
  ) => ComponentReturnType;

  /// DomTableView
  DomTableView: (props: TableProps<Schemas> & DomProps) => ComponentReturnType;
};
