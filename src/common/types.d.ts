import {TablesSchema, ValuesSchema} from '../store.d';

type NoTablesSchema = undefined;

type NoValuesSchema = undefined;

export type OptionalSchemas = [
  TablesSchema | NoTablesSchema,
  ValuesSchema | NoValuesSchema,
];

export type NoSchemas = [NoTablesSchema, NoValuesSchema];
