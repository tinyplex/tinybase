import type {createTypeBoxSchematizer as createTypeBoxSchematizerDecl} from '../../@types/schematizers/schematizer-typebox/index.d.ts';
import {
  arrayEvery,
  arrayFilter,
  arrayFind,
  arrayHas,
  arrayMap,
} from '../../common/array.ts';
import {isUndefined} from '../../common/other.ts';
import {ANY_OF, DEFAULT, ENUM, NULL, REQUIRED} from '../../common/strings.ts';
import {getTypeOrTypeUnion} from '../common.ts';
import {createCustomSchematizer} from '../index.ts';

const TYPEBOX_OPTIONAL = 'Symbol(TypeBox.Optional)';
const CONST = 'const';

const isTypeBoxOptional = (schema: any) =>
  !isUndefined(
    arrayFind(
      Object.getOwnPropertySymbols(schema ?? {}),
      (symbol) => String(symbol) == TYPEBOX_OPTIONAL,
    ),
  );

const unwrapSchema = (
  schema: any,
  defaultValue?: any,
  allowNull?: boolean,
  required = !isTypeBoxOptional(schema),
): [any, any, boolean, boolean] => {
  if (schema?.[ANY_OF]) {
    const types = schema[ANY_OF];
    const hasNull = !arrayEvery(types, (t: any) => t?.type !== NULL);
    const nonNullTypes = arrayFilter(types, (t: any) => t?.type !== NULL);
    const firstNonNullType = nonNullTypes[0];

    if (
      firstNonNullType &&
      arrayEvery(nonNullTypes, (type: any) => !isUndefined(type?.[CONST]))
    ) {
      return [
        {[ENUM]: arrayMap(nonNullTypes, (type: any) => type[CONST])},
        defaultValue ?? schema?.[DEFAULT],
        hasNull || (allowNull ?? false),
        required,
      ];
    }

    return [
      {
        type: getTypeOrTypeUnion(
          arrayMap(nonNullTypes, (type: any) => type?.type),
        ),
      },
      defaultValue ?? schema?.[DEFAULT],
      hasNull || (allowNull ?? false),
      required,
    ];
  }

  if (!isUndefined(schema?.[CONST])) {
    return [
      {[ENUM]: [schema[CONST]]},
      defaultValue ?? schema?.[DEFAULT],
      allowNull ?? false,
      required,
    ];
  }

  return [
    schema,
    defaultValue ?? schema?.[DEFAULT],
    allowNull ?? false,
    required,
  ];
};

const getProperties = (schema: any) => schema?.properties;

const getPropertyRequired = (schema: any, propertyId: string) =>
  isUndefined(schema?.properties)
    ? undefined
    : arrayHas(schema?.[REQUIRED] ?? [], propertyId);

export const createTypeBoxSchematizer: typeof createTypeBoxSchematizerDecl =
  () =>
    createCustomSchematizer(unwrapSchema, getProperties, getPropertyRequired);
