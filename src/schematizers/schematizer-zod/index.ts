import type {createZodSchematizer as createZodSchematizerDecl} from '../../@types/schematizers/schematizer-zod/index.d.ts';
import {DEFAULT, NULLABLE, OPTIONAL} from '../../common/strings.ts';
import {createCustomSchematizer} from '../index.ts';

const unwrapSchema = (
  schema: any,
  defaultValue?: any,
  allowNull?: boolean,
): [any, any, boolean] => {
  const type = schema?.def?.type;

  return type === OPTIONAL
    ? unwrapSchema(schema.def.innerType, defaultValue, allowNull)
    : type === NULLABLE
      ? unwrapSchema(schema.def.innerType, defaultValue, true)
      : type === DEFAULT
        ? unwrapSchema(schema.def.innerType, schema.def.defaultValue, allowNull)
        : [schema, defaultValue, allowNull ?? false];
};

const getProperties = (schema: any) => schema?.def?.shape;

export const createZodSchematizer: typeof createZodSchematizerDecl = () =>
  createCustomSchematizer(unwrapSchema, getProperties);
