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
    'createStore',
  );
  addImport(
    1,
    `./${moduleName}.d`,
    storeType,
    `create${storeType} as create${storeType}Decl`,
  );

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

  addMethod('getStore', '', 'Store', 'store');

  objForEach(schema, (cellSchemas, tableId) => {
    const table = camel(tableId, true);
    const getCellsTypes: string[] = [];
    const setCellsTypes: string[] = [];

    arrayPush(schemaLines, `'${tableId}': {`);
    objForEach(cellSchemas, (cellSchema, cellId) => {
      const cell = camel(cellId, true);
      const type = cellSchema[TYPE];
      const defaulted = objHas(cellSchema, DEFAULT);
      const defaultValue = cellSchema[DEFAULT];
      arrayPush(
        schemaLines,
        `'${cellId}': {type: '${type}'${
          defaulted
            ? `, default: ${
                type == 'string' ? `'${defaultValue}'` : defaultValue
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
        `getCell('${tableId}', id, '${cellId}')`,
      );
      addMethod(
        `set${table}${cell}Cell`,
        `id: Id, cell: ${type}`,
        storeType,
        `setCell('${tableId}', id, '${cellId}', cell)`,
      );
    });
    arrayPush(schemaLines, `},`);

    const tableType = addType(`${table}Table`, `{[rowId: Id]: ${table}Row}`);
    const rowType = addType(`${table}Row`, `{${join(getCellsTypes, ' ')}}`);
    const rowWhenSetType = addType(
      `${table}RowWhenSet`,
      `{${join(setCellsTypes, ' ')}}`,
    );

    addMethod(`get${table}Row`, 'id: Id', rowType, `getRow('${tableId}', id)`);
    addMethod(
      `set${table}Row`,
      `id: Id, row: ${rowWhenSetType}`,
      storeType,
      `setRow('${tableId}', id, row)`,
    );
    addMethod(`get${table}Table`, '', tableType, `getTable('${tableId}')`);
    addMethod(
      `set${table}Table`,
      `table: ${tableType}`,
      storeType,
      `setTable('${tableId}', table)`,
    );

    arrayPush(tablesTypes, `'${tableId}': ${tableType};`);

    addImport(1, `./${moduleName}.d`, tableType, rowType, rowWhenSetType);
  });

  addType(`${storeType}Tables`, `{${join(tablesTypes, ' ')}}`);

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
