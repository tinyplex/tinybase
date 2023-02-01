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
  VERBS,
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
  getTableContentDoc,
  getTableDoc,
  getTheContentOfTheStoreDoc,
  getValueContentDoc,
  getValueDoc,
} from './strings';
import {BOOLEAN, DEFAULT, EMPTY_STRING, TYPE} from '../common/strings';
import {Cell, TablesSchema, Value, ValuesSchema} from '../store.d';
import {IdMap, mapEnsure, mapForEach, mapNew, mapSet} from '../common/map';
import {camel, comment, flat, getCodeFunctions, join, snake} from './code';
import {isString, isUndefined} from '../common/other';
import {objIsEmpty, objMap} from '../common/obj';
import {Id} from '../common.d';
import {arrayPush} from '../common/array';
import {collValues} from '../common/coll';

type TableTypes = [string, string, string, string, string, string];

const COMMON_IMPORTS = ['DoRollback', 'Id', 'IdOrNull', 'Ids', 'Json', 'Store'];

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
  valuesSchema: ValuesSchema,
  module: string,
): [string, string, string, string] => {
  if (objIsEmpty(tablesSchema) && objIsEmpty(valuesSchema)) {
    return [EMPTY_STRING, EMPTY_STRING, EMPTY_STRING, EMPTY_STRING];
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
  const createSteps: any[] = [];

  const tableTypes: IdMap<TableTypes> = mapNew();
  const mapTablesSchema = <Return>(
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

  const mapValuesSchema = <Return>(
    callback: (
      valueId: Id,
      type: 'string' | 'number' | 'boolean',
      defaultValue: Value | undefined,
      VALUE_ID: string,
      valueName: string,
    ) => Return,
  ) =>
    objMap(valuesSchema, (valueSchema, valueId) =>
      callback(
        valueId,
        valueSchema[TYPE],
        valueSchema[DEFAULT],
        addConstant(snake(valueId), `'${valueId}'`),
        camel(valueId, 1),
      ),
    );

  // --

  addImport(
    1,
    moduleDefinition,
    storeType,
    `create${storeType} as create${storeType}Decl`,
  );

  if (!objIsEmpty(tablesSchema)) {
    const tablesType = addType(
      'Tables',
      `{${join(
        mapTablesSchema(
          (tableId, tableTypes) => `'${tableId}'?: ${tableTypes[0]};`,
        ),
        ' ',
      )}}`,
      getTheContentOfTheStoreDoc(4, 1),
    );
    const tableIdType = addType(
      'TableId',
      join(
        mapTablesSchema((tableId) => `'${tableId}'`),
        ' | ',
      ),
      `A Table Id in ${THE_STORE}`,
    );
    const tableCallbackType = addType(
      'TableCallback',
      `(...[tableId, rowCallback]: ${join(
        mapTablesSchema(
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
        mapTablesSchema(
          (tableId, tableTypes) =>
            `[tableId: '${tableId}', rowId: Id, cellId: ${tableTypes[3]}]`,
        ),
        ' | ',
      )}) => CellChange`,
      `${A_FUNCTION_FOR} returning information about any Cell's changes ` +
        'during a transaction',
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
      `(${storeInstance}: ${storeType}, tableId: ${tableIdType})` +
        RETURNS_VOID,
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
        )})${RETURNS_VOID}`,
      getListenerTypeDoc(7, 5),
    );
    const invalidCellListenerType = addType(
      'InvalidCellListener',
      `(${storeInstance}: ${storeType}, tableId: Id, rowId: Id, cellId: Id, ` +
        `invalidCells: any[])${RETURNS_VOID}`,
      getListenerTypeDoc(8),
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
      getTheContentOfTheStoreDoc(0, 1),
    );
    addMethod(
      `setTables`,
      `tables: ${tablesType}`,
      storeType,
      fluentStoreMethod('setTables', 'tables'),
      getTheContentOfTheStoreDoc(1, 1),
    );
    addMethod(
      `delTables`,
      EMPTY_STRING,
      storeType,
      fluentStoreMethod('delTables'),
      getTheContentOfTheStoreDoc(3, 1),
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

    mapTablesSchema(
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
      getTheContentOfTheStoreDoc(5, 1),
    );
    addMethod(
      'setTablesJson',
      'tablesJson: Json',
      storeType,
      fluentStoreMethod('setTablesJson', 'tablesJson'),
      getTheContentOfTheStoreDoc(6, 1),
    );

    addMethod(
      'addTablesListener',
      `${LISTENER}: ${tablesListenerType}, mutator?: boolean`,
      'Id',
      storeListener('addTablesListener', EMPTY_STRING, 'mutator'),
      getTheContentOfTheStoreDoc(7, 1) + ' changes',
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
        mapTablesSchema((_, tableTypes) => tableTypes[3]),
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
      storeListener(
        'addInvalidCellListener',
        'tableId, rowId, cellId',
        'mutator',
      ),
      `${REGISTERS_A_LISTENER} whenever an invalid Cell change was attempted`,
    );

    mapForEach(mapCellTypes, (type, mapCellType) =>
      addType(
        mapCellType,
        `(cell: ${type}${OR_UNDEFINED}) => ${type}`,
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
        mapTablesSchema((tableId, _, __, TABLE_ID) => [
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
    );
  }

  if (!objIsEmpty(valuesSchema)) {
    const valuesType = addType(
      'Values',
      `{${join(
        mapValuesSchema(
          (valueId, type, defaultValue) =>
            `'${valueId}'${
              isUndefined(defaultValue) ? '?' : EMPTY_STRING
            }: ${type};`,
        ),
        ' ',
      )}}`,
      getTheContentOfTheStoreDoc(4, 2),
    );
    const valuesWhenSetType = addType(
      'ValuesWhenSet',
      `{${join(
        mapValuesSchema((valueId, type) => `'${valueId}'?: ${type};`),
        ' ',
      )}}`,
      getTheContentOfTheStoreDoc(4, 2, 1),
    );
    const valueIdType = addType(
      'ValueId',
      join(
        mapValuesSchema((valueId) => `'${valueId}'`),
        ' | ',
      ),
      `A Value Id in ${THE_STORE}`,
    );
    const valueCallbackType = addType(
      'ValueCallback',
      `(...[valueId, rowCallback]: ${join(
        mapValuesSchema(
          (valueId, type) => `[valueId: '${valueId}', value: ${type}]`,
        ),
        ' | ',
      )})${RETURNS_VOID}`,
      getCallbackDoc('a Value Id, and value'),
    );
    const getValueChangeType = addType(
      'GetValueChange',
      `(valueId: ${valueIdType}) => ValueChange`,
      `${A_FUNCTION_FOR} returning information about any Value's changes ` +
        'during a transaction',
    );
    const valuesListenerType = addType(
      'ValuesListener',
      `(${storeInstance}: ${storeType}, ` +
        `getValueChange: ${getValueChangeType}${OR_UNDEFINED})` +
        RETURNS_VOID,
      getListenerTypeDoc(9),
    );
    const valueIdsListenerType = addType(
      'ValueIdsListener',
      `(${storeInstance}: ${storeType})${RETURNS_VOID}`,
      getListenerTypeDoc(10),
    );
    const valueListenerType = addType(
      'ValueListener',
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
        )})${RETURNS_VOID}`,
      getListenerTypeDoc(11),
    );
    const invalidValueListenerType = addType(
      'InvalidValueListener',
      `(${storeInstance}: ${storeType}, valueId: Id, ` +
        `invalidValues: any[])${RETURNS_VOID}`,
      getListenerTypeDoc(12),
    );

    addMethod(
      `hasValues`,
      EMPTY_STRING,
      BOOLEAN,
      storeMethod('hasValues'),
      getHasDoc('any Value'),
    );
    addMethod(
      `getValues`,
      EMPTY_STRING,
      valuesType,
      storeMethod('getValues', EMPTY_STRING, valuesType),
      getTheContentOfTheStoreDoc(0, 2),
    );
    addMethod(
      `setValues`,
      `values: ${valuesWhenSetType}`,
      storeType,
      fluentStoreMethod('setValues', 'values'),
      getTheContentOfTheStoreDoc(1, 2),
    );
    addMethod(
      `setPartialValues`,
      `partialValues: ${valuesWhenSetType}`,
      storeType,
      fluentStoreMethod('setPartialValues', 'partialValues'),
      getTheContentOfTheStoreDoc(2, 2),
    );
    addMethod(
      `delValues`,
      EMPTY_STRING,
      storeType,
      fluentStoreMethod('delValues'),
      getTheContentOfTheStoreDoc(3, 2),
    );
    addMethod(
      `getValueIds`,
      EMPTY_STRING,
      `${valueIdType}[]`,
      storeMethod('getValueIds', EMPTY_STRING, `${valueIdType}[]`),
      getIdsDoc('Value', THE_STORE),
    );
    addMethod(
      'forEachValue',
      `valueCallback: ${valueCallbackType}`,
      'void',
      storeMethod('forEachValue', 'valueCallback as any'),
      getForEachDoc('Value', THE_STORE),
    );

    mapValuesSchema((valueId, type, _, VALUE_ID, valueName) => {
      addMethod(
        `has${valueName}Value`,
        EMPTY_STRING,
        BOOLEAN,
        storeMethod('hasValue', VALUE_ID),
        getHasDoc(getValueDoc(valueId)),
      );
      addMethod(
        `get${valueName}Value`,
        EMPTY_STRING,
        type,
        storeMethod('getValue', VALUE_ID, type),
        getValueContentDoc(valueId),
      );
      addMethod(
        `set${valueName}Value`,
        `value: ${type}`,
        storeType,
        fluentStoreMethod('setValue', `${VALUE_ID}, value`),
        getValueContentDoc(valueId, 1),
      );
      addMethod(
        `del${valueName}Value`,
        EMPTY_STRING,
        storeType,
        fluentStoreMethod('delValue', VALUE_ID),
        getValueContentDoc(valueId, 3),
      );
    });

    addMethod(
      'getValuesJson',
      EMPTY_STRING,
      'Json',
      storeMethod('getValuesJson'),
      getTheContentOfTheStoreDoc(5, 2),
    );
    addMethod(
      'setValuesJson',
      'valuesJson: Json',
      storeType,
      fluentStoreMethod('setValuesJson', 'valuesJson'),
      getTheContentOfTheStoreDoc(6, 2),
    );

    addMethod(
      'addValuesListener',
      `${LISTENER}: ${valuesListenerType}, mutator?: boolean`,
      'Id',
      storeListener('addValuesListener', EMPTY_STRING, 'mutator'),
      getTheContentOfTheStoreDoc(7, 2) + ' changes',
    );
    addMethod(
      'addValueIdsListener',
      `${LISTENER}: ${valueIdsListenerType}, mutator?: boolean`,
      'Id',
      storeListener('addValueIdsListener', EMPTY_STRING, 'mutator'),
      getListenerDoc('the Value Ids', THE_STORE, 1),
    );
    addMethod(
      'addValueListener',
      `valueId: ${valueIdType} | null, ${LISTENER}: ${valueListenerType}, ` +
        'mutator?: boolean',
      'Id',
      storeListener('addValueListener', 'valueId', 'mutator'),
      getListenerDoc('a Value', THE_STORE),
    );
    addMethod(
      'addInvalidValueListener',
      `valueId: IdOrNull, ${LISTENER}: ` +
        `${invalidValueListenerType}, mutator?: boolean`,
      'Id',
      storeListener('addInvalidValueListener', 'valueId', 'mutator'),
      `${REGISTERS_A_LISTENER} whenever an invalid Cell change was attempted`,
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
            : `, [${addConstant(snake(DEFAULT), `'${DEFAULT}'`)}]: ${
                isString(defaultValue)
                  ? addConstant(snake(defaultValue), `'${defaultValue}'`)
                  : defaultValue
              }`
        }},`,
      ]),
      '})',
    );
  }

  addImport(0, 'tinybase', ...COMMON_IMPORTS);

  const transactionListenerType = addType(
    'TransactionListener',
    `(${storeInstance}: ${storeType}, cellsTouched: boolean, ` +
      `valuesTouched: boolean)${RETURNS_VOID}`,
    `${A_FUNCTION_FOR} listening to the completion of a transaction`,
  );

  addMethod(
    'getJson',
    EMPTY_STRING,
    'Json',
    storeMethod('getJson'),
    getTheContentOfTheStoreDoc(5),
  );
  addMethod(
    'setJson',
    'json: Json',
    storeType,
    fluentStoreMethod('setJson', 'json'),
    getTheContentOfTheStoreDoc(6),
  );

  addMethod(
    'transaction',
    'actions: () => Return, doRollback?: DoRollback',
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
    'doRollback?: DoRollback,',
    storeType,
    fluentStoreMethod('finishTransaction', 'doRollback'),
    'Explicitly finishes a transaction',
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
    `${VERBS[0]} the underlying Store object`,
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
    '',
    '',
  ];
};
