/** @jsx createElement */

import {
  CellView,
  ResultCellView,
  ValueView,
  useResultRowIds,
  useResultSortedRowIds,
  useResultTableCellIds,
  useRowIds,
  useSortedRowIds,
  useTableCellIds,
  useValueIds,
} from './ui-react';
import {
  CustomCell,
  CustomResultCell,
  HtmlTableProps,
  ResultSortedTableInHtmlTable as ResultSortedTableInHtmlTableDecl,
  ResultSortedTableInHtmlTableProps,
  ResultTableInHtmlTable as ResultTableInHtmlTableDecl,
  ResultTableInHtmlTableProps,
  SortedTableInHtmlTable as SortedTableInHtmlTableDecl,
  SortedTableInHtmlTableProps,
  TableInHtmlTable as TableInHtmlTableDecl,
  TableInHtmlTableProps,
  ValuesInHtmlTable as ValuesInHtmlTableDecl,
  ValuesInHtmlTableProps,
} from './types/ui-react-dom.d';
import {EMPTY_STRING, VALUE} from './common/strings';
import {Id, Ids} from './types/common';
import {QueriesOrQueriesId, StoreOrStoreId} from './types/ui-react';
import {isArray, isString, isUndefined} from './common/other';
import {objMap, objNew} from './common/obj';
import React from 'react';
import {arrayMap} from './common/array';
import {getProps} from './ui-react/common';

const {createElement, useCallback, useMemo, useState} = React;

type Sorting = [Id | undefined, boolean];

const useCallbackOrUndefined = (
  callback: any,
  deps: React.DependencyList,
  test: any,
) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const returnCallback = useCallback(callback, deps);
  return test ? returnCallback : undefined;
};

const sortedClassName = (sorting: Sorting | undefined, cellId?: Id) =>
  isUndefined(sorting)
    ? undefined
    : sorting[0] != cellId
    ? undefined
    : `sorted ${sorting[1] ? 'de' : 'a'}scending`;

const HtmlHeaderTh = ({
  cellId,
  sorting,
  label = cellId ?? EMPTY_STRING,
  onClick,
}: {
  readonly cellId?: Id;
  readonly sorting?: Sorting;
  readonly label?: string;
  readonly onClick?: (cellId: Id | undefined) => void;
}) => (
  <th
    onClick={useCallbackOrUndefined(
      () => onClick?.(cellId),
      [onClick, cellId],
      !isUndefined(onClick),
    )}
    className={sortedClassName(sorting, cellId)}
  >
    {label}
  </th>
);

const HtmlTable = ({
  className,
  headerRow,
  idColumn,
  customCells,
  storeTableIdOrQueriesQueryId,
  defaultCellView = CellView,
  rowIds,
  defaultCellIds,
  sorting,
  onHeaderThClick,
}: HtmlTableProps & {
  readonly customCells?:
    | Ids
    | {[cellId: string]: string | CustomCell | CustomResultCell}
    | undefined;
  readonly storeTableIdOrQueriesQueryId:
    | {store?: StoreOrStoreId; tableId: Id}
    | {queries?: QueriesOrQueriesId; queryId: Id};
  readonly defaultCellView?: typeof CellView | typeof ResultCellView;
  readonly rowIds: Ids;
  readonly defaultCellIds: Ids;
  readonly sorting?: Sorting;
  readonly onHeaderThClick?: (cellId: Id | undefined) => void;
}) => {
  const customCellConfigurations = useMemo(() => {
    const cellIds = customCells ?? defaultCellIds;
    return objNew(
      objMap(
        isArray(cellIds)
          ? objNew(arrayMap(cellIds, (cellId) => [cellId, cellId]))
          : cellIds,
        (labelOrCustomCell, cellId) => [
          cellId,
          {
            ...{label: cellId},
            ...(isString(labelOrCustomCell)
              ? {label: labelOrCustomCell}
              : labelOrCustomCell),
          },
        ],
      ),
    );
  }, [customCells, defaultCellIds]);

  return (
    <table className={className}>
      {headerRow === false ? null : (
        <thead>
          <tr>
            {idColumn === false ? null : (
              <HtmlHeaderTh
                sorting={sorting}
                label="Id"
                onClick={onHeaderThClick}
              />
            )}
            {objMap(customCellConfigurations, ({label}, cellId) => (
              <HtmlHeaderTh
                key={cellId}
                cellId={cellId}
                label={label}
                sorting={sorting}
                onClick={onHeaderThClick}
              />
            ))}
          </tr>
        </thead>
      )}
      <tbody>
        {arrayMap(rowIds, (rowId) => (
          <tr key={rowId}>
            {idColumn === false ? null : <th>{rowId}</th>}
            {objMap(
              customCellConfigurations,
              (
                {component: CellView = defaultCellView, getComponentProps},
                cellId,
              ) => (
                <td key={cellId}>
                  <CellView
                    {...getProps(getComponentProps, rowId, cellId)}
                    {...(storeTableIdOrQueriesQueryId as any)}
                    rowId={rowId}
                    cellId={cellId}
                  />
                </td>
              ),
            )}
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
}: TableInHtmlTableProps & HtmlTableProps): any => (
  <HtmlTable
    {...props}
    storeTableIdOrQueriesQueryId={useMemo(
      () => ({store, tableId}),
      [store, tableId],
    )}
    rowIds={useRowIds(tableId, store)}
    defaultCellIds={useTableCellIds(tableId, store)}
  />
);

export const SortedTableInHtmlTable: typeof SortedTableInHtmlTableDecl = ({
  tableId,
  cellId,
  descending,
  offset,
  limit,
  store,
  sortOnClick,
  ...props
}: SortedTableInHtmlTableProps & HtmlTableProps): any => {
  const [sorting, setSorting] = useState<Sorting>([
    cellId,
    descending ? true : false,
  ]);
  const handleHeaderThClick = useCallbackOrUndefined(
    (cellId: Id | undefined) =>
      setSorting([cellId, cellId == sorting[0] ? !sorting[1] : false]),
    [sorting],
    sortOnClick,
  );
  return (
    <HtmlTable
      {...props}
      storeTableIdOrQueriesQueryId={useMemo(
        () => ({store, tableId}),
        [store, tableId],
      )}
      rowIds={useSortedRowIds(tableId, ...sorting, offset, limit, store)}
      defaultCellIds={useTableCellIds(tableId, store)}
      sorting={sorting}
      onHeaderThClick={handleHeaderThClick}
    />
  );
};

export const ValuesInHtmlTable: typeof ValuesInHtmlTableDecl = ({
  store,
  valueComponent: Value = ValueView,
  getValueComponentProps,
  className,
  headerRow,
  idColumn,
}: ValuesInHtmlTableProps & HtmlTableProps): any => (
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

export const ResultTableInHtmlTable: typeof ResultTableInHtmlTableDecl = ({
  queryId,
  queries,
  ...props
}: ResultTableInHtmlTableProps & HtmlTableProps): any => (
  <HtmlTable
    {...props}
    storeTableIdOrQueriesQueryId={useMemo(
      () => ({queries, queryId}),
      [queries, queryId],
    )}
    defaultCellView={ResultCellView}
    rowIds={useResultRowIds(queryId, queries)}
    defaultCellIds={useResultTableCellIds(queryId, queries)}
  />
);

export const ResultSortedTableInHtmlTable: typeof ResultSortedTableInHtmlTableDecl =
  ({
    queryId,
    cellId,
    descending,
    offset,
    limit,
    queries,
    sortOnClick,
    ...props
  }: ResultSortedTableInHtmlTableProps & HtmlTableProps): any => {
    const [sorting, setSorting] = useState<Sorting>([
      cellId,
      descending ? true : false,
    ]);
    const handleHeaderThClick = useCallbackOrUndefined(
      (cellId: Id | undefined) =>
        setSorting([cellId, cellId == sorting[0] ? !sorting[1] : false]),
      [sorting],
      sortOnClick,
    );
    return (
      <HtmlTable
        {...props}
        storeTableIdOrQueriesQueryId={useMemo(
          () => ({queries, queryId}),
          [queries, queryId],
        )}
        defaultCellView={ResultCellView}
        rowIds={useResultSortedRowIds(
          queryId,
          ...sorting,
          offset,
          limit,
          queries,
        )}
        defaultCellIds={useResultTableCellIds(queryId, queries)}
        sorting={sorting}
        onHeaderThClick={handleHeaderThClick}
      />
    );
  };
