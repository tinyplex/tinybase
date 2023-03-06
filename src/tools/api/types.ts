import {EMPTY_STRING, TABLE, TABLES, VALUES} from '../../common/strings';
import {
  ID,
  THE_STORE,
  WHEN_SET,
  getTheContentOfTheStoreDoc,
} from '../common/strings';
import {
  MapCellSchema,
  MapTablesSchema,
  MapValuesSchema,
} from '../common/schema';
import {getFieldTypeList, join} from '../common/code';
import {isUndefined} from '../../common/other';

export const getTypeFunctions = (
  addType: (name: string, body: string, doc: string) => string,
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

    return [tablesType, tablesWhenSetType, tableIdType];
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
