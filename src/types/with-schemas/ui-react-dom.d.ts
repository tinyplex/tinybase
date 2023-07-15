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

/// HtmlTableProps
export type HtmlTableProps = {
  /// HtmlTableProps.headerRow
  headerRow?: boolean;
  /// HtmlTableProps.idColumn
  idColumn?: boolean;
};

/// HtmlTrProps
export type HtmlTrProps = {
  /// HtmlTrProps.idColumn
  idColumn?: boolean;
};

export type WithSchemas<Schemas extends OptionalSchemas> = {
  /// CellInHtmlTd
  CellInHtmlTd: (props: CellProps<Schemas> & HtmlProps) => ComponentReturnType;

  /// RowInHtmlTr
  RowInHtmlTr: (
    props: RowProps<Schemas> & HtmlTrProps & HtmlProps,
  ) => ComponentReturnType;

  /// SortedTableInHtmlTable
  SortedTableInHtmlTable: (
    props: SortedTableProps<Schemas> & HtmlTableProps & HtmlProps,
  ) => ComponentReturnType;

  /// TableInHtmlTable
  TableInHtmlTable: (
    props: TableProps<Schemas> & HtmlTableProps & HtmlProps,
  ) => ComponentReturnType;

  /// ValueInHtmlTr
  ValueInHtmlTr: (
    props: ValueProps<Schemas> & HtmlTrProps & HtmlProps,
  ) => ComponentReturnType;

  /// ValuesInHtmlTable
  ValuesInHtmlTable: (
    props: ValuesProps<Schemas> & HtmlTableProps & HtmlProps,
  ) => ComponentReturnType;
};
