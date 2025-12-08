import type {createValibotSchematizer as createValibotSchematizerDecl} from '../../@types/schematizers/schematizer-valibot/index.d.ts';
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
const FALLBACK = 'fallback';
const WRAPPED = 'wrapped';

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
      : [schema, defaultValue ?? schema?.[FALLBACK], allowNull ?? false];
};

export const createValibotSchematizer: typeof createValibotSchematizerDecl =
  () => {
    const toTablesSchema = (schemas: {
      [tableId: string]: any;
    }): TablesSchema => {
      const tablesSchema: TablesSchema = objNew();
      objForEach(schemas, (valibotSchema, tableId) => {
        const tableSchema: {[cellId: string]: CellSchema} = objNew();
        ifNotUndefined(valibotSchema?.entries, (entries) =>
          objForEach(entries, (cellValibotSchema, cellId) =>
            ifNotUndefined(
              toCellOrValueSchema(cellValibotSchema),
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
      objForEach(schemas, (valibotSchema, valueId) =>
        ifNotUndefined(toCellOrValueSchema(valibotSchema), (valueSchema) => {
          valuesSchema[valueId] = valueSchema as ValueSchema;
        }),
      );
      return valuesSchema;
    };

    const toCellOrValueSchema = (
      valibotSchema: any,
    ): CellSchema | ValueSchema | undefined => {
      const [schema, defaultValue, allowNull] = unwrapSchema(valibotSchema);
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
