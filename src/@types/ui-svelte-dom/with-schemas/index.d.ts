/// ui-svelte-dom
import type {Component} from 'svelte';
import type {
  CellIdFromSchema,
  TableIdFromSchema,
} from '../../_internal/store/with-schemas/index.d.ts';
import type {
  CellProps,
  CellPropsForTableIdAndCellId,
  ResultCellProps,
  RowProps,
  ValueProps,
} from '../../_internal/ui-react/with-schemas/index.d.ts';
import type {
  IndexesOrIndexesId,
  QueriesOrQueriesId,
  RelationshipsOrRelationshipsId,
  StoreOrStoreId,
} from '../../_internal/ui/with-schemas/index.d.ts';
import type {Id, Ids} from '../../common/with-schemas/index.d.ts';
import type {NoSchemas} from '../../store/index.d.ts';
import type {OptionalSchemas} from '../../store/with-schemas/index.d.ts';

/// ui-svelte-dom.CustomCell
export type CustomCell<
  Schemas extends OptionalSchemas,
  TableId extends TableIdFromSchema<Schemas[0]>,
  CellId extends CellIdFromSchema<Schemas[0], TableId>,
> = {
  /// ui-svelte-dom.CustomCell.label
  label?: string;
  /// ui-svelte-dom.CustomCell.component
  component?: Component<CellPropsForTableIdAndCellId<Schemas, TableId, CellId>>;
  /// ui-svelte-dom.CustomCell.getComponentProps
  getComponentProps?: (rowId: Id, cellId: CellId) => {[prop: string]: any};
};

/// ui-svelte-dom.CustomResultCell
export type CustomResultCell<Schemas extends OptionalSchemas> = {
  /// ui-svelte-dom.CustomResultCell.label
  label?: string;
  /// ui-svelte-dom.CustomResultCell.component
  component?: Component<ResultCellProps<Schemas>>;
  /// ui-svelte-dom.CustomResultCell.getComponentProps
  getComponentProps?: (rowId: Id, cellId: Id) => {[prop: string]: any};
};

/// ui-svelte-dom.ExtraRowCell
export type ExtraRowCell<
  Schemas extends OptionalSchemas,
  TableId extends TableIdFromSchema<Schemas[0]>,
> = {
  /// ui-svelte-dom.ExtraRowCell.label
  label: string;
  /// ui-svelte-dom.ExtraRowCell.component
  component: Component<RowProps<Schemas, TableId>>;
};

/// ui-svelte-dom.ExtraValueCell
export type ExtraValueCell<Schemas extends OptionalSchemas> = {
  /// ui-svelte-dom.ExtraValueCell.label
  label: string;
  /// ui-svelte-dom.ExtraValueCell.component
  component: Component<ValueProps<Schemas>>;
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
export type TableInHtmlTableProps<
  Schemas extends OptionalSchemas,
  TableIds extends TableIdFromSchema<Schemas[0]> = TableIdFromSchema<
    Schemas[0]
  >,
> = TableIds extends infer TableId
  ? TableId extends TableIdFromSchema<Schemas[0]>
    ? {
        /// ui-svelte-dom.TableInHtmlTableProps.tableId
        readonly tableId: TableId;
        /// ui-svelte-dom.TableInHtmlTableProps.store
        readonly store?: StoreOrStoreId<Schemas>;
        /// ui-svelte-dom.TableInHtmlTableProps.editable
        readonly editable?: boolean;
        /// ui-svelte-dom.TableInHtmlTableProps.customCells
        readonly customCells?:
          | CellIdFromSchema<Schemas[0], TableId>[]
          | {
              [CellId in CellIdFromSchema<Schemas[0], TableId>]?:
                string | CustomCell<Schemas, TableId, CellId>;
            };
      }
    : never
  : never;

/// ui-svelte-dom.SortedTableInHtmlTableProps
export type SortedTableInHtmlTableProps<
  Schemas extends OptionalSchemas,
  TableIds extends TableIdFromSchema<Schemas[0]> = TableIdFromSchema<
    Schemas[0]
  >,
> = TableIds extends infer TableId
  ? TableId extends TableIdFromSchema<Schemas[0]>
    ? {
        /// ui-svelte-dom.SortedTableInHtmlTableProps.tableId
        readonly tableId: TableId;
        /// ui-svelte-dom.SortedTableInHtmlTableProps.cellId
        readonly cellId?: CellIdFromSchema<Schemas[0], TableId>;
        /// ui-svelte-dom.SortedTableInHtmlTableProps.descending
        readonly descending?: boolean;
        /// ui-svelte-dom.SortedTableInHtmlTableProps.offset
        readonly offset?: number;
        /// ui-svelte-dom.SortedTableInHtmlTableProps.limit
        readonly limit?: number;
        /// ui-svelte-dom.SortedTableInHtmlTableProps.store
        readonly store?: StoreOrStoreId<Schemas>;
        /// ui-svelte-dom.SortedTableInHtmlTableProps.editable
        readonly editable?: boolean;
        /// ui-svelte-dom.SortedTableInHtmlTableProps.customCells
        readonly customCells?:
          | CellIdFromSchema<Schemas[0], TableId>[]
          | {
              [CellId in CellIdFromSchema<Schemas[0], TableId>]?:
                string | CustomCell<Schemas, TableId, CellId>;
            };
        /// ui-svelte-dom.SortedTableInHtmlTableProps.sortOnClick
        readonly sortOnClick?: boolean;
        /// ui-svelte-dom.SortedTableInHtmlTableProps.paginator
        readonly paginator?: boolean | Component<SortedTablePaginatorProps>;
        /// ui-svelte-dom.SortedTableInHtmlTableProps.onChange
        readonly onChange?: (
          sortAndOffset: [
            cellId: CellIdFromSchema<Schemas[0], TableId> | undefined,
            descending: boolean,
            offset: number,
          ],
        ) => void;
      }
    : never
  : never;

/// ui-svelte-dom.ValuesInHtmlTableProps
export type ValuesInHtmlTableProps<Schemas extends OptionalSchemas> = {
  /// ui-svelte-dom.ValuesInHtmlTableProps.store
  readonly store?: StoreOrStoreId<Schemas>;
  /// ui-svelte-dom.ValuesInHtmlTableProps.editable
  readonly editable?: boolean;
  /// ui-svelte-dom.ValuesInHtmlTableProps.valueComponent
  readonly valueComponent?: Component<ValueProps<Schemas>>;
  /// ui-svelte-dom.ValuesInHtmlTableProps.getValueComponentProps
  readonly getValueComponentProps?: (valueId: Id) => {[prop: string]: any};
};

/// ui-svelte-dom.SliceInHtmlTableProps
export type SliceInHtmlTableProps<Schemas extends OptionalSchemas> = {
  /// ui-svelte-dom.SliceInHtmlTableProps.indexId
  readonly indexId: Id;
  /// ui-svelte-dom.SliceInHtmlTableProps.sliceId
  readonly sliceId: Id;
  /// ui-svelte-dom.SliceInHtmlTableProps.indexes
  readonly indexes?: IndexesOrIndexesId<Schemas>;
  /// ui-svelte-dom.SliceInHtmlTableProps.editable
  readonly editable?: boolean;
  /// ui-svelte-dom.SliceInHtmlTableProps.customCells
  readonly customCells?:
    Ids | {[cellId: Id]: string | CustomCell<NoSchemas, Id, Id>};
};

/// ui-svelte-dom.RelationshipInHtmlTableProps
export type RelationshipInHtmlTableProps<Schemas extends OptionalSchemas> = {
  /// ui-svelte-dom.RelationshipInHtmlTable.relationshipId
  readonly relationshipId: Id;
  /// ui-svelte-dom.RelationshipInHtmlTable.relationships
  readonly relationships?: RelationshipsOrRelationshipsId<Schemas>;
  /// ui-svelte-dom.RelationshipInHtmlTable.editable
  readonly editable?: boolean;
  /// ui-svelte-dom.RelationshipInHtmlTable.customCells
  readonly customCells?:
    Ids | {[cellId: Id]: string | CustomCell<NoSchemas, Id, Id>};
};

/// ui-svelte-dom.ResultTableInHtmlTableProps
export type ResultTableInHtmlTableProps<Schemas extends OptionalSchemas> = {
  /// ui-svelte-dom.ResultTableInHtmlTableProps.queryId
  readonly queryId: Id;
  /// ui-svelte-dom.ResultTableInHtmlTableProps.queries
  readonly queries?: QueriesOrQueriesId<Schemas>;
  /// ui-svelte-dom.ResultTableInHtmlTableProps.customCells
  readonly customCells?:
    Ids | {[cellId: Id]: string | CustomResultCell<Schemas>};
};

/// ui-svelte-dom.ResultSortedTableInHtmlTableProps
export type ResultSortedTableInHtmlTableProps<Schemas extends OptionalSchemas> =
  {
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
    readonly queries?: QueriesOrQueriesId<Schemas>;
    /// ui-svelte-dom.ResultSortedTableInHtmlTableProps.customCells
    readonly customCells?:
      Ids | {[cellId: Id]: string | CustomResultCell<Schemas>};
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

export type WithSchemas<Schemas extends OptionalSchemas> = {
  /// ui-svelte-dom.TableInHtmlTable
  TableInHtmlTable: Component<TableInHtmlTableProps<Schemas> & HtmlTableProps>;

  /// ui-svelte-dom.SortedTableInHtmlTable
  SortedTableInHtmlTable: Component<
    SortedTableInHtmlTableProps<Schemas> & HtmlTableProps
  >;

  /// ui-svelte-dom.ValuesInHtmlTable
  ValuesInHtmlTable: Component<
    ValuesInHtmlTableProps<Schemas> & HtmlTableProps
  >;

  /// ui-svelte-dom.SliceInHtmlTable
  SliceInHtmlTable: Component<SliceInHtmlTableProps<Schemas> & HtmlTableProps>;

  /// ui-svelte-dom.RelationshipInHtmlTable
  RelationshipInHtmlTable: Component<
    RelationshipInHtmlTableProps<Schemas> & HtmlTableProps
  >;

  /// ui-svelte-dom.ResultTableInHtmlTable
  ResultTableInHtmlTable: Component<
    ResultTableInHtmlTableProps<Schemas> & HtmlTableProps
  >;

  /// ui-svelte-dom.ResultSortedTableInHtmlTable
  ResultSortedTableInHtmlTable: Component<
    ResultSortedTableInHtmlTableProps<Schemas> & HtmlTableProps
  >;

  /// ui-svelte-dom.EditableCellView
  EditableCellView: Component<
    CellProps<Schemas> & {
      className?: string;
      readonly showType?: boolean;
    }
  >;

  /// ui-svelte-dom.EditableValueView
  EditableValueView: Component<
    ValueProps<Schemas> & {
      className?: string;
      readonly showType?: boolean;
    }
  >;

  /// ui-svelte-dom.SortedTablePaginator
  SortedTablePaginator: Component<SortedTablePaginatorProps>;
};
