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

// TableInHtmlTableProps
export type TableInHtmlTableProps = {
  /// TableInHtmlTableProps.tableId
  readonly tableId: Id;
  /// TableInHtmlTableProps.store
  readonly store?: StoreOrStoreId;
  /// TableInHtmlTableProps.cellComponent
  readonly cellComponent?: ComponentType<CellProps>;
  /// TableInHtmlTableProps.getCellComponentProps
  readonly getCellComponentProps?: (rowId: Id, cellId: Id) => ExtraProps;
  /// TableInHtmlTableProps.className
  readonly className?: string;
  /// TableInHtmlTableProps.headerRow
  readonly headerRow?: boolean;
  /// TableInHtmlTableProps.idColumn
  readonly idColumn?: boolean;
  /// TableInHtmlTableProps.customCellIds
  readonly customCellIds?: Ids;
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
  /// SortedTableInHtmlTableProps.cellComponent
  readonly cellComponent?: ComponentType<CellProps>;
  /// SortedTableInHtmlTableProps.getCellComponentProps
  readonly getCellComponentProps?: (rowId: Id, cellId: Id) => ExtraProps;
  /// SortedTableInHtmlTableProps.className
  readonly className?: string;
  /// SortedTableInHtmlTableProps.headerRow
  readonly headerRow?: boolean;
  /// SortedTableInHtmlTableProps.idColumn
  readonly idColumn?: boolean;
  /// SortedTableInHtmlTableProps.customCellIds
  readonly customCellIds?: Ids;
};

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

/// TableInHtmlTable
export function TableInHtmlTable(
  props: TableInHtmlTableProps,
): ComponentReturnType;

/// SortedTableInHtmlTable
export function SortedTableInHtmlTable(
  props: SortedTableInHtmlTableProps,
): ComponentReturnType;

/// ValuesInHtmlTable
export function ValuesInHtmlTable(
  props: ValuesInHtmlTableProps,
): ComponentReturnType;
