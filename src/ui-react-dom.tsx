/** @jsx createElement */

import {
  CellView,
  ValueView,
  useRowIds,
  useSortedRowIds,
  useTableCellIds,
  useValueIds,
} from './ui-react';
import {EMPTY_STRING, VALUE} from './common/strings';
import {IdOrNull, Ids} from './types/common';
import {
  SortedTableInHtmlTable as SortedTableInHtmlTableDecl,
  SortedTableInHtmlTableProps,
  TableInHtmlTable as TableInHtmlTableDecl,
  TableInHtmlTableProps,
  ValuesInHtmlTable as ValuesInHtmlTableDecl,
  ValuesInHtmlTableProps,
} from './types/ui-react-dom.d';
import React from 'react';
import {arrayMap} from './common/array';
import {getProps} from './ui-react/common';
import {isUndefined} from './common/other';

const {createElement} = React;

const sortedClassName = (
  sorted: [IdOrNull, boolean?] | undefined,
  cellId: IdOrNull,
) =>
  isUndefined(sorted)
    ? undefined
    : sorted[0] != cellId
    ? undefined
    : `sorted ${sorted[1] ? 'de' : 'a'}scending`;

const HtmlHeaderTh = ({
  cellId,
  sorted,
  label = cellId ?? EMPTY_STRING,
}: {
  cellId: IdOrNull;
  sorted?: [IdOrNull, boolean?];
  label?: string;
}) => {
  return <th className={sortedClassName(sorted, cellId)}>{label}</th>;
};

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
  sorted,
}: TableInHtmlTableProps & {
  rowIds: Ids;
  sorted?: [IdOrNull, boolean?];
}) => {
  const defaultCellIds = useTableCellIds(tableId, store);
  const cellIds = customCellIds ?? defaultCellIds;
  return (
    <table className={className}>
      {headerRow === false ? null : (
        <thead>
          <tr>
            {idColumn === false ? null : (
              <HtmlHeaderTh cellId={null} sorted={sorted} label="Id" />
            )}
            {arrayMap(cellIds, (cellId) => (
              <HtmlHeaderTh key={cellId} cellId={cellId} sorted={sorted} />
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
    sorted={[cellId ?? null, descending]}
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
          {idColumn === false ? null : <th>Id</th>}
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
