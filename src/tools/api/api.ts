import type {TablesSchema, ValuesSchema} from '../../@types/store/index.d.ts';
import {EMPTY_STRING} from '../../common/strings.ts';
import {getStoreCoreApi} from './core.ts';
import {getStoreUiReactApi} from './react.ts';
import {objIsEmpty} from '../../common/obj.ts';

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
