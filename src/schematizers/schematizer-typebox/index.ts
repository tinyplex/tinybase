import type {createTypeBoxSchematizer as createTypeBoxSchematizerDecl} from '../../@types/schematizers/schematizer-typebox/index.d.ts';
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
  NULL,
  NUMBER,
  STRING,
  TYPE,
} from '../../common/strings.ts';

const ANY_OF = 'anyOf';

const unwrapSchema = (
  schema: any,
  defaultValue?: any,
  allowNull?: boolean,
): [any, any, boolean] => {
  if (schema?.[ANY_OF]) {
    const types = schema[ANY_OF];
    const hasNull = types.some((t: any) => t?.type === NULL);
    const nonNullType = types.find((t: any) => t?.type !== NULL);
    if (hasNull && nonNullType) {
      return unwrapSchema(nonNullType, defaultValue ?? schema?.[DEFAULT], true);
    }
  }

  return [schema, defaultValue ?? schema?.[DEFAULT], allowNull ?? false];
};

export const createTypeBoxSchematizer: typeof createTypeBoxSchematizerDecl =
  () => {
    const toTablesSchema = (schemas: {
      [tableId: string]: any;
    }): TablesSchema => {
      const tablesSchema: TablesSchema = objNew();
      objForEach(schemas, (typeBoxSchema, tableId) => {
        const tableSchema: {[cellId: string]: CellSchema} = objNew();
        ifNotUndefined(typeBoxSchema?.properties, (properties) =>
          objForEach(properties, (cellTypeBoxSchema, cellId) =>
            ifNotUndefined(
              toCellOrValueSchema(cellTypeBoxSchema),
              (cellSchema) => {
                tableSchema[cellId] = cellSchema;
              },
            ),
          ),
        );
        if (!objIsEmpty(tableSchema)) {
          tablesSchema[tableId] = tableSchema;
        }
      });
      return tablesSchema;
    };

    const toValuesSchema = (schemas: {
      [valueId: string]: any;
    }): ValuesSchema => {
      const valuesSchema: ValuesSchema = objNew();
      objForEach(schemas, (typeBoxSchema, valueId) =>
        ifNotUndefined(toCellOrValueSchema(typeBoxSchema), (valueSchema) => {
          valuesSchema[valueId] = valueSchema as ValueSchema;
        }),
      );
      return valuesSchema;
    };

    const toCellOrValueSchema = (
      typeBoxSchema: any,
    ): CellSchema | ValueSchema | undefined => {
      const [schema, defaultValue, allowNull] = unwrapSchema(typeBoxSchema);
      const type = schema?.type;

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
