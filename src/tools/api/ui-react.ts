import {TablesSchema, ValuesSchema} from '../../store.d';
import {camel, getCodeFunctions} from '../common/code';

export const getStoreUiReactApi = (
  tablesSchema: TablesSchema,
  valuesSchema: ValuesSchema,
  module: string,
): [string, string] => {
  const [
    build,
    addImport,
    _addType,
    _addMethod,
    addHook,
    _addFunction,
    addConstant,
    getImports,
    getTypes,
    _getMethods,
    getHooks,
    getConstants,
  ] = getCodeFunctions();

  const moduleDefinition = `./${camel(module)}.d`;
  const uiReactModuleDefinition = `./${camel(module)}-ui-react.d`;
  const storeType = camel(module, 1);

  addImport(0, 'tinybase/ui-react');
  addImport(0, moduleDefinition, storeType);

  addImport(1, 'react', 'React');
  addImport(1, moduleDefinition, storeType);
  addImport(1, uiReactModuleDefinition);

  addConstant('{useMemo}', 'React');

  addHook(
    `useCreate${storeType}`,
    `create: () => ${storeType}, createDeps?: React.DependencyList`,
    storeType,
    '\n// eslint-disable-next-line react-hooks/exhaustive-deps\n' +
      'useMemo(create, createDeps);',
    `Create a ${storeType} within a React application with convenient ` +
      'memoization',
    uiReactModuleDefinition,
  );

  // --

  return [
    build(...getImports(0), ...getTypes(), ...getHooks(0)),
    build(...getImports(1), ...getConstants(), ...getHooks(1)),
  ];
};
