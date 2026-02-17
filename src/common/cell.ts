import {
  isFiniteNumber,
  isNull,
  isTypeStringOrBoolean,
  isUndefined,
} from './other.ts';
import {BOOLEAN, NULL, NUMBER, STRING, getTypeOf} from './strings.ts';

export type CellOrValueType = 'string' | 'number' | 'boolean' | 'null';

export const getCellOrValueType = (
  cellOrValue: any,
): CellOrValueType | undefined => {
  if (isNull(cellOrValue)) {
    return NULL;
  }
  const type = getTypeOf(cellOrValue);
  return isTypeStringOrBoolean(type) ||
    (type == NUMBER && isFiniteNumber(cellOrValue as any))
    ? (type as CellOrValueType)
    : undefined;
};

export const isCellOrValueOrUndefined = (cellOrValue: any): boolean =>
  isUndefined(cellOrValue) || !isUndefined(getCellOrValueType(cellOrValue));

export const getTypeCase = <IfStringReturn, IfNumberReturn, IfBooleanReturn>(
  type: CellOrValueType | undefined,
  stringCase: IfStringReturn,
  numberCase: IfNumberReturn,
  booleanCase: IfBooleanReturn,
): IfStringReturn | IfNumberReturn | IfBooleanReturn | null =>
  type == STRING
    ? stringCase
    : type == NUMBER
      ? numberCase
      : type == BOOLEAN
        ? booleanCase
        : null;
