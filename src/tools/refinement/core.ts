import {BOOLEAN, EMPTY_STRING, TABLES} from '../../common/strings';
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
  STORE,
  getTheContentOfTheStoreDoc,
} from '../common/strings';
import {TablesSchema, ValuesSchema} from '../../store.d';
import {getTablesTypes, getValuesType as getValuesTypes} from '../api/types';
import {Id} from '../../common.d';
import {arrayForEach} from '../../common/array';
import {getSchemaFunctions} from '../common/schema';
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
    // Tables, TablesWhenSet
    const [tablesType, tablesWhenSetType] = getTablesTypes(
      addType,
      mapTablesSchema,
      mapCellSchema,
    );

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
  }

  if (!objIsEmpty(valuesSchema)) {
    // Values, ValuesWhenSet
    const [valuesType, valuesWhenSetType] = getValuesTypes(
      addType,
      mapValuesSchema,
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
