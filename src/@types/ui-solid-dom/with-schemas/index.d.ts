/// ui-solid-dom
import type {Component} from 'solid-js';
import type {
  CellIdFromSchema,
  TableIdFromSchema,
} from '../../_internal/store/with-schemas/index.d.ts';
import type {
  CellProps,
  CellPropsForTableIdAndCellId,
  ComponentReturnType,
  ExtraProps,
  ResultCellProps,
  RowProps,
  ValueProps,
} from '../../_internal/ui-solid/with-schemas/index.d.ts';
import type {
  IndexesOrIndexesId,
  QueriesOrQueriesId,
  RelationshipsOrRelationshipsId,
  StoreOrStoreId,
} from '../../_internal/ui/with-schemas/index.d.ts';
import type {Id, Ids} from '../../common/with-schemas/index.d.ts';
import type {NoSchemas} from '../../store/index.d.ts';
import type {OptionalSchemas} from '../../store/with-schemas/index.d.ts';

/// ui-solid-dom.CustomCell
export type CustomCell<
  Schemas extends OptionalSchemas,
  TableId extends TableIdFromSchema<Schemas[0]>,
  CellId extends CellIdFromSchema<Schemas[0], TableId>,
> = {
  /// ui-solid-dom.CustomCell.label
  label?: string;
  /// ui-solid-dom.CustomCell.component
  component?: Component<CellPropsForTableIdAndCellId<Schemas, TableId, CellId>>;
  /// ui-solid-dom.CustomCell.getComponentProps
  getComponentProps?: (rowId: Id, cellId: CellId) => ExtraProps;
};

/// ui-solid-dom.CustomResultCell
export type CustomResultCell<Schemas extends OptionalSchemas> = {
  /// ui-solid-dom.CustomResultCell.label
  label?: string;
  /// ui-solid-dom.CustomResultCell.component
  component?: Component<ResultCellProps<Schemas>>;
  /// ui-solid-dom.CustomResultCell.getComponentProps
  getComponentProps?: (rowId: Id, cellId: Id) => ExtraProps;
};

/// ui-solid-dom.ExtraRowCell
export type ExtraRowCell<
  Schemas extends OptionalSchemas,
  TableId extends TableIdFromSchema<Schemas[0]>,
> = {
  /// ui-solid-dom.ExtraRowCell.label
  label: string;
  /// ui-solid-dom.ExtraRowCell.component
  component: Component<RowProps<Schemas, TableId>>;
};

/// ui-solid-dom.ExtraValueCell
export type ExtraValueCell<Schemas extends OptionalSchemas> = {
  /// ui-solid-dom.ExtraValueCell.label
  label: string;
  /// ui-solid-dom.ExtraValueCell.component
  component: Component<ValueProps<Schemas>>;
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
export type TableInHtmlTableProps<
  Schemas extends OptionalSchemas,
  TableIds extends TableIdFromSchema<Schemas[0]> = TableIdFromSchema<
    Schemas[0]
  >,
> = TableIds extends infer TableId
  ? TableId extends TableIdFromSchema<Schemas[0]>
    ? {
        /// ui-solid-dom.TableInHtmlTableProps.tableId
        readonly tableId: TableId;
        /// ui-solid-dom.TableInHtmlTableProps.store
        readonly store?: StoreOrStoreId<Schemas>;
        /// ui-solid-dom.TableInHtmlTableProps.editable
        readonly editable?: boolean;
        /// ui-solid-dom.TableInHtmlTableProps.customCells
        readonly customCells?:
          | CellIdFromSchema<Schemas[0], TableId>[]
          | {
              [CellId in CellIdFromSchema<Schemas[0], TableId>]?:
                string | CustomCell<Schemas, TableId, CellId>;
            };
      }
    : never
  : never;

/// ui-solid-dom.SortedTableInHtmlTableProps
export type SortedTableInHtmlTableProps<
  Schemas extends OptionalSchemas,
  TableIds extends TableIdFromSchema<Schemas[0]> = TableIdFromSchema<
    Schemas[0]
  >,
> = TableIds extends infer TableId
  ? TableId extends TableIdFromSchema<Schemas[0]>
    ? {
        /// ui-solid-dom.SortedTableInHtmlTableProps.tableId
        readonly tableId: TableId;
        /// ui-solid-dom.SortedTableInHtmlTableProps.cellId
        readonly cellId?: CellIdFromSchema<Schemas[0], TableId>;
        /// ui-solid-dom.SortedTableInHtmlTableProps.descending
        readonly descending?: boolean;
        /// ui-solid-dom.SortedTableInHtmlTableProps.offset
        readonly offset?: number;
        /// ui-solid-dom.SortedTableInHtmlTableProps.limit
        readonly limit?: number;
        /// ui-solid-dom.SortedTableInHtmlTableProps.store
        readonly store?: StoreOrStoreId<Schemas>;
        /// ui-solid-dom.SortedTableInHtmlTableProps.editable
        readonly editable?: boolean;
        /// ui-solid-dom.SortedTableInHtmlTableProps.customCells
        readonly customCells?:
          | CellIdFromSchema<Schemas[0], TableId>[]
          | {
              [CellId in CellIdFromSchema<Schemas[0], TableId>]?:
                string | CustomCell<Schemas, TableId, CellId>;
            };
        /// ui-solid-dom.SortedTableInHtmlTableProps.sortOnClick
        readonly sortOnClick?: boolean;
        /// ui-solid-dom.SortedTableInHtmlTableProps.paginator
        readonly paginator?: boolean | Component<SortedTablePaginatorProps>;
        /// ui-solid-dom.SortedTableInHtmlTableProps.onChange
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

/// ui-solid-dom.ValuesInHtmlTableProps
export type ValuesInHtmlTableProps<Schemas extends OptionalSchemas> = {
  /// ui-solid-dom.ValuesInHtmlTableProps.store
  readonly store?: StoreOrStoreId<Schemas>;
  /// ui-solid-dom.ValuesInHtmlTableProps.editable
  readonly editable?: boolean;
  /// ui-solid-dom.ValuesInHtmlTableProps.valueComponent
  readonly valueComponent?: Component<ValueProps<Schemas>>;
  /// ui-solid-dom.ValuesInHtmlTableProps.getValueComponentProps
  readonly getValueComponentProps?: (valueId: Id) => ExtraProps;
};

/// ui-solid-dom.SliceInHtmlTableProps
export type SliceInHtmlTableProps<Schemas extends OptionalSchemas> = {
  /// ui-solid-dom.SliceInHtmlTableProps.indexId
  readonly indexId: Id;
  /// ui-solid-dom.SliceInHtmlTableProps.sliceId
  readonly sliceId: Id;
  /// ui-solid-dom.SliceInHtmlTableProps.indexes
  readonly indexes?: IndexesOrIndexesId<Schemas>;
  /// ui-solid-dom.SliceInHtmlTableProps.editable
  readonly editable?: boolean;
  /// ui-solid-dom.SliceInHtmlTableProps.customCells
  readonly customCells?:
    Ids | {[cellId: Id]: string | CustomCell<NoSchemas, Id, Id>};
};

/// ui-solid-dom.RelationshipInHtmlTableProps
export type RelationshipInHtmlTableProps<Schemas extends OptionalSchemas> = {
  /// ui-solid-dom.RelationshipInHtmlTable.relationshipId
  readonly relationshipId: Id;
  /// ui-solid-dom.RelationshipInHtmlTable.relationships
  readonly relationships?: RelationshipsOrRelationshipsId<Schemas>;
  /// ui-solid-dom.RelationshipInHtmlTable.editable
  readonly editable?: boolean;
  /// ui-solid-dom.RelationshipInHtmlTable.customCells
  readonly customCells?:
    Ids | {[cellId: Id]: string | CustomCell<NoSchemas, Id, Id>};
};

/// ui-solid-dom.ResultTableInHtmlTableProps
export type ResultTableInHtmlTableProps<Schemas extends OptionalSchemas> = {
  /// ui-solid-dom.ResultTableInHtmlTableProps.queryId
  readonly queryId: Id;
  /// ui-solid-dom.ResultTableInHtmlTableProps.queries
  readonly queries?: QueriesOrQueriesId<Schemas>;
  /// ui-solid-dom.ResultTableInHtmlTableProps.customCells
  readonly customCells?:
    Ids | {[cellId: Id]: string | CustomResultCell<Schemas>};
};

/// ui-solid-dom.ResultSortedTableInHtmlTableProps
export type ResultSortedTableInHtmlTableProps<Schemas extends OptionalSchemas> =
  {
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
    readonly queries?: QueriesOrQueriesId<Schemas>;
    /// ui-solid-dom.ResultSortedTableInHtmlTableProps.customCells
    readonly customCells?:
      Ids | {[cellId: Id]: string | CustomResultCell<Schemas>};
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

export type WithSchemas<Schemas extends OptionalSchemas> = {
  /// ui-solid-dom.TableInHtmlTable
  TableInHtmlTable: (
    props: TableInHtmlTableProps<Schemas> & HtmlTableProps,
  ) => ComponentReturnType;

  /// ui-solid-dom.SortedTableInHtmlTable
  SortedTableInHtmlTable: (
    props: SortedTableInHtmlTableProps<Schemas> & HtmlTableProps,
  ) => ComponentReturnType;

  /// ui-solid-dom.ValuesInHtmlTable
  ValuesInHtmlTable: (
    props: ValuesInHtmlTableProps<Schemas> & HtmlTableProps,
  ) => ComponentReturnType;

  /// ui-solid-dom.SliceInHtmlTable
  SliceInHtmlTable: (
    props: SliceInHtmlTableProps<Schemas> & HtmlTableProps,
  ) => ComponentReturnType;

  /// ui-solid-dom.RelationshipInHtmlTable
  RelationshipInHtmlTable: (
    props: RelationshipInHtmlTableProps<Schemas> & HtmlTableProps,
  ) => ComponentReturnType;

  /// ui-solid-dom.ResultTableInHtmlTable
  ResultTableInHtmlTable: (
    props: ResultTableInHtmlTableProps<Schemas> & HtmlTableProps,
  ) => ComponentReturnType;

  /// ui-solid-dom.ResultSortedTableInHtmlTable
  ResultSortedTableInHtmlTable: (
    props: ResultSortedTableInHtmlTableProps<Schemas> & HtmlTableProps,
  ) => ComponentReturnType;

  /// ui-solid-dom.EditableCellView
  EditableCellView: (
    props: CellProps<Schemas> & {
      className?: string;
      readonly showType?: boolean;
    },
  ) => ComponentReturnType;

  /// ui-solid-dom.EditableValueView
  EditableValueView: (
    props: ValueProps<Schemas> & {
      className?: string;
      readonly showType?: boolean;
    },
  ) => ComponentReturnType;

  /// ui-solid-dom.SortedTablePaginator
  SortedTablePaginator: (
    props: SortedTablePaginatorProps,
  ) => ComponentReturnType;
};
