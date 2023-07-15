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

/// HtmlProps
export type HtmlProps = {
  /// HtmlProps.className
  className?: string;
};

export type WithSchemas<Schemas extends OptionalSchemas> = {
  TableView: (props: TableProps<Schemas> & HtmlProps) => ComponentReturnType;

  /// CellInHtmlTd
  CellInHtmlTd: (props: CellProps<Schemas> & HtmlProps) => ComponentReturnType;

  /// RowInHtmlTr
  RowInHtmlTr: (props: RowProps<Schemas> & HtmlProps) => ComponentReturnType;

  /// SortedTableInHtmlTable
  SortedTableInHtmlTable: (
    props: SortedTableProps<Schemas> & HtmlProps,
  ) => ComponentReturnType;

  /// TableInHtmlTable
  TableInHtmlTable: (
    props: TableProps<Schemas> & HtmlProps,
  ) => ComponentReturnType;

  /// ValueInHtmlTr
  ValueInHtmlTr: (
    props: ValueProps<Schemas> & HtmlProps,
  ) => ComponentReturnType;

  /// ValuesInHtmlTable
  ValuesInHtmlTable: (
    props: ValuesProps<Schemas> & HtmlProps,
  ) => ComponentReturnType;
};
