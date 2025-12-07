import type {createZodSchematizer as createZodSchematizerDecl} from '../../@types/schematizers/schematizer-zod/index.d.ts';
import type {
  CellSchema,
  TablesSchema,
  ValueSchema,
  ValuesSchema,
} from '../../@types/store/index.d.ts';
import {objForEach, objFreeze, objIsEmpty, objNew} from '../../common/obj.ts';
import {ifNotUndefined} from '../../common/other.ts';
import {
  ALLOW_NULL,
  BOOLEAN,
  DEFAULT,
  NUMBER,
  STRING,
  TYPE,
} from '../../common/strings.ts';

const OPTIONAL = 'optional';
const NULLABLE = 'nullable';

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

export const createZodSchematizer: typeof createZodSchematizerDecl = () => {
  const toTablesSchema = (schemas: {[tableId: string]: any}): TablesSchema => {
    const tablesSchema: TablesSchema = objNew();
    objForEach(schemas, (zodSchema, tableId) => {
      const tableSchema: {[cellId: string]: CellSchema} = objNew();
      ifNotUndefined(zodSchema?.def?.shape, (shape) =>
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
    const type = schema?.type;

    // Only accept basic TinyBase-supported types
    if (type !== STRING && type !== NUMBER && type !== BOOLEAN) {
      return undefined;
    }

    const cellOrValueSchema: CellSchema = {[TYPE]: type} as CellSchema;
    ifNotUndefined(defaultValue, (defaultValue) => {
      (cellOrValueSchema as any)[DEFAULT] = defaultValue;
    });
    if (allowNull) {
      (cellOrValueSchema as any)[ALLOW_NULL] = true;
    }
    return cellOrValueSchema;
  };

  return objFreeze({
    toTablesSchema,
    toValuesSchema,
  });
};
