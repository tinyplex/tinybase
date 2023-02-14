import {
  A,
  A_FUNCTION_FOR,
  CALLBACK,
  EXPORT,
  ID,
  INVALID,
  JSON,
  LISTENER,
  LISTENER_,
  OR_UNDEFINED,
  PARTIAL,
  REGISTERS_A_LISTENER,
  REPRESENTS,
  RETURNS_VOID,
  SQUARE_BRACKETS,
  THE_END_OF_THE_TRANSACTION,
  THE_STORE,
  TRANSACTION,
  TRANSACTION_,
  VERBS,
  VOID,
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
  ADD,
  BOOLEAN,
  CELL,
  CELL_IDS,
  DEFAULT,
  EMPTY_STRING,
  GET,
  IDS,
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
import {objIsEmpty} from '../../common/obj';

export type TableTypes = [string, string, string, string, string, string];
export type SharedTableTypes = [string, string, IdMap<TableTypes>];
export type SharedValueTypes = [string, string];

const METHOD_PREFIX_VERBS = [
  GET,
  'has',
  'set',
  'del',
  'set',
  'forEach',
  ADD,
  EMPTY_STRING,
];
const COMMON_IMPORTS = ['DoRollback', ID, 'IdOrNull', IDS, JSON, 'Store'];

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
    );

  const moduleDefinition = `./${camel(module)}.d`;
  const storeType = camel(module, 1);
  const storeInstance = camel(storeType);
  const createSteps: any[] = [];

  let sharedTableTypes: SharedTableTypes | [] = [];
  let sharedValueTypes: SharedValueTypes | [] = [];

  // --

  addImport(
    1,
    moduleDefinition,
    storeType,
    `create${storeType} as create${storeType}Decl`,
  );

  if (!objIsEmpty(tablesSchema)) {
    const tablesTypes: IdMap<TableTypes> = mapNew();
    mapTablesSchema((tableId: Id, tableName: string) => {
      const tableTypes = [
        addType(
          tableName + TABLE,
          `{[rowId: Id]: ${tableName}Row}`,
          REPRESENTS + ` the '${tableId}' ` + TABLE,
        ),
        addType(
          tableName + ROW,
          `{${join(
            mapCellSchema(
              tableId,
              (cellId, type, defaultValue) =>
                `'${cellId}'${
                  isUndefined(defaultValue) ? '?' : EMPTY_STRING
                }: ${type};`,
            ),
            ' ',
          )}}`,
          getRowTypeDoc(tableId),
        ),
        addType(
          tableName + ROW + 'WhenSet',
          `{${join(
            mapCellSchema(tableId, (cellId, type) => `'${cellId}'?: ${type};`),
            ' ',
          )}}`,
          getRowTypeDoc(tableId, 1),
        ),
        addType(
          tableName + CELL + ID,
          join(
            mapCellSchema(tableId, (cellId) => `'${cellId}'`),
            ' | ',
          ),
          `A Cell Id for the '${tableId}' ` + TABLE,
        ),
        addType(
          tableName + CELL + CALLBACK,
          `(...[cellId, cell]: ${join(
            mapCellSchema(
              tableId,
              (cellId, type) => `[cellId: '${cellId}', cell: ${type}]`,
            ),
            ' | ',
          )})` + RETURNS_VOID,
          getCallbackDoc(
            `a Cell Id and value from a Row in the '${tableId}' ` + TABLE,
          ),
        ),
        addType(
          tableName + ROW + CALLBACK,
          `(rowId: Id, forEachCell: (cellCallback: ${tableName}CellCallback)` +
            RETURNS_VOID +
            ')' +
            RETURNS_VOID,
          getCallbackDoc(
            `a Row Id from the '${tableId}' Table, and a Cell iterator`,
          ),
        ),
      ];
      mapSet(tablesTypes, tableId, tableTypes);
      addImport(1, moduleDefinition, ...tableTypes);
    });

    const tablesType = addType(
      TABLES,
      `{${join(
        mapTablesSchema(
          (tableId) => `'${tableId}'?: ${mapGet(tablesTypes, tableId)?.[0]};`,
        ),
        ' ',
      )}}`,
      getTheContentOfTheStoreDoc(1, 5),
    );
    const tableIdType = addType(
      TABLE + ID,
      join(
        mapTablesSchema((tableId) => `'${tableId}'`),
        ' | ',
      ),
      'A ' + TABLE + ' Id in ' + THE_STORE,
    );
    const tableCallbackType = addType(
      TABLE + CALLBACK,
      `(...[tableId, rowCallback]: ${join(
        mapTablesSchema(
          (tableId) =>
            `[tableId: '${tableId}', ` +
            `forEachRow: (rowCallback: ${
              mapGet(tablesTypes, tableId)?.[5]
            })${RETURNS_VOID}]`,
        ),
        ' | ',
      )})` + RETURNS_VOID,
      getCallbackDoc(A + TABLE + ' Id, and a Row iterator'),
    );
    const getCellChangeType = addType(
      'GetCellChange',
      `(...[tableId, rowId, cellId]: ${join(
        mapTablesSchema(
          (tableId) =>
            `[tableId: '${tableId}', rowId: Id, cellId: ${
              mapGet(tablesTypes, tableId)?.[3]
            }]`,
        ),
        ' | ',
      )}) => CellChange`,
      A_FUNCTION_FOR +
        ` returning information about any Cell's changes during a ` +
        TRANSACTION_,
    );
    const tablesListenerType = addType(
      TABLES + LISTENER,
      `(${storeInstance}: ${storeType}, ` +
        `getCellChange: ${getCellChangeType}${OR_UNDEFINED})` +
        RETURNS_VOID,
      getListenerTypeDoc(1),
    );
    const tableIdsListenerType = addType(
      TABLE_IDS + LISTENER,
      `(${storeInstance}: ${storeType})` + RETURNS_VOID,
      getListenerTypeDoc(2),
    );
    const tableListenerType = addType(
      TABLE + LISTENER,
      `(${storeInstance}: ${storeType}, tableId: ${tableIdType}, ` +
        `getCellChange: ${getCellChangeType}${OR_UNDEFINED})` +
        RETURNS_VOID,
      getListenerTypeDoc(3),
    );
    const rowIdsListenerType = addType(
      ROW_IDS + LISTENER,
      `(${storeInstance}: ${storeType}, tableId: ${tableIdType})` +
        RETURNS_VOID,
      getListenerTypeDoc(4, 3),
    );
    const rowListenerType = addType(
      ROW + LISTENER,
      `(${storeInstance}: ${storeType}, tableId: ${tableIdType}, rowId: Id, ` +
        `getCellChange: ${getCellChangeType}${OR_UNDEFINED})` +
        RETURNS_VOID,
      getListenerTypeDoc(5, 3),
    );
    const cellIdsListenerType = addType(
      CELL_IDS + LISTENER,
      `(${storeInstance}: ${storeType}, tableId: ${tableIdType}, rowId: Id)` +
        RETURNS_VOID,
      getListenerTypeDoc(6, 5),
    );
    const cellListenerType = addType(
      CELL + LISTENER,
      `(...[${storeInstance}, tableId, rowId, cellId, newCell, oldCell, ` +
        `getCellChange]: ${join(
          flat(
            mapTablesSchema((tableId) =>
              mapCellSchema(
                tableId,
                (cellId, type) =>
                  `[${storeInstance}: ${storeType}, tableId: '${tableId}', ` +
                  `rowId: Id, cellId: '${cellId}', ` +
                  `newCell: ${type}${OR_UNDEFINED}, ` +
                  `oldCell: ${type}${OR_UNDEFINED}, ` +
                  `getCellChange: ${getCellChangeType} ` +
                  '| undefined]',
              ),
            ),
          ),
          ' | ',
        )})` +
        RETURNS_VOID,
      getListenerTypeDoc(7, 5),
    );
    const invalidCellListenerType = addType(
      INVALID + CELL + LISTENER,
      `(${storeInstance}: ${storeType}, tableId: Id, rowId: Id, cellId: Id, ` +
        `invalidCells: any[])` +
        RETURNS_VOID,
      getListenerTypeDoc(8),
    );

    sharedTableTypes = [tablesType, tableIdType, tablesTypes];

    arrayForEach(
      [
        [tablesType],
        [BOOLEAN],
        [storeType, 'tables: ' + tablesType, 'tables'],
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
    addProxyMethod(
      0,
      EMPTY_STRING,
      TABLE_IDS,
      tableIdType + SQUARE_BRACKETS,
      getIdsDoc(TABLE, THE_STORE),
    );
    addProxyMethod(
      5,
      EMPTY_STRING,
      TABLE,
      VOID,
      getForEachDoc(TABLE, THE_STORE),
      'tableCallback: ' + tableCallbackType,
      'tableCallback as any',
    );

    const mapCellTypes: IdMap<string> = mapNew();

    mapTablesSchema((tableId, tableName, TABLE_ID) => {
      const [
        tableType,
        rowType,
        rowWhenSetType,
        cellIdType,
        cellCallbackType,
        rowCallbackType,
      ] = mapGet(tablesTypes, tableId) as TableTypes;

      arrayForEach(
        [
          [tableType],
          [BOOLEAN],
          [storeType, 'table: ' + tableType, ', table'],
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
      addProxyMethod(
        0,
        tableName,
        ROW_IDS,
        IDS,
        getIdsDoc(ROW, getTableDoc(tableId)),
        EMPTY_STRING,
        TABLE_ID,
      );
      addProxyMethod(
        0,
        tableName,
        SORTED_ROW_IDS,
        IDS,
        getIdsDoc(ROW, getTableDoc(tableId), 1),
        'cellId?: ' +
          cellIdType +
          ', descending?: boolean, offset?: number, limit?: number',
        TABLE_ID + ', cellId, descending, offset, limit',
      );
      addProxyMethod(
        5,
        tableName,
        ROW,
        VOID,
        getForEachDoc(ROW, getTableDoc(tableId)),
        'rowCallback: ' + rowCallbackType,
        TABLE_ID + ', rowCallback as any',
      );

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
            'rowId: Id' + params,
            TABLE_ID + ', rowId' + paramsInCall,
          ),
      );
      addProxyMethod(
        6,
        tableName,
        ROW,
        ID + OR_UNDEFINED,
        'Adds a new Row to ' + getTableDoc(tableId),
        'row: ' + rowWhenSetType,
        TABLE_ID + ', row',
      );
      addProxyMethod(
        0,
        tableName,
        CELL_IDS,
        cellIdType + SQUARE_BRACKETS,
        getIdsDoc(CELL, getRowDoc(tableId)),
        'rowId: ' + ID,
        TABLE_ID + ', rowId',
      );
      addProxyMethod(
        5,
        tableName,
        CELL,
        VOID,
        getForEachDoc(CELL, getRowDoc(tableId)),
        'rowId: Id, cellCallback: ' + cellCallbackType,
        TABLE_ID + ', rowId, cellCallback as any',
      );

      mapCellSchema(
        tableId,
        (cellId, type, defaultValue, CELL_ID, cellName) => {
          const mapCellType = 'Map' + camel(type, 1);
          mapSet(mapCellTypes, type, mapCellType);

          const returnCellType =
            type + (isUndefined(defaultValue) ? OR_UNDEFINED : EMPTY_STRING);
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
                'rowId: Id' + params,
                TABLE_ID + ', rowId, ' + CELL_ID + paramsInCall,
              ),
          );
        },
      );
    });

    addProxyMethod(
      0,
      EMPTY_STRING,
      TABLES + JSON,
      JSON,
      getTheContentOfTheStoreDoc(1, 6),
    );
    addProxyMethod(
      2,
      EMPTY_STRING,
      TABLES + JSON,
      storeType,
      getTheContentOfTheStoreDoc(1, 7),
      'tablesJson: ' + JSON,
      'tables' + JSON,
    );

    addProxyListener(
      TABLES,
      tablesListenerType,
      getTheContentOfTheStoreDoc(1, 8) + ' changes',
    );
    addProxyListener(TABLE_IDS, tableIdsListenerType, getListenerDoc(2, 0, 1));
    addProxyListener(
      TABLE,
      tableListenerType,
      getListenerDoc(3, 0),
      `tableId: ${tableIdType} | null`,
      'tableId',
    );
    addProxyListener(
      ROW_IDS,
      rowIdsListenerType,
      getListenerDoc(4, 3, 1),
      `tableId: ${tableIdType} | null`,
      'tableId',
    );
    addProxyListener(
      ROW,
      rowListenerType,
      getListenerDoc(5, 3),
      `tableId: ${tableIdType} | null, rowId: IdOrNull`,
      'tableId, rowId',
    );
    addProxyListener(
      CELL_IDS,
      cellIdsListenerType,
      getListenerDoc(6, 5, 1),
      `tableId: ${tableIdType} | null, rowId: IdOrNull`,
      'tableId, rowId',
    );
    addProxyListener(
      CELL,
      cellListenerType,
      getListenerDoc(7, 5),
      `tableId: ${tableIdType} | null, rowId: IdOrNull, cellId: ${join(
        mapTablesSchema(
          (tableId) => mapGet(tablesTypes, tableId)?.[3] ?? EMPTY_STRING,
        ),
        ' | ',
      )} | null`,
      'tableId, rowId, cellId',
    );
    addProxyListener(
      INVALID + CELL,
      invalidCellListenerType,
      REGISTERS_A_LISTENER + ' whenever an invalid Cell change was attempted',
      `tableId: IdOrNull, rowId: IdOrNull, cellId: IdOrNull`,
      'tableId, rowId, cellId',
    );

    mapForEach(mapCellTypes, (type, mapCellType) =>
      addType(
        mapCellType,
        `(cell: ${type}${OR_UNDEFINED}) => ` + type,
        `Takes a ${type} Cell value and returns another`,
      ),
    );

    addImport(
      1,
      moduleDefinition,
      tablesType,
      tableIdType,
      tableCallbackType,
      tablesListenerType,
      tableIdsListenerType,
      tableListenerType,
      rowIdsListenerType,
      rowListenerType,
      cellIdsListenerType,
      cellListenerType,
      invalidCellListenerType,
      ...collValues(mapCellTypes),
    );
    addImport(0, 'tinybase', 'CellChange');

    arrayPush(
      createSteps,
      '.setTablesSchema({',
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
    const valuesType = addType(
      VALUES,
      '{' +
        join(
          mapValuesSchema(
            (valueId, type, defaultValue) =>
              `'${valueId}'${
                isUndefined(defaultValue) ? '?' : EMPTY_STRING
              }: ${type};`,
          ),
          ' ',
        ) +
        '}',
      getTheContentOfTheStoreDoc(2, 5),
    );
    const valuesWhenSetType = addType(
      VALUES + 'WhenSet',
      '{' +
        join(
          mapValuesSchema((valueId, type) => `'${valueId}'?: ${type};`),
          ' ',
        ) +
        '}',
      getTheContentOfTheStoreDoc(2, 5, 1),
    );
    const valueIdType = addType(
      VALUE + ID,
      join(
        mapValuesSchema((valueId) => `'${valueId}'`),
        ' | ',
      ),
      'A Value Id in ' + THE_STORE,
    );
    const valueCallbackType = addType(
      VALUE + CALLBACK,
      `(...[valueId, rowCallback]: ${join(
        mapValuesSchema(
          (valueId, type) => `[valueId: '${valueId}', value: ${type}]`,
        ),
        ' | ',
      )})` + RETURNS_VOID,
      getCallbackDoc('a Value Id, and value'),
    );
    const getValueChangeType = addType(
      'GetValueChange',
      `(valueId: ${valueIdType}) => ValueChange`,
      A_FUNCTION_FOR +
        ` returning information about any Value's changes during a ` +
        TRANSACTION_,
    );
    const valuesListenerType = addType(
      VALUES + LISTENER,
      `(${storeInstance}: ${storeType}, ` +
        `getValueChange: ${getValueChangeType}${OR_UNDEFINED})` +
        RETURNS_VOID,
      getListenerTypeDoc(9),
    );
    const valueIdsListenerType = addType(
      VALUE_IDS + LISTENER,
      `(${storeInstance}: ${storeType})` + RETURNS_VOID,
      getListenerTypeDoc(10),
    );
    const valueListenerType = addType(
      VALUE + LISTENER,
      `(...[${storeInstance}, valueId, newValue, oldValue, ` +
        `getValueChange]: ${join(
          mapValuesSchema(
            (valueId, type) =>
              `[${storeInstance}: ${storeType}, valueId: '${valueId}', ` +
              `newValue: ${type}${OR_UNDEFINED}, ` +
              `oldValue: ${type}${OR_UNDEFINED}, ` +
              `getValueChange: ${getValueChangeType} ` +
              '| undefined]',
          ),
          ' | ',
        )})` +
        RETURNS_VOID,
      getListenerTypeDoc(11),
    );
    const invalidValueListenerType = addType(
      INVALID + VALUE + LISTENER,
      `(${storeInstance}: ${storeType}, valueId: Id, ` +
        `invalidValues: any[])` +
        RETURNS_VOID,
      getListenerTypeDoc(12),
    );
    sharedValueTypes = [valuesType, valueIdType];

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
    addProxyMethod(
      0,
      EMPTY_STRING,
      VALUE_IDS,
      valueIdType + SQUARE_BRACKETS,
      getIdsDoc(VALUE, THE_STORE),
    );
    addProxyMethod(
      5,
      EMPTY_STRING,
      VALUE,
      `void`,
      getForEachDoc(VALUE, THE_STORE),
      `valueCallback: ${valueCallbackType}`,
      'valueCallback as any',
    );

    mapValuesSchema((valueId, type, _, VALUE_ID, valueName) =>
      arrayForEach(
        [
          [type],
          [BOOLEAN],
          [storeType, 'value: ' + type, ', value'],
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
      ),
    );

    addProxyMethod(
      0,
      EMPTY_STRING,
      VALUES + JSON,
      JSON,
      getTheContentOfTheStoreDoc(2, 6),
    );
    addProxyMethod(
      2,
      EMPTY_STRING,
      VALUES + JSON,
      storeType,
      getTheContentOfTheStoreDoc(2, 7),
      'valuesJson: ' + JSON,
      'values' + JSON,
    );

    addProxyListener(
      VALUES,
      valuesListenerType,
      getTheContentOfTheStoreDoc(2, 8) + ' changes',
    );
    addProxyListener(VALUE_IDS, valueIdsListenerType, getListenerDoc(10, 0, 1));
    addProxyListener(
      VALUE,
      valueListenerType,
      getListenerDoc(11, 0),
      `valueId: ${valueIdType} | null`,
      'valueId',
    );
    addProxyListener(
      INVALID + VALUE,
      invalidValueListenerType,
      REGISTERS_A_LISTENER + ' whenever an invalid Value change was attempted',
      `valueId: IdOrNull`,
      'valueId',
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
    addImport(0, 'tinybase', 'ValueChange');

    arrayPush(
      createSteps,
      '.setValuesSchema({',
      mapValuesSchema((valueId, type, defaultValue, VALUE_ID) => [
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

  addImport(0, 'tinybase', ...COMMON_IMPORTS);

  const transactionListenerType = addType(
    TRANSACTION + LISTENER,
    `(${storeInstance}: ${storeType}, cellsTouched: boolean, ` +
      `valuesTouched: boolean)` +
      RETURNS_VOID,
    A_FUNCTION_FOR + ' listening to the completion of a ' + TRANSACTION_,
  );

  addProxyMethod(0, EMPTY_STRING, JSON, JSON, getTheContentOfTheStoreDoc(0, 6));
  addProxyMethod(
    2,
    EMPTY_STRING,
    JSON,
    storeType,
    getTheContentOfTheStoreDoc(0, 7),
    'json: ' + JSON,
    'json',
  );

  addProxyMethod(
    7,
    EMPTY_STRING,
    TRANSACTION_,
    'Return',
    'Execute a ' + TRANSACTION_ + ' to make multiple mutations',
    'actions: () => Return, doRollback?: DoRollback',
    'actions, doRollback',
    '<Return>',
  );
  addProxyMethod(
    7,
    EMPTY_STRING,
    'start' + TRANSACTION,
    storeType,
    'Explicitly starts a ' + TRANSACTION_,
  );
  addProxyMethod(
    7,
    EMPTY_STRING,
    'finish' + TRANSACTION,
    storeType,
    'Explicitly finishes a ' + TRANSACTION_,
    'doRollback?: DoRollback,',
    'doRollback',
  );

  addProxyListener(
    'WillFinish' + TRANSACTION,
    transactionListenerType,
    REGISTERS_A_LISTENER + ' just before ' + THE_END_OF_THE_TRANSACTION,
    EMPTY_STRING,
    EMPTY_STRING,
    0,
  );
  addProxyListener(
    'DidFinish' + TRANSACTION,
    transactionListenerType,
    REGISTERS_A_LISTENER + ' just after ' + THE_END_OF_THE_TRANSACTION,
    EMPTY_STRING,
    EMPTY_STRING,
    0,
  );

  addProxyMethod(
    7,
    EMPTY_STRING,
    'call' + LISTENER,
    storeType,
    `Manually provoke a listener to be called`,
    `listenerId: Id`,
    `listenerId`,
  );
  addProxyMethod(
    3,
    EMPTY_STRING,
    LISTENER,
    storeType,
    'Remove a listener that was previously added to ' + THE_STORE,
    'listenerId: Id',
    'listenerId',
  );

  addMethod(
    'getStore',
    EMPTY_STRING,
    'Store',
    'store',
    VERBS[0] + ' the underlying Store object',
  );

  addImport(1, 'tinybase', 'createStore', ...COMMON_IMPORTS);
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
    `(_: Store, ...args: any[]) => listener(${storeInstance}, ...args)`,
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
