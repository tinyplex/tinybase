import {
  IdMap2,
  mapEnsure,
  mapGet,
  mapKeys,
  mapMatch,
  mapNew,
  mapSet,
} from '../../common/map';
import {
  IdObj,
  IdObj2,
  objDel,
  objIds,
  objNew,
  objValues,
} from '../../common/obj';
import {Row, Values} from '../../types/store';
import {SINGLE_ROW_ID, escapeId} from './common';
import {
  arrayIsEmpty,
  arrayJoin,
  arrayLength,
  arrayMap,
} from '../../common/array';
import {isUndefined, promiseAll} from '../../common/other';
import {EMPTY_STRING} from '../../common/strings';
import {Id} from '../../types/common';
import {collHas} from '../../common/coll';
import {setNew} from '../../common/set';

export type Cmd = (sql: string, args?: any[]) => Promise<IdObj<any>[]>;

const FROM_PRAGMA_TABLE = 'FROM pragma_table_';
// eslint-disable-next-line max-len
const WHERE_MAIN_TABLE = `WHERE schema='main'AND type='table'AND name!='sqlite_schema'`;

export const getCommandFunctions = (
  cmd: Cmd,
): [
  refreshSchema: () => Promise<IdMap2<string>>,
  loadSingleRow: (
    tableName: string,
    rowIdColumnName: string,
  ) => Promise<IdObj<any>>,
  saveSingleRow: (
    table: string,
    rowIdColumnName: string,
    rowId: Id,
    row: Row | Values,
  ) => Promise<void>,
] => {
  const schemaMap: IdMap2<string> = mapNew();

  const refreshSchema = async (): Promise<IdMap2<string>> =>
    mapMatch(
      schemaMap,
      objNew(
        await promiseAll(
          arrayMap(
            await cmd(
              'SELECT name ' + FROM_PRAGMA_TABLE + 'list ' + WHERE_MAIN_TABLE,
            ),
            async ({name: tableName}) => [
              tableName,
              objNew(
                arrayMap(
                  await cmd(
                    'SELECT name, type ' + FROM_PRAGMA_TABLE + 'info(?)',
                    [tableName],
                  ),
                  ({name: columnName, type}) => [columnName, type],
                ),
              ),
            ],
          ),
        ),
      ) as IdObj2<string>,
      (_, tableName, tableSchema) =>
        mapSet(
          schemaMap,
          tableName,
          mapMatch(
            mapEnsure(schemaMap, tableName, mapNew<Id, string>),
            tableSchema,
            (tableSchemaMap, columnName, value) => {
              if (value != mapGet(tableSchemaMap, columnName)) {
                // console.log('add/change column', columnName);
                mapSet(tableSchemaMap, columnName, value);
              }
            },
            (tableSchema, columnName) => {
              // console.log('del column', columnName);
              mapSet(tableSchema, columnName);
            },
          ),
        ),
      (_, name) => {
        // console.log('del table', name);
        mapSet(schemaMap, name);
      },
    );

  const ensureTable = async (
    tableName: string,
    rowIdColumnName: string,
    row: Row,
  ): Promise<void> => {
    const cellIds = objIds(row);
    if (!collHas(schemaMap, tableName)) {
      await cmd(
        `CREATE TABLE${escapeId(tableName)}(${escapeId(rowIdColumnName)} ` +
          `PRIMARY KEY ON CONFLICT REPLACE${arrayJoin(
            arrayMap(cellIds, (cellId) => ', ' + escapeId(cellId)),
          )});`,
      );
      mapSet(
        schemaMap,
        tableName,
        mapNew([
          [rowIdColumnName, EMPTY_STRING],
          ...arrayMap(
            cellIds,
            (cellId) => [cellId, EMPTY_STRING] as [string, string],
          ),
        ]),
      );
    } else {
      const tableSchemaMap = mapGet(schemaMap, tableName);
      const columns = setNew(mapKeys(tableSchemaMap));
      await promiseAll(
        arrayMap(cellIds, async (cellId) => {
          if (!collHas(columns, cellId) && cellId != rowIdColumnName) {
            await cmd(
              `ALTER TABLE${escapeId(tableName)}ADD${escapeId(cellId)}`,
            );
            mapSet(tableSchemaMap, cellId, EMPTY_STRING);
          }
        }),
      );
    }
  };

  const canSelect = (tableName: string, rowIdColumnName: string): boolean =>
    !isUndefined(mapGet(mapGet(schemaMap, tableName), rowIdColumnName));

  const loadSingleRow = async (
    tableName: string,
    rowIdColumnName: string,
  ): Promise<IdObj<any>> => {
    const rows = canSelect(tableName, rowIdColumnName)
      ? await cmd(
          `SELECT*FROM${escapeId(tableName)}WHERE ${escapeId(
            rowIdColumnName,
          )}=?`,
          [SINGLE_ROW_ID],
        )
      : [];
    return arrayIsEmpty(rows) ? {} : objDel(rows[0], rowIdColumnName);
  };

  const saveSingleRow = async (
    tableName: string,
    rowIdColumnName: string,
    rowId: Id,
    row: Row | Values,
  ): Promise<void> => {
    await ensureTable(tableName, rowIdColumnName, row);
    const columns = arrayJoin(
      arrayMap(objIds(row), (cellId) => `,${escapeId(cellId)}`),
    );
    const values = objValues(row);
    await cmd(
      `INSERT INTO${escapeId(tableName)}(${escapeId(
        rowIdColumnName,
      )}${columns})VALUES(?${',?'.repeat(arrayLength(values))})`,
      [rowId, ...values],
    );
  };

  return [refreshSchema, loadSingleRow, saveSingleRow];
};
