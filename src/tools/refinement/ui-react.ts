import {
  DEPS_SUFFIX,
  EXPORT,
  ID,
  OPTIONAL_COLON,
  PROPS,
  PROVIDER,
  STORE,
} from '../common/strings';
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
import {EMPTY_STRING} from '../../common/strings';
import {Id} from '../../common.d';
import {getSchemaFunctions} from '../common/schema';

export const getStoreUiReactRefinement = (
  tablesSchema: TablesSchema,
  valuesSchema: ValuesSchema,
  module: string,
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

  return [
    build(
      `export * from 'tinybase/ui-react';`,
      ...getImports(0),
      ...getTypes(),
      ...getFunctions(),
    ),
  ];
};
