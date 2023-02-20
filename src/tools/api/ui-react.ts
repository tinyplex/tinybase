import {
  CALLBACK,
  DEL,
  EXPORT,
  ID,
  PARTIAL,
  RETURNS_VOID,
  SET,
  SQUARE_BRACKETS,
  THE_STORE,
  getCellContentDoc,
  getIdsDoc,
  getRowContentDoc,
  getRowDoc,
  getTableContentDoc,
  getTableDoc,
  getTheContentOfTheStoreDoc,
  getValueContentDoc,
} from '../common/strings';
import {
  CELL,
  CELL_IDS,
  EMPTY_STRING,
  GET,
  IDS,
  ROW,
  ROW_IDS,
  SORTED_ROW_IDS,
  TABLE,
  TABLES,
  TABLE_IDS,
  VALUE,
  VALUES,
  VALUE_IDS,
} from '../../common/strings';
import {IdMap, mapGet, mapMap, mapNew} from '../../common/map';
import {
  LINE,
  LINE_OR_LINE_TREE,
  LINE_TREE,
  camel,
  comment,
  getCodeFunctions,
  join,
  mapUnique,
} from '../common/code';
import {SharedTableTypes, SharedValueTypes, TableTypes} from './core';
import {TablesSchema, ValuesSchema} from '../../store.d';
import {arrayFilter, arrayPush, arrayUnshift} from '../../common/array';
import {isArray, isUndefined} from '../../common/other';
import {Id} from '../../common.d';
import {OR_UNDEFINED} from '../common/strings';
import {getSchemaFunctions} from '../common/schema';
import {objIsEmpty} from '../../common/obj';

const getGet = (noun: string) => GET + noun;
const getGetAndGetDeps = (noun: string) =>
  getArgList(getGet(noun), getGet(noun) + 'Deps');
const getArgList = (...args: string[]) =>
  join(
    arrayFilter(args, (arg) => arg as any),
    ', ',
  );

const PARAMETER = 'Parameter';
const GETTER_ARGS = ': (parameter: ' + PARAMETER + ', store: Store) => ';
const USE_CONTEXT = 'const contextValue = useContext(Context);';
const AND_REGISTERS =
  ', and registers a listener so that any changes to ' +
  'that result will cause a re-render';
const BASED_ON_A_PARAMETER = ', based on a parameter';
const COLON_SPACE = ': ';
const PARAMETERIZED_CALLBACK =
  PARAMETER + 'ized' + CALLBACK + '<' + PARAMETER + '>';
const GENERIC_PARAMETER = '<' + PARAMETER + ',>';
const DEPS_SUFFIX = 'Deps?: React.DependencyList';
const THEN_DEPS = 'then' + DEPS_SUFFIX;
const THEN_PREFIX = 'then?: (store: Store';
const THEN_AND_THEN_DEPS = getArgList(
  THEN_PREFIX + ')' + RETURNS_VOID,
  THEN_DEPS,
);
const THEN_AND_THEN_DEPS_IN_CALL = 'then, thenDeps';
const ROW_ID = 'rowId';
const TYPED_ROW_ID = ROW_ID + COLON_SPACE + ID;

const COMMON_IMPORTS = [
  ID,
  IDS,
  'Store',
  CALLBACK,
  PARAMETER + 'ized' + CALLBACK,
];

export const getStoreUiReactApi = (
  tablesSchema: TablesSchema,
  valuesSchema: ValuesSchema,
  module: string,
  sharedTableTypes: SharedTableTypes | [],
  sharedValueTypes: SharedValueTypes | [],
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

  const [mapTablesSchema, mapCellSchema, mapValuesSchema] = getSchemaFunctions(
    tablesSchema,
    valuesSchema,
    addConstant,
  );

  const moduleDefinition = `./${camel(module)}.d`;
  const uiReactModuleDefinition = `./${camel(module)}-ui-react.d`;
  const tinyBaseUiReact = 'tinybase/ui-react';
  const storeType = camel(module, 1);
  const storeInstance = camel(storeType);
  const StoreOrStoreId = storeType + 'Or' + storeType + ID;
  const storeOrStoreId = storeInstance + 'Or' + storeType + ID;

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
    generic = EMPTY_STRING,
  ): Id => {
    addImport(1, uiReactModuleDefinition, name + ' as ' + name + 'Decl');
    return mapUnique(functions, name, [
      parameters,
      returnType,
      isArray(body) ? ['{', body, '}'] : body,
      doc,
      generic,
    ]);
  };

  const addHook = (
    name: string,
    parameters: LINE,
    returnType: string,
    body: LINE_OR_LINE_TREE,
    doc: string,
    generic = EMPTY_STRING,
  ) => addFunction(`use${name}`, parameters, returnType, body, doc, generic);

  const addProxyHook = (
    name: string,
    underlyingName: string,
    returnType: string,
    doc: string,
    preParameters = EMPTY_STRING,
    preParametersInCall = EMPTY_STRING,
    generic = EMPTY_STRING,
    postParameters = EMPTY_STRING,
    postParametersInCall = EMPTY_STRING,
  ) => {
    addImport(
      1,
      tinyBaseUiReact,
      `use${underlyingName} as use${underlyingName}Core`,
    );
    addHook(
      name,
      getArgList(preParameters, storeOrStoreIdParameter, postParameters),
      returnType,
      useHook +
        `(${storeOrStoreId}, use${underlyingName}Core, [` +
        (preParametersInCall ? preParametersInCall : EMPTY_STRING) +
        (postParametersInCall ? '], [' + postParametersInCall : EMPTY_STRING) +
        '])',
      doc,
      generic,
    );
  };

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
            EXPORT +
              ` const ${name}: typeof ${name}Decl = ${generic}` +
              `(${parameters}): ${returnType == 1 ? 'any' : returnType} =>`,
            body,
          ]
        : [
            EXPORT +
              ` function ${name}${generic}(${parameters}` +
              `): ${returnType == 1 ? 'ComponentReturnType' : returnType};`,
          ];
      if (!location) {
        arrayUnshift(lines, comment(doc));
      }
      arrayPush(lines, EMPTY_STRING);
      return lines;
    });

  addImport(0, 'tinybase', ...COMMON_IMPORTS);
  addImport(0, tinyBaseUiReact, 'ComponentReturnType');
  addImport(0, moduleDefinition, storeType);

  const storeOrStoreIdType = addType(
    StoreOrStoreId,
    storeType + ' | ' + ID,
    `Used when you need to refer to a ${storeType} in a React hook or ` +
      'component',
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
  addImport(1, 'tinybase', ...COMMON_IMPORTS);
  addImport(1, uiReactModuleDefinition, storeOrStoreIdType, providerPropsType);

  const storeOrStoreIdParameter = storeOrStoreId + '?: ' + storeOrStoreIdType;

  addConstant('{createContext, useContext, useMemo}', 'React');

  addConstant(
    'Context',
    `createContext<[${storeType}?, ` +
      `{[${storeInstance}Id: Id]: ${storeType}}?]>([])`,
  );

  addHook(
    `Create${storeType}`,
    `create: () => ${storeType}, create` + DEPS_SUFFIX,
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
    storeOrStoreId +
      `: ${storeOrStoreIdType} | undefined, ` +
      `hook: (...args: any[]) => any, preArgs: any[], postArgs: any[] = []`,
    [
      `const ${storeInstance} = ${getStoreHook}(${storeOrStoreId} as Id);`,
      `return hook(...preArgs, ((${storeOrStoreId} == null || ` +
        `typeof ${storeOrStoreId} == 'string')`,
      `? ${storeInstance} : ${storeOrStoreId})?.getStore(), ...postArgs)`,
    ],
  );

  if (!objIsEmpty(tablesSchema)) {
    const [tablesType, tableIdType, tablesTypes] =
      sharedTableTypes as SharedTableTypes;
    addImport(0, moduleDefinition, tablesType, tableIdType);

    addImport(1, tinyBaseUiReact);
    addImport(1, moduleDefinition, storeType, tablesType, tableIdType);

    addProxyHook(
      TABLES,
      TABLES,
      tablesType,
      getTheContentOfTheStoreDoc(1, 0) + AND_REGISTERS,
    );

    addProxyHook(
      TABLE_IDS,
      TABLE_IDS,
      tableIdType + SQUARE_BRACKETS,
      getIdsDoc(TABLE, THE_STORE) + AND_REGISTERS,
    );

    addProxyHook(
      SET + TABLES + CALLBACK,
      SET + TABLES + CALLBACK,
      PARAMETERIZED_CALLBACK,
      getTheContentOfTheStoreDoc(1, 9) + BASED_ON_A_PARAMETER,
      getArgList(
        getGet(TABLES) + GETTER_ARGS + tablesType,
        getGet(TABLES) + DEPS_SUFFIX,
      ),
      getGetAndGetDeps(TABLES),
      GENERIC_PARAMETER,
      getArgList(
        THEN_PREFIX,
        `tables: ${tablesType})` + RETURNS_VOID,
        THEN_DEPS,
      ),
      THEN_AND_THEN_DEPS_IN_CALL,
    );

    addProxyHook(
      DEL + TABLES + CALLBACK,
      DEL + TABLES + CALLBACK,
      CALLBACK,
      getTheContentOfTheStoreDoc(1, 12),
      EMPTY_STRING,
      EMPTY_STRING,
      EMPTY_STRING,
      THEN_AND_THEN_DEPS,
      THEN_AND_THEN_DEPS_IN_CALL,
    );

    mapTablesSchema((tableId: Id, tableName: string, TABLE_ID: string) => {
      const [tableType, rowType, rowWhenSetType, cellIdType] = mapGet(
        tablesTypes,
        tableId,
      ) as TableTypes;

      addImport(
        0,
        moduleDefinition,
        tableType,
        rowType,
        rowWhenSetType,
        cellIdType,
      );
      addImport(
        1,
        moduleDefinition,
        tableType,
        rowType,
        rowWhenSetType,
        cellIdType,
      );

      addProxyHook(
        tableName + TABLE,
        TABLE,
        tableType,
        getTableContentDoc(tableId) + AND_REGISTERS,
        EMPTY_STRING,
        TABLE_ID,
      );

      addProxyHook(
        tableName + ROW_IDS,
        ROW_IDS,
        IDS,
        getIdsDoc(ROW, getTableDoc(tableId)) + AND_REGISTERS,
        EMPTY_STRING,
        TABLE_ID,
      );

      addProxyHook(
        tableName + SORTED_ROW_IDS,
        SORTED_ROW_IDS,
        IDS,
        getIdsDoc(ROW, getTableDoc(tableId), 1) + AND_REGISTERS,
        'cellId?: ' +
          cellIdType +
          ', descending?: boolean, offset?: number, limit?: number',
        TABLE_ID + ', cellId, descending, offset, limit',
      );

      addProxyHook(
        tableName + ROW,
        ROW,
        rowType,
        getRowContentDoc(tableId) + AND_REGISTERS,
        TYPED_ROW_ID,
        getArgList(TABLE_ID, ROW_ID),
      );

      addProxyHook(
        tableName + CELL_IDS,
        CELL_IDS,
        cellIdType + SQUARE_BRACKETS,
        getIdsDoc(CELL, getRowDoc(tableId)) + AND_REGISTERS,
        TYPED_ROW_ID,
        getArgList(TABLE_ID, ROW_ID),
      );

      addProxyHook(
        SET + tableName + TABLE + CALLBACK,
        SET + TABLE + CALLBACK,
        PARAMETERIZED_CALLBACK,
        getTableContentDoc(tableId, 9) + BASED_ON_A_PARAMETER,
        getArgList(
          getGet(TABLE) + GETTER_ARGS + tableType,
          getGet(TABLE) + DEPS_SUFFIX,
        ),
        getArgList(TABLE_ID, getGetAndGetDeps(TABLE)),
        GENERIC_PARAMETER,
        getArgList(
          THEN_PREFIX,
          `table: ${tableType})` + RETURNS_VOID,
          THEN_DEPS,
        ),
        THEN_AND_THEN_DEPS_IN_CALL,
      );

      addProxyHook(
        DEL + tableName + TABLE + CALLBACK,
        DEL + TABLE + CALLBACK,
        CALLBACK,
        getTableContentDoc(tableId, 12),
        EMPTY_STRING,
        TABLE_ID,
        EMPTY_STRING,
        THEN_AND_THEN_DEPS,
        THEN_AND_THEN_DEPS_IN_CALL,
      );

      addProxyHook(
        SET + tableName + ROW + CALLBACK,
        SET + ROW + CALLBACK,
        PARAMETERIZED_CALLBACK,
        getRowContentDoc(tableId, 9) + BASED_ON_A_PARAMETER,
        getArgList(
          TYPED_ROW_ID,
          getGet(ROW) + GETTER_ARGS + rowWhenSetType,
          getGet(ROW) + DEPS_SUFFIX,
        ),
        getArgList(TABLE_ID, ROW_ID, getGetAndGetDeps(ROW)),
        GENERIC_PARAMETER,
        getArgList(
          THEN_PREFIX,
          `row: ${rowWhenSetType})` + RETURNS_VOID,
          THEN_DEPS,
        ),
        THEN_AND_THEN_DEPS_IN_CALL,
      );

      addProxyHook(
        'Add' + tableName + ROW + CALLBACK,
        'Add' + ROW + CALLBACK,
        PARAMETERIZED_CALLBACK,
        getRowContentDoc(tableId, 10) + BASED_ON_A_PARAMETER,
        getArgList(
          getGet(ROW) + GETTER_ARGS + rowWhenSetType,
          getGet(ROW) + DEPS_SUFFIX,
        ),
        getArgList(TABLE_ID, getGetAndGetDeps(ROW)),
        GENERIC_PARAMETER,
        'then?: (' +
          getArgList(
            TYPED_ROW_ID + OR_UNDEFINED,
            'store: Store',
            'row: ' + rowWhenSetType + ')' + RETURNS_VOID,
            'then' + DEPS_SUFFIX,
          ),
        THEN_AND_THEN_DEPS_IN_CALL,
      );

      addProxyHook(
        SET + tableName + PARTIAL + ROW + CALLBACK,
        SET + PARTIAL + ROW + CALLBACK,
        PARAMETERIZED_CALLBACK,
        getRowContentDoc(tableId, 11) + BASED_ON_A_PARAMETER,
        getArgList(
          TYPED_ROW_ID,
          getGet(PARTIAL + ROW) + GETTER_ARGS + rowWhenSetType,
          getGet(PARTIAL + ROW) + DEPS_SUFFIX,
        ),
        getArgList(TABLE_ID, ROW_ID, getGetAndGetDeps(PARTIAL + ROW)),
        GENERIC_PARAMETER,
        getArgList(
          THEN_PREFIX,
          `partialRow: ${rowWhenSetType})` + RETURNS_VOID,
          THEN_DEPS,
        ),
        THEN_AND_THEN_DEPS_IN_CALL,
      );

      addProxyHook(
        DEL + tableName + ROW + CALLBACK,
        DEL + ROW + CALLBACK,
        CALLBACK,
        getRowContentDoc(tableId, 12),
        TYPED_ROW_ID,
        getArgList(TABLE_ID, ROW_ID),
        EMPTY_STRING,
        THEN_AND_THEN_DEPS,
        THEN_AND_THEN_DEPS_IN_CALL,
      );

      mapCellSchema(
        tableId,
        (cellId, type, defaultValue, CELL_ID, cellName) => {
          const mapCellType = 'Map' + camel(type, 1);
          addImport(0, moduleDefinition, mapCellType);
          addImport(1, moduleDefinition, mapCellType);

          addProxyHook(
            tableName + cellName + CELL,
            CELL,
            type + (isUndefined(defaultValue) ? OR_UNDEFINED : EMPTY_STRING),
            getCellContentDoc(tableId, cellId) + AND_REGISTERS,
            TYPED_ROW_ID,
            getArgList(TABLE_ID, ROW_ID, CELL_ID),
          );

          addProxyHook(
            SET + tableName + cellName + CELL + CALLBACK,
            SET + CELL + CALLBACK,
            PARAMETERIZED_CALLBACK,
            getCellContentDoc(tableId, cellId, 9) + BASED_ON_A_PARAMETER,
            getArgList(
              TYPED_ROW_ID,
              getGet(CELL) + GETTER_ARGS + type + ' | ' + mapCellType,
              getGet(CELL) + DEPS_SUFFIX,
            ),
            getArgList(TABLE_ID, ROW_ID, CELL_ID, getGetAndGetDeps(CELL)),
            GENERIC_PARAMETER,
            getArgList(
              THEN_PREFIX,
              `cell: ${type} | ${mapCellType})` + RETURNS_VOID,
              THEN_DEPS,
            ),
            THEN_AND_THEN_DEPS_IN_CALL,
          );

          addProxyHook(
            DEL + tableName + cellName + CELL + CALLBACK,
            DEL + CELL + CALLBACK,
            CALLBACK,
            getCellContentDoc(tableId, cellId, 12),
            getArgList(TYPED_ROW_ID, 'forceDel?: boolean'),
            getArgList(TABLE_ID, ROW_ID, CELL_ID, 'forceDel'),
            EMPTY_STRING,
            THEN_AND_THEN_DEPS,
            THEN_AND_THEN_DEPS_IN_CALL,
          );
        },
      );
    });
  }

  if (!objIsEmpty(valuesSchema)) {
    const [valuesType, valuesWhenSetType, valueIdType] =
      sharedValueTypes as SharedValueTypes;

    addImport(0, moduleDefinition, valuesType, valuesWhenSetType, valueIdType);
    addImport(1, moduleDefinition, valuesType, valuesWhenSetType, valueIdType);

    addProxyHook(
      VALUES,
      VALUES,
      valuesType,
      getTheContentOfTheStoreDoc(2, 0) + AND_REGISTERS,
    );

    addProxyHook(
      VALUE_IDS,
      VALUE_IDS,
      valueIdType + SQUARE_BRACKETS,
      getIdsDoc(VALUE, THE_STORE) + AND_REGISTERS,
    );

    addProxyHook(
      SET + VALUES + CALLBACK,
      SET + VALUES + CALLBACK,
      PARAMETERIZED_CALLBACK,
      getTheContentOfTheStoreDoc(2, 9) + BASED_ON_A_PARAMETER,
      getArgList(
        getGet(VALUES) + GETTER_ARGS + valuesWhenSetType,
        getGet(VALUES) + DEPS_SUFFIX,
      ),
      getGetAndGetDeps(VALUES),
      GENERIC_PARAMETER,
      getArgList(
        THEN_PREFIX,
        `values: ${valuesWhenSetType})` + RETURNS_VOID,
        THEN_DEPS,
      ),
      THEN_AND_THEN_DEPS_IN_CALL,
    );

    addProxyHook(
      SET + PARTIAL + VALUES + CALLBACK,
      SET + PARTIAL + VALUES + CALLBACK,
      PARAMETERIZED_CALLBACK,
      getTheContentOfTheStoreDoc(2, 11) + BASED_ON_A_PARAMETER,
      getArgList(
        getGet(PARTIAL + VALUES) + GETTER_ARGS + valuesWhenSetType,
        getGet(PARTIAL + VALUES) + DEPS_SUFFIX,
      ),
      getGetAndGetDeps(PARTIAL + VALUES),
      GENERIC_PARAMETER,
      getArgList(
        THEN_PREFIX,
        `partialValues: ${valuesWhenSetType})` + RETURNS_VOID,
        THEN_DEPS,
      ),
      THEN_AND_THEN_DEPS_IN_CALL,
    );

    addProxyHook(
      DEL + VALUES + CALLBACK,
      DEL + VALUES + CALLBACK,
      CALLBACK,
      getTheContentOfTheStoreDoc(2, 12),
      EMPTY_STRING,
      EMPTY_STRING,
      EMPTY_STRING,
      THEN_AND_THEN_DEPS,
      THEN_AND_THEN_DEPS_IN_CALL,
    );

    mapValuesSchema((valueId, type, _, VALUE_ID, valueName) => {
      const mapValueType = 'Map' + camel(type, 1);
      addImport(0, moduleDefinition, mapValueType);
      addImport(1, moduleDefinition, mapValueType);

      addProxyHook(
        valueName + VALUE,
        VALUE,
        type,
        getValueContentDoc(valueId) + AND_REGISTERS,
        EMPTY_STRING,
        VALUE_ID,
      );

      addProxyHook(
        SET + valueName + VALUE + CALLBACK,
        SET + VALUE + CALLBACK,
        PARAMETERIZED_CALLBACK,
        getValueContentDoc(valueId, 9) + BASED_ON_A_PARAMETER,
        getArgList(
          getGet(VALUE) + GETTER_ARGS + type + ' | ' + mapValueType,
          getGet(VALUE) + DEPS_SUFFIX,
        ),
        getArgList(VALUE_ID, getGetAndGetDeps(VALUE)),
        GENERIC_PARAMETER,
        getArgList(
          THEN_PREFIX,
          `value: ${type} | ${mapValueType})` + RETURNS_VOID,
          THEN_DEPS,
        ),
        THEN_AND_THEN_DEPS_IN_CALL,
      );

      addProxyHook(
        DEL + valueName + VALUE + CALLBACK,
        DEL + VALUE + CALLBACK,
        CALLBACK,
        getValueContentDoc(valueId, 12),
        EMPTY_STRING,
        VALUE_ID,
        EMPTY_STRING,
        THEN_AND_THEN_DEPS,
        THEN_AND_THEN_DEPS_IN_CALL,
      );
    });
  }

  addComponent(
    'Provider',
    `{${storeInstance}, ${storeInstance}ById, children}: ` +
      providerPropsType +
      ' & {children: React.ReactNode}',
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
