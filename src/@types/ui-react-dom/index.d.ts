/// ui-react-dom

import type {
  CellProps,
  ComponentReturnType,
  ExtraProps,
  IndexesOrIndexesId,
  QueriesOrQueriesId,
  RelationshipsOrRelationshipsId,
  ResultCellProps,
  StoreOrStoreId,
  ValueProps,
} from '../ui-react/index.d.ts';
import type {Id, Ids} from '../common/index.d.ts';
import type {ComponentType} from 'react';

/// CustomCell
export type CustomCell = {
  /// CustomCell.label
  label?: string;
  /// CustomCell.component
  component?: ComponentType<CellProps>;
  /// CustomCell.getComponentProps
  getComponentProps?: (rowId: Id, cellId: Id) => ExtraProps;
};

/// CustomResultCell
export type CustomResultCell = {
  /// CustomResultCell.label
  label?: string;
  /// CustomResultCell.component
  component?: ComponentType<ResultCellProps>;
  /// CustomResultCell.getComponentProps
  getComponentProps?: (rowId: Id, cellId: Id) => ExtraProps;
};

/// HtmlTableProps
export type HtmlTableProps = {
  /// HtmlTableProps.className
  readonly className?: string;
  /// HtmlTableProps.headerRow
  readonly headerRow?: boolean;
  /// HtmlTableProps.idColumn
  readonly idColumn?: boolean;
};

/// TableInHtmlTableProps
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

/// SortedTableInHtmlTableProps
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
  /// SortedTableInHtmlTableProps.paginator
  readonly paginator?: boolean | ComponentType<SortedTablePaginatorProps>;
  /// SortedTableInHtmlTableProps.onChange
  readonly onChange?: (
    sortAndOffset: [
      cellId: Id | undefined,
      descending: boolean,
      offset: number,
    ],
  ) => void;
};

/// ValuesInHtmlTableProps
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

/// SliceInHtmlTableProps
export type SliceInHtmlTableProps = {
  /// SliceInHtmlTableProps.indexId
  readonly indexId: Id;
  /// SliceInHtmlTableProps.sliceId
  readonly sliceId: Id;
  /// SliceInHtmlTableProps.indexes
  readonly indexes?: IndexesOrIndexesId;
  /// SliceInHtmlTableProps.editable
  readonly editable?: boolean;
  /// SliceInHtmlTableProps.customCells
  readonly customCells?: Ids | {[cellId: Id]: string | CustomCell};
};

/// RelationshipInHtmlTableProps
export type RelationshipInHtmlTableProps = {
  /// RelationshipInHtmlTable.relationshipId
  readonly relationshipId: Id;
  /// RelationshipInHtmlTable.relationships
  readonly relationships?: RelationshipsOrRelationshipsId;
  /// RelationshipInHtmlTable.editable
  readonly editable?: boolean;
  /// RelationshipInHtmlTable.customCells
  readonly customCells?: Ids | {[cellId: Id]: string | CustomCell};
};

/// ResultTableInHtmlTableProps
export type ResultTableInHtmlTableProps = {
  /// ResultTableInHtmlTableProps.queryId
  readonly queryId: Id;
  /// ResultTableInHtmlTableProps.queries
  readonly queries?: QueriesOrQueriesId;
  /// ResultTableInHtmlTableProps.customCells
  readonly customCells?: Ids | {[cellId: Id]: string | CustomResultCell};
};

/// ResultSortedTableInHtmlTableProps
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
  /// ResultSortedTableInHtmlTableProps.paginator
  readonly paginator?: boolean | ComponentType<SortedTablePaginatorProps>;
  /// ResultSortedTableInHtmlTableProps.onChange
  readonly onChange?: (
    sortAndOffset: [
      cellId: Id | undefined,
      descending: boolean,
      offset: number,
    ],
  ) => void;
};

/// SortedTablePaginatorProps
export type SortedTablePaginatorProps = {
  /// SortedTablePaginatorProps.onChange
  readonly onChange: (offset: number) => void;
  /// SortedTablePaginatorProps.offset
  readonly offset?: number;
  /// SortedTablePaginatorProps.limit
  readonly limit?: number;
  /// SortedTablePaginatorProps.total
  readonly total: number;
  /// SortedTablePaginatorProps.singular
  readonly singular?: string;
  /// SortedTablePaginatorProps.plural
  readonly plural?: string;
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

/// SliceInHtmlTable
export function SliceInHtmlTable(
  props: SliceInHtmlTableProps & HtmlTableProps,
): ComponentReturnType;

/// RelationshipInHtmlTable
export function RelationshipInHtmlTable(
  props: RelationshipInHtmlTableProps & HtmlTableProps,
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
  props: CellProps & {readonly className?: string; readonly showType?: boolean},
): ComponentReturnType;

/// EditableValueView
export function EditableValueView(
  props: ValueProps & {
    readonly className?: string;
    readonly showType?: boolean;
  },
): ComponentReturnType;

/// SortedTablePaginator
export function SortedTablePaginator(
  props: SortedTablePaginatorProps,
): ComponentReturnType;
