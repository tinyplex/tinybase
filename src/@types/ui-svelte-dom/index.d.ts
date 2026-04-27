/// ui-svelte-dom
import type {Component} from 'svelte';
import type {Id, Ids} from '../common/index.d.ts';
import type {
  CellViewProps,
  IndexesOrIndexesId,
  QueriesOrQueriesId,
  RelationshipsOrRelationshipsId,
  ResultCellViewProps,
  RowViewProps,
  StoreOrStoreId,
  ValueViewProps,
} from '../ui-svelte/index.d.ts';

/// ui-svelte-dom.CustomCell
export type CustomCell = {
  /// ui-svelte-dom.CustomCell.label
  label?: string;
  /// ui-svelte-dom.CustomCell.component
  component?: Component<CellViewProps>;
  /// ui-svelte-dom.CustomCell.getComponentProps
  getComponentProps?: (rowId: Id, cellId: Id) => {[prop: string]: any};
};

/// ui-svelte-dom.CustomResultCell
export type CustomResultCell = {
  /// ui-svelte-dom.CustomResultCell.label
  label?: string;
  /// ui-svelte-dom.CustomResultCell.component
  component?: Component<ResultCellViewProps>;
  /// ui-svelte-dom.CustomResultCell.getComponentProps
  getComponentProps?: (rowId: Id, cellId: Id) => {[prop: string]: any};
};

/// ui-svelte-dom.ExtraRowCell
export type ExtraRowCell = {
  /// ui-svelte-dom.ExtraRowCell.label
  label: string;
  /// ui-svelte-dom.ExtraRowCell.component
  component: Component<RowViewProps>;
};

/// ui-svelte-dom.ExtraValueCell
export type ExtraValueCell = {
  /// ui-svelte-dom.ExtraValueCell.label
  label: string;
  /// ui-svelte-dom.ExtraValueCell.component
  component: Component<ValueViewProps>;
};

/// ui-svelte-dom.HtmlTableProps
export type HtmlTableProps = {
  /// ui-svelte-dom.HtmlTableProps.className
  readonly className?: string;
  /// ui-svelte-dom.HtmlTableProps.headerRow
  readonly headerRow?: boolean;
  /// ui-svelte-dom.HtmlTableProps.idColumn
  readonly idColumn?: boolean;
};

/// ui-svelte-dom.TableInHtmlTableProps
export type TableInHtmlTableProps = {
  /// ui-svelte-dom.TableInHtmlTableProps.tableId
  readonly tableId: Id;
  /// ui-svelte-dom.TableInHtmlTableProps.store
  readonly store?: StoreOrStoreId;
  /// ui-svelte-dom.TableInHtmlTableProps.editable
  readonly editable?: boolean;
  /// ui-svelte-dom.TableInHtmlTableProps.customCells
  readonly customCells?: Ids | {[cellId: Id]: string | CustomCell};
  /// ui-svelte-dom.TableInHtmlTableProps.extraCellsBefore
  readonly extraCellsBefore?: ExtraRowCell[];
  /// ui-svelte-dom.TableInHtmlTableProps.extraCellsAfter
  readonly extraCellsAfter?: ExtraRowCell[];
};

/// ui-svelte-dom.SortedTableInHtmlTableProps
export type SortedTableInHtmlTableProps = {
  /// ui-svelte-dom.SortedTableInHtmlTableProps.tableId
  readonly tableId: Id;
  /// ui-svelte-dom.SortedTableInHtmlTableProps.cellId
  readonly cellId?: Id;
  /// ui-svelte-dom.SortedTableInHtmlTableProps.descending
  readonly descending?: boolean;
  /// ui-svelte-dom.SortedTableInHtmlTableProps.offset
  readonly offset?: number;
  /// ui-svelte-dom.SortedTableInHtmlTableProps.limit
  readonly limit?: number;
  /// ui-svelte-dom.SortedTableInHtmlTableProps.store
  readonly store?: StoreOrStoreId;
  /// ui-svelte-dom.SortedTableInHtmlTableProps.editable
  readonly editable?: boolean;
  /// ui-svelte-dom.SortedTableInHtmlTableProps.customCells
  readonly customCells?: Ids | {[cellId: Id]: string | CustomCell};
  /// ui-svelte-dom.TableInHtmlTableProps.extraCellsBefore
  readonly extraCellsBefore?: ExtraRowCell[];
  /// ui-svelte-dom.TableInHtmlTableProps.extraCellsAfter
  readonly extraCellsAfter?: ExtraRowCell[];
  /// ui-svelte-dom.SortedTableInHtmlTableProps.sortOnClick
  readonly sortOnClick?: boolean;
  /// ui-svelte-dom.SortedTableInHtmlTableProps.paginator
  readonly paginator?: boolean | Component<SortedTablePaginatorProps>;
  /// ui-svelte-dom.SortedTableInHtmlTableProps.onChange
  readonly onChange?: (
    sortAndOffset: [
      cellId: Id | undefined,
      descending: boolean,
      offset: number,
    ],
  ) => void;
};

/// ui-svelte-dom.ValuesInHtmlTableProps
export type ValuesInHtmlTableProps = {
  /// ui-svelte-dom.ValuesInHtmlTableProps.store
  readonly store?: StoreOrStoreId;
  /// ui-svelte-dom.ValuesInHtmlTableProps.editable
  readonly editable?: boolean;
  /// ui-svelte-dom.ValuesInHtmlTableProps.valueComponent
  readonly valueComponent?: Component<ValueViewProps>;
  /// ui-svelte-dom.ValuesInHtmlTableProps.getValueComponentProps
  readonly getValueComponentProps?: (valueId: Id) => {[prop: string]: any};
  /// ui-svelte-dom.ValuesInHtmlTableProps.extraCellsBefore
  readonly extraCellsBefore?: ExtraValueCell[];
  /// ui-svelte-dom.ValuesInHtmlTableProps.extraCellsAfter
  readonly extraCellsAfter?: ExtraValueCell[];
};

/// ui-svelte-dom.SliceInHtmlTableProps
export type SliceInHtmlTableProps = {
  /// ui-svelte-dom.SliceInHtmlTableProps.indexId
  readonly indexId: Id;
  /// ui-svelte-dom.SliceInHtmlTableProps.sliceId
  readonly sliceId: Id;
  /// ui-svelte-dom.SliceInHtmlTableProps.indexes
  readonly indexes?: IndexesOrIndexesId;
  /// ui-svelte-dom.SliceInHtmlTableProps.editable
  readonly editable?: boolean;
  /// ui-svelte-dom.SliceInHtmlTableProps.customCells
  readonly customCells?: Ids | {[cellId: Id]: string | CustomCell};
  /// ui-svelte-dom.TableInHtmlTableProps.extraCellsBefore
  readonly extraCellsBefore?: ExtraRowCell[];
  /// ui-svelte-dom.TableInHtmlTableProps.extraCellsAfter
  readonly extraCellsAfter?: ExtraRowCell[];
};

/// ui-svelte-dom.RelationshipInHtmlTableProps
export type RelationshipInHtmlTableProps = {
  /// ui-svelte-dom.RelationshipInHtmlTable.relationshipId
  readonly relationshipId: Id;
  /// ui-svelte-dom.RelationshipInHtmlTable.relationships
  readonly relationships?: RelationshipsOrRelationshipsId;
  /// ui-svelte-dom.RelationshipInHtmlTable.editable
  readonly editable?: boolean;
  /// ui-svelte-dom.RelationshipInHtmlTable.customCells
  readonly customCells?: Ids | {[cellId: Id]: string | CustomCell};
  /// ui-svelte-dom.TableInHtmlTableProps.extraCellsBefore
  readonly extraCellsBefore?: ExtraRowCell[];
  /// ui-svelte-dom.TableInHtmlTableProps.extraCellsAfter
  readonly extraCellsAfter?: ExtraRowCell[];
};

/// ui-svelte-dom.ResultTableInHtmlTableProps
export type ResultTableInHtmlTableProps = {
  /// ui-svelte-dom.ResultTableInHtmlTableProps.queryId
  readonly queryId: Id;
  /// ui-svelte-dom.ResultTableInHtmlTableProps.queries
  readonly queries?: QueriesOrQueriesId;
  /// ui-svelte-dom.ResultTableInHtmlTableProps.customCells
  readonly customCells?: Ids | {[cellId: Id]: string | CustomResultCell};
  /// ui-svelte-dom.TableInHtmlTableProps.extraCellsBefore
  readonly extraCellsBefore?: ExtraRowCell[];
  /// ui-svelte-dom.TableInHtmlTableProps.extraCellsAfter
  readonly extraCellsAfter?: ExtraRowCell[];
};

/// ui-svelte-dom.ResultSortedTableInHtmlTableProps
export type ResultSortedTableInHtmlTableProps = {
  /// ui-svelte-dom.ResultSortedTableInHtmlTableProps.queryId
  readonly queryId: Id;
  /// ui-svelte-dom.ResultSortedTableInHtmlTableProps.cellId
  readonly cellId?: Id;
  /// ui-svelte-dom.ResultSortedTableInHtmlTableProps.descending
  readonly descending?: boolean;
  /// ui-svelte-dom.ResultSortedTableInHtmlTableProps.offset
  readonly offset?: number;
  /// ui-svelte-dom.ResultSortedTableInHtmlTableProps.limit
  readonly limit?: number;
  /// ui-svelte-dom.ResultSortedTableInHtmlTableProps.queries
  readonly queries?: QueriesOrQueriesId;
  /// ui-svelte-dom.ResultSortedTableInHtmlTableProps.customCells
  readonly customCells?: Ids | {[cellId: Id]: string | CustomResultCell};
  /// ui-svelte-dom.TableInHtmlTableProps.extraCellsBefore
  readonly extraCellsBefore?: ExtraRowCell[];
  /// ui-svelte-dom.TableInHtmlTableProps.extraCellsAfter
  readonly extraCellsAfter?: ExtraRowCell[];
  /// ui-svelte-dom.ResultSortedTableInHtmlTableProps.sortOnClick
  readonly sortOnClick?: boolean;
  /// ui-svelte-dom.ResultSortedTableInHtmlTableProps.paginator
  readonly paginator?: boolean | Component<SortedTablePaginatorProps>;
  /// ui-svelte-dom.ResultSortedTableInHtmlTableProps.onChange
  readonly onChange?: (
    sortAndOffset: [
      cellId: Id | undefined,
      descending: boolean,
      offset: number,
    ],
  ) => void;
};

/// ui-svelte-dom.SortedTablePaginatorProps
export type SortedTablePaginatorProps = {
  /// ui-svelte-dom.SortedTablePaginatorProps.onChange
  readonly onChange: (offset: number) => void;
  /// ui-svelte-dom.SortedTablePaginatorProps.offset
  readonly offset?: number;
  /// ui-svelte-dom.SortedTablePaginatorProps.limit
  readonly limit?: number;
  /// ui-svelte-dom.SortedTablePaginatorProps.total
  readonly total: number;
  /// ui-svelte-dom.SortedTablePaginatorProps.singular
  readonly singular?: string;
  /// ui-svelte-dom.SortedTablePaginatorProps.plural
  readonly plural?: string;
};

/// ui-svelte-dom.TableInHtmlTable
export const TableInHtmlTable: Component<
  TableInHtmlTableProps & HtmlTableProps
>;

/// ui-svelte-dom.SortedTableInHtmlTable
export const SortedTableInHtmlTable: Component<
  SortedTableInHtmlTableProps & HtmlTableProps
>;

/// ui-svelte-dom.ValuesInHtmlTable
export const ValuesInHtmlTable: Component<
  ValuesInHtmlTableProps & HtmlTableProps
>;

/// ui-svelte-dom.SliceInHtmlTable
export const SliceInHtmlTable: Component<
  SliceInHtmlTableProps & HtmlTableProps
>;

/// ui-svelte-dom.RelationshipInHtmlTable
export const RelationshipInHtmlTable: Component<
  RelationshipInHtmlTableProps & HtmlTableProps
>;

/// ui-svelte-dom.ResultTableInHtmlTable
export const ResultTableInHtmlTable: Component<
  ResultTableInHtmlTableProps & HtmlTableProps
>;

/// ui-svelte-dom.ResultSortedTableInHtmlTable
export const ResultSortedTableInHtmlTable: Component<
  ResultSortedTableInHtmlTableProps & HtmlTableProps
>;

/// ui-svelte-dom.EditableCellView
export const EditableCellView: Component<
  CellViewProps & {readonly className?: string; readonly showType?: boolean}
>;

/// ui-svelte-dom.EditableValueView
export const EditableValueView: Component<
  ValueViewProps & {
    readonly className?: string;
    readonly showType?: boolean;
  }
>;

/// ui-svelte-dom.SortedTablePaginator
export const SortedTablePaginator: Component<SortedTablePaginatorProps>;
