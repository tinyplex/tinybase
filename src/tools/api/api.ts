import type {TablesSchema, ValuesSchema} from '../../@types/store';
import {EMPTY_STRING} from '../../common/strings';
import {getStoreCoreApi} from './core';
import {getStoreUiReactApi} from './react';
import {objIsEmpty} from '../../common/obj';

export const getStoreApi = (
  tablesSchema: TablesSchema,
  valuesSchema: ValuesSchema,
  module: string,
): [string, string, string, string] => {
  if (objIsEmpty(tablesSchema) && objIsEmpty(valuesSchema)) {
    return [EMPTY_STRING, EMPTY_STRING, EMPTY_STRING, EMPTY_STRING];
  }

  const [dTsCore, tsCore, sharedTableTypes, sharedValueTypes] = getStoreCoreApi(
    tablesSchema,
    valuesSchema,
    module,
  );

  return [
    dTsCore,
    tsCore,
    ...getStoreUiReactApi(
      tablesSchema,
      valuesSchema,
      module,
      sharedTableTypes,
      sharedValueTypes,
    ),
  ];
};
