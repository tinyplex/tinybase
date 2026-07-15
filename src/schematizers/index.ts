import type {createCustomSchematizer as createCustomSchematizerDecl} from '../@types/schematizers/index.d.ts';
import type {
  CellSchema,
  TablesSchema,
  ValueSchema,
  ValuesSchema,
} from '../@types/store/index.d.ts';
import {
  objForEach,
  objFreeze,
  objIsEmpty,
  objNew,
  objSet,
} from '../common/obj.ts';
import {ifNotUndefined, isUndefined} from '../common/other.ts';
import {
  ALLOW_NULL,
  ARRAY,
  BOOLEAN,
  DEFAULT,
  NUMBER,
  OBJECT,
  REQUIRED,
  STRING,
  TYPE,
} from '../common/strings.ts';

export const createCustomSchematizer: typeof createCustomSchematizerDecl = (
  unwrapSchema,
  getProperties,
  getPropertyRequired,
) => {
  const toCellOrValueSchema = (
    schema: any,
    required?: boolean,
  ): CellSchema | ValueSchema | undefined => {
    const [unwrapped, defaultValue, allowNull, unwrappedRequired = required] =
      unwrapSchema(schema, undefined, undefined, required);
    const type = unwrapped?.type;

    if (
      type !== STRING &&
      type !== NUMBER &&
      type !== BOOLEAN &&
      type !== OBJECT &&
      type !== ARRAY
    ) {
      return undefined;
    }

    const cellOrValueSchema: CellSchema = {[TYPE]: type} as CellSchema;
    ifNotUndefined(defaultValue, (defaultValue) => {
      (cellOrValueSchema as any)[DEFAULT] = defaultValue;
    });
    if (allowNull) {
      (cellOrValueSchema as any)[ALLOW_NULL] = true;
    }
    if (unwrappedRequired && isUndefined(defaultValue)) {
      (cellOrValueSchema as any)[REQUIRED] = true;
    }
    return cellOrValueSchema;
  };

  const toTablesSchema = (schemas: {[tableId: string]: any}): TablesSchema => {
    const tablesSchema: TablesSchema = objNew();
    objForEach(schemas, (schema, tableId) => {
      const tableSchema: {[cellId: string]: CellSchema} = objNew();
      ifNotUndefined(getProperties(schema), (properties) =>
        objForEach(properties, (cellSchema, cellId) =>
          ifNotUndefined(
            toCellOrValueSchema(
              cellSchema,
              getPropertyRequired?.(schema, cellId, cellSchema),
            ),
            (cellSchema) => {
              objSet(tableSchema, cellId, cellSchema);
            },
          ),
        ),
      );
      if (!objIsEmpty(tableSchema)) {
        objSet(tablesSchema, tableId, tableSchema);
      }
    });
    return tablesSchema;
  };

  const toValuesSchema = (schemas: {[valueId: string]: any}): ValuesSchema => {
    const valuesSchema: ValuesSchema = objNew();
    objForEach(schemas, (schema, valueId) =>
      ifNotUndefined(toCellOrValueSchema(schema), (valueSchema) => {
        objSet(valuesSchema, valueId, valueSchema as ValueSchema);
      }),
    );
    return valuesSchema;
  };

  return objFreeze({
    toTablesSchema,
    toValuesSchema,
  });
};
