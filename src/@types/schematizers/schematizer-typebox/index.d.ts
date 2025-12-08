/// schematizer-typebox
import type {TablesSchema, ValuesSchema} from '../../store/index.d.ts';
import type {Schematizer} from '../index.d.ts';

/// TypeBoxSchematizer
export interface TypeBoxSchematizer extends Schematizer {
  /// TypeBoxSchematizer.toTablesSchema
  toTablesSchema(schemas: {[tableId: string]: any}): TablesSchema;

  /// TypeBoxSchematizer.toValuesSchema
  toValuesSchema(schemas: {[valueId: string]: any}): ValuesSchema;
}

/// createTypeBoxSchematizer
export function createTypeBoxSchematizer(): TypeBoxSchematizer;
