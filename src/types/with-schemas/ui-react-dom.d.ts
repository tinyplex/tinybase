/// ui-react-dom

import {
  CellProps,
  ComponentReturnType,
  RowProps,
  SortedTableProps,
  TableProps,
} from './internal/ui-react';
import {OptionalSchemas} from '../store';

export type WithSchemas<Schemas extends OptionalSchemas> = {
  TableView: (props: TableProps<Schemas>) => ComponentReturnType;

  /// DomTableCellView
  DomTableCellView: (props: CellProps<Schemas>) => ComponentReturnType;

  /// DomTableRowView
  DomTableRowView: (props: RowProps<Schemas>) => ComponentReturnType;

  /// DomSortedTableView
  DomSortedTableView: (props: SortedTableProps<Schemas>) => ComponentReturnType;

  /// DomTableView
  DomTableView: (props: TableProps<Schemas>) => ComponentReturnType;
};
