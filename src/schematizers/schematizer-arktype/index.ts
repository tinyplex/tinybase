import type {createArkTypeSchematizer as createArkTypeSchematizerDecl} from '../../@types/schematizers/schematizer-arktype/index.d.ts';
import {arrayEvery, arrayFind, arrayForEach} from '../../common/array.ts';
import {objIsEmpty, objNew} from '../../common/obj.ts';
import {
  isArray,
  isFalse,
  isNull,
  isString,
  isTrue,
  isUndefined,
  size,
} from '../../common/other.ts';
import {
  ARRAY,
  BOOLEAN,
  DEFAULT,
  DOMAIN,
  KEY,
  OPTIONAL,
  REQUIRED,
  SEQUENCE,
  STRING,
  TYPE,
  UNIT,
  _VALUE,
} from '../../common/strings.ts';
import {createCustomSchematizer} from '../index.ts';

const unwrapSchema = (
  schema: any,
  defaultValue?: any,
  allowNull?: boolean,
): [any, any, boolean] => {
  const schemaData = schema?.json ?? schema;

  if (isArray(schemaData)) {
    const hasNull = !arrayEvery(
      schemaData,
      (item: any) => !isNull(item?.[UNIT]) && !isNull(item),
    );

    if (
      size(schemaData) === 2 &&
      isFalse((schemaData[0] as any)?.[UNIT]) &&
      isTrue((schemaData[1] as any)?.[UNIT])
    ) {
      return [{[TYPE]: BOOLEAN}, defaultValue, allowNull ?? false];
    }

    if (arrayEvery(schemaData, (item: any) => isString(item?.[UNIT] ?? item))) {
      return [{[TYPE]: STRING}, defaultValue, allowNull ?? false];
    }

    if (hasNull) {
      const nonNullItem = arrayFind(
        schemaData,
        (item: any) => !isNull(item?.[UNIT]) && !isNull(item) && item !== '=',
      );
      if (nonNullItem) {
        return unwrapSchema(nonNullItem, defaultValue, true);
      }
    }
  }

  if (!isArray(schemaData) && !isUndefined(schemaData?.[SEQUENCE])) {
    return [{[TYPE]: ARRAY}, defaultValue, allowNull ?? false];
  }

  if (!isArray(schemaData) && isString(schemaData?.[UNIT])) {
    return [{[TYPE]: STRING}, defaultValue, allowNull ?? false];
  }

  return [
    {[TYPE]: schemaData?.[DOMAIN] || schemaData},
    defaultValue,
    allowNull ?? false,
  ];
};

const getProperties = (schema: any) => {
  const properties: {[key: string]: any} = objNew();
  const schemaData = schema?.json ?? schema;

  if (schemaData?.[REQUIRED]) {
    arrayForEach(schemaData[REQUIRED], (field: any) => {
      properties[field[KEY]] = field[_VALUE];
    });
  }

  if (schemaData?.[OPTIONAL]) {
    arrayForEach(schemaData[OPTIONAL], (field: any) => {
      const value = field[_VALUE];
      const defaultVal = field[DEFAULT];
      properties[field[KEY]] = !isUndefined(defaultVal)
        ? {[_VALUE]: value, [DEFAULT]: defaultVal}
        : value;
    });
  }

  return objIsEmpty(properties) ? undefined : properties;
};

const unwrapSchemaWithDefaults = (
  schema: any,
  defaultValue?: any,
  allowNull?: boolean,
): [any, any, boolean] => {
  if (isArray(schema) && size(schema) === 3 && schema[1] === '=') {
    const schemaValue = (schema[0] as any)?.json ?? schema[0];
    return unwrapSchema(schemaValue, schema[2], allowNull);
  }

  if (schema?.[_VALUE] && !isUndefined(schema?.[DEFAULT])) {
    return unwrapSchema(schema[_VALUE], schema[DEFAULT], allowNull);
  }

  return unwrapSchema(schema, defaultValue, allowNull);
};

export const createArkTypeSchematizer: typeof createArkTypeSchematizerDecl =
  () => createCustomSchematizer(unwrapSchemaWithDefaults, getProperties);
