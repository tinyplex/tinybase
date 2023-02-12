import {EMPTY_STRING, TABLES, TABLE_IDS} from '../../common/strings';
import {IdMap, mapMap, mapNew} from '../../common/map';
import {
  LINE,
  LINE_OR_LINE_TREE,
  LINE_TREE,
  camel,
  comment,
  getCodeFunctions,
  mapUnique,
} from '../common/code';
import {TablesSchema, ValuesSchema} from '../../store.d';
import {arrayPush, arrayUnshift} from '../../common/array';
import {EXPORT} from '../common/strings';
import {Id} from '../../common.d';
import {OR_UNDEFINED} from '../common/strings';
import {SharedTableTypes} from './core';
import {isArray} from '../../common/other';
import {objIsEmpty} from '../../common/obj';

const USE_CONTEXT = 'const contextValue = useContext(Context);';
const AND_REGISTERS =
  ', and registers a listener so that any changes to ' +
  'that result will cause a re-render';

export const getStoreUiReactApi = (
  tablesSchema: TablesSchema,
  valuesSchema: ValuesSchema,
  module: string,
  sharedTableTypes: SharedTableTypes | [],
): [string, string] => {
  const [
    build,
    addImport,
    addType,
    addInternalFunction,
    addConstant,
    getImports,
    getTypes,
    getConstants,
  ] = getCodeFunctions();

  const moduleDefinition = `./${camel(module)}.d`;
  const uiReactModuleDefinition = `./${camel(module)}-ui-react.d`;
  const storeType = camel(module, 1);
  const storeInstance = camel(storeType);
  const StoreOrStoreId = `${storeType}Or${storeType}Id`;
  const storeOrStoreId = `${storeInstance}Or${storeType}Id`;

  const functions: IdMap<
    [
      parameters: LINE,
      returnType: string | 1,
      body: LINE,
      doc: string,
      generic: string,
    ]
  > = mapNew();

  const addFunction = (
    name: Id,
    parameters: LINE,
    returnType: string | 1,
    body: LINE_OR_LINE_TREE,
    doc: string,
    generic = '',
  ): Id => {
    addImport(1, uiReactModuleDefinition, `${name} as ${name}Decl`);
    return mapUnique(functions, name, [
      parameters,
      returnType,
      isArray(body) ? ['{', body, '}'] : body,
      doc,
      generic,
    ]);
  };

  const addHook = (
    name: Id,
    parameters: LINE,
    returnType: string,
    body: LINE_OR_LINE_TREE,
    doc: string,
    generic = '',
  ) => addFunction(`use${name}`, parameters, returnType, body, doc, generic);

  const addComponent = (
    name: Id,
    parameters: LINE,
    body: LINE_OR_LINE_TREE,
    doc: string,
  ) => addFunction(name, parameters, 1, body, doc);

  const getFunctions = (location: 0 | 1 = 0): LINE_TREE =>
    mapMap(functions, ([parameters, returnType, body, doc, generic], name) => {
      const lines = location
        ? [
            `${EXPORT} const ${name}: typeof ${name}Decl = ${generic}` +
              `(${parameters}): ${returnType == 1 ? 'any' : returnType} =>`,
            body,
          ]
        : [
            `${EXPORT} function ${name}${generic}(${parameters}` +
              `): ${returnType == 1 ? 'ComponentReturnType' : returnType};`,
          ];
      if (!location) {
        arrayUnshift(lines, comment(doc));
      }
      arrayPush(lines, EMPTY_STRING);
      return lines;
    });

  addImport(0, 'tinybase', 'Id');
  addImport(0, 'tinybase/ui-react', 'ComponentReturnType');
  addImport(0, moduleDefinition, storeType);

  const storeOrStoreIdType = addType(
    StoreOrStoreId,
    `${storeType} | Id`,
    `Used when you need to refer to a ${storeType} ` +
      'in a React hook or component',
  );

  const providerPropsType = addType(
    'ProviderProps',
    `{readonly ${storeInstance}?: ${storeType}; ` +
      `readonly ${storeInstance}ById?: ` +
      `{[${storeInstance}Id: Id]: ${storeType}}}`,
    'Used with the Provider component, so that ' +
      `a ${storeType} can be passed into the context of an application`,
  );

  addImport(1, 'react', 'React');
  addImport(1, 'tinybase', 'Id');
  addImport(1, uiReactModuleDefinition, storeOrStoreIdType, providerPropsType);

  const storeOrStoreIdParameter = `${storeOrStoreId}?: ` + storeOrStoreIdType;

  addConstant('{createContext, useContext, useMemo}', 'React');

  addConstant(
    'Context',
    `createContext<[${storeType}?, ` +
      `{[${storeInstance}Id: Id]: ${storeType}}?]>([])`,
  );

  addHook(
    `Create${storeType}`,
    `create: () => ${storeType}, createDeps?: React.DependencyList`,
    storeType,
    '\n// eslint-disable-next-line react-hooks/exhaustive-deps\n' +
      'useMemo(create, createDeps)',
    `Create a ${storeType} within a React application with convenient ` +
      'memoization',
  );

  const getStoreHook = addHook(
    storeType,
    `id?: Id`,
    storeType + OR_UNDEFINED,
    [
      USE_CONTEXT,
      'return id == null ? contextValue[0] : contextValue[1]?.[id];',
    ],
    `Get a reference to a ${storeType} from within a Provider component ` +
      'context',
  );

  const useHook = addInternalFunction(
    `useHook`,
    `${storeOrStoreId}: ${storeOrStoreIdType} | undefined, ` +
      `hook: (...args: any[]) => any, ...args: any[]`,
    [
      `const ${storeInstance} = ${getStoreHook}(${storeOrStoreId} as Id);`,
      `return hook((${storeOrStoreId} == null || ` +
        `typeof ${storeOrStoreId} == 'string')`,
      `? ${storeInstance} : ${storeOrStoreId}, ...args)`,
    ],
  );

  if (!objIsEmpty(tablesSchema)) {
    const [tablesType, tableIdType] = sharedTableTypes as SharedTableTypes;
    addImport(0, moduleDefinition, tablesType, tableIdType);

    addImport(
      1,
      'tinybase/ui-react',
      'useTables as useTablesCore',
      'useTableIds as useTableIdsCore',
    );
    addImport(1, moduleDefinition, storeType, tablesType, tableIdType);

    addHook(
      TABLES,
      storeOrStoreIdParameter,
      tablesType,
      `${useHook}(${storeOrStoreId}, useTablesCore)`,
      `Returns a Tables object${AND_REGISTERS}`,
    );

    addHook(
      TABLE_IDS,
      storeOrStoreIdParameter,
      tableIdType,
      `${useHook}(${storeOrStoreId}, useTableIdsCore)`,
      `Returns the Table Ids${AND_REGISTERS}`,
    );
  }

  addComponent(
    'Provider',
    `{${storeInstance}, ${storeInstance}ById, children}: ` +
      `${providerPropsType} & {children: React.ReactNode}`,
    [
      USE_CONTEXT,
      'return (',
      '<Context.Provider',
      'value={useMemo(',
      `() => [${storeInstance} ?? contextValue[0], ` +
        `{...contextValue[1], ...${storeInstance}ById}],`,
      `[${storeInstance}, ${storeInstance}ById, contextValue],`,
      ')}>',
      '{children}',
      '</Context.Provider>',
      ');',
    ],
    'Wraps part of an application in a context that provides default objects ' +
      'to be used by hooks and components within',
  );

  // --

  return [
    build(...getImports(0), ...getTypes(), ...getFunctions(0)),
    build(...getImports(1), ...getConstants(), ...getFunctions(1)),
  ];
};
