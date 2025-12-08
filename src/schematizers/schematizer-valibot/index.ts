import type {createValibotSchematizer as createValibotSchematizerDecl} from '../../@types/schematizers/schematizer-valibot/index.d.ts';
import {createCustomSchematizer} from '../index.ts';

const OPTIONAL = 'optional';
const NULLABLE = 'nullable';
const FALLBACK = 'fallback';
const WRAPPED = 'wrapped';

const unwrapSchema = (
  schema: any,
  defaultValue?: any,
  allowNull?: boolean,
): [any, any, boolean] => {
  const type = schema?.type;

  return type === OPTIONAL
    ? unwrapSchema(schema[WRAPPED], defaultValue, allowNull)
    : type === NULLABLE
      ? unwrapSchema(schema[WRAPPED], defaultValue, true)
      : [schema, defaultValue ?? schema?.[FALLBACK], allowNull ?? false];
};

const getProperties = (schema: any) => schema?.entries;

export const createValibotSchematizer: typeof createValibotSchematizerDecl =
  () => createCustomSchematizer(unwrapSchema, getProperties);
