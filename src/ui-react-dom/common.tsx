import type {ComponentType, DependencyList, FormEvent, ReactNode} from 'react';
import type {Id, Ids} from '../@types/common/index.js';
import type {Relationships} from '../@types/index.d.ts';
import type {Cell, Store, Value} from '../@types/store/index.js';
import type {
  CustomCell,
  CustomResultCell,
  ExtraRowCell,
  ExtraValueCell,
  HtmlTableProps,
  SortedTablePaginatorProps,
} from '../@types/ui-react-dom/index.js';
import type {
  CellProps,
  ExtraProps,
  QueriesOrQueriesId,
  ResultCellProps,
  RowProps,
  StoreOrStoreId,
} from '../@types/ui-react/index.js';
import {arrayMap} from '../common/array.ts';
import {
  CellOrValueType,
  getCellOrValueType,
  getTypeCase,
} from '../common/cell.ts';
import {objMap, objNew, objToArray} from '../common/obj.ts';
import {isArray, isString, isUndefined} from '../common/other.ts';
import {getProps, useCallback, useMemo, useState} from '../common/react.ts';
import {
  BOOLEAN,
  CURRENT_TARGET,
  EMPTY_STRING,
  EXTRA,
  NUMBER,
  STRING,
  _VALUE,
} from '../common/strings.ts';
import {SortedTablePaginator} from './SortedTablePaginator.tsx';

export type Cells<Props = CellProps> = {
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
  extraCellsBefore?: ExtraRowCell[],
  extraCellsAfter?: ExtraRowCell[],
  sortAndOffset?: SortAndOffset,
  handleSort?: HandleSort,
  paginator?: ReactNode,
];
export type RelationshipInHtmlRowParams = [
  idColumn: boolean,
  cells: Cells,
  localTableId: Id | undefined,
  remoteTableId: Id | undefined,
  relationshipId: Id,
  relationships: Relationships | undefined,
  store: Store | undefined,
  extraCellsBefore?: ExtraRowCell[],
  extraCellsAfter?: ExtraRowCell[],
];

const UP_ARROW = '\u2191';
const DOWN_ARROW = '\u2193';

export const EDITABLE = 'editable';

export const extraRowCells = (
  extraRowCells: ExtraRowCell[] = [],
  extraRowCellProps: RowProps,
  after: 0 | 1 = 0,
) =>
  arrayMap(extraRowCells, ({component: Component}, index) => (
    <td className={EXTRA} key={extraKey(index, after)}>
      <Component {...extraRowCellProps} />
    </td>
  ));

export const extraKey = (index: number, after: 0 | 1) =>
  (after ? '>' : '<') + index;

export const useCallbackOrUndefined = (
  callback: any,
  deps: DependencyList,
  test: any,
) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const returnCallback = useCallback(callback, deps);
  return test ? returnCallback : undefined;
};

export const useParams = <
  Params extends HtmlTableParams | RelationshipInHtmlRowParams,
>(
  ...args: Params
): Params =>
  useMemo(
    () => args as any,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    args,
  );

export const useStoreCellComponentProps = (
  store: StoreOrStoreId | undefined,
  tableId: Id,
): {store: StoreOrStoreId | undefined; tableId: Id} =>
  useMemo(() => ({store, tableId}), [store, tableId]);

export const useQueriesCellComponentProps = (
  queries: QueriesOrQueriesId | undefined,
  queryId: Id,
): {queries: QueriesOrQueriesId | undefined; queryId: Id} =>
  useMemo(() => ({queries, queryId}), [queries, queryId]);

export const useSortingAndPagination = (
  cellId: Id | undefined,
  descending = false,
  sortOnClick: boolean | undefined,
  offset = 0,
  limit: number | undefined,
  total: number,
  paginator: boolean | ComponentType<SortedTablePaginatorProps>,
  onChange?: (sortAndOffset: SortAndOffset) => void,
): [
  sortAndOffset: SortAndOffset,
  handleSort: HandleSort,
  paginatorComponent: ReactNode | undefined,
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

export const useCells = (
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

export const extraHeaders = (
  extraCells: (ExtraRowCell | ExtraValueCell)[] = [],
  after: 0 | 1 = 0,
) =>
  arrayMap(extraCells, ({label}, index) => (
    <th className={EXTRA} key={extraKey(index, after)}>
      {label}
    </th>
  ));

export const HtmlTable = ({
  className,
  headerRow,
  idColumn,
  params: [
    cells,
    cellComponentProps,
    rowIds,
    extraCellsBefore,
    extraCellsAfter,
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
          {extraHeaders(extraCellsBefore)}
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
          {extraHeaders(extraCellsAfter, 1)}
        </tr>
      </thead>
    )}
    <tbody>
      {arrayMap(rowIds, (rowId) => {
        const rowProps = {...(cellComponentProps as any), rowId};
        return (
          <tr key={rowId}>
            {extraRowCells(extraCellsBefore, rowProps)}
            {idColumn === false ? null : <th>{rowId}</th>}
            {objToArray(
              cells,
              ({component: CellView, getComponentProps}, cellId) => (
                <td key={cellId}>
                  <CellView
                    {...getProps(getComponentProps, rowId, cellId)}
                    {...rowProps}
                    cellId={cellId}
                  />
                </td>
              ),
            )}
            {extraRowCells(extraCellsAfter, rowProps, 1)}
          </tr>
        );
      })}
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

export const EditableThing = <Thing extends Cell | Value>({
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
  const [currentThing, setCurrentThing] = useState<
    string | number | boolean | null
  >();
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

  const widget = getTypeCase(
    thingType,
    <input
      key={thingType}
      value={stringThing}
      onChange={useCallback(
        (event: FormEvent<HTMLInputElement>) =>
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
        (event: FormEvent<HTMLInputElement>) =>
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
        (event: FormEvent<HTMLInputElement>) =>
          handleThingChange(
            Boolean(event[CURRENT_TARGET].checked),
            setBooleanThing,
          ),
        [handleThingChange],
      )}
    />,
  );

  return (
    <div className={className}>
      {showType && widget ? (
        <button
          title={thingType}
          className={thingType}
          onClick={handleTypeChange}
        >
          {thingType}
        </button>
      ) : null}
      {widget}
    </div>
  );
};
