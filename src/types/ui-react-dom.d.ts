/// ui-react-dom

import {
  CellProps,
  ComponentReturnType,
  RowProps,
  SortedTableProps,
  TableProps,
  ValueProps,
  ValuesProps,
} from './ui-react';

/// HtmlProps
export type HtmlProps = {
  /// HtmlProps.className
  className?: string;
};

/// CellInHtmlTd
export function CellInHtmlTd(props: CellProps & HtmlProps): ComponentReturnType;

/// RowInHtmlTr
export function RowInHtmlTr(props: RowProps & HtmlProps): ComponentReturnType;

/// SortedTableInHtmlTable
export function SortedTableInHtmlTable(
  props: SortedTableProps & HtmlProps,
): ComponentReturnType;

/// TableInHtmlTable
export function TableInHtmlTable(
  props: TableProps & HtmlProps,
): ComponentReturnType;

/// ValueInHtmlTr
export function ValueInHtmlTr(
  props: ValueProps & HtmlProps,
): ComponentReturnType;

/// ValuesInHtmlTable
export function ValuesInHtmlTable(
  props: ValuesProps & HtmlProps,
): ComponentReturnType;
