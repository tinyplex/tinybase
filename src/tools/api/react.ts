import {
  A,
  AND_REGISTERS,
  CALLBACK,
  COUNT,
  DEL,
  DEPS,
  DEPS_SUFFIX,
  EXPORT,
  ID,
  LISTENER_,
  OPTIONAL_COLON,
  OR_UNDEFINED,
  PARTIAL,
  PROPS,
  PROVIDER,
  RETURNS_VOID,
  SET,
  SQUARE_BRACKETS,
  THE_STORE,
  VOID,
  getCellContentDoc,
  getHasDoc,
  getIdsDoc,
  getListenerDoc,
  getPropsDoc,
  getRowContentDoc,
  getRowDoc,
  getTableContentDoc,
  getTableDoc,
  getTheContentOfDoc,
  getTheContentOfTheStoreDoc,
  getValueContentDoc,
} from '../common/strings';
import {
  BOOLEAN,
  CELL,
  CELL_IDS,
  EMPTY_STRING,
  GET,
  HAS,
  IDS,
  LISTENER,
  NUMBER,
  ROW,
  ROW_IDS,
  SORTED_ROW_IDS,
  TABLE,
  TABLES,
  TABLE_IDS,
  TINYBASE,
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
  getParameterList,
  getPropTypeList,
  mapUnique,
} from '../common/code';
import {SharedTableTypes, SharedValueTypes, TableTypes} from './core';
import {TablesSchema, ValuesSchema} from '../../types/store';
import {arrayJoin, arrayPush, arrayUnshift} from '../../common/array';
import {Id} from '../../types/common';
import {getSchemaFunctions} from '../common/schema';
import {isUndefined} from '../../common/other';
import {objIsEmpty} from '../../common/obj';

const getGet = (noun: string) => GET + noun;
const getGetAndGetDeps = (noun: string) =>
  getParameterList(getGet(noun), getGet(noun) + DEPS);

const DEBUG_IDS_PROP_TYPE = 'debugIds?: boolean';
const DEBUG_IDS_PROP = 'debugIds={debugIds}';
const THEN_DEPS = 'then' + DEPS_SUFFIX;
const PARAMETER = 'Parameter';
const GETTER_ARGS = ': (parameter: ' + PARAMETER + ', store: Store) => ';
const USE_CONTEXT = 'const contextValue = useContext(Context);';
const BASED_ON_A_PARAMETER = ', based on a parameter';
const COLON_SPACE = ': ';
const GENERIC_PARAMETER = '<' + PARAMETER + ',>';
const PARAMETERIZED_CALLBACK =
  PARAMETER + 'ized' + CALLBACK + '<' + PARAMETER + '>';
const ROW_ID = 'rowId';
const ROW_ID_PROP = 'rowId={rowId}';
const SEPARATOR_AND_DEBUG_IDS = ', separator, debugIds';
const SEPARATOR_PROP_TYPE = 'separator?: ReactElement | string';
const THEN_PREFIX = 'then?: (store: Store';
const THEN_AND_THEN_DEPS = getParameterList(
  THEN_PREFIX + ')' + RETURNS_VOID,
  THEN_DEPS,
);
const THEN_AND_THEN_DEPS_IN_CALL = 'then, then' + DEPS;
const TYPED_ROW_ID = ROW_ID + COLON_SPACE + ID;
const VIEW = 'View';

const getListenerHookParams = (
  listenerType: string,
  ...extraParams: string[]
) =>
  getParameterList(
    ...extraParams,
    LISTENER_ + ': ' + listenerType,
    LISTENER_ + DEPS_SUFFIX,
    'mutator?: boolean',
  );

const getListenerHookParamsInCall = (...extraParams: string[]) =>
  getParameterList(...extraParams, LISTENER_, LISTENER_ + DEPS, 'mutator');

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
  const storeProp = storeInstance + `={${storeInstance}}`;

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
      body,
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
    return addHook(
      name,
      getParameterList(preParameters, storeOrStoreIdParameter, postParameters),
      returnType,
      useHook +
        `(${storeOrStoreId}, use${underlyingName}Core, [` +
        (preParametersInCall ? preParametersInCall : EMPTY_STRING) +
        (postParametersInCall ? '], [' + postParametersInCall : EMPTY_STRING) +
        ']);',
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

  // ---

  addImport(
    null,
    TINYBASE,
    ID,
    'Store',
    CALLBACK,
    PARAMETER + 'ized' + CALLBACK,
  );
  addImport(0, tinyBaseUiReact, 'ComponentReturnType');
  addImport(1, tinyBaseUiReact, 'useCellIds');
  addImport(null, tinyBaseUiReact, 'ExtraProps');
  addImport(0, moduleDefinition, storeType);

  // StoreOrStoreId
  const storeOrStoreIdType = addType(
    StoreOrStoreId,
    storeType + ' | ' + ID,
    `Used when you need to refer to a ${storeType} in a React hook or ` +
      'component',
  );

  // ProviderProps
  const providerPropsType = addType(
    PROVIDER + PROPS,
    getPropTypeList(
      storeInstance + OPTIONAL_COLON + storeType,
      storeInstance + `ById?: {[${storeInstance}Id: Id]: ${storeType}}`,
    ),
    `Used with the ${PROVIDER} component, so that a ` +
      storeType +
      ' can be passed into the context of an application',
  );

  addImport(0, 'react', 'ReactElement', 'ComponentType');
  addImport(1, 'react', 'React');
  addImport(1, uiReactModuleDefinition, storeOrStoreIdType, providerPropsType);

  const storeOrStoreIdParameter =
    storeOrStoreId + OPTIONAL_COLON + storeOrStoreIdType;

  addConstant('{createContext, useContext, useMemo}', 'React');

  addConstant(
    'Context',
    `createContext<[${storeType}?, ` +
      `{[${storeInstance}Id: Id]: ${storeType}}?]>([])`,
  );

  // useCreateStore
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
      '{',
      USE_CONTEXT,
      'return id == null ? contextValue[0] : contextValue[1]?.[id];',
      '}',
    ],
    `Get a reference to a ${storeType} from within a ${PROVIDER} component ` +
      'context',
  );

  const useHook = addInternalFunction(
    `useHook`,
    storeOrStoreId +
      `: ${storeOrStoreIdType} | undefined, hook: (...params: any[]) => any, ` +
      `preParams: any[], postParams: any[] = []`,
    [
      `const ${storeInstance} = ${getStoreHook}(${storeOrStoreId} as Id);`,
      `return hook(...preParams, ((${storeOrStoreId} == null || ` +
        `typeof ${storeOrStoreId} == 'string')`,
      `? ${storeInstance} : ${storeOrStoreId})?.getStore(), ...postParams)`,
    ],
  );

  const getProps = addInternalFunction(
    'getProps',
    'getProps: ((id: any) => ExtraProps) | undefined, id: Id',
    '(getProps == null) ? ({} as ExtraProps) : getProps(id)',
  );

  const wrap = addInternalFunction(
    'wrap',
    getParameterList(
      'children: any',
      'separator?: any',
      'encloseWithId?: boolean',
      'id?: Id',
    ),
    [
      'const separated = separator==null || !Array.isArray(children)',
      ' ? children',
      ' : children.map((child, c) => (c > 0 ? [separator, child] : child));',
      `return encloseWithId ? [id, ':{', separated, '}'] : separated;`,
    ],
  );

  const useCustomOrDefaultCellIds = addInternalFunction(
    'useCustomOrDefaultCellIds',
    getParameterList(
      'customCellIds: Ids | undefined',
      'tableId: Id',
      'rowId: Id',
      `${storeOrStoreId}?: ${storeOrStoreIdType} | undefined`,
    ),
    [
      `const defaultCellIds = ${useHook}(${storeOrStoreId}, ` +
        'useCellIds, [tableId, rowId]);',
      'return customCellIds ?? defaultCellIds;',
    ],
  );

  const NullComponent = addConstant('NullComponent', `() => null`);

  if (!objIsEmpty(tablesSchema)) {
    const [
      tablesType,
      tablesWhenSetType,
      tableIdType,
      cellIdType,
      hasTablesListenerType,
      tablesListenerType,
      tableIdsListenerType,
      hasTableListenerType,
      tableListenerType,
      tableCellIdsListenerType,
      hasTableCellListenerType,
      rowCountListenerType,
      rowIdsListenerType,
      sortedRowIdsListenerType,
      hasRowListenerType,
      rowListenerType,
      cellIdsListenerType,
      hasCellListenerType,
      cellListenerType,
      tablesTypes,
    ] = sharedTableTypes as SharedTableTypes;

    addImport(
      null,
      moduleDefinition,
      tablesType,
      tablesWhenSetType,
      tableIdType,
      hasTablesListenerType,
      tablesListenerType,
      tableIdsListenerType,
      hasTableListenerType,
      tableListenerType,
      tableCellIdsListenerType,
      hasTableCellListenerType,
      rowCountListenerType,
      rowIdsListenerType,
      sortedRowIdsListenerType,
      hasRowListenerType,
      rowListenerType,
      cellIdsListenerType,
      cellListenerType,
      hasCellListenerType,
    );
    addImport(0, moduleDefinition, cellIdType);
    addImport(1, moduleDefinition, storeType);
    addImport(null, TINYBASE, IDS, 'IdOrNull');

    const tableView = addInternalFunction(
      'tableView',
      `{${storeInstance}, rowComponent, getRowComponentProps, customCellIds` +
        SEPARATOR_AND_DEBUG_IDS +
        '}: any, rowIds: Ids, tableId: Id, ' +
        'defaultRowComponent: React.ComponentType<any>',
      [
        'const Row = rowComponent ?? defaultRowComponent;',
        `return ${wrap}(rowIds.map((rowId) => (`,
        '<Row',
        '{...' + getProps + '(getRowComponentProps, rowId)}',
        'key={rowId}',
        'tableId={tableId}',
        ROW_ID_PROP,
        'customCellIds={customCellIds}',
        storeProp,
        DEBUG_IDS_PROP,
        '/>',
        '))',
        SEPARATOR_AND_DEBUG_IDS,
        ', tableId,',
        ');',
      ],
    );

    const getDefaultTableComponent = addInternalFunction(
      'getDefaultTableComponent',
      'tableId: Id',
      arrayJoin(
        mapTablesSchema(
          (_, tableName, TABLE_ID) =>
            `tableId == ${TABLE_ID} ? ${tableName}TableView : `,
        ),
      ) + NullComponent,
    );

    const getDefaultCellComponent = addInternalFunction(
      'getDefaultCellComponent',
      'tableId: Id, cellId: Id',
      arrayJoin(
        mapTablesSchema(
          (tableId, tableName, TABLE_ID) =>
            `tableId == ${TABLE_ID} ? ${
              arrayJoin(
                mapCellSchema(
                  tableId,
                  (_, _2, _3, CELL_ID, cellName) =>
                    `cellId == ${CELL_ID} ? ` +
                    tableName +
                    cellName +
                    'CellView : ',
                ),
              ) + NullComponent
            } : `,
        ),
      ) + NullComponent,
    );

    // useHasTables
    addProxyHook(
      HAS + TABLES,
      HAS + TABLES,
      BOOLEAN,
      getTheContentOfTheStoreDoc(1, 0, 0, 1) + AND_REGISTERS,
    );

    // useTables
    addProxyHook(
      TABLES,
      TABLES,
      tablesType,
      getTheContentOfTheStoreDoc(1, 0) + AND_REGISTERS,
    );

    // useTableIds
    const useTableIds = addProxyHook(
      TABLE_IDS,
      TABLE_IDS,
      tableIdType + SQUARE_BRACKETS,
      getIdsDoc(TABLE, THE_STORE) + AND_REGISTERS,
    );

    // useSetTablesCallback
    addProxyHook(
      SET + TABLES + CALLBACK,
      SET + TABLES + CALLBACK,
      PARAMETERIZED_CALLBACK,
      getTheContentOfTheStoreDoc(1, 9) + BASED_ON_A_PARAMETER,
      getParameterList(
        getGet(TABLES) + GETTER_ARGS + tablesWhenSetType,
        getGet(TABLES) + DEPS_SUFFIX,
      ),
      getGetAndGetDeps(TABLES),
      GENERIC_PARAMETER,
      getParameterList(
        THEN_PREFIX,
        `tables: ${tablesWhenSetType})` + RETURNS_VOID,
        THEN_DEPS,
      ),
      THEN_AND_THEN_DEPS_IN_CALL,
    );

    // useDelTablesCallback
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

    // CellProps
    const cellPropsType = addType(
      CELL + PROPS,
      getPropTypeList(
        'tableId?: TId',
        'rowId: Id',
        'cellId?: CId',
        storeInstance + OPTIONAL_COLON + storeType,
        DEBUG_IDS_PROP_TYPE,
      ),
      getPropsDoc(A + CELL),
      `<TId extends ${tableIdType}, CId extends ${cellIdType}<TId>>`,
    );

    // RowProps
    const rowPropsType = addType(
      ROW + PROPS,
      getPropTypeList(
        `tableId?: TId`,
        'rowId: Id',
        storeInstance + OPTIONAL_COLON + storeType,
        'cellComponents?: {readonly [CId in ' +
          cellIdType +
          `<TId>]?: ComponentType<${cellPropsType}<TId, CId>>;}`,
        `getCellComponentProps?: (cellId: ${cellIdType}<TId>) => ExtraProps`,
        `customCellIds?: ${cellIdType}<TId>[]`,
        SEPARATOR_PROP_TYPE,
        DEBUG_IDS_PROP_TYPE,
      ),
      getPropsDoc(A + ROW),
      `<TId extends ${tableIdType}>`,
    );

    // TableProps
    const tablePropsType = addType(
      TABLE + PROPS,
      getPropTypeList(
        `tableId?: TId`,
        storeInstance + OPTIONAL_COLON + storeType,
        `rowComponent?: ComponentType<${rowPropsType}<TId>>`,
        `getRowComponentProps?: (rowId: Id) => ExtraProps`,
        `customCellIds?: CellId<TId>[]`,
        SEPARATOR_PROP_TYPE,
        DEBUG_IDS_PROP_TYPE,
      ),
      getPropsDoc(A + TABLE),
      `<TId extends ${tableIdType}>`,
    );

    // SortedTableProps
    const sortedTablePropsType = addType(
      'Sorted' + TABLE + PROPS,
      getPropTypeList(
        `tableId?: TId`,
        'cellId?: ' + cellIdType + '<TId>',
        'descending?: boolean',
        'offset?: number',
        'limit?: number',
        storeInstance + OPTIONAL_COLON + storeType,
        `rowComponent?: ComponentType<${rowPropsType}<TId>>`,
        `getRowComponentProps?: (rowId: Id) => ExtraProps`,
        `customCellIds?: CellId<TId>[]`,
        SEPARATOR_PROP_TYPE,
        DEBUG_IDS_PROP_TYPE,
      ),
      getPropsDoc(A + 'sorted ' + TABLE),
      `<TId extends ${tableIdType}>`,
    );

    // TablesProps
    const tablesPropsType = addType(
      TABLES + PROPS,
      getPropTypeList(
        storeInstance + OPTIONAL_COLON + storeType,
        'tableComponents?: {readonly [TId in ' +
          tableIdType +
          `]?: ComponentType<${tablePropsType}<TId>>;}`,
        `getTableComponentProps?: (tableId: ${tableIdType}) => ExtraProps`,
        SEPARATOR_PROP_TYPE,
        DEBUG_IDS_PROP_TYPE,
      ),
      getPropsDoc(getTheContentOfDoc(1, 1)),
    );

    addImport(
      1,
      uiReactModuleDefinition,
      tablesPropsType,
      tablePropsType,
      sortedTablePropsType,
      rowPropsType,
      cellPropsType,
    );

    // TablesView
    addComponent(
      TABLES + VIEW,
      '{' +
        storeInstance +
        ', tableComponents, getTableComponentProps' +
        SEPARATOR_AND_DEBUG_IDS +
        '}: ' +
        tablesPropsType,
      [
        wrap + `(${useTableIds}(${storeInstance}).map((tableId) => {`,
        'const Table = (tableComponents?.[tableId] ?? ' +
          getDefaultTableComponent +
          `(tableId)) as React.ComponentType<TableProps<typeof tableId>>;`,
        'return <Table',
        `{...${getProps}(getTableComponentProps, tableId)}`,
        'tableId={tableId}',
        'key={tableId}',
        storeProp,
        DEBUG_IDS_PROP,
        '/>;',
        '}), separator)',
      ],
      getTheContentOfTheStoreDoc(1, 13) + AND_REGISTERS,
    );

    mapTablesSchema((tableId: Id, tableName: string, TABLE_ID: string) => {
      const [tableType, tableWhenSetType, rowType, rowWhenSetType, cellIdType] =
        mapGet(tablesTypes, tableId) as TableTypes;

      addImport(
        null,
        moduleDefinition,
        tableType,
        tableWhenSetType,
        rowType,
        rowWhenSetType,
        cellIdType,
      );

      // useHasTable
      addProxyHook(
        HAS + tableName + TABLE,
        HAS + TABLE,
        BOOLEAN,
        getTableContentDoc(tableId, 0, 1) + AND_REGISTERS,
        EMPTY_STRING,
        TABLE_ID,
      );

      // useTable
      addProxyHook(
        tableName + TABLE,
        TABLE,
        tableType,
        getTableContentDoc(tableId) + AND_REGISTERS,
        EMPTY_STRING,
        TABLE_ID,
      );

      // useTableCellIds
      addProxyHook(
        tableName + TABLE + CELL_IDS,
        TABLE + CELL_IDS,
        IDS,
        getIdsDoc(CELL, 'the whole of ' + getTableDoc(tableId)) + AND_REGISTERS,
        EMPTY_STRING,
        TABLE_ID,
      );

      // useRowCount
      addProxyHook(
        tableName + ROW + COUNT,
        ROW + COUNT,
        NUMBER,
        'Gets the number of Rows in ' + getTableDoc(tableId) + AND_REGISTERS,
        EMPTY_STRING,
        TABLE_ID,
      );

      // useRowIds
      const useRowIds = addProxyHook(
        tableName + ROW_IDS,
        ROW_IDS,
        IDS,
        getIdsDoc(ROW, getTableDoc(tableId)) + AND_REGISTERS,
        EMPTY_STRING,
        TABLE_ID,
      );

      // useSortedRowIds
      const useSortedRowIds = addProxyHook(
        tableName + SORTED_ROW_IDS,
        SORTED_ROW_IDS,
        IDS,
        getIdsDoc(ROW, getTableDoc(tableId), 1) + AND_REGISTERS,
        'cellId?: ' +
          cellIdType +
          ', descending?: boolean, offset?: number, limit?: number',
        TABLE_ID + ', cellId, descending, offset, limit',
      );

      // useHasRow
      addProxyHook(
        HAS + tableName + ROW,
        HAS + ROW,
        BOOLEAN,
        getRowContentDoc(tableId, 0, 1) + AND_REGISTERS,
        TYPED_ROW_ID,
        getParameterList(TABLE_ID, ROW_ID),
      );

      // useRow
      addProxyHook(
        tableName + ROW,
        ROW,
        rowType,
        getRowContentDoc(tableId) + AND_REGISTERS,
        TYPED_ROW_ID,
        getParameterList(TABLE_ID, ROW_ID),
      );

      // useCellIds
      addProxyHook(
        tableName + CELL_IDS,
        CELL_IDS,
        cellIdType + SQUARE_BRACKETS,
        getIdsDoc(CELL, getRowDoc(tableId)) + AND_REGISTERS,
        TYPED_ROW_ID,
        getParameterList(TABLE_ID, ROW_ID),
      );

      // useSetTableCallback
      addProxyHook(
        SET + tableName + TABLE + CALLBACK,
        SET + TABLE + CALLBACK,
        PARAMETERIZED_CALLBACK,
        getTableContentDoc(tableId, 9) + BASED_ON_A_PARAMETER,
        getParameterList(
          getGet(TABLE) + GETTER_ARGS + tableWhenSetType,
          getGet(TABLE) + DEPS_SUFFIX,
        ),
        getParameterList(TABLE_ID, getGetAndGetDeps(TABLE)),
        GENERIC_PARAMETER,
        getParameterList(
          THEN_PREFIX,
          `table: ${tableWhenSetType})` + RETURNS_VOID,
          THEN_DEPS,
        ),
        THEN_AND_THEN_DEPS_IN_CALL,
      );

      // useDelTableCallback
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

      // useSetRowCallback
      addProxyHook(
        SET + tableName + ROW + CALLBACK,
        SET + ROW + CALLBACK,
        PARAMETERIZED_CALLBACK,
        getRowContentDoc(tableId, 9) + BASED_ON_A_PARAMETER,
        getParameterList(
          TYPED_ROW_ID,
          getGet(ROW) + GETTER_ARGS + rowWhenSetType,
          getGet(ROW) + DEPS_SUFFIX,
        ),
        getParameterList(TABLE_ID, ROW_ID, getGetAndGetDeps(ROW)),
        GENERIC_PARAMETER,
        getParameterList(
          THEN_PREFIX,
          `row: ${rowWhenSetType})` + RETURNS_VOID,
          THEN_DEPS,
        ),
        THEN_AND_THEN_DEPS_IN_CALL,
      );

      // useAddRowCallback
      addProxyHook(
        'Add' + tableName + ROW + CALLBACK,
        'Add' + ROW + CALLBACK,
        PARAMETERIZED_CALLBACK,
        getRowContentDoc(tableId, 10) + BASED_ON_A_PARAMETER,
        getParameterList(
          getGet(ROW) + GETTER_ARGS + rowWhenSetType,
          getGet(ROW) + DEPS_SUFFIX,
        ),
        getParameterList(TABLE_ID, getGetAndGetDeps(ROW)),
        GENERIC_PARAMETER,
        'then?: (' +
          getParameterList(
            TYPED_ROW_ID + OR_UNDEFINED,
            'store: Store',
            'row: ' + rowWhenSetType + ')' + RETURNS_VOID,
            'then' + DEPS_SUFFIX,
          ) +
          ', reuseRowIds?: boolean',
        THEN_AND_THEN_DEPS_IN_CALL + ', reuseRowIds',
      );

      // useSetPartialRowCallback
      addProxyHook(
        SET + tableName + PARTIAL + ROW + CALLBACK,
        SET + PARTIAL + ROW + CALLBACK,
        PARAMETERIZED_CALLBACK,
        getRowContentDoc(tableId, 11) + BASED_ON_A_PARAMETER,
        getParameterList(
          TYPED_ROW_ID,
          getGet(PARTIAL + ROW) + GETTER_ARGS + rowWhenSetType,
          getGet(PARTIAL + ROW) + DEPS_SUFFIX,
        ),
        getParameterList(TABLE_ID, ROW_ID, getGetAndGetDeps(PARTIAL + ROW)),
        GENERIC_PARAMETER,
        getParameterList(
          THEN_PREFIX,
          `partialRow: ${rowWhenSetType})` + RETURNS_VOID,
          THEN_DEPS,
        ),
        THEN_AND_THEN_DEPS_IN_CALL,
      );

      // useDelRowCallback
      addProxyHook(
        DEL + tableName + ROW + CALLBACK,
        DEL + ROW + CALLBACK,
        CALLBACK,
        getRowContentDoc(tableId, 12),
        TYPED_ROW_ID,
        getParameterList(TABLE_ID, ROW_ID),
        EMPTY_STRING,
        THEN_AND_THEN_DEPS,
        THEN_AND_THEN_DEPS_IN_CALL,
      );

      // RowView
      const rowView = addComponent(
        tableName + ROW + VIEW,
        '{rowId, ' +
          storeInstance +
          ', cellComponents, getCellComponentProps, customCellIds' +
          SEPARATOR_AND_DEBUG_IDS +
          `}: ${rowPropsType}<'${tableId}'>`,
        [
          wrap +
            `(${useCustomOrDefaultCellIds}(customCellIds, ` +
            TABLE_ID +
            `, rowId, ${storeInstance}).map((cellId: ${cellIdType}) => {`,
          'const Cell = (cellComponents?.[cellId] ?? ' +
            getDefaultCellComponent +
            `(${TABLE_ID}, cellId)) as React.ComponentType<CellProps<typeof ` +
            TABLE_ID +
            ', typeof cellId>>;',
          'return <Cell',
          `{...${getProps}(getCellComponentProps, cellId)} `,
          'key={cellId}',
          `tableId={${TABLE_ID}}`,
          ROW_ID_PROP,
          'cellId={cellId}',
          storeProp,
          DEBUG_IDS_PROP,
          '/>;',
          '})' + SEPARATOR_AND_DEBUG_IDS + ', rowId)',
        ],
        getRowContentDoc(tableId, 13) + AND_REGISTERS,
      );

      // SortedTableView
      addComponent(
        tableName + 'Sorted' + TABLE + VIEW,
        '{cellId, descending, offset, limit, ...props}: ' +
          sortedTablePropsType +
          `<'${tableId}'>`,
        tableView +
          '(props, ' +
          useSortedRowIds +
          `(cellId, descending, offset, limit, props.${storeInstance}), ` +
          `${TABLE_ID}, ${rowView});`,
        getTableContentDoc(tableId, 13) + ', sorted' + AND_REGISTERS,
      );

      // TableView
      addComponent(
        tableName + TABLE + VIEW,
        `props: ${tablePropsType}<'${tableId}'>`,
        tableView +
          '(props, ' +
          useRowIds +
          `(props.${storeInstance}), ${TABLE_ID}, ${rowView});`,
        getTableContentDoc(tableId, 13) + AND_REGISTERS,
      );

      mapCellSchema(
        tableId,
        (cellId, type, defaultValue, CELL_ID, cellName) => {
          const mapCellType = 'Map' + camel(type, 1);
          addImport(0, moduleDefinition, mapCellType);
          addImport(1, moduleDefinition, mapCellType);

          // useHasTableCell
          addProxyHook(
            HAS + tableName + cellName + TABLE + CELL,
            HAS + TABLE + CELL,
            BOOLEAN,
            `Gets ${getHasDoc(1)}the '${cellId}' Cell anywhere in ` +
              getTableDoc(tableId) +
              AND_REGISTERS,
            EMPTY_STRING,
            getParameterList(TABLE_ID, CELL_ID),
          );

          // useHasCell
          addProxyHook(
            HAS + tableName + cellName + CELL,
            HAS + CELL,
            BOOLEAN,
            getCellContentDoc(tableId, cellId, 0, 1) + AND_REGISTERS,
            TYPED_ROW_ID,
            getParameterList(TABLE_ID, ROW_ID, CELL_ID),
          );

          // useCell
          const useCell = addProxyHook(
            tableName + cellName + CELL,
            CELL,
            type + (isUndefined(defaultValue) ? OR_UNDEFINED : EMPTY_STRING),
            getCellContentDoc(tableId, cellId) + AND_REGISTERS,
            TYPED_ROW_ID,
            getParameterList(TABLE_ID, ROW_ID, CELL_ID),
          );

          // useSetCellCallback
          addProxyHook(
            SET + tableName + cellName + CELL + CALLBACK,
            SET + CELL + CALLBACK,
            PARAMETERIZED_CALLBACK,
            getCellContentDoc(tableId, cellId, 9) + BASED_ON_A_PARAMETER,
            getParameterList(
              TYPED_ROW_ID,
              getGet(CELL) + GETTER_ARGS + type + ' | ' + mapCellType,
              getGet(CELL) + DEPS_SUFFIX,
            ),
            getParameterList(TABLE_ID, ROW_ID, CELL_ID, getGetAndGetDeps(CELL)),
            GENERIC_PARAMETER,
            getParameterList(
              THEN_PREFIX,
              `cell: ${type} | ${mapCellType})` + RETURNS_VOID,
              THEN_DEPS,
            ),
            THEN_AND_THEN_DEPS_IN_CALL,
          );

          // useDelCellCallback
          addProxyHook(
            DEL + tableName + cellName + CELL + CALLBACK,
            DEL + CELL + CALLBACK,
            CALLBACK,
            getCellContentDoc(tableId, cellId, 12),
            getParameterList(TYPED_ROW_ID, 'forceDel?: boolean'),
            getParameterList(TABLE_ID, ROW_ID, CELL_ID, 'forceDel'),
            EMPTY_STRING,
            THEN_AND_THEN_DEPS,
            THEN_AND_THEN_DEPS_IN_CALL,
          );

          // CellView
          addComponent(
            tableName + cellName + CELL + VIEW,
            `{rowId, ${storeInstance}, debugIds}: ` +
              cellPropsType +
              `<'${tableId}', '${cellId}'>`,
            [
              wrap +
                `('' + ${useCell}(rowId, ` +
                storeInstance +
                `) ?? '', undefined, debugIds, ${CELL_ID})`,
            ],
            getCellContentDoc(tableId, cellId, 13) + AND_REGISTERS,
          );
        },
      );
    });

    const cellIdsType = arrayJoin(
      mapTablesSchema(
        (tableId) => mapGet(tablesTypes, tableId)?.[4] ?? EMPTY_STRING,
      ),
      ' | ',
    );

    // useHasTablesListener
    addProxyHook(
      HAS + TABLES + LISTENER,
      HAS + TABLES + LISTENER,
      VOID,
      getTheContentOfTheStoreDoc(1, 8, 0, 1) + ' changes',
      getListenerHookParams(hasTablesListenerType),
      getListenerHookParamsInCall(),
    );

    // useTablesListener
    addProxyHook(
      TABLES + LISTENER,
      TABLES + LISTENER,
      VOID,
      getTheContentOfTheStoreDoc(1, 8) + ' changes',
      getListenerHookParams(tablesListenerType),
      getListenerHookParamsInCall(),
    );

    // useTableIdsListener
    addProxyHook(
      TABLE_IDS + LISTENER,
      TABLE_IDS + LISTENER,
      VOID,
      getListenerDoc(2, 0, 1),
      getListenerHookParams(tableIdsListenerType),
      getListenerHookParamsInCall(),
    );

    // useHasTableListener
    addProxyHook(
      HAS + TABLE + LISTENER,
      HAS + TABLE + LISTENER,
      VOID,
      getListenerDoc(3, 0, 0, 1),
      getListenerHookParams(
        hasTableListenerType,
        `tableId: ${tableIdType} | null`,
      ),
      getListenerHookParamsInCall('tableId'),
    );

    // useTableListener
    addProxyHook(
      TABLE + LISTENER,
      TABLE + LISTENER,
      VOID,
      getListenerDoc(3, 0),
      getListenerHookParams(
        tableListenerType,
        `tableId: ${tableIdType} | null`,
      ),
      getListenerHookParamsInCall('tableId'),
    );

    // useTableCellIdsListener
    addProxyHook(
      TABLE + CELL_IDS + LISTENER,
      TABLE + CELL_IDS + LISTENER,
      VOID,
      getListenerDoc(14, 3, 1),
      getListenerHookParams(
        tableCellIdsListenerType,
        `tableId: ${tableIdType} | null`,
      ),
      getListenerHookParamsInCall('tableId'),
    );

    // useHasTableCellListener
    addProxyHook(
      HAS + TABLE + CELL + LISTENER,
      HAS + TABLE + CELL + LISTENER,
      VOID,
      getListenerDoc(16, 3, 0, 1),
      getListenerHookParams(
        hasTableCellListenerType,
        `tableId: ${tableIdType} | null`,
        `cellId: ${cellIdsType} | null`,
      ),
      getListenerHookParamsInCall('tableId', 'cellId'),
    );

    // useRowCountListener
    addProxyHook(
      ROW + COUNT + LISTENER,
      ROW + COUNT + LISTENER,
      VOID,
      getListenerDoc(15, 3),
      getListenerHookParams(
        rowCountListenerType,
        `tableId: ${tableIdType} | null`,
      ),
      getListenerHookParamsInCall('tableId'),
    );

    // useRowIdsListener
    addProxyHook(
      ROW_IDS + LISTENER,
      ROW_IDS + LISTENER,
      VOID,
      getListenerDoc(4, 3, 1),
      getListenerHookParams(
        rowIdsListenerType,
        `tableId: ${tableIdType} | null`,
      ),
      getListenerHookParamsInCall('tableId'),
    );

    // useSortedRowIdsListener
    addProxyHook(
      SORTED_ROW_IDS + LISTENER,
      SORTED_ROW_IDS + LISTENER,
      VOID,
      getListenerDoc(13, 3, 1),
      getListenerHookParams(
        sortedRowIdsListenerType,
        `tableId: ${tableIdType} | null`,
        'cellId: ' + cellIdsType + OR_UNDEFINED,
        'descending: boolean',
        'offset: number',
        'limit: number' + OR_UNDEFINED,
      ),
      getListenerHookParamsInCall(
        'tableId',
        'cellId',
        'descending',
        'offset',
        'limit',
      ),
    );

    // useHasRowListener
    addProxyHook(
      HAS + ROW + LISTENER,
      HAS + ROW + LISTENER,
      VOID,
      getListenerDoc(5, 3, 0, 1),
      getListenerHookParams(
        hasRowListenerType,
        `tableId: ${tableIdType} | null`,
        ROW_ID + `: IdOrNull`,
      ),
      getListenerHookParamsInCall('tableId', ROW_ID),
    );

    // useRowListener
    addProxyHook(
      ROW + LISTENER,
      ROW + LISTENER,
      VOID,
      getListenerDoc(5, 3),
      getListenerHookParams(
        rowListenerType,
        `tableId: ${tableIdType} | null`,
        ROW_ID + `: IdOrNull`,
      ),
      getListenerHookParamsInCall('tableId', ROW_ID),
    );

    // useCellIdsListener
    addProxyHook(
      CELL_IDS + LISTENER,
      CELL_IDS + LISTENER,
      VOID,
      getListenerDoc(6, 5, 1),
      getListenerHookParams(
        cellIdsListenerType,
        `tableId: ${tableIdType} | null`,
        ROW_ID + `: IdOrNull`,
      ),
      getListenerHookParamsInCall('tableId', ROW_ID),
    );

    // useHasCellListener
    addProxyHook(
      HAS + CELL + LISTENER,
      HAS + CELL + LISTENER,
      VOID,
      getListenerDoc(7, 5, 0, 1),
      getListenerHookParams(
        hasCellListenerType,
        `tableId: ${tableIdType} | null`,
        ROW_ID + `: IdOrNull`,
        `cellId: ${cellIdsType} | null`,
      ),
      getListenerHookParamsInCall('tableId', ROW_ID, 'cellId'),
    );

    // useCellListener
    addProxyHook(
      CELL + LISTENER,
      CELL + LISTENER,
      VOID,
      getListenerDoc(7, 5),
      getListenerHookParams(
        cellListenerType,
        `tableId: ${tableIdType} | null`,
        ROW_ID + `: IdOrNull`,
        `cellId: ${cellIdsType} | null`,
      ),
      getListenerHookParamsInCall('tableId', ROW_ID, 'cellId'),
    );
  }

  if (!objIsEmpty(valuesSchema)) {
    const [
      valuesType,
      valuesWhenSetType,
      valueIdType,
      hasValuesListenerType,
      valuesListenerType,
      valueIdsListenerType,
      hasValueListenerType,
      valueListenerType,
    ] = sharedValueTypes as SharedValueTypes;

    addImport(null, moduleDefinition, ...sharedValueTypes);
    addImport(1, moduleDefinition, storeType);

    const getDefaultValueComponent = addInternalFunction(
      'getDefaultValueComponent',
      'valueId: Id',
      arrayJoin(
        mapValuesSchema(
          (_, _2, _3, VALUE_ID, valueName) =>
            `valueId == ${VALUE_ID} ? ` + valueName + 'ValueView : ',
        ),
      ) + NullComponent,
    );

    // useHasValues
    addProxyHook(
      HAS + VALUES,
      HAS + VALUES,
      BOOLEAN,
      getTheContentOfTheStoreDoc(2, 0, 0, 1) + AND_REGISTERS,
    );

    // useValues
    addProxyHook(
      VALUES,
      VALUES,
      valuesType,
      getTheContentOfTheStoreDoc(2, 0) + AND_REGISTERS,
    );

    // useValueIds
    const useValueIds = addProxyHook(
      VALUE_IDS,
      VALUE_IDS,
      valueIdType + SQUARE_BRACKETS,
      getIdsDoc(VALUE, THE_STORE) + AND_REGISTERS,
    );

    // useSetValuesCallback
    addProxyHook(
      SET + VALUES + CALLBACK,
      SET + VALUES + CALLBACK,
      PARAMETERIZED_CALLBACK,
      getTheContentOfTheStoreDoc(2, 9) + BASED_ON_A_PARAMETER,
      getParameterList(
        getGet(VALUES) + GETTER_ARGS + valuesWhenSetType,
        getGet(VALUES) + DEPS_SUFFIX,
      ),
      getGetAndGetDeps(VALUES),
      GENERIC_PARAMETER,
      getParameterList(
        THEN_PREFIX,
        `values: ${valuesWhenSetType})` + RETURNS_VOID,
        THEN_DEPS,
      ),
      THEN_AND_THEN_DEPS_IN_CALL,
    );

    // useSetPartialValuesCallback
    addProxyHook(
      SET + PARTIAL + VALUES + CALLBACK,
      SET + PARTIAL + VALUES + CALLBACK,
      PARAMETERIZED_CALLBACK,
      getTheContentOfTheStoreDoc(2, 11) + BASED_ON_A_PARAMETER,
      getParameterList(
        getGet(PARTIAL + VALUES) + GETTER_ARGS + valuesWhenSetType,
        getGet(PARTIAL + VALUES) + DEPS_SUFFIX,
      ),
      getGetAndGetDeps(PARTIAL + VALUES),
      GENERIC_PARAMETER,
      getParameterList(
        THEN_PREFIX,
        `partialValues: ${valuesWhenSetType})` + RETURNS_VOID,
        THEN_DEPS,
      ),
      THEN_AND_THEN_DEPS_IN_CALL,
    );

    // useDelValuesCallback
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

    // ValueProps
    const valuePropsType = addType(
      VALUE + PROPS,
      getPropTypeList(
        `valueId?: VId`,
        storeInstance + OPTIONAL_COLON + storeType,
        DEBUG_IDS_PROP_TYPE,
      ),
      getPropsDoc('a Value'),
      `<VId extends ${valueIdType}>`,
    );

    // ValuesProps
    const valuesPropsType = addType(
      VALUES + PROPS,
      getPropTypeList(
        storeInstance + OPTIONAL_COLON + storeType,
        'valueComponents?: {readonly [VId in ' +
          valueIdType +
          `]?: ComponentType<${valuePropsType}<VId>>;}`,
        `getValueComponentProps?: (valueId: ${valueIdType}) => ExtraProps`,
        SEPARATOR_PROP_TYPE,
        DEBUG_IDS_PROP_TYPE,
      ),
      getPropsDoc(getTheContentOfDoc(2, 1)),
    );

    addImport(1, uiReactModuleDefinition, valuesPropsType, valuePropsType);

    // ValuesView
    addComponent(
      VALUES + VIEW,
      '{' +
        storeInstance +
        ', valueComponents, getValueComponentProps' +
        SEPARATOR_AND_DEBUG_IDS +
        '}: ' +
        valuesPropsType,
      [
        wrap + `(${useValueIds}(${storeInstance}).map((valueId) => {`,
        'const Value = valueComponents?.[valueId] ?? ' +
          getDefaultValueComponent +
          '(valueId);',
        'return <Value',
        `{...${getProps}(getValueComponentProps, valueId)}`,
        'key={valueId}',
        storeProp,
        DEBUG_IDS_PROP,
        '/>;',
        '}), separator)',
      ],
      getTheContentOfTheStoreDoc(2, 13) + AND_REGISTERS,
    );

    mapValuesSchema((valueId, type, _, VALUE_ID, valueName) => {
      const mapValueType = 'Map' + camel(type, 1);
      addImport(0, moduleDefinition, mapValueType);
      addImport(1, moduleDefinition, mapValueType);

      // useHasValue
      addProxyHook(
        HAS + valueName + VALUE,
        HAS + VALUE,
        BOOLEAN,
        getValueContentDoc(valueId, 0, 1) + AND_REGISTERS,
        EMPTY_STRING,
        VALUE_ID,
      );

      // useValue
      const useValue = addProxyHook(
        valueName + VALUE,
        VALUE,
        type,
        getValueContentDoc(valueId) + AND_REGISTERS,
        EMPTY_STRING,
        VALUE_ID,
      );

      // useSetValueCallback
      addProxyHook(
        SET + valueName + VALUE + CALLBACK,
        SET + VALUE + CALLBACK,
        PARAMETERIZED_CALLBACK,
        getValueContentDoc(valueId, 9) + BASED_ON_A_PARAMETER,
        getParameterList(
          getGet(VALUE) + GETTER_ARGS + type + ' | ' + mapValueType,
          getGet(VALUE) + DEPS_SUFFIX,
        ),
        getParameterList(VALUE_ID, getGetAndGetDeps(VALUE)),
        GENERIC_PARAMETER,
        getParameterList(
          THEN_PREFIX,
          `value: ${type} | ${mapValueType})` + RETURNS_VOID,
          THEN_DEPS,
        ),
        THEN_AND_THEN_DEPS_IN_CALL,
      );

      // useDelValueCallback
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

      // ValueView
      addComponent(
        valueName + VALUE + VIEW,
        `{${storeInstance}, debugIds}: ${valuePropsType}<'${valueId}'>`,
        [
          wrap +
            `('' + ${useValue}(` +
            storeInstance +
            `) ?? '', undefined, debugIds, ${VALUE_ID})`,
        ],
        getValueContentDoc(valueId, 13) + AND_REGISTERS,
      );
    });

    // useHasValuesListener
    addProxyHook(
      HAS + VALUES + LISTENER,
      HAS + VALUES + LISTENER,
      VOID,
      getTheContentOfTheStoreDoc(2, 8, 0, 1) + ' changes',
      getListenerHookParams(hasValuesListenerType),
      getListenerHookParamsInCall(),
    );

    // useValuesListener
    addProxyHook(
      VALUES + LISTENER,
      VALUES + LISTENER,
      VOID,
      getTheContentOfTheStoreDoc(2, 8) + ' changes',
      getListenerHookParams(valuesListenerType),
      getListenerHookParamsInCall(),
    );

    // useValueIdsListener
    addProxyHook(
      VALUE_IDS + LISTENER,
      VALUE_IDS + LISTENER,
      VOID,
      getListenerDoc(10, 0, 1),
      getListenerHookParams(valueIdsListenerType),
      getListenerHookParamsInCall(),
    );

    // useHasValueListener
    addProxyHook(
      HAS + VALUE + LISTENER,
      HAS + VALUE + LISTENER,
      VOID,
      getListenerDoc(11, 0, 0, 1),
      getListenerHookParams(
        hasValueListenerType,
        `valueId: ${valueIdType} | null`,
      ),
      getListenerHookParamsInCall('valueId'),
    );

    // useValueListener
    addProxyHook(
      VALUE + LISTENER,
      VALUE + LISTENER,
      VOID,
      getListenerDoc(11, 0),
      getListenerHookParams(
        valueListenerType,
        `valueId: ${valueIdType} | null`,
      ),
      getListenerHookParamsInCall('valueId'),
    );
  }

  // Provider
  addComponent(
    PROVIDER,
    `{${storeInstance}, ${storeInstance}ById, children}: ` +
      providerPropsType +
      ' & {readonly children: React.ReactNode}',
    [
      '{',
      USE_CONTEXT,
      'return (',
      '<Context.' + PROVIDER,
      'value={useMemo(',
      `() => [${storeInstance} ?? contextValue[0], ` +
        `{...contextValue[1], ...${storeInstance}ById}],`,
      `[${storeInstance}, ${storeInstance}ById, contextValue],`,
      ')}>',
      '{children}',
      `</Context.${PROVIDER}>`,
      ');',
      '}',
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
