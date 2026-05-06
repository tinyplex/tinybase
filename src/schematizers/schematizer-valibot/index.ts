import type {createValibotSchematizer as createValibotSchematizerDecl} from '../../@types/schematizers/schematizer-valibot/index.d.ts';
import {arrayEvery} from '../../common/array.ts';
import {isString} from '../../common/other.ts';
import {
  FALLBACK,
  NULLABLE,
  OBJECT,
  OPTIONAL,
  RECORD,
  STRING,
  TYPE,
  WRAPPED,
} from '../../common/strings.ts';
import {createCustomSchematizer} from '../index.ts';

const LITERAL = 'literal';
const PICKLIST = 'picklist';

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
      : type === RECORD
        ? [
            {type: OBJECT},
            defaultValue ?? schema?.[FALLBACK],
            allowNull ?? false,
          ]
        : type === PICKLIST && arrayEvery(schema.options, isString)
          ? [
              {[TYPE]: STRING},
              defaultValue ?? schema?.[FALLBACK],
              allowNull ?? false,
            ]
          : type === LITERAL && isString(schema.literal)
            ? [
                {[TYPE]: STRING},
                defaultValue ?? schema?.[FALLBACK],
                allowNull ?? false,
              ]
            : [schema, defaultValue ?? schema?.[FALLBACK], allowNull ?? false];
};

const getProperties = (schema: any) => schema?.entries;

export const createValibotSchematizer: typeof createValibotSchematizerDecl =
  () => createCustomSchematizer(unwrapSchema, getProperties);
