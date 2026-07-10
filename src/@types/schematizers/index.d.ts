/// schematizers
import type {TablesSchema, ValuesSchema} from '../store/index.d.ts';

/// Schematizer
export interface Schematizer {
  /// Schematizer.toTablesSchema
  toTablesSchema(schemas: any): TablesSchema;

  /// Schematizer.toValuesSchema
  toValuesSchema(schemas: any): ValuesSchema;
}

/// createCustomSchematizer
export function createCustomSchematizer(
  unwrapSchema: (
    schema: any,
    defaultValue?: any,
    allowNull?: boolean,
    required?: boolean,
  ) => [any, any, boolean] | [any, any, boolean, boolean | undefined],
  getProperties: (schema: any) => any | undefined,
  getPropertyRequired?: (
    schema: any,
    propertyId: string,
    propertySchema: any,
  ) => boolean | undefined,
): Schematizer;
