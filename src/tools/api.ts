import {DEFAULT, TYPE} from '../common/strings';
import {arrayMap, arrayPush} from '../common/array';
import {camel, getCodeFunctions, join} from './code';
import {objForEach, objHas, objIds, objIsEmpty} from '../common/obj';
import {Schema} from '../store.d';
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
  addImport(1, 'tinybase', 'Id', 'Row', 'Store', 'Table', 'createStore');
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

  const tablesTypes: string[] = [];
  objForEach(schema, (cellSchemas, tableId) => {
    const table = camel(tableId, true);
    arrayPush(tablesTypes, `${tableId}: ${table}Table;`);

    addType(`${table}Table`, `{[rowId: Id]: ${table}Row}`);
    addType(
      `${table}Row`,
      `{${join(
        arrayMap(
          objIds(cellSchemas),
          (cellId) =>
            `${cellId}${objHas(cellSchemas[cellId], DEFAULT) ? '' : '?'}: ${
              cellSchemas[cellId][TYPE]
            };`,
        ),
        ' ',
      )}}`,
    );

    addImport(1, `./${moduleName}.d`, `${table}Table`, `${table}Row`);

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
      `id: Id, row: ${table}Row`,
      storeType,
      `setRow('${tableId}', id, row)`,
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
