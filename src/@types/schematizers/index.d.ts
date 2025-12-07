/// schematizers
import type {TablesSchema, ValuesSchema} from '../store/index.d.ts';

/// Schematizer
export interface Schematizer {
  /// Schematizer.toTablesSchema
  toTablesSchema(schemas: any): TablesSchema;

  /// Schematizer.toValuesSchema
  toValuesSchema(schemas: any): ValuesSchema;
}
