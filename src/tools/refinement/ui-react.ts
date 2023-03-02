import {TablesSchema, ValuesSchema} from '../../store.d';

export const getStoreUiReactRefinement = (
  _tablesSchema: TablesSchema,
  _valuesSchema: ValuesSchema,
  _module: string,
): [string] => {
  return [`export * from 'tinybase/ui-react';`];
};
