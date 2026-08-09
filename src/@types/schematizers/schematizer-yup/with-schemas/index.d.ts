/// schematizer-yup
import type {
  TablesSchema,
  ValuesSchema,
} from '../../../store/with-schemas/index.d.ts';
import type {Schematizer} from '../../with-schemas/index.d.ts';

/// YupSchematizer
export interface YupSchematizer extends Schematizer {
  /// YupSchematizer.toTablesSchema
  toTablesSchema(schemas: {[tableId: string]: any}): TablesSchema;

  /// YupSchematizer.toValuesSchema
  toValuesSchema(schemas: {[valueId: string]: any}): ValuesSchema;
}

/// createYupSchematizer
export function createYupSchematizer(): YupSchematizer;
