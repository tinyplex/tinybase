/// ui-react-dom

import {
  CellProps,
  ComponentReturnType,
  ExtraProps,
  RowProps,
  SortedTableProps,
  StoreOrStoreId,
  TableProps,
  ValueProps,
} from './ui-react';
import {ComponentType} from 'react';
import {Id} from './common';

// ValuesInHtmlTableProps
export type ValuesInHtmlTableProps = {
  /// ValuesInHtmlTableProps.store
  readonly store?: StoreOrStoreId;
  /// ValuesInHtmlTableProps.valueComponent
  readonly valueComponent?: ComponentType<ValueProps>;
  /// ValuesInHtmlTableProps.getValueComponentProps
  readonly getValueComponentProps?: (valueId: Id) => ExtraProps;
  /// ValuesInHtmlTableProps.className
  readonly className?: string;
  /// ValuesInHtmlTableProps.headerRow
  readonly headerRow?: boolean;
  /// ValuesInHtmlTableProps.idColumn
  readonly idColumn?: boolean;
};

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

/// ValuesInHtmlTable
export function ValuesInHtmlTable(
  props: ValuesInHtmlTableProps,
): ComponentReturnType;
