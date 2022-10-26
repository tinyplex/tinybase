import {DEFAULT, TYPE} from '../common/strings';
import {camel, getCodeFunctions, join} from './code';
import {objForEach, objHas, objIsEmpty} from '../common/obj';
import {Schema} from '../store.d';
import {arrayPush} from '../common/array';
import {pairNew} from '../common/pairs';

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
    'createStore',
  );
  addImport(
    1,
    `./${moduleName}.d`,
    storeType,
    `create${storeType} as create${storeType}Decl`,
  );

  addMethod('getStore', '', 'Store', 'store');
  addConstant('store', 'createStore();');

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

  const tablesTypes: string[] = [];
  objForEach(schema, (cellSchemas, tableId) => {
    const table = camel(tableId, true);
    arrayPush(tablesTypes, `${tableId}: ${table}Table;`);

    addMethod(
      `get${table}Table`,
      '',
      `${table}Table`,
      `getTable('${tableId}')`,
    );
    addMethod(
      `set${table}Table`,
      `table: ${table}Table`,
      storeType,
      `setTable('${tableId}', table)`,
    );
    addMethod(
      `get${table}Row`,
      'id: Id',
      `${table}Row`,
      `getRow('${tableId}', id)`,
    );
    addMethod(
      `set${table}Row`,
      `id: Id, row: ${table}RowWhenSet`,
      storeType,
      `setRow('${tableId}', id, row)`,
    );

    const getCellsTypes: string[] = [];
    const setCellsTypes: string[] = [];
    objForEach(cellSchemas, (cellSchema, cellId) => {
      const cell = camel(cellId, true);
      const defaulted = objHas(cellSchema, DEFAULT);
      arrayPush(
        getCellsTypes,
        `${cellId}${defaulted ? '' : '?'}: ${cellSchema[TYPE]};`,
      );
      arrayPush(setCellsTypes, `${cellId}?: ${cellSchema[TYPE]};`);
      addMethod(
        `get${table}${cell}Cell`,
        'id: Id',
        `${cellSchema[TYPE]}${defaulted ? '' : ' | undefined'}`,
        `getCell('${tableId}', id, '${cellId}')`,
      );
      addMethod(
        `set${table}${cell}Cell`,
        `id: Id, cell: ${cellSchema[TYPE]}`,
        storeType,
        `setCell('${tableId}', id, '${cellId}', cell)`,
      );
    });

    addType(`${table}Row`, `{${join(getCellsTypes, ' ')}}`);
    addType(`${table}RowWhenSet`, `{${join(setCellsTypes, ' ')}}`);
    addType(`${table}Table`, `{[rowId: Id]: ${table}Row}`);

    addImport(
      1,
      `./${moduleName}.d`,
      `${table}Table`,
      `${table}Row`,
      `${table}RowWhenSet`,
    );
  });

  addType(`${storeType}Tables`, `{${join(tablesTypes, ' ')}}`);

  addConstant(storeInstance, getMethods(1));

  return [
    build(
      ...getImports(0),
      ...getTypes(),
      `export interface ${storeType} {`,
      ...getMethods(0),
      `}`,
      '',
      `export function create${storeType}(): ${storeType};`,
    ),
    build(
      ...getImports(1),
      `export const create${storeType}: ` +
        `typeof create${storeType}Decl = () => {`,
      ...getConstants(),
      '',
      `return Object.freeze(${storeInstance});`,
      `};`,
    ),
  ];
};
