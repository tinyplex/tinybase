/// ui-react-dom

import {
  CellProps,
  ComponentReturnType,
  ExtraProps,
  StoreOrStoreId,
  ValueProps,
} from './ui-react';
import {Id, Ids} from './common';
import {ComponentType} from 'react';

// CustomCell
export type CustomCell = {
  /// CustomCell.label
  readonly label?: string;
  /// CustomCell.component
  readonly component?: ComponentType<CellProps>;
  /// CustomCell.getComponentProps
  readonly getComponentProps?: (rowId: Id, cellId: Id) => ExtraProps;
};

// HtmlTableProps
export type HtmlTableProps = {
  /// HtmlTableProps.className
  readonly className?: string;
  /// HtmlTableProps.headerRow
  readonly headerRow?: boolean;
  /// HtmlTableProps.idColumn
  readonly idColumn?: boolean;
};

// TableInHtmlTableProps
export type TableInHtmlTableProps = {
  /// TableInHtmlTableProps.tableId
  readonly tableId: Id;
  /// TableInHtmlTableProps.store
  readonly store?: StoreOrStoreId;
  /// TableInHtmlTableProps.customCells
  readonly customCells?: Ids | {[cellId: Id]: string | CustomCell};
};

// SortedTableInHtmlTableProps
export type SortedTableInHtmlTableProps = {
  /// SortedTableInHtmlTableProps.tableId
  readonly tableId: Id;
  /// SortedTableInHtmlTableProps.cellId
  readonly cellId?: Id;
  /// SortedTableInHtmlTableProps.descending
  readonly descending?: boolean;
  /// SortedTableInHtmlTableProps.offset
  readonly offset?: number;
  /// SortedTableInHtmlTableProps.limit
  readonly limit?: number;
  /// SortedTableInHtmlTableProps.store
  readonly store?: StoreOrStoreId;
  /// SortedTableInHtmlTableProps.customCells
  readonly customCells?: Ids | {[cellId: Id]: string | CustomCell};
  /// SortedTableInHtmlTableProps.sortOnClick
  readonly sortOnClick?: boolean;
};

// ValuesInHtmlTableProps
export type ValuesInHtmlTableProps = {
  /// ValuesInHtmlTableProps.store
  readonly store?: StoreOrStoreId;
  /// ValuesInHtmlTableProps.valueComponent
  readonly valueComponent?: ComponentType<ValueProps>;
  /// ValuesInHtmlTableProps.getValueComponentProps
  readonly getValueComponentProps?: (valueId: Id) => ExtraProps;
};

/// TableInHtmlTable
export function TableInHtmlTable(
  props: TableInHtmlTableProps & HtmlTableProps,
): ComponentReturnType;

/// SortedTableInHtmlTable
export function SortedTableInHtmlTable(
  props: SortedTableInHtmlTableProps & HtmlTableProps,
): ComponentReturnType;

/// ValuesInHtmlTable
export function ValuesInHtmlTable(
  props: ValuesInHtmlTableProps & HtmlTableProps,
): ComponentReturnType;
