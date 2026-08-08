import type {createValibotSchematizer as createValibotSchematizerDecl} from '../../@types/schematizers/schematizer-valibot/index.d.ts';
import {
  DEFAULT,
  ENUM,
  FALLBACK,
  NULLABLE,
  OBJECT,
  OPTIONAL,
  RECORD,
  WRAPPED,
} from '../../common/strings.ts';
import {createCustomSchematizer} from '../index.ts';

const LITERAL = 'literal';
const PICKLIST = 'picklist';

const unwrapSchema = (
  schema: any,
  defaultValue?: any,
  allowNull?: boolean,
  required = true,
): [any, any, boolean, boolean] => {
  const type = schema?.type;

  return type === OPTIONAL
    ? unwrapSchema(
        schema[WRAPPED],
        defaultValue ?? schema?.[DEFAULT],
        allowNull,
        false,
      )
    : type === NULLABLE
      ? unwrapSchema(schema[WRAPPED], defaultValue, true, required)
      : type === RECORD
        ? [
            {type: OBJECT},
            defaultValue ?? schema?.[FALLBACK],
            allowNull ?? false,
            required,
          ]
        : type === PICKLIST
          ? [
              {[ENUM]: schema.options},
              defaultValue ?? schema?.[FALLBACK],
              allowNull ?? false,
              required,
            ]
          : type === LITERAL
            ? [
                {[ENUM]: [schema.literal]},
                defaultValue ?? schema?.[FALLBACK],
                allowNull ?? false,
                required,
              ]
            : [
                schema,
                defaultValue ?? schema?.[FALLBACK],
                allowNull ?? false,
                required,
              ];
};

const getProperties = (schema: any) => schema?.entries;

export const createValibotSchematizer: typeof createValibotSchematizerDecl =
  () => createCustomSchematizer(unwrapSchema, getProperties);
