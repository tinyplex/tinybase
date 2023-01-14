import {
  A_FUNCTION_FOR,
  EXPORT,
  LISTENER,
  OR_UNDEFINED,
  REGISTERS_A_LISTENER,
  REPRESENTS,
  RETURNS_VOID,
  THE_END_OF_THE_TRANSACTION,
  THE_SPECIFIED_ROW,
  THE_STORE,
  THE_TABULAR_CONTENT_OF_THE_STORE,
  getCallbackDoc,
  getCellContentDoc,
  getCellDoc,
  getForEachDoc,
  getHasDoc,
  getIdsDoc,
  getListenerDoc,
  getListenerTypeDoc,
  getRowContentDoc,
  getRowDoc,
  getRowTypeDoc,
  getStoreContentDoc,
  getTableContentDoc,
  getTableDoc,
  verbs,
} from './strings';
import {BOOLEAN, DEFAULT, EMPTY_STRING, TYPE} from '../common/strings';
import {Cell, TablesSchema} from '../store.d';
import {IdMap, mapEnsure, mapForEach, mapNew, mapSet} from '../common/map';
import {camel, comment, flat, getCodeFunctions, join, snake} from './code';
import {isString, isUndefined} from '../common/other';
import {objIsEmpty, objMap} from '../common/obj';
import {Id} from '../common.d';
import {collValues} from '../common/coll';
import {pairNew} from '../common/pairs';

type TableTypes = [string, string, string, string, string, string];

const COMMON_IMPORTS = [
  'ChangedCells',
  'Id',
  'IdOrNull',
  'Ids',
  'InvalidCells',
  'Json',
  'Store',
];

const storeMethod = (
  method: string,
  parameters = EMPTY_STRING,
  cast = EMPTY_STRING,
) => `store.${method}(${parameters})${cast ? ` as ${cast}` : EMPTY_STRING}`;
const fluentStoreMethod = (method: string, parameters = EMPTY_STRING) =>
  `fluent(() => ${storeMethod(method, parameters)})`;

const storeListener = (
  method: string,
  beforeParameters = EMPTY_STRING,
  afterParameters = EMPTY_STRING,
) =>
  `store.${method}(${
    beforeParameters ? `${beforeParameters}, ` : EMPTY_STRING
  }proxy(${LISTENER})${
    afterParameters ? `, ${afterParameters}` : EMPTY_STRING
  })`;

export const getStoreApi = (
  tablesSchema: TablesSchema,
  module: string,
): [string, string] => {
  if (objIsEmpty(tablesSchema)) {
    return pairNew(EMPTY_STRING);
  }

  const [
    build,
    addImport,
    addType,
    addMethod,
    addFunction,
    addConstant,
    getImports,
    getTypes,
    getMethods,
    getConstants,
  ] = getCodeFunctions();

  const moduleDefinition = `./${camel(module)}.d`;
  const storeType = camel(module, 1);
  const storeInstance = camel(storeType);

  const tableTypes: IdMap<TableTypes> = mapNew();
  const mapTableSchema = <Return>(
    callback: (
      tableId: Id,
      tableTypes: TableTypes,
      tableName: string,
      TABLE_ID: string,
    ) => Return,
  ) =>
    objMap(tablesSchema, (_, tableId) => {
      return callback(
        tableId,
        mapEnsure(tableTypes, tableId, () => {
          const table = camel(tableId, 1);
          return [
            addType(
              `${table}Table`,
              `{[rowId: Id]: ${table}Row}`,
              `${REPRESENTS} the '${tableId}' Table`,
            ),
            addType(
              `${table}Row`,
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
              `${table}RowWhenSet`,
              `{${join(
                mapCellSchema(
                  tableId,
                  (cellId, type) => `'${cellId}'?: ${type};`,
                ),
                ' ',
              )}}`,
              getRowTypeDoc(tableId, 1),
            ),
            addType(
              `${table}CellId`,
              join(
                mapCellSchema(tableId, (cellId) => `'${cellId}'`),
                ' | ',
              ),
              `A Cell Id for the '${tableId}' Table`,
            ),
            addType(
              `${table}CellCallback`,
              `(...[cellId, cell]: ${join(
                mapCellSchema(
                  tableId,
                  (cellId, type) => `[cellId: '${cellId}', cell: ${type}]`,
                ),
                ' | ',
              )})${RETURNS_VOID}`,
              getCallbackDoc(
                `a Cell Id and value from a Row in the '${tableId}' Table`,
              ),
            ),
            addType(
              `${table}RowCallback`,
              `(rowId: Id, forEachCell: (cellCallback: ${table}CellCallback)` +
                `${RETURNS_VOID})${RETURNS_VOID}`,
              getCallbackDoc(
                `a Row Id from the '${tableId}' Table, and a Cell iterator`,
              ),
            ),
          ];
        }),
        camel(tableId, 1),
        addConstant(snake(tableId), `'${tableId}'`),
      );
    });
  const mapCellSchema = <Return>(
    tableId: Id,
    callback: (
      cellId: Id,
      type: 'string' | 'number' | 'boolean',
      defaultValue: Cell | undefined,
      CELL_ID: string,
      cellName: string,
    ) => Return,
  ) =>
    objMap(tablesSchema[tableId], (cellSchema, cellId) =>
      callback(
        cellId,
        cellSchema[TYPE],
        cellSchema[DEFAULT],
        addConstant(snake(cellId), `'${cellId}'`),
        camel(cellId, 1),
      ),
    );

  // --

  const tablesType = addType(
    'Tables',
    `{${join(
      mapTableSchema(
        (tableId, tableTypes) => `'${tableId}'?: ${tableTypes[0]};`,
      ),
      ' ',
    )}}`,
    `${REPRESENTS} ${THE_TABULAR_CONTENT_OF_THE_STORE}`,
  );
  const tableIdType = addType(
    'TableId',
    join(
      mapTableSchema((tableId) => `'${tableId}'`),
      ' | ',
    ),
    `A Table Id in ${THE_STORE}`,
  );
  const tableCallbackType = addType(
    'TableCallback',
    `(...[tableId, rowCallback]: ${join(
      mapTableSchema(
        (tableId, tableTypes) =>
          `[tableId: '${tableId}', ` +
          `forEachRow: (rowCallback: ${tableTypes[5]})${RETURNS_VOID}]`,
      ),
      ' | ',
    )})${RETURNS_VOID}`,
    getCallbackDoc('a Table Id, and a Row iterator'),
  );
  const getCellChangeType = addType(
    'GetCellChange',
    `(...[tableId, rowId, cellId]: ${join(
      mapTableSchema(
        (tableId, tableTypes) =>
          `[tableId: '${tableId}', rowId: Id, cellId: ${tableTypes[3]}]`,
      ),
      ' | ',
    )}) => CellChange`,
    `${A_FUNCTION_FOR} returning information about any Cell's changes during ` +
      ' a transaction',
  );
  const tablesListenerType = addType(
    'TablesListener',
    `(${storeInstance}: ${storeType}, ` +
      `getCellChange: ${getCellChangeType}${OR_UNDEFINED})${RETURNS_VOID}`,
    getListenerTypeDoc(1),
  );
  const tableIdsListenerType = addType(
    'TableIdsListener',
    `(${storeInstance}: ${storeType})${RETURNS_VOID}`,
    getListenerTypeDoc(2),
  );
  const tableListenerType = addType(
    'TableListener',
    `(${storeInstance}: ${storeType}, tableId: ${tableIdType}, ` +
      `getCellChange: ${getCellChangeType}${OR_UNDEFINED})${RETURNS_VOID}`,
    getListenerTypeDoc(3),
  );
  const rowIdsListenerType = addType(
    'RowIdsListener',
    `(${storeInstance}: ${storeType}, tableId: ${tableIdType})${RETURNS_VOID}`,
    getListenerTypeDoc(4, 3),
  );
  const rowListenerType = addType(
    'RowListener',
    `(${storeInstance}: ${storeType}, tableId: ${tableIdType}, rowId: Id, ` +
      `getCellChange: ${getCellChangeType}${OR_UNDEFINED})${RETURNS_VOID}`,
    getListenerTypeDoc(5, 3),
  );
  const cellIdsListenerType = addType(
    'CellIdsListener',
    `(${storeInstance}: ${storeType}, tableId: ${tableIdType}, rowId: Id)` +
      RETURNS_VOID,
    getListenerTypeDoc(6, 5),
  );
  const cellListenerType = addType(
    'CellListener',
    `(...[${storeInstance}, tableId, rowId, cellId, newCell, oldCell, ` +
      `getCellChange]: ${join(
        flat(
          mapTableSchema((tableId) =>
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
      )})${RETURNS_VOID}`,
    getListenerTypeDoc(7, 5),
  );
  const invalidCellListenerType = addType(
    'InvalidCellListener',
    `(${storeInstance}: ${storeType}, tableId: Id, rowId: Id, cellId: Id, ` +
      `invalidCells: any[])${RETURNS_VOID}`,
    getListenerTypeDoc(8),
  );
  const transactionListenerType = addType(
    'TransactionListener',
    `(${storeInstance}: ${storeType}, cellsTouched: boolean)${RETURNS_VOID}`,
    `${A_FUNCTION_FOR} listening to the completion of a transaction`,
  );

  addMethod(
    `hasTables`,
    EMPTY_STRING,
    BOOLEAN,
    storeMethod('hasTables'),
    getHasDoc('any Table'),
  );
  addMethod(
    `getTables`,
    EMPTY_STRING,
    tablesType,
    storeMethod('getTables'),
    getStoreContentDoc(),
  );
  addMethod(
    `setTables`,
    `tables: ${tablesType}`,
    storeType,
    fluentStoreMethod('setTables', 'tables'),
    getStoreContentDoc(1),
  );
  addMethod(
    `delTables`,
    EMPTY_STRING,
    storeType,
    fluentStoreMethod('delTables'),
    getStoreContentDoc(3),
  );
  addMethod(
    `getTableIds`,
    EMPTY_STRING,
    `${tableIdType}[]`,
    storeMethod('getTableIds', EMPTY_STRING, `${tableIdType}[]`),
    getIdsDoc('Table', THE_STORE),
  );
  addMethod(
    'forEachTable',
    `tableCallback: ${tableCallbackType}`,
    'void',
    storeMethod('forEachTable', 'tableCallback as any'),
    getForEachDoc('Table', THE_STORE),
  );

  const mapCellTypes: IdMap<string> = mapNew();

  mapTableSchema(
    (
      tableId,
      [
        tableType,
        rowType,
        rowWhenSetType,
        cellIdType,
        cellCallbackType,
        rowCallbackType,
      ],
      tableName,
      TABLE_ID,
    ) => {
      addImport(
        1,
        moduleDefinition,
        tableType,
        rowType,
        rowWhenSetType,
        cellIdType,
        cellCallbackType,
        rowCallbackType,
      );

      addMethod(
        `has${tableName}Table`,
        EMPTY_STRING,
        BOOLEAN,
        storeMethod('hasTable', TABLE_ID),
        getHasDoc(getTableDoc(tableId)),
      );
      addMethod(
        `get${tableName}Table`,
        EMPTY_STRING,
        tableType,
        storeMethod('getTable', TABLE_ID, tableType),
        getTableContentDoc(tableId),
      );
      addMethod(
        `set${tableName}Table`,
        `table: ${tableType}`,
        storeType,
        fluentStoreMethod('setTable', `${TABLE_ID}, table`),
        getTableContentDoc(tableId, 1),
      );
      addMethod(
        `del${tableName}Table`,
        EMPTY_STRING,
        storeType,
        fluentStoreMethod('delTable', TABLE_ID),
        getTableContentDoc(tableId, 3),
      );
      addMethod(
        `get${tableName}RowIds`,
        EMPTY_STRING,
        'Ids',
        storeMethod('getRowIds', TABLE_ID),
        getIdsDoc('Row', getTableDoc(tableId)),
      );
      addMethod(
        `get${tableName}SortedRowIds`,
        `cellId?: ${cellIdType}, descending?: boolean, ` +
          'offset?: number, limit?: number',
        'Ids',
        storeMethod(
          'getSortedRowIds',
          `${TABLE_ID}, cellId, descending, offset, limit`,
        ),
        getIdsDoc('Row', getTableDoc(tableId), 1),
      );
      addMethod(
        `forEach${tableName}Row`,
        `rowCallback: ${rowCallbackType}`,
        'void',
        storeMethod('forEachRow', `${TABLE_ID}, rowCallback as any`),
        getForEachDoc('Row', getTableDoc(tableId)),
      );

      addMethod(
        `has${tableName}Row`,
        'rowId: Id',
        BOOLEAN,
        storeMethod('hasRow', `${TABLE_ID}, rowId`),
        getHasDoc(THE_SPECIFIED_ROW, getTableDoc(tableId)),
      );
      addMethod(
        `get${tableName}Row`,
        'rowId: Id',
        rowType,
        storeMethod('getRow', `${TABLE_ID}, rowId`, rowType),
        getRowContentDoc(tableId),
      );
      addMethod(
        `set${tableName}Row`,
        `rowId: Id, row: ${rowWhenSetType}`,
        storeType,
        fluentStoreMethod('setRow', `${TABLE_ID}, rowId, row`),
        getRowContentDoc(tableId, 1),
      );
      addMethod(
        `add${tableName}Row`,
        `row: ${rowWhenSetType}`,
        `Id${OR_UNDEFINED}`,
        storeMethod('addRow', `${TABLE_ID}, row`),
        `Adds a new Row to ${getTableDoc(tableId)}`,
      );
      addMethod(
        `set${tableName}PartialRow`,
        `rowId: Id, partialRow: ${rowWhenSetType}`,
        storeType,
        fluentStoreMethod('setPartialRow', `${TABLE_ID}, rowId, partialRow`),
        getRowContentDoc(tableId, 2),
      );
      addMethod(
        `del${tableName}Row`,
        `rowId: Id`,
        storeType,
        fluentStoreMethod('delRow', `${TABLE_ID}, rowId`),
        getRowContentDoc(tableId, 3),
      );
      addMethod(
        `get${tableName}CellIds`,
        'rowId: Id',
        `${cellIdType}[]`,
        storeMethod('getCellIds', `${TABLE_ID}, rowId`, `${cellIdType}[]`),
        getIdsDoc('Cell', getRowDoc(tableId)),
      );
      addMethod(
        `forEach${tableName}Cell`,
        `rowId: Id, cellCallback: ${cellCallbackType}`,
        'void',
        storeMethod('forEachCell', `${TABLE_ID}, rowId, cellCallback as any`),
        getForEachDoc('Cell', getRowDoc(tableId)),
      );

      mapCellSchema(
        tableId,
        (cellId, type, defaultValue, CELL_ID, cellName) => {
          const mapCellType = `Map${camel(type, 1)}`;
          mapSet(mapCellTypes, type, mapCellType);

          addMethod(
            `has${tableName}${cellName}Cell`,
            'rowId: Id',
            BOOLEAN,
            storeMethod('hasCell', `${TABLE_ID}, rowId, ${CELL_ID}`),
            getHasDoc(getCellDoc(cellId), getRowDoc(tableId)),
          );
          const returnCellType = `${type}${
            isUndefined(defaultValue) ? OR_UNDEFINED : EMPTY_STRING
          }`;
          addMethod(
            `get${tableName}${cellName}Cell`,
            'rowId: Id',
            returnCellType,
            storeMethod(
              'getCell',
              `${TABLE_ID}, rowId, ${CELL_ID}`,
              returnCellType,
            ),
            getCellContentDoc(tableId, cellId),
          );
          addMethod(
            `set${tableName}${cellName}Cell`,
            `rowId: Id, cell: ${type} | ${mapCellType}`,
            storeType,
            fluentStoreMethod(
              'setCell',
              `${TABLE_ID}, rowId, ${CELL_ID}, cell as any`,
            ),
            getCellContentDoc(tableId, cellId, 1),
          );
          addMethod(
            `del${tableName}${cellName}Cell`,
            `rowId: Id`,
            storeType,
            fluentStoreMethod('delCell', `${TABLE_ID}, rowId, ${CELL_ID}`),
            getCellContentDoc(tableId, cellId, 3),
          );
        },
      );
    },
  );

  addMethod(
    'getTablesJson',
    EMPTY_STRING,
    'Json',
    storeMethod('getTablesJson'),
    `${verbs[0]} a string serialization of ${THE_TABULAR_CONTENT_OF_THE_STORE}`,
  );
  addMethod(
    'setTablesJson',
    'json: Json',
    storeType,
    fluentStoreMethod('setTablesJson', 'json'),
    `${verbs[1]} ${THE_TABULAR_CONTENT_OF_THE_STORE} from a serialized string`,
  );

  addMethod(
    'transaction',
    'actions: () => Return, ' +
      'doRollback?: (changedCells: ChangedCells, invalidCells: InvalidCells) ' +
      '=> boolean',
    'Return',
    storeMethod('transaction', 'actions, doRollback'),
    'Execute a transaction to make multiple mutations',
    '<Return>',
  );
  addMethod(
    'startTransaction',
    EMPTY_STRING,
    storeType,
    fluentStoreMethod('startTransaction'),
    'Explicitly starts a transaction',
  );
  addMethod(
    'finishTransaction',
    'doRollback?: (changedCells: ChangedCells, invalidCells: InvalidCells) ' +
      '=> boolean,',
    storeType,
    fluentStoreMethod('finishTransaction', 'doRollback'),
    'Explicitly finishes a transaction',
  );

  addMethod(
    'addTablesListener',
    `${LISTENER}: ${tablesListenerType}, mutator?: boolean`,
    'Id',
    storeListener('addTablesListener', EMPTY_STRING, 'mutator'),
    `${REGISTERS_A_LISTENER} whenever ${THE_TABULAR_CONTENT_OF_THE_STORE}` +
      ' changes',
  );
  addMethod(
    'addTableIdsListener',
    `${LISTENER}: ${tableIdsListenerType}, mutator?: boolean`,
    'Id',
    storeListener('addTableIdsListener', EMPTY_STRING, 'mutator'),
    getListenerDoc('the Table Ids', THE_STORE, 1),
  );
  addMethod(
    'addTableListener',
    `tableId: ${tableIdType} | null, ${LISTENER}: ${tableListenerType}, ` +
      'mutator?: boolean',
    'Id',
    storeListener('addTableListener', 'tableId', 'mutator'),
    getListenerDoc('a Table', THE_STORE),
  );
  addMethod(
    'addRowIdsListener',
    `tableId: ${tableIdType} | null, ${LISTENER}: ${rowIdsListenerType}, ` +
      'mutator?: boolean',
    'Id',
    storeListener('addRowIdsListener', 'tableId', 'mutator'),
    getListenerDoc('the Row Ids', 'a Table', 1),
  );
  addMethod(
    'addRowListener',
    `tableId: ${tableIdType} | null, rowId: IdOrNull, ` +
      `${LISTENER}: ${rowListenerType}, mutator?: boolean`,
    'Id',
    storeListener('addRowListener', 'tableId, rowId', 'mutator'),
    getListenerDoc('a Row', 'a Table'),
  );
  addMethod(
    'addCellIdsListener',
    `tableId: ${tableIdType} | null, rowId: IdOrNull, ` +
      `${LISTENER}: ${cellIdsListenerType}, mutator?: boolean`,
    'Id',
    storeListener('addCellIdsListener', 'tableId, rowId', 'mutator'),
    getListenerDoc('the Cell Ids', 'a Row', 1),
  );
  addMethod(
    'addCellListener',
    `tableId: ${tableIdType} | null, rowId: IdOrNull, cellId: ${join(
      mapTableSchema((_, tableTypes) => tableTypes[3]),
      ' | ',
    )} | null, ${LISTENER}: ${cellListenerType}, mutator?: boolean`,
    'Id',
    storeListener('addCellListener', 'tableId, rowId, cellId', 'mutator'),
    getListenerDoc('a Cell', 'a Row'),
  );
  addMethod(
    'addInvalidCellListener',
    `tableId: IdOrNull, rowId: IdOrNull, cellId: IdOrNull, ${LISTENER}: ` +
      `${invalidCellListenerType}, mutator?: boolean`,
    'Id',
    storeListener('addCellListener', 'tableId, rowId, cellId', 'mutator'),
    `${REGISTERS_A_LISTENER} whenever an invalid Cell change was attempted`,
  );
  addMethod(
    'addWillFinishTransactionListener',
    `${LISTENER}: ${transactionListenerType}`,
    'Id',
    storeListener('addWillFinishTransactionListener'),
    `${REGISTERS_A_LISTENER} just before ${THE_END_OF_THE_TRANSACTION}`,
  );
  addMethod(
    'addDidFinishTransactionListener',
    `${LISTENER}: ${transactionListenerType}`,
    'Id',
    storeListener('addDidFinishTransactionListener'),
    `${REGISTERS_A_LISTENER} just after ${THE_END_OF_THE_TRANSACTION}`,
  );

  addMethod(
    'callListener',
    `${LISTENER}Id: Id`,
    storeType,
    fluentStoreMethod('callListener', `${LISTENER}Id`),
    `Manually provoke a ${LISTENER} to be called`,
  );
  addMethod(
    'delListener',
    `${LISTENER}Id: Id`,
    storeType,
    fluentStoreMethod('delListener', `${LISTENER}Id`),
    `Remove a ${LISTENER} that was previously added to ${THE_STORE}`,
  );

  addMethod(
    'getStore',
    EMPTY_STRING,
    'Store',
    'store',
    `${verbs[0]} the underlying Store object`,
  );

  mapForEach(mapCellTypes, (type, mapCellType) =>
    addType(
      mapCellType,
      `(cell: ${type}${OR_UNDEFINED}) => ${type}`,
      `Takes a ${type} Cell value and returns another`,
    ),
  );

  addImport(0, 'tinybase', 'CellChange', ...COMMON_IMPORTS);
  addImport(1, 'tinybase', 'createStore', ...COMMON_IMPORTS);
  addImport(
    1,
    moduleDefinition,
    storeType,
    `create${storeType} as create${storeType}Decl`,
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
    transactionListenerType,
    ...collValues(mapCellTypes),
  );

  addConstant('store', [
    'createStore().setTablesSchema({',
    flat(
      mapTableSchema((tableId, _, __, TABLE_ID) => [
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
                : `, [${addConstant(snake(DEFAULT), `'${DEFAULT}'`)}]: ${
                    isString(defaultValue)
                      ? addConstant(snake(defaultValue), `'${defaultValue}'`)
                      : defaultValue
                  }`
            }},`,
        ),
        `},`,
      ]),
    ),
    '})',
  ]);

  addFunction('fluent', 'actions: () => Store', [
    'actions();',
    `return ${storeInstance};`,
  ]);
  addFunction(
    'proxy',
    `${LISTENER}: any`,
    `(_: Store, ...args: any[]) => ${LISTENER}(${storeInstance}, ...args)`,
  );

  addConstant(storeInstance, ['{', ...getMethods(1), '}']);

  return [
    build(
      ...getImports(0),
      ...getTypes(),
      `${EXPORT} interface ${storeType} {`,
      ...getMethods(0),
      `}`,
      EMPTY_STRING,
      comment(`Creates a ${storeType} object`),
      `${EXPORT} function create${storeType}(): ${storeType};`,
    ),
    build(
      ...getImports(1),
      `${EXPORT} const create${storeType}: ` +
        `typeof create${storeType}Decl = () => {`,
      ...getConstants(),
      `return Object.freeze(${storeInstance});`,
      `};`,
    ),
  ];
};
