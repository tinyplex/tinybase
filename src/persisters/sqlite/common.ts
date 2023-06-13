export const SINGLE_ROW_ID = '_';

export const escapeId = (str: string) => `"${str.replace(/"/g, '""')}"`;
