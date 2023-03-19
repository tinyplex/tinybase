import {
  AND_REGISTERS,
  DEPS_SUFFIX,
  EXPORT,
  ID,
  OPTIONAL_COLON,
  PROPS,
  PROVIDER,
  STORE,
  getTheContentOfTheStoreDoc,
} from '../common/strings';
import {EMPTY_STRING, TABLES} from '../../common/strings';
import {IdMap, mapMap, mapNew} from '../../common/map';
import {
  LINE,
  LINE_TREE,
  camel,
  comment,
  getCodeFunctions,
  getPropTypeList,
  mapUnique,
} from '../common/code';
import {TablesSchema, ValuesSchema} from '../../store.d';
import {Id} from '../../common.d';
import {SharedTypes} from './core';
import {getSchemaFunctions} from '../common/schema';
import {objIsEmpty} from '../../common/obj';

export const getStoreUiReactRefinement = (
  tablesSchema: TablesSchema,
  valuesSchema: ValuesSchema,
  module: string,
  sharedTypes: SharedTypes,
): [string] => {
  const [
    build,
    addImport,
    addType,
    _addInternalFunction,
    _addConstant,
    getImports,
    getTypes,
  ] = getCodeFunctions();

  const [mapTablesSchema, mapCellSchema, mapValuesSchema] = getSchemaFunctions(
    tablesSchema,
    valuesSchema,
    () => EMPTY_STRING,
  );

  const moduleDefinition = `./${camel(module)}-refinement.d`;
  const tinyBaseUiReact = 'tinybase/ui-react';

  const functions: IdMap<
    [parameters: LINE, returnType: string | 1, doc: string, generic: string]
  > = mapNew();

  const addFunction = (
    name: Id,
    parameters: LINE,
    returnType: string | 1,
    doc: string,
    generic = EMPTY_STRING,
  ): Id => mapUnique(functions, name, [parameters, returnType, doc, generic]);

  const addHook = (
    name: string,
    parameters: LINE,
    returnType: string,
    doc: string,
    generic = EMPTY_STRING,
  ) => addFunction(`use${name}`, parameters, returnType, doc, generic);

  const addComponent = (name: Id, parameters: LINE, doc: string) =>
    addFunction(name, parameters, 1, doc);

  const getFunctions = (): LINE_TREE =>
    mapMap(functions, ([parameters, returnType, doc, generic], name) => [
      comment(doc),
      EXPORT +
        ` function ${name}${generic}(${parameters}` +
        `): ${returnType == 1 ? 'ComponentReturnType' : returnType};`,
      EMPTY_STRING,
    ]);

  const [
    tablesType,
    _tablesWhenSetType,
    _tableIdType,
    _tableType,
    _tableWhenSetType,
    _rowType,
    _rowWhenSetType,
    _cellIdType,
    _cellType,
    _cellCallbackType,
    _rowCallbackType,
    _tableCallbackType,
    _tablesListenerType,
    _tableIdsListenerType,
    _tableListenerType,
    _rowIdsListenerType,
    _sortedRowIdsListenerType,
    _rowListenerType,
    _cellIdsListenerType,
    _cellListenerType,
    _invalidCellListenerType,
    _tableId,
    _tableIdOrNull,
    _allCellIdsType,
    _tIdGeneric,
    _cId,
    _cIdGeneric,
    _valuesType,
    _valuesWhenSetType,
    _valueIdType,
    _valueType,
    _valueCallbackType,
    _valuesListenerType,
    _valueIdsListenerType,
    _valueListenerType,
    _invalidValueListenerType,
    _valueId,
    _valueIdOrNull,
    _vIdGeneric,
  ] = sharedTypes as SharedTypes;

  // ---

  addImport(0, moduleDefinition, STORE, ID);
  //  addImport(0, tinyBaseUiReact, 'ComponentReturnType');

  // StoreOrStoreId
  const storeOrStoreIdType = addType(
    'StoreOrStoreId',
    STORE + ' | ' + ID,
    'Used when you need to refer to a Store in a React hook or component',
  );

  // ProviderProps
  const providerPropsType = addType(
    PROVIDER + PROPS,
    getPropTypeList(
      'store' + OPTIONAL_COLON + STORE,
      `storeById?: {[storeId: Id]: ${STORE}}`,
    ),
    `Used with the ${PROVIDER} component, so that a ` +
      STORE +
      ' can be passed into the context of an application',
  );

  // useCreateStore
  addHook(
    'Create' + STORE,
    `create: () => ${STORE}, create` + DEPS_SUFFIX,
    STORE,
    `Create a ${STORE} within a React application with convenient ` +
      'memoization',
  );

  const storeOrStoreIdParameter =
    'storeOrStoreId' + OPTIONAL_COLON + storeOrStoreIdType;

  if (objIsEmpty(tablesSchema)) {
    addImport(0, 'tinybase', tablesType);
  } else {
    addImport(0, moduleDefinition, tablesType);
  }

  // useTables
  addHook(
    TABLES,
    storeOrStoreIdParameter,
    tablesType,
    getTheContentOfTheStoreDoc(1, 0) + AND_REGISTERS,
  );

  return [
    build(
      `export * from 'tinybase/ui-react';`,
      ...getImports(0),
      ...getTypes(),
      ...getFunctions(),
    ),
  ];
};
