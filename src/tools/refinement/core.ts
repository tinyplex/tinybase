import {
  BOOLEAN,
  EMPTY_STRING,
  TABLE,
  TABLES,
  TABLE_IDS,
} from '../../common/strings';
import {IdMap, mapMap, mapNew} from '../../common/map';
import {
  LINE,
  LINE_TREE,
  comment,
  getCodeFunctions,
  mapUnique,
} from '../common/code';
import {
  METHOD_PREFIX_VERBS,
  SQUARE_BRACKETS,
  STORE,
  THE_STORE,
  VOID,
  getContentDoc,
  getIdsDoc,
  getTheContentOfTheStoreDoc,
} from '../common/strings';
import {TablesSchema, ValuesSchema} from '../../store.d';
import {Id} from '../../common.d';
import {arrayForEach} from '../../common/array';
import {getSchemaFunctions} from '../common/schema';
import {getTypeFunctions} from '../api/types';
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

  const [getTablesTypes, getValuesTypes] = getTypeFunctions(
    addType,
    mapTablesSchema,
    mapCellSchema,
    mapValuesSchema,
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

  addImport(
    0,
    'tinybase',
    'Id',
    'Store as StoreCore',
    'CellChange',
    'ValueChange',
  );

  if (!objIsEmpty(tablesSchema)) {
    // Tables, TablesWhenSet
    const [
      tablesType,
      tablesWhenSetType,
      tableIdType,
      tableType,
      tableWhenSetType,
      _rowType,
      _rowWhenSetType,
      _cellIdType,
      _cellType,
      _cellCallbackType,
      _rowCallbackType,
      tableCallbackType,
      _getCellChangeType,
    ] = getTablesTypes();

    // getTables, hasTables, setTables, delTables
    arrayForEach(
      [
        [tablesType],
        [BOOLEAN],
        [STORE, 'tables: ' + tablesWhenSetType],
        [STORE],
      ],
      ([returnType, params], verb) =>
        addMethod(
          METHOD_PREFIX_VERBS[verb] + TABLES,
          params ?? EMPTY_STRING,
          returnType,
          getTheContentOfTheStoreDoc(1, verb),
        ),
    );

    // getTableIds
    addMethod(
      METHOD_PREFIX_VERBS[0] + TABLE_IDS,
      EMPTY_STRING,
      tableIdType + SQUARE_BRACKETS,
      getIdsDoc(TABLE, THE_STORE),
    );

    // getTable, hasTable, setTable, delTable
    const tableIdParam = 'tableId: ' + tableIdType;
    const tIdParam = 'tableId: TId';
    const tIdGeneric = `<TId extends ${tableIdType}>`;
    arrayForEach(
      [
        [tableType + '<TId>', tIdParam, tIdGeneric],
        [BOOLEAN, tableIdParam],
        [STORE, tIdParam + `, table: ${tableWhenSetType}<TId>`, tIdGeneric],
        [STORE, tableIdParam],
      ],
      ([returnType, params, generic], verb) =>
        addMethod(
          METHOD_PREFIX_VERBS[verb] + TABLE,
          params ?? EMPTY_STRING,
          returnType,
          getContentDoc(verb, 3),
          generic,
        ),
    );

    // forEachTable
    addMethod(
      METHOD_PREFIX_VERBS[5] + TABLE,
      'tableCallback: ' + tableCallbackType,
      VOID,
      getContentDoc(5, 3),
    );
  }

  if (!objIsEmpty(valuesSchema)) {
    // Values, ValuesWhenSet
    const [valuesType, valuesWhenSetType] = getValuesTypes();

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
      'export type Todo = Omit<StoreCore, keyof Refined>;',
      'export type Store = Todo & Refined;',
      EMPTY_STRING,
      comment(`Creates a Store object`),
      'export function createStore(): Store',
    ),
  ];
};
