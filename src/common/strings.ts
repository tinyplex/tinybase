import type {Id} from '../@types/common/index.d.ts';

export const getTypeOf = (thing: unknown): string => typeof thing;

export const TINYBASE = 'tinybase';
export const EMPTY_STRING = '';
export const COMMA = ',';
export const DOT = '.';

export const STRING = getTypeOf(EMPTY_STRING);
export const BOOLEAN = getTypeOf(true);
export const NUMBER = getTypeOf(0);
export const FUNCTION = getTypeOf(getTypeOf);

export const TRUE = 'true';
export const TYPE = 'type';
export const DEFAULT = 'default';
export const ALLOW_NULL = 'allowNull';
export const NULL = 'null';

export const UTF8 = 'utf8';

export const SUM = 'sum';
export const AVG = 'avg';
export const MIN = 'min';
export const MAX = 'max';

export const LISTENER = 'Listener';
export const RESULT = 'Result';
export const GET = 'get';
export const SET = 'set';
export const ADD = 'add';
export const DEL = 'del';
export const HAS = 'Has';
export const _HAS = 'has';

export const IDS = 'Ids';
export const TABLE = 'Table';
export const TABLES = TABLE + 's';
export const TABLE_IDS = TABLE + IDS;
export const ROW = 'Row';
export const ROW_COUNT = ROW + 'Count';
export const ROW_IDS = ROW + IDS;
export const SORTED_ROW_IDS = 'Sorted' + ROW + IDS;
export const CELL = 'Cell';
export const CELL_IDS = CELL + IDS;
export const VALUE = 'Value';
export const VALUES = VALUE + 's';
export const VALUE_IDS = VALUE + IDS;
export const TRANSACTION = 'Transaction';

export const PARTIAL = 'Partial';
export const FINISH = 'Finish';
export const STATUS = 'Status';

export const METRIC = 'Metric';
export const INDEX = 'Index';
export const SLICE = 'Slice';
export const RELATIONSHIP = 'Relationship';
export const REMOTE_ROW_ID = 'Remote' + ROW + 'Id';
export const LOCAL = 'Local';
export const LINKED = 'Linked';
export const QUERY = 'Query';
export const CHECKPOINT = 'Checkpoint';

export const CURRENT_TARGET = 'currentTarget';
export const _VALUE = 'value';

export const OPEN = 'open';
export const MESSAGE = 'message';
export const ERROR = 'error';
export const EXTRA = 'extra';

export const T = 't';
export const V = 'v';

export const UNDEFINED = '\uFFFC';

export const id = (key: unknown): Id => EMPTY_STRING + key;

export const strRepeat = (str: string, count: number) => str.repeat(count);

export const strStartsWith = (str: string, prefix: string) =>
  str.startsWith(prefix);

export const strEndsWith = (str: string, suffix: string) =>
  str.endsWith(suffix);

export const strMatch = (str: string | undefined, regex: RegExp) =>
  str?.match(regex);

export const strSplit = (
  str: string,
  separator: string | RegExp = EMPTY_STRING,
  limit?: number,
): string[] => str.split(separator, limit);

export const strReplace = (
  str: string,
  searchValue: string | RegExp,
  replaceValue: string,
): string => str.replace(searchValue, replaceValue);
