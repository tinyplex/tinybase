import type {createArkTypeSchematizer as createArkTypeSchematizerDecl} from '../../@types/schematizers/schematizer-arktype/index.d.ts';
import {arrayEvery, arrayFind, arrayForEach} from '../../common/array.ts';
import {objIsEmpty, objNew} from '../../common/obj.ts';
import {isArray, isNull, isUndefined, size} from '../../common/other.ts';
import {BOOLEAN, DEFAULT, TYPE, _VALUE} from '../../common/strings.ts';
import {createCustomSchematizer} from '../index.ts';

const DOMAIN = 'domain';
const REQUIRED = 'required';
const OPTIONAL = 'optional';
const KEY = 'key';
const UNIT = 'unit';

const unwrapSchema = (
  schema: any,
  defaultValue?: any,
  allowNull?: boolean,
): [any, any, boolean] => {
  if (isArray(schema)) {
    const hasNull = !arrayEvery(
      schema,
      (item: any) => !isNull(item?.[UNIT]) && !isNull(item),
    );

    if (
      size(schema) === 2 &&
      schema[0]?.[UNIT] === false &&
      schema[1]?.[UNIT] === true
    ) {
      return [{[TYPE]: BOOLEAN}, defaultValue, allowNull ?? false];
    }

    if (hasNull) {
      const nonNullItem = arrayFind(
        schema,
        (item: any) => !isNull(item?.[UNIT]) && !isNull(item) && item !== '=',
      );
      if (nonNullItem) {
        return unwrapSchema(nonNullItem, defaultValue, true);
      }
    }
  }

  return [
    {[TYPE]: schema?.[DOMAIN] || schema},
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
    const schemaValue = schema[0]?.json ?? schema[0];
    return unwrapSchema(schemaValue, schema[2], allowNull);
  }

  if (schema?.[_VALUE] && !isUndefined(schema?.[DEFAULT])) {
    return unwrapSchema(schema[_VALUE], schema[DEFAULT], allowNull);
  }

  return unwrapSchema(schema, defaultValue, allowNull);
};

export const createArkTypeSchematizer: typeof createArkTypeSchematizerDecl =
  () => createCustomSchematizer(unwrapSchemaWithDefaults, getProperties);
