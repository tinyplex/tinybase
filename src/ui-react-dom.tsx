/** @jsx createElement */

import {
  CellInHtmlTd as CellInHtmlTdDecl,
  HtmlProps,
  HtmlTableProps,
  HtmlTrProps,
  RowInHtmlTr as RowInHtmlTrDecl,
  SortedTableInHtmlTable as SortedTableInHtmlTableDecl,
  TableInHtmlTable as TableInHtmlTableDecl,
  ValueInHtmlTr as ValueInHtmlTrDecl,
  ValuesInHtmlTable as ValuesInHtmlTableDecl,
} from './types/ui-react-dom.d';
import {
  CellProps,
  RowProps,
  SortedTableProps,
  TableProps,
  ValueProps,
  ValuesProps,
} from './types/ui-react.d';
import {
  CellView,
  RowView,
  SortedTableView,
  TableView,
  ValueView,
  ValuesView,
} from './ui-react';
import React, {useCallback} from 'react';
import {isUndefined} from './common/other';

const {createElement} = React;

const useClassName = (className?: string): {className?: string} =>
  isUndefined(className) ? {} : {className};

const useGetTrProps = (idColumn = true): (() => {idColumn: boolean}) =>
  useCallback(() => ({idColumn}), [idColumn]);

export const CellInHtmlTd: typeof CellInHtmlTdDecl = ({
  className,
  ...props
}: CellProps & HtmlProps): any => (
  <td {...useClassName(className)}>
    <CellView {...props} />
  </td>
);

export const RowInHtmlTr: typeof RowInHtmlTrDecl = ({
  className,
  idColumn,
  ...props
}: RowProps & HtmlTrProps & HtmlProps): any => (
  <tr {...useClassName(className)}>
    {idColumn === false ? null : <th>{props.rowId}</th>}
    <RowView cellComponent={CellInHtmlTd} {...props} />
  </tr>
);

export const SortedTableInHtmlTable: typeof SortedTableInHtmlTableDecl = ({
  className,
  idColumn,
  ...props
}: SortedTableProps & HtmlTableProps & HtmlProps): any => (
  <table {...useClassName(className)}>
    <tbody>
      <SortedTableView
        rowComponent={RowInHtmlTr}
        getRowComponentProps={useGetTrProps(idColumn)}
        {...props}
      />
    </tbody>
  </table>
);

export const TableInHtmlTable: typeof TableInHtmlTableDecl = ({
  className,
  idColumn,
  ...props
}: TableProps & HtmlTableProps & HtmlProps): any => (
  <table {...useClassName(className)}>
    <tbody>
      <TableView
        rowComponent={RowInHtmlTr}
        getRowComponentProps={useGetTrProps(idColumn)}
        {...props}
      />
    </tbody>
  </table>
);

export const ValueInHtmlTr: typeof ValueInHtmlTrDecl = ({
  className,
  idColumn,
  ...props
}: ValueProps & HtmlTrProps & HtmlProps): any => (
  <tr {...useClassName(className)}>
    {idColumn === false ? null : <th>{props.valueId}</th>}
    <td>
      <ValueView {...props} />
    </td>
  </tr>
);

export const ValuesInHtmlTable: typeof ValuesInHtmlTableDecl = ({
  className,
  idColumn,
  ...props
}: ValuesProps & HtmlTableProps & HtmlProps): any => (
  <table {...useClassName(className)}>
    <tbody>
      <ValuesView
        valueComponent={ValueInHtmlTr}
        getValueComponentProps={useGetTrProps(idColumn)}
        {...props}
      />
    </tbody>
  </table>
);
