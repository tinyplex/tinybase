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

/// CellInHtmlTd
export function CellInHtmlTd(props: CellProps & HtmlProps): ComponentReturnType;

/// RowInHtmlTr
export function RowInHtmlTr(
  props: RowProps & HtmlTrProps & HtmlProps,
): ComponentReturnType;

/// SortedTableInHtmlTable
export function SortedTableInHtmlTable(
  props: SortedTableProps & HtmlTableProps & HtmlProps,
): ComponentReturnType;

/// TableInHtmlTable
export function TableInHtmlTable(
  props: TableProps & HtmlTableProps & HtmlProps,
): ComponentReturnType;

/// ValueInHtmlTr
export function ValueInHtmlTr(
  props: ValueProps & HtmlTrProps & HtmlProps,
): ComponentReturnType;

/// ValuesInHtmlTable
export function ValuesInHtmlTable(
  props: ValuesProps & HtmlTableProps & HtmlProps,
): ComponentReturnType;
