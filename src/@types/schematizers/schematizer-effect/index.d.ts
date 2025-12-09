/// schematizer-effect
import type {TablesSchema, ValuesSchema} from '../../store/index.d.ts';
import type {Schematizer} from '../index.d.ts';

/// EffectSchematizer
export interface EffectSchematizer extends Schematizer {
  /// EffectSchematizer.toTablesSchema
  toTablesSchema(schemas: {[tableId: string]: any}): TablesSchema;

  /// EffectSchematizer.toValuesSchema
  toValuesSchema(schemas: {[valueId: string]: any}): ValuesSchema;
}

/// createEffectSchematizer
export function createEffectSchematizer(): EffectSchematizer;
