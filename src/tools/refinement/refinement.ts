import {TablesSchema, ValuesSchema} from '../../store.d';
import {EMPTY_STRING} from '../../common/strings';
import {getStoreCoreRefinement} from './core';
import {getStoreUiReactRefinement} from './ui-react';
import {objIsEmpty} from '../../common/obj';

export const getStoreRefinement = (
  tablesSchema: TablesSchema,
  valuesSchema: ValuesSchema,
  module: string,
): [string, string] => {
  if (objIsEmpty(tablesSchema) && objIsEmpty(valuesSchema)) {
    return [EMPTY_STRING, EMPTY_STRING];
  }

  const [dTsCore] = getStoreCoreRefinement(tablesSchema, valuesSchema, module);

  return [
    dTsCore,
    ...getStoreUiReactRefinement(tablesSchema, valuesSchema, module),
  ];
};
