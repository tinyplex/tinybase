import type {createTypeBoxSchematizer as createTypeBoxSchematizerDecl} from '../../@types/schematizers/schematizer-typebox/index.d.ts';
import {arrayEvery, arrayFilter} from '../../common/array.ts';
import {ANY_OF, DEFAULT, NULL} from '../../common/strings.ts';
import {createCustomSchematizer} from '../index.ts';

const unwrapSchema = (
  schema: any,
  defaultValue?: any,
  allowNull?: boolean,
): [any, any, boolean] => {
  if (schema?.[ANY_OF]) {
    const types = schema[ANY_OF];
    const hasNull = types.some((t: any) => t?.type === NULL);
    const nonNullTypes = arrayFilter(types, (t: any) => t?.type !== NULL);
    const firstNonNullType = nonNullTypes[0];

    if (
      firstNonNullType &&
      arrayEvery(
        nonNullTypes,
        (type: any) => type?.type === firstNonNullType.type,
      )
    ) {
      return unwrapSchema(
        firstNonNullType,
        defaultValue ?? schema?.[DEFAULT],
        hasNull || allowNull,
      );
    }
  }

  return [schema, defaultValue ?? schema?.[DEFAULT], allowNull ?? false];
};

const getProperties = (schema: any) => schema?.properties;

export const createTypeBoxSchematizer: typeof createTypeBoxSchematizerDecl =
  () => createCustomSchematizer(unwrapSchema, getProperties);
