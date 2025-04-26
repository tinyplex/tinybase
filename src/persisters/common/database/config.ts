import type {Id} from '../../../@types/common/index.d.ts';
import type {DatabasePersisterConfig} from '../../../@types/persisters/index.d.ts';
import {collHas} from '../../../common/coll.ts';
import {IdMap, mapNew, mapSet} from '../../../common/map.ts';
import {
  IdObj,
  objMap,
  objMerge,
  objSize,
  objValues,
} from '../../../common/obj.ts';
import {isString, isUndefined, slice} from '../../../common/other.ts';
import {setAdd, setNew} from '../../../common/set.ts';
import {TINYBASE} from '../../../common/strings.ts';
import {DEFAULT_ROW_ID_COLUMN_NAME} from './common.ts';

export type DefaultedJsonConfig = [
  storeTableName: string,
  storeIdColumnName: string,
  storeColumnName: string,
];
export type DefaultedTabularConfig = [
  tablesLoadConfig: IdMap<
    [
      tableId: Id,
      rowIdColumnName: string,
      whereCondition: string | null,
      whenCondition: string | null,
    ]
  >,
  tablesSaveConfig: IdMap<
    [
      tableName: string,
      rowIdColumnName: string,
      deleteEmptyColumns: boolean,
      deleteEmptyTable: boolean,
      whereCondition: string | null,
    ]
  >,
  valuesConfig: [load: boolean, save: boolean, tableName: string],
];

const COLUMN_NAME = 'ColumnName';
const STORE = 'store';

const JSON = 'json';
const STORE_TABLE_NAME = (STORE + 'TableName') as 'storeTableName';
const STORE_ID_COLUMN_NAME = (STORE +
  'Id' +
  COLUMN_NAME) as 'storeIdColumnName';
const STORE_COLUMN_NAME = (STORE + COLUMN_NAME) as 'storeColumnName';
const AUTO_LOAD_INTERVAL_SECONDS = 'autoLoadIntervalSeconds';
const ROW_ID_COLUMN_NAME = 'rowId' + COLUMN_NAME;
const TABLE_ID = 'tableId';
const TABLE_NAME = 'tableName';
const DELETE_EMPTY_COLUMNS = 'deleteEmptyColumns';
const DELETE_EMPTY_TABLE = 'deleteEmptyTable';
const WHERE_CONDITION = 'whereCondition';
const WHEN_CONDITION = 'whenCondition';
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
      : (configOrStoreTableName ?? {}),
  );

const getDefaultedTabularConfigMap = (
  configsObj: IdObj<any>,
  defaultObj: IdObj<any>,
  tableField: 'tableId' | 'tableName',
  exclude: (id: string, firstValue: string) => any,
  then: (id: string, firstValue: string) => void,
): IdMap<any[]> => {
  const configMap = mapNew<Id, any[]>();
  objMap(configsObj, (configObj, id) => {
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
    const storeTableName = config[STORE_TABLE_NAME] ?? TINYBASE;
    return [
      1,
      autoLoadIntervalSeconds,
      [
        storeTableName,
        config[STORE_ID_COLUMN_NAME] ?? DEFAULT_ROW_ID_COLUMN_NAME,
        config[STORE_COLUMN_NAME] ?? STORE,
      ],
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
  const excludedTableNames = setNew(valuesTable);

  const tabularConfig = [
    getDefaultedTabularConfigMap(
      load,
      {
        [TABLE_ID]: null,
        [ROW_ID_COLUMN_NAME]: DEFAULT_ROW_ID_COLUMN_NAME,
        [WHERE_CONDITION]: null,
        [WHEN_CONDITION]: null,
      },
      TABLE_ID,
      (tableName) => collHas(excludedTableNames, tableName),
      (tableName) => setAdd(managedTableNames, tableName),
    ),
    getDefaultedTabularConfigMap(
      save,
      {
        [TABLE_NAME]: null,
        [ROW_ID_COLUMN_NAME]: DEFAULT_ROW_ID_COLUMN_NAME,
        [DELETE_EMPTY_COLUMNS]: 0,
        [DELETE_EMPTY_TABLE]: 0,
        [WHERE_CONDITION]: load[WHERE_CONDITION] ?? null,
      },
      TABLE_NAME,
      (_, tableName) => collHas(excludedTableNames, tableName),
      (_, tableName) => setAdd(managedTableNames, tableName),
    ),
    valuesConfig,
  ] as any;

  return [0, autoLoadIntervalSeconds, tabularConfig, managedTableNames];
};
