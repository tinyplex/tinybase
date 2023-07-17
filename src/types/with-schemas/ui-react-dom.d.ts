/// ui-react-dom

import {
  CellProps,
  ComponentReturnType,
  ExtraProps,
  RowProps,
  SortedTableProps,
  StoreOrStoreId,
  TableProps,
  ValueProps,
} from './internal/ui-react';
import {ComponentType} from 'react';
import {Id} from '../common';
import {OptionalSchemas} from '../store';

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

/// HtmlProps
export type HtmlProps = {
  /// HtmlProps.className
  className?: string;
};

/// HtmlTableProps
export type HtmlTableProps = {
  /// HtmlTableProps.headerRow
  headerRow?: boolean;
  /// HtmlTableProps.idColumn
  idColumn?: boolean;
};

/// HtmlTrProps
export type HtmlTrProps = {
  /// HtmlTrProps.idColumn
  idColumn?: boolean;
};

export type WithSchemas<Schemas extends OptionalSchemas> = {
  /// CellInHtmlTd
  CellInHtmlTd: (props: CellProps<Schemas> & HtmlProps) => ComponentReturnType;

  /// RowInHtmlTr
  RowInHtmlTr: (
    props: RowProps<Schemas> & HtmlTrProps & HtmlProps,
  ) => ComponentReturnType;

  /// SortedTableInHtmlTable
  SortedTableInHtmlTable: (
    props: SortedTableProps<Schemas> & HtmlTableProps & HtmlProps,
  ) => ComponentReturnType;

  /// TableInHtmlTable
  TableInHtmlTable: (
    props: TableProps<Schemas> & HtmlTableProps & HtmlProps,
  ) => ComponentReturnType;

  /// ValuesInHtmlTable
  ValuesInHtmlTable: (
    props: ValuesInHtmlTableProps<Schemas>,
  ) => ComponentReturnType;
};
