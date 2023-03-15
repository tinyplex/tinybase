import {
  ADD,
  BOOLEAN,
  CELL,
  CELL_IDS,
  DEFAULT,
  EMPTY_STRING,
  IDS,
  LISTENER,
  ROW,
  ROW_IDS,
  SORTED_ROW_IDS,
  TABLE,
  TABLES,
  TABLE_IDS,
  TYPE,
  VALUE,
  VALUES,
  VALUE_IDS,
} from '../../common/strings';
import {
  A_FUNCTION_FOR,
  CALLBACK,
  DO_ACTIONS_AND_ROLLBACK_PARAMS,
  DO_ROLLBACK_PARAM,
  EXPORT,
  FINISH_TRANSACTION_DOC,
  ID,
  INVALID,
  JSON,
  LISTENER_,
  METHOD_PREFIX_VERBS,
  OR_UNDEFINED,
  PARTIAL,
  REGISTERS_A_LISTENER,
  REPRESENTS,
  RETURNS_VOID,
  ROW_ID_PARAM,
  SCHEMA,
  SORTED_ARGS,
  SQUARE_BRACKETS,
  START_TRANSACTION_DOC,
  THE_END_OF_THE_TRANSACTION,
  THE_STORE,
  TRANSACTION,
  TRANSACTION_,
  TRANSACTION_DOC,
  VERBS,
  VOID,
  WHEN_SET,
  WHEN_SETTING_IT,
  getCallbackDoc,
  getCellContentDoc,
  getForEachDoc,
  getIdsDoc,
  getListenerDoc,
  getListenerTypeDoc,
  getRowContentDoc,
  getRowDoc,
  getRowTypeDoc,
  getTableContentDoc,
  getTableDoc,
  getTheContentOfTheStoreDoc,
  getValueContentDoc,
} from '../common/strings';
import {
  IdMap,
  mapForEach,
  mapGet,
  mapMap,
  mapNew,
  mapSet,
} from '../../common/map';
import {
  LINE,
  LINE_TREE,
  camel,
  comment,
  flat,
  getCodeFunctions,
  getParameterList,
  join,
  mapUnique,
  snake,
} from '../common/code';
import {TablesSchema, ValuesSchema} from '../../store.d';
import {arrayForEach, arrayPush, arrayUnshift} from '../../common/array';
import {isString, isUndefined} from '../../common/other';
import {Id} from '../../common.d';
import {collValues} from '../../common/coll';
import {getSchemaFunctions} from '../common/schema';
import {getTypeFunctions} from './types';
import {objIsEmpty} from '../../common/obj';

export type TableTypes = [
  tableType: string,
  tableWhenSetType: string,
  rowType: string,
  rowWhenSetType: string,
  cellIdType: string,
  cellCallbackType: string,
  rowCallbackType: string,
];
export type SharedTableTypes = [
  tablesType: string,
  tablesWhenSetType: string,
  tableIdType: string,
  cellIdType: string,
  tablesListenerType: string,
  tableIdsListenerType: string,
  tableListenerType: string,
  rowIdsListenerType: string,
  sortedRowIdsListenerType: string,
  rowListenerType: string,
  cellIdsListenerType: string,
  cellListenerType: string,
  tablesTypes: IdMap<TableTypes>,
];
export type SharedValueTypes = [
  valuesType: string,
  valuesWhenSetType: string,
  valueIdType: string,
  valuesListenerType: string,
  valueIdsListenerType: string,
  valueListenerType: string,
];

const storeMethod = (
  method: string,
  parameters = EMPTY_STRING,
  cast = EMPTY_STRING,
) => `store.${method}(${parameters})` + (cast ? ' as ' + cast : EMPTY_STRING);
const fluentStoreMethod = (method: string, parameters = EMPTY_STRING) =>
  `fluent(() => ${storeMethod(method, parameters)})`;

const storeListener = (
  method: string,
  beforeParameters = EMPTY_STRING,
  afterParameters = EMPTY_STRING,
) =>
  `store.${method}(${
    beforeParameters ? beforeParameters + ', ' : EMPTY_STRING
  }proxy(listener)${afterParameters ? ', ' + afterParameters : EMPTY_STRING})`;

export const getStoreCoreApi = (
  tablesSchema: TablesSchema,
  valuesSchema: ValuesSchema,
  module: string,
): [string, string, SharedTableTypes | [], SharedValueTypes | []] => {
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

  const [getTablesTypes, getValuesTypes] = getTypeFunctions(
    addType,
    mapTablesSchema,
    mapCellSchema,
    mapValuesSchema,
  );

  const methods: IdMap<
    [
      parameters: LINE,
      returnType: string,
      body: LINE,
      doc: string,
      generic: string,
    ]
  > = mapNew();

  const getMethods = (location: 0 | 1 = 0): LINE_TREE =>
    mapMap(methods, ([parameters, returnType, body, doc, generic], name) => {
      const lines = location
        ? [name + `: ${generic}(${parameters}): ${returnType} => ${body},`]
        : [name + generic + `(${parameters}): ${returnType};`];
      if (!location) {
        arrayUnshift(lines, comment(doc));
      }
      arrayPush(lines, EMPTY_STRING);
      return lines;
    });

  const addMethod = (
    name: Id,
    parameters: LINE,
    returnType: string,
    body: LINE,
    doc: string,
    generic = EMPTY_STRING,
  ): Id =>
    mapUnique(methods, name, [parameters, returnType, body, doc, generic]);

  const addProxyMethod = (
    prefixVerb: number,
    prefix: string,
    underlyingName: string,
    returnType: string,
    doc: string,
    params = EMPTY_STRING,
    paramsInCall = EMPTY_STRING,
    generic = EMPTY_STRING,
  ): Id =>
    addMethod(
      METHOD_PREFIX_VERBS[prefixVerb] +
        prefix +
        (prefixVerb == 4 ? PARTIAL : EMPTY_STRING) +
        underlyingName,
      params,
      returnType,
      (returnType == storeType ? fluentStoreMethod : storeMethod)(
        METHOD_PREFIX_VERBS[prefixVerb] +
          (prefixVerb == 4 ? PARTIAL : EMPTY_STRING) +
          underlyingName,
        paramsInCall,
        prefixVerb ? undefined : returnType,
      ),
      doc,
      generic,
    );

  const addProxyListener = (
    underlyingName: string,
    listenerType: string,
    doc: string,
    params = EMPTY_STRING,
    paramsInCall = EMPTY_STRING,
    mutator = 1,
    generic = EMPTY_STRING,
  ): Id =>
    addMethod(
      (ADD + underlyingName + LISTENER) as string,
      (params ? params + ', ' : EMPTY_STRING) +
        LISTENER_ +
        ': ' +
        listenerType +
        (mutator ? ', mutator?: boolean' : EMPTY_STRING),
      ID,
      storeListener(
        ADD + underlyingName + LISTENER,
        paramsInCall,
        mutator ? 'mutator' : EMPTY_STRING,
      ),
      doc,
      generic,
    );

  const moduleDefinition = `./${camel(module)}.d`;
  const storeType = camel(module, 1);
  const storeInstance = camel(storeType);
  const createSteps: any[] = [];
  const mapCellOrValueTypes: IdMap<string> = mapNew();

  let sharedTableTypes: SharedTableTypes | [] = [];
  let sharedValueTypes: SharedValueTypes | [] = [];

  // --

  addImport(
    1,
    moduleDefinition,
    storeType,
    `create${storeType} as create${storeType}Decl`,
  );

  const storeParam = storeInstance + ': ' + storeType;

  if (!objIsEmpty(tablesSchema)) {
    addImport(0, 'tinybase', 'CellChange');
    addImport(null, 'tinybase', IDS);

    // Tables, TablesWhenSet, TableId,
    // Table<>, TableWhenSet<>, Row<>, RowWhenSet<>, CellId<>, Cell<>,
    // CellCallback, RowCallback, TableCallback, GetCellChange
    // TablesListener, TableIdsListener, TableListener, RowIdsListener,
    // SortedRowIdsListener, RowListener, CellIdsListener, CellListener,
    // InvalidCellListener;
    const [
      tablesType,
      tablesWhenSetType,
      tableIdType,
      tableType,
      tableWhenSetType,
      rowType,
      rowWhenSetType,
      cellIdType,
      _cellType,
      cellCallbackType,
      rowCallbackType,
      tableCallbackType,
      tablesListenerType,
      tableIdsListenerType,
      tableListenerType,
      rowIdsListenerType,
      sortedRowIdsListenerType,
      rowListenerType,
      cellIdsListenerType,
      cellListenerType,
      invalidCellListenerType,
    ] = getTablesTypes(storeInstance, storeType);

    const tablesTypes: IdMap<TableTypes> = mapNew();
    mapTablesSchema((tableId: Id, tableName: string) => {
      const tableIdGeneric = `<'${tableId}'>`;

      const tableTypes = [
        // Table
        addType(
          tableName + TABLE,
          tableType + tableIdGeneric,
          REPRESENTS + ` the '${tableId}' ` + TABLE,
        ),

        // TableWhenSet
        addType(
          tableName + TABLE + WHEN_SET,
          tableWhenSetType + tableIdGeneric,
          REPRESENTS + ` the '${tableId}' ` + TABLE + WHEN_SETTING_IT,
        ),

        // Row
        addType(
          tableName + ROW,
          rowType + tableIdGeneric,
          getRowTypeDoc(tableId),
        ),

        // RowWhenSet
        addType(
          tableName + ROW + WHEN_SET,
          rowWhenSetType + tableIdGeneric,
          getRowTypeDoc(tableId, 1),
        ),

        // CellId
        addType(
          tableName + CELL + ID,
          cellIdType + tableIdGeneric,
          `A Cell Id for the '${tableId}' ` + TABLE,
        ),

        // CellCallback
        addType(
          tableName + CELL + CALLBACK,
          cellCallbackType + tableIdGeneric,
          getCallbackDoc(
            `a Cell Id and value from a Row in the '${tableId}' ` + TABLE,
          ),
        ),

        // RowCallback
        addType(
          tableName + ROW + CALLBACK,
          rowCallbackType + tableIdGeneric,
          getCallbackDoc(
            `a Row Id from the '${tableId}' Table, and a Cell iterator`,
          ),
        ),
      ];
      mapSet(tablesTypes, tableId, tableTypes);
      addImport(1, moduleDefinition, ...tableTypes);
    });

    addImport(
      1,
      moduleDefinition,
      tablesType,
      tablesWhenSetType,
      tableIdType,
      cellIdType,
      tableCallbackType,
      tablesListenerType,
      tableIdsListenerType,
      tableListenerType,
      rowIdsListenerType,
      sortedRowIdsListenerType,
      rowListenerType,
      cellIdsListenerType,
      cellListenerType,
      invalidCellListenerType,
    );

    sharedTableTypes = [
      tablesType,
      tablesWhenSetType,
      tableIdType,
      cellIdType,
      tablesListenerType,
      tableIdsListenerType,
      tableListenerType,
      rowIdsListenerType,
      sortedRowIdsListenerType,
      rowListenerType,
      cellIdsListenerType,
      cellListenerType,
      tablesTypes,
    ];

    // getTables, hasTables, setTables, delTables
    arrayForEach(
      [
        [tablesType],
        [BOOLEAN],
        [storeType, 'tables: ' + tablesWhenSetType, 'tables'],
        [storeType],
      ],
      ([returnType, params, paramsInCall], verb) =>
        addProxyMethod(
          verb,
          EMPTY_STRING,
          TABLES,
          returnType,
          getTheContentOfTheStoreDoc(1, verb),
          params,
          paramsInCall,
        ),
    );

    // getTableIds
    addProxyMethod(
      0,
      EMPTY_STRING,
      TABLE_IDS,
      tableIdType + SQUARE_BRACKETS,
      getIdsDoc(TABLE, THE_STORE),
    );

    // forEachTable
    addProxyMethod(
      5,
      EMPTY_STRING,
      TABLE,
      VOID,
      getForEachDoc(TABLE, THE_STORE),
      'tableCallback: ' + tableCallbackType,
      'tableCallback as any',
    );

    mapTablesSchema((tableId, tableName, TABLE_ID) => {
      const [
        tableType,
        tableWhenSetType,
        rowType,
        rowWhenSetType,
        cellIdType,
        cellCallbackType,
        rowCallbackType,
      ] = mapGet(tablesTypes, tableId) as TableTypes;

      // getTable, hasTable, setTable, delTable
      arrayForEach(
        [
          [tableType],
          [BOOLEAN],
          [storeType, 'table: ' + tableWhenSetType, ', table'],
          [storeType],
        ],
        ([returnType, params, paramsInCall = EMPTY_STRING], verb) =>
          addProxyMethod(
            verb,
            tableName,
            TABLE,
            returnType,
            getTableContentDoc(tableId, verb),
            params,
            TABLE_ID + paramsInCall,
          ),
      );

      // getRowIds
      addProxyMethod(
        0,
        tableName,
        ROW_IDS,
        IDS,
        getIdsDoc(ROW, getTableDoc(tableId)),
        EMPTY_STRING,
        TABLE_ID,
      );

      // getSortedRowIds
      addProxyMethod(
        0,
        tableName,
        SORTED_ROW_IDS,
        IDS,
        getIdsDoc(ROW, getTableDoc(tableId), 1),
        'cellId?: ' + cellIdType + SORTED_ARGS,
        TABLE_ID + ', cellId, descending, offset, limit',
      );

      // forEachRow
      addProxyMethod(
        5,
        tableName,
        ROW,
        VOID,
        getForEachDoc(ROW, getTableDoc(tableId)),
        'rowCallback: ' + rowCallbackType,
        TABLE_ID + ', rowCallback as any',
      );

      // getRow, hasRow, setRow, delRow, setPartialRow
      arrayForEach(
        [
          [rowType],
          [BOOLEAN],
          [storeType, ', row: ' + rowWhenSetType, ', row'],
          [storeType],
          [storeType, ', partialRow: ' + rowWhenSetType, ', partialRow'],
        ],
        (
          [returnType, params = EMPTY_STRING, paramsInCall = EMPTY_STRING],
          verb,
        ) =>
          addProxyMethod(
            verb,
            tableName,
            ROW,
            returnType,
            getRowContentDoc(tableId, verb),
            ROW_ID_PARAM + params,
            TABLE_ID + ', rowId' + paramsInCall,
          ),
      );

      // addRow
      addProxyMethod(
        6,
        tableName,
        ROW,
        ID + OR_UNDEFINED,
        'Add a new Row to ' + getTableDoc(tableId),
        'row: ' + rowWhenSetType,
        TABLE_ID + ', row',
      );

      // getCellIds
      addProxyMethod(
        0,
        tableName,
        CELL_IDS,
        cellIdType + SQUARE_BRACKETS,
        getIdsDoc(CELL, getRowDoc(tableId)),
        ROW_ID_PARAM,
        TABLE_ID + ', rowId',
      );

      // forEachCell
      addProxyMethod(
        5,
        tableName,
        CELL,
        VOID,
        getForEachDoc(CELL, getRowDoc(tableId)),
        ROW_ID_PARAM + ', cellCallback: ' + cellCallbackType,
        TABLE_ID + ', rowId, cellCallback as any',
      );

      mapCellSchema(
        tableId,
        (cellId, type, defaultValue, CELL_ID, cellName) => {
          const mapCellType = 'Map' + camel(type, 1);
          mapSet(mapCellOrValueTypes, type, mapCellType);

          const returnCellType =
            type + (isUndefined(defaultValue) ? OR_UNDEFINED : EMPTY_STRING);

          // getCell, hasCell, setCell, delCell
          arrayForEach(
            [
              [returnCellType],
              [BOOLEAN],
              [storeType, `, cell: ${type} | ` + mapCellType, ', cell as any'],
              [storeType],
            ],
            (
              [returnType, params = EMPTY_STRING, paramsInCall = EMPTY_STRING],
              verb,
            ) =>
              addProxyMethod(
                verb,
                tableName + cellName,
                CELL,
                returnType,
                getCellContentDoc(tableId, cellId, verb),
                ROW_ID_PARAM + params,
                TABLE_ID + ', rowId, ' + CELL_ID + paramsInCall,
              ),
          );
        },
      );
    });

    // getTablesJson
    addProxyMethod(
      0,
      EMPTY_STRING,
      TABLES + JSON,
      JSON,
      getTheContentOfTheStoreDoc(1, 6),
    );

    // setTablesJson
    addProxyMethod(
      2,
      EMPTY_STRING,
      TABLES + JSON,
      storeType,
      getTheContentOfTheStoreDoc(1, 7),
      'tablesJson: ' + JSON,
      'tables' + JSON,
    );

    // addTablesListener
    addProxyListener(
      TABLES,
      tablesListenerType,
      getTheContentOfTheStoreDoc(1, 8) + ' changes',
    );

    // addTableIdsListener
    addProxyListener(TABLE_IDS, tableIdsListenerType, getListenerDoc(2, 0, 1));

    // addTableListener
    addProxyListener(
      TABLE,
      tableListenerType,
      getListenerDoc(3, 0),
      `tableId: ${tableIdType} | null`,
      'tableId',
    );

    // addRowIdsListener
    addProxyListener(
      ROW_IDS,
      rowIdsListenerType,
      getListenerDoc(4, 3, 1),
      `tableId: ${tableIdType} | null`,
      'tableId',
    );

    // addSortedRowIdsListener
    addProxyListener(
      SORTED_ROW_IDS,
      sortedRowIdsListenerType,
      getListenerDoc(13, 3, 1),
      getParameterList(
        'tableId: TId',
        `cellId: ${cellIdType}<TId>` + OR_UNDEFINED,
        'descending: boolean',
        'offset: number',
        'limit: number' + OR_UNDEFINED,
      ),
      getParameterList('tableId', 'cellId', 'descending', 'offset', 'limit'),
      1,
      '<TId extends TableId>',
    );

    // addRowListener
    addProxyListener(
      ROW,
      rowListenerType,
      getListenerDoc(5, 3),
      `tableId: ${tableIdType} | null, rowId: IdOrNull`,
      'tableId, rowId',
    );

    // addCellIdsListener
    addProxyListener(
      CELL_IDS,
      cellIdsListenerType,
      getListenerDoc(6, 5, 1),
      `tableId: ${tableIdType} | null, rowId: IdOrNull`,
      'tableId, rowId',
    );

    // addCellListener
    addProxyListener(
      CELL,
      cellListenerType,
      getListenerDoc(7, 5),
      `tableId: ${tableIdType} | null, rowId: IdOrNull, cellId: ${join(
        mapTablesSchema(
          (tableId) => mapGet(tablesTypes, tableId)?.[4] ?? EMPTY_STRING,
        ),
        ' | ',
      )} | null`,
      'tableId, rowId, cellId',
    );

    // addInvalidCellListener
    addProxyListener(
      INVALID + CELL,
      invalidCellListenerType,
      REGISTERS_A_LISTENER + ' whenever an invalid Cell change was attempted',
      `tableId: IdOrNull, rowId: IdOrNull, cellId: IdOrNull`,
      'tableId, rowId, cellId',
    );

    addImport(1, moduleDefinition, ...collValues(mapCellOrValueTypes));

    arrayPush(
      createSteps,
      '.set' + TABLES + SCHEMA + '({',
      flat(
        mapTablesSchema((tableId, _, TABLE_ID) => [
          `[${TABLE_ID}]: {`,
          ...mapCellSchema(
            tableId,
            (_, type, defaultValue, CELL_ID) =>
              `[${CELL_ID}]: {[${addConstant(
                snake(TYPE),
                `'${TYPE}'`,
              )}]: ${addConstant(snake(type), `'${type}'`)}${
                isUndefined(defaultValue)
                  ? EMPTY_STRING
                  : `, [${addConstant(snake(DEFAULT), `'${DEFAULT}'`)}]: ` +
                    (isString(defaultValue)
                      ? addConstant(snake(defaultValue), `'${defaultValue}'`)
                      : defaultValue)
              }},`,
          ),
          `},`,
        ]),
      ),
      '})',
    );
  }

  if (!objIsEmpty(valuesSchema)) {
    // Values, ValuesWhenSet, ValueId,
    // Value<>,
    // ValueCallback, ValuesCallback, GetValueChange
    const [
      valuesType,
      valuesWhenSetType,
      valueIdType,
      valueType,
      valueCallbackType,
      getValueChangeType,
    ] = getValuesTypes(storeInstance, storeType);

    // ValueListener
    const valuesListenerType = addType(
      VALUES + LISTENER,
      `(${storeParam}, ` +
        `getValueChange: ${getValueChangeType}${OR_UNDEFINED})` +
        RETURNS_VOID,
      getListenerTypeDoc(9),
    );

    // ValueIdsListener
    const valueIdsListenerType = addType(
      VALUE_IDS + LISTENER,
      `(${storeParam})` + RETURNS_VOID,
      getListenerTypeDoc(10),
    );

    const valueListenerArgsArrayType = addType(
      'ValueListenerArgsArray',
      `VId extends ${valueIdType} ? ` +
        `[${storeParam}, valueId: VId, ` +
        `newValue: ${valueType}<VId> ${OR_UNDEFINED}, ` +
        `oldValue: ${valueType}<VId> ${OR_UNDEFINED}, ` +
        `getValueChange: ${getValueChangeType} ${OR_UNDEFINED}] : never`,
      'Value args for ValueListener',
      `<VId = ${valueIdType}>`,
      0,
    );

    // ValueListener
    const valueListenerType = addType(
      VALUE + LISTENER,
      `(...[${storeInstance}, valueId, newValue, oldValue, getValueChange]: ` +
        valueListenerArgsArrayType +
        ')' +
        RETURNS_VOID,
      getListenerTypeDoc(11),
    );

    // InvalidValueListener
    const invalidValueListenerType = addType(
      INVALID + VALUE + LISTENER,
      `(${storeParam}, valueId: Id, ` + `invalidValues: any[])` + RETURNS_VOID,
      getListenerTypeDoc(12),
    );

    addImport(
      1,
      moduleDefinition,
      valuesType,
      valuesWhenSetType,
      valueIdType,
      valueCallbackType,
      valuesListenerType,
      valueIdsListenerType,
      valueListenerType,
      invalidValueListenerType,
    );

    sharedValueTypes = [
      valuesType,
      valuesWhenSetType,
      valueIdType,
      valuesListenerType,
      valueIdsListenerType,
      valueListenerType,
    ];

    // getValues, hasValues, setValues, delValues, setPartialValues
    arrayForEach(
      [
        [valuesType],
        [BOOLEAN],
        [storeType, 'values: ' + valuesWhenSetType, 'values'],
        [storeType],
        [storeType, 'partialValues: ' + valuesWhenSetType, 'partialValues'],
      ],
      ([returnType, params, paramsInCall], verb) =>
        addProxyMethod(
          verb,
          EMPTY_STRING,
          VALUES,
          returnType,
          getTheContentOfTheStoreDoc(2, verb),
          params,
          paramsInCall,
        ),
    );

    // getValueIds
    addProxyMethod(
      0,
      EMPTY_STRING,
      VALUE_IDS,
      valueIdType + SQUARE_BRACKETS,
      getIdsDoc(VALUE, THE_STORE),
    );

    // forEachValue
    addProxyMethod(
      5,
      EMPTY_STRING,
      VALUE,
      `void`,
      getForEachDoc(VALUE, THE_STORE),
      `valueCallback: ${valueCallbackType}`,
      'valueCallback as any',
    );

    mapValuesSchema((valueId, type, _, VALUE_ID, valueName) => {
      const mapValueType = 'Map' + camel(type, 1);
      mapSet(mapCellOrValueTypes, type, mapValueType);

      // getValue, hasValue, setValue, delValue
      arrayForEach(
        [
          [type],
          [BOOLEAN],
          [storeType, `value: ${type} | ` + mapValueType, ', value as any'],
          [storeType],
        ],
        ([returnType, params, paramsInCall = EMPTY_STRING], verb) =>
          addProxyMethod(
            verb,
            valueName,
            VALUE,
            returnType,
            getValueContentDoc(valueId, verb),
            params,
            VALUE_ID + paramsInCall,
          ),
      );
    });

    // getValuesJson
    addProxyMethod(
      0,
      EMPTY_STRING,
      VALUES + JSON,
      JSON,
      getTheContentOfTheStoreDoc(2, 6),
    );

    // setValuesJson
    addProxyMethod(
      2,
      EMPTY_STRING,
      VALUES + JSON,
      storeType,
      getTheContentOfTheStoreDoc(2, 7),
      'valuesJson: ' + JSON,
      'values' + JSON,
    );

    // addValuesListener
    addProxyListener(
      VALUES,
      valuesListenerType,
      getTheContentOfTheStoreDoc(2, 8) + ' changes',
    );

    // addValueIdsListener
    addProxyListener(VALUE_IDS, valueIdsListenerType, getListenerDoc(10, 0, 1));

    // addValueListener
    addProxyListener(
      VALUE,
      valueListenerType,
      getListenerDoc(11, 0),
      `valueId: ${valueIdType} | null`,
      'valueId',
    );

    // addInvalidValueListener
    addProxyListener(
      INVALID + VALUE,
      invalidValueListenerType,
      REGISTERS_A_LISTENER + ' whenever an invalid Value change was attempted',
      `valueId: IdOrNull`,
      'valueId',
    );

    addImport(1, moduleDefinition, ...collValues(mapCellOrValueTypes));
    addImport(0, 'tinybase', 'ValueChange');

    arrayPush(
      createSteps,
      '.set' + VALUES + SCHEMA + '({',
      mapValuesSchema((_, type, defaultValue, VALUE_ID) => [
        `[${VALUE_ID}]: {[${addConstant(
          snake(TYPE),
          `'${TYPE}'`,
        )}]: ${addConstant(snake(type), `'${type}'`)}${
          isUndefined(defaultValue)
            ? EMPTY_STRING
            : `, [${addConstant(snake(DEFAULT), `'${DEFAULT}'`)}]: ` +
              (isString(defaultValue)
                ? addConstant(snake(defaultValue), `'${defaultValue}'`)
                : defaultValue)
        }},`,
      ]),
      '})',
    );
  }

  // MapCell
  mapForEach(mapCellOrValueTypes, (type, mapCellType) =>
    addType(
      mapCellType,
      `(cell: ${type}${OR_UNDEFINED}) => ` + type,
      `Takes a ${type} Cell value and returns another`,
    ),
  );

  addImport(null, 'tinybase', 'DoRollback', ID, 'IdOrNull', JSON, 'Store');

  // TransactionListener
  const transactionListenerType = addType(
    TRANSACTION + LISTENER,
    `(${storeParam}, cellsTouched: boolean, ` +
      `valuesTouched: boolean)` +
      RETURNS_VOID,
    A_FUNCTION_FOR + ' listening to the completion of a ' + TRANSACTION_,
  );

  // getJson
  addProxyMethod(0, EMPTY_STRING, JSON, JSON, getTheContentOfTheStoreDoc(0, 6));

  // setJson
  addProxyMethod(
    2,
    EMPTY_STRING,
    JSON,
    storeType,
    getTheContentOfTheStoreDoc(0, 7),
    'tablesAndValuesJson: ' + JSON,
    'tablesAndValuesJson',
  );

  // transaction
  addProxyMethod(
    7,
    EMPTY_STRING,
    TRANSACTION_,
    'Return',
    TRANSACTION_DOC,
    DO_ACTIONS_AND_ROLLBACK_PARAMS,
    'actions, doRollback',
    '<Return>',
  );

  // startTransaction
  addProxyMethod(
    7,
    EMPTY_STRING,
    'start' + TRANSACTION,
    storeType,
    START_TRANSACTION_DOC,
  );

  // finishTransaction
  addProxyMethod(
    7,
    EMPTY_STRING,
    'finish' + TRANSACTION,
    storeType,
    FINISH_TRANSACTION_DOC,
    DO_ROLLBACK_PARAM,
    'doRollback',
  );

  // addWillFinishTransaction
  addProxyListener(
    'WillFinish' + TRANSACTION,
    transactionListenerType,
    REGISTERS_A_LISTENER + ' just before ' + THE_END_OF_THE_TRANSACTION,
    EMPTY_STRING,
    EMPTY_STRING,
    0,
  );

  // addDidFinishTransaction
  addProxyListener(
    'DidFinish' + TRANSACTION,
    transactionListenerType,
    REGISTERS_A_LISTENER + ' just after ' + THE_END_OF_THE_TRANSACTION,
    EMPTY_STRING,
    EMPTY_STRING,
    0,
  );

  // callListener
  addProxyMethod(
    7,
    EMPTY_STRING,
    'call' + LISTENER,
    storeType,
    `Manually provoke a listener to be called`,
    `listenerId: Id`,
    `listenerId`,
  );

  // delListener
  addProxyMethod(
    3,
    EMPTY_STRING,
    LISTENER,
    storeType,
    'Remove a listener that was previously added to ' + THE_STORE,
    'listenerId: Id',
    'listenerId',
  );

  // getStore
  addMethod(
    'getStore',
    EMPTY_STRING,
    'Store',
    'store',
    VERBS[0] + ' the underlying Store object',
  );

  addImport(1, 'tinybase', 'createStore');
  addImport(
    1,
    moduleDefinition,
    storeType,
    `create${storeType} as create${storeType}Decl`,
    transactionListenerType,
  );

  addConstant('store', ['createStore()', ...createSteps]);

  addInternalFunction('fluent', 'actions: () => Store', [
    'actions();',
    `return ${storeInstance};`,
  ]);
  addInternalFunction(
    'proxy',
    `listener: any`,
    `(_: Store, ...params: any[]) => listener(${storeInstance}, ...params)`,
  );

  addConstant(storeInstance, ['{', ...getMethods(1), '}']);

  // --

  return [
    build(
      ...getImports(0),
      ...getTypes(),
      EXPORT + ' interface ' + storeType + ' {',
      ...getMethods(0),
      '}',
      EMPTY_STRING,
      comment(`Creates a ${storeType} object`),
      EXPORT + ' function create' + storeType + '(): ' + storeType + ';',
    ),
    build(
      ...getImports(1),
      EXPORT +
        ' const create' +
        storeType +
        ': typeof create' +
        storeType +
        'Decl = () => {',
      ...getConstants(),
      `return Object.freeze(${storeInstance});`,
      '};',
    ),
    sharedTableTypes,
    sharedValueTypes,
  ];
};
