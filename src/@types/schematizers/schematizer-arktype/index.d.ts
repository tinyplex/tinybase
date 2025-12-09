/// schematizer-arktype
import type {TablesSchema, ValuesSchema} from '../../store/index.d.ts';
import type {Schematizer} from '../index.d.ts';

/// ArkTypeSchematizer
export interface ArkTypeSchematizer extends Schematizer {
  /// ArkTypeSchematizer.toTablesSchema
  toTablesSchema(schemas: {[tableId: string]: any}): TablesSchema;

  /// ArkTypeSchematizer.toValuesSchema
  toValuesSchema(schemas: {[valueId: string]: any}): ValuesSchema;
}

/// createArkTypeSchematizer
export function createArkTypeSchematizer(): ArkTypeSchematizer;
