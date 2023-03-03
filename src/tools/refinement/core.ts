import {EMPTY_STRING, TABLES} from '../../common/strings';
import {IdMap, mapMap, mapNew} from '../../common/map';
import {
  LINE,
  LINE_TREE,
  comment,
  getCodeFunctions,
  join,
  mapUnique,
} from '../common/code';
import {TablesSchema, ValuesSchema} from '../../store.d';
import {
  WHEN_SET,
  WHEN_SETTING_IT,
  getTheContentOfTheStoreDoc,
} from '../common/strings';
import {Id} from '../../common.d';
import {getSchemaFunctions} from '../common/schema';
import {isUndefined} from '../../common/other';

export const getStoreCoreRefinement = (
  tablesSchema: TablesSchema,
  valuesSchema: ValuesSchema,
  _module: string,
): [string] => {
  const [
    build,
    addImport,
    addType,
    _addInternalFunction,
    _addConstant,
    getImports,
    getTypes,
    _getConstants,
  ] = getCodeFunctions();

  const [mapTablesSchema, mapCellSchema] = getSchemaFunctions(
    tablesSchema,
    valuesSchema,
    () => '',
  );

  const methods: IdMap<
    [parameters: LINE, returnType: string, doc: string, generic: string]
  > = mapNew();

  const getMethods = (): LINE_TREE =>
    mapMap(methods, ([parameters, returnType, doc, generic], name) => [
      comment(doc),
      name + generic + `(${parameters}): ${returnType};`,
      EMPTY_STRING,
    ]);

  const addMethod = (
    name: Id,
    parameters: LINE,
    returnType: string,
    doc: string,
    generic = EMPTY_STRING,
  ): Id => mapUnique(methods, name, [parameters, returnType, doc, generic]);

  addImport(0, 'tinybase', 'Id', 'Store as StoreCore');

  // Tables
  addType(
    TABLES,
    '{' +
      join(
        mapTablesSchema(
          (tableId) =>
            `'${tableId}': {[rowId: Id]: {` +
            join(
              mapCellSchema(
                tableId,
                (cellId, type, defaultValue) =>
                  `'${cellId}'${
                    isUndefined(defaultValue) ? '?' : EMPTY_STRING
                  }: ${type}`,
              ),
              '; ',
            ) +
            '}}',
        ),
        '; ',
      ) +
      '}',
    getTheContentOfTheStoreDoc(1, 5),
  );

  // TablesWhenSet
  addType(
    TABLES + WHEN_SET,
    '{' +
      join(
        mapTablesSchema(
          (tableId) =>
            `'${tableId}': {[rowId: Id]: {` +
            join(
              mapCellSchema(tableId, (cellId, type) => `'${cellId}'?: ${type}`),
              '; ',
            ) +
            '}}',
        ),
        '; ',
      ) +
      '}',
    getTheContentOfTheStoreDoc(1, 5) + WHEN_SETTING_IT,
  );

  addMethod(
    'setTables',
    'tables: ' + TABLES + WHEN_SET,
    'Store',
    'Set the tables',
  );

  return [
    build(
      `export * from 'tinybase';`,
      ...getImports(0),
      ...getTypes(),
      'interface Refined {',
      ...getMethods(),
      '}',
      EMPTY_STRING,
      'export type Store = Omit<StoreCore, keyof Refined> & Refined;',
      EMPTY_STRING,
      comment(`Creates a Store object`),
      'export function createStore(): Store',
    ),
  ];
};
