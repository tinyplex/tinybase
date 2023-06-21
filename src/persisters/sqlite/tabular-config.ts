import {IdMap, mapNew, mapSet} from '../../common/map';
import {IdObj, objMap, objMerge, objSize, objValues} from '../../common/obj';
import {isString, isUndefined} from '../../common/other';
import {DEFAULT_ROW_ID_COLUMN_NAME} from './common';
import {DpcTabular} from '../../types/persisters';
import {Id} from '../../types/common';
import {TINYBASE} from '../../common/strings';
import {arraySlice} from '../../common/array';

type DefaultedConfig = [
  tablesLoadConfig: IdMap<[tableId: Id, rowIdColumnName: string]>,
  tablesSaveConfig: IdMap<
    [tableName: string, rowIdColumnName: string, deleteColumns: boolean]
  >,
  valuesConfig: [
    load: boolean,
    save: boolean,
    tableName: string,
    rowIdColumnName: string,
  ],
];

const ROW_ID_COLUMN_NAME = 'rowIdColumnName';
const TABLE_ID = 'tableId';
const TABLE_NAME = 'tableName';
const DELETE_COLUMNS = 'deleteColumns';

const DEFAULTED_VALUES_CONFIG = {
  load: false,
  save: false,
  [TABLE_NAME]: TINYBASE + '_values',
  [ROW_ID_COLUMN_NAME]: DEFAULT_ROW_ID_COLUMN_NAME,
};

const getDefaultedTableConfigMap = (
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

export const getDefaultedConfig = ({
  tables: {load = {}, save = {}} = {},
  values = {},
}: DpcTabular): DefaultedConfig => {
  const valuesConfig = arraySlice(
    objValues(objMerge(DEFAULTED_VALUES_CONFIG, values)),
    0,
    objSize(DEFAULTED_VALUES_CONFIG),
  );
  const valuesTable = valuesConfig[2] as string;
  return [
    getDefaultedTableConfigMap(
      load,
      {
        [TABLE_ID]: null,
        [ROW_ID_COLUMN_NAME]: DEFAULT_ROW_ID_COLUMN_NAME,
      },
      TABLE_ID,
      (tableName) => tableName == valuesTable,
    ),
    getDefaultedTableConfigMap(
      save,
      {
        [TABLE_NAME]: null,
        [ROW_ID_COLUMN_NAME]: DEFAULT_ROW_ID_COLUMN_NAME,
        [DELETE_COLUMNS]: false,
      },
      TABLE_NAME,
      (_, tableName) => tableName == valuesTable,
    ),
    valuesConfig,
  ] as any;
};
