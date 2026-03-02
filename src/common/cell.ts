import {jsonParse, jsonString} from './json.ts';
import {isObject} from './obj.ts';
import {
  isArray,
  isFiniteNumber,
  isNull,
  isTypeStringOrBoolean,
  isUndefined,
} from './other.ts';
import {
  ARRAY,
  BOOLEAN,
  JSON_PREFIX,
  NULL,
  NUMBER,
  OBJECT,
  STRING,
  getTypeOf,
} from './strings.ts';

export type CellOrValueType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'null'
  | 'object'
  | 'array';

export const getCellOrValueType = (
  cellOrValue: any,
): CellOrValueType | undefined => {
  if (isNull(cellOrValue)) {
    return NULL;
  }
  if (isArray(cellOrValue)) {
    return ARRAY;
  }
  if (isObject(cellOrValue)) {
    return OBJECT;
  }
  const type = getTypeOf(cellOrValue);
  return isTypeStringOrBoolean(type) ||
    (type == NUMBER && isFiniteNumber(cellOrValue as any))
    ? (type as CellOrValueType)
    : undefined;
};

export const isCellOrValueOrUndefined = (cellOrValue: any): boolean =>
  isUndefined(cellOrValue) || !isUndefined(getCellOrValueType(cellOrValue));

export const encodeJson = (value: object): string =>
  JSON_PREFIX + jsonString(value);

export const decodeIfJson = (raw: any): any =>
  typeof raw === STRING && raw[0] === JSON_PREFIX
    ? jsonParse(raw.slice(1))
    : raw;

export const getTypeCase = <
  IfStringReturn,
  IfNumberReturn,
  IfBooleanReturn,
  IfObjectReturn,
  IfArrayReturn,
>(
  type: CellOrValueType | undefined,
  stringCase: IfStringReturn,
  numberCase: IfNumberReturn,
  booleanCase: IfBooleanReturn,
  objectCase: IfObjectReturn,
  arrayCase: IfArrayReturn,
):
  | IfStringReturn
  | IfNumberReturn
  | IfBooleanReturn
  | IfObjectReturn
  | IfArrayReturn
  | null =>
  type == STRING
    ? stringCase
    : type == NUMBER
      ? numberCase
      : type == BOOLEAN
        ? booleanCase
        : type == OBJECT
          ? objectCase
          : type == ARRAY
            ? arrayCase
            : null;
