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

/// DomProps
export type DomProps = {
  /// DomProps.className
  className?: string;
};

/// CellInHtmlTd
export function CellInHtmlTd(props: CellProps & DomProps): ComponentReturnType;

/// RowInHtmlTr
export function RowInHtmlTr(props: RowProps & DomProps): ComponentReturnType;

/// SortedTableInHtmlTable
export function SortedTableInHtmlTable(
  props: SortedTableProps & DomProps,
): ComponentReturnType;

/// TableInHtmlTable
export function TableInHtmlTable(
  props: TableProps & DomProps,
): ComponentReturnType;

/// ValueInHtmlTr
export function ValueInHtmlTr(
  props: ValueProps & DomProps,
): ComponentReturnType;

/// ValuesInHtmlTable
export function ValuesInHtmlTable(
  props: ValuesProps & DomProps,
): ComponentReturnType;
