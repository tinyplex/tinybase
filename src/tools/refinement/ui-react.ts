import {IdMap, mapMap, mapNew} from '../../common/map';
import {
  LINE,
  LINE_TREE,
  getCodeFunctions,
  mapUnique,
  camel,
} from '../common/code';
import {TablesSchema, ValuesSchema} from '../../store.d';
import {EMPTY_STRING} from '../../common/strings';
import {EXPORT, ID, STORE} from '../common/strings';
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

  const _addHook = (
    name: string,
    parameters: LINE,
    returnType: string,
    doc: string,
    generic = EMPTY_STRING,
  ) => addFunction(`use${name}`, parameters, returnType, doc, generic);

  const _addComponent = (name: Id, parameters: LINE, doc: string) =>
    addFunction(name, parameters, 1, doc);

  const getFunctions = (): LINE_TREE =>
    mapMap(functions, ([parameters, returnType, doc, generic], name) => [
      doc,
      EXPORT +
        ` function ${name}${generic}(${parameters}` +
        `): ${returnType == 1 ? 'ComponentReturnType' : returnType};`,
      EMPTY_STRING,
    ]);

  // ---

  addImport(0, moduleDefinition, STORE, ID);
  //  addImport(0, tinyBaseUiReact, 'ComponentReturnType');

  // StoreOrStoreId
  const _storeOrStoreIdType = addType(
    'StoreOrStoreId',
    STORE + ' | ' + ID,
    'Used when you need to refer to a Store in a React hook or component',
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
