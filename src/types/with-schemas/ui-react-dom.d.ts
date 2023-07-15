/// ui-react-dom

import {
  CellProps,
  ComponentReturnType,
  RowProps,
  SortedTableProps,
  TableProps,
  ValueProps,
  ValuesProps,
} from './internal/ui-react';
import {OptionalSchemas} from '../store';

/// DomProps
export type DomProps = {
  /// DomProps.className
  className?: string;
};

export type WithSchemas<Schemas extends OptionalSchemas> = {
  TableView: (props: TableProps<Schemas> & DomProps) => ComponentReturnType;

  /// CellInHtmlTd
  CellInHtmlTd: (props: CellProps<Schemas> & DomProps) => ComponentReturnType;

  /// RowInHtmlTr
  RowInHtmlTr: (props: RowProps<Schemas> & DomProps) => ComponentReturnType;

  /// SortedTableInHtmlTable
  SortedTableInHtmlTable: (
    props: SortedTableProps<Schemas> & DomProps,
  ) => ComponentReturnType;

  /// TableInHtmlTable
  TableInHtmlTable: (
    props: TableProps<Schemas> & DomProps,
  ) => ComponentReturnType;

  /// ValueInHtmlTr
  ValueInHtmlTr: (props: ValueProps<Schemas> & DomProps) => ComponentReturnType;

  /// ValuesInHtmlTable
  ValuesInHtmlTable: (
    props: ValuesProps<Schemas> & DomProps,
  ) => ComponentReturnType;
};
