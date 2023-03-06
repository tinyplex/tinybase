import {EMPTY_STRING, TABLES, VALUES} from '../../common/strings';
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
import {WHEN_SET, getTheContentOfTheStoreDoc} from '../common/strings';
import {Id} from '../../common.d';
import {getSchemaFunctions} from '../common/schema';
import {isUndefined} from '../../common/other';
import {objIsEmpty} from '../../common/obj';

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

  const [mapTablesSchema, mapCellSchema, mapValuesSchema] = getSchemaFunctions(
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

  if (!objIsEmpty(tablesSchema)) {
    // Tables
    const tablesType = addType(
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
    const tablesWhenSetType = addType(
      TABLES + WHEN_SET,
      '{' +
        join(
          mapTablesSchema(
            (tableId) =>
              `'${tableId}': {[rowId: Id]: {` +
              join(
                mapCellSchema(
                  tableId,
                  (cellId, type) => `'${cellId}'?: ${type}`,
                ),
                '; ',
              ) +
              '}}',
          ),
          '; ',
        ) +
        '}',
      getTheContentOfTheStoreDoc(1, 5, 1),
    );

    addMethod('getTables', '', tablesType, getTheContentOfTheStoreDoc(1, 0));

    addMethod(
      'setTables',
      'tables: ' + tablesWhenSetType,
      'Store',
      getTheContentOfTheStoreDoc(1, 2),
    );
  }

  if (!objIsEmpty(valuesSchema)) {
    // Values
    const valuesType = addType(
      VALUES,
      '{' +
        join(
          mapValuesSchema(
            (valueId, type, defaultValue) =>
              `'${valueId}'${
                isUndefined(defaultValue) ? '?' : EMPTY_STRING
              }: ${type};`,
          ),
          ' ',
        ) +
        '}',
      getTheContentOfTheStoreDoc(2, 5),
    );

    // ValuesWhenSet
    const valuesWhenSetType = addType(
      VALUES + WHEN_SET,
      '{' +
        join(
          mapValuesSchema((valueId, type) => `'${valueId}'?: ${type};`),
          ' ',
        ) +
        '}',
      getTheContentOfTheStoreDoc(2, 5, 1),
    );

    addMethod('getValues', '', valuesType, getTheContentOfTheStoreDoc(2, 0));

    addMethod(
      'setValues',
      'values: ' + valuesWhenSetType,
      'Store',
      getTheContentOfTheStoreDoc(2, 2),
    );
  }

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
