import type {DatabaseExecuteCommand} from '../../../@types/persisters/index.d.ts';
import {arrayJoin, arrayMap} from '../../../common/array.ts';
import {IdSet} from '../../../common/set.ts';
import {COMMA} from '../../../common/strings.ts';

export type QuerySchema = (
  executeCommand: DatabaseExecuteCommand,
  managedTableNames: string[],
) => Promise<{tn: string; cn: string}[]>;

export type Upsert = (
  executeCommand: DatabaseExecuteCommand,
  tableName: string,
  rowIdColumnName: string,
  changingColumnNames: string[],
  rows: {[id: string]: any[]},
  currentColumnNames?: IdSet,
) => Promise<void>;

export const SINGLE_ROW_ID = '_';
export const DEFAULT_ROW_ID_COLUMN_NAME = '_id';
export const SELECT = 'SELECT';
export const WHERE = 'WHERE';
export const TABLE = 'TABLE';
export const ALTER_TABLE = 'ALTER ' + TABLE;
export const DELETE_FROM = 'DELETE FROM';
export const SELECT_STAR_FROM = SELECT + '*FROM';
export const PRAGMA = 'pragma_';
export const DATA_VERSION = 'data_version';
export const SCHEMA_VERSION = 'schema_version';
export const FROM = 'FROM ';
export const PRAGMA_TABLE = 'pragma_table_';
export const TABLE_NAME_PLACEHOLDER = '$tableName';

export const getWrappedCommand = (
  executeCommand: DatabaseExecuteCommand,
  onSqlCommand: ((sql: string, params?: any[]) => void) | undefined,
): DatabaseExecuteCommand =>
  onSqlCommand
    ? async (sql, params) => {
        onSqlCommand(sql, params);
        return await executeCommand(sql, params);
      }
    : executeCommand;

export const escapeId = (str: string) => `"${str.replace(/"/g, '""')}"`;

export const escapeColumnNames = (...columnNames: string[]) =>
  arrayJoin(arrayMap(columnNames, escapeId), COMMA);

export const getPlaceholders = (array: any[], offset = [1]) =>
  arrayJoin(
    arrayMap(array, () => '$' + offset[0]++),
    COMMA,
  );

export const getWhereCondition = (tableName: string, condition?: string | null) =>
  condition
    ? ' ' + condition.replace(TABLE_NAME_PLACEHOLDER, escapeId(tableName))
    : ' true';
