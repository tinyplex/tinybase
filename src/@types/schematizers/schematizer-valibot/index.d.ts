/// schematizer-valibot
import type {TablesSchema, ValuesSchema} from '../../store/index.d.ts';
import type {Schematizer} from '../index.d.ts';

/// ValibotSchematizer
export interface ValibotSchematizer extends Schematizer {
  /// ValibotSchematizer.toTablesSchema
  toTablesSchema(schemas: {[tableId: string]: any}): TablesSchema;

  /// ValibotSchematizer.toValuesSchema
  toValuesSchema(schemas: {[valueId: string]: any}): ValuesSchema;
}

/// createValibotSchematizer
export function createValibotSchematizer(): ValibotSchematizer;
