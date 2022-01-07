export const getTypeOf = (thing: unknown): string => typeof thing;

export const EMPTY_OBJECT = '{}';
const EMPTY_STRING = '';

export const STRING = getTypeOf(EMPTY_STRING);
export const BOOLEAN = getTypeOf(true);
export const NUMBER = getTypeOf(0);
export const FUNCTION = getTypeOf(getTypeOf);

export const TYPE = 'type';
export const DEFAULT = 'default';
