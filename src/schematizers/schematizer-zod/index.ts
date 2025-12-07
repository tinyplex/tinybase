import type {createZodSchematizer as createZodSchematizerDecl} from '../../@types/schematizers/schematizer-zod/index.d.ts';
import type {
  CellSchema,
  TablesSchema,
  ValueSchema,
  ValuesSchema,
} from '../../@types/store/index.d.ts';
import {objForEach, objFreeze, objIsEmpty, objNew} from '../../common/obj.ts';
import {ifNotUndefined} from '../../common/other.ts';

const TYPE = 'type';
const DEFAULT = 'default';
const ALLOW_NULL = 'allowNull';

const STRING = 'string';
const NUMBER = 'number';
const BOOLEAN = 'boolean';

const ZOD_OPTIONAL = 'ZodOptional';
const ZOD_NULLABLE = 'ZodNullable';
const ZOD_DEFAULT = 'ZodDefault';
const ZOD_STRING = 'ZodString';
const ZOD_NUMBER = 'ZodNumber';
const ZOD_BOOLEAN = 'ZodBoolean';

const unwrapSchema = (
  schema: any,
  defaultValue?: any,
  allowNull?: boolean,
): [any, any, boolean] => {
  const typeName = schema._def?.typeName;
  return typeName === ZOD_OPTIONAL
    ? unwrapSchema(schema._def.innerType, defaultValue, allowNull)
    : typeName === ZOD_NULLABLE
      ? unwrapSchema(schema._def.innerType, defaultValue, true)
      : typeName === ZOD_DEFAULT
        ? unwrapSchema(
            schema._def.innerType,
            schema._def.defaultValue(),
            allowNull,
          )
        : [schema, defaultValue, allowNull ?? false];
};

export const createZodSchematizer: typeof createZodSchematizerDecl = () => {
  const toTablesSchema = (schemas: {[tableId: string]: any}): TablesSchema => {
    const tablesSchema: TablesSchema = objNew();
    objForEach(schemas, (zodSchema, tableId) => {
      const tableSchema: {[cellId: string]: CellSchema} = objNew();
      ifNotUndefined(zodSchema?._def?.shape?.() ?? zodSchema?.shape, (shape) =>
        objForEach(shape, (cellZodSchema, cellId) =>
          ifNotUndefined(toCellOrValueSchema(cellZodSchema), (cellSchema) => {
            tableSchema[cellId] = cellSchema;
          }),
        ),
      );
      if (!objIsEmpty(tableSchema)) {
        tablesSchema[tableId] = tableSchema;
      }
    });
    return tablesSchema;
  };

  const toValuesSchema = (schemas: {[valueId: string]: any}): ValuesSchema => {
    const valuesSchema: ValuesSchema = objNew();
    objForEach(schemas, (zodSchema, valueId) =>
      ifNotUndefined(toCellOrValueSchema(zodSchema), (valueSchema) => {
        valuesSchema[valueId] = valueSchema as ValueSchema;
      }),
    );
    return valuesSchema;
  };

  const toCellOrValueSchema = (
    zodSchema: any,
  ): CellSchema | ValueSchema | undefined => {
    const [schema, defaultValue, allowNull] = unwrapSchema(zodSchema);
    const typeName = schema._def?.typeName;
    const type =
      typeName === ZOD_STRING
        ? STRING
        : typeName === ZOD_NUMBER
          ? NUMBER
          : typeName === ZOD_BOOLEAN
            ? BOOLEAN
            : undefined;

    return ifNotUndefined(type, (type) => {
      const cellOrValueSchema: CellSchema = {[TYPE]: type} as CellSchema;
      ifNotUndefined(defaultValue, (defaultValue) => {
        (cellOrValueSchema as any)[DEFAULT] = defaultValue;
      });
      if (allowNull) {
        (cellOrValueSchema as any)[ALLOW_NULL] = true;
      }
      return cellOrValueSchema;
    });
  };

  return objFreeze({
    toTablesSchema,
    toValuesSchema,
  });
};
