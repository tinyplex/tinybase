import {BOOLEAN, DEFAULT, TYPE} from '../common/strings';
import {camel, comment, getCodeFunctions, join, snake} from './code';
import {objForEach, objHas, objIsEmpty} from '../common/obj';
import {Schema} from '../store.d';
import {arrayPush} from '../common/array';
import {isString} from '../common/other';
import {pairNew} from '../common/pairs';

const THE_STORE = 'the Store';
const REPRESENTS = 'Represents';
const THE_CONTENT_OF = 'the content of';
const THE_CONTENT_OF_THE_STORE = `${THE_CONTENT_OF} ${THE_STORE}`;
const THE_SPECIFIED_ROW = 'the specified Row';

const storeMethod = (method: string, parameters = '', cast = '') =>
  `store.${method}(${parameters})${cast ? ` as ${cast}` : ''}`;
const fluentStoreMethod = (method: string, parameters = '') =>
  `fluent(() => ${storeMethod(method, parameters)})`;
const getIdsDoc = (idsNoun: string, parentNoun: string, sorted = 0) =>
  `Gets ${
    sorted ? 'sorted, paginated' : 'the'
  } Ids of the ${idsNoun}s in ${parentNoun}`;
const getForEachDoc = (childNoun: string, parentNoun: string) =>
  `Calls a function for each ${childNoun} in ${parentNoun}`;
const getHasDoc = (childNoun: string, parentNoun = THE_STORE) =>
  `Gets whether ${childNoun} exists in ${parentNoun}`;
const getVerb = (verb = 0) =>
  verb == 1
    ? 'Sets'
    : verb == 2
    ? 'Sets part of'
    : verb == 3
    ? 'Deletes'
    : 'Gets';

export const getStoreApi = (
  schema: Schema,
  module: string,
): [string, string] => {
  if (objIsEmpty(schema)) {
    return pairNew('// store has no inferable schema');
  }

  const moduleName = camel(module);
  const storeType = camel(module, true);
  const storeInstance = camel(storeType);
  const returnStore = `return ${storeInstance};`;

  const tablesTypes: string[] = [];
  const tableIdTypes: string[] = [];
  const tableCallbackArgTypes: string[] = [];
  const getCellChangeArgTypes: string[] = [];
  const schemaLines: string[] = [];

  const storeListener = (method: string, extraParameters = '') =>
    `store.${method}(proxy(listener)${
      extraParameters ? `, ${extraParameters}` : ''
    })`;

  const [
    build,
    addImport,
    addType,
    updateType,
    addMethod,
    addFunction,
    addConstant,
    getImports,
    getTypes,
    getMethods,
    getConstants,
  ] = getCodeFunctions();

  addImport(
    0,
    'tinybase',
    'CellChange',
    'ChangedCells',
    'Id',
    'Ids',
    'InvalidCells',
    'Json',
    'Store',
  );
  addImport(
    1,
    'tinybase',
    'CellCallback',
    'ChangedCells',
    'Id',
    'Ids',
    'InvalidCells',
    'Json',
    'RowCallback',
    'Store',
    'TableCallback',
    'createStore',
  );

  addFunction('fluent', 'actions: () => Store', ['actions();', returnStore]);
  addFunction(
    'proxy',
    `listener: (${storeInstance}: ${storeType}, ...args: any[]) => void`,
    `(_: Store, ...args: any[]) => listener(${storeInstance}, ...args)`,
  );

  const TYPE2 = addConstant(snake(TYPE), `'${TYPE}'`);
  const DEFAULT2 = addConstant(snake(DEFAULT), `'${DEFAULT}'`);

  const tablesType = addType(`${storeType}Tables`);
  const tableIdType = addType(`${storeType}TableId`);
  const tableCallbackType = addType(`${storeType}TableCallback`);
  const getCellChangeType = addType(`${storeType}GetCellChange`);

  const tablesListenerType = addType(
    `${storeType}TablesListener`,
    `(${storeInstance}: ${storeType}, ` +
      `getCellChange: ${getCellChangeType} | undefined) => void`,
    `A function for listening to changes to ${THE_CONTENT_OF_THE_STORE}`,
  );
  const tableIdsListenerType = addType(
    `${storeType}TableIdsListener`,
    `(${storeInstance}: ${storeType}) => void`,
    `A function for listening to changes to Table Ids in ${THE_STORE}`,
  );

  addImport(
    1,
    `./${moduleName}.d`,
    storeType,
    `create${storeType} as create${storeType}Decl`,
    tablesType,
    tableIdType,
    tableCallbackType,
    tablesListenerType,
    tableIdsListenerType,
  );

  const getStoreContentDoc = (verb = 0) =>
    `${getVerb(verb)} ${THE_CONTENT_OF_THE_STORE}`;

  addMethod(
    `hasTables`,
    '',
    BOOLEAN,
    storeMethod('hasTables'),
    getHasDoc('any Table'),
  );
  addMethod(
    `getTables`,
    '',
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
    '',
    storeType,
    fluentStoreMethod('delTables'),
    getStoreContentDoc(3),
  );
  addMethod(
    `getTableIds`,
    '',
    `${tableIdType}[]`,
    storeMethod('getTableIds', '', `${tableIdType}[]`),
    getIdsDoc('Table', THE_STORE),
  );
  addMethod(
    'forEachTable',
    `tableCallback: ${tableCallbackType}`,
    'void',
    storeMethod('forEachTable', 'tableCallback as TableCallback'),
    getForEachDoc('Table', THE_STORE),
  );

  objForEach(schema, (cellSchemas, tableId) => {
    const table = camel(tableId, true);
    const TABLE_ID = addConstant(snake(tableId), `'${tableId}'`);

    const getCellsTypes: string[] = [];
    const setCellsTypes: string[] = [];
    const cellIdTypes: string[] = [];
    const cellCallbackArgTypes: string[] = [];

    const tableDoc = `the '${tableId}' Table`;
    const rowDoc = `${THE_SPECIFIED_ROW} in ${tableDoc}`;
    const tableContentDoc = `${THE_CONTENT_OF} ${tableDoc}`;
    const getTableContentDoc = (verb = 0) =>
      `${getVerb(verb)} ${THE_CONTENT_OF} ${tableDoc}`;
    const getRowContentDoc = (verb = 0) =>
      `${getVerb(verb)} ${THE_CONTENT_OF} ${rowDoc}`;
    const getRowTypeDoc = (set = 0) =>
      `${REPRESENTS} a Row when ${set ? 's' : 'g'}etting ${tableContentDoc}`;

    const tableType = addType(
      `${table}Table`,
      `{[rowId: Id]: ${table}Row}`,
      `${REPRESENTS} ${tableDoc}`,
    );
    const rowType = addType(`${table}Row`);
    const rowWhenSetType = addType(`${table}RowWhenSet`);
    const cellIdType = addType(`${table}CellId`);
    const cellCallbackType = addType(`${table}CellCallback`);
    const rowCallbackType = addType(`${table}RowCallback`);

    addImport(
      1,
      `./${moduleName}.d`,
      tableType,
      rowType,
      rowWhenSetType,
      cellIdType,
      cellCallbackType,
      rowCallbackType,
    );

    addMethod(
      `has${table}Table`,
      '',
      BOOLEAN,
      storeMethod('hasTable', TABLE_ID),
      getHasDoc(tableDoc),
    );
    addMethod(
      `get${table}Table`,
      '',
      tableType,
      storeMethod('getTable', TABLE_ID, tableType),
      getTableContentDoc(),
    );
    addMethod(
      `set${table}Table`,
      `table: ${tableType}`,
      storeType,
      fluentStoreMethod('setTable', `${TABLE_ID}, table`),
      getTableContentDoc(1),
    );
    addMethod(
      `del${table}Table`,
      '',
      storeType,
      fluentStoreMethod('delTable', TABLE_ID),
      getTableContentDoc(3),
    );
    addMethod(
      `get${table}RowIds`,
      '',
      'Ids',
      storeMethod('getRowIds', TABLE_ID),
      getIdsDoc('Row', tableDoc),
    );
    addMethod(
      `get${table}SortedRowIds`,
      `cellId?: ${cellIdType}, descending?: boolean, ` +
        'offset?: number, limit?: number',
      'Ids',
      storeMethod(
        'getSortedRowIds',
        `${TABLE_ID}, cellId, descending, offset, limit`,
      ),
      getIdsDoc('Row', tableDoc, 1),
    );
    addMethod(
      `forEach${table}Row`,
      `rowCallback: ${rowCallbackType}`,
      'void',
      storeMethod('forEachRow', `${TABLE_ID}, rowCallback as RowCallback`),
      getForEachDoc('Row', tableDoc),
    );

    addMethod(
      `has${table}Row`,
      'rowId: Id',
      BOOLEAN,
      storeMethod('hasRow', `${TABLE_ID}, rowId`),
      getHasDoc(THE_SPECIFIED_ROW, tableDoc),
    );
    addMethod(
      `get${table}Row`,
      'rowId: Id',
      rowType,
      storeMethod('getRow', `${TABLE_ID}, rowId`, rowType),
      getRowContentDoc(),
    );
    addMethod(
      `set${table}Row`,
      `rowId: Id, row: ${rowWhenSetType}`,
      storeType,
      fluentStoreMethod('setRow', `${TABLE_ID}, rowId, row`),
      getRowContentDoc(1),
    );
    addMethod(
      `add${table}Row`,
      `row: ${rowWhenSetType}`,
      'Id | undefined',
      storeMethod('addRow', `${TABLE_ID}, row`),
      `Adds a new Row to ${tableDoc}`,
    );
    addMethod(
      `set${table}PartialRow`,
      `rowId: Id, partialRow: ${rowWhenSetType}`,
      storeType,
      fluentStoreMethod('setPartialRow', `${TABLE_ID}, rowId, partialRow`),
      getRowContentDoc(2),
    );
    addMethod(
      `del${table}Row`,
      `rowId: Id`,
      storeType,
      fluentStoreMethod('delRow', `${TABLE_ID}, rowId`),
      getRowContentDoc(3),
    );
    addMethod(
      `get${table}CellIds`,
      'rowId: Id',
      `${cellIdType}[]`,
      storeMethod('getCellIds', `${TABLE_ID}, rowId`, `${cellIdType}[]`),
      getIdsDoc('Cell', rowDoc),
    );
    addMethod(
      `forEach${table}Cell`,
      `rowId: Id, cellCallback: ${cellCallbackType}`,
      'void',
      storeMethod(
        'forEachCell',
        `${TABLE_ID}, rowId, cellCallback as CellCallback`,
      ),
      getForEachDoc('Cell', rowDoc),
    );

    arrayPush(schemaLines, `[${TABLE_ID}]: {`);
    objForEach(cellSchemas, (cellSchema, cellId) => {
      const cell = camel(cellId, true);
      const CELL_ID = addConstant(snake(cellId), `'${cellId}'`);
      const type = cellSchema[TYPE];
      const defaulted = objHas(cellSchema, DEFAULT);
      const defaultValue = cellSchema[DEFAULT];
      const cellDoc = `the '${cellId}' Cell`;
      const getCellContentDoc = (verb = 0) =>
        `${getVerb(verb)} ${cellDoc} for ${rowDoc}`;

      arrayPush(
        schemaLines,
        `[${CELL_ID}]: {[${TYPE2}]: ${addConstant(snake(type), `'${type}'`)}${
          defaulted
            ? `, [${DEFAULT2}]: ${
                isString(defaultValue)
                  ? addConstant(snake(defaultValue), `'${defaultValue}'`)
                  : defaultValue
              }`
            : ''
        }},`,
      );

      arrayPush(getCellsTypes, `'${cellId}'${defaulted ? '' : '?'}: ${type};`);
      arrayPush(setCellsTypes, `'${cellId}'?: ${type};`);
      arrayPush(cellIdTypes, `'${cellId}'`);
      arrayPush(cellCallbackArgTypes, `[cellId: '${cellId}', cell: ${type}]`);

      addMethod(
        `has${table}${cell}Cell`,
        'rowId: Id',
        BOOLEAN,
        storeMethod('hasCell', `${TABLE_ID}, rowId, ${CELL_ID}`),
        getHasDoc(cellDoc, rowDoc),
      );
      const returnCellType = `${type}${defaulted ? '' : ' | undefined'}`;
      addMethod(
        `get${table}${cell}Cell`,
        'rowId: Id',
        returnCellType,
        storeMethod(
          'getCell',
          `${TABLE_ID}, rowId, ${CELL_ID}`,
          returnCellType,
        ),
        getCellContentDoc(),
      );
      addMethod(
        `set${table}${cell}Cell`,
        `rowId: Id, cell: ${type}`,
        storeType,
        fluentStoreMethod('setCell', `${TABLE_ID}, rowId, ${CELL_ID}, cell`),
        getCellContentDoc(1),
      );
      addMethod(
        `del${table}${cell}Cell`,
        `rowId: Id`,
        storeType,
        fluentStoreMethod('delCell', `${TABLE_ID}, rowId, ${CELL_ID}`),
        getCellContentDoc(3),
      );
    });
    arrayPush(schemaLines, `},`);

    arrayPush(tablesTypes, `'${tableId}'?: ${tableType};`);
    arrayPush(tableIdTypes, `'${tableId}'`);
    arrayPush(
      tableCallbackArgTypes,
      `[tableId: '${tableId}', ` +
        `forEachRow: (rowCallback: ${rowCallbackType}) => void]`,
    );
    arrayPush(
      getCellChangeArgTypes,
      `[tableId: '${tableId}', rowId: Id, cellId: ${cellIdType}]`,
    );

    updateType(rowType, `{${join(getCellsTypes, ' ')}}`, getRowTypeDoc());
    updateType(
      rowWhenSetType,
      `{${join(setCellsTypes, ' ')}}`,
      getRowTypeDoc(1),
    );
    updateType(
      cellIdType,
      join(cellIdTypes, ' | '),
      `A Cell Id for ${tableDoc}`,
    );
    updateType(
      cellCallbackType,
      `(...[cellId, cell]: ${join(cellCallbackArgTypes, ' | ')}) => void`,
      `A function that takes a Cell Id and value from a Row in ${tableDoc}`,
    );
    updateType(
      rowCallbackType,
      `(rowId: Id, ` +
        `forEachCell: (cellCallback: ${cellCallbackType}) => void) => void`,
      `A function that takes a Row Id from ${tableDoc}, and a Cell iterator`,
    );
  });

  addMethod(
    'getJson',
    '',
    'Json',
    storeMethod('getJson'),
    `Gets a a string serialization ${THE_CONTENT_OF_THE_STORE}`,
  );
  addMethod(
    'setJson',
    'json: Json',
    storeType,
    fluentStoreMethod('setJson', 'json'),
    `Sets ${THE_CONTENT_OF_THE_STORE} from a serialized string`,
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
    '',
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
    `listener: ${tablesListenerType}, mutator?: boolean`,
    'Id',
    storeListener('addTablesListener', 'mutator'),
    `Registers a listener that will be called whenever ` +
      `${THE_CONTENT_OF_THE_STORE} changes`,
  );
  addMethod(
    'addTableIdsListener',
    `listener: ${tableIdsListenerType}, mutator?: boolean`,
    'Id',
    storeListener('addTableIdsListener', 'mutator'),
    `Registers a listener that will be called whenever Table Ids in ` +
      `${THE_STORE} change`,
  );

  addMethod(
    'getStore',
    '',
    'Store',
    'store',
    'Gets the underlying Store object',
  );

  updateType(
    tablesType,
    `{${join(tablesTypes, ' ')}}`,
    `${REPRESENTS} ${THE_CONTENT_OF_THE_STORE}`,
  );
  updateType(
    tableIdType,
    join(tableIdTypes, ' | '),
    `A Table Id in ${THE_STORE}`,
  );
  updateType(
    tableCallbackType,
    `(...[tableId, rowCallback]: ${join(
      tableCallbackArgTypes,
      ' | ',
    )}) => void`,
    'A function that takes a Table Id, and a Row iterator',
  );
  updateType(
    getCellChangeType,
    `(...[tableId, rowId, cellId]: ${join(
      getCellChangeArgTypes,
      ' | ',
    )}) => CellChange`,
    'A function that returns information about any ' +
      `Cell's changes during a transaction`,
  );

  addConstant('store', ['createStore().setSchema({', ...schemaLines, '})']);

  addConstant(storeInstance, ['{', ...getMethods(1), '}']);

  return [
    build(
      ...getImports(0),
      ...getTypes(),
      `export interface ${storeType} {`,
      ...getMethods(0),
      `}`,
      '',
      comment(`Creates a ${storeType} object`),
      `export function create${storeType}(): ${storeType};`,
    ),
    build(
      ...getImports(1),
      `export const create${storeType}: ` +
        `typeof create${storeType}Decl = () => {`,
      ...getConstants(),
      `return Object.freeze(${storeInstance});`,
      `};`,
    ),
  ];
};
