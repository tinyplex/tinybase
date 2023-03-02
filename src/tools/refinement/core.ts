import {TablesSchema, ValuesSchema} from '../../store.d';

export const getStoreCoreRefinement = (
  _tablesSchema: TablesSchema,
  _valuesSchema: ValuesSchema,
  _module: string,
): [string] => {
  return [`export * from 'tinybase';`];
};
