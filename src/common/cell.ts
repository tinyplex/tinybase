import type {
  AnyArray,
  AnyObject,
  Cell,
  CellOrUndefined,
  Value,
  ValueOrUndefined,
} from '../@types/index.d.ts';
import {jsonParse, jsonString} from './json.ts';
import {isObject} from './obj.ts';
import {
  isArray,
  isFiniteNumber,
  isNull,
  isString,
  isTypeStringOrBoolean,
  isUndefined,
  slice,
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

export type PrimitiveCellOrValue = string | number | boolean | null;

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

export const isJsonType = (type: any): boolean =>
  type == OBJECT || type == ARRAY;

export const encodeIfJson = <CV extends Cell | Value>(value: CV): CV =>
  isObject(value) || isArray(value)
    ? ((JSON_PREFIX + jsonString(value)) as CV)
    : value;

export const isEncodedJson = (value: any): value is string =>
  isString(value) && value[0] == JSON_PREFIX;

export const decodeIfJson = <
  CV extends Cell | Value | CellOrUndefined | ValueOrUndefined,
>(
  raw: CV,
): CV =>
  isEncodedJson(raw)
    ? (jsonParse(slice(raw, 1)) as AnyObject | AnyArray as CV)
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
