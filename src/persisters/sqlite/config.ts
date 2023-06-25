import {DatabasePersisterConfig, DpcTabular} from '../../types/persisters';
import {IdMap, mapNew, mapSet} from '../../common/map';
import {IdObj, objMap, objMerge, objSize, objValues} from '../../common/obj';
import {isString, isUndefined} from '../../common/other';
import {DEFAULT_ROW_ID_COLUMN_NAME} from './common';
import {Id} from '../../types/common';
import {TINYBASE} from '../../common/strings';
import {arraySlice} from '../../common/array';

type DefaultedTabularConfig = [
  tablesLoadConfig: IdMap<[tableId: Id, rowIdColumnName: string]>,
  tablesSaveConfig: IdMap<
    [
      tableName: string,
      rowIdColumnName: string,
      deleteEmptyColumns: boolean,
      deleteEmptyTable: boolean,
    ]
  >,
  valuesConfig: [load: boolean, save: boolean, tableName: string],
];

export const AUTO_LOAD_INTERVAL_SECONDS = 'autoLoadIntervalSeconds';
export const JSON = 'json';
const ROW_ID_COLUMN_NAME = 'rowIdColumnName';
const TABLE_ID = 'tableId';
const TABLE_NAME = 'tableName';
const DELETE_EMPTY_COLUMNS = 'deleteEmptyColumns';
const DELETE_EMPTY_TABLE = 'deleteEmptyTable';
const DEFAULT_CONFIG: DatabasePersisterConfig = {
  mode: JSON,
  [AUTO_LOAD_INTERVAL_SECONDS]: 1,
};
const DEFAULT_TABULAR_VALUES_CONFIG = {
  load: 0,
  save: 0,
  [TABLE_NAME]: TINYBASE + '_values',
};

const getDefaultedTabularConfigMap = (
  configsObj: IdObj<any>,
  defaultObj: IdObj<any>,
  tableField: 'tableId' | 'tableName',
  filter: (id: string, firstValue: string) => boolean,
): IdMap<any[]> => {
  const configMap = mapNew<Id, any[]>();
  objMap(configsObj, (configObj, id) => {
    const defaultedConfig = arraySlice(
      objValues(
        objMerge(
          defaultObj,
          isString(configObj) ? {[tableField]: configObj} : configObj,
        ),
      ),
      0,
      objSize(defaultObj),
    );
    if (
      !isUndefined(defaultedConfig[0]) &&
      !filter(id, defaultedConfig[0] as string)
    ) {
      mapSet(configMap, id, defaultedConfig);
    }
  });
  return configMap;
};

export const getDefaultedConfig = (
  configOrStoreTableName: DatabasePersisterConfig | string | undefined,
): DatabasePersisterConfig =>
  objMerge(
    DEFAULT_CONFIG,
    isString(configOrStoreTableName)
      ? {storeTableName: configOrStoreTableName}
      : configOrStoreTableName ?? {},
  );

export const getDefaultedTabularConfig = ({
  tables: {load = {}, save = {}} = {},
  values = {},
}: DpcTabular): DefaultedTabularConfig => {
  const valuesConfig = arraySlice(
    objValues(objMerge(DEFAULT_TABULAR_VALUES_CONFIG, values)),
    0,
    objSize(DEFAULT_TABULAR_VALUES_CONFIG),
  );
  const valuesTable = valuesConfig[2] as string;
  return [
    getDefaultedTabularConfigMap(
      load,
      {
        [TABLE_ID]: null,
        [ROW_ID_COLUMN_NAME]: DEFAULT_ROW_ID_COLUMN_NAME,
      },
      TABLE_ID,
      (tableName) => tableName == valuesTable,
    ),
    getDefaultedTabularConfigMap(
      save,
      {
        [TABLE_NAME]: null,
        [ROW_ID_COLUMN_NAME]: DEFAULT_ROW_ID_COLUMN_NAME,
        [DELETE_EMPTY_COLUMNS]: 0,
        [DELETE_EMPTY_TABLE]: 0,
      },
      TABLE_NAME,
      (_, tableName) => tableName == valuesTable,
    ),
    valuesConfig,
  ] as any;
};
