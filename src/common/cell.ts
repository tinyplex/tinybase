import {CellOrUndefined, Store, ValueOrUndefined} from '../types/store.d';
import {NUMBER, STRING, getTypeOf} from './strings';
import {isFiniteNumber, isTypeStringOrBoolean, isUndefined} from './other';
import {Id} from '../types/common.d';

export type CellOrValueType = 'string' | 'number' | 'boolean';

export const getCellOrValueType = (
  cellOrValue: any,
): CellOrValueType | undefined => {
  const type = getTypeOf(cellOrValue);
  return isTypeStringOrBoolean(type) ||
    (type == NUMBER && isFiniteNumber(cellOrValue as any))
    ? (type as CellOrValueType)
    : undefined;
};

export const setOrDelCell = (
  store: Store,
  tableId: Id,
  rowId: Id,
  cellId: Id,
  cell: CellOrUndefined,
) =>
  isUndefined(cell)
    ? store.delCell(tableId, rowId, cellId, true)
    : store.setCell(tableId, rowId, cellId, cell);

export const setOrDelValue = (
  store: Store,
  valueId: Id,
  value: ValueOrUndefined,
) =>
  isUndefined(value) ? store.delValue(valueId) : store.setValue(valueId, value);

export const getTypeCase = <IfStringReturn, IfNumberReturn, IfBooleanReturn>(
  type: CellOrValueType | undefined,
  stringCase: IfStringReturn,
  numberCase: IfNumberReturn,
  booleanCase: IfBooleanReturn,
): IfStringReturn | IfNumberReturn | IfBooleanReturn =>
  type == STRING ? stringCase : type == NUMBER ? numberCase : booleanCase;
