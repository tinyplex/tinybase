import {
  A,
  A_FUNCTION_FOR,
  CALLBACK,
  ID,
  NON_NULLABLE,
  RETURNS_VOID,
  THE_STORE,
  TRANSACTION_,
  WHEN_SET,
  WHEN_SETTING_IT,
  getCallbackDoc,
  getTheContentOfTheStoreDoc,
} from '../common/strings';
import {
  CELL,
  EMPTY_STRING,
  ROW,
  TABLE,
  TABLES,
  VALUE,
  VALUES,
} from '../../common/strings';
import {
  MapCellSchema,
  MapTablesSchema,
  MapValuesSchema,
} from '../common/schema';
import {getFieldTypeList} from '../common/code';
import {isUndefined} from '../../common/other';

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
) => {
  const getTablesTypes = () => {
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

    const tidGeneric = `<TId extends ${tableIdType}>`;

    const tableType = addType(
      TABLE,
      NON_NULLABLE + `<${tablesType}[TId]>`,
      'A ' + TABLE + ' in ' + THE_STORE,
      tidGeneric,
    );

    const tableWhenSetType = addType(
      TABLE + WHEN_SET,
      NON_NULLABLE + `<${tablesWhenSetType}[TId]>`,
      'A ' + TABLE + ' in ' + THE_STORE + WHEN_SETTING_IT,
      tidGeneric,
    );

    const rowType = addType(
      ROW,
      tableType + '<TId>[Id]',
      'A ' + ROW + ' in a ' + TABLE,
      tidGeneric,
    );

    const rowWhenSetType = addType(
      ROW + WHEN_SET,
      tableWhenSetType + '<TId>[Id]',
      'A ' + ROW + ' in a ' + TABLE + WHEN_SETTING_IT,
      tidGeneric,
    );

    const cellIdType = addType(
      CELL + ID,
      `Extract<keyof ${rowType}<TId>, Id>`,
      'A ' + CELL + ' Id in a ' + ROW,
      tidGeneric,
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
      tidGeneric,
    );

    const rowCallbackType = addType(
      ROW + CALLBACK,
      '(rowId: Id, forEachCell: (cellCallback: CellCallback<TId>) ' +
        RETURNS_VOID +
        ') ' +
        RETURNS_VOID,
      getCallbackDoc(A + ROW + ' Id, and a ' + CELL + ' iterator'),
      tidGeneric,
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
      tableCallbackType,
      getCellChangeType,
    ];
  };

  const getValuesTypes = () => {
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

    return [
      valuesType,
      valuesWhenSetType,
      valueIdType,
      valueType,
      valueCallbackType,
      getValueChangeType,
    ];
  };

  return [getTablesTypes, getValuesTypes];
};
