import {arrayJoin, arrayMap} from '../../../common/array.ts';
import {COMMA} from '../../../common/strings.ts';
import {IdObj} from '../../../common/obj.ts';

export type Cmd = (sql: string, args?: any[]) => Promise<IdObj<any>[]>;
export type QuerySchema = (
  cmd: Cmd,
  managedTableNames: string[],
) => Promise<{tn: string; cn: string}[]>;

export const SINGLE_ROW_ID = '_';
export const DEFAULT_ROW_ID_COLUMN_NAME = '_id';
export const SELECT = 'SELECT';
export const WHERE = 'WHERE';

export const escapeId = (str: string) => `"${str.replace(/"/g, '""')}"`;

export const getPlaceholders = (array: any[]) =>
  arrayJoin(
    arrayMap(array, (_, index) => '$' + (index + 1)),
    COMMA,
  );
