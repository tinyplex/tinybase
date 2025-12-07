/// schematizer-zod
import type {TablesSchema, ValuesSchema} from '../../store/index.d.ts';
import type {Schematizer} from '../index.d.ts';

/// ZodSchematizer
export interface ZodSchematizer extends Schematizer {
  /// ZodSchematizer.toTablesSchema
  toTablesSchema(schemas: {[tableId: string]: any}): TablesSchema;

  /// ZodSchematizer.toValuesSchema
  toValuesSchema(schemas: {[valueId: string]: any}): ValuesSchema;
}

/// createZodSchematizer
export function createZodSchematizer(): ZodSchematizer;
