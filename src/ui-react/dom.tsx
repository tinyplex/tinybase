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
import {Cell, Store, Value} from '../types/store';
import {CellOrValueType, getCellOrValueType, getTypeCase} from '../common/cell';
import {
  CellProps,
  ExtraProps,
  QueriesOrQueriesId,
  ResultCellProps,
  StoreOrStoreId,
  ValueProps,
} from '../types/ui-react';
import {
  CellView,
  ResultCellView,
  ValueView,
  useCell,
  useIndexesOrIndexesById,
  useRelationshipsOrRelationshipsById,
  useRemoteRowId,
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
  useStoreOrStoreById,
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
  RelationshipInHtmlTableProps,
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
import {
  createElement,
  getIndexStoreTableId,
  getProps,
  getRelationshipsStoreTableIds,
} from './common';
import {isArray, isString, isUndefined} from '../common/other';
import {objMap, objNew, objToArray} from '../common/obj';
import {Relationships} from '../types/relationships';
import {arrayMap} from '../common/array';

const {useCallback, useMemo, useState} = React;

type Cells<Props = CellProps> = {
  [cellId: Id]: {
    label: string;
    component: ComponentType<Props>;
    getComponentProps?: (rowId: Id, cellId: Id) => ExtraProps;
  };
};

type CellComponent = ComponentType<CellProps> | ComponentType<ResultCellProps>;
type CellComponentProps =
  | {store?: StoreOrStoreId; tableId: Id}
  | {queries?: QueriesOrQueriesId; queryId: Id};
type SortAndOffset = [
  cellId: Id | undefined,
  descending: boolean,
  offset: number,
];
type HandleSort = (cellId: Id | undefined) => void;
type HtmlTableParams = [
  cells: Cells,
  cellComponentProps: CellComponentProps,
  rowIds: Ids,
  sortAndOffset?: SortAndOffset,
  handleSort?: HandleSort,
  paginator?: React.ReactNode,
];
type RelationshipInHtmlRowParams = [
  idColumn: boolean,
  cells: Cells,
  localTableId: Id | undefined,
  remoteTableId: Id | undefined,
  relationshipId: Id,
  relationships: Relationships | undefined,
  store: Store | undefined,
];

const DOT = '.';
const EDITABLE = 'editable';
const LEFT_ARROW = '\u2190';
const UP_ARROW = '\u2191';
const RIGHT_ARROW = '\u2192';
const DOWN_ARROW = '\u2193';

const useDottedCellIds = (tableId: Id | undefined, store: Store | undefined) =>
  arrayMap(
    useTableCellIds(tableId as Id, store),
    (cellId) => tableId + DOT + cellId,
  );

const useCallbackOrUndefined = (
  callback: any,
  deps: React.DependencyList,
  test: any,
) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const returnCallback = useCallback(callback, deps);
  return test ? returnCallback : undefined;
};

const useParams = <
  Params extends HtmlTableParams | RelationshipInHtmlRowParams,
>(
  ...args: Params
): Params =>
  useMemo(
    () => args as any,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    args,
  );

const useStoreCellComponentProps = (
  store: StoreOrStoreId | undefined,
  tableId: Id,
): {store: StoreOrStoreId | undefined; tableId: Id} =>
  useMemo(() => ({store, tableId}), [store, tableId]);

const useQueriesCellComponentProps = (
  queries: QueriesOrQueriesId | undefined,
  queryId: Id,
): {queries: QueriesOrQueriesId | undefined; queryId: Id} =>
  useMemo(() => ({queries, queryId}), [queries, queryId]);

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
  handleSort: HandleSort,
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

const useCells = (
  defaultCellIds: Ids,
  customCells:
    | Ids
    | {[cellId: Id]: string | CustomCell | CustomResultCell}
    | undefined,
  defaultCellComponent: CellComponent,
): Cells<any> =>
  useMemo(() => {
    const cellIds = customCells ?? defaultCellIds;
    return objMap(
      isArray(cellIds)
        ? objNew(arrayMap(cellIds, (cellId) => [cellId, cellId]))
        : cellIds,
      (labelOrCustomCell, cellId) => ({
        ...{label: cellId, component: defaultCellComponent},
        ...(isString(labelOrCustomCell)
          ? {label: labelOrCustomCell}
          : labelOrCustomCell),
      }),
    );
  }, [customCells, defaultCellComponent, defaultCellIds]);

const HtmlTable = ({
  className,
  headerRow,
  idColumn,
  params: [
    cells,
    cellComponentProps,
    rowIds,
    sortAndOffset,
    handleSort,
    paginatorComponent,
  ],
}: HtmlTableProps & {
  readonly params: HtmlTableParams;
}) => (
  <table className={className}>
    {paginatorComponent ? <caption>{paginatorComponent}</caption> : null}
    {headerRow === false ? null : (
      <thead>
        <tr>
          {idColumn === false ? null : (
            <HtmlHeaderCell
              sort={sortAndOffset ?? []}
              label="Id"
              onClick={handleSort}
            />
          )}
          {objToArray(cells, ({label}, cellId) => (
            <HtmlHeaderCell
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
          {objToArray(
            cells,
            ({component: CellView, getComponentProps}, cellId) => (
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

const HtmlHeaderCell = ({
  cellId,
  sort: [sortCellId, sortDescending],
  label = cellId ?? EMPTY_STRING,
  onClick,
}: {
  readonly cellId?: Id;
  readonly sort: SortAndOffset | [];
  readonly label?: string;
  readonly onClick?: HandleSort;
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

const RelationshipInHtmlRow = ({
  localRowId,
  params: [
    idColumn,
    cells,
    localTableId,
    remoteTableId,
    relationshipId,
    relationships,
    store,
  ],
}: {
  readonly localRowId: Id;
  readonly params: RelationshipInHtmlRowParams;
}) => {
  const remoteRowId = useRemoteRowId(
    relationshipId,
    localRowId,
    relationships,
  ) as Id;
  return (
    <tr>
      {idColumn === false ? null : (
        <>
          <th>{localRowId}</th>
          <th>{remoteRowId}</th>
        </>
      )}
      {objToArray(
        cells,
        ({component: CellView, getComponentProps}, compoundCellId) => {
          const [tableId, cellId] = compoundCellId.split(DOT, 2);
          const rowId =
            tableId === localTableId
              ? localRowId
              : tableId === remoteTableId
                ? remoteRowId
                : null;
          return isUndefined(rowId) ? null : (
            <td key={compoundCellId}>
              <CellView
                {...getProps(getComponentProps, rowId, cellId)}
                store={store}
                tableId={tableId}
                rowId={rowId}
                cellId={cellId}
              />
            </td>
          );
        },
      )}
    </tr>
  );
};

const EditableThing = <Thing extends Cell | Value>({
  thing,
  onThingChange,
  className,
  hasSchema,
  showType = true,
}: {
  readonly thing: Thing | undefined;
  readonly onThingChange: (thing: Thing | undefined) => void;
  readonly className: string;
  readonly hasSchema: (() => boolean) | undefined;
  readonly showType?: boolean;
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

  const handleTypeChange = useCallback(() => {
    if (!hasSchema?.()) {
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
    }
  }, [
    hasSchema,
    onThingChange,
    stringThing,
    numberThing,
    booleanThing,
    thingType,
  ]);

  return (
    <div className={className}>
      {showType ? (
        <button className={thingType} onClick={handleTypeChange}>
          {thingType}
        </button>
      ) : null}
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
  customCells,
  ...props
}: TableInHtmlTableProps & HtmlTableProps): any => (
  <HtmlTable
    {...props}
    params={useParams(
      useCells(
        useTableCellIds(tableId, store),
        customCells,
        editable ? EditableCellView : CellView,
      ),
      useStoreCellComponentProps(store, tableId),
      useRowIds(tableId, store),
    )}
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
  customCells,
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
      params={useParams(
        useCells(
          useTableCellIds(tableId, store),
          customCells,
          editable ? EditableCellView : CellView,
        ),
        useStoreCellComponentProps(store, tableId),
        useSortedRowIds(tableId, ...sortAndOffset, limit, store),
        sortAndOffset,
        handleSort,
        paginatorComponent,
      )}
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
  customCells,
  ...props
}: SliceInHtmlTableProps & HtmlTableProps): any => {
  const [resolvedIndexes, store, tableId] = getIndexStoreTableId(
    useIndexesOrIndexesById(indexes),
    indexId,
  );
  return (
    <HtmlTable
      {...props}
      params={useParams(
        useCells(
          useTableCellIds(tableId as Id, store),
          customCells,
          editable ? EditableCellView : CellView,
        ),
        useStoreCellComponentProps(store, tableId as Id),
        useSliceRowIds(indexId, sliceId, resolvedIndexes),
      )}
    />
  );
};

export const RelationshipInHtmlTable = ({
  relationshipId,
  relationships,
  editable,
  customCells,
  className,
  headerRow,
  idColumn = true,
}: RelationshipInHtmlTableProps & HtmlTableProps): any => {
  const [resolvedRelationships, store, localTableId, remoteTableId] =
    getRelationshipsStoreTableIds(
      useRelationshipsOrRelationshipsById(relationships),
      relationshipId,
    );
  const cells = useCells(
    [
      ...useDottedCellIds(localTableId, store),
      ...useDottedCellIds(remoteTableId, store),
    ],
    customCells,
    editable ? EditableCellView : CellView,
  );
  const params = useParams(
    idColumn,
    cells,
    localTableId,
    remoteTableId,
    relationshipId,
    resolvedRelationships,
    store,
  );
  return (
    <table className={className}>
      {headerRow === false ? null : (
        <thead>
          <tr>
            {idColumn === false ? null : (
              <>
                <th>{localTableId}.Id</th>
                <th>{remoteTableId}.Id</th>
              </>
            )}
            {objToArray(cells, ({label}, cellId) => (
              <th key={cellId}>{label}</th>
            ))}
          </tr>
        </thead>
      )}
      <tbody>
        {arrayMap(useRowIds(localTableId as Id, store), (localRowId) => (
          <RelationshipInHtmlRow
            key={localRowId}
            localRowId={localRowId}
            params={params}
          />
        ))}
      </tbody>
    </table>
  );
};

export const ResultTableInHtmlTable: typeof ResultTableInHtmlTableDecl = ({
  queryId,
  queries,
  customCells,
  ...props
}: ResultTableInHtmlTableProps & HtmlTableProps): any => (
  <HtmlTable
    {...props}
    params={useParams(
      useCells(
        useResultTableCellIds(queryId, queries),
        customCells,
        ResultCellView,
      ),
      useQueriesCellComponentProps(queries, queryId),
      useResultRowIds(queryId, queries),
    )}
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
    customCells,
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
        params={useParams(
          useCells(
            useResultTableCellIds(queryId, queries),
            customCells,
            ResultCellView,
          ),
          useQueriesCellComponentProps(queries, queryId),
          useResultSortedRowIds(queryId, ...sortAndOffset, limit, queries),
          sortAndOffset,
          handleSort,
          paginatorComponent,
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
  showType,
}: CellProps & {readonly className?: string; readonly showType?: boolean}) => (
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
    showType={showType}
    hasSchema={useStoreOrStoreById(store)?.hasTablesSchema}
  />
);

export const EditableValueView: typeof EditableValueViewDecl = ({
  valueId,
  store,
  className,
  showType,
}: ValueProps & {readonly className?: string; readonly showType?: boolean}) => (
  <EditableThing
    thing={useValue(valueId, store)}
    onThingChange={useSetValueCallback(
      valueId,
      (value: Value) => value,
      [],
      store,
    )}
    className={className ?? EDITABLE + VALUE}
    showType={showType}
    hasSchema={useStoreOrStoreById(store)?.hasValuesSchema}
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
