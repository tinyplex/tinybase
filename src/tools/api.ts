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
    addMethod,
    addFunction,
    addConstant,
    getImports,
    getTypes,
    getMethods,
    getConstants,
  ] = getCodeFunctions();

  addImport(0, 'tinybase', 'Id', 'Store');
  addImport(
    1,
    'tinybase',
    'Cell',
    'Id',
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

  addFunction('getTable', 'tableId: Id', 'store.getTable(tableId) as any');
  addFunction('setTable', 'tableId: Id, table: Table', [
    'store.setTable(tableId, table);',
    `return ${storeInstance};`,
  ]);
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

    const tableType = addType(
      `${table}Table`,
      `{[rowId: Id]: ${table}Row}`,
      `${REPRESENTS} ${tableDoc}`,
    );
    const rowType = addType(
      `${table}Row`,
      `{${join(getCellsTypes, ' ')}}`,
      getRowTypeDoc(),
    );
    const rowWhenSetType = addType(
      `${table}RowWhenSet`,
      `{${join(setCellsTypes, ' ')}}`,
      getRowTypeDoc(1),
    );
    addImport(1, `./${moduleName}.d`, tableType, rowType, rowWhenSetType);

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

    arrayPush(tablesTypes, `'${tableId}'?: ${tableType};`);
  });

  const tablesType = addType(
    `${storeType}Tables`,
    `{${join(tablesTypes, ' ')}}`,
    `${REPRESENTS} ${THE_CONTENT_OF_THE_STORE}`,
  );
  addImport(1, `./${moduleName}.d`, tablesType);

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
