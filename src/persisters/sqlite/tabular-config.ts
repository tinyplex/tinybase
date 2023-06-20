import {IdMap, mapEnsure, mapGet, mapNew} from '../../common/map';
import {STAR, TINYBASE} from '../../common/strings';
import {
  isObject,
  objGet,
  objMap,
  objMerge,
  objSize,
  objValues,
} from '../../common/obj';
import {DpcTabular} from '../../types/persisters';
import {Id} from '../../types/common';
import {arraySlice} from '../../common/array';
import {isFunction} from '../../common/other';

type ConfigFunctions = [
  tablesLoad: boolean,
  getTablesLoadConfig: (tableName: string) => TablesLoadConfig,
  tablesSave: boolean,
  getTablesSaveConfig: (tableName: string) => TablesSaveConfig,
  values: ValuesConfig,
];

type TablesLoadConfig = [
  getTableId: (tableName: string) => Id | false,
  rowIdColumnName: string,
];

type TablesSaveConfig = [
  getTableName: (tableId: Id) => string | false,
  rowIdColumnName: string,
  deleteColumns: boolean,
];

type ValuesConfig = [
  load: boolean,
  save: boolean,
  tableName: string,
  rowIdColumnName: string,
];

export const DEFAULT_ROW_ID_COLUMN_NAME = '_id';

const ROW_ID_COLUMN_NAME = 'rowIdColumnName';
const TABLE_ID = 'tableId';
const TABLE_NAME = 'tableName';
const DELETE_COLUMNS = 'deleteColumns';

const DEFAULT_TABLE_MAPPING = (tableNameOrId: string) => tableNameOrId;
const DISABLED_TABLE_MAPPING = () => false;

const DEFAULT_VALUES_CONFIG = {
  load: true,
  save: false,
  [TABLE_NAME]: TINYBASE + '_values',
  [ROW_ID_COLUMN_NAME]: DEFAULT_ROW_ID_COLUMN_NAME,
};

const getTablesConfigs = <TablesLoadOrSaveConfig>(
  loadOrSave: any,
  tableMapFunctionName: string,
): [boolean, (tableName: string) => TablesLoadOrSaveConfig] => {
  const enabled = loadOrSave !== false;
  const loadOrSaveConfigs = isObject(loadOrSave)
    ? loadOrSave
    : {
        [STAR]: {
          [tableMapFunctionName]: enabled
            ? DEFAULT_TABLE_MAPPING
            : DISABLED_TABLE_MAPPING,
        },
      };

  const tablesConfigsMap = mapNew(
    objMap(loadOrSaveConfigs, (tablesLoadConfig, tableName) => {
      const [tableMap, rowIdColumnName, deleteColumns] = objValues(
        objMerge(
          {
            [tableMapFunctionName]: DEFAULT_TABLE_MAPPING,
            [ROW_ID_COLUMN_NAME]: DEFAULT_ROW_ID_COLUMN_NAME,
            [DELETE_COLUMNS]: false,
          },
          objGet(loadOrSaveConfigs, STAR) ?? {},
          isObject(tablesLoadConfig)
            ? (tablesLoadConfig as any)
            : {
                [tableMapFunctionName]: tablesLoadConfig
                  ? DEFAULT_TABLE_MAPPING
                  : DISABLED_TABLE_MAPPING,
              },
        ),
      );
      return [
        tableName,
        [
          isFunction(tableMap) ? tableMap : () => tableMap,
          rowIdColumnName,
          deleteColumns,
        ],
      ];
    }),
  ) as IdMap<TablesLoadOrSaveConfig>;

  return [
    enabled,
    (tableName: string) =>
      mapEnsure(
        tablesConfigsMap,
        tableName,
        () => mapGet(tablesConfigsMap, STAR) as TablesLoadOrSaveConfig,
      ),
  ];
};

export const getConfigFunctions = ({
  tables: {load = true, save = false} = {},
  values = {},
}: DpcTabular): ConfigFunctions => [
  ...getTablesConfigs<TablesLoadConfig>(load, TABLE_ID),
  ...getTablesConfigs<TablesSaveConfig>(save, TABLE_NAME),
  arraySlice(
    objValues(objMerge(DEFAULT_VALUES_CONFIG, values)),
    0,
    objSize(DEFAULT_VALUES_CONFIG),
  ) as ValuesConfig,
];
