/** @jsx createElement */

import {
  CellView,
  ValueView,
  useRowIds,
  useSortedRowIds,
  useTableCellIds,
  useValueIds,
} from './ui-react';
import {
  SortedTableInHtmlTable as SortedTableInHtmlTableDecl,
  SortedTableInHtmlTableProps,
  TableInHtmlTable as TableInHtmlTableDecl,
  TableInHtmlTableProps,
  ValuesInHtmlTable as ValuesInHtmlTableDecl,
  ValuesInHtmlTableProps,
} from './types/ui-react-dom.d';
import {ID} from './tools/common/strings';
import {Ids} from './types/common';
import React from 'react';
import {VALUE} from './common/strings';
import {arrayMap} from './common/array';
import {getProps} from './ui-react/common';

const {createElement} = React;

const HtmlTable = ({
  tableId,
  rowIds,
  store,
  cellComponent: Cell = CellView,
  getCellComponentProps,
  className,
  headerRow,
  idColumn,
  customCellIds,
}: TableInHtmlTableProps & {
  rowIds: Ids;
}) => {
  const defaultCellIds = useTableCellIds(tableId, store);
  const cellIds = customCellIds ?? defaultCellIds;
  return (
    <table className={className}>
      {headerRow === false ? null : (
        <thead>
          <tr>
            {idColumn === false ? null : <th>{ID}</th>}
            {arrayMap(cellIds, (cellId) => (
              <th key={cellId}>{cellId}</th>
            ))}
          </tr>
        </thead>
      )}
      <tbody>
        {arrayMap(rowIds, (rowId) => (
          <tr key={rowId}>
            {idColumn === false ? null : <th>{rowId}</th>}
            {arrayMap(cellIds, (cellId) => (
              <td key={cellId}>
                <Cell
                  {...getProps(getCellComponentProps, rowId, cellId)}
                  tableId={tableId}
                  rowId={rowId}
                  cellId={cellId}
                  store={store}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export const TableInHtmlTable: typeof TableInHtmlTableDecl = ({
  tableId,
  store,
  ...props
}: TableInHtmlTableProps): any => (
  <HtmlTable
    {...props}
    tableId={tableId}
    store={store}
    rowIds={useRowIds(tableId, store)}
  />
);

export const SortedTableInHtmlTable: typeof SortedTableInHtmlTableDecl = ({
  tableId,
  cellId,
  descending,
  offset,
  limit,
  store,
  ...props
}: SortedTableInHtmlTableProps): any => (
  <HtmlTable
    {...props}
    tableId={tableId}
    store={store}
    rowIds={useSortedRowIds(tableId, cellId, descending, offset, limit, store)}
  />
);

export const ValuesInHtmlTable: typeof ValuesInHtmlTableDecl = ({
  store,
  valueComponent: Value = ValueView,
  getValueComponentProps,
  className,
  headerRow,
  idColumn,
}: ValuesInHtmlTableProps): any => (
  <table className={className}>
    {headerRow === false ? null : (
      <thead>
        <tr>
          {idColumn === false ? null : <th>{ID}</th>}
          <th>{VALUE}</th>
        </tr>
      </thead>
    )}
    <tbody>
      {arrayMap(useValueIds(store), (valueId) => (
        <tr key={valueId}>
          {idColumn === false ? null : <th>{valueId}</th>}
          <td>
            <Value
              {...getProps(getValueComponentProps, valueId)}
              valueId={valueId}
              store={store}
            />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);
