/// ui-react-dom

import type {
  CellIdFromSchema,
  TableIdFromSchema,
} from '../../_internal/store/with-schemas/index.d.ts';
import type {
  CellProps,
  CellPropsForTableIdAndCellId,
  ComponentReturnType,
  ExtraProps,
  IndexesOrIndexesId,
  QueriesOrQueriesId,
  RelationshipsOrRelationshipsId,
  ResultCellProps,
  StoreOrStoreId,
  ValueProps,
} from '../../_internal/ui-react/with-schemas/index.d.ts';
import type {Id, Ids} from '../../common/with-schemas/index.d.ts';
import type {ComponentType} from 'react';
import type {NoSchemas} from '../../store/index.d.ts';
import type {OptionalSchemas} from '../../store/with-schemas/index.d.ts';

/// CustomCell
export type CustomCell<
  Schemas extends OptionalSchemas,
  TableId extends TableIdFromSchema<Schemas[0]>,
  CellId extends CellIdFromSchema<Schemas[0], TableId>,
> = {
  /// CustomCell.label
  label?: string;
  /// CustomCell.component
  component?: ComponentType<
    CellPropsForTableIdAndCellId<Schemas, TableId, CellId>
  >;
  /// CustomCell.getComponentProps
  getComponentProps?: (rowId: Id, cellId: CellId) => ExtraProps;
};

/// CustomResultCell
export type CustomResultCell<Schemas extends OptionalSchemas> = {
  /// CustomResultCell.label
  label?: string;
  /// CustomResultCell.component
  component?: ComponentType<ResultCellProps<Schemas>>;
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
export type TableInHtmlTableProps<
  Schemas extends OptionalSchemas,
  TableIds extends TableIdFromSchema<Schemas[0]> = TableIdFromSchema<
    Schemas[0]
  >,
> = TableIds extends infer TableId
  ? TableId extends TableIdFromSchema<Schemas[0]>
    ? {
        /// TableInHtmlTableProps.tableId
        readonly tableId: TableId;
        /// TableInHtmlTableProps.store
        readonly store?: StoreOrStoreId<Schemas>;
        /// TableInHtmlTableProps.editable
        readonly editable?: boolean;
        /// TableInHtmlTableProps.customCells
        readonly customCells?:
          | CellIdFromSchema<Schemas[0], TableId>[]
          | {
              [CellId in CellIdFromSchema<Schemas[0], TableId>]?:
                | string
                | CustomCell<Schemas, TableId, CellId>;
            };
      }
    : never
  : never;

/// SortedTableInHtmlTableProps
export type SortedTableInHtmlTableProps<
  Schemas extends OptionalSchemas,
  TableIds extends TableIdFromSchema<Schemas[0]> = TableIdFromSchema<
    Schemas[0]
  >,
> = TableIds extends infer TableId
  ? TableId extends TableIdFromSchema<Schemas[0]>
    ? {
        /// SortedTableInHtmlTableProps.tableId
        readonly tableId: TableId;
        /// SortedTableInHtmlTableProps.cellId
        readonly cellId?: CellIdFromSchema<Schemas[0], TableId>;
        /// SortedTableInHtmlTableProps.descending
        readonly descending?: boolean;
        /// SortedTableInHtmlTableProps.offset
        readonly offset?: number;
        /// SortedTableInHtmlTableProps.limit
        readonly limit?: number;
        /// SortedTableInHtmlTableProps.store
        readonly store?: StoreOrStoreId<Schemas>;
        /// SortedTableInHtmlTableProps.editable
        readonly editable?: boolean;
        /// SortedTableInHtmlTableProps.customCells
        readonly customCells?:
          | CellIdFromSchema<Schemas[0], TableId>[]
          | {
              [CellId in CellIdFromSchema<Schemas[0], TableId>]?:
                | string
                | CustomCell<Schemas, TableId, CellId>;
            };
        /// SortedTableInHtmlTableProps.sortOnClick
        readonly sortOnClick?: boolean;
        /// SortedTableInHtmlTableProps.paginator
        readonly paginator?: boolean | ComponentType<SortedTablePaginatorProps>;
        /// SortedTableInHtmlTableProps.onChange
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

/// ValuesInHtmlTableProps
export type ValuesInHtmlTableProps<Schemas extends OptionalSchemas> = {
  /// ValuesInHtmlTableProps.store
  readonly store?: StoreOrStoreId<Schemas>;
  /// ValuesInHtmlTableProps.editable
  readonly editable?: boolean;
  /// ValuesInHtmlTableProps.valueComponent
  readonly valueComponent?: ComponentType<ValueProps<Schemas>>;
  /// ValuesInHtmlTableProps.getValueComponentProps
  readonly getValueComponentProps?: (valueId: Id) => ExtraProps;
};

/// SliceInHtmlTableProps
export type SliceInHtmlTableProps<Schemas extends OptionalSchemas> = {
  /// SliceInHtmlTableProps.indexId
  readonly indexId: Id;
  /// SliceInHtmlTableProps.sliceId
  readonly sliceId: Id;
  /// SliceInHtmlTableProps.indexes
  readonly indexes?: IndexesOrIndexesId<Schemas>;
  /// SliceInHtmlTableProps.editable
  readonly editable?: boolean;
  /// SliceInHtmlTableProps.customCells
  readonly customCells?:
    | Ids
    | {[cellId: Id]: string | CustomCell<NoSchemas, Id, Id>};
};

/// RelationshipInHtmlTableProps
export type RelationshipInHtmlTableProps<Schemas extends OptionalSchemas> = {
  /// RelationshipInHtmlTable.relationshipId
  readonly relationshipId: Id;
  /// RelationshipInHtmlTable.relationships
  readonly relationships?: RelationshipsOrRelationshipsId<Schemas>;
  /// RelationshipInHtmlTable.editable
  readonly editable?: boolean;
  /// RelationshipInHtmlTable.customCells
  readonly customCells?:
    | Ids
    | {[cellId: Id]: string | CustomCell<NoSchemas, Id, Id>};
};

/// ResultTableInHtmlTableProps
export type ResultTableInHtmlTableProps<Schemas extends OptionalSchemas> = {
  /// ResultTableInHtmlTableProps.queryId
  readonly queryId: Id;
  /// ResultTableInHtmlTableProps.queries
  readonly queries?: QueriesOrQueriesId<Schemas>;
  /// ResultTableInHtmlTableProps.customCells
  readonly customCells?:
    | Ids
    | {[cellId: Id]: string | CustomResultCell<Schemas>};
};

/// ResultSortedTableInHtmlTableProps
export type ResultSortedTableInHtmlTableProps<Schemas extends OptionalSchemas> =
  {
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
    readonly queries?: QueriesOrQueriesId<Schemas>;
    /// ResultSortedTableInHtmlTableProps.customCells
    readonly customCells?:
      | Ids
      | {[cellId: Id]: string | CustomResultCell<Schemas>};
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

export type WithSchemas<Schemas extends OptionalSchemas> = {
  /// TableInHtmlTable
  TableInHtmlTable: (
    props: TableInHtmlTableProps<Schemas> & HtmlTableProps,
  ) => ComponentReturnType;

  /// SortedTableInHtmlTable
  SortedTableInHtmlTable: (
    props: SortedTableInHtmlTableProps<Schemas> & HtmlTableProps,
  ) => ComponentReturnType;

  /// ValuesInHtmlTable
  ValuesInHtmlTable: (
    props: ValuesInHtmlTableProps<Schemas> & HtmlTableProps,
  ) => ComponentReturnType;

  /// SliceInHtmlTable
  SliceInHtmlTable: (
    props: SliceInHtmlTableProps<Schemas> & HtmlTableProps,
  ) => ComponentReturnType;

  /// RelationshipInHtmlTable
  RelationshipInHtmlTable: (
    props: RelationshipInHtmlTableProps<Schemas> & HtmlTableProps,
  ) => ComponentReturnType;

  /// ResultTableInHtmlTable
  ResultTableInHtmlTable: (
    props: ResultTableInHtmlTableProps<Schemas> & HtmlTableProps,
  ) => ComponentReturnType;

  /// ResultSortedTableInHtmlTable
  ResultSortedTableInHtmlTable: (
    props: ResultSortedTableInHtmlTableProps<Schemas> & HtmlTableProps,
  ) => ComponentReturnType;

  /// EditableCellView
  EditableCellView: (
    props: CellProps<Schemas> & {
      className?: string;
      readonly showType?: boolean;
    },
  ) => ComponentReturnType;

  /// EditableValueView
  EditableValueView: (
    props: ValueProps<Schemas> & {
      className?: string;
      readonly showType?: boolean;
    },
  ) => ComponentReturnType;

  /// SortedTablePaginator
  SortedTablePaginator: (
    props: SortedTablePaginatorProps,
  ) => ComponentReturnType;
};
