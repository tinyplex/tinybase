import {
  A,
  CALLBACK,
  DO_ACTIONS_AND_ROLLBACK_PARAMS,
  DO_ROLLBACK_PARAM,
  FINISH_TRANSACTION_DOC,
  ID,
  ID_OR_NULL,
  INVALID,
  JSON,
  LISTENER_,
  METHOD_PREFIX_VERBS,
  OR_UNDEFINED,
  PARTIAL,
  REGISTERS_A_LISTENER,
  ROW_ID_OR_NULL_PARAM,
  ROW_ID_PARAM,
  SCHEMA,
  SORTED_ARGS,
  SQUARE_BRACKETS,
  START_TRANSACTION_DOC,
  STORE,
  THE_END_OF_THE_TRANSACTION,
  THE_STORE,
  TRANSACTION,
  TRANSACTION_,
  TRANSACTION_DOC,
  VOID,
  getContentDoc,
  getForEachDoc,
  getIdsDoc,
  getListenerDoc,
  getTheContentOfTheStoreDoc,
} from '../common/strings';
import {
  ADD,
  BOOLEAN,
  CELL,
  CELL_IDS,
  EMPTY_STRING,
  GET,
  IDS,
  LISTENER,
  ROW,
  ROW_IDS,
  SORTED_ROW_IDS,
  TABLE,
  TABLES,
  TABLE_IDS,
  VALUE,
  VALUES,
  VALUE_IDS,
} from '../../common/strings';
import {IdMap, mapMap, mapNew} from '../../common/map';
import {
  LINE,
  LINES,
  LINE_TREE,
  comment,
  getCodeFunctions,
  getParameterList,
  join,
  mapUnique,
} from '../common/code';
import {TablesSchema, ValuesSchema} from '../../store.d';
import {arrayForEach, arrayPush} from '../../common/array';
import {Id} from '../../common.d';
import {getSchemaFunctions} from '../common/schema';
import {getTypeFunctions} from '../api/types';
import {isArray} from '../../common/other';
import {objIsEmpty} from '../../common/obj';

const MAY_CONTRADICT_REFINEMENT =
  '. Note that this may contradict the generated type refinements';

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
  ] = getCodeFunctions();

  const [mapTablesSchema, mapCellSchema, mapValuesSchema] = getSchemaFunctions(
    tablesSchema,
    valuesSchema,
    () => EMPTY_STRING,
  );

  const [getTablesTypes, getValuesTypes, getTransactionListenerType] =
    getTypeFunctions(addType, mapTablesSchema, mapCellSchema, mapValuesSchema);

  const methods: IdMap<
    [parameters: LINES, returnType: string, doc: string, generic: string]
  > = mapNew();

  const getMethods = (): LINE_TREE =>
    mapMap(methods, ([parameters, returnType, doc, generic], name) => [
      comment(doc),
      name + generic + `(${getParameterList(...parameters)}): ${returnType};`,
      EMPTY_STRING,
    ]);

  const addMethod = (
    name: Id,
    parameters: LINE | LINES,
    returnType: string,
    doc: string,
    generic = EMPTY_STRING,
  ): Id =>
    mapUnique(methods, name, [
      isArray(parameters) ? parameters : [parameters],
      returnType,
      doc,
      generic,
    ]);

  addImport(
    0,
    'tinybase',
    ID,
    IDS,
    ID_OR_NULL,
    'StoreListenerStats',
    JSON,
    TABLES + SCHEMA,
    VALUES + SCHEMA,
    'DoRollback',
  );

  let tablesTypes: string[];

  if (objIsEmpty(tablesSchema)) {
    tablesTypes = [
      TABLES,
      TABLES,
      ID,
      TABLE,
      TABLE,
      ROW,
      ROW,
      ID,
      CELL,
      CELL + CALLBACK,
      ROW + CALLBACK,
      TABLE + CALLBACK,
      TABLES + LISTENER,
      TABLE_IDS + LISTENER,
      TABLE + LISTENER,
      ROW_IDS + LISTENER,
      SORTED_ROW_IDS + LISTENER,
      ROW + LISTENER,
      CELL_IDS + LISTENER,
      CELL + LISTENER,
      INVALID + CELL + LISTENER,
    ];
    addImport(0, 'tinybase', ...tablesTypes);
    arrayPush(tablesTypes, ID, ID_OR_NULL, ID, EMPTY_STRING, ID, EMPTY_STRING);
  } else {
    addImport(0, 'tinybase', 'CellChange');
    tablesTypes = getTablesTypes('store', STORE);
    arrayForEach([3, 4, 5, 6, 7, 9, 10], (i) => (tablesTypes[i] += '<TId>'));
    tablesTypes[8] += '<TId, CId>';
    arrayPush(
      tablesTypes,
      'TId',
      'TId | null',
      join(
        mapTablesSchema((tableId) => `CellId<'${tableId}'>`),
        ' | ',
      ),
      `<TId extends ${tablesTypes[2]}>`,
      'CId',
      `<TId extends ${tablesTypes[2]}, CId extends ${tablesTypes[7]}>`,
    );
  }

  // Tables, TablesWhenSet, TableId,
  // Table<>, TableWhenSet<>, Row<>, RowWhenSet<>, CellId<>, Cell<>,
  // CellCallback, RowCallback, TableCallback,
  // TablesListener, TableIdsListener, TableListener, RowIdsListener,
  // SortedRowIdsListener, RowListener, CellIdsListener
  const [
    tablesType,
    tablesWhenSetType,
    tableIdType,
    tableType,
    tableWhenSetType,
    rowType,
    rowWhenSetType,
    cellIdType,
    cellType,
    cellCallbackType,
    rowCallbackType,
    tableCallbackType,
    tablesListenerType,
    tableIdsListenerType,
    tableListenerType,
    rowIdsListenerType,
    sortedRowIdsListenerType,
    rowListenerType,
    cellIdsListenerType,
    cellListenerType,
    invalidCellListenerType,
    tableId,
    tableIdOrNull,
    allCellIdsType,
    tIdGeneric,
    cId,
    cIdGeneric,
  ] = tablesTypes;

  const tableIdParam = 'tableId: ' + tableId;
  const rowIdParams = getParameterList(tableIdParam, ROW_ID_PARAM);
  const cellIdParams = getParameterList(rowIdParams, 'cellId: ' + cId);

  const tableIdOrNullParam = 'tableId: ' + tableIdOrNull;
  const rowIdOrNullParams = getParameterList(
    tableIdOrNullParam,
    ROW_ID_OR_NULL_PARAM,
  );
  const cellIdOrNullParams = getParameterList(
    rowIdOrNullParams,
    'cellId: ' + allCellIdsType,
  );

  // getTables, hasTables, setTables, delTables
  arrayForEach(
    [[tablesType], [BOOLEAN], [STORE, 'tables: ' + tablesWhenSetType], [STORE]],
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
    GET + TABLE_IDS,
    EMPTY_STRING,
    tableIdType + SQUARE_BRACKETS,
    getIdsDoc(TABLE, THE_STORE),
  );

  // forEachTable
  addMethod(
    METHOD_PREFIX_VERBS[5] + TABLE,
    'tableCallback: ' + tableCallbackType,
    VOID,
    getForEachDoc(TABLE, THE_STORE),
  );

  // getTable, hasTable, setTable, delTable
  arrayForEach(
    [
      [tableType, tableIdParam],
      [BOOLEAN, tableIdParam],
      [STORE, [tableIdParam, 'table: ' + tableWhenSetType]],
      [STORE, tableIdParam],
    ],
    ([returnType, params], verb) =>
      addMethod(
        METHOD_PREFIX_VERBS[verb] + TABLE,
        params ?? EMPTY_STRING,
        returnType as string,
        getContentDoc(verb, 3),
        tIdGeneric,
      ),
  );

  // getRowIds
  addMethod(
    GET + ROW_IDS,
    tableIdParam,
    IDS,
    getIdsDoc(ROW, A + TABLE),
    tIdGeneric,
  );

  // getSortedRowIds
  addMethod(
    GET + SORTED_ROW_IDS,
    [tableIdParam, 'cellId?: ' + cellIdType + SORTED_ARGS],
    IDS,
    getIdsDoc(ROW, A + TABLE),
    tIdGeneric,
  );

  // forEachRow
  addMethod(
    METHOD_PREFIX_VERBS[5] + ROW,
    [tableIdParam, 'rowCallback: ' + rowCallbackType],
    VOID,
    getForEachDoc(ROW, A + TABLE),
    tIdGeneric,
  );

  // getRow, hasRow, setRow, delRow
  arrayForEach(
    [
      [rowType, rowIdParams],
      [BOOLEAN, rowIdParams],
      [STORE, [rowIdParams, 'row: ' + rowWhenSetType]],
      [STORE, rowIdParams],
    ],
    ([returnType, params], verb) =>
      addMethod(
        METHOD_PREFIX_VERBS[verb] + ROW,
        params ?? EMPTY_STRING,
        returnType as string,
        getContentDoc(verb, 5),
        tIdGeneric,
      ),
  );

  // setPartialRow
  addMethod(
    'set' + PARTIAL + ROW,
    [tableIdParam, ROW_ID_PARAM, 'partialRow: ' + rowWhenSetType],
    STORE,
    getContentDoc(4, 5),
    tIdGeneric,
  );

  // addRow
  addMethod(
    ADD + ROW,
    [tableIdParam, 'row: ' + rowWhenSetType],
    ID + OR_UNDEFINED,
    'Add a new ' + ROW,
    tIdGeneric,
  );

  // getCellIds
  addMethod(
    GET + CELL_IDS,
    [tableIdParam, ROW_ID_PARAM],
    cellIdType + SQUARE_BRACKETS,
    getIdsDoc(CELL, A + ROW),
    tIdGeneric,
  );

  // forEachCell
  addMethod(
    METHOD_PREFIX_VERBS[5] + CELL,
    [tableIdParam, ROW_ID_PARAM, 'cellCallback: ' + cellCallbackType],
    VOID,
    getForEachDoc(CELL, A + ROW),
    tIdGeneric,
  );

  // getCell, hasCell, setCell, delCell
  arrayForEach(
    [
      [cellType, cellIdParams],
      [BOOLEAN, cellIdParams],
      [STORE, [cellIdParams, 'cell: ' + cellType]],
      [STORE, cellIdParams],
    ],
    ([returnType, params], verb) =>
      addMethod(
        METHOD_PREFIX_VERBS[verb] + CELL,
        params ?? EMPTY_STRING,
        returnType as string,
        getContentDoc(verb, 7),
        cIdGeneric,
      ),
  );

  // addTablesListener
  addMethod(
    ADD + TABLES + LISTENER,
    [LISTENER_ + ': ' + tablesListenerType, 'mutator?: boolean'],
    ID,
    getTheContentOfTheStoreDoc(1, 8) + ' changes',
  );

  // addTableIdsListener
  addMethod(
    ADD + TABLE_IDS + LISTENER,
    [LISTENER_ + ': ' + tableIdsListenerType, 'mutator?: boolean'],
    ID,
    getListenerDoc(2, 0, 1),
  );

  // addTableListener
  addMethod(
    ADD + TABLE + LISTENER,
    [
      tableIdOrNullParam,
      LISTENER_ + ': ' + tableListenerType,
      'mutator?: boolean',
    ],
    ID,
    getListenerDoc(3, 0),
    tIdGeneric,
  );

  // addRowIdsListener
  addMethod(
    ADD + ROW_IDS + LISTENER,
    [
      tableIdOrNullParam,
      LISTENER_ + ': ' + rowIdsListenerType,
      'mutator?: boolean',
    ],
    ID,
    getListenerDoc(4, 3, 1),
    tIdGeneric,
  );

  // addSortedRowIdsListener
  addMethod(
    ADD + SORTED_ROW_IDS + LISTENER,
    [
      tableIdParam,
      'cellId: ' + cellIdType + OR_UNDEFINED,
      'descending: boolean',
      'offset: number',
      'limit: number' + OR_UNDEFINED,
      LISTENER_ + ': ' + sortedRowIdsListenerType,
      'mutator?: boolean',
    ],
    ID,
    getListenerDoc(13, 3, 1),
    tIdGeneric,
  );

  // addRowListener
  addMethod(
    ADD + ROW + LISTENER,
    [
      rowIdOrNullParams,
      LISTENER_ + ': ' + rowListenerType,
      'mutator?: boolean',
    ],
    ID,
    getListenerDoc(5, 3),
    tIdGeneric,
  );

  // addCellIdsListener
  addMethod(
    ADD + CELL_IDS + LISTENER,
    [
      rowIdOrNullParams,
      LISTENER_ + ': ' + cellIdsListenerType,
      'mutator?: boolean',
    ],
    ID,
    getListenerDoc(6, 5, 1),
    tIdGeneric,
  );

  // addCellListener
  addMethod(
    ADD + CELL + LISTENER,
    [
      cellIdOrNullParams,
      LISTENER_ + ': ' + cellListenerType,
      'mutator?: boolean',
    ],
    ID,
    getListenerDoc(7, 5),
    tIdGeneric,
  );

  // addInvalidCellListener
  addMethod(
    ADD + INVALID + CELL + LISTENER,
    [
      'tableId: ' + ID_OR_NULL,
      'rowId: ' + ID_OR_NULL,
      'cellId: ' + ID_OR_NULL,
      LISTENER_ + ': ' + invalidCellListenerType,
      'mutator?: boolean',
    ],
    ID,
    REGISTERS_A_LISTENER + ' whenever an invalid Cell change was attempted',
  );

  // ---

  let valuesTypes: string[];

  if (objIsEmpty(valuesSchema)) {
    valuesTypes = [
      VALUES,
      VALUES,
      ID,
      VALUE,
      VALUE + CALLBACK,
      VALUES + LISTENER,
      VALUE_IDS + LISTENER,
      VALUE + LISTENER,
      INVALID + VALUE + LISTENER,
    ];
    addImport(0, 'tinybase', ...valuesTypes);
    arrayPush(valuesTypes, ID, ID_OR_NULL, EMPTY_STRING);
  } else {
    addImport(0, 'tinybase', 'ValueChange');
    valuesTypes = getValuesTypes('store', STORE);
    valuesTypes[3] += '<VId>';
    arrayPush(
      valuesTypes,
      'VId',
      'VId | null',
      `<VId extends ${valuesTypes[2]}>`,
    );
  }

  // Values, ValuesWhenSet, ValueId,
  // Value<>,
  // ValueCallback
  // ValueListener, ValueIdsListener, ValueListener, InvalidValueListener
  const [
    valuesType,
    valuesWhenSetType,
    valueIdType,
    valueType,
    valueCallbackType,
    valuesListenerType,
    valueIdsListenerType,
    valueListenerType,
    invalidValueListenerType,
    valueId,
    valueIdOrNull,
    vIdGeneric,
  ] = valuesTypes;

  const valueIdParam = 'valueId: ' + valueId;

  // getValues, hasValues, setValues, delValues
  arrayForEach(
    [[valuesType], [BOOLEAN], [STORE, 'values: ' + valuesWhenSetType], [STORE]],
    ([returnType, params], verb) =>
      addMethod(
        METHOD_PREFIX_VERBS[verb] + VALUES,
        params ?? EMPTY_STRING,
        returnType,
        getTheContentOfTheStoreDoc(2, verb),
      ),
  );

  // setPartialValues
  addMethod(
    'set' + PARTIAL + VALUES,
    'partialValues: ' + valuesWhenSetType,
    STORE,
    getTheContentOfTheStoreDoc(2, 4),
  );

  // getValueIds
  addMethod(
    GET + VALUE_IDS,
    EMPTY_STRING,
    valueIdType + SQUARE_BRACKETS,
    getIdsDoc(VALUE, THE_STORE),
  );

  // forEachValue
  addMethod(
    METHOD_PREFIX_VERBS[5] + VALUE,
    'valueCallback: ' + valueCallbackType,
    VOID,
    getForEachDoc(VALUE, THE_STORE),
  );

  // getValue, hasValue, setValue, delValue
  arrayForEach(
    [
      [valueType, valueIdParam],
      [BOOLEAN, valueIdParam],
      [STORE, [valueIdParam, 'value: ' + valueType]],
      [STORE, valueIdParam],
    ],
    ([returnType, params], verb) =>
      addMethod(
        METHOD_PREFIX_VERBS[verb] + VALUE,
        params ?? EMPTY_STRING,
        returnType as string,
        getContentDoc(verb, 11),
        vIdGeneric,
      ),
  );

  // addValuesListener
  addMethod(
    ADD + VALUES + LISTENER,
    [LISTENER_ + ': ' + valuesListenerType, 'mutator?: boolean'],
    ID,
    getTheContentOfTheStoreDoc(2, 8) + ' changes',
  );

  // addValueIdsListener
  addMethod(
    ADD + VALUE_IDS + LISTENER,
    [LISTENER_ + ': ' + valueIdsListenerType, 'mutator?: boolean'],
    ID,
    getListenerDoc(10, 0, 1),
  );

  // addValueListener
  addMethod(
    ADD + VALUE + LISTENER,
    [
      'valueId: ' + valueIdOrNull,
      LISTENER_ + ': ' + valueListenerType,
      'mutator?: boolean',
    ],
    ID,
    getListenerDoc(11, 0),
    vIdGeneric,
  );

  // addInvalidValueListener
  addMethod(
    ADD + INVALID + VALUE + LISTENER,
    [
      'valueId: ' + ID_OR_NULL,
      LISTENER_ + ': ' + invalidValueListenerType,
      'mutator?: boolean',
    ],
    ID,
    REGISTERS_A_LISTENER + ' whenever an invalid Value change was attempted',
  );

  // ---

  // getJson, setJson, getSchemaJson, delSchema
  // getTablesJson, setTablesJson, getTablesSchemaJson, setTablesSchema,
  //   delTablesSchema
  // getValuesJson, setValuesJson, getValuesSchemaJson, setValuesSchema,
  //   delValuesSchema
  arrayForEach(
    [
      [EMPTY_STRING, 'tablesAndValues'],
      [TABLES, 'tables'],
      [VALUES, 'values'],
    ],
    ([noun, param], content) => {
      addMethod(
        GET + noun + JSON,
        EMPTY_STRING,
        JSON,
        getTheContentOfTheStoreDoc(content as any, 6),
      );
      addMethod(
        'set' + noun + JSON,
        param + JSON + ': ' + JSON,
        STORE,
        getTheContentOfTheStoreDoc(content as any, 7),
      );
      addMethod(
        GET + noun + SCHEMA + JSON,
        EMPTY_STRING,
        JSON,
        getTheContentOfTheStoreDoc(content as any, 14),
      );
      if (noun) {
        addMethod(
          'set' + noun + SCHEMA,
          param + SCHEMA + ': ' + noun + SCHEMA,
          STORE,
          getTheContentOfTheStoreDoc(content as any, 15) +
            MAY_CONTRADICT_REFINEMENT,
        );
      }
      addMethod(
        'del' + noun + SCHEMA,
        EMPTY_STRING,
        STORE,
        getTheContentOfTheStoreDoc(content as any, 16),
      );
    },
  );

  // setSchema
  addMethod(
    'set' + SCHEMA,
    [
      `tables${SCHEMA}: ` + TABLES + SCHEMA,
      `values${SCHEMA}?: ` + VALUES + SCHEMA,
    ],
    STORE,
    getTheContentOfTheStoreDoc(0, 15) + MAY_CONTRADICT_REFINEMENT,
  );

  // transaction,
  addMethod(
    TRANSACTION_,
    DO_ACTIONS_AND_ROLLBACK_PARAMS,
    'Return',
    TRANSACTION_DOC,
    '<Return>',
  );

  // startTransaction,
  addMethod('start' + TRANSACTION, EMPTY_STRING, STORE, START_TRANSACTION_DOC);

  // finishTransaction
  addMethod(
    'finish' + TRANSACTION,
    DO_ROLLBACK_PARAM,
    STORE,
    FINISH_TRANSACTION_DOC,
  );

  // TransactionListener
  const transactionListenerType = getTransactionListenerType('store', STORE);

  // addWillFinishTransaction
  addMethod(
    ADD + 'WillFinish' + TRANSACTION + LISTENER,
    LISTENER_ + ': ' + transactionListenerType,
    ID,
    REGISTERS_A_LISTENER + ' just before ' + THE_END_OF_THE_TRANSACTION,
  );

  // addDidFinishTransaction
  addMethod(
    ADD + 'DidFinish' + TRANSACTION + LISTENER,
    LISTENER_ + ': ' + transactionListenerType,
    ID,
    REGISTERS_A_LISTENER + ' just after ' + THE_END_OF_THE_TRANSACTION,
  );

  // callListener
  addMethod(
    'call' + LISTENER,
    'listenerId: Id',
    STORE,
    'Manually provoke a listener to be called',
  );

  // delListener
  addMethod(
    'del' + LISTENER,
    'listenerId: Id',
    STORE,
    'Remove a listener that was previously added to ' + THE_STORE,
  );

  // getListenerStats
  addMethod(
    GET + LISTENER + 'Stats',
    EMPTY_STRING,
    'StoreListenerStats',
    'Get listener statistics',
  );

  return [
    build(
      `export * from 'tinybase';`,
      ...getImports(0),
      ...getTypes(),
      'export interface Store {',
      ...getMethods(),
      '}',
      EMPTY_STRING,
      comment(`Creates a Store object`),
      'export function createStore(): Store',
    ),
  ];
};
