import {Id} from '../common.d';

export const getTypeOf = (thing: unknown): string => typeof thing;

export const EMPTY_STRING = '';

export const STRING = getTypeOf(EMPTY_STRING);
export const BOOLEAN = getTypeOf(true);
export const NUMBER = getTypeOf(0);
export const FUNCTION = getTypeOf(getTypeOf);

export const TYPE = 'type';
export const DEFAULT = 'default';

export const UTF8 = 'utf8';

export const SUM = 'sum';
export const AVG = 'avg';
export const MIN = 'min';
export const MAX = 'max';

export const LISTENER = 'Listener';
export const RESULT = 'Result';
export const GET = 'get';
export const ADD = 'add';

export const IDS = 'Ids';
export const TABLE = 'Table';
export const TABLES = TABLE + 's';
export const TABLE_IDS = TABLE + IDS;
export const ROW = 'Row';
export const ROW_IDS = ROW + IDS;
export const SORTED_ROW_IDS = 'Sorted' + ROW + IDS;
export const CELL = 'Cell';
export const CELL_IDS = CELL + IDS;
export const VALUE = 'Value';
export const VALUES = VALUE + 's';
export const VALUE_IDS = VALUE + IDS;

export const id = (key: unknown): Id => EMPTY_STRING + key;
