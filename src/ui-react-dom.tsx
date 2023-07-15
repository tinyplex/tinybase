/** @jsx createElement */

import {
  CellInHtmlTd as CellInHtmlTdDecl,
  DomProps,
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
import React from 'react';
import {isUndefined} from './common/other';

const {createElement} = React;

const useClassName = (className?: string): {className?: string} =>
  isUndefined(className) ? {} : {className};

export const CellInHtmlTd: typeof CellInHtmlTdDecl = ({
  className,
  ...props
}: CellProps & DomProps): any => (
  <td {...useClassName(className)}>
    <CellView {...props} />
  </td>
);

export const RowInHtmlTr: typeof RowInHtmlTrDecl = ({
  className,
  ...props
}: RowProps & DomProps): any => (
  <tr {...useClassName(className)}>
    <RowView cellComponent={CellInHtmlTd} {...props} />
  </tr>
);

export const SortedTableInHtmlTable: typeof SortedTableInHtmlTableDecl = ({
  className,
  ...props
}: SortedTableProps & DomProps): any => (
  <table {...useClassName(className)}>
    <tbody>
      <SortedTableView rowComponent={RowInHtmlTr} {...props} />
    </tbody>
  </table>
);

export const TableInHtmlTable: typeof TableInHtmlTableDecl = ({
  className,
  ...props
}: TableProps & DomProps): any => (
  <table {...useClassName(className)}>
    <tbody>
      <TableView rowComponent={RowInHtmlTr} {...props} />
    </tbody>
  </table>
);

export const ValueInHtmlTr: typeof ValueInHtmlTrDecl = ({
  className,
  ...props
}: ValueProps & DomProps): any => (
  <tr {...useClassName(className)}>
    <td>
      <ValueView {...props} />
    </td>
  </tr>
);

export const ValuesInHtmlTable: typeof ValuesInHtmlTableDecl = ({
  className,
  ...props
}: ValuesProps & DomProps): any => (
  <table {...useClassName(className)}>
    <tbody>
      <ValuesView valueComponent={ValueInHtmlTr} {...props} />
    </tbody>
  </table>
);
