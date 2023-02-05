import {IdMap, mapMap, mapNew} from '../../common/map';
import {
  LINE,
  LINE_TREE,
  camel,
  comment,
  getCodeFunctions,
  mapUnique,
} from '../common/code';
import {TablesSchema, ValuesSchema} from '../../store.d';
import {arrayPush, arrayUnshift} from '../../common/array';
import {EMPTY_STRING} from '../../common/strings';
import {Id} from '../../common.d';

export const getStoreUiReactApi = (
  tablesSchema: TablesSchema,
  valuesSchema: ValuesSchema,
  module: string,
): [string, string] => {
  const [
    build,
    addImport,
    _addType,
    _addFunction,
    addConstant,
    getImports,
    getTypes,
    getConstants,
  ] = getCodeFunctions();

  const hooks: IdMap<
    [
      parameters: LINE,
      returnType: string,
      body: LINE,
      doc: string,
      generic: string,
    ]
  > = mapNew();

  const addHook = (
    name: Id,
    parameters: LINE,
    returnType: string,
    body: LINE,
    doc: string,
    uiReactModuleDefinition: string,
    generic = '',
  ): Id => {
    addImport(1, uiReactModuleDefinition, `${name} as ${name}Decl`);
    return mapUnique(hooks, name, [parameters, returnType, body, doc, generic]);
  };

  const getHooks = (location: 0 | 1 = 0): LINE_TREE =>
    mapMap(hooks, ([parameters, returnType, body, doc, generic], name) => {
      const lines = location
        ? [
            `export const ${name}: typeof ${name}Decl = ${generic}` +
              `(${parameters}): ${returnType} => ${body};`,
          ]
        : [`export function ${name}${generic}(${parameters}): ${returnType};`];
      if (!location) {
        arrayUnshift(lines, comment(doc));
      }
      arrayPush(lines, EMPTY_STRING);
      return lines;
    });

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
