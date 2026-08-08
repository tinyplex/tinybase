import type {createValibotSchematizer as createValibotSchematizerDecl} from '../../@types/schematizers/schematizer-valibot/index.d.ts';
import {
  arrayEvery,
  arrayFilter,
  arrayForEach,
  arrayPush,
} from '../../common/array.ts';
import {getCellOrValueType} from '../../common/cell.ts';
import {isUndefined} from '../../common/other.ts';
import {
  DEFAULT,
  ENUM,
  FALLBACK,
  NULL,
  NULLABLE,
  OBJECT,
  OPTIONAL,
  RECORD,
  WRAPPED,
} from '../../common/strings.ts';
import {getTypeOrTypeUnion} from '../common.ts';
import {createCustomSchematizer} from '../index.ts';

const LITERAL = 'literal';
const PICKLIST = 'picklist';
const VALIBOT_UNION = 'union';

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
          : type === VALIBOT_UNION
            ? unwrapUnion(schema, defaultValue, allowNull, required)
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

const unwrapUnion = (
  schema: any,
  defaultValue?: any,
  allowNull?: boolean,
  required = true,
): [any, any, boolean, boolean] => {
  const nonNullOptions = arrayFilter(
    schema.options,
    (option: any) => option.type !== NULL,
  );
  const hasNull = nonNullOptions.length !== schema.options.length;
  const enumValues: any[] = [];
  const allEnums = arrayEvery(nonNullOptions, (option: any) => {
    const values =
      option.type === LITERAL
        ? [option.literal]
        : option.type === PICKLIST
          ? option.options
          : undefined;
    if (isUndefined(values)) {
      return false;
    }
    arrayForEach(values, (value) => arrayPush(enumValues, value));
    return true;
  });
  const types: any[] = [];
  if (!allEnums) {
    arrayForEach(nonNullOptions, (option: any) => {
      if (option.type === LITERAL) {
        arrayPush(types, getCellOrValueType(option.literal));
      } else if (option.type === PICKLIST) {
        arrayForEach(option.options, (value) =>
          arrayPush(types, getCellOrValueType(value)),
        );
      } else {
        arrayPush(types, option.type === RECORD ? OBJECT : option.type);
      }
    });
  }
  return [
    allEnums ? {[ENUM]: enumValues} : {type: getTypeOrTypeUnion(types)},
    defaultValue ?? schema?.[FALLBACK],
    allowNull || hasNull,
    required,
  ];
};

const getProperties = (schema: any) => schema?.entries;

export const createValibotSchematizer: typeof createValibotSchematizerDecl =
  () => createCustomSchematizer(unwrapSchema, getProperties);
