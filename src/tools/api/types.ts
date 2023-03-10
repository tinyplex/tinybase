import {
  A,
  CALLBACK,
  ID,
  NON_NULLABLE,
  RETURNS_VOID,
  THE_STORE,
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

    const tableType = addType(
      TABLE,
      NON_NULLABLE + `<${tablesType}[TId]>`,
      'A ' + TABLE + ' Id in ' + THE_STORE,
      `<TId extends ${tableIdType}>`,
    );

    const tableWhenSetType = addType(
      TABLE + WHEN_SET,
      NON_NULLABLE + `<${tablesWhenSetType}[TId]>`,
      'A ' + TABLE + ' Id in ' + THE_STORE + WHEN_SETTING_IT,
      `<TId extends ${tableIdType}>`,
    );

    const rowType = addType(
      ROW,
      tableType + '<TId>[Id]',
      'A ' + ROW + ' in a ' + TABLE,
      `<TId extends ${tableIdType}>`,
    );

    const rowWhenSetType = addType(
      ROW + WHEN_SET,
      tableWhenSetType + '<TId>[Id]',
      'A ' + ROW + ' in a ' + TABLE + WHEN_SETTING_IT,
      `<TId extends ${tableIdType}>`,
    );

    const cellIdType = addType(
      CELL + ID,
      `keyof ${NON_NULLABLE}<${tablesType}[TId]>[Id]`,
      'A ' + CELL + ' Id in a ' + ROW,
      `<TId extends ${tableIdType}>`,
    );

    const cellType = addType(
      CELL,
      NON_NULLABLE + `<${tablesType}[TId]>[Id][CId]`,
      'A ' + CELL + ' in a ' + ROW,
      `<TId extends ${tableIdType}, CId extends ${cellIdType}<TId>>`,
    );

    const cellIdAndCellArrayType = addType(
      'CellIdAndCellArray',
      `CId extends ${cellIdType}<TId> ? ` +
        `[cellId: CId, cell: ${cellType}<TId, CId>] : never`,
      CELL + ' Ids and types in a ' + ROW,
      `<TId extends ${tableIdType}, CId = ${cellIdType}<TId>>`,
      0,
    );

    const cellCallbackType = addType(
      CELL + CALLBACK,
      `(...[cellId, cell]: ${cellIdAndCellArrayType}<TId>)` + RETURNS_VOID,
      getCallbackDoc(A + CELL + ' Id, and ' + CELL),
      `<TId extends ${tableIdType}>`,
    );

    const rowCallbackType = addType(
      ROW + CALLBACK,
      '(rowId: Id, forEachCell: (cellCallback: CellCallback<TId>) ' +
        RETURNS_VOID +
        ') ' +
        RETURNS_VOID,
      getCallbackDoc(A + ROW + ' Id, and a ' + CELL + ' iterator'),
      `<TId extends ${tableIdType}>`,
    );

    const tableIdAndForEachRowArrayType = addType(
      'TableIdAndForEachRowArray',
      `TId extends ${tableIdType} ? [tableId: TId, forEachRow: ` +
        `(rowCallback: ${rowCallbackType}<TId>)${RETURNS_VOID}]` +
        ' : never',
      TABLE + ' Ids and callback types',
      `<TId = ${tableIdType}>`,
      0,
    );

    const tableCallbackType = addType(
      TABLE + CALLBACK,
      `(...[tableId, forEachRow]: ${tableIdAndForEachRowArrayType})` +
        RETURNS_VOID,
      getCallbackDoc(A + TABLE + ' Id, and a ' + ROW + ' iterator'),
      EMPTY_STRING,
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
      cellCallbackType,
      rowCallbackType,
      tableCallbackType,
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

    return [valuesType, valuesWhenSetType];
  };

  return [getTablesTypes, getValuesTypes];
};
