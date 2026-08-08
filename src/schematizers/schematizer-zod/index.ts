import type {createZodSchematizer as createZodSchematizerDecl} from '../../@types/schematizers/schematizer-zod/index.d.ts';
import {
  arrayEvery,
  arrayFilter,
  arrayForEach,
  arrayPush,
} from '../../common/array.ts';
import {getCellOrValueType} from '../../common/cell.ts';
import {objValues} from '../../common/obj.ts';
import {isUndefined} from '../../common/other.ts';
import {
  DEFAULT,
  ENUM,
  NULL,
  NULLABLE,
  OBJECT,
  OPTIONAL,
  RECORD,
} from '../../common/strings.ts';
import {getTypeOrTypeUnion} from '../common.ts';
import {createCustomSchematizer} from '../index.ts';

const LITERAL = 'literal';
const ZOD_UNION = 'union';

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
          : type === ZOD_UNION
            ? unwrapUnion(def, defaultValue, allowNull, required)
            : type === ENUM
              ? [
                  {[ENUM]: objValues(def.entries)},
                  defaultValue,
                  allowNull ?? false,
                  required,
                ]
              : type === LITERAL
                ? [
                    {[ENUM]: def.values},
                    defaultValue,
                    allowNull ?? false,
                    required,
                  ]
                : [schema, defaultValue, allowNull ?? false, required];
};

const unwrapUnion = (
  def: any,
  defaultValue?: any,
  allowNull?: boolean,
  required = true,
): [any, any, boolean, boolean] => {
  const nonNullOptions = arrayFilter(
    def.options,
    (option: any) => getDef(option)?.type !== NULL,
  );
  const hasNull = nonNullOptions.length !== def.options.length;
  const enumValues: any[] = [];
  const allEnums = arrayEvery(nonNullOptions, (option: any) => {
    const optionDef = getDef(option);
    const values =
      optionDef?.type === LITERAL
        ? optionDef.values
        : optionDef?.type === ENUM
          ? objValues(optionDef.entries)
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
      const optionDef = getDef(option);
      const optionType = optionDef?.type;
      if (optionType === LITERAL) {
        arrayForEach(optionDef.values, (value) =>
          arrayPush(types, getCellOrValueType(value)),
        );
      } else if (optionType === ENUM) {
        arrayForEach(objValues(optionDef.entries), (value) =>
          arrayPush(types, getCellOrValueType(value)),
        );
      } else {
        arrayPush(types, optionType === RECORD ? OBJECT : optionType);
      }
    });
  }
  return [
    allEnums ? {[ENUM]: enumValues} : {type: getTypeOrTypeUnion(types)},
    defaultValue,
    allowNull || hasNull,
    required,
  ];
};

const getProperties = (schema: any) => getDef(schema)?.shape;

export const createZodSchematizer: typeof createZodSchematizerDecl = () =>
  createCustomSchematizer(unwrapSchema, getProperties);
