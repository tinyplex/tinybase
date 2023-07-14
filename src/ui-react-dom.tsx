/** @jsx createElement */

import {
  CellProps,
  RowProps,
  SortedTableProps,
  TableProps,
} from './types/ui-react.d';
import {CellView, RowView, SortedTableView, TableView} from './ui-react';
import {
  DomSortedTableView as DomSortedTableViewDecl,
  DomTableCellView as DomTableCellViewDecl,
  DomTableRowView as DomTableRowViewDecl,
  DomTableView as DomTableViewDecl,
} from './types/ui-react-dom.d';
import React from 'react';

const {createElement} = React;

export const DomTableCellView: typeof DomTableCellViewDecl = (
  props: CellProps,
): any => (
  <td>
    <CellView {...props} />
  </td>
);

export const DomTableRowView: typeof DomTableRowViewDecl = (
  props: RowProps,
): any => (
  <tr>
    <RowView cellComponent={DomTableCellView} {...props} />
  </tr>
);

export const DomSortedTableView: typeof DomSortedTableViewDecl = (
  props: SortedTableProps,
): any => (
  <table>
    <tbody>
      <SortedTableView rowComponent={DomTableRowView} {...props} />
    </tbody>
  </table>
);

export const DomTableView: typeof DomTableViewDecl = (
  props: TableProps,
): any => (
  <table>
    <tbody>
      <TableView rowComponent={DomTableRowView} {...props} />
    </tbody>
  </table>
);
