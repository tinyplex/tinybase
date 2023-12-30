export const SINGLE_ROW_ID = '_';
export const DEFAULT_ROW_ID_COLUMN_NAME = '_id';

export const escapeId = (str: string) => `"${str.replace(/"/g, '""')}"`;

export const SELECT = 'SELECT';
