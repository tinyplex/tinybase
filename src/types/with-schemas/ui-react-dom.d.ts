/// ui-react-dom

import {CellIdFromSchema, TableIdFromSchema} from './internal/store';
import {
  CellProps,
  ComponentReturnType,
  ExtraProps,
  StoreOrStoreId,
  ValueProps,
} from './internal/ui-react';
import {ComponentType} from 'react';
import {Id} from '../common';
import {OptionalSchemas} from '../store';

// CustomCell
export type CustomCell<
  Schemas extends OptionalSchemas,
  TableId extends TableIdFromSchema<Schemas[0]>,
> = {
  /// CustomCell.label
  readonly label?: string;
  /// CustomCell.component
  readonly component?: ComponentType<CellProps<Schemas>>;
  /// CustomCell.getComponentProps
  readonly getComponentProps?: (
    rowId: Id,
    cellId: CellIdFromSchema<Schemas[0], TableId>,
  ) => ExtraProps;
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
        /// TableInHtmlTableProps.customCells
        readonly customCells?:
          | CellIdFromSchema<Schemas[0], TableId>[]
          | {[cellId: Id]: string | CustomCell<Schemas, TableId>};
      }
    : never
  : never;

// SortedTableInHtmlTableProps
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
        readonly cellId?: Id;
        /// SortedTableInHtmlTableProps.descending
        readonly descending?: boolean;
        /// SortedTableInHtmlTableProps.offset
        readonly offset?: number;
        /// SortedTableInHtmlTableProps.limit
        readonly limit?: number;
        /// SortedTableInHtmlTableProps.store
        readonly store?: StoreOrStoreId<Schemas>;
        /// SortedTableInHtmlTableProps.customCells
        readonly customCells?:
          | CellIdFromSchema<Schemas[0], TableId>[]
          | {[cellId: Id]: string | CustomCell<Schemas, TableId>};
        /// SortedTableInHtmlTableProps.sortOnClick
        readonly sortOnClick?: boolean;
      }
    : never
  : never;

// ValuesInHtmlTableProps
export type ValuesInHtmlTableProps<Schemas extends OptionalSchemas> = {
  /// ValuesInHtmlTableProps.store
  readonly store?: StoreOrStoreId<Schemas>;
  /// ValuesInHtmlTableProps.valueComponent
  readonly valueComponent?: ComponentType<ValueProps<Schemas>>;
  /// ValuesInHtmlTableProps.getValueComponentProps
  readonly getValueComponentProps?: (valueId: Id) => ExtraProps;
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
};
