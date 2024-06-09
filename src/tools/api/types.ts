import {
  A,
  A_FUNCTION_FOR,
  CALLBACK,
  ID,
  INVALID,
  NON_NULLABLE,
  OR_UNDEFINED,
  RETURNS_VOID,
  ROW_ID_PARAM,
  THE_STORE,
  TRANSACTION,
  TRANSACTION_,
  WHEN_SET,
  WHEN_SETTING_IT,
  getCallbackDoc,
  getListenerTypeDoc,
  getTheContentOfTheStoreDoc,
} from '../common/strings.ts';
import {
  CELL,
  CELL_IDS,
  EMPTY_STRING,
  HAS,
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
} from '../../common/strings.ts';
import {
  MapCellSchema,
  MapTablesSchema,
  MapValuesSchema,
} from '../common/schema.ts';
import {getFieldTypeList, getParameterList} from '../common/code.ts';
import {isUndefined} from '../../common/other.ts';

export const getTypeFunctions = (
  addType: (
    name: string,
    body: string,
    doc: string,
    generic?: string,
    exported?: 0 | 1,
  ) => string,
  mapTablesSchema: MapTablesSchema,
  mapCellSchema: MapCellSchema,
  mapValuesSchema: MapValuesSchema,
): [
  (storeInstance: string, storeType: string) => string[],
  (storeInstance: string, storeType: string) => string[],
  (storeInstance: string, storeType: string) => string,
] => {
  const getTablesTypes = (storeInstance: string, storeType: string) => {
    const storeParam = storeInstance + ': ' + storeType;

    const tablesType = addType(
      TABLES,
      getFieldTypeList(
        ...mapTablesSchema(
          (tableId) =>
            `'${tableId}'?: {[rowId: Id]: ` +
            getFieldTypeList(
              ...mapCellSchema(
                tableId,
                (cellId, type, defaultValue) =>
                  `'${cellId}'${
                    isUndefined(defaultValue) ? '?' : EMPTY_STRING
                  }: ${type}`,
              ),
            ) +
            '}',
        ),
      ),
      getTheContentOfTheStoreDoc(1, 5),
    );

    const tablesWhenSetType = addType(
      TABLES + WHEN_SET,
      getFieldTypeList(
        ...mapTablesSchema(
          (tableId) =>
            `'${tableId}'?: {[rowId: Id]: ` +
            getFieldTypeList(
              ...mapCellSchema(
                tableId,
                (cellId, type) => `'${cellId}'?: ${type}`,
              ),
            ) +
            '}',
        ),
      ),
      getTheContentOfTheStoreDoc(1, 5, 1),
    );

    const tableIdType = addType(
      TABLE + ID,
      'keyof ' + tablesType,
      'A ' + TABLE + ' Id in ' + THE_STORE,
    );

    const tIdGeneric = `<TId extends ${tableIdType}>`;

    const tableType = addType(
      TABLE,
      NON_NULLABLE + `<${tablesType}[TId]>`,
      'A ' + TABLE + ' in ' + THE_STORE,
      tIdGeneric,
    );

    const tableWhenSetType = addType(
      TABLE + WHEN_SET,
      NON_NULLABLE + `<${tablesWhenSetType}[TId]>`,
      'A ' + TABLE + ' in ' + THE_STORE + WHEN_SETTING_IT,
      tIdGeneric,
    );

    const rowType = addType(
      ROW,
      tableType + '<TId>[Id]',
      'A ' + ROW + ' in a ' + TABLE,
      tIdGeneric,
    );

    const rowWhenSetType = addType(
      ROW + WHEN_SET,
      tableWhenSetType + '<TId>[Id]',
      'A ' + ROW + ' in a ' + TABLE + WHEN_SETTING_IT,
      tIdGeneric,
    );

    const cellIdType = addType(
      CELL + ID,
      `Extract<keyof ${rowType}<TId>, Id>`,
      'A ' + CELL + ' Id in a ' + ROW,
      tIdGeneric,
    );

    const cellType = addType(
      CELL,
      NON_NULLABLE + `<${tablesType}[TId]>[Id][CId]`,
      'A ' + CELL + ' in a ' + ROW,
      `<TId extends ${tableIdType}, CId extends ${cellIdType}<TId>>`,
    );

    const cellIdCellArrayType = addType(
      'CellIdCellArray',
      `CId extends ${cellIdType}<TId> ? ` +
        `[cellId: CId, cell: ${cellType}<TId, CId>] : never`,
      CELL + ' Ids and types in a ' + ROW,
      `<TId extends ${tableIdType}, CId = ${cellIdType}<TId>>`,
      0,
    );

    const cellCallbackType = addType(
      CELL + CALLBACK,
      `(...[cellId, cell]: ${cellIdCellArrayType}<TId>)` + RETURNS_VOID,
      getCallbackDoc(A + CELL + ' Id, and ' + CELL),
      tIdGeneric,
    );

    const rowCallbackType = addType(
      ROW + CALLBACK,
      '(rowId: Id, forEachCell: (cellCallback: CellCallback<TId>) ' +
        RETURNS_VOID +
        ') ' +
        RETURNS_VOID,
      getCallbackDoc(A + ROW + ' Id, and a ' + CELL + ' iterator'),
      tIdGeneric,
    );

    const tableCellCallbackType = addType(
      TABLE + CELL + CALLBACK,
      `(cellId: ${cellIdType}<TId>, count: number) ` + RETURNS_VOID,
      getCallbackDoc(A + CELL + ' Id, and count of how many times it appears'),
      tIdGeneric,
    );

    const tableIdForEachRowArrayType = addType(
      'TableIdForEachRowArray',
      `TId extends ${tableIdType} ? [tableId: TId, forEachRow: ` +
        `(rowCallback: ${rowCallbackType}<TId>)${RETURNS_VOID}]` +
        ' : never',
      TABLE + ' Ids and callback types',
      `<TId = ${tableIdType}>`,
      0,
    );

    const tableCallbackType = addType(
      TABLE + CALLBACK,
      `(...[tableId, forEachRow]: ${tableIdForEachRowArrayType})` +
        RETURNS_VOID,
      getCallbackDoc(A + TABLE + ' Id, and a ' + ROW + ' iterator'),
      EMPTY_STRING,
    );

    const tableIdRowIdCellIdArrayType = addType(
      'TableIdRowIdCellIdArray',
      `TId extends ${tableIdType} ? ` +
        `[tableId: TId, rowId: Id, cellId: ${cellIdType}<TId>] : never`,
      'Ids for GetCellChange',
      `<TId = ${tableIdType}>`,
      0,
    );

    const getCellChangeType = addType(
      'GetCellChange',
      `(...[tableId, rowId, cellId]: ${tableIdRowIdCellIdArrayType})` +
        ' => CellChange',
      A_FUNCTION_FOR +
        ` returning information about any Cell's changes during a ` +
        TRANSACTION_,
    );

    const hasTablesListenerType = addType(
      HAS + TABLES + LISTENER,
      `(${storeParam}, hasTables: boolean)` + RETURNS_VOID,
      getListenerTypeDoc(1, 0, 1),
    );

    const tablesListenerType = addType(
      TABLES + LISTENER,
      `(${storeParam}, ` +
        `getCellChange: ${getCellChangeType}${OR_UNDEFINED})` +
        RETURNS_VOID,
      getListenerTypeDoc(1),
    );

    const tableIdsListenerType = addType(
      TABLE_IDS + LISTENER,
      `(${storeParam})` + RETURNS_VOID,
      getListenerTypeDoc(2),
    );

    const hasTableListenerType = addType(
      HAS + TABLE + LISTENER,
      `(${storeParam}, tableId: ${tableIdType}, hasTable: boolean)` +
        RETURNS_VOID,
      getListenerTypeDoc(3, 0, 1),
    );

    const tableListenerType = addType(
      TABLE + LISTENER,
      `(${storeParam}, tableId: ${tableIdType}, ` +
        `getCellChange: ${getCellChangeType}${OR_UNDEFINED})` +
        RETURNS_VOID,
      getListenerTypeDoc(3),
    );

    const tableCellIdsListenerType = addType(
      TABLE + CELL_IDS + LISTENER,
      `(${storeParam}, tableId: ${tableIdType})` + RETURNS_VOID,
      getListenerTypeDoc(14, 3),
    );

    const hasTableCellListenerArgsArrayInnerType = addType(
      'HasTableCellListenerArgsArrayInner',
      `CId extends ${cellIdType}<TId> ? ` +
        `[${storeParam}, tableId: TId, cellId: CId, ` +
        `hasTableCell: boolean] : never`,
      'Cell args for HasTableCellListener',
      `<TId extends ${tableIdType}, CId = ${cellIdType}<TId>>`,
      0,
    );

    const hasTableCellListenerArgsArrayOuterType = addType(
      'HasTableCellListenerArgsArrayOuter',
      `TId extends ${tableIdType} ? ` +
        hasTableCellListenerArgsArrayInnerType +
        '<TId> : never',
      'Table args for HasTableCellListener',
      `<TId = ${tableIdType}>`,
      0,
    );

    const hasTableCellListenerType = addType(
      HAS + TABLE + CELL + LISTENER,
      `(...[${storeInstance}, tableId, cellId, hasTableCell]: ` +
        hasTableCellListenerArgsArrayOuterType +
        ')' +
        RETURNS_VOID,
      getListenerTypeDoc(16, 3, 1),
    );

    const rowCountListenerType = addType(
      ROW + 'Count' + LISTENER,
      `(${storeParam}, tableId: ${tableIdType})` + RETURNS_VOID,
      getListenerTypeDoc(15, 3),
    );

    const rowIdsListenerType = addType(
      ROW_IDS + LISTENER,
      `(${storeParam}, tableId: ${tableIdType})` + RETURNS_VOID,
      getListenerTypeDoc(4, 3),
    );

    const sortedRowIdsListenerType = addType(
      SORTED_ROW_IDS + LISTENER,
      '(' +
        getParameterList(
          storeParam,
          'tableId: ' + tableIdType,
          'cellId: Id' + OR_UNDEFINED,
          'descending: boolean',
          'offset: number',
          'limit: number' + OR_UNDEFINED,
          'sortedRowIds: Ids',
        ) +
        ')' +
        RETURNS_VOID,
      getListenerTypeDoc(13, 3),
    );

    const hasRowListenerType = addType(
      HAS + ROW + LISTENER,
      '(' +
        getParameterList(
          `${storeParam}`,
          'tableId: ' + tableIdType,
          ROW_ID_PARAM,
          `hasRow: boolean`,
        ) +
        ')' +
        RETURNS_VOID,
      getListenerTypeDoc(5, 3, 1),
    );

    const rowListenerType = addType(
      ROW + LISTENER,
      '(' +
        getParameterList(
          `${storeParam}`,
          'tableId: ' + tableIdType,
          ROW_ID_PARAM,
          `getCellChange: ${getCellChangeType}${OR_UNDEFINED}`,
        ) +
        ')' +
        RETURNS_VOID,
      getListenerTypeDoc(5, 3),
    );

    const cellIdsListenerType = addType(
      CELL_IDS + LISTENER,
      '(' +
        getParameterList(
          `${storeParam}`,
          'tableId: ' + tableIdType,
          ROW_ID_PARAM,
        ) +
        ')' +
        RETURNS_VOID,
      getListenerTypeDoc(6, 5),
    );

    const hasCellListenerArgsArrayInnerType = addType(
      'HasCellListenerArgsArrayInner',
      `CId extends ${cellIdType}<TId> ? ` +
        `[${storeParam}, tableId: TId, ${ROW_ID_PARAM}, ` +
        `cellId: CId, ` +
        `hasCell: boolean] : never`,
      'Cell args for HasCellListener',
      `<TId extends ${tableIdType}, CId = ${cellIdType}<TId>>`,
      0,
    );

    const hasCellListenerArgsArrayOuterType = addType(
      'HasCellListenerArgsArrayOuter',
      `TId extends ${tableIdType} ? ` +
        hasCellListenerArgsArrayInnerType +
        '<TId> : never',
      'Table args for HasCellListener',
      `<TId = ${tableIdType}>`,
      0,
    );

    const hasCellListenerType = addType(
      HAS + CELL + LISTENER,
      `(...[${storeInstance}, tableId, rowId, cellId, hasCell]: ` +
        hasCellListenerArgsArrayOuterType +
        ')' +
        RETURNS_VOID,
      getListenerTypeDoc(7, 5, 1),
    );

    const cellListenerArgsArrayInnerType = addType(
      'CellListenerArgsArrayInner',
      `CId extends ${cellIdType}<TId> ? ` +
        `[${storeParam}, tableId: TId, ${ROW_ID_PARAM}, ` +
        `cellId: CId, ` +
        `newCell: ${cellType}<TId, CId> ${OR_UNDEFINED}, ` +
        `oldCell: ${cellType}<TId, CId> ${OR_UNDEFINED}, ` +
        `getCellChange: ${getCellChangeType} ${OR_UNDEFINED}] : never`,
      'Cell args for CellListener',
      `<TId extends ${tableIdType}, CId = ${cellIdType}<TId>>`,
      0,
    );

    const cellListenerArgsArrayOuterType = addType(
      'CellListenerArgsArrayOuter',
      `TId extends ${tableIdType} ? ` +
        cellListenerArgsArrayInnerType +
        '<TId> : never',
      'Table args for CellListener',
      `<TId = ${tableIdType}>`,
      0,
    );

    const cellListenerType = addType(
      CELL + LISTENER,
      `(...[${storeInstance}, tableId, rowId, cellId, newCell, oldCell, ` +
        `getCellChange]: ${cellListenerArgsArrayOuterType})` +
        RETURNS_VOID,
      getListenerTypeDoc(7, 5),
    );

    const invalidCellListenerType = addType(
      INVALID + CELL + LISTENER,
      `(${storeParam}, tableId: Id, ${ROW_ID_PARAM}, ` +
        'cellId: Id, invalidCells: any[])' +
        RETURNS_VOID,
      getListenerTypeDoc(8),
    );

    return [
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
      tableCellCallbackType,
      tableCallbackType,
      hasTablesListenerType,
      tablesListenerType,
      tableIdsListenerType,
      hasTableListenerType,
      tableListenerType,
      tableCellIdsListenerType,
      hasTableCellListenerType,
      rowCountListenerType,
      rowIdsListenerType,
      sortedRowIdsListenerType,
      hasRowListenerType,
      rowListenerType,
      cellIdsListenerType,
      hasCellListenerType,
      cellListenerType,
      invalidCellListenerType,
    ];
  };

  const getValuesTypes = (storeInstance: string, storeType: string) => {
    const storeParam = storeInstance + ': ' + storeType;

    const valuesType = addType(
      VALUES,
      getFieldTypeList(
        ...mapValuesSchema(
          (valueId, type, defaultValue) =>
            `'${valueId}'${
              isUndefined(defaultValue) ? '?' : EMPTY_STRING
            }: ${type}`,
        ),
      ),
      getTheContentOfTheStoreDoc(2, 5),
    );

    const valuesWhenSetType = addType(
      VALUES + WHEN_SET,
      getFieldTypeList(
        ...mapValuesSchema((valueId, type) => `'${valueId}'?: ${type}`),
      ),
      getTheContentOfTheStoreDoc(2, 5, 1),
    );

    const valueIdType = addType(
      VALUE + ID,
      'keyof ' + valuesType,
      'A ' + VALUE + ' Id in ' + THE_STORE,
    );

    const valueType = addType(
      VALUE,
      NON_NULLABLE + `<${valuesType}[VId]>`,
      'A ' + VALUE + ' Id in ' + THE_STORE,
      `<VId extends ${valueIdType}>`,
    );

    const valueIdValueArrayType = addType(
      'ValueIdValueArray',
      `VId extends ${valueIdType} ? ` +
        `[valueId: VId, value: ${valueType}<VId>] : never`,
      VALUE + ' Ids and types in ' + THE_STORE,
      `<VId = ${valueIdType}>`,
      0,
    );

    const valueCallbackType = addType(
      VALUE + CALLBACK,
      `(...[valueId, value]: ${valueIdValueArrayType})` + RETURNS_VOID,
      getCallbackDoc(A + VALUE + ' Id, and ' + VALUE),
    );

    const getValueChangeType = addType(
      'GetValueChange',
      `(valueId: ${valueIdType}) => ValueChange`,
      A_FUNCTION_FOR +
        ` returning information about any Value's changes during a ` +
        TRANSACTION_,
    );

    const hasValuesListenerType = addType(
      HAS + VALUES + LISTENER,
      `(${storeParam}, ` + `hasValues: boolean)` + RETURNS_VOID,
      getListenerTypeDoc(9, 0, 1),
    );

    const valuesListenerType = addType(
      VALUES + LISTENER,
      `(${storeParam}, ` +
        `getValueChange: ${getValueChangeType}${OR_UNDEFINED})` +
        RETURNS_VOID,
      getListenerTypeDoc(9),
    );

    const valueIdsListenerType = addType(
      VALUE_IDS + LISTENER,
      `(${storeParam})` + RETURNS_VOID,
      getListenerTypeDoc(10),
    );

    const hasValueListenerType = addType(
      HAS + VALUE + LISTENER,
      `(${storeParam}, valueId: ValueId, hasValue: boolean)` + RETURNS_VOID,
      getListenerTypeDoc(11, 0, 1),
    );

    const valueListenerArgsArrayType = addType(
      'ValueListenerArgsArray',
      `VId extends ${valueIdType} ? ` +
        `[${storeParam}, valueId: VId, ` +
        `newValue: ${valueType}<VId> ${OR_UNDEFINED}, ` +
        `oldValue: ${valueType}<VId> ${OR_UNDEFINED}, ` +
        `getValueChange: ${getValueChangeType} ${OR_UNDEFINED}] : never`,
      'Value args for ValueListener',
      `<VId = ${valueIdType}>`,
      0,
    );

    const valueListenerType = addType(
      VALUE + LISTENER,
      `(...[${storeInstance}, valueId, newValue, oldValue, getValueChange]: ` +
        valueListenerArgsArrayType +
        ')' +
        RETURNS_VOID,
      getListenerTypeDoc(11),
    );

    const invalidValueListenerType = addType(
      INVALID + VALUE + LISTENER,
      `(${storeParam}, valueId: Id, ` + `invalidValues: any[])` + RETURNS_VOID,
      getListenerTypeDoc(12),
    );

    return [
      valuesType,
      valuesWhenSetType,
      valueIdType,
      valueType,
      valueCallbackType,
      hasValuesListenerType,
      valuesListenerType,
      valueIdsListenerType,
      hasValueListenerType,
      valueListenerType,
      invalidValueListenerType,
    ];
  };

  const getTransactionListenerType = (
    storeInstance: string,
    storeType: string,
  ) =>
    addType(
      TRANSACTION + LISTENER,
      `(${storeInstance}: ${storeType})` + RETURNS_VOID,
      A_FUNCTION_FOR + ' listening to the completion of a ' + TRANSACTION_,
    );

  return [getTablesTypes, getValuesTypes, getTransactionListenerType];
};
