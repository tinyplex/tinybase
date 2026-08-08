import type {createArkTypeSchematizer as createArkTypeSchematizerDecl} from '../../@types/schematizers/schematizer-arktype/index.d.ts';
import {
  arrayEvery,
  arrayFilter,
  arrayFind,
  arrayForEach,
  arrayMap,
} from '../../common/array.ts';
import {getCellOrValueType} from '../../common/cell.ts';
import {objIsEmpty, objNew} from '../../common/obj.ts';
import {
  isArray,
  isFalse,
  isNull,
  isTrue,
  isUndefined,
  size,
} from '../../common/other.ts';
import {
  ARRAY,
  BOOLEAN,
  DEFAULT,
  DOMAIN,
  ENUM,
  KEY,
  OPTIONAL,
  REQUIRED,
  SEQUENCE,
  TYPE,
  UNIT,
  _VALUE,
} from '../../common/strings.ts';
import {getTypeOrTypeUnion} from '../common.ts';
import {createCustomSchematizer} from '../index.ts';

const getSimpleType = (schema: any) =>
  !isUndefined(schema?.[UNIT])
    ? getCellOrValueType(schema[UNIT])
    : !isUndefined(schema?.[SEQUENCE])
      ? ARRAY
      : schema?.[DOMAIN] || schema;

const unwrapSchema = (
  schema: any,
  defaultValue?: any,
  allowNull?: boolean,
  required = true,
): [any, any, boolean, boolean] => {
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
      return [{[TYPE]: BOOLEAN}, defaultValue, allowNull ?? false, required];
    }

    const enumItems = arrayFilter(
      schemaData,
      (item: any) =>
        !isNull(item?.[UNIT]) && !isNull(item) && item !== '=',
    );
    if (
      size(enumItems) > 0 &&
      arrayEvery(enumItems, (item: any) => !isUndefined(item?.[UNIT]))
    ) {
      return [
        {[ENUM]: arrayMap(enumItems, (item: any) => item[UNIT])},
        defaultValue,
        hasNull || allowNull || false,
        required,
      ];
    }

    return [
      {
        [TYPE]: getTypeOrTypeUnion(arrayMap(enumItems, getSimpleType)),
      },
      defaultValue,
      hasNull || allowNull || false,
      required,
    ];
  }

  if (!isArray(schemaData) && !isUndefined(schemaData?.[SEQUENCE])) {
    return [{[TYPE]: ARRAY}, defaultValue, allowNull ?? false, required];
  }

  if (!isArray(schemaData) && !isUndefined(schemaData?.[UNIT])) {
    return [
      {[ENUM]: [schemaData[UNIT]]},
      defaultValue,
      allowNull ?? false,
      required,
    ];
  }

  return [
    {[TYPE]: schemaData?.[DOMAIN] || schemaData},
    defaultValue,
    allowNull ?? false,
    required,
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

const getPropertyRequired = (schema: any, fieldId: string) => {
  const schemaData = schema?.json ?? schema;
  return isArray(schemaData?.[REQUIRED]) || isArray(schemaData?.[OPTIONAL])
    ? !isUndefined(
        arrayFind(
          schemaData?.[REQUIRED] ?? [],
          (field: any) => field[KEY] === fieldId,
        ),
      )
    : undefined;
};

const unwrapSchemaWithDefaults = (
  schema: any,
  defaultValue?: any,
  allowNull?: boolean,
  required = true,
): [any, any, boolean, boolean] => {
  if (isArray(schema) && size(schema) === 3 && schema[1] === '=') {
    const schemaValue = (schema[0] as any)?.json ?? schema[0];
    return unwrapSchema(schemaValue, schema[2], allowNull, false);
  }

  if (schema?.[_VALUE] && !isUndefined(schema?.[DEFAULT])) {
    return unwrapSchema(schema[_VALUE], schema[DEFAULT], allowNull, false);
  }

  return unwrapSchema(schema, defaultValue, allowNull, required);
};

export const createArkTypeSchematizer: typeof createArkTypeSchematizerDecl =
  () =>
    createCustomSchematizer(
      unwrapSchemaWithDefaults,
      getProperties,
      getPropertyRequired,
    );
