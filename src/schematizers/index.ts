import type {createCustomSchematizer as createCustomSchematizerDecl} from '../@types/schematizers/index.d.ts';
import type {
  CellSchema,
  TablesSchema,
  ValueSchema,
  ValuesSchema,
} from '../@types/store/index.d.ts';
import {objForEach, objFreeze, objIsEmpty, objNew} from '../common/obj.ts';
import {ifNotUndefined} from '../common/other.ts';
import {
  ALLOW_NULL,
  BOOLEAN,
  DEFAULT,
  NUMBER,
  STRING,
  TYPE,
} from '../common/strings.ts';

export const createCustomSchematizer: typeof createCustomSchematizerDecl = (
  unwrapSchema,
  getProperties,
) => {
  const toCellOrValueSchema = (
    schema: any,
  ): CellSchema | ValueSchema | undefined => {
    const [unwrapped, defaultValue, allowNull] = unwrapSchema(schema);
    const type = unwrapped?.type;

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

  const toTablesSchema = (schemas: {[tableId: string]: any}): TablesSchema => {
    const tablesSchema: TablesSchema = objNew();
    objForEach(schemas, (schema, tableId) => {
      const tableSchema: {[cellId: string]: CellSchema} = objNew();
      ifNotUndefined(getProperties(schema), (properties) =>
        objForEach(properties, (cellSchema, cellId) =>
          ifNotUndefined(toCellOrValueSchema(cellSchema), (cellSchema) => {
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
    objForEach(schemas, (schema, valueId) =>
      ifNotUndefined(toCellOrValueSchema(schema), (valueSchema) => {
        valuesSchema[valueId] = valueSchema as ValueSchema;
      }),
    );
    return valuesSchema;
  };

  return objFreeze({
    toTablesSchema,
    toValuesSchema,
  });
};
