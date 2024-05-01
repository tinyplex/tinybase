import {IdMap, mapNew, mapSet} from '../../common/map';
import {
  IdObj,
  objMerge,
  objSize,
  objToArray,
  objValues,
} from '../../common/obj';
import {isString, isUndefined, slice} from '../../common/other';
import {setAdd, setNew} from '../../common/set';
import {DEFAULT_ROW_ID_COLUMN_NAME} from './common';
import {DatabasePersisterConfig} from '../../types/persisters';
import {Id} from '../../types/common';
import {TINYBASE} from '../../common/strings';

export type DefaultedJsonConfig = [storeTableName: string];
export type DefaultedTabularConfig = [
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

const JSON = 'json';
const AUTO_LOAD_INTERVAL_SECONDS = 'autoLoadIntervalSeconds';
const STORE_TABLE_NAME = 'storeTableName';
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

const getDefaultedConfig = (
  configOrStoreTableName: DatabasePersisterConfig | string | undefined,
): DatabasePersisterConfig =>
  objMerge(
    DEFAULT_CONFIG,
    isString(configOrStoreTableName)
      ? {[STORE_TABLE_NAME]: configOrStoreTableName}
      : configOrStoreTableName ?? {},
  );

const getDefaultedTabularConfigMap = (
  configsObj: IdObj<any>,
  defaultObj: IdObj<any>,
  tableField: 'tableId' | 'tableName',
  exclude: (id: string, firstValue: string) => any,
  then: (id: string, firstValue: string) => void,
): IdMap<any[]> => {
  const configMap = mapNew<Id, any[]>();
  objToArray(configsObj, (configObj, id) => {
    const defaultedConfig = slice(
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
      !exclude(id, defaultedConfig[0] as string)
    ) {
      then(id, defaultedConfig[0] as string);
      mapSet(configMap, id, defaultedConfig);
    }
  });
  return configMap;
};

export const getConfigStructures = (
  configOrStoreTableName: DatabasePersisterConfig | string | undefined,
): [
  isJson: 0 | 1,
  autoLoadIntervalSeconds: number,
  defaultedConfig: DefaultedJsonConfig | DefaultedTabularConfig,
  managedTableNamesSet: Set<string>,
] => {
  const config = getDefaultedConfig(configOrStoreTableName);
  const autoLoadIntervalSeconds = config[AUTO_LOAD_INTERVAL_SECONDS] as number;
  if (config.mode == JSON) {
    const {storeTableName = TINYBASE} = config;
    return [
      1,
      autoLoadIntervalSeconds,
      [storeTableName],
      setNew(storeTableName),
    ];
  }

  const {tables: {load = {}, save = {}} = {}, values = {}} = config;

  const valuesConfig = slice(
    objValues(objMerge(DEFAULT_TABULAR_VALUES_CONFIG, values)),
    0,
    objSize(DEFAULT_TABULAR_VALUES_CONFIG),
  );
  const valuesTable = valuesConfig[2] as string;
  const managedTableNames = setNew(valuesTable);
  const tabularConfig = [
    getDefaultedTabularConfigMap(
      load,
      {[TABLE_ID]: null, [ROW_ID_COLUMN_NAME]: DEFAULT_ROW_ID_COLUMN_NAME},
      TABLE_ID,
      (tableName) => tableName == valuesTable,
      (tableName) => setAdd(managedTableNames, tableName),
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
      (_, tableName) => setAdd(managedTableNames, tableName),
    ),
    valuesConfig,
  ] as any;

  return [0, autoLoadIntervalSeconds, tabularConfig, managedTableNames];
};
