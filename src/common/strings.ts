export const getTypeOf = (thing: unknown): string => typeof thing;

export const EMPTY_OBJECT = '{}';
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
