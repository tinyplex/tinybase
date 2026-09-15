import type {Ids} from '../../../@types/index.d.ts';
import type {
  DatabaseExecuteCommand,
  DpcTabularCondition,
} from '../../../@types/persisters/index.d.ts';
import {arrayJoin, arrayMap} from '../../../common/array.ts';
import {IdSet} from '../../../common/set.ts';
import {
  COMMA,
  DOT,
  strReplace,
  strSplit,
  TRUE,
} from '../../../common/strings.ts';

export type QuerySchema = (
  executeCommand: DatabaseExecuteCommand,
  managedTableNames: string[],
) => Promise<{tn: string; cn: string; uq?: number}[]>;

export type Upsert = (
  executeCommand: DatabaseExecuteCommand,
  tableName: string,
  rowIdColumnName: string,
  changingColumnNames: string[],
  rows: {[id: string]: any[]},
  getPlaceholder: GetPlaceholder,
  currentColumnNames?: IdSet,
) => Promise<void>;

export const SINGLE_ROW_ID = '_';
export const DEFAULT_ROW_ID_COLUMN_NAME = '_id';
export const SELECT = 'SELECT';
export const WHERE = 'WHERE';
export const TABLE = 'TABLE';
export const INSERT = 'INSERT';
export const DELETE = 'DELETE';
export const UPDATE = 'UPDATE';

export const ALTER_TABLE = 'ALTER ' + TABLE;
export const FROM = 'FROM';
export const DELETE_FROM = DELETE + ' ' + FROM;
export const SELECT_STAR_FROM = SELECT + '*' + FROM;
export const PRAGMA = 'pragma_';
export const DATA_VERSION = 'data_version';
export const SCHEMA_VERSION = 'schema_version';
export const PRAGMA_TABLE = 'pragma_table_';
export const CREATE = 'CREATE ';
export const CREATE_TABLE = CREATE + TABLE;
export const OR_REPLACE = 'OR REPLACE ';
export const FUNCTION = 'FUNCTION';
export const TABLE_NAME_PLACEHOLDER = '$tableName';
const TABLE_NAME_PLACEHOLDER_REGEX = /\$tableName/g;

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

export const escapeId = (str: string) =>
  arrayJoin(
    arrayMap(strSplit(str, DOT), (part) => `"${strReplace(part, /"/g, '""')}"`),
    DOT,
  );

export const escapeIds = (...ids: Ids) => escapeId(arrayJoin(ids, '_'));

export const escapeColumnNames = (...columnNames: string[]) =>
  arrayJoin(arrayMap(columnNames, escapeId), COMMA);

export type GetPlaceholder = (offset: number[]) => string;

// Where dialects disagree on syntax that is otherwise shared. Each part is
// optional and falls back to the SQLite and PostgreSQL spelling.
export type Dialect = [
  // SQL Server has no boolean literal, and needs '1=1' instead of 'true'.
  trueCondition?: string,
  // SQL Server cannot index its unbounded text type, so the row Id column
  // needs a narrower type than the other columns.
  rowIdColumnType?: string,
  // SQL Server spells this 'DROP COLUMN' rather than 'DROP'.
  dropColumn?: string,
];

// PostgreSQL needs numbered placeholders; SQLite drivers only agree on
// anonymous ones.
export const numberedPlaceholder: GetPlaceholder = (offset) =>
  '$' + offset[0]++;
export const anonymousPlaceholder: GetPlaceholder = () => '?';

export const getPlaceholders = (
  array: any[],
  getPlaceholder: GetPlaceholder,
  offset = [1],
) =>
  arrayJoin(
    arrayMap(array, () => getPlaceholder(offset)),
    COMMA,
  );

export const getWhereCondition = (
  tableName: string,
  condition: DpcTabularCondition = TRUE,
  trueCondition: string = TRUE,
) =>
  WHERE +
  `(${
    condition == TRUE
      ? trueCondition
      : replaceTableName(condition, escapeId(tableName))
  })`;

export const replaceTableName = (
  condition: DpcTabularCondition,
  tableName: string,
) => strReplace(condition, TABLE_NAME_PLACEHOLDER_REGEX, tableName);
