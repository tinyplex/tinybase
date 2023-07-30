/// ui-react-dom

import {
  CellProps,
  ComponentReturnType,
  ExtraProps,
  QueriesOrQueriesId,
  ResultCellProps,
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

// CustomResultCell
export type CustomResultCell = {
  /// CustomResultCell.label
  readonly label?: string;
  /// CustomResultCell.component
  readonly component?: ComponentType<ResultCellProps>;
  /// CustomResultCell.getComponentProps
  readonly getComponentProps?: (rowId: Id, cellId: Id) => ExtraProps;
};

export type SortedTablePaginatorProps = {
  readonly onChange: (offset: number) => void;
  readonly offset?: number;
  readonly limit?: number;
  readonly total: number;
  readonly singular?: string;
  readonly plural?: string;
  readonly className?: string;
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
  /// TableInHtmlTableProps.editable
  readonly editable?: boolean;
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
  /// SortedTableInHtmlTableProps.editable
  readonly editable?: boolean;
  /// SortedTableInHtmlTableProps.customCells
  readonly customCells?: Ids | {[cellId: Id]: string | CustomCell};
  /// SortedTableInHtmlTableProps.sortOnClick
  readonly sortOnClick?: boolean;
  // / SortedTableInHtmlTableProps.paginator
  readonly paginator?: boolean | ComponentType<SortedTablePaginatorProps>;
};

// ResultTableInHtmlTableProps
export type ResultTableInHtmlTableProps = {
  /// ResultTableInHtmlTableProps.queryId
  readonly queryId: Id;
  /// ResultTableInHtmlTableProps.queries
  readonly queries?: QueriesOrQueriesId;
  /// ResultTableInHtmlTableProps.customCells
  readonly customCells?: Ids | {[cellId: Id]: string | CustomResultCell};
};

// ResultSortedTableInHtmlTableProps
export type ResultSortedTableInHtmlTableProps = {
  /// ResultSortedTableInHtmlTableProps.queryId
  readonly queryId: Id;
  /// ResultSortedTableInHtmlTableProps.cellId
  readonly cellId?: Id;
  /// ResultSortedTableInHtmlTableProps.descending
  readonly descending?: boolean;
  /// ResultSortedTableInHtmlTableProps.offset
  readonly offset?: number;
  /// ResultSortedTableInHtmlTableProps.limit
  readonly limit?: number;
  /// ResultSortedTableInHtmlTableProps.queries
  readonly queries?: QueriesOrQueriesId;
  /// ResultSortedTableInHtmlTableProps.customCells
  readonly customCells?: Ids | {[cellId: Id]: string | CustomResultCell};
  /// ResultSortedTableInHtmlTableProps.sortOnClick
  readonly sortOnClick?: boolean;
  // / ResultSortedTableInHtmlTableProps.paginator
  readonly paginator?: boolean | ComponentType<SortedTablePaginatorProps>;
};

// ValuesInHtmlTableProps
export type ValuesInHtmlTableProps = {
  /// ValuesInHtmlTableProps.store
  readonly store?: StoreOrStoreId;
  /// ValuesInHtmlTableProps.editable
  readonly editable?: boolean;
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

/// ResultTableInHtmlTable
export function ResultTableInHtmlTable(
  props: ResultTableInHtmlTableProps & HtmlTableProps,
): ComponentReturnType;

/// ResultSortedTableInHtmlTable
export function ResultSortedTableInHtmlTable(
  props: ResultSortedTableInHtmlTableProps & HtmlTableProps,
): ComponentReturnType;

/// EditableCellView
export function EditableCellView(
  props: CellProps & {readonly className?: string},
): ComponentReturnType;

/// EditableValueView
export function EditableValueView(
  props: ValueProps & {readonly className?: string},
): ComponentReturnType;
