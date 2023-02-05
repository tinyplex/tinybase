import {TablesSchema, ValuesSchema} from '../../store.d';
import {EMPTY_STRING} from '../../common/strings';
import {getStoreCoreApi} from './core';
import {getStoreUiReactApi} from './ui-react';
import {objIsEmpty} from '../../common/obj';

export const getStoreApi = (
  tablesSchema: TablesSchema,
  valuesSchema: ValuesSchema,
  module: string,
): [string, string, string, string] => {
  if (objIsEmpty(tablesSchema) && objIsEmpty(valuesSchema)) {
    return [EMPTY_STRING, EMPTY_STRING, EMPTY_STRING, EMPTY_STRING];
  }

  return [
    ...getStoreCoreApi(tablesSchema, valuesSchema, module),
    ...getStoreUiReactApi(tablesSchema, valuesSchema, module),
  ];
};
