import {DEFAULT, TYPE} from '../common/strings';
import {camel, comment, getCodeFunctions, join, snake} from './code';
import {objForEach, objHas, objIsEmpty} from '../common/obj';
import {Schema} from '../store.d';
import {arrayPush} from '../common/array';
import {isString} from '../common/other';
import {pairNew} from '../common/pairs';

const REPRESENTS = 'Represents';
const THE_CONTENT_OF = 'the content of';
const THE_CONTENT_OF_THE_STORE = `${THE_CONTENT_OF} the whole Store`;

const getIdsDoc = (idsNoun: string, parentNoun: string, sorted = 0) =>
  `Gets ${
    sorted ? 'sorted, paginated' : 'the'
  } Ids of the ${idsNoun}s in ${parentNoun}`;

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

  const tablesTypes: string[] = [];
  const schemaLines: string[] = [];

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

  addImport(0, 'tinybase', 'Id', 'Ids', 'Store');
  addImport(
    1,
    'tinybase',
    'Cell',
    'Id',
    'Ids',
    'Row',
    'Store',
    'Table',
    'Tables',
    'createStore',
  );
  addImport(
    1,
    `./${moduleName}.d`,
    storeType,
    `create${storeType} as create${storeType}Decl`,
  );

  addFunction('getTables', '', 'store.getTables() as any');
  addFunction('setTables', 'tables: Tables', [
    'store.setTables(tables);',
    `return ${storeInstance};`,
  ]);
  addFunction('getTableIds', '', 'store.getTableIds()');

  addFunction('getTable', 'tableId: Id', 'store.getTable(tableId) as any');
  addFunction('setTable', 'tableId: Id, table: Table', [
    'store.setTable(tableId, table);',
    `return ${storeInstance};`,
  ]);
  addFunction('getRowIds', 'tableId: Id', 'store.getRowIds(tableId)');
  addFunction(
    'getSortedRowIds',
    'tableId: Id, ...args: any[]',
    'store.getSortedRowIds(tableId, ...args)',
  );

  addFunction(
    'getRow',
    'tableId: Id, rowId: Id',
    'store.getRow(tableId, rowId) as any',
  );
  addFunction('setRow', 'tableId: Id, rowId: Id, row: Row', [
    'store.setRow(tableId, rowId, row);',
    `return ${storeInstance};`,
  ]);
  addFunction(
    'getCellIds',
    'tableId: Id, rowId: Id',
    'store.getCellIds(tableId, rowId)',
  );

  addFunction(
    'getCell',
    'tableId: Id, rowId: Id, cellId: Id',
    'store.getCell(tableId, rowId, cellId) as any',
  );
  addFunction('setCell', 'tableId: Id, rowId: Id, cellId: Id, cell: Cell', [
    'store.setCell(tableId, rowId, cellId, cell);',
    `return ${storeInstance};`,
  ]);

  addMethod(
    'getStore',
    '',
    'Store',
    'store',
    'Gets the underlying Store object',
  );

  const TYPE2 = addConstant(snake(TYPE), `'${TYPE}'`);
  const DEFAULT2 = addConstant(snake(DEFAULT), `'${DEFAULT}'`);

  const tablesType = addType(`${storeType}Tables`);

  addMethod(
    `getTables`,
    '',
    tablesType,
    'getTables()',
    `Gets ${THE_CONTENT_OF_THE_STORE}`,
  );
  addMethod(
    `setTables`,
    `tables: ${tablesType}`,
    storeType,
    'setTables(tables)',
    `Sets ${THE_CONTENT_OF_THE_STORE}`,
  );
  addMethod(
    `getTableIds`,
    '',
    'Ids',
    'getTableIds()',
    getIdsDoc('Table', 'the Store'),
  );

  objForEach(schema, (cellSchemas, tableId) => {
    const table = camel(tableId, true);
    const TABLE_ID = addConstant(snake(tableId), `'${tableId}'`);

    const getCellsTypes: string[] = [];
    const setCellsTypes: string[] = [];

    const tableDoc = `the '${tableId}' Table`;
    const rowDoc = `the specified Row in ${tableDoc}`;
    const tableContentDoc = `${THE_CONTENT_OF} ${tableDoc}`;
    const getRowContentDoc = (set = 0) =>
      `${set ? 'S' : 'G'}ets ${THE_CONTENT_OF} ${rowDoc}`;
    const getRowTypeDoc = (set = 0) =>
      `${REPRESENTS} a Row when ${set ? 's' : 'g'}etting ${tableContentDoc}`;

    const tableType = addType(
      `${table}Table`,
      `{[rowId: Id]: ${table}Row}`,
      `${REPRESENTS} ${tableDoc}`,
    );
    const rowType = addType(`${table}Row`);
    const rowWhenSetType = addType(`${table}RowWhenSet`);

    addImport(1, `./${moduleName}.d`, tableType, rowType, rowWhenSetType);

    addMethod(
      `get${table}Table`,
      '',
      tableType,
      `getTable(${TABLE_ID})`,
      `Gets ${tableContentDoc}`,
    );
    addMethod(
      `set${table}Table`,
      `table: ${tableType}`,
      storeType,
      `setTable(${TABLE_ID}, table)`,
      `Sets ${tableContentDoc}`,
    );
    addMethod(
      `get${table}RowIds`,
      '',
      'Ids',
      `getRowIds(${TABLE_ID})`,
      getIdsDoc('Row', tableDoc),
    );
    addMethod(
      `get${table}SortedRowIds`,
      'cellId?: Id, descending?: boolean, offset?: number, limit?: number',
      'Ids',
      `getSortedRowIds(${TABLE_ID}, cellId, descending, offset, limit)`,
      getIdsDoc('Row', tableDoc, 1),
    );

    addMethod(
      `get${table}Row`,
      'id: Id',
      rowType,
      `getRow(${TABLE_ID}, id)`,
      getRowContentDoc(),
    );
    addMethod(
      `set${table}Row`,
      `id: Id, row: ${rowWhenSetType}`,
      storeType,
      `setRow(${TABLE_ID}, id, row)`,
      getRowContentDoc(1),
    );
    addMethod(
      `get${table}CellIds`,
      'id: Id',
      'Ids',
      `getCellIds(${TABLE_ID}, id)`,
      getIdsDoc('Cell', rowDoc),
    );

    arrayPush(schemaLines, `[${TABLE_ID}]: {`);
    objForEach(cellSchemas, (cellSchema, cellId) => {
      const cell = camel(cellId, true);
      const CELL_ID = addConstant(snake(cellId), `'${cellId}'`);
      const type = cellSchema[TYPE];
      const defaulted = objHas(cellSchema, DEFAULT);
      const defaultValue = cellSchema[DEFAULT];
      const cellDoc = `the '${cellId}' Cell for ${rowDoc}`;

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
      addMethod(
        `get${table}${cell}Cell`,
        'id: Id',
        `${type}${defaulted ? '' : ' | undefined'}`,
        `getCell(${TABLE_ID}, id, ${CELL_ID})`,
        `Gets ${cellDoc}`,
      );
      addMethod(
        `set${table}${cell}Cell`,
        `id: Id, cell: ${type}`,
        storeType,
        `setCell(${TABLE_ID}, id, ${CELL_ID}, cell)`,
        `Sets ${cellDoc}`,
      );
    });
    arrayPush(schemaLines, `},`);
    arrayPush(tablesTypes, `'${tableId}'?: ${tableType};`);

    updateType(`${table}Row`, `{${join(getCellsTypes, ' ')}}`, getRowTypeDoc());
    updateType(
      `${table}RowWhenSet`,
      `{${join(setCellsTypes, ' ')}}`,
      getRowTypeDoc(1),
    );
  });

  updateType(
    tablesType,
    `{${join(tablesTypes, ' ')}}`,
    `${REPRESENTS} ${THE_CONTENT_OF_THE_STORE}`,
  );
  addImport(1, `./${moduleName}.d`, tablesType);

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
