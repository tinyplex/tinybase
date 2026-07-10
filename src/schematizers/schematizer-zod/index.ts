import type {createZodSchematizer as createZodSchematizerDecl} from '../../@types/schematizers/schematizer-zod/index.d.ts';
import {arrayEvery} from '../../common/array.ts';
import {isString} from '../../common/other.ts';
import {
  DEFAULT,
  NULLABLE,
  OBJECT,
  OPTIONAL,
  RECORD,
  STRING,
  TYPE,
} from '../../common/strings.ts';
import {createCustomSchematizer} from '../index.ts';

const ENUM = 'enum';
const LITERAL = 'literal';

const getDef = (schema: any) => schema?.def ?? schema?._zod?.def;

const unwrapSchema = (
  schema: any,
  defaultValue?: any,
  allowNull?: boolean,
  required = true,
): [any, any, boolean, boolean] => {
  const def = getDef(schema);
  const type = def?.type;

  return type === OPTIONAL
    ? unwrapSchema(def.innerType, defaultValue, allowNull, false)
    : type === NULLABLE
      ? unwrapSchema(def.innerType, defaultValue, true, required)
      : type === DEFAULT
        ? unwrapSchema(def.innerType, def.defaultValue, allowNull, false)
        : type === RECORD
          ? [{type: OBJECT}, defaultValue, allowNull ?? false, required]
          : type === ENUM
            ? [{[TYPE]: STRING}, defaultValue, allowNull ?? false, required]
            : type === LITERAL && arrayEvery(def.values, isString)
              ? [{[TYPE]: STRING}, defaultValue, allowNull ?? false, required]
              : [schema, defaultValue, allowNull ?? false, required];
};

const getProperties = (schema: any) => getDef(schema)?.shape;

export const createZodSchematizer: typeof createZodSchematizerDecl = () =>
  createCustomSchematizer(unwrapSchema, getProperties);
