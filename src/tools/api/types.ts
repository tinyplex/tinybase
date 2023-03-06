import {Cell, Value} from '../../store.d';
import {EMPTY_STRING, TABLES, VALUES} from '../../common/strings';
import {WHEN_SET, getTheContentOfTheStoreDoc} from '../common/strings';
import {getFieldTypeList} from '../common/code';
import {isUndefined} from '../../common/other';

export const getTablesTypes = (
  addType: (name: string, body: string, doc: string) => string,
  mapTablesSchema: (
    callback: (tableId: string, tableName: string, TABLE_ID: string) => string,
  ) => string[],
  mapCellSchema: (
    tableId: string,
    callback: (
      cellId: string,
      type: 'string' | 'number' | 'boolean',
      defaultValue: Cell | undefined,
      CELL_ID: string,
      cellName: string,
    ) => string,
  ) => string[],
) => {
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

  return [tablesType, tablesWhenSetType];
};

export const getValuesType = (
  addType: (name: string, body: string, doc: string) => string,
  mapValuesSchema: (
    callback: (
      valueId: string,
      type: 'string' | 'number' | 'boolean',
      defaultValue: Value | undefined,
      VALUE_ID: string,
      valueName: string,
    ) => string,
  ) => string[],
) => {
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

  // ValuesWhenSet
  const valuesWhenSetType = addType(
    VALUES + WHEN_SET,
    getFieldTypeList(
      ...mapValuesSchema((valueId, type) => `'${valueId}'?: ${type}`),
    ),
    getTheContentOfTheStoreDoc(2, 5, 1),
  );

  return [valuesType, valuesWhenSetType];
};
