/** @jsx createElement */
/** @jsxFrag React.Fragment */

import {
  BOOLEAN,
  CELL,
  CURRENT_TARGET,
  EMPTY_STRING,
  NUMBER,
  STRING,
  VALUE,
  _VALUE,
} from '../common/strings';
import {Cell, Value} from '../types/store';
import {CellOrValueType, getCellOrValueType, getTypeCase} from '../common/cell';
import {
  CellProps,
  QueriesOrQueriesId,
  StoreOrStoreId,
  ValueProps,
} from '../types/ui-react';
import {
  CellView,
  ResultCellView,
  ValueView,
  useCell,
  useResultRowCount,
  useResultRowIds,
  useResultSortedRowIds,
  useResultTableCellIds,
  useRowCount,
  useRowIds,
  useSetCellCallback,
  useSetValueCallback,
  useSliceRowIds,
  useSortedRowIds,
  useTableCellIds,
  useValue,
  useValueIds,
} from '../ui-react';
import {
  CustomCell,
  CustomResultCell,
  EditableCellView as EditableCellViewDecl,
  EditableValueView as EditableValueViewDecl,
  HtmlTableProps,
  ResultSortedTableInHtmlTable as ResultSortedTableInHtmlTableDecl,
  ResultSortedTableInHtmlTableProps,
  ResultTableInHtmlTable as ResultTableInHtmlTableDecl,
  ResultTableInHtmlTableProps,
  SliceInHtmlTable as SliceInHtmlTableDecl,
  SliceInHtmlTableProps,
  SortedTableInHtmlTable as SortedTableInHtmlTableDecl,
  SortedTableInHtmlTableProps,
  SortedTablePaginator as SortedTablePaginatorDecl,
  SortedTablePaginatorProps,
  TableInHtmlTable as TableInHtmlTableDecl,
  TableInHtmlTableProps,
  ValuesInHtmlTable as ValuesInHtmlTableDecl,
  ValuesInHtmlTableProps,
} from '../types/ui-react-dom.d';
import {Id, Ids} from '../types/common';
import React, {ComponentType} from 'react';
import {createElement, getProps} from './common';
import {isArray, isString, isUndefined} from '../common/other';
import {objMap, objNew} from '../common/obj';
import {arrayMap} from '../common/array';
import {useIndexesOrIndexesById} from './context';

const {useCallback, useMemo, useState} = React;

export type SortAndOffset = [
  cellId: Id | undefined,
  descending: boolean,
  offset: number,
];

type HtmlTableParams = [
  cellComponentProps:
    | {tableId: Id; store?: StoreOrStoreId}
    | {queryId: Id; queries?: QueriesOrQueriesId},
  useCellIdsArgs:
    | [tableId: Id, store?: StoreOrStoreId]
    | [queryId: Id, queries?: QueriesOrQueriesId],
  defaultCellComponent: typeof CellView | typeof ResultCellView,
  useDefaultCellIds: typeof useTableCellIds | typeof useResultTableCellIds,
  sortAndOffset?: SortAndOffset,
  handleSort?: (cellId: Id | undefined) => void,
  paginator?: React.ReactNode,
];

const EDITABLE = 'editable';
const LEFT_ARROW = '\u2190';
const UP_ARROW = '\u2191';
const RIGHT_ARROW = '\u2192';
const DOWN_ARROW = '\u2193';

const useCallbackOrUndefined = (
  callback: any,
  deps: React.DependencyList,
  test: any,
) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const returnCallback = useCallback(callback, deps);
  return test ? returnCallback : undefined;
};

const useSortingAndPagination = (
  cellId: Id | undefined,
  descending = false,
  sortOnClick: boolean | undefined,
  offset = 0,
  limit: number | undefined,
  total: number,
  paginator: boolean | React.ComponentType<SortedTablePaginatorProps>,
  onChange?: (sortAndOffset: SortAndOffset) => void,
): [
  sortAndOffset: SortAndOffset,
  handleSort: (cellId: Id | undefined) => void,
  paginatorComponent: React.ReactNode | undefined,
] => {
  const [[currentCellId, currentDescending, currentOffset], setState] =
    useState<SortAndOffset>([cellId, descending, offset]);
  const setStateAndChange = useCallback(
    (sortAndOffset: SortAndOffset) => {
      setState(sortAndOffset);
      onChange?.(sortAndOffset);
    },
    [onChange],
  );
  const handleSort = useCallbackOrUndefined(
    (cellId: Id | undefined) =>
      setStateAndChange([
        cellId,
        cellId == currentCellId ? !currentDescending : false,
        currentOffset,
      ]),
    [setStateAndChange, currentCellId, currentDescending, currentOffset],
    sortOnClick,
  );
  const handleChangeOffset = useCallback(
    (offset: number) =>
      setStateAndChange([currentCellId, currentDescending, offset]),
    [setStateAndChange, currentCellId, currentDescending],
  );
  const PaginatorComponent =
    paginator === true
      ? SortedTablePaginator
      : (paginator as ComponentType<SortedTablePaginatorProps>);
  return [
    [currentCellId, currentDescending, currentOffset],
    handleSort,
    useMemo(
      () =>
        paginator === false ? null : (
          <PaginatorComponent
            offset={currentOffset}
            limit={limit}
            total={total}
            onChange={handleChangeOffset}
          />
        ),
      [
        paginator,
        PaginatorComponent,
        currentOffset,
        limit,
        total,
        handleChangeOffset,
      ],
    ),
  ];
};

const HtmlHeader = ({
  cellId,
  sort: [sortCellId, sortDescending],
  label = cellId ?? EMPTY_STRING,
  onClick,
}: {
  readonly cellId?: Id;
  readonly sort: SortAndOffset | [];
  readonly label?: string;
  readonly onClick?: (cellId: Id | undefined) => void;
}) => (
  <th
    onClick={useCallbackOrUndefined(
      () => onClick?.(cellId),
      [onClick, cellId],
      onClick,
    )}
    className={
      isUndefined(sortDescending) || sortCellId != cellId
        ? undefined
        : `sorted ${sortDescending ? 'de' : 'a'}scending`
    }
  >
    {isUndefined(sortDescending) || sortCellId != cellId
      ? null
      : (sortDescending ? DOWN_ARROW : UP_ARROW) + ' '}
    {label}
  </th>
);

const HtmlTable = ({
  className,
  headerRow,
  idColumn,
  customCells,
  params,
  rowIds,
}: HtmlTableProps & {
  readonly customCells?:
    | Ids
    | {[cellId: string]: string | CustomCell | CustomResultCell}
    | undefined;
  readonly params: HtmlTableParams;
  readonly rowIds: Ids;
}) => {
  const [
    cellComponentProps,
    useCellIdsArgs,
    defaultCellComponent,
    useDefaultCellIds,
    sortAndOffset,
    handleSort,
    paginatorComponent,
  ] = params;
  const defaultCellIds = (useDefaultCellIds as any)(...useCellIdsArgs) as Ids;
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
      {paginatorComponent ? <caption>{paginatorComponent}</caption> : null}
      {headerRow === false ? null : (
        <thead>
          <tr>
            {idColumn === false ? null : (
              <HtmlHeader
                sort={sortAndOffset ?? []}
                label="Id"
                onClick={handleSort}
              />
            )}
            {objMap(customCellConfigurations, ({label}, cellId) => (
              <HtmlHeader
                key={cellId}
                cellId={cellId}
                label={label}
                sort={sortAndOffset ?? []}
                onClick={handleSort}
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
                {component: CellView = defaultCellComponent, getComponentProps},
                cellId,
              ) => (
                <td key={cellId}>
                  <CellView
                    {...getProps(getComponentProps, rowId, cellId)}
                    {...(cellComponentProps as any)}
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

const EditableThing = <Thing extends Cell | Value>({
  thing,
  onThingChange,
  className,
}: {
  readonly thing: Thing | undefined;
  readonly onThingChange: (thing: Thing | undefined) => void;
  readonly className: string;
}) => {
  const [thingType, setThingType] = useState<CellOrValueType>();
  const [currentThing, setCurrentThing] = useState<string | number | boolean>();
  const [stringThing, setStringThing] = useState<string>();
  const [numberThing, setNumberThing] = useState<number>();
  const [booleanThing, setBooleanThing] = useState<boolean>();

  if (currentThing !== thing) {
    setThingType(getCellOrValueType(thing));
    setCurrentThing(thing);
    setStringThing(String(thing));
    setNumberThing(Number(thing) || 0);
    setBooleanThing(Boolean(thing));
  }

  const handleThingChange = useCallback(
    (thing: string | number | boolean, setTypedThing: (thing: any) => void) => {
      setTypedThing(thing);
      setCurrentThing(thing);
      onThingChange(thing as Thing);
    },
    [onThingChange],
  );

  return (
    <div className={className}>
      <button
        className={thingType}
        onClick={useCallback(() => {
          const nextType = getTypeCase(
            thingType,
            NUMBER,
            BOOLEAN,
            STRING,
          ) as CellOrValueType;
          const thing = getTypeCase(
            nextType,
            stringThing,
            numberThing,
            booleanThing,
          );
          setThingType(nextType);
          setCurrentThing(thing);
          onThingChange(thing as Thing);
        }, [onThingChange, stringThing, numberThing, booleanThing, thingType])}
      >
        {thingType}
      </button>
      {getTypeCase(
        thingType,
        <input
          key={thingType}
          value={stringThing}
          onChange={useCallback(
            (event: React.FormEvent<HTMLInputElement>) =>
              handleThingChange(
                String(event[CURRENT_TARGET][_VALUE]),
                setStringThing,
              ),
            [handleThingChange],
          )}
        />,
        <input
          key={thingType}
          type="number"
          value={numberThing}
          onChange={useCallback(
            (event: React.FormEvent<HTMLInputElement>) =>
              handleThingChange(
                Number(event[CURRENT_TARGET][_VALUE] || 0),
                setNumberThing,
              ),
            [handleThingChange],
          )}
        />,
        <input
          key={thingType}
          type="checkbox"
          checked={booleanThing}
          onChange={useCallback(
            (event: React.FormEvent<HTMLInputElement>) =>
              handleThingChange(
                Boolean(event[CURRENT_TARGET].checked),
                setBooleanThing,
              ),
            [handleThingChange],
          )}
        />,
      )}
    </div>
  );
};

export const TableInHtmlTable: typeof TableInHtmlTableDecl = ({
  tableId,
  store,
  editable,
  ...props
}: TableInHtmlTableProps & HtmlTableProps): any => (
  <HtmlTable
    {...props}
    params={useMemo(
      () => [
        {tableId, store},
        [tableId, store],
        editable ? EditableCellView : CellView,
        useTableCellIds,
      ],
      [store, tableId, editable],
    )}
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
  editable,
  sortOnClick,
  paginator = false,
  onChange,
  ...props
}: SortedTableInHtmlTableProps & HtmlTableProps): any => {
  const [sortAndOffset, handleSort, paginatorComponent] =
    useSortingAndPagination(
      cellId,
      descending,
      sortOnClick,
      offset,
      limit,
      useRowCount(tableId, store),
      paginator,
      onChange,
    );
  return (
    <HtmlTable
      {...props}
      params={useMemo(
        () => [
          {tableId, store},
          [tableId, store],
          editable ? EditableCellView : CellView,
          useTableCellIds,
          sortAndOffset,
          handleSort,
          paginatorComponent,
        ],
        [
          store,
          tableId,
          editable,
          sortAndOffset,
          handleSort,
          paginatorComponent,
        ],
      )}
      rowIds={useSortedRowIds(tableId, ...sortAndOffset, limit, store)}
    />
  );
};

export const ValuesInHtmlTable: typeof ValuesInHtmlTableDecl = ({
  store,
  editable = false,
  valueComponent: Value = editable ? EditableValueView : ValueView,
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

export const SliceInHtmlTable: typeof SliceInHtmlTableDecl = ({
  indexId,
  sliceId,
  indexes,
  editable,
  ...props
}: SliceInHtmlTableProps & HtmlTableProps): any => {
  const resolvedIndexes = useIndexesOrIndexesById(indexes);
  const store = resolvedIndexes?.getStore();
  const tableId = resolvedIndexes?.getTableId(indexId);
  return (
    <HtmlTable
      {...props}
      params={
        useMemo(
          () => [
            {tableId, store},
            [tableId, store],
            editable ? EditableCellView : CellView,
            useTableCellIds,
          ],
          [store, tableId, editable],
        ) as HtmlTableParams
      }
      rowIds={useSliceRowIds(indexId, sliceId, resolvedIndexes)}
    />
  );
};

export const ResultTableInHtmlTable: typeof ResultTableInHtmlTableDecl = ({
  queryId,
  queries,
  ...props
}: ResultTableInHtmlTableProps & HtmlTableProps): any => (
  <HtmlTable
    {...props}
    params={useMemo(
      () => [
        {queryId, queries},
        [queryId, queries],
        ResultCellView,
        useResultTableCellIds,
      ],
      [queryId, queries],
    )}
    rowIds={useResultRowIds(queryId, queries)}
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
    paginator = false,
    onChange,
    ...props
  }: ResultSortedTableInHtmlTableProps & HtmlTableProps): any => {
    const [sortAndOffset, handleSort, paginatorComponent] =
      useSortingAndPagination(
        cellId,
        descending,
        sortOnClick,
        offset,
        limit,
        useResultRowCount(queryId, queries),
        paginator,
        onChange,
      );
    return (
      <HtmlTable
        {...props}
        params={useMemo(
          () => [
            {queryId, queries},
            [queryId, queries],
            ResultCellView,
            useResultTableCellIds,
            sortAndOffset,
            handleSort,
            paginatorComponent,
          ],
          [queryId, queries, sortAndOffset, handleSort, paginatorComponent],
        )}
        rowIds={useResultSortedRowIds(
          queryId,
          ...sortAndOffset,
          limit,
          queries,
        )}
      />
    );
  };

export const EditableCellView: typeof EditableCellViewDecl = ({
  tableId,
  rowId,
  cellId,
  store,
  className,
}: CellProps & {readonly className?: string}) => (
  <EditableThing
    thing={useCell(tableId, rowId, cellId, store)}
    onThingChange={useSetCellCallback(
      tableId,
      rowId,
      cellId,
      (cell: Cell) => cell,
      [],
      store,
    )}
    className={className ?? EDITABLE + CELL}
  />
);

export const EditableValueView: typeof EditableValueViewDecl = ({
  valueId,
  store,
  className,
}: ValueProps & {readonly className?: string}) => (
  <EditableThing
    thing={useValue(valueId, store)}
    onThingChange={useSetValueCallback(
      valueId,
      (value: Value) => value,
      [],
      store,
    )}
    className={className ?? EDITABLE + VALUE}
  />
);

export const SortedTablePaginator: typeof SortedTablePaginatorDecl = ({
  onChange,
  total,
  offset = 0,
  limit = total,
  singular = 'row',
  plural = singular + 's',
}: SortedTablePaginatorProps) => {
  if (offset > total || offset < 0) {
    offset = 0;
    onChange(0);
  }
  const handlePrevClick = useCallbackOrUndefined(
    () => onChange(offset - limit),
    [onChange, offset, limit],
    offset > 0,
  );
  const handleNextClick = useCallbackOrUndefined(
    () => onChange(offset + limit),
    [onChange, offset, limit],
    offset + limit < total,
  );
  return (
    <>
      {total > limit && (
        <>
          <button
            className="previous"
            disabled={offset == 0}
            onClick={handlePrevClick}
          >
            {LEFT_ARROW}
          </button>
          <button
            className="next"
            disabled={offset + limit >= total}
            onClick={handleNextClick}
          >
            {RIGHT_ARROW}
          </button>
          {offset + 1} to {Math.min(total, offset + limit)}
          {' of '}
        </>
      )}
      {total} {total != 1 ? plural : singular}
    </>
  );
};
