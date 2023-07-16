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
  StoreOrStoreId,
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
  useTableCellIds,
} from './ui-react';
import {Id, Ids} from './types/common';
import React, {useCallback} from 'react';
import {ID} from './tools/common/strings';
import {VALUE} from './common/strings';
import {arrayMap} from './common/array';
import {isUndefined} from './common/other';

const {createElement} = React;

const useClassName = (className?: string): {className?: string} =>
  isUndefined(className) ? {} : {className};

const useGetTrProps = (idColumn = true): (() => {idColumn: boolean}) =>
  useCallback(() => ({idColumn}), [idColumn]);

const useCustomOrDefaultTableCellIds = (
  customCellIds: Ids | undefined,
  tableId: Id,
  store?: StoreOrStoreId,
): Ids => {
  const defaultTableCellIds = useTableCellIds(tableId, store);
  return customCellIds ?? defaultTableCellIds;
};

export const CellInHtmlTd: typeof CellInHtmlTdDecl = ({
  className,
  ...props
}: CellProps & HtmlProps): any => (
  <td {...useClassName(className)}>
    <CellView {...props} />
  </td>
);

export const RowInHtmlTr: typeof RowInHtmlTrDecl = ({
  idColumn,
  className,
  rowId,
  ...props
}: RowProps & HtmlTrProps & HtmlProps): any => (
  <tr {...useClassName(className)}>
    {idColumn === false ? null : <th>{rowId}</th>}
    <RowView cellComponent={CellInHtmlTd} rowId={rowId} {...props} />
  </tr>
);

export const SortedTableInHtmlTable: typeof SortedTableInHtmlTableDecl = ({
  headerRow,
  idColumn,
  className,
  store,
  tableId,
  customCellIds,
  ...props
}: SortedTableProps & HtmlTableProps & HtmlProps): any => {
  const tableCellIds = useCustomOrDefaultTableCellIds(
    customCellIds,
    tableId,
    store,
  );
  return (
    <table {...useClassName(className)}>
      {headerRow === false ? null : (
        <thead>
          <tr>
            {idColumn === false ? null : <th>{ID}</th>}
            {arrayMap(tableCellIds, (tableCellId) => (
              <th key={tableCellId}>{tableCellId}</th>
            ))}
          </tr>
        </thead>
      )}
      <tbody>
        <SortedTableView
          rowComponent={RowInHtmlTr}
          getRowComponentProps={useGetTrProps(idColumn)}
          store={store}
          tableId={tableId}
          customCellIds={tableCellIds}
          {...props}
        />
      </tbody>
    </table>
  );
};

export const TableInHtmlTable: typeof TableInHtmlTableDecl = ({
  headerRow,
  idColumn,
  className,
  store,
  tableId,
  customCellIds,
  ...props
}: TableProps & HtmlTableProps & HtmlProps): any => {
  const tableCellIds = useCustomOrDefaultTableCellIds(
    customCellIds,
    tableId,
    store,
  );
  return (
    <table {...useClassName(className)}>
      {headerRow === false ? null : (
        <thead>
          <tr>
            {idColumn === false ? null : <th>{ID}</th>}
            {arrayMap(tableCellIds, (tableCellId) => (
              <th key={tableCellId}>{tableCellId}</th>
            ))}
          </tr>
        </thead>
      )}
      <tbody>
        <TableView
          rowComponent={RowInHtmlTr}
          getRowComponentProps={useGetTrProps(idColumn)}
          store={store}
          tableId={tableId}
          customCellIds={tableCellIds}
          {...props}
        />
      </tbody>
    </table>
  );
};

export const ValueInHtmlTr: typeof ValueInHtmlTrDecl = ({
  idColumn,
  className,
  valueId,
  ...props
}: ValueProps & HtmlTrProps & HtmlProps): any => (
  <tr {...useClassName(className)}>
    {idColumn === false ? null : <th>{valueId}</th>}
    <td>
      <ValueView valueId={valueId} {...props} />
    </td>
  </tr>
);

export const ValuesInHtmlTable: typeof ValuesInHtmlTableDecl = ({
  headerRow,
  idColumn,
  className,
  ...props
}: ValuesProps & HtmlTableProps & HtmlProps): any => (
  <table {...useClassName(className)}>
    {headerRow === false ? null : (
      <thead>
        <tr>
          {idColumn === false ? null : <th>{ID}</th>}
          <th>{VALUE}</th>
        </tr>
      </thead>
    )}
    <tbody>
      <ValuesView
        valueComponent={ValueInHtmlTr}
        getValueComponentProps={useGetTrProps(idColumn)}
        {...props}
      />
    </tbody>
  </table>
);
