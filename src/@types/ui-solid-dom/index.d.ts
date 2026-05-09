/// ui-solid-dom
import type {Component} from 'solid-js';
import type {Id, Ids} from '../common/index.d.ts';
import type {
  CellProps,
  ComponentReturnType,
  ExtraProps,
  IndexesOrIndexesId,
  QueriesOrQueriesId,
  RelationshipsOrRelationshipsId,
  ResultCellProps,
  RowProps,
  StoreOrStoreId,
  ValueProps,
} from '../ui-solid/index.d.ts';

/// ui-solid-dom.CustomCell
export type CustomCell = {
  /// ui-solid-dom.CustomCell.label
  label?: string;
  /// ui-solid-dom.CustomCell.component
  component?: Component<CellProps>;
  /// ui-solid-dom.CustomCell.getComponentProps
  getComponentProps?: (rowId: Id, cellId: Id) => ExtraProps;
};

/// ui-solid-dom.CustomResultCell
export type CustomResultCell = {
  /// ui-solid-dom.CustomResultCell.label
  label?: string;
  /// ui-solid-dom.CustomResultCell.component
  component?: Component<ResultCellProps>;
  /// ui-solid-dom.CustomResultCell.getComponentProps
  getComponentProps?: (rowId: Id, cellId: Id) => ExtraProps;
};

/// ui-solid-dom.ExtraRowCell
export type ExtraRowCell = {
  /// ui-solid-dom.ExtraRowCell.label
  label: string;
  /// ui-solid-dom.ExtraRowCell.component
  component: Component<RowProps>;
};

/// ui-solid-dom.ExtraValueCell
export type ExtraValueCell = {
  /// ui-solid-dom.ExtraValueCell.label
  label: string;
  /// ui-solid-dom.ExtraValueCell.component
  component: Component<ValueProps>;
};

/// ui-solid-dom.HtmlTableProps
export type HtmlTableProps = {
  /// ui-solid-dom.HtmlTableProps.className
  readonly className?: string;
  /// ui-solid-dom.HtmlTableProps.headerRow
  readonly headerRow?: boolean;
  /// ui-solid-dom.HtmlTableProps.idColumn
  readonly idColumn?: boolean;
};

/// ui-solid-dom.TableInHtmlTableProps
export type TableInHtmlTableProps = {
  /// ui-solid-dom.TableInHtmlTableProps.tableId
  readonly tableId: Id;
  /// ui-solid-dom.TableInHtmlTableProps.store
  readonly store?: StoreOrStoreId;
  /// ui-solid-dom.TableInHtmlTableProps.editable
  readonly editable?: boolean;
  /// ui-solid-dom.TableInHtmlTableProps.customCells
  readonly customCells?: Ids | {[cellId: Id]: string | CustomCell};
  /// ui-solid-dom.TableInHtmlTableProps.extraCellsBefore
  readonly extraCellsBefore?: ExtraRowCell[];
  /// ui-solid-dom.TableInHtmlTableProps.extraCellsAfter
  readonly extraCellsAfter?: ExtraRowCell[];
};

/// ui-solid-dom.SortedTableInHtmlTableProps
export type SortedTableInHtmlTableProps = {
  /// ui-solid-dom.SortedTableInHtmlTableProps.tableId
  readonly tableId: Id;
  /// ui-solid-dom.SortedTableInHtmlTableProps.cellId
  readonly cellId?: Id;
  /// ui-solid-dom.SortedTableInHtmlTableProps.descending
  readonly descending?: boolean;
  /// ui-solid-dom.SortedTableInHtmlTableProps.offset
  readonly offset?: number;
  /// ui-solid-dom.SortedTableInHtmlTableProps.limit
  readonly limit?: number;
  /// ui-solid-dom.SortedTableInHtmlTableProps.store
  readonly store?: StoreOrStoreId;
  /// ui-solid-dom.SortedTableInHtmlTableProps.editable
  readonly editable?: boolean;
  /// ui-solid-dom.SortedTableInHtmlTableProps.customCells
  readonly customCells?: Ids | {[cellId: Id]: string | CustomCell};
  /// ui-solid-dom.TableInHtmlTableProps.extraCellsBefore
  readonly extraCellsBefore?: ExtraRowCell[];
  /// ui-solid-dom.TableInHtmlTableProps.extraCellsAfter
  readonly extraCellsAfter?: ExtraRowCell[];
  /// ui-solid-dom.SortedTableInHtmlTableProps.sortOnClick
  readonly sortOnClick?: boolean;
  /// ui-solid-dom.SortedTableInHtmlTableProps.paginator
  readonly paginator?: boolean | Component<SortedTablePaginatorProps>;
  /// ui-solid-dom.SortedTableInHtmlTableProps.onChange
  readonly onChange?: (
    sortAndOffset: [
      cellId: Id | undefined,
      descending: boolean,
      offset: number,
    ],
  ) => void;
};

/// ui-solid-dom.ValuesInHtmlTableProps
export type ValuesInHtmlTableProps = {
  /// ui-solid-dom.ValuesInHtmlTableProps.store
  readonly store?: StoreOrStoreId;
  /// ui-solid-dom.ValuesInHtmlTableProps.editable
  readonly editable?: boolean;
  /// ui-solid-dom.ValuesInHtmlTableProps.valueComponent
  readonly valueComponent?: Component<ValueProps>;
  /// ui-solid-dom.ValuesInHtmlTableProps.getValueComponentProps
  readonly getValueComponentProps?: (valueId: Id) => ExtraProps;
  /// ui-solid-dom.ValuesInHtmlTableProps.extraCellsBefore
  readonly extraCellsBefore?: ExtraValueCell[];
  /// ui-solid-dom.ValuesInHtmlTableProps.extraCellsAfter
  readonly extraCellsAfter?: ExtraValueCell[];
};

/// ui-solid-dom.SliceInHtmlTableProps
export type SliceInHtmlTableProps = {
  /// ui-solid-dom.SliceInHtmlTableProps.indexId
  readonly indexId: Id;
  /// ui-solid-dom.SliceInHtmlTableProps.sliceId
  readonly sliceId: Id;
  /// ui-solid-dom.SliceInHtmlTableProps.indexes
  readonly indexes?: IndexesOrIndexesId;
  /// ui-solid-dom.SliceInHtmlTableProps.editable
  readonly editable?: boolean;
  /// ui-solid-dom.SliceInHtmlTableProps.customCells
  readonly customCells?: Ids | {[cellId: Id]: string | CustomCell};
  /// ui-solid-dom.TableInHtmlTableProps.extraCellsBefore
  readonly extraCellsBefore?: ExtraRowCell[];
  /// ui-solid-dom.TableInHtmlTableProps.extraCellsAfter
  readonly extraCellsAfter?: ExtraRowCell[];
};

/// ui-solid-dom.RelationshipInHtmlTableProps
export type RelationshipInHtmlTableProps = {
  /// ui-solid-dom.RelationshipInHtmlTable.relationshipId
  readonly relationshipId: Id;
  /// ui-solid-dom.RelationshipInHtmlTable.relationships
  readonly relationships?: RelationshipsOrRelationshipsId;
  /// ui-solid-dom.RelationshipInHtmlTable.editable
  readonly editable?: boolean;
  /// ui-solid-dom.RelationshipInHtmlTable.customCells
  readonly customCells?: Ids | {[cellId: Id]: string | CustomCell};
  /// ui-solid-dom.TableInHtmlTableProps.extraCellsBefore
  readonly extraCellsBefore?: ExtraRowCell[];
  /// ui-solid-dom.TableInHtmlTableProps.extraCellsAfter
  readonly extraCellsAfter?: ExtraRowCell[];
};

/// ui-solid-dom.ResultTableInHtmlTableProps
export type ResultTableInHtmlTableProps = {
  /// ui-solid-dom.ResultTableInHtmlTableProps.queryId
  readonly queryId: Id;
  /// ui-solid-dom.ResultTableInHtmlTableProps.queries
  readonly queries?: QueriesOrQueriesId;
  /// ui-solid-dom.ResultTableInHtmlTableProps.customCells
  readonly customCells?: Ids | {[cellId: Id]: string | CustomResultCell};
  /// ui-solid-dom.TableInHtmlTableProps.extraCellsBefore
  readonly extraCellsBefore?: ExtraRowCell[];
  /// ui-solid-dom.TableInHtmlTableProps.extraCellsAfter
  readonly extraCellsAfter?: ExtraRowCell[];
};

/// ui-solid-dom.ResultSortedTableInHtmlTableProps
export type ResultSortedTableInHtmlTableProps = {
  /// ui-solid-dom.ResultSortedTableInHtmlTableProps.queryId
  readonly queryId: Id;
  /// ui-solid-dom.ResultSortedTableInHtmlTableProps.cellId
  readonly cellId?: Id;
  /// ui-solid-dom.ResultSortedTableInHtmlTableProps.descending
  readonly descending?: boolean;
  /// ui-solid-dom.ResultSortedTableInHtmlTableProps.offset
  readonly offset?: number;
  /// ui-solid-dom.ResultSortedTableInHtmlTableProps.limit
  readonly limit?: number;
  /// ui-solid-dom.ResultSortedTableInHtmlTableProps.queries
  readonly queries?: QueriesOrQueriesId;
  /// ui-solid-dom.ResultSortedTableInHtmlTableProps.customCells
  readonly customCells?: Ids | {[cellId: Id]: string | CustomResultCell};
  /// ui-solid-dom.TableInHtmlTableProps.extraCellsBefore
  readonly extraCellsBefore?: ExtraRowCell[];
  /// ui-solid-dom.TableInHtmlTableProps.extraCellsAfter
  readonly extraCellsAfter?: ExtraRowCell[];
  /// ui-solid-dom.ResultSortedTableInHtmlTableProps.sortOnClick
  readonly sortOnClick?: boolean;
  /// ui-solid-dom.ResultSortedTableInHtmlTableProps.paginator
  readonly paginator?: boolean | Component<SortedTablePaginatorProps>;
  /// ui-solid-dom.ResultSortedTableInHtmlTableProps.onChange
  readonly onChange?: (
    sortAndOffset: [
      cellId: Id | undefined,
      descending: boolean,
      offset: number,
    ],
  ) => void;
};

/// ui-solid-dom.SortedTablePaginatorProps
export type SortedTablePaginatorProps = {
  /// ui-solid-dom.SortedTablePaginatorProps.onChange
  readonly onChange: (offset: number) => void;
  /// ui-solid-dom.SortedTablePaginatorProps.offset
  readonly offset?: number;
  /// ui-solid-dom.SortedTablePaginatorProps.limit
  readonly limit?: number;
  /// ui-solid-dom.SortedTablePaginatorProps.total
  readonly total: number;
  /// ui-solid-dom.SortedTablePaginatorProps.singular
  readonly singular?: string;
  /// ui-solid-dom.SortedTablePaginatorProps.plural
  readonly plural?: string;
};

/// ui-solid-dom.TableInHtmlTable
export function TableInHtmlTable(
  props: TableInHtmlTableProps & HtmlTableProps,
): ComponentReturnType;

/// ui-solid-dom.SortedTableInHtmlTable
export function SortedTableInHtmlTable(
  props: SortedTableInHtmlTableProps & HtmlTableProps,
): ComponentReturnType;

/// ui-solid-dom.ValuesInHtmlTable
export function ValuesInHtmlTable(
  props: ValuesInHtmlTableProps & HtmlTableProps,
): ComponentReturnType;

/// ui-solid-dom.SliceInHtmlTable
export function SliceInHtmlTable(
  props: SliceInHtmlTableProps & HtmlTableProps,
): ComponentReturnType;

/// ui-solid-dom.RelationshipInHtmlTable
export function RelationshipInHtmlTable(
  props: RelationshipInHtmlTableProps & HtmlTableProps,
): ComponentReturnType;

/// ui-solid-dom.ResultTableInHtmlTable
export function ResultTableInHtmlTable(
  props: ResultTableInHtmlTableProps & HtmlTableProps,
): ComponentReturnType;

/// ui-solid-dom.ResultSortedTableInHtmlTable
export function ResultSortedTableInHtmlTable(
  props: ResultSortedTableInHtmlTableProps & HtmlTableProps,
): ComponentReturnType;

/// ui-solid-dom.EditableCellView
export function EditableCellView(
  props: CellProps & {readonly className?: string; readonly showType?: boolean},
): ComponentReturnType;

/// ui-solid-dom.EditableValueView
export function EditableValueView(
  props: ValueProps & {
    readonly className?: string;
    readonly showType?: boolean;
  },
): ComponentReturnType;

/// ui-solid-dom.SortedTablePaginator
export function SortedTablePaginator(
  props: SortedTablePaginatorProps,
): ComponentReturnType;
