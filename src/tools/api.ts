import {BOOLEAN, DEFAULT, TYPE} from '../common/strings';
import {Cell, Schema} from '../store.d';
import {IdMap, mapEnsure, mapForEach, mapNew, mapSet} from '../common/map';
import {camel, comment, flat, getCodeFunctions, join, snake} from './code';
import {isString, isUndefined} from '../common/other';
import {objIsEmpty, objMap} from '../common/obj';
import {Id} from '../common.d';
import {collValues} from '../common/coll';
import {pairNew} from '../common/pairs';

type TableTypes = [string, string, string, string, string, string];

const THE_STORE = 'the Store';
const REPRESENTS = 'Represents';
const THE_CONTENT_OF = 'the content of';
const THE_CONTENT_OF_THE_STORE = `${THE_CONTENT_OF} ${THE_STORE}`;
const THE_SPECIFIED_ROW = 'the specified Row';
const REGISTERS_A_LISTENER = 'Registers a listener that will be called';

const storeMethod = (method: string, parameters = '', cast = '') =>
  `store.${method}(${parameters})${cast ? ` as ${cast}` : ''}`;
const fluentStoreMethod = (method: string, parameters = '') =>
  `fluent(() => ${storeMethod(method, parameters)})`;

const getRowTypeDoc = (tableId: Id, set = 0) =>
  `${REPRESENTS} a Row when ${
    set ? 's' : 'g'
  }etting ${THE_CONTENT_OF} the '${tableId}' Table`;
const getIdsDoc = (idsNoun: string, parentNoun: string, sorted = 0) =>
  `Gets ${
    sorted ? 'sorted, paginated' : 'the'
  } Ids of the ${idsNoun}s in ${parentNoun}`;
const getForEachDoc = (childNoun: string, parentNoun: string) =>
  `Calls a function for each ${childNoun} in ${parentNoun}`;
const getHasDoc = (childNoun: string, parentNoun = THE_STORE) =>
  `Gets whether ${childNoun} exists in ${parentNoun}`;
const getCallbackDoc = (takes: string) => `A function that takes ${takes}`;
const getListenerDoc = (
  childNoun: string,
  parentNoun: string,
  pluralChild = 0,
) =>
  `${REGISTERS_A_LISTENER} whenever ${childNoun} in ${parentNoun} change` +
  (pluralChild ? '' : 's');
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
  const storeType = camel(module, 1);
  const storeInstance = camel(storeType);
  const returnStore = `return ${storeInstance};`;

  const storeListener = (
    method: string,
    beforeParameters = '',
    afterParameters = '',
  ) =>
    `store.${method}(${
      beforeParameters ? `${beforeParameters}, ` : ''
    }proxy(listener)${afterParameters ? `, ${afterParameters}` : ''})`;

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

  addImport(
    0,
    'tinybase',
    'CellChange',
    'ChangedCells',
    'Id',
    'IdOrNull',
    'Ids',
    'InvalidCells',
    'Json',
    'Store',
  );
  addImport(
    1,
    'tinybase',
    'ChangedCells',
    'Id',
    'IdOrNull',
    'Ids',
    'InvalidCells',
    'Json',
    'Store',
    'createStore',
  );

  addFunction('fluent', 'actions: () => Store', ['actions();', returnStore]);
  addFunction(
    'proxy',
    `listener: any`,
    `(_: Store, ...args: any[]) => listener(${storeInstance}, ...args)`,
  );

  const TYPE2 = addConstant(snake(TYPE), `'${TYPE}'`);
  const DEFAULT2 = addConstant(snake(DEFAULT), `'${DEFAULT}'`);

  const tableTypes: IdMap<TableTypes> = mapNew();
  const mapTableSchema = <Return>(
    callback: (
      tableId: Id,
      tableTypes: TableTypes,
      tableName: string,
      TABLE_ID: string,
    ) => Return,
  ) =>
    objMap(schema, (_, tableId) => {
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
                      isUndefined(defaultValue) ? '?' : ''
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
              )}) => void`,
              getCallbackDoc(
                `a Cell Id and value from a Row in the '${tableId}' Table`,
              ),
            ),
            addType(
              `${table}RowCallback`,
              `(rowId: Id, forEachCell: (cellCallback: ${table}CellCallback) ` +
                `=> void) => void`,
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
    ) => Return,
  ) =>
    objMap(schema[tableId], (cellSchema, cellId) =>
      callback(
        cellId,
        cellSchema[TYPE],
        cellSchema[DEFAULT],
        addConstant(snake(cellId), `'${cellId}'`),
      ),
    );

  const tablesType = addType(
    'Tables',
    `{${join(
      mapTableSchema(
        (tableId, tableTypes) => `'${tableId}'?: ${tableTypes[0]};`,
      ),
      ' ',
    )}}`,
    `${REPRESENTS} ${THE_CONTENT_OF_THE_STORE}`,
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
          `forEachRow: (rowCallback: ${tableTypes[5]}) => void]`,
      ),
      ' | ',
    )}) => void`,
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
    'A function that returns information about any ' +
      `Cell's changes during a transaction`,
  );
  const tablesListenerType = addType(
    'TablesListener',
    `(${storeInstance}: ${storeType}, ` +
      `getCellChange: ${getCellChangeType} | undefined) => void`,
    `A function for listening to changes to ${THE_CONTENT_OF_THE_STORE}`,
  );
  const tableIdsListenerType = addType(
    'TableIdsListener',
    `(${storeInstance}: ${storeType}) => void`,
    `A function for listening to changes to Table Ids in ${THE_STORE}`,
  );
  const tableListenerType = addType(
    'TableListener',
    `(${storeInstance}: ${storeType}, tableId: ${tableIdType}, ` +
      `getCellChange: ${getCellChangeType} | undefined) => void`,
    `A function for listening to changes to a Table in ${THE_STORE}`,
  );
  const rowIdsListenerType = addType(
    'RowIdsListener',
    `(${storeInstance}: ${storeType}, tableId: ${tableIdType}) => void`,
    `A function for listening to changes to Row Ids in ${THE_STORE}`,
  );
  const rowListenerType = addType(
    'RowListener',
    `(${storeInstance}: ${storeType}, tableId: ${tableIdType}, rowId: Id, ` +
      `getCellChange: ${getCellChangeType} | undefined) => void`,
    `A function for listening to changes to a Row in ${THE_STORE}`,
  );
  const cellIdsListenerType = addType(
    'CellIdsListener',
    `(${storeInstance}: ${storeType}, tableId: ${tableIdType}, rowId: Id) ` +
      '=> void',
    `A function for listening to changes to Cell Ids in ${THE_STORE}`,
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
                `newCell: ${type} | undefined, ` +
                `oldCell: ${type} | undefined, ` +
                `getCellChange: ${getCellChangeType} ` +
                '| undefined]',
            ),
          ),
        ),
        ' | ',
      )}) => void`,
    `A function for listening to changes to a Cell in ${THE_STORE}`,
  );
  const invalidCellListenerType = addType(
    'InvalidCellListener',
    `(${storeInstance}: ${storeType}, tableId: Id, rowId: Id, cellId: Id, ` +
      'invalidCells: any[]) => void;',
    `A function for listening to invalid Cell changes`,
  );
  const transactionListenerType = addType(
    'TransactionListener',
    `(${storeInstance}: ${storeType}, cellsTouched: boolean) => void;`,
    `A function for listening to the completion of a transaction`,
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
    tableListenerType,
    rowIdsListenerType,
    rowListenerType,
    cellIdsListenerType,
    cellListenerType,
    invalidCellListenerType,
    transactionListenerType,
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
      const tableDoc = `the '${tableId}' Table`;
      const rowDoc = `${THE_SPECIFIED_ROW} in ${tableDoc}`;
      const getTableContentDoc = (verb = 0) =>
        `${getVerb(verb)} ${THE_CONTENT_OF} ${tableDoc}`;
      const getRowContentDoc = (verb = 0) =>
        `${getVerb(verb)} ${THE_CONTENT_OF} ${rowDoc}`;

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
        `has${tableName}Table`,
        '',
        BOOLEAN,
        storeMethod('hasTable', TABLE_ID),
        getHasDoc(tableDoc),
      );
      addMethod(
        `get${tableName}Table`,
        '',
        tableType,
        storeMethod('getTable', TABLE_ID, tableType),
        getTableContentDoc(),
      );
      addMethod(
        `set${tableName}Table`,
        `table: ${tableType}`,
        storeType,
        fluentStoreMethod('setTable', `${TABLE_ID}, table`),
        getTableContentDoc(1),
      );
      addMethod(
        `del${tableName}Table`,
        '',
        storeType,
        fluentStoreMethod('delTable', TABLE_ID),
        getTableContentDoc(3),
      );
      addMethod(
        `get${tableName}RowIds`,
        '',
        'Ids',
        storeMethod('getRowIds', TABLE_ID),
        getIdsDoc('Row', tableDoc),
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
        getIdsDoc('Row', tableDoc, 1),
      );
      addMethod(
        `forEach${tableName}Row`,
        `rowCallback: ${rowCallbackType}`,
        'void',
        storeMethod('forEachRow', `${TABLE_ID}, rowCallback as any`),
        getForEachDoc('Row', tableDoc),
      );

      addMethod(
        `has${tableName}Row`,
        'rowId: Id',
        BOOLEAN,
        storeMethod('hasRow', `${TABLE_ID}, rowId`),
        getHasDoc(THE_SPECIFIED_ROW, tableDoc),
      );
      addMethod(
        `get${tableName}Row`,
        'rowId: Id',
        rowType,
        storeMethod('getRow', `${TABLE_ID}, rowId`, rowType),
        getRowContentDoc(),
      );
      addMethod(
        `set${tableName}Row`,
        `rowId: Id, row: ${rowWhenSetType}`,
        storeType,
        fluentStoreMethod('setRow', `${TABLE_ID}, rowId, row`),
        getRowContentDoc(1),
      );
      addMethod(
        `add${tableName}Row`,
        `row: ${rowWhenSetType}`,
        'Id | undefined',
        storeMethod('addRow', `${TABLE_ID}, row`),
        `Adds a new Row to ${tableDoc}`,
      );
      addMethod(
        `set${tableName}PartialRow`,
        `rowId: Id, partialRow: ${rowWhenSetType}`,
        storeType,
        fluentStoreMethod('setPartialRow', `${TABLE_ID}, rowId, partialRow`),
        getRowContentDoc(2),
      );
      addMethod(
        `del${tableName}Row`,
        `rowId: Id`,
        storeType,
        fluentStoreMethod('delRow', `${TABLE_ID}, rowId`),
        getRowContentDoc(3),
      );
      addMethod(
        `get${tableName}CellIds`,
        'rowId: Id',
        `${cellIdType}[]`,
        storeMethod('getCellIds', `${TABLE_ID}, rowId`, `${cellIdType}[]`),
        getIdsDoc('Cell', rowDoc),
      );
      addMethod(
        `forEach${tableName}Cell`,
        `rowId: Id, cellCallback: ${cellCallbackType}`,
        'void',
        storeMethod('forEachCell', `${TABLE_ID}, rowId, cellCallback as any`),
        getForEachDoc('Cell', rowDoc),
      );

      mapCellSchema(tableId, (cellId, type, defaultValue, CELL_ID) => {
        const cell = camel(cellId, 1);
        const cellDoc = `the '${cellId}' Cell`;
        const getCellContentDoc = (verb = 0) =>
          `${getVerb(verb)} ${cellDoc} for ${rowDoc}`;

        const mapCellType = `Map${camel(type, 1)}`;
        mapSet(mapCellTypes, type, mapCellType);

        addMethod(
          `has${tableName}${cell}Cell`,
          'rowId: Id',
          BOOLEAN,
          storeMethod('hasCell', `${TABLE_ID}, rowId, ${CELL_ID}`),
          getHasDoc(cellDoc, rowDoc),
        );
        const returnCellType = `${type}${
          isUndefined(defaultValue) ? ' | undefined' : ''
        }`;
        addMethod(
          `get${tableName}${cell}Cell`,
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
          `set${tableName}${cell}Cell`,
          `rowId: Id, cell: ${type} | ${mapCellType}`,
          storeType,
          fluentStoreMethod(
            'setCell',
            `${TABLE_ID}, rowId, ${CELL_ID}, cell as any`,
          ),
          getCellContentDoc(1),
        );
        addMethod(
          `del${tableName}${cell}Cell`,
          `rowId: Id`,
          storeType,
          fluentStoreMethod('delCell', `${TABLE_ID}, rowId, ${CELL_ID}`),
          getCellContentDoc(3),
        );
      });
    },
  );

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
    storeListener('addTablesListener', '', 'mutator'),
    `${REGISTERS_A_LISTENER} whenever ${THE_CONTENT_OF_THE_STORE} changes`,
  );
  addMethod(
    'addTableIdsListener',
    `listener: ${tableIdsListenerType}, mutator?: boolean`,
    'Id',
    storeListener('addTableIdsListener', '', 'mutator'),
    getListenerDoc('the Table Ids', THE_STORE, 1),
  );
  addMethod(
    'addTableListener',
    `tableId: ${tableIdType} | null, listener: ${tableListenerType}, ` +
      'mutator?: boolean',
    'Id',
    storeListener('addTableListener', 'tableId', 'mutator'),
    getListenerDoc('a Table', THE_STORE),
  );
  addMethod(
    'addRowIdsListener',
    `tableId: ${tableIdType} | null, listener: ${rowIdsListenerType}, ` +
      'mutator?: boolean',
    'Id',
    storeListener('addRowIdsListener', 'tableId', 'mutator'),
    getListenerDoc('the Row Ids', 'a Table', 1),
  );
  addMethod(
    'addRowListener',
    `tableId: ${tableIdType} | null, rowId: IdOrNull, ` +
      `listener: ${rowListenerType}, mutator?: boolean`,
    'Id',
    storeListener('addRowListener', 'tableId, rowId', 'mutator'),
    getListenerDoc('a Row', 'a Table'),
  );
  addMethod(
    'addCellIdsListener',
    `tableId: ${tableIdType} | null, rowId: IdOrNull, ` +
      `listener: ${cellIdsListenerType}, mutator?: boolean`,
    'Id',
    storeListener('addCellIdsListener', 'tableId, rowId', 'mutator'),
    getListenerDoc('the Cell Ids', 'a Row', 1),
  );
  addMethod(
    'addCellListener',
    `tableId: ${tableIdType} | null, rowId: IdOrNull, cellId: ${join(
      mapTableSchema((_, tableTypes) => tableTypes[3]),
      ' | ',
    )} | null, listener: ${cellListenerType}, mutator?: boolean`,
    'Id',
    storeListener('addCellListener', 'tableId, rowId, cellId', 'mutator'),
    getListenerDoc('a Cell', 'a Row'),
  );
  addMethod(
    'addInvalidCellListener',
    'tableId: IdOrNull, rowId: IdOrNull, cellId: IdOrNull, listener: ' +
      `${invalidCellListenerType}, mutator?: boolean`,
    'Id',
    storeListener('addCellListener', 'tableId, rowId, cellId', 'mutator'),
    `${REGISTERS_A_LISTENER} whenever an invalid Cell change was attempted`,
  );
  addMethod(
    'addWillFinishTransactionListener',
    `listener: ${transactionListenerType}`,
    'Id',
    storeListener('addWillFinishTransactionListener'),
    `${REGISTERS_A_LISTENER} just before the end of the transaction`,
  );
  addMethod(
    'addDidFinishTransactionListener',
    `listener: ${transactionListenerType}`,
    'Id',
    storeListener('addDidFinishTransactionListener'),
    `${REGISTERS_A_LISTENER} just after the end of the transaction`,
  );

  addMethod(
    'callListener',
    'listenerId: Id',
    storeType,
    fluentStoreMethod('callListener', 'listenerId'),
    'Manually provoke a listener to be called',
  );
  addMethod(
    'delListener',
    'listenerId: Id',
    storeType,
    fluentStoreMethod('delListener', 'listenerId'),
    `Remove a listener that was previously added to ${THE_STORE}`,
  );

  addMethod(
    'getStore',
    '',
    'Store',
    'store',
    'Gets the underlying Store object',
  );

  mapForEach(mapCellTypes, (type, mapCellType) =>
    addType(
      mapCellType,
      `(cell: ${type} | undefined) => ${type}`,
      `Takes a ${type} Cell value and returns another`,
    ),
  );

  addImport(1, `./${moduleName}.d`, ...collValues(mapCellTypes));

  addConstant('store', [
    'createStore().setSchema({',
    flat(
      mapTableSchema((tableId, _, __, TABLE_ID) => [
        `[${TABLE_ID}]: {`,
        ...mapCellSchema(
          tableId,
          (_, type, defaultValue, CELL_ID) =>
            `[${CELL_ID}]: {[${TYPE2}]: ${addConstant(
              snake(type),
              `'${type}'`,
            )}${
              isUndefined(defaultValue)
                ? ''
                : `, [${DEFAULT2}]: ${
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
