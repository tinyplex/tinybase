import type {FormEvent} from 'react';
import type {Cell, Id, Value} from '../../@types/index.d.ts';
import type {HtmlTableProps} from '../../@types/ui-react-dom/index.d.ts';
import {arrayMap} from '../../common/array.ts';
import {
  CellOrValueType,
  getCellOrValueType,
  getTypeCase,
} from '../../common/cell.ts';
import {objToArray} from '../../common/obj.ts';
import {isFalse, isUndefined} from '../../common/other.ts';
import {getProps, useCallback, useState} from '../../common/react.ts';
import {
  _VALUE,
  BOOLEAN,
  CURRENT_TARGET,
  EMPTY_STRING,
  NUMBER,
  STRING,
} from '../../common/strings.ts';
import {useCallbackOrUndefined} from './hooks.tsx';
import {
  DOWN_ARROW,
  extraHeaders,
  extraRowCells,
  HandleSort,
  HtmlTableParams,
  SortAndOffset,
  UP_ARROW,
} from './index.tsx';

export const HtmlHeaderCell = ({
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
            {isFalse(idColumn) ? null : <th title={rowId}>{rowId}</th>}
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

export const EditableThing = <Thing extends Cell | Value>({
  thing,
  onThingChange,
  className,
  hasSchema,
  showType = true,
}: {
  readonly thing: Thing | undefined;
  readonly onThingChange: (thing: Thing) => void;
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
