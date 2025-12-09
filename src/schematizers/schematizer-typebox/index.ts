import type {createTypeBoxSchematizer as createTypeBoxSchematizerDecl} from '../../@types/schematizers/schematizer-typebox/index.d.ts';
import {arrayFind} from '../../common/array.ts';
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
    const nonNullType = arrayFind(types, (t: any) => t?.type !== NULL);
    if (hasNull && nonNullType) {
      return unwrapSchema(nonNullType, defaultValue ?? schema?.[DEFAULT], true);
    }
  }

  return [schema, defaultValue ?? schema?.[DEFAULT], allowNull ?? false];
};

const getProperties = (schema: any) => schema?.properties;

export const createTypeBoxSchematizer: typeof createTypeBoxSchematizerDecl =
  () => createCustomSchematizer(unwrapSchema, getProperties);
