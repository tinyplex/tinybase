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
        /// TableInHtmlTableProps.cellComponent
        readonly cellComponent?: ComponentType<CellProps<Schemas>>;
        /// TableInHtmlTableProps.getCellComponentProps
        readonly getCellComponentProps?: (rowId: Id, cellId: Id) => ExtraProps;
        /// TableInHtmlTableProps.className
        readonly className?: string;
        /// TableInHtmlTableProps.headerRow
        readonly headerRow?: boolean;
        /// TableInHtmlTableProps.idColumn
        readonly idColumn?: boolean;
        /// TableInHtmlTableProps.customCellIds
        readonly customCellIds?: CellIdFromSchema<Schemas[0], TableId>[];
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
        /// SortedTableInHtmlTableProps.cellComponent
        readonly cellComponent?: ComponentType<CellProps<Schemas>>;
        /// SortedTableInHtmlTableProps.getCellComponentProps
        readonly getCellComponentProps?: (rowId: Id, cellId: Id) => ExtraProps;
        /// SortedTableInHtmlTableProps.className
        readonly className?: string;
        /// SortedTableInHtmlTableProps.headerRow
        readonly headerRow?: boolean;
        /// SortedTableInHtmlTableProps.idColumn
        readonly idColumn?: boolean;
        /// SortedTableInHtmlTableProps.customCellIds
        readonly customCellIds?: CellIdFromSchema<Schemas[0], TableId>[];
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
  /// ValuesInHtmlTableProps.className
  readonly className?: string;
  /// ValuesInHtmlTableProps.headerRow
  readonly headerRow?: boolean;
  /// ValuesInHtmlTableProps.idColumn
  readonly idColumn?: boolean;
};

export type WithSchemas<Schemas extends OptionalSchemas> = {
  /// TableInHtmlTable
  TableInHtmlTable: (
    props: TableInHtmlTableProps<Schemas>,
  ) => ComponentReturnType;

  /// SortedTableInHtmlTable
  SortedTableInHtmlTable: (
    props: SortedTableInHtmlTableProps<Schemas>,
  ) => ComponentReturnType;

  /// ValuesInHtmlTable
  ValuesInHtmlTable: (
    props: ValuesInHtmlTableProps<Schemas>,
  ) => ComponentReturnType;
};
