import {TablesSchema, ValuesSchema} from '../store.d';

export type NoTablesSchema = undefined;

export type NoValuesSchema = undefined;

export type OptionalSchemas = [
  TablesSchema | NoTablesSchema,
  ValuesSchema | NoValuesSchema,
];

export type NoSchemas = [NoTablesSchema, NoValuesSchema];
