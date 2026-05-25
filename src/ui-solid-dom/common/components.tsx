/* @jsxImportSource solid-js */
/* eslint-disable solid/reactivity */
import {createRenderEffect, createSignal, untrack} from 'solid-js';
import type {Cell, Id, Value} from '../../@types/index.d.ts';
import type {HtmlTableProps} from '../../@types/ui-solid-dom/index.d.ts';
import {arrayMap} from '../../common/array.ts';
import {
  CellOrValueType,
  getCellOrValueType,
  getTypeCase,
} from '../../common/cell.ts';
import {jsonParse, jsonString} from '../../common/json.ts';
import {isObject, objToArray} from '../../common/obj.ts';
import {
  boolean,
  isArray,
  isFalse,
  isUndefined,
  number,
  string,
  tryReturn,
} from '../../common/other.ts';
import {getProps, getValue} from '../../common/solid.ts';
import {
  _VALUE,
  ARRAY,
  BOOLEAN,
  CURRENT_TARGET,
  EMPTY_STRING,
  NUMBER,
  OBJECT,
  STRING,
} from '../../common/strings.ts';
import {getCallbackOrUndefined} from './hooks.tsx';
import {
  DOWN_ARROW,
  extraHeaders,
  extraRowCells,
  HandleSort,
  HtmlTableParams,
  SortAndOffset,
  UP_ARROW,
} from './index.tsx';

export const HtmlHeaderCell = (props: {
  readonly cellId?: Id;
  readonly sort: SortAndOffset | [];
  readonly label?: string;
  readonly onClick?: HandleSort;
}) => {
  const sortDescending = props.sort[1];
  const cellId = props.cellId;
  return (
    <th
      onClick={getCallbackOrUndefined(
        () => props.onClick?.(cellId),
        props.onClick,
      )}
      class={
        isUndefined(sortDescending) || props.sort[0] != cellId
          ? undefined
          : `sorted ${sortDescending ? 'de' : 'a'}scending`
      }
    >
      {isUndefined(sortDescending) || props.sort[0] != cellId
        ? null
        : (sortDescending ? DOWN_ARROW : UP_ARROW) + ' '}
      {props.label ?? cellId ?? EMPTY_STRING}
    </th>
  );
};

export const HtmlTable = (
  props: HtmlTableProps & {
    readonly params: HtmlTableParams;
  },
) => {
  const content = () => {
    const [
      cells,
      cellComponentProps,
      rowIds,
      extraCellsBefore,
      extraCellsAfter,
      sortAndOffset,
      handleSort,
      paginatorComponent,
    ] = props.params;
    const sort: SortAndOffset | [] =
      sortAndOffset == null ? [] : getValue(sortAndOffset);
    const paginator = getValue(paginatorComponent);
    return (
      <table class={props.className}>
        {paginator ? <caption>{paginator}</caption> : null}
        {props.headerRow === false ? null : (
          <thead>
            <tr>
              {extraHeaders(extraCellsBefore)}
              {props.idColumn === false
                ? null
                : HtmlHeaderCell({sort, label: 'Id', onClick: handleSort})}
              {objToArray(getValue(cells), ({label}, cellId) =>
                HtmlHeaderCell({
                  cellId,
                  label,
                  sort,
                  onClick: handleSort,
                }),
              )}
              {extraHeaders(extraCellsAfter)}
            </tr>
          </thead>
        )}
        <tbody>
          {arrayMap(getValue(rowIds), (rowId) => {
            const rowProps = {...(cellComponentProps as any), rowId};
            return (
              <tr>
                {extraRowCells(extraCellsBefore, rowProps)}
                {isFalse(props.idColumn) ? null : (
                  <th title={rowId}>{rowId}</th>
                )}
                {objToArray(
                  getValue(cells),
                  ({component: CellView, getComponentProps}, cellId) => (
                    <td>
                      <CellView
                        {...getProps(getComponentProps, rowId, cellId)}
                        {...rowProps}
                        cellId={cellId}
                      />
                    </td>
                  ),
                )}
                {extraRowCells(extraCellsAfter, rowProps)}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };
  return <>{content()}</>;
};

export const EditableThing = (props: {
  readonly thing: Cell | Value | undefined;
  readonly onThingChange: (thing: Cell | Value) => void;
  readonly class: string;
  readonly hasSchema: (() => boolean) | undefined;
  readonly showType?: boolean;
}) => {
  const [thingType, setThingType] = createSignal<CellOrValueType>();
  const [currentThing, setCurrentThing] = createSignal<Cell | Value>();
  const [stringThing, setStringThing] = createSignal<string>();
  const [numberThing, setNumberThing] = createSignal<number>();
  const [booleanThing, setBooleanThing] = createSignal<boolean>();
  const [objectThing, setObjectThing] = createSignal<string>('{}');
  const [arrayThing, setArrayThing] = createSignal<string>('[]');

  const [objectClassName, setObjectClassName] = createSignal<string>('');
  const [arrayClassName, setArrayClassName] = createSignal<string>('');

  createRenderEffect(() => {
    const thing = props.thing;
    if (untrack(currentThing) !== thing) {
      setThingType(getCellOrValueType(thing));
      setCurrentThing(() => thing);
      if (isObject(thing)) {
        setObjectThing(jsonString(thing));
      } else if (isArray(thing)) {
        setArrayThing(jsonString(thing));
      } else {
        setStringThing(string(thing));
        setNumberThing(number(thing) || 0);
        setBooleanThing(boolean(thing));
      }
    }
  });

  const handleThingChange = <Thing extends Cell | Value>(
    thing: Thing,
    setTypedThing: (thing: Thing) => void,
  ) => {
    setTypedThing(thing);
    setCurrentThing(() => thing);
    props.onThingChange(thing);
  };

  const handleJsonThingChange = (
    value: string,
    setTypedThing: (value: string) => void,
    isThing: (thing: any) => boolean,
    setTypedClassName: (className: string) => void,
  ) => {
    setTypedThing(value);
    try {
      const object = jsonParse(value);
      if (isThing(object)) {
        setCurrentThing(() => object);
        props.onThingChange(object);
        setTypedClassName('');
      }
    } catch {
      setTypedClassName('invalid');
    }
  };

  const handleTypeChange = () => {
    if (!props.hasSchema?.()) {
      const nextType = getTypeCase(
        thingType(),
        NUMBER,
        BOOLEAN,
        OBJECT,
        ARRAY,
        STRING,
      ) as CellOrValueType;
      const thing = getTypeCase(
        nextType,
        stringThing(),
        numberThing(),
        booleanThing(),
        tryReturn(() => jsonParse(objectThing()), {}),
        tryReturn(() => jsonParse(arrayThing()), []),
      );
      setThingType(nextType);
      setCurrentThing(() => thing);
      props.onThingChange(thing);
    }
  };

  const widget = () =>
    getTypeCase(
      thingType(),
      <input
        value={stringThing()}
        onInput={(event) =>
          handleThingChange(
            string(event[CURRENT_TARGET][_VALUE]),
            setStringThing,
          )
        }
      />,
      <input
        type="number"
        value={numberThing()}
        onInput={(event) =>
          handleThingChange(
            number(event[CURRENT_TARGET][_VALUE] || 0),
            setNumberThing,
          )
        }
      />,
      <input
        type="checkbox"
        checked={booleanThing()}
        onInput={(event) =>
          handleThingChange(
            boolean(event[CURRENT_TARGET].checked),
            setBooleanThing,
          )
        }
      />,
      <input
        value={objectThing()}
        class={objectClassName()}
        onInput={(event) =>
          handleJsonThingChange(
            event[CURRENT_TARGET][_VALUE],
            setObjectThing,
            isObject,
            setObjectClassName,
          )
        }
      />,
      <input
        value={arrayThing()}
        class={arrayClassName()}
        onInput={(event) =>
          handleJsonThingChange(
            event[CURRENT_TARGET][_VALUE],
            setArrayThing,
            isArray,
            setArrayClassName,
          )
        }
      />,
    );

  const content = () => {
    const currentWidget = widget();
    return (
      <div class={props.class}>
        {props.showType !== false && currentWidget ? (
          <button
            title={thingType()}
            class={thingType()}
            onClick={handleTypeChange}
          >
            {thingType()}
          </button>
        ) : null}
        {currentWidget}
      </div>
    );
  };
  return <>{content()}</>;
};
